import { getSupabase } from "@/lib/supabase";
import type {
  AthleteCareerStats,
  AthleteListItem,
  AthleteProfileData,
  AthleteTeamStint,
  Match,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

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
        "id, athlete_id, team_id, started_at, ended_at, is_current, is_active, teams(full_name, short_name, logo_url, abbreviation)",
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
      .limit(20),
  ]);

  let recentMatches: Match[] = [];
  const matchIds = (lineupsResult.data ?? []).map((l) => l.match_id as string);

  if (matchIds.length) {
    const { data: matchesData } = await supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("id", matchIds.slice(0, 20));

    recentMatches = ((matchesData as Match[] | null) ?? [])
      .sort((a, b) => b.match_date.localeCompare(a.match_date))
      .slice(0, 5);
  }

  return {
    athlete: athlete as AthleteProfileData["athlete"],
    careerStats: (careerResult.data as AthleteCareerStats | null) ?? null,
    stints: (stintsResult.data as AthleteTeamStint[] | null) ?? [],
    recentMatches,
  };
}
