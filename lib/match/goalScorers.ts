import { isPenaltyGoalType, isStrictGoalActionType } from "@/lib/match/actionTypes";
import type { MatchAction } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

export type GoalScorerTag = "" | "(P.)" | "(ST)" | "(GC)";

export interface GoalScorerPart {
  id: string;
  surname: string;
  tag: GoalScorerTag;
  minute: string;
}

function goalTag(action: MatchAction): GoalScorerTag {
  if (isPenaltyGoalType(action.goal_type)) return "(P.)";
  if (action.is_own_goal === true) return "(GC)";
  const gt = action.goal_type?.toLowerCase() ?? "";
  if (
    gt === "shootout" ||
    gt === "shoot_out" ||
    gt === "shoot-out" ||
    gt === "st"
  ) {
    return "(ST)";
  }
  return "";
}

function toScorerPart(action: MatchAction): GoalScorerPart | null {
  if (!isStrictGoalActionType(action.action_type) || action.minute == null) {
    return null;
  }
  const athlete = action.athletes;
  return {
    id: action.id,
    surname: athlete
      ? athleteSurnameLabel(athlete.full_name, athlete.surname)
      : "—",
    tag: goalTag(action),
    minute: `${action.minute}'`,
  };
}

/** Recap do hero: `team_id` já é a equipe que marcou (inclusive gol contra). */
export function getGoalScorerParts(
  actions: MatchAction[],
  teamAId: string,
  teamBId: string,
): { home: GoalScorerPart[]; away: GoalScorerPart[] } {
  const home: GoalScorerPart[] = [];
  const away: GoalScorerPart[] = [];

  for (const goal of actions) {
    if (!isStrictGoalActionType(goal.action_type)) continue;
    const part = toScorerPart(goal);
    if (!part) continue;

    if (goal.team_id === teamAId) home.push(part);
    else if (goal.team_id === teamBId) away.push(part);
  }

  const byMinuteDesc = (a: GoalScorerPart, b: GoalScorerPart) =>
    parseInt(b.minute, 10) - parseInt(a.minute, 10);

  return {
    home: home.sort(byMinuteDesc),
    away: away.sort(byMinuteDesc),
  };
}

/** Casa: SOBRENOME (tag), minuto' */
export function formatHomeScorerLine(part: GoalScorerPart): string {
  const name = part.tag ? `${part.surname} ${part.tag}` : part.surname;
  return `${name}, ${part.minute}`;
}

/** Visitante: minuto', SOBRENOME (tag) */
export function formatAwayScorerLine(part: GoalScorerPart): string {
  const name = part.tag ? `${part.surname} ${part.tag}` : part.surname;
  return `${part.minute}, ${name}`;
}
