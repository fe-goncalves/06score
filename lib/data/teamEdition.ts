import { getPhaseIdsForEdition } from "@/lib/data/shared";
import { teamEditionEnrollmentLabel } from "@/lib/team/editionLabels";
import { fetchTeamEditionPositions } from "@/lib/team/fetchTeamEditionPositions";
import { getSupabase } from "@/lib/supabase";
import type {
  Athlete,
  AthleteRecentMatch,
  Match,
  Team,
  TeamEditionStatRow,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

export interface TeamEditionPageData {
  team: Team & { id: string };
  editionId: string;
  editionLabel: string;
  editionStat: TeamEditionStatRow | null;
  tablePosition: number | null;
  squad: (Athlete & { id: string })[];
  matches: AthleteRecentMatch[];
}

export async function getTeamEditionPage(
  teamId: string,
  editionId: string,
  orgId: string,
): Promise<TeamEditionPageData | null> {
  const supabase = getSupabase();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(
      "id, full_name, short_name, abbreviation, logo_url, primary_color, organization_id, gender",
    )
    .eq("id", teamId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (teamError || !team) {
    if (teamError) console.error("[getTeamEditionPage:team]", teamError.message);
    return null;
  }

  const { data: editionTeam, error: etError } = await supabase
    .from("edition_teams")
    .select("id, edition_id, team_id")
    .eq("team_id", teamId)
    .eq("edition_id", editionId)
    .maybeSingle();

  if (etError) {
    console.error("[getTeamEditionPage:edition_teams]", etError.message);
  }
  if (!editionTeam) return null;

  const editionTeamId = editionTeam.id as string;

  const [rosterResult, phaseIds, positionsMap] = await Promise.all([
    supabase
      .from("edition_roster_entries")
      .select(
        `
        athletes (
          id,
          full_name,
          surname,
          photo_url,
          birth_date,
          nationality,
          player_positions ( full_name, abbreviation )
        )
      `,
      )
      .eq("edition_team_id", editionTeamId)
      .or("member_type.eq.athlete,member_type.is.null")
      .eq("status", "approved"),
    getPhaseIdsForEdition(editionId),
    fetchTeamEditionPositions(teamId, [editionId]),
  ]);

  if (rosterResult.error) {
    console.error("[getTeamEditionPage:roster]", rosterResult.error.message);
  }

  const squad: (Athlete & { id: string })[] = [];
  for (const row of rosterResult.data ?? []) {
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

  let matches: AthleteRecentMatch[] = [];
  if (phaseIds.length) {
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("phase_id", phaseIds)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false });

    if (matchesError) {
      console.error("[getTeamEditionPage:matches]", matchesError.message);
    } else {
      matches = ((matchesData as unknown as Match[] | null) ?? []).map((match) => ({
        match: { ...match, athlete_team_id: teamId } as Match,
        rating: null,
        isMotm: false,
        actions: [],
      }));
    }
  }

  const { data: statRaw } = await supabase
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
      competition_editions (
        id,
        season_id,
        competition_id,
        seasons ( id, name, years ( id, value ) ),
        competitions ( id, full_name, short_name, logo_url )
      )
    `,
    )
    .eq("team_id", teamId)
    .eq("edition_id", editionId)
    .maybeSingle();

  let editionStat: TeamEditionStatRow | null = null;
  if (statRaw) {
    const ce = statRaw.competition_editions as TeamEditionStatRow["competition_editions"];
    editionStat = {
      edition_id: editionId,
      team_id: teamId,
      matches_played: Number(statRaw.matches_played) || 0,
      wins: Number(statRaw.wins) || 0,
      draws: Number(statRaw.draws) || 0,
      losses: Number(statRaw.losses) || 0,
      goals_scored: Number(statRaw.goals_scored) || 0,
      goals_conceded: Number(statRaw.goals_conceded) || 0,
      points: Number(statRaw.points) || 0,
      competition_editions: Array.isArray(ce) ? ce[0] ?? null : ce,
    };
  }

  const editionLabel = editionStat
    ? teamEditionEnrollmentLabel(editionStat)
    : "Edição";

  return {
    team: team as Team & { id: string },
    editionId,
    editionLabel,
    editionStat,
    tablePosition: positionsMap[editionId] ?? null,
    squad,
    matches,
  };
}
