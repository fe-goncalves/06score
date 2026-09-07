/**
 * Nome público da edição: `custom_name` da edição, senão nome da temporada.
 */
export function competitionEditionDisplayName(edition: {
  custom_name?: string | null;
  seasons?:
    | { name?: string | null }
    | { name?: string | null }[]
    | null;
} | null | undefined): string {
  if (!edition) return "—";
  const custom = edition.custom_name?.trim();
  if (custom) return custom;
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) {
    return seasons[0]?.name?.trim() || "—";
  }
  return seasons?.name?.trim() || "—";
}
