/** Texturas grunge de referência — tintadas pela cor da equipe via CSS. */
export type HallCardVariantId =
  | "geo"
  | "tag"
  | "neon"
  | "wine"
  | "hard"
  | "spray"
  | "star";

export interface HallCardVariant {
  id: HallCardVariantId;
  /** Hue base da arte (para hue-rotate em direção à cor do time). */
  baseHue: number;
  /** Saturação extra no filtro. */
  saturate: number;
  blendMode: "overlay" | "soft-light" | "hard-light" | "multiply";
  textureOpacity: number;
  tintOpacity: number;
}

export const HALL_CARD_VARIANTS: HallCardVariant[] = [
  {
    id: "geo",
    baseHue: 95,
    saturate: 1.15,
    blendMode: "overlay",
    textureOpacity: 0.92,
    tintOpacity: 0.55,
  },
  {
    id: "tag",
    baseHue: 88,
    saturate: 1.25,
    blendMode: "hard-light",
    textureOpacity: 0.88,
    tintOpacity: 0.5,
  },
  {
    id: "neon",
    baseHue: 310,
    saturate: 1.2,
    blendMode: "overlay",
    textureOpacity: 0.9,
    tintOpacity: 0.58,
  },
  {
    id: "wine",
    baseHue: 350,
    saturate: 1.1,
    blendMode: "soft-light",
    textureOpacity: 0.86,
    tintOpacity: 0.52,
  },
  {
    id: "hard",
    baseHue: 285,
    saturate: 1.18,
    blendMode: "hard-light",
    textureOpacity: 0.9,
    tintOpacity: 0.56,
  },
  {
    id: "spray",
    baseHue: 165,
    saturate: 1.22,
    blendMode: "overlay",
    textureOpacity: 0.94,
    tintOpacity: 0.48,
  },
  {
    id: "star",
    baseHue: 100,
    saturate: 1.3,
    blendMode: "multiply",
    textureOpacity: 0.85,
    tintOpacity: 0.6,
  },
];

const VARIANT_BY_ID = new Map(HALL_CARD_VARIANTS.map((v) => [v.id, v]));

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Variante estável por categoria (cada card do grid com textura diferente). */
export function hallCardVariantForKey(categoryKey: string): HallCardVariant {
  const index = hashSeed(categoryKey) % HALL_CARD_VARIANTS.length;
  return HALL_CARD_VARIANTS[index]!;
}

export function hallCardVariantById(id: HallCardVariantId): HallCardVariant {
  return VARIANT_BY_ID.get(id) ?? HALL_CARD_VARIANTS[0]!;
}

export function hallCardTextureUrl(variantId: HallCardVariantId): string {
  return `/hall/bg/variant-${variantId}.png`;
}
