import { buildTeamCareerSummary } from "@/lib/team/teamCareerSummary";
import { fetchTeamEditionStats } from "@/lib/team/fetchTeamEditionStats";
import { getActiveEditionId } from "@/lib/data/home";
import { fetchEditionTeamsForEdition, getPhaseIdsForOrg } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  Athlete,
  AthleteAwardEntry,
  AthleteRecentMatch,
  Match,
  Team,
  TeamListItem,
  TeamProfileData,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

const MATCH_LIMIT = 40;

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

  const [squadResult, editionStats, awardsResult, phaseIds] = await Promise.all([
    supabase
      .from("athlete_team_stints")
      .select(
        `
        athletes(id, full_name, surname, photo_url, player_positions(full_name, abbreviation))
      `,
      )
      .eq("team_id", teamId)
      .eq("is_current", true),
    fetchTeamEditionStats(teamId),
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
          id, full_name, abbreviation, logo_url
        )
      `,
      )
      .eq("winning_team_id", teamId)
      .in("award_type", ["champion", "runner_up", "third_place"]),
    getPhaseIdsForOrg(orgId),
  ]);

  if (squadResult.error) {
    console.error("[getTeamProfile:squad]", squadResult.error.message);
  }
  if (awardsResult.error) {
    console.error("[getTeamProfile:awards]", awardsResult.error.message);
  }

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

  squad.sort((a, b) =>
    (a.surname ?? a.full_name).localeCompare(b.surname ?? b.full_name, "pt-BR"),
  );

  const teamAwards = (awardsResult.data as AthleteAwardEntry[] | null) ?? [];

  let recentMatches: AthleteRecentMatch[] = [];
  if (phaseIds.length) {
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("phase_id", phaseIds)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false })
      .limit(MATCH_LIMIT);

    if (matchesError) {
      console.error("[getTeamProfile:matches]", matchesError.message);
    } else {
      recentMatches = ((matchesData as Match[] | null) ?? []).map((match) => ({
        match: {
          ...match,
          athlete_team_id: teamId,
        } as Match,
        rating: null,
        isMotm: false,
        actions: [],
      }));
    }
  }

  const careerSummary = buildTeamCareerSummary({
    editionStats,
    teamAwards,
    presenceMatches: recentMatches.length,
  });

  return {
    team: team as Team & { id: string },
    careerSummary,
    squad,
    editionStats,
    teamAwards,
    recentMatches,
  };
}
