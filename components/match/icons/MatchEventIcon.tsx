import { MatchIcon, type MatchIconName } from "@/components/match/icons/MatchIcon";
import type { MatchAction } from "@/lib/types";
import {
  isCardIconKind,
  resolveMatchIconKind,
  type MatchIconKind,
} from "@/lib/match/icons";

interface MatchEventIconProps {
  action: Pick<MatchAction, "action_type" | "goal_type" | "is_own_goal">;
  className?: string;
  size?: number;
  iconKind?: MatchIconKind;
}

const KIND_TO_ICON: Record<MatchIconKind, MatchIconName> = {
  goal: "ballGoal",
  ownGoal: "ownGoal",
  ball: "ball",
  yellowCard: "yellowCard",
  redCard: "redCard",
  yellowRedCard: "yellowRedCard",
  substitution: "substitution",
  foul: "foul",
  twoMin: "twoMin",
  assist: "assist",
  penaltyMissed: "penaltyMissed",
  penalty: "penalty",
  default: "ball",
};

export function MatchEventIcon({
  action,
  className = "",
  size = 18,
  iconKind,
}: MatchEventIconProps) {
  const kind = iconKind ?? resolveMatchIconKind(action);
  const name = KIND_TO_ICON[kind] ?? "ball";
  const isCard = isCardIconKind(kind);

  return (
    <span
      className={`match-event-icon match-event-icon--${kind} ${isCard ? "" : "match-event-icon--muted"} ${className}`.trim()}
      aria-hidden
    >
      <MatchIcon name={name} size={size} tinted={!isCard} />
    </span>
  );
}
