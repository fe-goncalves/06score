export type LineupRatingTone =
  | "red"
  | "orange-red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "perfect";

/** Faixas Sofascore (heatmap) das notas na aba Formações. */
export function getLineupRatingTone(rating: number): LineupRatingTone {
  const value = Math.round(rating * 10) / 10;

  if (value >= 9.5) return "perfect";
  if (value >= 9.0) return "blue";
  if (value >= 8.0) return "teal";
  if (value >= 7.0) return "green";
  if (value >= 6.5) return "yellow";
  if (value >= 6.0) return "orange";
  if (value >= 5.0) return "orange-red";
  return "red";
}

export function lineupRatingClassName(tone: LineupRatingTone): string {
  return `match-lineup-rating match-lineup-rating--${tone}`;
}
