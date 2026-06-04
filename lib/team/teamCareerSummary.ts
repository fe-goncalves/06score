import type { AthleteAwardEntry, TeamCareerSummary, TeamEditionStatRow } from "@/lib/types";

export function countTeamChampionTitles(teamAwards: AthleteAwardEntry[]): number {
  return teamAwards.filter((row) => row.award_type === "champion").length;
}

function sumEditionStats(rows: TeamEditionStatRow[]) {
  return rows.reduce(
    (acc, row) => ({
      matches: acc.matches + row.matches_played,
      wins: acc.wins + row.wins,
      draws: acc.draws + row.draws,
      losses: acc.losses + row.losses,
      goals_scored: acc.goals_scored + row.goals_scored,
      goals_conceded: acc.goals_conceded + row.goals_conceded,
      points: acc.points + row.points,
    }),
    {
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      points: 0,
    },
  );
}

export function buildTeamCareerSummary(input: {
  editionStats: TeamEditionStatRow[];
  teamAwards: AthleteAwardEntry[];
  presenceMatches: number;
}): TeamCareerSummary {
  const fromEditions = sumEditionStats(input.editionStats);
  const hasEditionRows = input.editionStats.length > 0;

  const matches =
    input.presenceMatches > 0
      ? input.presenceMatches
      : hasEditionRows
        ? fromEditions.matches
        : 0;

  return {
    matches,
    wins: fromEditions.wins,
    draws: fromEditions.draws,
    losses: fromEditions.losses,
    goals_scored: fromEditions.goals_scored,
    goals_conceded: fromEditions.goals_conceded,
    points: fromEditions.points,
    titles: countTeamChampionTitles(input.teamAwards),
  };
}
