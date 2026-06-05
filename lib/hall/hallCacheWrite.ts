import { HALL_KEY_TO_CACHE_CATEGORY } from "@/lib/hall/hallCacheMap";
import type { HallCacheItem } from "@/lib/hall/hallCacheTypes";
import { getSupabase } from "@/lib/supabase";
import type { HallCategory } from "@/lib/types";

type SupabaseClient = ReturnType<typeof getSupabase>;

export async function hallCategoryToCacheItems(
  supabase: SupabaseClient,
  category: HallCategory,
): Promise<HallCacheItem[]> {
  const entries = category.entries;
  if (!entries.length) return [];

  const athleteIds =
    category.section === "athletes" ? entries.map((e) => e.id).filter(Boolean) : [];
  const teamIds = category.section === "teams" ? entries.map((e) => e.id).filter(Boolean) : [];

  const [athletesRes, teamsRes] = await Promise.all([
    athleteIds.length
      ? supabase
          .from("athletes")
          .select("id, full_name, surname, photo_url")
          .in("id", athleteIds)
      : Promise.resolve({ data: [] }),
    teamIds.length
      ? supabase
          .from("teams")
          .select("id, full_name, logo_url")
          .in("id", teamIds)
          .eq("is_virtual", false)
      : Promise.resolve({ data: [] }),
  ]);

  const athleteMap = new Map(
    (athletesRes.data ?? []).map((a) => [a.id as string, a]),
  );
  const teamMap = new Map((teamsRes.data ?? []).map((t) => [t.id as string, t]));

  return entries.map((entry, index) => {
    const athlete = athleteMap.get(entry.id);
    const team = teamMap.get(entry.id);
    const item: HallCacheItem = {
      rank: index + 1,
      value: entry.value,
      label: category.valueLabel,
      value_display: entry.value_display ?? null,
      context: entry.context ?? null,
    };

    if (category.section === "athletes" && athlete) {
      item.athlete = {
        id: athlete.id as string,
        full_name: String(athlete.full_name ?? ""),
        surname: (athlete.surname as string | null) ?? null,
        photo_url: (athlete.photo_url as string | null) ?? null,
      };
    } else if (team) {
      item.team = {
        id: team.id as string,
        full_name: String(team.full_name ?? ""),
        logo_url: (team.logo_url as string | null) ?? null,
      };
    }

    return item;
  });
}

export async function upsertHallCacheSnapshot(
  organizationId: string,
  gender: string,
  editionId: string | null,
  data: { athletes: HallCategory[]; teams: HallCategory[] },
): Promise<{ rows: number; errors: string[] }> {
  const supabase = getSupabase();
  const errors: string[] = [];
  const rows: {
    organization_id: string;
    gender: string;
    edition_id: string | null;
    category: string;
    data: HallCacheItem[];
    updated_at: string;
  }[] = [];

  const now = new Date().toISOString();
  const allCategories = [...data.athletes, ...data.teams];

  for (const category of allCategories) {
    const cacheKey = HALL_KEY_TO_CACHE_CATEGORY[category.key];
    if (!cacheKey) continue;

    try {
      const items = await hallCategoryToCacheItems(supabase, category);
      if (!items.length) continue;

      rows.push({
        organization_id: organizationId,
        gender,
        edition_id: editionId,
        category: cacheKey,
        data: items,
        updated_at: now,
      });
    } catch (err) {
      errors.push(`${cacheKey}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (!rows.length) {
    return { rows: 0, errors };
  }

  const { error } = await supabase.from("hall_of_fame_cache").upsert(rows, {
    onConflict: "organization_id,gender,edition_id,category",
  });

  if (error) {
    errors.push(error.message);
    return { rows: 0, errors };
  }

  return { rows: rows.length, errors };
}
