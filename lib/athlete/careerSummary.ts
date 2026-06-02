import type {
  AthleteCareerStats,
  AthleteCareerSummary,
  AthleteEditionStatRow,
  AthleteProfileData,
  StaffCareerStats,
  Team,
} from "@/lib/types";

type TeamSnippet = Pick<Team, "id" | "full_name" | "short_name" | "abbreviation" | "logo_url">;

function sumEditionStats(rows: AthleteEditionStatRow[], staff = false) {
  return rows.reduce(
    (acc, row) => ({
      matches: acc.matches + (Number(row.matches_played) || 0),
      goals: acc.goals + (staff ? Number(row.wins ?? row.goals) || 0 : Number(row.goals) || 0),
      assists:
        acc.assists + (staff ? Number(row.draws ?? row.assists) || 0 : Number(row.assists) || 0),
      losses: acc.losses + (staff ? Number(row.losses ?? row.motm_count) || 0 : 0),
      yellow_cards: acc.yellow_cards + (Number(row.yellow_cards) || 0),
      red_cards: acc.red_cards + (Number(row.red_cards) || 0),
    }),
    { matches: 0, goals: 0, assists: 0, losses: 0, yellow_cards: 0, red_cards: 0 },
  );
}

/** Totais exibidos na aba Informações — prioriza edições + presenças em jogos. */
export function buildAthleteCareerSummary(
  profile: Pick<
    AthleteProfileData,
    "editionStats" | "careerStats" | "recentMatches" | "teamAwards"
  >,
): AthleteCareerSummary {
  const fromEditions = sumEditionStats(profile.editionStats);
  const presenceMatches = profile.recentMatches.length;
  const cs: AthleteCareerStats | null = profile.careerStats;
  const hasEditionRows = profile.editionStats.length > 0;

  const statFromEditions = (editionVal: number, careerVal: number | undefined) =>
    hasEditionRows ? editionVal : (careerVal ?? 0);

  const matches =
    presenceMatches > 0
      ? presenceMatches
      : statFromEditions(fromEditions.matches, cs?.total_matches);

  return {
    matches,
    goals: statFromEditions(fromEditions.goals, cs?.total_goals),
    assists: statFromEditions(fromEditions.assists, cs?.total_assists),
    yellow_cards: statFromEditions(fromEditions.yellow_cards, cs?.total_yellow_cards),
    red_cards: statFromEditions(fromEditions.red_cards, cs?.total_red_cards),
    titles: profile.teamAwards.length,
  };
}

/** Resumo da aba Informações — comissão técnica (V/E/D). */
export function buildStaffCareerSummary(
  profile: Pick<
    AthleteProfileData,
    "editionStats" | "recentMatches" | "teamAwards"
  > & { careerStats: StaffCareerStats | null },
): AthleteCareerSummary {
  const fromEditions = sumEditionStats(profile.editionStats, true);
  const presenceMatches = profile.recentMatches.length;
  const cs = profile.careerStats;
  const hasEditionRows = profile.editionStats.length > 0;

  const statFromEditions = (editionVal: number, careerVal: number | undefined) =>
    hasEditionRows ? editionVal : (careerVal ?? 0);

  const matches =
    presenceMatches > 0
      ? presenceMatches
      : statFromEditions(fromEditions.matches, cs?.total_matches);

  return {
    matches,
    goals: 0,
    assists: 0,
    wins: statFromEditions(fromEditions.goals, cs?.total_wins),
    draws: statFromEditions(fromEditions.assists, cs?.total_draws),
    losses: statFromEditions(fromEditions.losses, cs?.total_losses),
    yellow_cards: statFromEditions(fromEditions.yellow_cards, cs?.total_yellow_cards),
    red_cards: statFromEditions(fromEditions.red_cards, cs?.total_red_cards),
    titles: profile.teamAwards.filter((a) => a.award_type === "champion").length,
  };
}

/** Equipe inscrita por edição (roster + stats por edição). */
export function buildTeamsByEdition(
  profile: Pick<AthleteProfileData, "rosterEntries" | "editionStats">,
): Map<string, TeamSnippet> {
  const map = new Map<string, TeamSnippet>();

  for (const entry of profile.rosterEntries) {
    const team = entry.edition_teams?.teams;
    if (entry.edition_id && team?.id) {
      map.set(entry.edition_id, team);
    }
  }

  for (const row of profile.editionStats) {
    if (row.edition_id && row.teams?.id && !map.has(row.edition_id)) {
      map.set(row.edition_id, row.teams);
    }
  }

  return map;
}
