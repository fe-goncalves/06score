import { enrichAthleteRosterEntries } from "@/lib/athlete/enrichRoster";
import { buildAthleteCareerSummary } from "@/lib/athlete/careerSummary";
import { fetchAthleteEditionStats } from "@/lib/athlete/fetchAthleteEditionStats";
import {
  buildRatingMaps,
  ratingFromMaps,
} from "@/lib/athlete/recentMatchRating";
import { getSupabase } from "@/lib/supabase";
import type {
  AthleteCareerStats,
  AthleteListItem,
  AthleteProfileData,
  AthleteRecentMatch,
  AthleteRosterEntry,
  AthleteTeamStint,
  AthleteAwardEntry,
  AthleteEditionStatRow,
  AthleteStatsPhaseRecord,
  Match,
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

const MATCH_FOR_ATHLETE_SELECT = `
  ${MATCH_SELECT_BASE},
  motm_athlete_id
`;

export async function getAthletesList(orgId: string): Promise<AthleteListItem[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("athletes")
    .select(
      `
      id,
      full_name,
      surname,
      photo_url,
      athlete_team_stints(
        is_current,
        teams(full_name, short_name, logo_url, abbreviation)
      )
    `,
    )
    .eq("organization_id", orgId)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[getAthletesList]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const stintsRaw = row.athlete_team_stints as unknown as
      | { is_current: boolean; teams: AthleteListItem["current_team"] }[]
      | null;
    const current = (stintsRaw ?? []).find((s) => s.is_current);
    return {
      id: row.id as string,
      full_name: row.full_name as string,
      surname: row.surname as string | null,
      photo_url: row.photo_url as string | null,
      current_team: current?.teams ?? null,
    };
  });
}

export async function getAthleteProfile(
  athleteId: string,
  orgId: string,
): Promise<AthleteProfileData | null> {
  const supabase = getSupabase();

  const { data: athlete, error } = await supabase
    .from("athletes")
    .select(
      `
      id,
      full_name,
      surname,
      photo_url,
      birth_date,
      nationality,
      player_positions(full_name, abbreviation)
    `,
    )
    .eq("id", athleteId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (error || !athlete) {
    if (error) console.error("[getAthleteProfile]", error.message);
    return null;
  }

  const [
    careerResult,
    stintsResult,
    lineupsResult,
    rosterEntriesResult,
    awardsResult,
    editionStats,
  ] = await Promise.all([
    supabase
      .from("athlete_career_stats")
      .select(
        "total_matches, total_goals, total_assists, total_yellow_cards, total_red_cards, total_motm, total_totw, total_motw, total_hat_tricks, total_pokers, total_mvp, total_top_scorer, total_top_assists, total_best_goalkeeper, total_penalties_scored, total_penalties_taken, total_shootouts_scored, total_shootouts_taken, avg_rating, total_ratings_count",
      )
      .eq("athlete_id", athleteId)
      .eq("organization_id", orgId)
      .maybeSingle(),
    supabase
      .from("athlete_team_stints")
      .select(
        "id, athlete_id, team_id, started_at, ended_at, is_current, is_active, teams(id, full_name, short_name, logo_url, abbreviation, primary_color)",
      )
      .eq("athlete_id", athleteId)
      .order("started_at", { ascending: false }),
    supabase
      .from("match_lineups")
      .select("match_id, edition_team_id")
      .eq("athlete_id", athleteId)
      .eq("is_present", true)
      .order("match_id", { ascending: false }),
    supabase
      .from("edition_roster_entries")
      .select("id, edition_team_id, status, member_type")
      .eq("athlete_id", athleteId)
      .or("member_type.eq.athlete,member_type.is.null")
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
      .eq("athlete_id", athleteId)
      .order("edition_id"),
    fetchAthleteEditionStats(athleteId),
  ]);

  if (careerResult.error) {
    console.error("[getAthleteProfile:career]", careerResult.error.message);
  }
  if (stintsResult.error) {
    console.error("[getAthleteProfile:stints]", stintsResult.error.message);
  }
  if (lineupsResult.error) {
    console.error("[getAthleteProfile:lineups]", lineupsResult.error.message);
  }
  if (rosterEntriesResult.error) {
    console.error(
      "[getAthleteProfile:rosterEntries]",
      rosterEntriesResult.error.message,
    );
  }
  if (awardsResult.error) {
    console.error("[getAthleteProfile:awards]", awardsResult.error.message);
  }

  const lineupRows = (lineupsResult.data ?? []) as {
    match_id: string;
    edition_team_id: string | null;
  }[];

  const lineupRatingByMatch = new Map<string, number | null>();
  if (lineupRows.length) {
    const matchIdsForLineup = [...new Set(lineupRows.map((r) => r.match_id))];
    const { data: lineupRatings, error: lineupRatingsError } = await supabase
      .from("match_lineups")
      .select("match_id, match_rating")
      .eq("athlete_id", athleteId)
      .eq("is_present", true)
      .in("match_id", matchIdsForLineup);
    if (lineupRatingsError) {
      console.error(
        "[getAthleteProfile:lineupRatings]",
        lineupRatingsError.message,
      );
    } else {
      for (const row of lineupRatings ?? []) {
        const id = row.match_id as string;
        const n =
          row.match_rating == null ? null : Number(row.match_rating);
        if (Number.isFinite(n)) lineupRatingByMatch.set(id, n as number);
      }
    }
  }
  const matchIds = [...new Set(lineupRows.map((l) => l.match_id as string))];
  const presenceTeamMap = new Map<string, string | null>();
  for (const row of lineupRows) {
    presenceTeamMap.set(row.match_id, row.edition_team_id ?? null);
  }
  let recentMatches: AthleteRecentMatch[] = [];

  if (matchIds.length) {
    const ids = matchIds;
    const matchChunks = chunkIds(ids, MATCH_IN_CHUNK);

    const matches: Match[] = [];
    const athleteRatingRows: { match_id: string; rating: number }[] = [];
    const actionsByMatch = new Map<
      string,
      {
        match_id: string;
        action_type: string;
        goal_type: string | null;
        is_own_goal: boolean | null;
        minute: number | null;
      }[]
    >();

    for (const chunk of matchChunks) {
      const [matchesResult, athleteRatingsResult, athleteActionsResult] =
        await Promise.all([
          supabase
            .from("matches")
            .select(MATCH_FOR_ATHLETE_SELECT)
            .in("id", chunk),
          supabase
            .from("match_athlete_ratings")
            .select("match_id, rating")
            .eq("athlete_id", athleteId)
            .in("match_id", chunk),
          supabase
            .from("match_actions")
            .select("match_id, action_type, goal_type, is_own_goal, minute")
            .eq("primary_athlete_id", athleteId)
            .in("match_id", chunk),
        ]);

      if (matchesResult.error) {
        console.error("[getAthleteProfile:matches]", matchesResult.error.message);
      }
      if (athleteRatingsResult.error) {
        console.error(
          "[getAthleteProfile:athleteRatings]",
          athleteRatingsResult.error.message,
        );
      }
      if (athleteActionsResult.error) {
        console.error(
          "[getAthleteProfile:athleteActions]",
          athleteActionsResult.error.message,
        );
      }

      matches.push(...((matchesResult.data as Match[] | null) ?? []));

      for (const row of (athleteRatingsResult.data ??
        []) as { match_id: string; rating: number | null }[]) {
        if (!row.match_id || row.rating == null) continue;
        const n = Number(row.rating);
        if (Number.isFinite(n)) {
          athleteRatingRows.push({ match_id: row.match_id, rating: n });
        }
      }
      for (const row of (athleteActionsResult.data ??
        []) as {
        match_id: string;
        action_type: string;
        goal_type: string | null;
        is_own_goal: boolean | null;
        minute: number | null;
      }[]) {
        const list = actionsByMatch.get(row.match_id) ?? [];
        list.push(row);
        actionsByMatch.set(row.match_id, list);
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

    const { lineupRatings, athleteRatings } = buildRatingMaps(
      lineupRows.map((row) => ({
        match_id: row.match_id,
        match_rating: lineupRatingByMatch.get(row.match_id) ?? null,
      })),
      athleteRatingRows,
    );

    recentMatches = matches.map((match) => {
      const m = match as Match & { motm_athlete_id?: string | null };
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
        rating: ratingFromMaps(match.id, lineupRatings, athleteRatings),
        isMotm: m.motm_athlete_id === athleteId,
        actions: actionsByMatch.get(match.id) ?? [],
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

  let rosterEntries = await enrichAthleteRosterEntries(
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

  const careerSummary = buildAthleteCareerSummary({
    editionStats,
    careerStats: (careerResult.data as AthleteCareerStats | null) ?? null,
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
      console.error("[getAthleteProfile:statsPhases]", phasesError.message);
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
    athlete: athlete as AthleteProfileData["athlete"] & {
      birth_date?: string | null;
    },
    careerStats: (careerResult.data as AthleteCareerStats | null) ?? null,
    stints: (stintsResult.data as AthleteTeamStint[] | null) ?? [],
    recentMatches,
    rosterEntries,
    editionStats,
    phases: [],
    statsPhases,
    awards,
    teamAwards,
    careerSummary,
  };
}
