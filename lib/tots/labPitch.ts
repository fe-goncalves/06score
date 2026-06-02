/** Formações e posicionamento do campo TOTS — espelho do 06.LAB (competicao-hub.tsx). */

export type LabFormationKey = "2-3-1" | "1-3-2" | "2-2-2" | "3-3";

export interface LabFormationSlot {
  col: number;
  row: number;
  total: number;
  label: string;
}

export const LAB_TOTS_FORMATIONS: Record<
  LabFormationKey,
  { label: string; slots: LabFormationSlot[] }
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

export const LAB_TOTS_FIELD = {
  width: 700,
  height: 380,
  padX: 50,
  padY: 40,
  avatarR: 20,
} as const;

const { width: FW, height: FH, padX: PAD_X, padY: PAD_Y, avatarR: AVATAR_R } =
  LAB_TOTS_FIELD;

const INNER_W = FW - PAD_X * 2;
const INNER_H = FH - PAD_Y * 2;

const ZONE_X: Record<number, number> = {
  0: PAD_X + INNER_W * 0.08,
  1: PAD_X + INNER_W * 0.3,
  2: PAD_X + INNER_W * 0.58,
  3: PAD_X + INNER_W * 0.8,
};

const CY = FH / 2;

export function isLabFormationKey(
  value: string | null | undefined,
): value is LabFormationKey {
  return !!value && value in LAB_TOTS_FORMATIONS;
}

export function labSlotPosition(
  col: number,
  row: number,
  total: number,
): { cx: number; cy: number } {
  const cx = ZONE_X[col];
  const minSpacing = AVATAR_R * 2 + 20;
  const maxSpacing = INNER_H / (total + 0.5);
  const spacing = Math.max(minSpacing, Math.min(maxSpacing, 80));
  const startY = CY - spacing * (total - 1) / 2;
  const cy = startY + row * spacing;
  return { cx, cy };
}

export function getLabFieldMetrics() {
  return { FW, FH, PAD_X, PAD_Y, INNER_W, INNER_H, AVATAR_R };
}
