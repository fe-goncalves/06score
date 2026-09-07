export function normalizeQuery(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(
  text: string | null | undefined,
  query: string,
): boolean {
  if (!text || !query) return false;
  return normalizeQuery(text).includes(query);
}
