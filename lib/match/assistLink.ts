import {
  isAssistActionType,
  periodsMatch,
} from "@/lib/match/actionTypes";
import type { MatchAction } from "@/lib/types";

function minutesMatch(
  goalMinute: number | null,
  assistMinute: number | null,
): boolean {
  if (goalMinute == null || assistMinute == null) return true;
  return goalMinute === assistMinute;
}

function assistFromGoalRow(
  goal: Pick<
    MatchAction,
    "secondary_athlete_id" | "secondary_athletes" | "athletes"
  >,
): MatchAction | null {
  if (!goal.secondary_athlete_id && !goal.secondary_athletes) return null;
  return {
    id: `${goal.secondary_athlete_id ?? "secondary"}-assist`,
    match_id: "",
    team_id: "",
    action_type: "assist",
    minute: null,
    period: null,
    primary_athlete_id: goal.secondary_athlete_id,
    athletes: goal.secondary_athletes ?? null,
  };
}

/** Localiza a assistência ligada a um gol. */
export function findAssistForGoal(
  actions: MatchAction[],
  goal: Pick<
    MatchAction,
    | "id"
    | "team_id"
    | "minute"
    | "period"
    | "secondary_athlete_id"
    | "secondary_athletes"
  >,
): MatchAction | null {
  const embedded = assistFromGoalRow(goal);
  if (embedded?.athletes || embedded?.primary_athlete_id) return embedded;

  const candidates = actions.filter(
    (a) =>
      a.id !== goal.id &&
      isAssistActionType(a.action_type) &&
      a.team_id === goal.team_id,
  );

  const strict = candidates.find(
    (a) =>
      periodsMatch(a.period, goal.period, a.minute, goal.minute) &&
      minutesMatch(goal.minute, a.minute),
  );
  if (strict) return strict;

  const byMinute = candidates.find(
    (a) =>
      minutesMatch(goal.minute, a.minute) &&
      periodsMatch(a.period, goal.period, a.minute, goal.minute),
  );
  if (byMinute) return byMinute;

  return null;
}

export function assistSurnameForGoal(
  actions: MatchAction[],
  goal: Pick<
    MatchAction,
    | "id"
    | "team_id"
    | "minute"
    | "period"
    | "secondary_athlete_id"
    | "secondary_athletes"
  >,
  format: (fullName: string, surname: string | null) => string,
): string | null {
  const assist = findAssistForGoal(actions, goal);
  if (!assist?.athletes) return null;
  return format(assist.athletes.full_name, assist.athletes.surname);
}
