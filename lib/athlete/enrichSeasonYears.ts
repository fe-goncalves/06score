import { normalizeSeasonEmbed } from "@/lib/athlete/season";
import { getSupabase } from "@/lib/supabase";
import type { AthleteEditionStatRow, Season } from "@/lib/types";

/** Anexa `seasons.year` quando a coluna existe (sem quebrar o select principal). */
export async function enrichEditionStatsSeasonYears(
  rows: AthleteEditionStatRow[],
): Promise<AthleteEditionStatRow[]> {
  if (!rows.length) return rows;

  const editionIds = [...new Set(rows.map((r) => r.edition_id).filter(Boolean))];
  if (!editionIds.length) return rows;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competition_editions")
    .select("id, seasons(name, year)")
    .in("id", editionIds);

  if (error) {
    console.error("[enrichEditionStatsSeasonYears]", error.message);
    return rows;
  }

  const seasonByEdition = new Map<string, Season | null>();
  for (const row of data ?? []) {
    const id = row.id as string;
    const season = normalizeSeasonEmbed(
      row.seasons as Season | Season[] | null | undefined,
    );
    seasonByEdition.set(id, season);
  }

  return rows.map((row) => {
    const season = seasonByEdition.get(row.edition_id);
    if (!season || !row.competition_editions) return row;
    return {
      ...row,
      competition_editions: {
        ...row.competition_editions,
        seasons: season,
      },
    };
  });
}
