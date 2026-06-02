import {
  isPenaltyGoalType,
  isPenaltyMissedActionType,
  isRedCardActionType,
  isShootoutGoalType,
  isStrictGoalActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
} from "@/lib/match/actionTypes";
import { getMatchFoulsTotal } from "@/lib/match/periodFouls";
import type { MatchTeamPeriodStat } from "@/lib/match/periodFouls";
import type { MatchAction } from "@/lib/types";

export interface MatchStatRow {
  id: string;
  label: string;
  home: number;
  away: number;
  homeConverted?: number;
  awayConverted?: number;
}

function countByTeam(
  actions: MatchAction[],
  teamId: string,
  predicate: (a: MatchAction) => boolean,
): number {
  return actions.filter((a) => a.team_id === teamId && predicate(a)).length;
}

interface AttemptStat {
  attempts: number;
  converted: number;
}

function countPenaltyAttempts(
  actions: MatchAction[],
  teamId: string,
): AttemptStat {
  const teamActions = actions.filter((a) => a.team_id === teamId);
  const converted = teamActions.filter(
    (a) =>
      isStrictGoalActionType(a.action_type) &&
      isPenaltyGoalType(a.goal_type),
  ).length;
  const missed = teamActions.filter(
    (a) =>
      isPenaltyMissedActionType(a.action_type) &&
      !isShootoutGoalType(a.goal_type),
  ).length;
  return { attempts: converted + missed, converted };
}

function countShootoutAttempts(
  actions: MatchAction[],
  teamId: string,
): AttemptStat {
  const teamActions = actions.filter((a) => a.team_id === teamId);
  const converted = teamActions.filter(
    (a) =>
      isStrictGoalActionType(a.action_type) &&
      isShootoutGoalType(a.goal_type),
  ).length;
  const missed = teamActions.filter(
    (a) =>
      isPenaltyMissedActionType(a.action_type) &&
      isShootoutGoalType(a.goal_type),
  ).length;
  return { attempts: converted + missed, converted };
}

export function computeMatchStatRows(
  actions: MatchAction[],
  teamAId: string,
  teamBId: string,
  teamStats: MatchTeamPeriodStat[],
): MatchStatRow[] {
  const isGoal = (a: MatchAction) => isStrictGoalActionType(a.action_type);
  const isYellow = (a: MatchAction) => isYellowCardActionType(a.action_type);
  const isRed = (a: MatchAction) =>
    isRedCardActionType(a.action_type) ||
    isYellowRedCardActionType(a.action_type);

  const penaltiesA = countPenaltyAttempts(actions, teamAId);
  const penaltiesB = countPenaltyAttempts(actions, teamBId);
  const shootoutsA = countShootoutAttempts(actions, teamAId);
  const shootoutsB = countShootoutAttempts(actions, teamBId);

  const rows: MatchStatRow[] = [
    {
      id: "goals",
      label: "Gols",
      home: countByTeam(actions, teamAId, isGoal),
      away: countByTeam(actions, teamBId, isGoal),
    },
    {
      id: "yellow_cards",
      label: "Cartões amarelos",
      home: countByTeam(actions, teamAId, isYellow),
      away: countByTeam(actions, teamBId, isYellow),
    },
    {
      id: "red_cards",
      label: "Cartões vermelhos",
      home: countByTeam(actions, teamAId, isRed),
      away: countByTeam(actions, teamBId, isRed),
    },
    {
      id: "fouls",
      label: "Faltas",
      home: getMatchFoulsTotal(teamStats, teamAId),
      away: getMatchFoulsTotal(teamStats, teamBId),
    },
  ];

  if (penaltiesA.attempts > 0 || penaltiesB.attempts > 0) {
    rows.push({
      id: "penalties",
      label: "Pênaltis",
      home: penaltiesA.attempts,
      away: penaltiesB.attempts,
      homeConverted: penaltiesA.converted,
      awayConverted: penaltiesB.converted,
    });
  }

  if (shootoutsA.attempts > 0 || shootoutsB.attempts > 0) {
    rows.push({
      id: "shootouts",
      label: "Shoot-outs",
      home: shootoutsA.attempts,
      away: shootoutsB.attempts,
      homeConverted: shootoutsA.converted,
      awayConverted: shootoutsB.converted,
    });
  }

  return rows;
}

export function hasVisibleMatchStats(rows: MatchStatRow[]): boolean {
  return rows.some(
    (r) =>
      r.home > 0 ||
      r.away > 0 ||
      (r.homeConverted ?? 0) > 0 ||
      (r.awayConverted ?? 0) > 0,
  );
}
