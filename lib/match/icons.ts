import {
  isFifthFoulActionType,
  isFoulActionType,
  isPenaltyMissedActionType,
  isRedCardActionType,
  isStrictGoalActionType,
  isSubstitutionActionType,
  isTwoMinActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
  normalizeActionType,
} from "@/lib/match/actionTypes";
import type { MatchAction } from "@/lib/types";

/** Ícones em `public/match/icons/` (origem: Desktop/svg). */
export const MATCH_ICONS = {
  goal: "/match/icons/goal.svg",
  ownGoal: "/match/icons/own-goal.svg",
  ball: "/match/icons/ball.svg",
  yellowCard: "/match/icons/yellow-card.svg",
  redCard: "/match/icons/red-card.svg",
  yellowRedCard: "/match/icons/yellow-red-card.svg",
  substitution: "/match/icons/substitution.svg",
  foul: "/match/icons/foul.svg",
  twoMin: "/match/icons/two-min.svg",
  assist: "/match/icons/assist.svg",
  penaltyMissed: "/match/icons/penalty-missed.svg",
} as const;

export type MatchIconAsset = keyof typeof MATCH_ICONS;

export type MatchIconKind = MatchIconAsset | "penalty" | "default";

const CARD_ICON_KINDS = new Set<MatchIconKind>([
  "yellowCard",
  "redCard",
  "yellowRedCard",
]);

export function isCardIconKind(kind: MatchIconKind): boolean {
  return CARD_ICON_KINDS.has(kind);
}

export function resolveMatchIconKind(
  action: Pick<MatchAction, "action_type" | "goal_type" | "is_own_goal">,
): MatchIconKind {
  if (isStrictGoalActionType(action.action_type)) {
    return "ball";
  }

  if (isPenaltyMissedActionType(action.action_type)) {
    return "penaltyMissed";
  }

  if (isYellowCardActionType(action.action_type)) return "yellowCard";
  if (isYellowRedCardActionType(action.action_type)) return "yellowRedCard";
  if (isRedCardActionType(action.action_type)) return "redCard";
  if (isSubstitutionActionType(action.action_type)) return "substitution";
  if (isFoulActionType(action.action_type) || isFifthFoulActionType(action.action_type)) {
    return "foul";
  }
  if (isTwoMinActionType(action.action_type)) return "twoMin";

  const t = normalizeActionType(action.action_type);
  if (t === "assist" || t === "assistencia" || t.includes("assist")) {
    return "assist";
  }

  return "ball";
}

export function matchIconSrc(kind: MatchIconKind): string {
  if (kind === "penalty") return MATCH_ICONS.goal;
  if (kind === "default") return MATCH_ICONS.ball;
  return MATCH_ICONS[kind];
}
