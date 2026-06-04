import type {
  AthleteCareerStats,
  AthleteEditionStatRow,
  HubProfileKind,
  StaffCareerStats,
  Team,
} from "@/lib/types";

export interface AthleteStatsFilterState {
  teamId: string;
  year: string;
  competitionId: string;
}

export interface AthleteStatsFilterOptions {
  teams: { id: string; label: string; logoUrl: string | null }[];
  years: { id: string; label: string }[];
  competitions: { id: string; label: string; logoUrl: string | null }[];
}

export interface AthleteStatsNumericSlice {
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  motm_count: number;
  penalties_taken: number;
  penalties_scored: number;
  shootouts_taken: number;
  shootouts_scored: number;
  avg_rating: number | null;
}

export interface AthleteStatsSeasonGroup {
  key: string;
  seasonName: string;
  yearValue: number | null;
  summary: AthleteStatsNumericSlice;
  teamLogoUrl: string | null;
  competitions: AthleteEditionStatRow[];
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function wdlFromEditionRow(row: AthleteEditionStatRow): {
  wins: number;
  draws: number;
  losses: number;
} {
  return {
    wins: num(row.wins),
    draws: num(row.draws),
    losses: num(row.losses),
  };
}

function teamLabel(team: Pick<Team, "abbreviation" | "full_name"> | null | undefined): string {
  return team?.abbreviation?.trim() || team?.full_name?.trim() || "Clube";
}

export function getYearValue(row: AthleteEditionStatRow): number | null {
  const value = row.competition_editions?.seasons?.years?.value;
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Number(value);
}

export function getCompetitionId(row: AthleteEditionStatRow): string | null {
  return (
    row.competition_editions?.competition_id ??
    row.competition_editions?.competitions?.id ??
    null
  );
}

export function getSeasonId(row: AthleteEditionStatRow): string | null {
  return (
    row.competition_editions?.seasons?.id ??
    row.competition_editions?.season_id ??
    null
  );
}

export function getSeasonName(row: AthleteEditionStatRow): string | null {
  const name = row.competition_editions?.seasons?.name?.trim();
  return name || null;
}

function editionCreatedAtMs(row: AthleteEditionStatRow): number {
  const raw = row.competition_editions?.created_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Último registro da temporada (para logo da equipe na linha agrupada). */
export function getLastStatOfSeason(
  stats: AthleteEditionStatRow[],
): AthleteEditionStatRow | null {
  if (!stats.length) return null;
  return [...stats].sort((a, b) => {
    const diff = editionCreatedAtMs(b) - editionCreatedAtMs(a);
    if (diff !== 0) return diff;
    return b.edition_id.localeCompare(a.edition_id);
  })[0];
}

export function buildStatsFilterOptions(
  rows: AthleteEditionStatRow[],
): AthleteStatsFilterOptions {
  const teams = new Map<string, { label: string; logoUrl: string | null }>();
  const years = new Set<number>();
  const competitions = new Map<string, { label: string; logoUrl: string | null }>();

  for (const row of rows) {
    if (row.team_id && row.teams) {
      teams.set(row.team_id, {
        label: teamLabel(row.teams),
        logoUrl: row.teams.logo_url ?? null,
      });
    }
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
    teams: [...teams.entries()].map(([id, v]) => ({ id, ...v })),
    years: [...years]
      .sort((a, b) => b - a)
      .map((y) => ({ id: String(y), label: String(y) })),
    competitions: [...competitions.entries()].map(([id, v]) => ({ id, ...v })),
  };
}

export function filterEditionStats(
  rows: AthleteEditionStatRow[],
  filters: AthleteStatsFilterState,
): AthleteEditionStatRow[] {
  return rows.filter((row) => {
    if (filters.teamId !== "all" && row.team_id !== filters.teamId) return false;
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

function sumNumeric(
  rows: AthleteEditionStatRow[],
  kind: HubProfileKind = "athlete",
): Omit<AthleteStatsNumericSlice, "avg_rating"> {
  return rows.reduce(
    (acc, row) => {
      const wdl = wdlFromEditionRow(row);
      const base = {
        matches_played: acc.matches_played + row.matches_played,
        wins: acc.wins + wdl.wins,
        draws: acc.draws + wdl.draws,
        losses: acc.losses + wdl.losses,
        yellow_cards: acc.yellow_cards + row.yellow_cards,
        red_cards: acc.red_cards + row.red_cards,
        penalties_taken: acc.penalties_taken + num(row.penalties_taken),
        penalties_scored: acc.penalties_scored + num(row.penalties_scored),
        shootouts_taken: acc.shootouts_taken + num(row.shootouts_taken),
        shootouts_scored: acc.shootouts_scored + num(row.shootouts_scored),
      };
      if (kind === "staff") return base;
      return {
        ...base,
        goals: acc.goals + row.goals,
        assists: acc.assists + row.assists,
        motm_count: acc.motm_count + row.motm_count,
      };
    },
    {
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0,
      motm_count: 0,
      penalties_taken: 0,
      penalties_scored: 0,
      shootouts_taken: 0,
      shootouts_scored: 0,
    },
  );
}

/** Média ponderada por jogos (somente linhas com nota e matches_played > 0). */
export function weightedAvgRating(rows: AthleteEditionStatRow[]): number | null {
  let sum = 0;
  let weight = 0;
  for (const row of rows) {
    if (row.avg_rating == null || row.matches_played <= 0) continue;
    sum += row.avg_rating * row.matches_played;
    weight += row.matches_played;
  }
  if (!weight) return null;
  return Math.round((sum / weight) * 100) / 100;
}

export function sliceFromEditionRow(
  row: AthleteEditionStatRow,
  kind: HubProfileKind = "athlete",
): AthleteStatsNumericSlice {
  const wdl = wdlFromEditionRow(row);
  return {
    matches_played: row.matches_played,
    wins: wdl.wins,
    draws: wdl.draws,
    losses: wdl.losses,
    goals: kind === "staff" ? 0 : row.goals,
    assists: kind === "staff" ? 0 : row.assists,
    yellow_cards: row.yellow_cards,
    red_cards: row.red_cards,
    motm_count: kind === "staff" ? 0 : row.motm_count,
    penalties_taken: num(row.penalties_taken),
    penalties_scored: num(row.penalties_scored),
    shootouts_taken: num(row.shootouts_taken),
    shootouts_scored: num(row.shootouts_scored),
    avg_rating: row.avg_rating,
  };
}

export function hasActiveStatsFilters(
  filters: AthleteStatsFilterState,
  phaseKey: string,
): boolean {
  return (
    filters.teamId !== "all" ||
    filters.year !== "all" ||
    filters.competitionId !== "all" ||
    phaseKey !== "all"
  );
}

/** TOTAL filtrado: soma das linhas de edição exibidas na tabela. */
export function buildTotalsFromEditionRows(
  rows: AthleteEditionStatRow[],
  kind: HubProfileKind = "athlete",
): AthleteStatsNumericSlice {
  const totals = sumNumeric(rows, kind);
  return {
    ...totals,
    avg_rating: weightedAvgRating(rows),
  };
}

export function buildCareerTotalsRow(
  career: AthleteCareerStats | StaffCareerStats | null,
  kind: HubProfileKind = "athlete",
): AthleteStatsNumericSlice {
  if (kind === "staff") {
    const s = career as StaffCareerStats | null;
    return {
      matches_played: s?.total_matches ?? 0,
      wins: s?.total_wins ?? 0,
      draws: s?.total_draws ?? 0,
      losses: s?.total_losses ?? 0,
      goals: 0,
      assists: 0,
      yellow_cards: s?.total_yellow_cards ?? 0,
      red_cards: s?.total_red_cards ?? 0,
      motm_count: 0,
      penalties_taken: 0,
      penalties_scored: 0,
      shootouts_taken: 0,
      shootouts_scored: 0,
      avg_rating:
        s?.avg_rating != null && Number.isFinite(Number(s.avg_rating))
          ? Math.round(Number(s.avg_rating) * 100) / 100
          : null,
    };
  }
  const a = career as AthleteCareerStats | null;
  return {
    matches_played: a?.total_matches ?? 0,
    wins: a?.total_wins ?? 0,
    draws: a?.total_draws ?? 0,
    losses: a?.total_losses ?? 0,
    goals: a?.total_goals ?? 0,
    assists: a?.total_assists ?? 0,
    yellow_cards: a?.total_yellow_cards ?? 0,
    red_cards: a?.total_red_cards ?? 0,
    motm_count: a?.total_motm ?? 0,
    penalties_taken: a?.total_penalties_taken ?? 0,
    penalties_scored: a?.total_penalties_scored ?? 0,
    shootouts_taken: a?.total_shootouts_taken ?? 0,
    shootouts_scored: a?.total_shootouts_scored ?? 0,
    avg_rating:
      a?.avg_rating != null && Number.isFinite(Number(a.avg_rating))
        ? Math.round(Number(a.avg_rating) * 100) / 100
        : null,
  };
}

function sortCompetitionRows(rows: AthleteEditionStatRow[]): AthleteEditionStatRow[] {
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
  rows: AthleteEditionStatRow[],
  kind: HubProfileKind = "athlete",
): AthleteStatsSeasonGroup[] {
  const bySeason = new Map<
    string,
    { seasonName: string; yearValue: number | null; stats: AthleteEditionStatRow[] }
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

  const groups: AthleteStatsSeasonGroup[] = [];
  for (const [seasonId, { seasonName, yearValue, stats }] of bySeason) {
    const sorted = sortCompetitionRows(stats);
    const lastStat = getLastStatOfSeason(sorted);
    const totals = sumNumeric(sorted, kind);
    groups.push({
      key: seasonId,
      seasonName,
      yearValue,
      summary: {
        ...totals,
        avg_rating: weightedAvgRating(sorted),
      },
      teamLogoUrl: lastStat?.teams?.logo_url ?? null,
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

export function formatAvgRating(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

export function ratingToneClass(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "athlete-stats-rating--empty";
  if (value >= 7) return "athlete-stats-rating--high";
  if (value >= 5) return "athlete-stats-rating--mid";
  return "athlete-stats-rating--low";
}
