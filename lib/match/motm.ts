import type { Match, MatchAthleteRating, MatchLineup, Team } from "@/lib/types";

function teamFromEditionTeamId(
  editionTeamId: string,
  lineups: MatchLineup[],
): Team | null {
  const row = lineups.find((l) => l.edition_team_id === editionTeamId);
  return row?.edition_teams?.teams ?? null;
}

/** Equipe em que o craque atuou nesta partida (escalação/nota), não o clube atual do atleta. */
export function resolveMotmTeam(
  athleteId: string,
  match: Pick<
    Match,
    "motm_team_id" | "motm_team" | "team_a_id" | "team_b_id"
  >,
  lineups: MatchLineup[],
  ratings: MatchAthleteRating[],
): Team | null {
  const motmLineup = lineups.find((l) => l.athlete_id === athleteId);
  const fromLineup = motmLineup?.edition_teams?.teams ?? null;
  if (fromLineup) return fromLineup;

  const motmRating = ratings.find((r) => r.athlete_id === athleteId);
  if (motmRating?.edition_team_id) {
    const fromRating = teamFromEditionTeamId(
      motmRating.edition_team_id,
      lineups,
    );
    if (fromRating) return fromRating;
  }

  const participantIds = new Set(
    [match.team_a_id, match.team_b_id].filter((id): id is string => Boolean(id)),
  );
  if (match.motm_team_id && participantIds.has(match.motm_team_id)) {
    return match.motm_team ?? null;
  }

  return null;
}

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
  const full = team.full_name?.trim();
  if (full) return full;
  return team.short_name?.trim() ?? team.abbreviation?.trim() ?? "—";
}
