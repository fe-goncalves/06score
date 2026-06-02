import type { MatchAction } from "@/lib/types";
import {
  isCardIconKind,
  matchIconSrc,
  resolveMatchIconKind,
  type MatchIconKind,
} from "@/lib/match/icons";

interface MatchEventIconProps {
  action: Pick<MatchAction, "action_type" | "goal_type" | "is_own_goal">;
  className?: string;
  size?: number;
  /** Força ícone (ex.: bola em gols, pênalti ao lado). */
  iconKind?: MatchIconKind;
}

export function MatchEventIcon({
  action,
  className = "",
  size = 18,
  iconKind,
}: MatchEventIconProps) {
  const kind = iconKind ?? resolveMatchIconKind(action);
  const src = matchIconSrc(kind);
  const muted = !isCardIconKind(kind);

  return (
    <span
      className={`match-event-icon match-event-icon--${kind} ${muted ? "match-event-icon--muted" : ""} ${className}`.trim()}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="match-event-icon-img"
        decoding="async"
      />
    </span>
  );
}
