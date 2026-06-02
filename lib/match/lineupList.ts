import {
  isAssistActionType,
  isFifthFoulActionType,
  isFoulActionType,
  isPenaltyGoalType,
  isPenaltyMissedActionType,
  isPeriodFoulSummaryAction,
  isRedCardActionType,
  isStrictGoalActionType,
  isSubstitutionActionType,
  isTwoMinActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
  normalizeActionType,
} from "@/lib/match/actionTypes";
import type { MatchIconKind } from "@/lib/match/icons";
import { resolveMatchIconKind } from "@/lib/match/icons";
import type { MatchAction, MatchLineup, MatchStaffLineup } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

export function lineupSurnameSortKey(
  fullName: string,
  surname: string | null,
): string {
  return athleteSurnameLabel(fullName, surname);
}

export function sortLineupsBySurname<T extends { athletes: { full_name: string; surname: string | null } | null }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    const nameA = a.athletes
      ? lineupSurnameSortKey(a.athletes.full_name, a.athletes.surname)
      : "";
    const nameB = b.athletes
      ? lineupSurnameSortKey(b.athletes.full_name, b.athletes.surname)
      : "";
    return nameA.localeCompare(nameB, "pt-BR");
  });
}

/** Goleiros primeiro; demais em ordem alfabética por sobrenome. */
export function sortLineupsForFormation(lineups: MatchLineup[]): MatchLineup[] {
  return [...lineups].sort((a, b) => {
    const gkA = a.played_as_goalkeeper ? 0 : 1;
    const gkB = b.played_as_goalkeeper ? 0 : 1;
    if (gkA !== gkB) return gkA - gkB;

    const nameA = a.athletes
      ? lineupSurnameSortKey(a.athletes.full_name, a.athletes.surname)
      : "";
    const nameB = b.athletes
      ? lineupSurnameSortKey(b.athletes.full_name, b.athletes.surname)
      : "";
    return nameA.localeCompare(nameB, "pt-BR");
  });
}

export function staffLineupSurnameLabel(staff: MatchStaffLineup): string {
  const person = staff.staff_members;
  if (person) {
    return lineupSurnameSortKey(person.full_name, person.surname);
  }
  return "Comissão técnica";
}

export function sortStaffBySurname(rows: MatchStaffLineup[]): MatchStaffLineup[] {
  return [...rows].sort((a, b) =>
    staffLineupSurnameLabel(a).localeCompare(staffLineupSurnameLabel(b), "pt-BR"),
  );
}

function isLineupActionVisible(action: MatchAction): boolean {
  if (isPeriodFoulSummaryAction(action.action_type)) return false;
  if (isAssistActionType(action.action_type)) return true;
  if (isStrictGoalActionType(action.action_type)) return true;
  if (isPenaltyMissedActionType(action.action_type)) return true;
  if (isYellowCardActionType(action.action_type)) return true;
  if (isRedCardActionType(action.action_type)) return true;
  if (isYellowRedCardActionType(action.action_type)) return true;
  if (isSubstitutionActionType(action.action_type)) return true;
  if (isFoulActionType(action.action_type) || isFifthFoulActionType(action.action_type)) {
    return false;
  }
  if (isTwoMinActionType(action.action_type)) return true;
  return false;
}

export function iconKindsForAction(action: MatchAction): MatchIconKind[] {
  if (isStrictGoalActionType(action.action_type)) {
    const kinds: MatchIconKind[] = ["ball"];
    if (isPenaltyGoalType(action.goal_type)) kinds.push("penalty");
    return kinds;
  }
  return [resolveMatchIconKind(action)];
}

export function getAthleteMatchActions(
  athleteId: string,
  actions: MatchAction[],
): MatchAction[] {
  return actions
    .filter(
      (a) =>
        a.primary_athlete_id === athleteId &&
        isLineupActionVisible(a) &&
        !isAssistActionType(a.action_type),
    )
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
}

export function getAthleteAssistActions(
  athleteId: string,
  actions: MatchAction[],
): MatchAction[] {
  return actions
    .filter(
      (a) =>
        a.primary_athlete_id === athleteId && isAssistActionType(a.action_type),
    )
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
}

function getGoalAssistIconCount(
  athleteId: string,
  actions: MatchAction[],
): number {
  let count = 0;
  for (const action of actions) {
    if (!isStrictGoalActionType(action.action_type)) continue;
    if (action.secondary_athlete_id === athleteId) count += 1;
  }
  return count;
}

export function buildAthleteActionIcons(
  athleteId: string,
  actions: MatchAction[],
): MatchIconKind[] {
  const kinds: MatchIconKind[] = [];

  for (const action of getAthleteMatchActions(athleteId, actions)) {
    if (isSubstitutionActionType(action.action_type)) continue;
    kinds.push(...iconKindsForAction(action));
  }
  for (const _assist of getAthleteAssistActions(athleteId, actions)) {
    kinds.push("assist");
  }
  const goalAssists = getGoalAssistIconCount(athleteId, actions);
  for (let i = 0; i < goalAssists; i += 1) {
    kinds.push("assist");
  }

  return kinds;
}

export function substitutionSubline(
  action: MatchAction,
): string | null {
  if (!isSubstitutionActionType(action.action_type)) return null;
  const out = action.secondary_athletes;
  if (out) {
    const name = athleteSurnameLabel(out.full_name, out.surname);
    return `Saiu: ${name}`;
  }
  return null;
}

export function substitutionMinuteLabel(
  action: MatchAction,
): string | null {
  if (!isSubstitutionActionType(action.action_type)) return null;
  return action.minute != null ? `${action.minute}'` : null;
}

function normalizeRating(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function resolveLineupRating(
  lineup: MatchLineup,
  ratingsMap: Map<string, number>,
): number | null {
  const fromRatings = normalizeRating(ratingsMap.get(lineup.athlete_id));
  if (fromRatings != null) return fromRatings;
  return normalizeRating(lineup.match_rating);
}

export function buildMatchRatingsMap(
  ratings: { athlete_id: string; rating: unknown }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of ratings) {
    const value = normalizeRating(row.rating);
    if (value != null) map.set(row.athlete_id, value);
  }
  return map;
}
