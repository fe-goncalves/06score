"use client";

import type { Phase } from "@/lib/types";

interface PhaseFilterProps {
  phases: Phase[];
  selectedPhaseId: string | null;
  onChange: (phaseId: string | null) => void;
}

export function PhaseFilter({
  phases,
  selectedPhaseId,
  onChange,
}: PhaseFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
        Fase:
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
          selectedPhaseId === null
            ? "bg-[var(--color-brand)] text-black"
            : "bg-[#141414] text-white/60 hover:text-white"
        }`}
      >
        Todas
      </button>
      {phases.map((phase) => (
        <button
          key={phase.id}
          type="button"
          onClick={() => onChange(phase.id)}
          className={`rounded px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            selectedPhaseId === phase.id
              ? "bg-[var(--color-brand)] text-black"
              : "bg-[#141414] text-white/60 hover:text-white"
          }`}
        >
          {phase.custom_label ?? phase.full_name}
        </button>
      ))}
    </div>
  );
}
