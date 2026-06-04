const NATIONALITY_FLAGS: Record<string, string> = {
  brasil: "🇧🇷",
  brazil: "🇧🇷",
  argentina: "🇦🇷",
  portugal: "🇵🇹",
  uruguai: "🇺🇾",
  uruguay: "🇺🇾",
  paraguai: "🇵🇾",
  paraguay: "🇵🇾",
  chile: "🇨🇱",
  colombia: "🇨🇴",
  "colômbia": "🇨🇴",
  peru: "🇵🇪",
  equador: "🇪🇨",
  ecuador: "🇪🇨",
  bolivia: "🇧🇴",
  "bolívia": "🇧🇴",
  venezuela: "🇻🇪",
  mexico: "🇲🇽",
  "méxico": "🇲🇽",
  usa: "🇺🇸",
  eua: "🇺🇸",
  "estados unidos": "🇺🇸",
  france: "🇫🇷",
  "frança": "🇫🇷",
  germany: "🇩🇪",
  alemanha: "🇩🇪",
  italy: "🇮🇹",
  italia: "🇮🇹",
  "itália": "🇮🇹",
  spain: "🇪🇸",
  espanha: "🇪🇸",
  england: "🇬🇧",
  inglaterra: "🇬🇧",
  netherlands: "🇳🇱",
  holanda: "🇳🇱",
  belgium: "🇧🇪",
  "bélgica": "🇧🇪",
  croatia: "🇭🇷",
  "croácia": "🇭🇷",
  serbia: "🇷🇸",
  "sérvia": "🇷🇸",
  japan: "🇯🇵",
  "japão": "🇯🇵",
  "coreia do sul": "🇰🇷",
  "south korea": "🇰🇷",
  nigeria: "🇳🇬",
  "nigéria": "🇳🇬",
  ghana: "🇬🇭",
  gana: "🇬🇭",
  senegal: "🇸🇳",
  cameroon: "🇨🇲",
  "camarões": "🇨🇲",
  "ivory coast": "🇨🇮",
  "costa do marfim": "🇨🇮",
  angola: "🇦🇴",
  "cabo verde": "🇨🇻",
};

/** Emoji de bandeira a partir do nome do país (nacionalidade no banco). */
export function nationalityFlagEmoji(nationality: string | null | undefined): string | null {
  if (!nationality?.trim()) return null;
  const key = nationality.trim().toLowerCase();
  return NATIONALITY_FLAGS[key] ?? null;
}

const NATIONALITY_CODES: Record<string, string> = {
  brasil: "BRA",
  brazil: "BRA",
  argentina: "ARG",
  uruguai: "URU",
  uruguay: "URU",
  paraguai: "PAR",
  paraguay: "PAR",
  chile: "CHI",
  colombia: "COL",
  "colômbia": "COL",
  peru: "PER",
  equador: "ECU",
  ecuador: "ECU",
  bolivia: "BOL",
  "bolívia": "BOL",
  venezuela: "VEN",
  mexico: "MEX",
  "méxico": "MEX",
  portugal: "POR",
  espanha: "ESP",
  spain: "ESP",
  italia: "ITA",
  "itália": "ITA",
  alemanha: "GER",
  germany: "GER",
  france: "FRA",
  "frança": "FRA",
  inglaterra: "ENG",
  england: "ENG",
  holanda: "NED",
  netherlands: "NED",
  angola: "ANG",
  japão: "JPN",
  japan: "JPN",
};

/** Sigla de três letras para exibição compacta (ex.: BRA). */
export function nationalityCode(nationality: string | null | undefined): string | null {
  if (!nationality?.trim()) return null;
  const key = nationality.trim().toLowerCase();
  return NATIONALITY_CODES[key] ?? nationality.trim().slice(0, 3).toUpperCase();
}

/** Data de nascimento DD/MM/AAAA para listagens. */
export function formatBirthDateLong(
  birthDate: string | null | undefined,
): string | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

export function calcAthleteAge(
  birthDate: string | null | undefined,
): number | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** DD/MM/AA com idade entre parênteses, quando disponível. */
export function formatAthleteBirthLine(
  birthDate: string | null | undefined,
  age: number | null,
): string | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const base = `${dd}/${mm}/${yy}`;
  if (age != null && Number.isFinite(age)) return `${base} (${age})`;
  return base;
}
