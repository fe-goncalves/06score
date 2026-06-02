import type { MatchAthleteRating, MatchLineup } from "@/lib/types";

export function resolveMotmRating(
  athleteId: string,
  ratings: MatchAthleteRating[],
  lineups: MatchLineup[],
): number | null {
  const fromRating = ratings.find((r) => r.athlete_id === athleteId)?.rating;
  if (fromRating != null && Number.isFinite(fromRating)) return fromRating;

  const fromLineup = lineups.find((l) => l.athlete_id === athleteId)?.match_rating;
  if (fromLineup != null && Number.isFinite(fromLineup)) return fromLineup;

  return null;
}

export function motmTeamLabel(
  team: { full_name: string; short_name?: string | null; abbreviation?: string | null },
): string {
  return team.abbreviation ?? team.short_name ?? team.full_name;
}
