import { getSupabase } from "@/lib/supabase";
import type { HallCategory, HallEntry, HallFilters, HallGender } from "@/lib/types";

const DEFAULT_SPORT = "football7";

type RankRow = {
  team_id: string;
  full_name: string;
  short_name: string | null;
  logo_url: string | null;
  points: number;
};

function resolveUiGender(gender: HallGender | ""): "male" | "female" | "all" {
  if (gender === "female") return "female";
  if (gender === "male") return "male";
  return "all";
}

function hasScopeFilter(filters: HallFilters): boolean {
  return Boolean(filters.competitionId || filters.year || filters.editionId);
}

function toHallEntries(rows: RankRow[]): HallEntry[] {
  return rows.map((row) => ({
    id: row.team_id,
    name: row.full_name,
    photo_url: row.logo_url,
    team_logo: row.logo_url,
    abbreviation: row.short_name,
    value: row.points,
    value_display: String(row.points),
  }));
}

async function resolveYearId(
  orgId: string,
  yearValue: string,
): Promise<string | null> {
  const supabase = getSupabase();
  const value = Number(yearValue);
  if (!Number.isFinite(value)) return null;

  const { data, error } = await supabase
    .from("years")
    .select("id")
    .eq("organization_id", orgId)
    .eq("value", value)
    .maybeSingle();

  if (error) {
    if (!error.message.includes("does not exist")) {
      console.error("[teamRanking:year]", error.message);
    }
    return null;
  }

  return (data?.id as string | undefined) ?? null;
}

async function fetchManualAdjustments(
  orgId: string,
): Promise<Map<string, number>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ranking_manual_adjustments")
    .select("team_id, points_delta")
    .eq("organization_id", orgId);

  if (error) {
    if (!error.message.includes("does not exist")) {
      console.error("[teamRanking:manual]", error.message);
    }
    return new Map();
  }

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const teamId = row.team_id as string;
    map.set(teamId, (map.get(teamId) ?? 0) + (Number(row.points_delta) || 0));
  }
  return map;
}

/**
 * Query de diagnÃ³stico / gender=all â€” agrega ledger sem filtrar gÃªnero/esporte.
 * Equivale Ã  query 2 do 06.LAB.
 */
async function fetchRankingUnfiltered(orgId: string): Promise<{
  rows: RankRow[];
  ledgerCount: number;
}> {
  const supabase = getSupabase();

  const { data, error, count } = await supabase
    .from("ranking_point_entries")
    .select(
      `
      team_id,
      points_earned,
      teams!inner (
        id,
        full_name,
        short_name,
        logo_url,
        gender,
        is_virtual
      )
    `,
      { count: "exact" },
    )
    .eq("organization_id", orgId);

  if (error) {
    console.error("[teamRanking:unfiltered]", error.message);
    return { rows: [], ledgerCount: 0 };
  }

  const points = new Map<string, RankRow>();
  for (const row of data ?? []) {
    const team = Array.isArray(row.teams) ? row.teams[0] : row.teams;
    if (!team?.id || team.is_virtual) continue;
    const teamId = team.id as string;
    const prev = points.get(teamId);
    const add = Number(row.points_earned) || 0;
    if (prev) {
      prev.points += add;
    } else {
      points.set(teamId, {
        team_id: teamId,
        full_name: String(team.full_name ?? ""),
        short_name: (team.short_name as string | null) ?? null,
        logo_url: (team.logo_url as string | null) ?? null,
        points: add,
      });
    }
  }

  const rows = [...points.values()]
    .filter((r) => r.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.full_name.localeCompare(b.full_name, "pt-BR"),
    );

  return { rows, ledgerCount: count ?? data?.length ?? 0 };
}

type EntryJoined = {
  team_id: string;
  edition_id: string;
  points_earned: number;
  competition_gender: string | null;
  sport_slug: string | null;
  competition_id: string;
  season_year_id: string | null;
  team: {
    id: string;
    full_name: string;
    short_name: string | null;
    logo_url: string | null;
    gender: string | null;
    is_virtual: boolean | null;
  } | null;
};

/**
 * Carrega entries com join (competiÃ§Ã£o + equipe) para filtrar com valores reais.
 */
async function fetchJoinedEntries(orgId: string): Promise<EntryJoined[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("ranking_point_entries")
    .select(
      `
      team_id,
      edition_id,
      points_earned,
      competition_editions!inner (
        id,
        competition_id,
        seasons ( year_id ),
        competitions!inner (
          id,
          gender,
          sport_slug,
          organization_id
        )
      ),
      teams!inner (
        id,
        full_name,
        short_name,
        logo_url,
        gender,
        is_virtual
      )
    `,
    )
    .eq("organization_id", orgId);

  if (error) {
    console.error("[teamRanking:joined]", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const ce = Array.isArray(row.competition_editions)
      ? row.competition_editions[0]
      : row.competition_editions;
    const comp = Array.isArray(ce?.competitions)
      ? ce.competitions[0]
      : ce?.competitions;
    const season = Array.isArray(ce?.seasons) ? ce.seasons[0] : ce?.seasons;
    const team = Array.isArray(row.teams) ? row.teams[0] : row.teams;

    return {
      team_id: row.team_id as string,
      edition_id: row.edition_id as string,
      points_earned: Number(row.points_earned) || 0,
      competition_gender: (comp?.gender as string | null) ?? null,
      sport_slug: (comp?.sport_slug as string | null) ?? null,
      competition_id: (ce?.competition_id as string) ?? "",
      season_year_id: (season?.year_id as string | null) ?? null,
      team: team
        ? {
            id: team.id as string,
            full_name: String(team.full_name ?? ""),
            short_name: (team.short_name as string | null) ?? null,
            logo_url: (team.logo_url as string | null) ?? null,
            gender: (team.gender as string | null) ?? null,
            is_virtual: (team.is_virtual as boolean | null) ?? false,
          }
        : null,
    };
  });
}

function discoverSportSlug(entries: EntryJoined[]): string {
  const counts = new Map<string, number>();
  for (const e of entries) {
    const s = (e.sport_slug ?? "").trim();
    if (!s) continue;
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  if (counts.has(DEFAULT_SPORT)) return DEFAULT_SPORT;
  let best = DEFAULT_SPORT;
  let bestN = 0;
  for (const [slug, n] of counts) {
    if (n > bestN) {
      best = slug;
      bestN = n;
    }
  }
  return best;
}

function aggregateFiltered(
  entries: EntryJoined[],
  opts: {
    gender: "male" | "female" | "all";
    sportSlug: string;
    competitionId: string | null;
    yearId: string | null;
    editionId: string | null;
  },
): RankRow[] {
  const points = new Map<string, RankRow>();

  for (const e of entries) {
    if (!e.team || e.team.is_virtual) continue;
    if (e.points_earned <= 0) continue;

    if (opts.editionId && e.edition_id !== opts.editionId) continue;
    if (opts.competitionId && e.competition_id !== opts.competitionId) {
      continue;
    }
    if (opts.yearId && e.season_year_id !== opts.yearId) continue;

    // gender/sport: sÃ³ quando UI pede um gÃªnero especÃ­fico
    if (opts.gender !== "all") {
      if ((e.competition_gender ?? "").trim() !== opts.gender) continue;
      if ((e.sport_slug ?? "").trim() !== opts.sportSlug) continue;
    }

    const prev = points.get(e.team_id);
    if (prev) {
      prev.points += e.points_earned;
    } else {
      points.set(e.team_id, {
        team_id: e.team_id,
        full_name: e.team.full_name,
        short_name: e.team.short_name,
        logo_url: e.team.logo_url,
        points: e.points_earned,
      });
    }
  }

  return [...points.values()]
    .filter((r) => r.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.full_name.localeCompare(b.full_name, "pt-BR"),
    );
}

/**
 * Ranking histÃ³rico 06LAB â€” somente leitura de ranking_point_entries.
 * Nunca chama calculate_ranking. NÃ£o depende de team_ranking_cache.
 */
export async function fetchTeamRankingCategory(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory> {
  const gender = resolveUiGender(filters.gender);
  const competitionId = filters.competitionId || null;
  const yearValue = filters.year || null;
  const editionId = filters.editionId || null;
  const scoped = hasScopeFilter(filters);
  const yearId = yearValue ? await resolveYearId(orgId, yearValue) : null;

  // 1) Sem filtro de gÃªnero/esporte (gender=all e sem escopo) â€” query 2 do lab
  if (gender === "all" && !scoped) {
    const { rows, ledgerCount } = await fetchRankingUnfiltered(orgId);
    let finalRows = rows;

    if (finalRows.length) {
      const manual = await fetchManualAdjustments(orgId);
      if (manual.size) {
        finalRows = finalRows
          .map((r) => ({
            ...r,
            points: r.points + (manual.get(r.team_id) ?? 0),
          }))
          .filter((r) => r.points > 0)
          .sort(
            (a, b) =>
              b.points - a.points ||
              a.full_name.localeCompare(b.full_name, "pt-BR"),
          );
      }
    }

    return {
      key: "team_ranking",
      label: "Ranking",
      section: "teams",
      valueLabel: "Pts",
      entries: toHallEntries(finalRows),
      emptyHint: finalRows.length
        ? undefined
        : ledgerCount === 0
          ? "Ranking ainda sem pontos publicados para esta organizaÃ§Ã£o."
          : "Sem pontos positivos neste ranking.",
    };
  }

  // 2) Com gÃªnero e/ou escopo â€” join e filtrar pelos valores reais do banco
  const joined = await fetchJoinedEntries(orgId);

  if (!joined.length) {
    // Fallback: se o join falhar/zerar, tenta ledger simples (query 2)
    const { rows, ledgerCount } = await fetchRankingUnfiltered(orgId);
    return {
      key: "team_ranking",
      label: "Ranking",
      section: "teams",
      valueLabel: "Pts",
      entries: toHallEntries(gender === "all" ? rows : rows),
      emptyHint:
        rows.length === 0 && ledgerCount === 0
          ? "Ranking indisponÃ­vel no momento. Tente novamente mais tarde."
          : rows.length === 0
            ? "Nenhum resultado para estes filtros."
            : undefined,
    };
  }

  const sportSlug = discoverSportSlug(joined);
  let ranked = aggregateFiltered(joined, {
    gender,
    sportSlug,
    competitionId,
    yearId,
    editionId,
  });

  // Se male/female + football7 zerou, tenta o outro gÃªnero (lab: pode estar no feminino)
  if (!ranked.length && gender !== "all" && !scoped) {
    const other = gender === "male" ? "female" : "male";
    ranked = aggregateFiltered(joined, {
      gender: other,
      sportSlug,
      competitionId: null,
      yearId: null,
      editionId: null,
    });
  }

  // Ajustes manuais sÃ³ sem filtro de escopo
  if (!scoped && ranked.length) {
    const manual = await fetchManualAdjustments(orgId);
    if (manual.size) {
      ranked = ranked
        .map((r) => ({
          ...r,
          points: r.points + (manual.get(r.team_id) ?? 0),
        }))
        .filter((r) => r.points > 0)
        .sort(
          (a, b) =>
            b.points - a.points ||
            a.full_name.localeCompare(b.full_name, "pt-BR"),
        );
    }
  }

  return {
    key: "team_ranking",
    label: "Ranking",
    section: "teams",
    valueLabel: "Pts",
    entries: toHallEntries(ranked),
    emptyHint: ranked.length
      ? undefined
      : "Nenhum resultado para este filtro. Ajuste o gÃªnero ou limpe competiÃ§Ã£o/ano.",
  };
}
