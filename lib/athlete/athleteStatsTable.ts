import {
  isAssistActionType,
  isGoalActionType,
  isRedCardActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
} from "@/lib/match/actionTypes";
import {
  seasonDisplayNameFromRow,
  seasonYearFromRow,
} from "@/lib/athlete/season";
import type {
  AthleteEditionStatRow,
  AthletePhaseOption,
  AthleteRecentMatch,
} from "@/lib/types";

export type AthleteStatsRow = AthleteEditionStatRow & {
  seasonLabel: string;
};

export interface AthleteStatsFilters {
  clubId: string;
  year: string;
  competitionId: string;
  phaseId: string;
}

export { seasonYearFromRow } from "@/lib/athlete/season";

export function normalizeAvgRating(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

export function buildStatsFilterOptions(
  rows: AthleteEditionStatRow[],
  phases: AthletePhaseOption[],
) {
  const clubs = new Map<string, { label: string; logoUrl: string | null }>();
  const years = new Set<string>();
  const competitions = new Map<string, { label: string; logoUrl: string | null }>();

  for (const row of rows) {
    if (row.team_id && row.teams) {
      const label =
        row.teams.abbreviation?.trim() ||
        row.teams.short_name?.trim() ||
        row.teams.full_name?.trim() ||
        "Clube";
      clubs.set(row.team_id, { label, logoUrl: row.teams.logo_url ?? null });
    }
    const seasonYear = seasonYearFromRow(row);
    if (seasonYear) years.add(seasonYear);
    const comp = row.competition_editions?.competitions;
    if (comp?.id) {
      competitions.set(comp.id, {
        label: comp.short_name?.trim() || comp.full_name?.trim() || "Competição",
        logoUrl: comp.logo_url ?? null,
      });
    }
  }

  const phaseOptions = phases.map((p) => ({
    id: p.id,
    label: p.custom_label?.trim() || p.full_name?.trim() || "Fase",
    editionId: p.edition_id,
  }));

  return {
    clubs: [...clubs.entries()].map(([id, v]) => ({
      id,
      label: v.label,
      logoUrl: v.logoUrl,
    })),
    years: [...years].sort((a, b) => Number(b) - Number(a)),
    competitions: [...competitions.entries()].map(([id, v]) => ({
      id,
      label: v.label,
      logoUrl: v.logoUrl,
    })),
    phases: phaseOptions,
  };
}

export function enrichStatsRowsWithRatings(
  rows: AthleteStatsRow[],
  recentMatches: AthleteRecentMatch[],
): AthleteStatsRow[] {
  return rows.map((row) => {
    const fromDb = normalizeAvgRating(row.avg_rating);
    if (fromDb != null) return { ...row, avg_rating: fromDb };

    const fromMatches = computeAvgRatingFromMatches(
      recentMatches,
      row.edition_id,
      row.team_id,
    );
    return { ...row, avg_rating: fromMatches };
  });
}

function computeAvgRatingFromMatches(
  matches: AthleteRecentMatch[],
  editionId: string,
  teamId: string | null,
): number | null {
  const ratings: number[] = [];
  for (const entry of matches) {
    const matchEditionId = entry.match.phases?.competition_editions?.id;
    if (matchEditionId !== editionId) continue;
    if (
      teamId &&
      entry.match.athlete_team_id &&
      entry.match.athlete_team_id !== teamId
    ) {
      continue;
    }
    const r = normalizeAvgRating(entry.rating);
    if (r != null) ratings.push(r);
  }
  if (!ratings.length) return null;
  return (
    Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
  );
}

export interface SeasonStatsGroup {
  key: string;
  /** Ano civil (seasons.year) para a linha resumo. */
  seasonLabel: string;
  seasonYear: string;
  teamId: string | null;
  team: AthleteEditionStatRow["teams"];
  summary: AthleteStatsRow;
  competitions: AthleteStatsRow[];
}

function sumStatRows(rows: AthleteStatsRow[]): AthleteStatsRow {
  const base = rows[0]!;
  const totals = rows.reduce(
    (acc, row) => ({
      matches_played: acc.matches_played + row.matches_played,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
      yellow_cards: acc.yellow_cards + row.yellow_cards,
      red_cards: acc.red_cards + row.red_cards,
      motm_count: acc.motm_count + row.motm_count,
    }),
    {
      matches_played: 0,
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0,
      motm_count: 0,
    },
  );

  let ratingSum = 0;
  let ratingWeight = 0;
  for (const row of rows) {
    const r = normalizeAvgRating(row.avg_rating);
    if (r != null && row.matches_played > 0) {
      ratingSum += r * row.matches_played;
      ratingWeight += row.matches_played;
    }
  }

  return {
    ...base,
    ...totals,
    avg_rating:
      ratingWeight > 0
        ? Math.round((ratingSum / ratingWeight) * 100) / 100
        : null,
    seasonLabel: base.seasonLabel,
  };
}

export function groupStatsBySeason(rows: AthleteStatsRow[]): SeasonStatsGroup[] {
  const map = new Map<string, AthleteStatsRow[]>();

  for (const row of rows) {
    const year = seasonYearFromRow(row) ?? "—";
    const key = `${year}::${row.team_id ?? "none"}`;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }

  const groups: SeasonStatsGroup[] = [];
  for (const [key, compRows] of map) {
    const sorted = [...compRows].sort((a, b) => {
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
    const first = sorted[0]!;
    const year = seasonYearFromRow(first) ?? "—";
    const summary = sumStatRows(sorted);
    summary.seasonLabel = year;
    groups.push({
      key,
      seasonLabel: year,
      seasonYear: year,
      teamId: first.team_id,
      team: first.teams,
      summary,
      competitions: sorted.map((row) => ({
        ...row,
        seasonLabel: seasonDisplayNameFromRow(row),
      })),
    });
  }

  return groups.sort((a, b) => {
    const ay = Number(a.seasonYear);
    const by = Number(b.seasonYear);
    if (Number.isFinite(ay) && Number.isFinite(by)) return by - ay;
    return b.seasonLabel.localeCompare(a.seasonLabel, "pt-BR");
  });
}

export function seasonLabelFromRow(row: AthleteEditionStatRow): string {
  const name = row.competition_editions?.seasons?.name?.trim();
  if (!name) return "—";
  const range = name.match(/^(\d{4})\s*[/\-]\s*(\d{2,4})$/);
  if (range) {
    const end = range[2]!.length === 4 ? range[2]!.slice(-2) : range[2];
    return `${range[1]!.slice(-2)}/${end}`;
  }
  if (/^\d{4}$/.test(name)) return `${name.slice(-2)}/${String(Number(name) + 1).slice(-2)}`;
  return name;
}

function countFromActions(actions: AthleteRecentMatch["actions"]) {
  let goals = 0;
  let assists = 0;
  let yellow = 0;
  let red = 0;
  for (const action of actions) {
    if (action.is_own_goal) continue;
    if (isGoalActionType(action.action_type)) goals += 1;
    if (isAssistActionType(action.action_type)) assists += 1;
    if (isYellowCardActionType(action.action_type)) yellow += 1;
    if (
      isRedCardActionType(action.action_type) ||
      isYellowRedCardActionType(action.action_type)
    ) {
      red += 1;
    }
  }
  return { goals, assists, yellow, red };
}

type MatchAggBucket = {
  edition_id: string;
  team_id: string | null;
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  motm_count: number;
  ratings: number[];
  competition_editions: AthleteEditionStatRow["competition_editions"];
  teams: AthleteEditionStatRow["teams"];
};

function resolveEditionMeta(
  editionMeta: Map<string, AthleteEditionStatRow>,
  editionId: string,
  teamId: string | null,
): AthleteEditionStatRow | undefined {
  if (teamId) {
    const exact = editionMeta.get(`${editionId}:${teamId}`);
    if (exact) return exact;
  }
  for (const row of editionMeta.values()) {
    if (row.edition_id === editionId) return row;
  }
  return undefined;
}

function mergeStatsRowsByEdition(rows: AthleteStatsRow[]): AthleteStatsRow[] {
  const byEdition = new Map<string, AthleteStatsRow>();

  for (const row of rows) {
    const existing = byEdition.get(row.edition_id);
    if (!existing) {
      byEdition.set(row.edition_id, { ...row });
      continue;
    }

    const prevMatches = existing.matches_played;
    const addMatches = row.matches_played;

    existing.matches_played += addMatches;
    existing.goals += row.goals;
    existing.assists += row.assists;
    existing.yellow_cards += row.yellow_cards;
    existing.red_cards += row.red_cards;
    existing.motm_count += row.motm_count;

    if (!existing.team_id && row.team_id) {
      existing.team_id = row.team_id;
      existing.teams = row.teams ?? existing.teams;
    }
    if (!existing.competition_editions?.seasons && row.competition_editions?.seasons) {
      existing.competition_editions = row.competition_editions;
    }
    const a = normalizeAvgRating(existing.avg_rating);
    const b = normalizeAvgRating(row.avg_rating);
    if (a != null && b != null && prevMatches + addMatches > 0) {
      existing.avg_rating =
        Math.round(
          ((a * prevMatches + b * addMatches) / (prevMatches + addMatches)) * 100,
        ) / 100;
    } else {
      existing.avg_rating = a ?? b ?? null;
    }
  }

  return [...byEdition.values()];
}

function aggregateRowsFromMatches(
  matches: AthleteRecentMatch[],
  phaseId: string,
  filters: Omit<AthleteStatsFilters, "phaseId">,
  editionStats: AthleteEditionStatRow[],
): AthleteStatsRow[] {
  const editionMeta = new Map(
    editionStats.map((row) => [`${row.edition_id}:${row.team_id ?? "none"}`, row]),
  );
  const teamVotesByEdition = new Map<string, Map<string, number>>();

  for (const entry of matches) {
    if (entry.match.phase_id !== phaseId) continue;
    const editionId = entry.match.phases?.competition_editions?.id;
    const teamId = entry.match.athlete_team_id;
    if (!editionId || !teamId) continue;
    const votes = teamVotesByEdition.get(editionId) ?? new Map<string, number>();
    votes.set(teamId, (votes.get(teamId) ?? 0) + 1);
    teamVotesByEdition.set(editionId, votes);
  }

  const canonicalTeamForEdition = (editionId: string): string | null => {
    const votes = teamVotesByEdition.get(editionId);
    if (!votes?.size) return null;
    let best: string | null = null;
    let max = 0;
    for (const [teamId, count] of votes) {
      if (count > max) {
        max = count;
        best = teamId;
      }
    }
    return best;
  };

  const buckets = new Map<string, MatchAggBucket>();

  for (const entry of matches) {
    const match = entry.match;
    if (match.phase_id !== phaseId) continue;

    const editionId = match.phases?.competition_editions?.id;
    if (!editionId) continue;

    const teamId =
      match.athlete_team_id ?? canonicalTeamForEdition(editionId);
    const meta = resolveEditionMeta(editionMeta, editionId, teamId);
    const edition = match.phases?.competition_editions;
    const competition = edition?.competitions ?? meta?.competition_editions?.competitions;

    if (filters.competitionId !== "all" && competition?.id !== filters.competitionId) {
      continue;
    }
    if (filters.clubId !== "all" && teamId !== filters.clubId) continue;

    if (filters.year !== "all") {
      const rowYear = meta ? seasonYearFromRow(meta) : null;
      const matchYear =
        rowYear ??
        (match.match_date?.length >= 4 ? match.match_date.slice(0, 4) : null);
      if (matchYear !== filters.year) continue;
    }

    const key = editionId;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        edition_id: editionId,
        team_id: teamId,
        matches_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        motm_count: 0,
        ratings: [],
        competition_editions: meta?.competition_editions ??
          (edition
            ? {
                id: edition.id,
                competitions: competition ?? null,
                seasons: edition.seasons ?? null,
              }
            : null),
        teams: meta?.teams ?? null,
      };
      buckets.set(key, bucket);
    } else if (!bucket.team_id && teamId) {
      bucket.team_id = teamId;
    }
    if (!bucket.teams && meta?.teams) bucket.teams = meta.teams;
    if (!bucket.competition_editions?.seasons && meta?.competition_editions?.seasons) {
      bucket.competition_editions = meta.competition_editions;
    }

    bucket.matches_played += 1;
    const counts = countFromActions(entry.actions);
    bucket.goals += counts.goals;
    bucket.assists += counts.assists;
    bucket.yellow_cards += counts.yellow;
    bucket.red_cards += counts.red;
    if (entry.isMotm) bucket.motm_count += 1;
    const matchRating = normalizeAvgRating(entry.rating);
    if (matchRating != null) bucket.ratings.push(matchRating);
  }

  const result: AthleteStatsRow[] = [];
  for (const bucket of buckets.values()) {
    const avg_rating =
      bucket.ratings.length > 0
        ? Math.round(
            (bucket.ratings.reduce((a, b) => a + b, 0) / bucket.ratings.length) * 100,
          ) / 100
        : null;
    result.push({
      edition_id: bucket.edition_id,
      team_id: bucket.team_id ?? canonicalTeamForEdition(bucket.edition_id),
      matches_played: bucket.matches_played,
      goals: bucket.goals,
      assists: bucket.assists,
      yellow_cards: bucket.yellow_cards,
      red_cards: bucket.red_cards,
      motm_count: bucket.motm_count,
      totw_count: 0,
      motw_count: 0,
      penalties_taken: 0,
      penalties_scored: 0,
      shootouts_taken: 0,
      shootouts_scored: 0,
      goals_conceded: 0,
      penalty_saves: 0,
      avg_rating,
      competition_editions: bucket.competition_editions,
      teams: bucket.teams,
      seasonLabel: "—",
    });
  }
  return result;
}

export function filterAthleteStatsRows(
  editionStats: AthleteEditionStatRow[],
  recentMatches: AthleteRecentMatch[],
  phases: AthletePhaseOption[],
  filters: AthleteStatsFilters,
): AthleteStatsRow[] {
  const editionMeta = new Map(
    editionStats.map((row) => [`${row.edition_id}:${row.team_id ?? "none"}`, row]),
  );

  let rows: AthleteStatsRow[];

  if (filters.phaseId !== "all") {
    const aggregated = mergeStatsRowsByEdition(
      aggregateRowsFromMatches(
        recentMatches,
        filters.phaseId,
        filters,
        editionStats,
      ),
    );
    rows = aggregated.map((row) => {
      const meta = resolveEditionMeta(
        editionMeta,
        row.edition_id,
        row.team_id,
      );
      const merged: AthleteEditionStatRow = meta
        ? {
            ...meta,
            matches_played: row.matches_played,
            goals: row.goals,
            assists: row.assists,
            yellow_cards: row.yellow_cards,
            red_cards: row.red_cards,
            motm_count: row.motm_count,
            avg_rating: row.avg_rating ?? normalizeAvgRating(meta.avg_rating),
            teams: meta.teams ?? row.teams,
          }
        : row;
      return {
        ...merged,
        seasonLabel: seasonDisplayNameFromRow(merged),
      };
    });
  } else {
    rows = editionStats.map((row) => ({
      ...row,
      seasonLabel: seasonDisplayNameFromRow(row),
      avg_rating: normalizeAvgRating(row.avg_rating),
    }));
  }

  rows = enrichStatsRowsWithRatings(rows, recentMatches);

  rows = rows.filter((row) => {
    if (filters.clubId !== "all" && row.team_id !== filters.clubId) return false;
    if (filters.year !== "all") {
      if (seasonYearFromRow(row) !== filters.year) return false;
    }
    if (filters.competitionId !== "all") {
      if (row.competition_editions?.competitions?.id !== filters.competitionId) {
        return false;
      }
    }
    if (filters.phaseId !== "all") {
      const phase = phases.find((p) => p.id === filters.phaseId);
      if (phase && row.edition_id !== phase.edition_id) return false;
    }
    return true;
  });

  return rows.sort((a, b) => b.seasonLabel.localeCompare(a.seasonLabel, "pt-BR"));
}

export function formatAvgRating(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}
