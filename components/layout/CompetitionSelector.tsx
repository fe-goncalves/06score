"use client";

import type { Competition } from "@/lib/types";
import type { CompetitionFilterId } from "@/lib/home/filters";

interface CompetitionSelectorProps {
  competitions: Competition[];
  selectedId: CompetitionFilterId;
  onSelect: (id: CompetitionFilterId) => void;
}

function pillLabel(comp: Competition): string {
  return comp.short_name ?? comp.full_name;
}

export function CompetitionSelector({
  competitions,
  selectedId,
  onSelect,
}: CompetitionSelectorProps) {
  if (!competitions.length) return null;

  return (
    <div className="competition-selector">
      <div className="competition-selector-track page-edge-x scrollbar-hide flex h-full items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`competition-pill shrink-0 ${selectedId === null ? "competition-pill-active" : ""}`}
        >
          Todas
        </button>
        {competitions.map((comp) => (
          <button
            key={comp.id}
            type="button"
            onClick={() => onSelect(comp.id)}
            className={`competition-pill shrink-0 ${selectedId === comp.id ? "competition-pill-active" : ""}`}
          >
            {pillLabel(comp)}
          </button>
        ))}
      </div>
    </div>
  );
}
