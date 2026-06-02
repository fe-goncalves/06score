import type { Phase } from "@/lib/types";

/** display_order ASC; quando = 0, fallback para created_at ASC. */
export function sortPhases(phases: Phase[]): Phase[] {
  return [...phases].sort((a, b) => {
    const orderA = a.display_order ?? 0;
    const orderB = b.display_order ?? 0;
    const aHasOrder = orderA > 0;
    const bHasOrder = orderB > 0;

    if (aHasOrder && bHasOrder) return orderA - orderB;
    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;

    const dateA = a.created_at ? Date.parse(a.created_at) : 0;
    const dateB = b.created_at ? Date.parse(b.created_at) : 0;
    return dateA - dateB;
  });
}

export function getDefaultPhaseId(phases: Phase[]): string | null {
  const sorted = sortPhases(phases);
  if (!sorted.length) return null;
  return sorted.find((p) => p.is_current)?.id ?? sorted[0].id;
}

export function phaseLabel(phase: Phase): string {
  return phase.custom_label ?? phase.full_name;
}
