import type { CSSProperties } from "react";
import {
  hallCardTextureUrl,
  hallCardVariantForKey,
  type HallCardVariant,
} from "@/lib/hall/hallCardVariants";

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(raw)) return null;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => clampByte(c).toString(16).padStart(2, "0")).join("")}`;
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  weightB: number,
): { r: number; g: number; b: number } {
  const w = Math.max(0, Math.min(1, weightB));
  return {
    r: a.r * (1 - w) + b.r * w,
    g: a.g * (1 - w) + b.g * w,
    b: a.b * (1 - w) + b.b * w,
  };
}

function shiftRgb(
  rgb: { r: number; g: number; b: number },
  amount: number,
): { r: number; g: number; b: number } {
  return {
    r: clampByte(rgb.r + amount),
    g: clampByte(rgb.g + amount * 0.85),
    b: clampByte(rgb.b + amount * 1.1),
  };
}

function rgbToHue(rgb: { r: number; g: number; b: number }): number {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.001) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h;
}

function variantHueShift(variant: HallCardVariant, accent?: string | null): number {
  const fallback = parseHex("#3b4fd8")!;
  const team = parseHex(accent ?? "") ?? fallback;
  const teamHue = rgbToHue(team);
  let delta = teamHue - variant.baseHue;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return Math.round(delta * 10) / 10;
}

export interface HallCardThemeOptions {
  accent?: string | null;
  categoryKey?: string;
}

/** Paleta + textura grunge tintada pela cor da equipe. */
export function hallCardCssVars(options?: HallCardThemeOptions | string | null): CSSProperties {
  const accent =
    typeof options === "string" || options == null
      ? options
      : options.accent;
  const categoryKey =
    typeof options === "object" && options?.categoryKey
      ? options.categoryKey
      : "default";

  const fallback = "#3b4fd8";
  const base = parseHex(accent ?? "") ?? parseHex(fallback)!;
  const deep = shiftRgb(base, -42);
  const bright = shiftRgb(base, 38);
  const stripe = mixRgb(bright, { r: 255, g: 255, b: 255 }, 0.22);
  const ink = mixRgb(deep, { r: 0, g: 0, b: 0 }, 0.55);
  const variant = hallCardVariantForKey(categoryKey);
  const hueShift = variantHueShift(variant, accent);

  return {
    "--hall-accent": rgbToHex(base.r, base.g, base.b),
    "--hall-accent-deep": rgbToHex(deep.r, deep.g, deep.b),
    "--hall-accent-bright": rgbToHex(bright.r, bright.g, bright.b),
    "--hall-stripe": rgbToHex(stripe.r, stripe.g, stripe.b),
    "--hall-ink": rgbToHex(ink.r, ink.g, ink.b),
    "--hall-bg-url": `url(${hallCardTextureUrl(variant.id)})`,
    "--hall-bg-hue": `${hueShift}deg`,
    "--hall-bg-saturate": String(variant.saturate),
    "--hall-bg-blend": variant.blendMode,
    "--hall-bg-opacity": String(variant.textureOpacity),
    "--hall-tint-opacity": String(variant.tintOpacity),
  } as CSSProperties;
}

export function hallCardVariantClass(categoryKey: string): string {
  const variant = hallCardVariantForKey(categoryKey);
  return `hall-card--${variant.id}`;
}
