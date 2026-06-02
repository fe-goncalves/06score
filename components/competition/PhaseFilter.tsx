"use client";

import type { CSSProperties } from "react";
import type { Phase } from "@/lib/types";

interface PhaseFilterProps {
  phases: Phase[];
  selectedPhaseId: string | null;
  onChange: (phaseId: string | null) => void;
  accentColor?: string | null;
}

export function PhaseFilter({
  phases,
  selectedPhaseId,
  onChange,
  accentColor,
}: PhaseFilterProps) {
  const accent = accentColor ?? "var(--color-brand)";

  return (
    <div className="competition-hub-tabs mb-6 scrollbar-hide">
      <div className="competition-hub-tabs-track">
        <span className="mr-1 shrink-0 self-center font-mono-label text-[8px] font-bold uppercase tracking-widest text-white/35">
          Fase
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`competition-hub-tab ${selectedPhaseId === null ? "competition-hub-tab-active" : ""}`}
          style={{ "--tab-accent": accent } as CSSProperties}
        >
          Todas
        </button>
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() => onChange(phase.id)}
            className={`competition-hub-tab ${selectedPhaseId === phase.id ? "competition-hub-tab-active" : ""}`}
            style={{ "--tab-accent": accent } as CSSProperties}
          >
            {phase.custom_label ?? phase.full_name}
          </button>
        ))}
      </div>
    </div>
  );
}
