import type { Match, Phase, StandingRow, Team, TeamEditionStats } from "@/lib/types";
import { computeStandingsFromMatches, statsToStandings } from "@/lib/utils";

function teamsMapFromMatches(matches: Match[]): Record<string, Team> {
  const map: Record<string, Team> = {};
  for (const m of matches) {
    if (m.team_a_id && m.teams_a) {
      map[m.team_a_id] = { ...m.teams_a, id: m.team_a_id };
    }
    if (m.team_b_id && m.teams_b) {
      map[m.team_b_id] = { ...m.teams_b, id: m.team_b_id };
    }
  }
  return map;
}

export function computeHomePhaseStandings(
  phase: Phase | null,
  phaseMatches: Match[],
  teamEditionStats: TeamEditionStats[],
): StandingRow[] {
  if (!phase) {
    return statsToStandings(teamEditionStats, phaseMatches);
  }

  if (phase.phase_type === "knockout" || phase.phase_type === "conference") {
    return [];
  }

  const teamIds = [
    ...new Set(
      phaseMatches.flatMap((m) =>
        [m.team_a_id, m.team_b_id].filter((id): id is string => Boolean(id)),
      ),
    ),
  ];
  const teamsMap = teamsMapFromMatches(phaseMatches);

  if (teamIds.length > 0) {
    return computeStandingsFromMatches(
      phaseMatches,
      teamIds,
      teamsMap,
      teamEditionStats,
    );
  }

  return statsToStandings(teamEditionStats, phaseMatches);
}
