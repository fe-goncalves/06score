/** Rótulo do breadcrumb (ex.: FEMININO, MASCULINO). */
export function teamGenderNavLabel(
  gender: string | null | undefined,
): string | null {
  if (gender === "female") return "FEMININO";
  if (gender === "male") return "MASCULINO";
  return null;
}

/** Nome do país em destaque no hero (maiúsculas). */
export function teamCountryDisplay(
  country: string | null | undefined,
  fallback = "Brasil",
): string {
  const value = country?.trim() || fallback;
  return value.toLocaleUpperCase("pt-BR");
}
