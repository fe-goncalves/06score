import type { CSSProperties } from "react";
import type { TableMarker } from "@/lib/types";

export function getMarkerForPosition(
  markers: TableMarker[],
  position: number,
): TableMarker | null {
  if (!markers.length) return null;

  const matches = markers.filter(
    (m) => position >= m.position_from && position <= m.position_to,
  );
  if (!matches.length) return null;

  return matches.sort((a, b) => b.display_order - a.display_order)[0];
}

export function markersForPhase(
  markers: TableMarker[],
  phaseId: string,
): TableMarker[] {
  return markers
    .filter((m) => m.phase_id === phaseId)
    .sort((a, b) => a.display_order - b.display_order);
}

/** Estilo do traço de zona ao lado da posição (não na linha inteira). */
export function markerCornerStyle(
  marker: TableMarker | null,
): CSSProperties | undefined {
  if (!marker) return undefined;
  return { backgroundColor: marker.color_hex };
}

/** Variáveis CSS para hover da linha (cor do marcador ou accent). */
export function standingsRowHoverVars(
  marker: TableMarker | null,
  accent: string,
): CSSProperties {
  return {
    "--standings-row-marker": marker?.color_hex ?? accent,
  } as CSSProperties;
}
