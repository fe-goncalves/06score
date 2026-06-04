import {
  HALL_ATHLETE_CATEGORY_ORDER,
  HALL_ATHLETE_CUSTOM_CATEGORIES,
  HALL_ATHLETE_STAT_CATEGORIES,
  HALL_TEAM_CATEGORY_ORDER,
  HALL_TEAM_SPECIAL_CATEGORIES,
  HALL_TEAM_STAT_CATEGORIES,
  sortHallCategories,
} from "@/lib/hall/categories";
import { CACHE_CATEGORY_TO_HALL_KEY } from "@/lib/hall/hallCacheMap";
import type { HallCacheItem } from "@/lib/hall/hallCacheTypes";
import { getSupabase } from "@/lib/supabase";
import type { HallCategory, HallEntry, HallFilters, HallSectionData } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

const CATEGORY_META = new Map<string, { label: string; valueLabel: string; section: HallCategory["section"] }>();

for (const c of [
  ...HALL_ATHLETE_STAT_CATEGORIES,
  ...HALL_ATHLETE_CUSTOM_CATEGORIES,
  ...HALL_TEAM_STAT_CATEGORIES,
  ...HALL_TEAM_SPECIAL_CATEGORIES,
]) {
  CATEGORY_META.set(c.key, { label: c.label, valueLabel: c.valueLabel, section: c.section });
}

/** Cache só cobre gênero + edição explícita ou histórico total (sem ano/competição soltos). */
export function canUseHallCache(filters: HallFilters): boolean {
  return !filters.competitionId && !filters.year;
}

function formatContextLine(ctx: HallEntry["context"]): string | null {
  if (!ctx) return null;
  const teamA = ctx.team_a?.trim() || "—";
  const teamB = ctx.team_b?.trim() || "—";
  const score = ctx.score?.trim();
  const matchup = score ? `${teamA} ${score} ${teamB}` : `${teamA} vs ${teamB}`;
  const comp = ctx.competition?.trim();
  return comp ? `${matchup} · ${comp}` : matchup;
}

function cacheItemToEntry(item: HallCacheItem, section: HallCategory["section"]): HallEntry {
  if (item.athlete) {
    return {
      id: item.athlete.id,
      name: athleteSurnameLabel(item.athlete.full_name, item.athlete.surname ?? null),
      photo_url: item.athlete.photo_url ?? null,
      value: item.value,
      value_display: item.value_display ?? null,
      team_name: formatContextLine(item.context ?? null),
      context: item.context ?? null,
    };
  }

  const team = item.team;
  return {
    id: team?.id ?? "",
    name: team?.full_name ?? "—",
    photo_url: team?.logo_url ?? null,
    value: item.value,
    value_display: item.value_display ?? null,
    team_name: formatContextLine(item.context ?? null) ?? item.context?.competition ?? null,
    context: item.context ?? null,
  };
}

export async function getHallOfFameFromCache(
  organizationId: string,
  gender: string = "all",
  editionId?: string | null,
): Promise<Record<string, HallCacheItem[]>> {
  const supabase = getSupabase();

  let query = supabase
    .from("hall_of_fame_cache")
    .select("category, data, updated_at")
    .eq("organization_id", organizationId)
    .eq("gender", gender);

  if (editionId) {
    query = query.eq("edition_id", editionId);
  } else {
    query = query.is("edition_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getHallOfFameFromCache]", error.message);
    return {};
  }

  return (
    data?.reduce(
      (acc, row) => {
        const items = row.data as HallCacheItem[] | null;
        if (Array.isArray(items) && items.length > 0) {
          acc[row.category as string] = items;
        }
        return acc;
      },
      {} as Record<string, HallCacheItem[]>,
    ) ?? {}
  );
}

export function hallSectionFromCache(
  cached: Record<string, HallCacheItem[]>,
): HallSectionData | null {
  if (!Object.keys(cached).length) return null;

  const athletes: HallCategory[] = [];
  const teams: HallCategory[] = [];

  for (const [cacheKey, items] of Object.entries(cached)) {
    const hallKey = CACHE_CATEGORY_TO_HALL_KEY[cacheKey] ?? cacheKey;
    const meta = CATEGORY_META.get(hallKey);
    if (!meta || !items.length) continue;

    const category: HallCategory = {
      key: hallKey,
      label: meta.label,
      valueLabel: meta.valueLabel,
      section: meta.section,
      entries: items.map((item) => cacheItemToEntry(item, meta.section)),
    };

    if (meta.section === "teams") teams.push(category);
    else athletes.push(category);
  }

  if (!athletes.length && !teams.length) return null;

  return {
    athletes: sortHallCategories(athletes, HALL_ATHLETE_CATEGORY_ORDER),
    teams: sortHallCategories(teams, HALL_TEAM_CATEGORY_ORDER),
    staff: [],
  };
}
