import type { TeamCareerSummary, TeamEditionStatRow } from "@/lib/types";
import { teamEditionEnrollmentLabel } from "@/lib/team/editionLabels";

export interface TeamStatsFilterState {
  year: string;
  seasonId: string;
  competitionId: string;
  phaseKey: string;
}

export interface TeamStatsFilterOptions {
  years: { id: string; label: string }[];
  seasons: { id: string; label: string }[];
  competitions: { id: string; label: string; logoUrl: string | null }[];
  editions: { id: string; label: string }[];
}

export interface TeamStatsNumericSlice {
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  goal_difference: number;
  points: number;
  yellow_cards: number;
  red_cards: number;
}

export interface TeamStatsSeasonGroup {
  key: string;
  seasonName: string;
  yearValue: number | null;
  summary: TeamStatsNumericSlice;
  teamLogoUrl: string | null;
  competitions: TeamEditionStatRow[];
}

export function getYearValue(row: TeamEditionStatRow): number | null {
  const value = row.competition_editions?.seasons?.years?.value;
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Number(value);
}

export function getCompetitionId(row: TeamEditionStatRow): string | null {
  return (
    row.competition_editions?.competition_id ??
    row.competition_editions?.competitions?.id ??
    null
  );
}

export function getSeasonId(row: TeamEditionStatRow): string | null {
  return (
    row.competition_editions?.seasons?.id ??
    row.competition_editions?.season_id ??
    null
  );
}

export function getSeasonName(row: TeamEditionStatRow): string | null {
  const name = row.competition_editions?.seasons?.name?.trim();
  return name || null;
}

function withGoalDifference(slice: Omit<TeamStatsNumericSlice, "goal_difference">): TeamStatsNumericSlice {
  return {
    ...slice,
    goal_difference: slice.goals_scored - slice.goals_conceded,
  };
}

function sumNumeric(rows: TeamEditionStatRow[]): TeamStatsNumericSlice {
  const base = rows.reduce(
    (acc, row) => ({
      matches_played: acc.matches_played + row.matches_played,
      wins: acc.wins + row.wins,
      draws: acc.draws + row.draws,
      losses: acc.losses + row.losses,
      goals_scored: acc.goals_scored + row.goals_scored,
      goals_conceded: acc.goals_conceded + row.goals_conceded,
      points: acc.points + row.points,
      yellow_cards: acc.yellow_cards + (row.yellow_cards ?? 0),
      red_cards: acc.red_cards + (row.red_cards ?? 0),
    }),
    {
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      points: 0,
      yellow_cards: 0,
      red_cards: 0,
    },
  );
  return withGoalDifference(base);
}

export function sliceFromEditionRow(row: TeamEditionStatRow): TeamStatsNumericSlice {
  return withGoalDifference({
    matches_played: row.matches_played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goals_scored: row.goals_scored,
    goals_conceded: row.goals_conceded,
    points: row.points,
    yellow_cards: row.yellow_cards ?? 0,
    red_cards: row.red_cards ?? 0,
  });
}

export function hasActiveStatsFilters(filters: TeamStatsFilterState): boolean {
  return (
    filters.year !== "all" ||
    filters.seasonId !== "all" ||
    filters.competitionId !== "all" ||
    filters.phaseKey !== "all"
  );
}

export function buildTotalsFromEditionRows(
  rows: TeamEditionStatRow[],
): TeamStatsNumericSlice {
  return sumNumeric(rows);
}

export function buildCareerTotalsRow(
  summary: TeamCareerSummary,
  cardTotals?: { yellow_cards: number; red_cards: number },
): TeamStatsNumericSlice {
  return withGoalDifference({
    matches_played: summary.matches,
    wins: summary.wins,
    draws: summary.draws,
    losses: summary.losses,
    goals_scored: summary.goals_scored,
    goals_conceded: summary.goals_conceded,
    points: summary.points,
    yellow_cards: cardTotals?.yellow_cards ?? 0,
    red_cards: cardTotals?.red_cards ?? 0,
  });
}

export function buildStatsFilterOptions(
  rows: TeamEditionStatRow[],
  yearFilter = "all",
  seasonFilter = "all",
  competitionFilter = "all",
): TeamStatsFilterOptions {
  const years = new Set<number>();
  const seasons = new Map<string, string>();
  const competitions = new Map<string, { label: string; logoUrl: string | null }>();
  const editions: { id: string; label: string }[] = [];

  for (const row of rows) {
    const y = getYearValue(row);
    if (yearFilter !== "all") {
      if (y == null || String(y) !== yearFilter) continue;
    }
    if (seasonFilter !== "all" && getSeasonId(row) !== seasonFilter) continue;
    if (competitionFilter !== "all" && getCompetitionId(row) !== competitionFilter) {
      continue;
    }
    if (y != null) years.add(y);
    const seasonId = getSeasonId(row);
    const seasonName = getSeasonName(row);
    if (seasonId && seasonName) seasons.set(seasonId, seasonName);
    const compId = getCompetitionId(row);
    const comp = row.competition_editions?.competitions;
    if (compId && comp) {
      competitions.set(compId, {
        label: comp.short_name?.trim() || comp.full_name?.trim() || "Competição",
        logoUrl: comp.logo_url ?? null,
      });
    }
    editions.push({
      id: row.edition_id,
      label: teamEditionEnrollmentLabel(row),
    });
  }

  const seasonOptions = [...seasons.entries()]
    .filter(([id]) => {
      if (yearFilter === "all") return true;
      return rows.some(
        (r) =>
          getSeasonId(r) === id &&
          getYearValue(r) != null &&
          String(getYearValue(r)) === yearFilter,
      );
    })
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  const uniqueEditions = [...new Map(editions.map((e) => [e.id, e])).values()].sort(
    (a, b) => a.label.localeCompare(b.label, "pt-BR"),
  );

  return {
    years: [...years]
      .sort((a, b) => b - a)
      .map((y) => ({ id: String(y), label: String(y) })),
    seasons: seasonOptions,
    competitions: [...competitions.entries()].map(([id, v]) => ({ id, ...v })),
    editions: uniqueEditions,
  };
}

export function filterEditionStats(
  rows: TeamEditionStatRow[],
  filters: TeamStatsFilterState,
): TeamEditionStatRow[] {
  return rows.filter((row) => {
    if (filters.year !== "all") {
      const y = getYearValue(row);
      if (y == null || String(y) !== filters.year) return false;
    }
    if (filters.seasonId !== "all") {
      if (getSeasonId(row) !== filters.seasonId) return false;
    }
    if (filters.competitionId !== "all") {
      if (getCompetitionId(row) !== filters.competitionId) return false;
    }
    return true;
  });
}

export function sortStatsSliceRows<T extends { summary: TeamStatsNumericSlice; competitions: TeamEditionStatRow[] }>(
  groups: T[],
  sortKey: keyof TeamStatsNumericSlice,
  direction: "asc" | "desc",
): T[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...groups]
    .map((g) => ({
      ...g,
      competitions: [...g.competitions].sort((a, b) => {
        const av = sliceFromEditionRow(a)[sortKey] as number;
        const bv = sliceFromEditionRow(b)[sortKey] as number;
        return (av - bv) * dir;
      }),
    }))
    .sort((a, b) => {
      const av = a.summary[sortKey] as number;
      const bv = b.summary[sortKey] as number;
      return (av - bv) * dir;
    });
}

function sortCompetitionRows(rows: TeamEditionStatRow[]): TeamEditionStatRow[] {
  return [...rows].sort((a, b) => {
    const aName =
      a.competition_editions?.competitions?.short_name ??
      a.competition_editions?.competitions?.full_name ??
      "";
    const bName =
      b.competition_editions?.competitions?.short_name ??
      b.competition_editions?.competitions?.full_name ??
      "";
    return aName.localeCompare(bName, "pt-BR");
  });
}

export function groupEditionStatsBySeason(
  rows: TeamEditionStatRow[],
  teamLogoUrl: string | null,
): TeamStatsSeasonGroup[] {
  const bySeason = new Map<
    string,
    { seasonName: string; yearValue: number | null; stats: TeamEditionStatRow[] }
  >();

  for (const row of rows) {
    const seasonId = getSeasonId(row) ?? "unknown";
    const seasonName = getSeasonName(row) ?? "N/A";
    const yearValue = getYearValue(row);
    const bucket = bySeason.get(seasonId);
    if (bucket) {
      bucket.stats.push(row);
    } else {
      bySeason.set(seasonId, { seasonName, yearValue, stats: [row] });
    }
  }

  const groups: TeamStatsSeasonGroup[] = [];
  for (const [seasonId, { seasonName, yearValue, stats }] of bySeason) {
    const sorted = sortCompetitionRows(stats);
    groups.push({
      key: seasonId,
      seasonName,
      yearValue,
      summary: sumNumeric(sorted),
      teamLogoUrl,
      competitions: sorted,
    });
  }

  return groups.sort((a, b) => {
    const ay = a.yearValue ?? 0;
    const by = b.yearValue ?? 0;
    if (ay !== by) return by - ay;
    return b.seasonName.localeCompare(a.seasonName, "pt-BR");
  });
}
