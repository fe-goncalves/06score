import type { TeamCareerSummary, TeamEditionStatRow } from "@/lib/types";

export interface TeamStatsFilterState {
  year: string;
  competitionId: string;
}

export interface TeamStatsFilterOptions {
  years: { id: string; label: string }[];
  competitions: { id: string; label: string; logoUrl: string | null }[];
}

export interface TeamStatsNumericSlice {
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  points: number;
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
  return row.competition_editions?.competition_id ?? null;
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

function sumNumeric(rows: TeamEditionStatRow[]): TeamStatsNumericSlice {
  return rows.reduce(
    (acc, row) => ({
      matches_played: acc.matches_played + row.matches_played,
      wins: acc.wins + row.wins,
      draws: acc.draws + row.draws,
      losses: acc.losses + row.losses,
      goals_scored: acc.goals_scored + row.goals_scored,
      goals_conceded: acc.goals_conceded + row.goals_conceded,
      points: acc.points + row.points,
    }),
    {
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      points: 0,
    },
  );
}

export function sliceFromEditionRow(row: TeamEditionStatRow): TeamStatsNumericSlice {
  return {
    matches_played: row.matches_played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goals_scored: row.goals_scored,
    goals_conceded: row.goals_conceded,
    points: row.points,
  };
}

export function hasActiveStatsFilters(filters: TeamStatsFilterState): boolean {
  return filters.year !== "all" || filters.competitionId !== "all";
}

export function buildTotalsFromEditionRows(
  rows: TeamEditionStatRow[],
): TeamStatsNumericSlice {
  return sumNumeric(rows);
}

export function buildCareerTotalsRow(summary: TeamCareerSummary): TeamStatsNumericSlice {
  return {
    matches_played: summary.matches,
    wins: summary.wins,
    draws: summary.draws,
    losses: summary.losses,
    goals_scored: summary.goals_scored,
    goals_conceded: summary.goals_conceded,
    points: summary.points,
  };
}

export function buildStatsFilterOptions(
  rows: TeamEditionStatRow[],
): TeamStatsFilterOptions {
  const years = new Set<number>();
  const competitions = new Map<string, { label: string; logoUrl: string | null }>();

  for (const row of rows) {
    const y = getYearValue(row);
    if (y != null) years.add(y);
    const compId = getCompetitionId(row);
    const comp = row.competition_editions?.competitions;
    if (compId && comp) {
      competitions.set(compId, {
        label: comp.short_name?.trim() || comp.full_name?.trim() || "Competição",
        logoUrl: comp.logo_url ?? null,
      });
    }
  }

  return {
    years: [...years]
      .sort((a, b) => b - a)
      .map((y) => ({ id: String(y), label: String(y) })),
    competitions: [...competitions.entries()].map(([id, v]) => ({ id, ...v })),
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
    if (filters.competitionId !== "all") {
      if (getCompetitionId(row) !== filters.competitionId) return false;
    }
    return true;
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
