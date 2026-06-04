import { getSupabase } from "@/lib/supabase";
import type { TeamEditionStats } from "@/lib/types";
import { sortStandings, statsToStandings } from "@/lib/utils";

/** Posição na tabela de cada edição em que o time participou (1 = líder). */
export async function fetchTeamEditionPositions(
  teamId: string,
  editionIds: string[],
): Promise<Record<string, number | null>> {
  const uniqueIds = [...new Set(editionIds.filter(Boolean))];
  const result: Record<string, number | null> = {};
  if (!uniqueIds.length) return result;

  const supabase = getSupabase();
  const { data, error } = await supabase
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
      teams ( id, full_name, short_name, abbreviation, logo_url, primary_color )
    `,
    )
    .in("edition_id", uniqueIds);

  if (error) {
    console.error("[fetchTeamEditionPositions]", error.message);
    for (const id of uniqueIds) result[id] = null;
    return result;
  }

  const byEdition = new Map<string, TeamEditionStats[]>();
  for (const raw of data ?? []) {
    const editionId = raw.edition_id as string;
    const teamsRaw = raw.teams as TeamEditionStats["teams"] | TeamEditionStats["teams"][] | null;
    const team = Array.isArray(teamsRaw) ? teamsRaw[0] : teamsRaw;
    if (!team) continue;
    const row: TeamEditionStats = {
      edition_id: editionId,
      team_id: raw.team_id as string,
      matches_played: Number(raw.matches_played) || 0,
      wins: Number(raw.wins) || 0,
      draws: Number(raw.draws) || 0,
      losses: Number(raw.losses) || 0,
      goals_scored: Number(raw.goals_scored) || 0,
      goals_conceded: Number(raw.goals_conceded) || 0,
      points: Number(raw.points) || 0,
      yellow_cards: Number(raw.yellow_cards) || 0,
      red_cards: Number(raw.red_cards) || 0,
      teams: team,
    };
    const list = byEdition.get(editionId) ?? [];
    list.push(row);
    byEdition.set(editionId, list);
  }

  for (const editionId of uniqueIds) {
    const stats = byEdition.get(editionId) ?? [];
    if (!stats.length) {
      result[editionId] = null;
      continue;
    }
    const standings = statsToStandings(stats);
    const place = standings.find((r) => r.team_id === teamId)?.position ?? null;
    result[editionId] = place;
  }

  return result;
}
