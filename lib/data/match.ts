import { getSupabase } from "@/lib/supabase";
import type {
  Match,
  MatchAction,
  MatchAthleteRating,
  MatchDetailData,
  MatchLineup,
} from "@/lib/types";
import { MATCH_SELECT_BASE, PHASE_SELECT } from "@/lib/utils";

const MATCH_DETAIL_SELECT = `
  ${MATCH_SELECT_BASE},
  venues(full_name, address)
`;

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

  const [lineupsResult, ratingsResult, actionsResult] = await Promise.all([
    supabase
      .from("match_lineups")
      .select(
        `
        match_id,
        athlete_id,
        edition_team_id,
        is_present,
        played_as_goalkeeper,
        is_captain,
        athletes(id, full_name, surname, photo_url, player_positions(full_name, abbreviation)),
        edition_teams(team_id, teams(full_name, short_name, logo_url))
      `,
      )
      .eq("match_id", matchId)
      .eq("is_present", true),
    supabase
      .from("match_athlete_ratings")
      .select("match_id, athlete_id, rating, is_public")
      .eq("match_id", matchId)
      .eq("is_public", true),
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
        goal_type,
        is_own_goal,
        athletes:athletes!match_actions_primary_athlete_id_fkey(full_name, surname, photo_url)
      `,
      )
      .eq("match_id", matchId)
      .order("period", { ascending: true })
      .order("minute", { ascending: true }),
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

  return {
    match: m,
    lineups: (lineupsResult.data as MatchLineup[] | null) ?? [],
    ratings: (ratingsResult.data as MatchAthleteRating[] | null) ?? [],
    actions: (actionsResult.data as MatchAction[] | null) ?? [],
    teamAId,
    teamBId,
  };
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
