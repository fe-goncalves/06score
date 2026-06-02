import type { Match } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

export type H2HResult = "win" | "loss" | "draw";

export function getH2HResult(
  match: Match,
  perspectiveTeamId: string,
): H2HResult | null {
  const isTeamA = match.team_a_id === perspectiveTeamId;
  const isTeamB = match.team_b_id === perspectiveTeamId;
  if (!isTeamA && !isTeamB) return null;

  const myScore = isTeamA ? (match.score_a ?? 0) : (match.score_b ?? 0);
  const theirScore = isTeamA ? (match.score_b ?? 0) : (match.score_a ?? 0);

  if (myScore > theirScore) return "win";
  if (myScore < theirScore) return "loss";
  return "draw";
}

export interface MatchH2HSummary {
  matches: Match[];
  teamAWins: number;
  teamBWins: number;
  draws: number;
  teamAGoals: number;
  teamBGoals: number;
}

function scoreForTeam(
  match: Match,
  teamId: string,
): { scored: number; conceded: number } | null {
  const aId = match.team_a_id;
  const bId = match.team_b_id;
  if (!aId || !bId) return null;
  const sa = match.score_a ?? 0;
  const sb = match.score_b ?? 0;
  if (teamId === aId) return { scored: sa, conceded: sb };
  if (teamId === bId) return { scored: sb, conceded: sa };
  return null;
}

export function buildMatchH2H(
  matches: Match[],
  teamAId: string,
  teamBId: string,
  excludeMatchId?: string,
): MatchH2HSummary {
  let teamAWins = 0;
  let teamBWins = 0;
  let draws = 0;
  let teamAGoals = 0;
  let teamBGoals = 0;

  const finished = matches.filter(
    (m) =>
      m.id !== excludeMatchId &&
      isMatchFinished(m.status) &&
      ((m.team_a_id === teamAId && m.team_b_id === teamBId) ||
        (m.team_a_id === teamBId && m.team_b_id === teamAId)),
  );

  for (const m of finished) {
    const forA = scoreForTeam(m, teamAId);
    if (!forA) continue;
    teamAGoals += forA.scored;
    teamBGoals += forA.conceded;
    if (forA.scored > forA.conceded) teamAWins += 1;
    else if (forA.scored < forA.conceded) teamBWins += 1;
    else draws += 1;
  }

  return {
    matches: finished,
    teamAWins,
    teamBWins,
    draws,
    teamAGoals,
    teamBGoals,
  };
}
