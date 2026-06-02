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
  AthleteTeamStint,
  Match,
  MatchAthleteRating,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

const RECENT_MATCHES_LIMIT = 15;

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

  const [careerResult, stintsResult, lineupsResult] = await Promise.all([
    supabase
      .from("athlete_career_stats")
      .select(
        "total_matches, total_goals, total_assists, total_yellow_cards, total_red_cards, total_motm",
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
      .eq("is_active", true)
      .order("started_at", { ascending: false }),
    supabase
      .from("match_lineups")
      .select("match_id")
      .eq("athlete_id", athleteId)
      .eq("is_present", true)
      .order("match_id", { ascending: false })
      .limit(40),
  ]);

  const matchIds = (lineupsResult.data ?? []).map((l) => l.match_id as string);
  let recentMatches: AthleteRecentMatch[] = [];

  if (matchIds.length) {
    const ids = matchIds.slice(0, RECENT_MATCHES_LIMIT);

    const [matchesResult, lineupRatingsResult, athleteRatingsResult] =
      await Promise.all([
        supabase
          .from("matches")
          .select(MATCH_FOR_ATHLETE_SELECT)
          .in("id", ids),
        supabase
          .from("match_lineups")
          .select("match_id, match_rating")
          .eq("athlete_id", athleteId)
          .in("match_id", ids),
        supabase
          .from("match_athlete_ratings")
          .select("match_id, rating")
          .eq("athlete_id", athleteId)
          .in("match_id", ids),
      ]);

    const matches = ((matchesResult.data as Match[] | null) ?? []).sort(
      (a, b) => b.match_date.localeCompare(a.match_date),
    );

    const { lineupRatings, athleteRatings } = buildRatingMaps(
      (lineupRatingsResult.data as { match_id: string; match_rating: number | null }[]) ??
        [],
      (athleteRatingsResult.data as MatchAthleteRating[] | null) ?? [],
    );

    recentMatches = matches.map((match) => {
      const m = match as Match & { motm_athlete_id?: string | null };
      return {
        match,
        rating: ratingFromMaps(match.id, lineupRatings, athleteRatings),
        isMotm: m.motm_athlete_id === athleteId,
      };
    });
  }

  return {
    athlete: athlete as AthleteProfileData["athlete"],
    careerStats: (careerResult.data as AthleteCareerStats | null) ?? null,
    stints: (stintsResult.data as AthleteTeamStint[] | null) ?? [],
    recentMatches,
  };
}
