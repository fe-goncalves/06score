import {
  assertOrgOwnsCompetition,
  enrichMatchupsWithTeams,
  getEditionIdsForCompetition,
  getPhaseIdsForEdition,
} from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  AthleteStatLeader,
  Competition,
  CompetitionEdition,
  CompetitionHubData,
  EditionTeam,
  Group,
  GroupTeam,
  Match,
  Matchup,
  Phase,
  TeamEditionStats,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

export async function getCompetitionHub(
  competitionId: string,
  orgId: string,
): Promise<CompetitionHubData | null> {
  const competition = await assertOrgOwnsCompetition(competitionId, orgId);
  if (!competition) return null;

  const supabase = getSupabase();

  const { data: editions, error: edError } = await supabase
    .from("competition_editions")
    .select("id, status, is_current, custom_name, seasons(name)")
    .eq("competition_id", competitionId)
    .order("is_current", { ascending: false });

  if (edError) {
    console.error("[getCompetitionHub editions]", edError.message);
    return null;
  }

  const editionList = (editions as CompetitionEdition[] | null) ?? [];
  const currentEdition =
    editionList.find((e) => e.is_current) ?? editionList[0] ?? null;

  if (!currentEdition) {
    return {
      competition,
      editions: editionList,
      currentEdition: null,
      phases: [],
      teamEditionStats: [],
      matches: [],
      matchups: [],
      editionTeams: [],
      topScorers: [],
      topAssisters: [],
      topYellowCards: [],
      groups: [],
      groupTeams: [],
    };
  }

  const editionId = currentEdition.id;
  const phaseIds = await getPhaseIdsForEdition(editionId);

  const emptyUuid = "00000000-0000-0000-0000-000000000000";
  const phaseIdsQuery = phaseIds.length ? phaseIds : [emptyUuid];

  const [
    phasesResult,
    statsResult,
    matchesResult,
    editionTeamsResult,
    topScorersResult,
    topAssistersResult,
    topYellowResult,
    groupsResult,
  ] = await Promise.all([
    supabase
      .from("phases")
      .select(
        "id, edition_id, full_name, custom_label, phase_type, display_order, is_current",
      )
      .eq("edition_id", editionId)
      .order("display_order", { ascending: true }),
    supabase
      .from("team_edition_stats")
      .select(
        `
        edition_id,
        team_id,
        matches_played,
        wins,
        draws,
        losses,
        goals_scored,
        goals_conceded,
        points,
        teams(id, full_name, short_name, abbreviation, logo_url, primary_color)
      `,
      )
      .eq("edition_id", editionId)
      .order("points", { ascending: false })
      .order("goals_scored", { ascending: false }),
    phaseIds.length
      ? supabase
          .from("matches")
          .select(MATCH_SELECT_BASE)
          .in("phase_id", phaseIds)
          .order("match_date", { ascending: false })
          .order("match_time", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("edition_teams")
      .select(
        `
        id,
        edition_id,
        team_id,
        is_free_agent_pool,
        teams(id, full_name, short_name, abbreviation, logo_url, primary_color)
      `,
      )
      .eq("edition_id", editionId)
      .eq("is_free_agent_pool", false),
    supabase
      .from("athlete_edition_stats")
      .select(
        "goals, assists, athletes(id, full_name, surname, photo_url), teams(full_name, short_name, logo_url, abbreviation)",
      )
      .eq("edition_id", editionId)
      .order("goals", { ascending: false })
      .limit(10),
    supabase
      .from("athlete_edition_stats")
      .select(
        "goals, assists, athletes(id, full_name, surname, photo_url), teams(full_name, short_name, logo_url, abbreviation)",
      )
      .eq("edition_id", editionId)
      .order("assists", { ascending: false })
      .limit(10),
    supabase
      .from("athlete_edition_stats")
      .select(
        "yellow_cards, athletes(id, full_name, surname, photo_url), teams(full_name, short_name, logo_url, abbreviation)",
      )
      .eq("edition_id", editionId)
      .order("yellow_cards", { ascending: false })
      .limit(10),
    supabase
      .from("groups")
      .select("id, phase_id, name, custom_label, display_order")
      .in("phase_id", phaseIdsQuery)
      .order("display_order", { ascending: true }),
  ]);

  const groups = (groupsResult.data as Group[] | null) ?? [];
  const groupIds = groups.map((g) => g.id);

  let groupTeams: GroupTeam[] = [];
  if (groupIds.length) {
    const { data: gtData, error: gtError } = await supabase
      .from("group_teams")
      .select(
        `
        id,
        group_id,
        edition_team_id,
        edition_teams(
          team_id,
          teams(id, full_name, short_name, abbreviation, logo_url)
        )
      `,
      )
      .in("group_id", groupIds);

    if (gtError) {
      console.error("[getCompetitionHub groupTeams]", gtError.message);
    } else {
      groupTeams = (gtData as unknown as GroupTeam[] | null) ?? [];
    }
  }

  const phases = (phasesResult.data as Phase[] | null) ?? [];
  const knockoutPhaseIds = phases
    .filter((p) => p.phase_type === "knockout" || p.phase_type === "conference")
    .map((p) => p.id);

  let matchups: Matchup[] = [];
  if (knockoutPhaseIds.length) {
    const { data: matchupsData, error: muError } = await supabase
      .from("matchups")
      .select(
        "id, phase_id, conference_id, round_label, display_order, is_completed, team_a_id, team_b_id",
      )
      .in("phase_id", knockoutPhaseIds)
      .order("display_order", { ascending: true });

    if (muError) {
      console.error("[getCompetitionHub matchups]", muError.message);
    } else {
      matchups = await enrichMatchupsWithTeams(
        (matchupsData as Matchup[] | null) ?? [],
      );
    }
  }

  const editionTeamsRaw = (editionTeamsResult.data as EditionTeam[] | null) ?? [];
  const editionTeamIds = editionTeamsRaw.map((et) => et.id);

  let rosterCounts: Record<string, number> = {};
  if (editionTeamIds.length) {
    const { data: rosterData } = await supabase
      .from("edition_roster_entries")
      .select("edition_team_id")
      .in("edition_team_id", editionTeamIds)
      .eq("member_type", "athlete")
      .eq("status", "approved");

    for (const row of rosterData ?? []) {
      const id = row.edition_team_id as string;
      rosterCounts[id] = (rosterCounts[id] ?? 0) + 1;
    }
  }

  const editionTeams = editionTeamsRaw.map((et) => ({
    ...et,
    athlete_count: rosterCounts[et.id] ?? 0,
  }));

  if (statsResult.error) {
    console.error("[getCompetitionHub stats]", statsResult.error.message);
  }
  if (matchesResult.error) {
    console.error("[getCompetitionHub matches]", matchesResult.error.message);
  }

  return {
    competition,
    editions: editionList,
    currentEdition,
    phases,
    teamEditionStats:
      (statsResult.data as TeamEditionStats[] | null) ?? [],
    matches: (matchesResult.data as Match[] | null) ?? [],
    matchups,
    editionTeams,
    topScorers: (topScorersResult.data as AthleteStatLeader[] | null) ?? [],
    topAssisters: (topAssistersResult.data as AthleteStatLeader[] | null) ?? [],
    topYellowCards:
      (topYellowResult.data as AthleteStatLeader[] | null) ?? [],
    groups,
    groupTeams,
  };
}

export async function getCompetitionsList(
  orgId: string,
): Promise<Competition[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select(
      `
      id,
      full_name,
      short_name,
      logo_url,
      primary_color,
      sport_slug,
      gender,
      competition_editions(
        id,
        status,
        is_current,
        seasons(name)
      )
    `,
    )
    .eq("organization_id", orgId)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[getCompetitionsList]", error.message);
    return [];
  }

  return (data as Competition[] | null) ?? [];
}
