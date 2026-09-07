/** Título de documento (aba do browser / SEO) — sempre caixa alta. */
export function metaTitle(
  value: string | null | undefined,
  fallback = "06.SCORE",
): string {
  const trimmed = value?.trim();
  return (trimmed && trimmed.length > 0 ? trimmed : fallback).toLocaleUpperCase(
    "pt-BR",
  );
}
