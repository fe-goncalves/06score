export type TotwFormationKey = "2-3-1" | "1-3-2" | "2-2-2" | "3-3";

export interface FormationSlot {
  col: number;
  row: number;
  total: number;
  label: string;
}

export const TOTW_FORMATIONS: Record<
  TotwFormationKey,
  { label: string; slots: FormationSlot[] }
> = {
  "2-3-1": {
    label: "2-3-1",
    slots: [
      { col: 0, row: 0, total: 1, label: "GK" },
      { col: 1, row: 0, total: 2, label: "DEF" },
      { col: 1, row: 1, total: 2, label: "DEF" },
      { col: 2, row: 0, total: 3, label: "MED" },
      { col: 2, row: 1, total: 3, label: "MED" },
      { col: 2, row: 2, total: 3, label: "MED" },
      { col: 3, row: 0, total: 1, label: "ATK" },
    ],
  },
  "1-3-2": {
    label: "1-3-2",
    slots: [
      { col: 0, row: 0, total: 1, label: "GK" },
      { col: 1, row: 0, total: 1, label: "DEF" },
      { col: 2, row: 0, total: 3, label: "MED" },
      { col: 2, row: 1, total: 3, label: "MED" },
      { col: 2, row: 2, total: 3, label: "MED" },
      { col: 3, row: 0, total: 2, label: "ATK" },
      { col: 3, row: 1, total: 2, label: "ATK" },
    ],
  },
  "2-2-2": {
    label: "2-2-2",
    slots: [
      { col: 0, row: 0, total: 1, label: "GK" },
      { col: 1, row: 0, total: 2, label: "DEF" },
      { col: 1, row: 1, total: 2, label: "DEF" },
      { col: 2, row: 0, total: 2, label: "MED" },
      { col: 2, row: 1, total: 2, label: "MED" },
      { col: 3, row: 0, total: 2, label: "ATK" },
      { col: 3, row: 1, total: 2, label: "ATK" },
    ],
  },
  "3-3": {
    label: "3-3",
    slots: [
      { col: 0, row: 0, total: 1, label: "GK" },
      { col: 1, row: 0, total: 3, label: "DEF" },
      { col: 1, row: 1, total: 3, label: "DEF" },
      { col: 1, row: 2, total: 3, label: "DEF" },
      { col: 3, row: 0, total: 3, label: "ATK" },
      { col: 3, row: 1, total: 3, label: "ATK" },
      { col: 3, row: 2, total: 3, label: "ATK" },
    ],
  },
};

export const TOTW_FIELD = {
  width: 700,
  height: 380,
  padX: 50,
  padY: 40,
  avatarR: 20,
} as const;

const INNER_W = TOTW_FIELD.width - TOTW_FIELD.padX * 2;
const INNER_H = TOTW_FIELD.height - TOTW_FIELD.padY * 2;

/** Posição horizontal (0–1) dentro do retângulo útil do campo. */
const COL_X_FRAC: Record<number, number> = {
  0: 0.1,
  1: 0.3,
  2: 0.55,
  3: 0.78,
};

export function isTotwFormationKey(value: string | null | undefined): value is TotwFormationKey {
  return !!value && value in TOTW_FORMATIONS;
}

/** Coordenadas normalizadas (0–1) dentro da área interna do campo. */
export function slotPosition(
  col: number,
  row: number,
  total: number,
): { x: number; y: number } {
  const x = COL_X_FRAC[col] ?? 0.5;
  const y = total <= 1 ? 0.5 : (row + 1) / (total + 1);
  return { x, y };
}

export function pitchInnerBounds(): {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
} {
  const { width, height, padX, padY } = TOTW_FIELD;
  return {
    leftPct: (padX / width) * 100,
    topPct: (padY / height) * 100,
    widthPct: (INNER_W / width) * 100,
    heightPct: (INNER_H / height) * 100,
  };
}

export { INNER_H, INNER_W };
