import { getActiveEditionId } from "@/lib/data/home";
import { fetchEditionTeamsForEdition, getPhaseIdsForOrg } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  Athlete,
  Match,
  Team,
  TeamEditionStats,
  TeamProfileData,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

export interface TeamListItem {
  id: string;
  team: Team;
}

export async function getTeamsList(orgId: string): Promise<TeamListItem[]> {
  const editionId = await getActiveEditionId(orgId);
  if (!editionId) return [];

  const rows = await fetchEditionTeamsForEdition(editionId);

  return rows
    .map((row) => {
      if (!row.teams) return null;
      return { id: row.team_id, team: row.teams };
    })
    .filter((row): row is TeamListItem => row !== null);
}

export async function getTeamProfile(
  teamId: string,
  orgId: string,
): Promise<TeamProfileData | null> {
  const supabase = getSupabase();

  const { data: team, error } = await supabase
    .from("teams")
    .select(
      "id, full_name, short_name, abbreviation, logo_url, primary_color, organization_id",
    )
    .eq("id", teamId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (error || !team) {
    if (error) console.error("[getTeamProfile]", error.message);
    return null;
  }

  const { data: editionTeam } = await supabase
    .from("edition_teams")
    .select("edition_id")
    .eq("team_id", teamId)
    .order("edition_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  const editionId = editionTeam?.edition_id as string | undefined;

  const [squadResult, statsResult, phaseIds] = await Promise.all([
    supabase
      .from("athlete_team_stints")
      .select(
        `
        athletes(id, full_name, surname, photo_url, player_positions(full_name, abbreviation))
      `,
      )
      .eq("team_id", teamId)
      .eq("is_current", true),
    editionId
      ? supabase
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
            teams(full_name, abbreviation, logo_url)
          `,
          )
          .eq("edition_id", editionId)
          .eq("team_id", teamId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    getPhaseIdsForOrg(orgId),
  ]);

  const squad: (Athlete & { id: string })[] = [];
  for (const row of squadResult.data ?? []) {
    const a = row.athletes as (Athlete & { id: string }) | (Athlete & { id: string })[] | null;
    if (a && !Array.isArray(a) && a.id) squad.push(a);
    if (Array.isArray(a)) {
      for (const x of a) {
        if (x.id) squad.push(x as Athlete & { id: string });
      }
    }
  }

  let recentMatches: Match[] = [];
  if (phaseIds.length) {
    const { data: matchesData } = await supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("phase_id", phaseIds)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false })
      .limit(5);

    recentMatches = (matchesData as Match[] | null) ?? [];
  }

  return {
    team: team as Team & { id: string },
    squad,
    editionStats: (statsResult.data as TeamEditionStats | null) ?? null,
    recentMatches,
  };
}
