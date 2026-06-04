import {
  fetchH2HMatches,
  fetchNextTeamMatch,
} from "@/lib/data/match-fixtures";
import { fetchMatchStaffLineups } from "@/lib/data/match-staff-lineups";
import {
  fetchEditionTeamsByIds,
  type EditionTeamLineupEmbed,
} from "@/lib/data/shared";
import {
  buildPeriodFoulCounts,
  type MatchTeamPeriodStat,
} from "@/lib/match/periodFouls";
import { getSupabase } from "@/lib/supabase";
import type {
  Match,
  MatchAction,
  MatchAthleteRating,
  MatchDetailData,
  MatchLineup,
  MatchPageData,
  MatchStaffLineup,
} from "@/lib/types";
import { MATCH_SELECT_BASE, PHASE_SELECT } from "@/lib/utils";

const MATCH_DETAIL_SELECT = `
  ${MATCH_SELECT_BASE},
  motm_athlete_id,
  motm_team_id,
  motm_athlete:athletes!matches_motm_athlete_id_fkey(id, full_name, surname, photo_url),
  motm_team:teams!matches_motm_team_id_fkey(id, full_name, short_name, abbreviation, logo_url),
  venues(id, full_name, address)
`;

const MATCH_LINEUP_SELECT = `
  match_id,
  athlete_id,
  edition_team_id,
  is_present,
  played_as_goalkeeper,
  is_captain,
  match_rating,
  athletes(id, full_name, surname, photo_url, player_positions(full_name, abbreviation))
`;

type RawMatchLineup = Omit<MatchLineup, "edition_teams">;

function attachEditionTeamsToLineups(
  rows: RawMatchLineup[],
  lookup: Map<string, EditionTeamLineupEmbed>,
): MatchLineup[] {
  return rows.map((row) => ({
    ...row,
    edition_teams: lookup.get(row.edition_team_id) ?? null,
  }));
}

function collectEditionTeamIds(
  lineups: RawMatchLineup[],
  ratings: { edition_team_id?: string | null }[],
): string[] {
  return [
    ...new Set(
      [
        ...lineups.map((row) => row.edition_team_id),
        ...ratings.map((r) => r.edition_team_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  ];
}

export async function getMatchDetail(
  matchId: string,
  orgId: string,
): Promise<MatchDetailData | null> {
  const supabase = getSupabase();

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select(MATCH_DETAIL_SELECT)
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) {
    console.error("[getMatchDetail]", matchError.message);
    return null;
  }

  if (!match) return null;

  const m = match as unknown as Match;
  const orgFromMatch =
    m.phases?.competition_editions?.competitions?.organization_id;
  if (orgFromMatch !== orgId) return null;

  const teamAId = m.team_a_id ?? "";
  const teamBId = m.team_b_id ?? "";

  const [
    lineupsResult,
    ratingsResult,
    actionsResult,
    teamStatsResult,
    staffLineups,
    h2hMatches,
    nextGameA,
    nextGameB,
  ] = await Promise.all([
      supabase
        .from("match_lineups")
        .select(MATCH_LINEUP_SELECT)
        .eq("match_id", matchId)
        .eq("is_present", true),
      supabase
        .from("match_athlete_ratings")
        .select("athlete_id, rating, edition_team_id")
        .eq("match_id", matchId),
      supabase
        .from("match_actions")
        .select(
          `
        id,
        match_id,
        team_id,
        action_type,
        minute,
        period,
        primary_athlete_id,
        secondary_athlete_id,
        goal_type,
        is_own_goal,
        miss_result,
        athletes:athletes!match_actions_primary_athlete_id_fkey(full_name, surname, photo_url),
        secondary_athletes:athletes!match_actions_secondary_athlete_id_fkey(full_name, surname, photo_url)
      `,
        )
        .eq("match_id", matchId)
        .order("period", { ascending: true })
        .order("minute", { ascending: true }),
      supabase
        .from("match_team_stats")
        .select("team_id, period, fouls, avg_rating, rated_athletes_count")
        .eq("match_id", matchId),
      fetchMatchStaffLineups(matchId),
      fetchH2HMatches(teamAId, teamBId, matchId),
      fetchNextTeamMatch(teamAId),
      fetchNextTeamMatch(teamBId),
    ]);

  if (lineupsResult.error) {
    console.error("[getMatchDetail lineups]", lineupsResult.error.message);
  }
  if (ratingsResult.error) {
    console.error("[getMatchDetail ratings]", ratingsResult.error.message);
  }
  if (actionsResult.error) {
    console.error("[getMatchDetail actions]", actionsResult.error.message);
  }
  if (teamStatsResult.error) {
    console.error("[getMatchDetail team stats]", teamStatsResult.error.message);
  }

  const rawLineups = (lineupsResult.data as RawMatchLineup[] | null) ?? [];
  const ratings =
    (ratingsResult.data as MatchAthleteRating[] | null) ?? [];

  const editionTeamsMap = await fetchEditionTeamsByIds(
    collectEditionTeamIds(rawLineups, ratings),
  );

  const lineups = attachEditionTeamsToLineups(rawLineups, editionTeamsMap);

  const actions = (actionsResult.data as MatchAction[] | null) ?? [];
  const teamStats =
    (teamStatsResult.data as MatchTeamPeriodStat[] | null) ?? [];
  const periodFoulCounts = buildPeriodFoulCounts(teamStats, teamAId);

  return {
    match: m,
    lineups,
    staffLineups,
    ratings,
    actions,
    teamAId,
    teamBId,
    periodFoulCounts,
    teamStats,
    h2hMatches,
    nextGameA,
    nextGameB,
  };
}

export async function getMatchPageData(
  matchId: string,
  orgId: string,
): Promise<MatchPageData | null> {
  return getMatchDetail(matchId, orgId);
}

export async function assertOrgOwnsMatch(
  matchId: string,
  orgId: string,
): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      phases(${PHASE_SELECT.replace(/\n/g, " ")})
    `,
    )
    .eq("id", matchId)
    .maybeSingle();

  if (error || !data) return false;
  const m = data as unknown as Match;
  return (
    m.phases?.competition_editions?.competitions?.organization_id === orgId
  );
}
