export type LineupRatingTone =
  | "red"
  | "orange"
  | "yellow"
  | "blue"
  | "green"
  | "perfect";

/** Faixas visuais das notas na aba Formações. */
export function getLineupRatingTone(rating: number): LineupRatingTone {
  const value = Math.round(rating * 10) / 10;

  if (value >= 10) return "perfect";
  if (value >= 9.0) return "green";
  if (value >= 7.0) return "blue";
  if (value >= 6.0) return "yellow";
  if (value >= 5.0) return "orange";
  return "red";
}

export function lineupRatingClassName(tone: LineupRatingTone): string {
  return `match-lineup-rating match-lineup-rating--${tone}`;
}
