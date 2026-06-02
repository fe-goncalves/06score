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
