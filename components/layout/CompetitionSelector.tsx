"use client";

import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Competition } from "@/lib/types";
import type { CompetitionFilterId } from "@/lib/home/filters";

interface CompetitionSelectorProps {
  competitions: Competition[];
  selectedId: CompetitionFilterId;
  onSelect: (id: CompetitionFilterId) => void;
}

function getEditionName(comp: Competition): string {
  const edition = comp.competition_editions?.[0];
  const seasons = edition?.seasons;
  return Array.isArray(seasons)
    ? (seasons[0]?.name ?? "")
    : (seasons?.name ?? "");
}

function getGradientBorder(primaryColor: string | null): string {
  if (!primaryColor) return "linear-gradient(135deg, #ff6b00, #ff8c42)";
  return `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 45%, #ffffff 55%))`;
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
          className={`competition-pill-v2 shrink-0 ${selectedId === null ? "competition-pill-v2-active" : ""}`}
        >
          <span className="competition-pill-v2-text">Todas</span>
        </button>
        {competitions.map((comp) => {
          const editionName = getEditionName(comp);
          const isActive = selectedId === comp.id;
          const gradientStyle = comp.primary_color
            ? ({ "--pill-border-gradient": getGradientBorder(comp.primary_color) } as CSSProperties)
            : undefined;

          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => onSelect(comp.id)}
              className={`competition-pill-v2 shrink-0 ${isActive ? "competition-pill-v2-active" : ""}`}
              style={gradientStyle}
            >
              {comp.logo_url && (
                <OrgImage
                  src={comp.logo_url}
                  alt={comp.short_name ?? comp.full_name}
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0 object-contain"
                />
              )}
              <span className="competition-pill-v2-text">
                {comp.short_name ?? comp.full_name}
              </span>
              {editionName && (
                <span className="competition-pill-v2-edition">{editionName}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
