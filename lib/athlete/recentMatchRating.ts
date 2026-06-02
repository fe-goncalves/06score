import type { MatchAthleteRating } from "@/lib/types";

export function ratingFromMaps(
  matchId: string,
  lineupRatings: Map<string, number>,
  athleteRatings: Map<string, number>,
): number | null {
  const fromAthlete = athleteRatings.get(matchId);
  if (fromAthlete != null && Number.isFinite(fromAthlete)) return fromAthlete;

  const fromLineup = lineupRatings.get(matchId);
  if (fromLineup != null && Number.isFinite(fromLineup)) return fromLineup;

  return null;
}

export function buildRatingMaps(
  lineupRows: { match_id: string; match_rating: number | null }[],
  ratingRows: MatchAthleteRating[],
): {
  lineupRatings: Map<string, number>;
  athleteRatings: Map<string, number>;
} {
  const lineupRatings = new Map<string, number>();
  for (const row of lineupRows) {
    if (row.match_rating != null && Number.isFinite(row.match_rating)) {
      lineupRatings.set(row.match_id, row.match_rating);
    }
  }

  const athleteRatings = new Map<string, number>();
  for (const row of ratingRows) {
    if (Number.isFinite(row.rating)) {
      athleteRatings.set(row.match_id, row.rating);
    }
  }

  return { lineupRatings, athleteRatings };
}
