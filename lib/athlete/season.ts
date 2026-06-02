import type { Season } from "@/lib/types";
import type { AthleteEditionStatRow } from "@/lib/types";

export function normalizeSeasonEmbed(
  seasons: Season | Season[] | null | undefined,
): Season | null {
  if (!seasons) return null;
  return Array.isArray(seasons) ? (seasons[0] ?? null) : seasons;
}

/** Ano cadastrado na temporada (`seasons.year`), com fallback legado no nome. */
export function seasonYearFromRow(
  row: Pick<AthleteEditionStatRow, "competition_editions">,
): string | null {
  const season = normalizeSeasonEmbed(row.competition_editions?.seasons);
  if (season?.year != null) {
    const y = typeof season.year === "number" ? season.year : Number(season.year);
    if (Number.isFinite(y)) return String(Math.trunc(y));
  }
  const name = season?.name?.trim();
  if (!name) return null;
  const match = name.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

export function seasonDisplayNameFromRow(
  row: Pick<AthleteEditionStatRow, "competition_editions">,
): string {
  const season = normalizeSeasonEmbed(row.competition_editions?.seasons);
  return season?.name?.trim() || "—";
}
