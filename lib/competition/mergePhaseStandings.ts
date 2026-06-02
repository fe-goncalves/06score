import type { Match, StandingRow } from "@/lib/types";
import { computeStandingsFromMatches } from "@/lib/utils";

/** Recalcula classificação com forma (e stats de jogos) a partir dos jogos da fase. */
export function standingsWithPhaseForm(
  standings: StandingRow[],
  phaseMatches: Match[],
): StandingRow[] {
  if (!phaseMatches.length || !standings.length) return standings;

  const teamIds = standings.map((r) => r.team_id);
  const teamsMap: Record<string, StandingRow["team"]> = {};
  for (const row of standings) {
    teamsMap[row.team_id] = row.team;
  }

  return computeStandingsFromMatches(phaseMatches, teamIds, teamsMap);
}
