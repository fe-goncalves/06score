"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { TotwPitchDesktop } from "@/components/home/TotwPitchDesktop";
import { PillStepper } from "@/components/ui/PillStepper";
import type { TotwGalleryEntry } from "@/lib/types";
import { formatMotwRoundLabel } from "@/lib/utils";

interface StatsTotwGalleryProps {
  entries: TotwGalleryEntry[];
  accentColor?: string | null;
  compact?: boolean;
}

export function StatsTotwGallery({
  entries,
  accentColor,
  compact = false,
}: StatsTotwGalleryProps) {
  const accent = accentColor ?? "var(--color-brand)";

  const defaultEntry = useMemo(() => {
    if (!entries.length) return null;
    return [...entries].sort(
      (a, b) =>
        new Date(b.totw.created_at).getTime() -
        new Date(a.totw.created_at).getTime(),
    )[0];
  }, [entries]);

  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedRoundId, setSelectedRoundId] = useState<string>("");

  const phaseItems = useMemo(() => {
    const map = new Map<string, { id: string; label: string; order: number }>();
    for (const entry of entries) {
      const id = entry.phaseId ?? "unknown";
      if (!map.has(id)) {
        map.set(id, {
          id,
          label: entry.phaseLabel,
          order: entry.phaseOrder,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.order - b.order);
  }, [entries]);

  useEffect(() => {
    const phaseId =
      defaultEntry?.phaseId ?? phaseItems[0]?.id ?? "";
    setSelectedPhaseId(phaseId);
    setSelectedRoundId(defaultEntry?.id ?? "");
  }, [defaultEntry, phaseItems, entries]);

  const phaseEntries = useMemo(
    () =>
      entries.filter(
        (e) => (e.phaseId ?? "unknown") === (selectedPhaseId || "unknown"),
      ),
    [entries, selectedPhaseId],
  );

  const roundItems = useMemo(
    () =>
      phaseEntries.map((e) => ({
        id: e.id,
        label: formatMotwRoundLabel(e.roundLabel),
      })),
    [phaseEntries],
  );

  useEffect(() => {
    if (!roundItems.some((r) => r.id === selectedRoundId)) {
      setSelectedRoundId(roundItems[roundItems.length - 1]?.id ?? "");
    }
  }, [roundItems, selectedRoundId]);

  const activeEntry =
    entries.find((e) => e.id === selectedRoundId) ??
    phaseEntries[phaseEntries.length - 1] ??
    defaultEntry;

  if (!entries.length || !activeEntry) {
    return (
      <div className="stats-totw-gallery stats-totw-gallery-empty">
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma seleção da rodada nesta edição.
        </p>
      </div>
    );
  }

  const createdAt = new Date(activeEntry.totw.created_at).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );

  return (
    <div
      className={`stats-totw-gallery ${compact ? "stats-totw-gallery-compact" : ""}`}
      style={{ "--totw-accent": accent } as CSSProperties}
    >
      <header className="stats-totw-gallery-head">
        <h3 className="stats-totw-gallery-title">Seleção da rodada</h3>
        <div className="stats-totw-gallery-steppers">
          {phaseItems.length > 1 && (
            <PillStepper
              items={phaseItems}
              selectedId={selectedPhaseId}
              onSelect={setSelectedPhaseId}
              accentColor={accentColor}
              ariaLabel="Fases"
              compact
            />
          )}
          {roundItems.length > 0 && (
            <PillStepper
              items={roundItems}
              selectedId={selectedRoundId}
              onSelect={setSelectedRoundId}
              accentColor={accentColor}
              ariaLabel="Rodadas"
              compact
            />
          )}
        </div>
        <div className="stats-totw-gallery-meta">
          <span>{activeEntry.totw.formation}</span>
          <span>{createdAt}</span>
        </div>
      </header>

      <div className="stats-totw-gallery-body">
        <TotwPitchDesktop totw={activeEntry.totw} compact />
      </div>
    </div>
  );
}
