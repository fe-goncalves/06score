import { getPublishedNewsByCompetition } from "@/lib/data/news";
import { buildEditionDetailsPanelData } from "@/lib/competition/detailsPanel";
import {
  fetchEditionAwardsForHub,
  fetchEditionDetailsExtras,
} from "@/lib/data/competition-details";
import { fetchEditionTotsSquad } from "@/lib/data/tots";
import { fetchCompetitionTeamStats } from "@/lib/data/competition-team-stats";
import {
  assertOrgOwnsCompetition,
  enrichMatchupsWithTeams,
  fetchEditionTeamsForCompetition,
  getEditionIdsForCompetition,
  getPhaseIdsForEdition,
  supplementEditionTeamsForHub,
} from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  AthleteStatLeader,
  Competition,
  CompetitionEdition,
  CompetitionHubData,
  Group,
  GroupTeam,
  Match,
  MatchRound,
  Matchup,
  Phase,
  TableMarker,
  TeamEditionStats,
} from "@/lib/types";
import { sortPhases } from "@/lib/competition/phases";
import {
  buildCoachLeadersFromGallery,
  getTotwGalleryForEdition,
} from "@/lib/data/totw";
import { MATCH_SELECT_BASE } from "@/lib/utils";

const ATHLETE_LEADER_SELECT =
  "athletes(id, full_name, surname, photo_url, player_positions(full_name, abbreviation)), teams(id, full_name, short_name, logo_url, abbreviation)";

function formatEditionLabel(edition: CompetitionEdition | null): string {
  if (!edition) return "";
  const custom = edition.custom_name?.trim();
  if (custom) return custom;
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name?.trim() ?? "";
  return seasons?.name?.trim() ?? "";
}

export async function getCompetitionName(
  competitionId: string,
  orgId: string,
  requestedEditionId?: string | null,
): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select(
      `
      short_name,
      full_name,
      competition_editions(
        id,
        status,
        is_current,
        custom_name,
        seasons(name)
      )
    `,
    )
    .eq("id", competitionId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (error) {
    console.error("[getCompetitionName]", error.message);
    return null;
  }

  if (!data) return null;

  const short =
    (data.short_name as string | null)?.trim() ||
    (data.full_name as string | null)?.trim() ||
    "Competição";
  const editions =
    (data.competition_editions as CompetitionEdition[] | null) ?? [];
  const current =
    (requestedEditionId
      ? editions.find((e) => e.id === requestedEditionId)
      : null) ??
    editions.find((e) => e.is_current) ??
    editions[0] ??
    null;
  const edition = formatEditionLabel(current);
  const title = edition ? `${short} · ${edition}` : short;
  return title.toUpperCase();
}

export async function getCompetitionHub(
  competitionId: string,
  orgId: string,
  requestedEditionId?: string | null,
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
  const defaultEdition =
    editionList.find((e) => e.is_current) ?? editionList[0] ?? null;
  const currentEdition =
    requestedEditionId && editionList.some((e) => e.id === requestedEditionId)
      ? (editionList.find((e) => e.id === requestedEditionId) ?? defaultEdition)
      : defaultEdition;

  if (!currentEdition) {
    return {
      competition,
      editions: editionList,
      currentEdition: null,
      phases: [],
      teamEditionStats: [],
      matches: [],
      matchups: [],
      rounds: [],
      editionTeams: [],
      topScorers: [],
      topAssisters: [],
      topYellowCards: [],
      topMotm: [],
      topRedCards: [],
      topTotwSelections: [],
      totwGallery: [],
      topCoaches: [],
      groups: [],
      groupTeams: [],
      tableMarkers: [],
      editionDetails: {
        totalGoals: 0,
        totalAthletes: 0,
        totalYellowCards: 0,
        totalRedCards: 0,
        totalCards: 0,
        debutTeams: [],
        phaseLeaders: [],
        pastChampions: [],
        defendingChampion: null,
      },
      awards: [],
      totsSquad: null,
      news: [],
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
    editionTeamsBase,
    topScorersResult,
    topAssistersResult,
    topYellowResult,
    topMotmResult,
    topRedResult,
    topTotwCountResult,
    groupsResult,
    markersResult,
    awards,
    totsSquad,
    news,
  ] = await Promise.all([
    supabase
      .from("phases")
      .select(
        "id, edition_id, full_name, custom_label, phase_type, display_order, is_current, created_at",
      )
      .eq("edition_id", editionId),
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
        yellow_cards,
        red_cards,
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
    fetchEditionTeamsForCompetition(competitionId, editionId),
    supabase
      .from("athlete_edition_stats")
      .select(`goals, assists, ${ATHLETE_LEADER_SELECT}`)
      .eq("edition_id", editionId)
      .order("goals", { ascending: false })
      .limit(100),
    supabase
      .from("athlete_edition_stats")
      .select(`goals, assists, ${ATHLETE_LEADER_SELECT}`)
      .eq("edition_id", editionId)
      .order("assists", { ascending: false })
      .limit(100),
    supabase
      .from("athlete_edition_stats")
      .select(`yellow_cards, ${ATHLETE_LEADER_SELECT}`)
      .eq("edition_id", editionId)
      .order("yellow_cards", { ascending: false })
      .limit(100),
    supabase
      .from("athlete_edition_stats")
      .select(`motm_count, ${ATHLETE_LEADER_SELECT}`)
      .eq("edition_id", editionId)
      .order("motm_count", { ascending: false })
      .limit(100),
    supabase
      .from("athlete_edition_stats")
      .select(`red_cards, ${ATHLETE_LEADER_SELECT}`)
      .eq("edition_id", editionId)
      .order("red_cards", { ascending: false })
      .limit(100),
    supabase
      .from("athlete_edition_stats")
      .select(`totw_count, ${ATHLETE_LEADER_SELECT}`)
      .eq("edition_id", editionId)
      .order("totw_count", { ascending: false })
      .limit(100),
    supabase
      .from("groups")
      .select("id, phase_id, name, custom_label, display_order")
      .in("phase_id", phaseIdsQuery)
      .order("display_order", { ascending: true }),
    supabase
      .from("table_markers")
      .select(
        "id, phase_id, description, color_hex, show_background, position_from, position_to, display_order",
      )
      .in("phase_id", phaseIdsQuery)
      .order("display_order", { ascending: true }),
    fetchEditionAwardsForHub(editionId),
    fetchEditionTotsSquad(editionId),
    getPublishedNewsByCompetition(orgId, competitionId),
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

  const phases = sortPhases((phasesResult.data as Phase[] | null) ?? []);
  const matches = (matchesResult.data as Match[] | null) ?? [];
  const teamEditionStats =
    (statsResult.data as TeamEditionStats[] | null) ?? [];

  const [totwGallery, competitionStats, detailsExtras] = await Promise.all([
    getTotwGalleryForEdition(editionId, phases),
    fetchCompetitionTeamStats(competitionId),
    fetchEditionDetailsExtras(competitionId, editionId),
  ]);

  const topCoaches = buildCoachLeadersFromGallery(totwGallery);
  const knockoutPhaseIds = phases
    .filter((p) => p.phase_type === "knockout" || p.phase_type === "conference")
    .map((p) => p.id);

  let matchups: Matchup[] = [];
  let rounds: MatchRound[] = [];
  if (knockoutPhaseIds.length) {
    const [matchupsResult, roundsResult] = await Promise.all([
      supabase
        .from("matchups")
        .select(
          "id, phase_id, conference_id, round_id, round_label, display_order, is_completed, team_a_id, team_b_id, aggregate_winner_id",
        )
        .in("phase_id", knockoutPhaseIds)
        .order("display_order", { ascending: true }),
      supabase
        .from("rounds")
        .select(
          "id, phase_id, name, custom_label, display_order, is_current, legs, aggregate_score",
        )
        .in("phase_id", knockoutPhaseIds)
        .order("display_order", { ascending: true }),
    ]);

    if (matchupsResult.error) {
      console.error("[getCompetitionHub matchups]", matchupsResult.error.message);
    } else {
      matchups = await enrichMatchupsWithTeams(
        (matchupsResult.data as Matchup[] | null) ?? [],
      );
    }

    if (roundsResult.error) {
      console.warn("[getCompetitionHub rounds]", roundsResult.error.message);
      const { data: roundsFallback } = await supabase
        .from("rounds")
        .select("id, phase_id, name, custom_label, display_order")
        .in("phase_id", knockoutPhaseIds)
        .order("display_order", { ascending: true });
      rounds = (roundsFallback as MatchRound[] | null) ?? [];
    } else {
      rounds = (roundsResult.data as MatchRound[] | null) ?? [];
    }
  }

  let editionTeams = editionTeamsBase;

  if (!editionTeams.length) {
    editionTeams = await supplementEditionTeamsForHub({
      editionId,
      base: [],
      stats: (statsResult.data as TeamEditionStats[] | null) ?? [],
      matches: (matchesResult.data as Match[] | null) ?? [],
      matchups,
    });
  }

  const rosterEditionTeamIds = editionTeams
    .filter((et) => !et.id.startsWith("hub-"))
    .map((et) => et.id);

  let rosterCounts: Record<string, number> = {};
  if (rosterEditionTeamIds.length) {
    const { data: rosterData } = await supabase
      .from("edition_roster_entries")
      .select("edition_team_id")
      .in("edition_team_id", rosterEditionTeamIds)
      .eq("member_type", "athlete")
      .eq("status", "approved");

    for (const row of rosterData ?? []) {
      const id = row.edition_team_id as string;
      rosterCounts[id] = (rosterCounts[id] ?? 0) + 1;
    }
  }

  editionTeams = editionTeams.map((et) => ({
    ...et,
    athlete_count: rosterCounts[et.id] ?? 0,
  }));

  editionTeams = editionTeams.map((et) => {
    const lookupId = et.team_id || et.teams?.id;
    const stats =
      lookupId && competitionStats[lookupId]
        ? competitionStats[lookupId]
        : { participations: 0, titles: 0, wins: 0 };
    return {
      ...et,
      competition_participations: stats.participations,
      competition_titles: stats.titles,
      competition_wins: stats.wins,
    };
  });

  if (statsResult.error) {
    console.error("[getCompetitionHub stats]", statsResult.error.message);
  }
  if (matchesResult.error) {
    console.error("[getCompetitionHub matches]", matchesResult.error.message);
  }
  if (markersResult.error) {
    console.error("[getCompetitionHub tableMarkers]", markersResult.error.message);
  }
  const tableMarkers = (markersResult.data as TableMarker[] | null) ?? [];

  const editionDetails = buildEditionDetailsPanelData({
    editionTeams,
    phases,
    matches,
    teamEditionStats,
    totalGoalsFromAthletes: detailsExtras.totalGoals,
    totalYellowCards: detailsExtras.totalYellowCards,
    totalRedCards: detailsExtras.totalRedCards,
    pastChampions: detailsExtras.pastChampions,
    defendingChampion: detailsExtras.defendingChampion,
  });

  return {
    competition,
    editions: editionList,
    currentEdition,
    phases,
    teamEditionStats,
    matches,
    matchups,
    rounds,
    editionTeams,
    editionDetails,
    awards,
    totsSquad,
    topScorers: (topScorersResult.data as AthleteStatLeader[] | null) ?? [],
    topAssisters: (topAssistersResult.data as AthleteStatLeader[] | null) ?? [],
    topYellowCards:
      (topYellowResult.data as AthleteStatLeader[] | null) ?? [],
    topMotm: (topMotmResult.data as AthleteStatLeader[] | null) ?? [],
    topRedCards: (topRedResult.data as AthleteStatLeader[] | null) ?? [],
    topTotwSelections:
      (topTotwCountResult.data as AthleteStatLeader[] | null) ?? [],
    totwGallery,
    topCoaches,
    groups,
    groupTeams,
    tableMarkers,
    news,
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
        custom_name,
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
