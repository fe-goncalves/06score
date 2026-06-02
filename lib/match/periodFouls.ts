import { periodKey, type MatchPeriodHalf } from "@/lib/match/actionTypes";

export type { MatchPeriodHalf };

/** Linha de `match_team_stats` (faltas por equipe por período). */
export interface MatchTeamPeriodStat {
  team_id: string;
  period: string;
  fouls: number;
  avg_rating?: number | null;
  rated_athletes_count?: number | null;
}

export interface PeriodFoulSideCounts {
  home: number;
  away: number;
}

export interface PeriodFoulCounts {
  first: PeriodFoulSideCounts;
  second: PeriodFoulSideCounts;
}

function emptyCounts(): PeriodFoulCounts {
  return {
    first: { home: 0, away: 0 },
    second: { home: 0, away: 0 },
  };
}

function clampFouls(value: number): number {
  return Math.min(Math.max(0, value), 5);
}

export function getFouls(
  teamStats: MatchTeamPeriodStat[],
  teamId: string,
  period: MatchPeriodHalf,
): number {
  const row = teamStats.find(
    (s) => s.team_id === teamId && periodKey(s.period) === period,
  );
  return clampFouls(row?.fouls ?? 0);
}

/** Agrega `match_team_stats` para os medidores da timeline (casa = team A). */
export function buildPeriodFoulCounts(
  teamStats: MatchTeamPeriodStat[],
  teamAId: string,
): PeriodFoulCounts {
  const counts = emptyCounts();

  for (const row of teamStats) {
    const period = periodKey(row.period);
    if (!period) continue;
    const side = row.team_id === teamAId ? "home" : "away";
    counts[period][side] = clampFouls(row.fouls);
  }

  return counts;
}

export function getPeriodFoulCount(
  counts: PeriodFoulCounts,
  period: MatchPeriodHalf,
  teamId: string,
  teamAId: string,
): number {
  const side = teamId === teamAId ? "home" : "away";
  return counts[period][side];
}

/** Total de faltas no jogo (1º + 2º tempo) — fonte: `match_team_stats`. */
export function getMatchFoulsTotal(
  teamStats: MatchTeamPeriodStat[],
  teamId: string,
): number {
  let total = 0;
  for (const row of teamStats) {
    if (row.team_id !== teamId) continue;
    const period = periodKey(row.period);
    if (period === "first" || period === "second") {
      total += row.fouls ?? 0;
    }
  }
  return total;
}

export interface TeamMatchAvgRating {
  avgRating: number;
  ratedCount: number;
}

/** Média da equipe (`period = 'match'`). */
export function getTeamMatchAvgRating(
  teamStats: MatchTeamPeriodStat[],
  teamId: string,
): TeamMatchAvgRating | null {
  const row = teamStats.find(
    (s) => s.team_id === teamId && s.period?.trim().toLowerCase() === "match",
  );
  if (!row) return null;
  return buildAvgRating(row);
}

function buildAvgRating(row: MatchTeamPeriodStat): TeamMatchAvgRating | null {
  const count = row.rated_athletes_count ?? 0;
  const avg = row.avg_rating;
  if (count <= 0 || avg == null || !Number.isFinite(Number(avg))) return null;
  return { avgRating: Number(avg), ratedCount: count };
}
