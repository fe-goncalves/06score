import { enrichAthleteRosterEntries } from "@/lib/athlete/enrichRoster";
import { buildStaffCareerSummary } from "@/lib/athlete/careerSummary";
import { fetchStaffEditionStats } from "@/lib/athlete/fetchStaffEditionStats";
import { getSupabase, getSupabaseServiceRole } from "@/lib/supabase";
import type {
  AthleteAwardEntry,
  AthleteEditionStatRow,
  AthleteRecentMatch,
  AthleteRosterEntry,
  AthleteStatsPhaseRecord,
  AthleteTeamStint,
  Match,
  StaffCareerStats,
  StaffProfileData,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

const MATCH_IN_CHUNK = 80;

function chunkIds(ids: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

const MATCH_FOR_STAFF_SELECT = `
  ${MATCH_SELECT_BASE}
`;

const STAFF_MEMBER_PROFILE_SELECT = `
  id,
  full_name,
  surname,
  photo_url,
  nationality,
  birth_date,
  staff_roles ( full_name )
`;

const STAFF_MEMBER_PROFILE_SELECT_MIN = `
  id,
  full_name,
  surname,
  photo_url,
  staff_roles ( full_name )
`;

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function staffRoleLabel(raw: Record<string, unknown>): string | null {
  const roleRow = unwrapRelation(
    raw.staff_roles as { full_name?: string } | { full_name?: string }[] | null,
  );
  const name = roleRow?.full_name?.trim();
  return name || null;
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeStaffCareerStats(
  raw: Record<string, unknown> | null,
): StaffCareerStats | null {
  if (!raw) return null;
  return {
    total_matches: num(raw.total_matches),
    total_wins: num(raw.total_wins ?? raw.total_goals),
    total_draws: num(raw.total_draws ?? raw.total_assists),
    total_losses: num(raw.total_losses ?? raw.total_motm),
    total_yellow_cards: num(raw.total_yellow_cards),
    total_red_cards: num(raw.total_red_cards),
    avg_rating:
      raw.avg_rating == null
        ? null
        : Number.isFinite(Number(raw.avg_rating))
          ? Math.round(Number(raw.avg_rating) * 100) / 100
          : null,
    total_ratings_count: num(raw.total_ratings_count),
  };
}

export async function getStaffProfile(
  staffId: string,
  orgId: string,
): Promise<StaffProfileData | null> {
  const supabase = getSupabaseServiceRole() ?? getSupabase();

  let staffRow: Record<string, unknown> | null = null;
  const primary = await supabase
    .from("staff_members")
    .select(STAFF_MEMBER_PROFILE_SELECT)
    .eq("id", staffId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (primary.error) {
    console.error("[getStaffProfile]", primary.error.message);
    const fallback = await supabase
      .from("staff_members")
      .select(STAFF_MEMBER_PROFILE_SELECT_MIN)
      .eq("id", staffId)
      .eq("organization_id", orgId)
      .maybeSingle();
    if (fallback.error) {
      console.error("[getStaffProfile:fallback]", fallback.error.message);
      return null;
    }
    staffRow = (fallback.data as Record<string, unknown> | null) ?? null;
  } else {
    staffRow = (primary.data as Record<string, unknown> | null) ?? null;
  }

  if (!staffRow) return null;

  const [
    careerResult,
    stintsResult,
    lineupsResult,
    rosterEntriesResult,
    awardsResult,
    editionStats,
  ] = await Promise.all([
    supabase
      .from("staff_career_stats")
      .select(
        "total_matches, total_wins, total_draws, total_losses, total_yellow_cards, total_red_cards, avg_rating, total_ratings_count",
      )
      .eq("staff_member_id", staffId)
      .eq("organization_id", orgId)
      .maybeSingle(),
    supabase
      .from("staff_team_stints")
      .select(
        "id, team_id, started_at, ended_at, is_current, is_active, teams(id, full_name, short_name, logo_url, abbreviation, primary_color)",
      )
      .eq("staff_member_id", staffId)
      .order("started_at", { ascending: false }),
    supabase
      .from("match_staff_lineups")
      .select("match_id, edition_team_id")
      .eq("staff_member_id", staffId)
      .eq("is_present", true)
      .order("match_id", { ascending: false }),
    supabase
      .from("edition_roster_entries")
      .select("id, edition_team_id, status, member_type")
      .eq("staff_member_id", staffId)
      .order("id", { ascending: false }),
    supabase
      .from("edition_awards")
      .select(
        `
        id,
        award_type,
        winning_team_id,
        edition_id,
        competition_editions (
          competitions ( id, full_name, short_name, logo_url ),
          seasons ( name )
        ),
        teams!edition_awards_winning_team_id_fkey (
          full_name, abbreviation, logo_url
        )
      `,
      )
      .eq("staff_member_id", staffId)
      .order("edition_id"),
    fetchStaffEditionStats(staffId),
  ]);

  if (careerResult.error) {
    console.error("[getStaffProfile:career]", careerResult.error.message);
  }
  if (stintsResult.error) {
    console.error("[getStaffProfile:stints]", stintsResult.error.message);
  }
  if (lineupsResult.error) {
    console.error("[getStaffProfile:lineups]", lineupsResult.error.message);
  }
  if (rosterEntriesResult.error) {
    console.error("[getStaffProfile:rosterEntries]", rosterEntriesResult.error.message);
  }
  if (awardsResult.error) {
    console.error("[getStaffProfile:awards]", awardsResult.error.message);
  }

  const lineupRows = (lineupsResult.data ?? []) as {
    match_id: string;
    edition_team_id: string | null;
  }[];
  const matchIds = [...new Set(lineupRows.map((l) => l.match_id))];
  const presenceTeamMap = new Map<string, string | null>();
  for (const row of lineupRows) {
    presenceTeamMap.set(row.match_id, row.edition_team_id ?? null);
  }

  let recentMatches: AthleteRecentMatch[] = [];

  if (matchIds.length) {
    const matchChunks = chunkIds(matchIds, MATCH_IN_CHUNK);
    const matches: Match[] = [];

    for (const chunk of matchChunks) {
      const { data, error: matchesError } = await supabase
        .from("matches")
        .select(MATCH_FOR_STAFF_SELECT)
        .in("id", chunk);

      if (matchesError) {
        console.error("[getStaffProfile:matches]", matchesError.message);
      } else {
        matches.push(...((data as Match[] | null) ?? []));
      }
    }

    matches.sort((a, b) => b.match_date.localeCompare(a.match_date));

    const editionTeamIds = [
      ...new Set(
        lineupRows.map((l) => l.edition_team_id).filter((v): v is string => !!v),
      ),
    ];
    const { data: editionTeamsData } = editionTeamIds.length
      ? await supabase
          .from("edition_teams")
          .select("id, team_id, edition_id")
          .in("id", editionTeamIds)
      : { data: [] as { id: string; team_id: string; edition_id: string }[] };
    const editionTeamToTeamId = new Map(
      (editionTeamsData ?? []).map((row) => [row.id as string, row.team_id as string]),
    );
    const editionTeamToEditionId = new Map(
      (editionTeamsData ?? []).map((row) => [row.id as string, row.edition_id as string]),
    );

    recentMatches = matches.map((match) => {
      const editionTeamId = presenceTeamMap.get(match.id) ?? null;
      const athleteTeamId = editionTeamId
        ? (editionTeamToTeamId.get(editionTeamId) ?? null)
        : null;
      const editionIdFromLineup = editionTeamId
        ? (editionTeamToEditionId.get(editionTeamId) ?? null)
        : null;
      const resolvedEditionId =
        match.phases?.competition_editions?.id ?? editionIdFromLineup ?? null;
      const phases =
        match.phases && resolvedEditionId
          ? {
              ...match.phases,
              edition_id: match.phases.edition_id ?? resolvedEditionId,
              competition_editions: {
                id: resolvedEditionId,
                competitions:
                  match.phases.competition_editions?.competitions ?? null,
              },
            }
          : match.phases;

      return {
        match: {
          ...match,
          athlete_team_id: athleteTeamId,
          phases,
        } as Match,
        rating: null,
        isMotm: false,
        actions: [],
      };
    });

    const teamIdByEdition = new Map<string, string>();
    for (const entry of recentMatches) {
      const editionId = entry.match.phases?.competition_editions?.id;
      const teamId = entry.match.athlete_team_id;
      if (editionId && teamId) teamIdByEdition.set(editionId, teamId);
    }

    recentMatches = recentMatches.map((entry) => {
      const editionId = entry.match.phases?.competition_editions?.id;
      const teamId =
        entry.match.athlete_team_id ??
        (editionId ? (teamIdByEdition.get(editionId) ?? null) : null);
      if (teamId === entry.match.athlete_team_id) return entry;
      return {
        ...entry,
        match: { ...entry.match, athlete_team_id: teamId } as Match,
      };
    });
  }

  const rosterEntries = await enrichAthleteRosterEntries(
    (rosterEntriesResult.data ?? []) as {
      id: string;
      edition_team_id?: string | null;
      status: string | null;
    }[],
  );

  const COLLECTIVE_AWARD_TYPES = new Set([
    "champion",
    "runner_up",
    "third_place",
    "fourth_place",
    "fifth_place",
    "sixth_place",
    "seventh_place",
    "eighth_place",
    "ninth_place",
    "tenth_place",
    "relegated",
  ]);
  const allAwards = (awardsResult.data as AthleteAwardEntry[] | null) ?? [];
  const teamAwards = allAwards.filter((row) =>
    COLLECTIVE_AWARD_TYPES.has(row.award_type),
  );
  const awards = allAwards.filter(
    (row) => !COLLECTIVE_AWARD_TYPES.has(row.award_type),
  );

  let careerStats = normalizeStaffCareerStats(
    (careerResult.data as Record<string, unknown> | null) ?? null,
  );
  if (careerResult.error) {
    const legacy = await supabase
      .from("staff_career_stats")
      .select(
        "total_matches, total_goals, total_assists, total_motm, total_yellow_cards, total_red_cards, avg_rating, total_ratings_count",
      )
      .eq("staff_member_id", staffId)
      .eq("organization_id", orgId)
      .maybeSingle();
    if (legacy.error) {
      console.error("[getStaffProfile:career:legacy]", legacy.error.message);
    } else {
      careerStats = normalizeStaffCareerStats(
        (legacy.data as Record<string, unknown> | null) ?? null,
      );
    }
  }

  const careerSummary = buildStaffCareerSummary({
    editionStats,
    careerStats,
    recentMatches,
    teamAwards,
  });

  const editionIdsForPhases = [
    ...new Set(editionStats.map((row) => row.edition_id).filter(Boolean)),
  ];
  const editionToCompetition = new Map(
    editionStats.map((row) => [
      row.edition_id,
      row.competition_editions?.competition_id ??
        row.competition_editions?.competitions?.id ??
        null,
    ]),
  );

  let statsPhases: AthleteStatsPhaseRecord[] = [];
  if (editionIdsForPhases.length) {
    const { data: allPhasesRaw, error: phasesError } = await supabase
      .from("phases")
      .select(
        "id, full_name, custom_label, phase_type, display_order, edition_id, template_id",
      )
      .in("edition_id", editionIdsForPhases)
      .order("display_order", { ascending: true });

    if (phasesError) {
      console.error("[getStaffProfile:statsPhases]", phasesError.message);
    } else {
      statsPhases = (allPhasesRaw ?? []).map((phase) => ({
        id: phase.id as string,
        edition_id: phase.edition_id as string,
        full_name: String(phase.full_name ?? ""),
        custom_label: (phase.custom_label as string | null) ?? null,
        display_order: Number(phase.display_order) || 0,
        template_id: (phase.template_id as string | null) ?? null,
        competition_id:
          editionToCompetition.get(phase.edition_id as string) ?? null,
      }));
    }
  }

  return {
    staff: {
      id: staffRow.id as string,
      full_name: staffRow.full_name as string,
      surname: (staffRow.surname as string | null) ?? null,
      photo_url: (staffRow.photo_url as string | null) ?? null,
      nationality: (staffRow.nationality as string | null) ?? null,
      birth_date: (staffRow.birth_date as string | null) ?? null,
      role: staffRoleLabel(staffRow),
    },
    careerStats,
    careerSummary,
    stints: (stintsResult.data as AthleteTeamStint[] | null) ?? [],
    recentMatches,
    rosterEntries: rosterEntries as AthleteRosterEntry[],
    editionStats: editionStats as AthleteEditionStatRow[],
    phases: [],
    statsPhases,
    awards,
    teamAwards,
  };
}
