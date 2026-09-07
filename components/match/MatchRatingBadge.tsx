import {
  getLineupRatingTone,
  lineupRatingClassName,
} from "@/lib/match/lineupRatingTone";
import { formatRating } from "@/lib/utils";

interface MatchRatingBadgeProps {
  rating: number;
}

export function MatchRatingBadge({ rating }: MatchRatingBadgeProps) {
  if (!Number.isFinite(rating)) return null;

  const value = Math.round(rating * 10) / 10;
  const tone = getLineupRatingTone(value);

  return (
    <span className={`${lineupRatingClassName(tone)} tabular-nums`}>
      {formatRating(value)}
    </span>
  );
}
