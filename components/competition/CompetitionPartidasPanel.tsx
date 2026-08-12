"use client";

import { useEffect, useMemo, useState } from "react";
import { PhaseMatchesGallery } from "@/components/competition/PhaseMatchesGallery";
import { PillStepper } from "@/components/ui/PillStepper";
import {
  getDefaultPhaseId,
  phaseLabel,
  sortPhases,
} from "@/lib/competition/phases";
import { buildRoundGroups } from "@/lib/competition/rounds";
import type { Match, Matchup, Phase } from "@/lib/types";

interface CompetitionPartidasPanelProps {
  matches: Match[];
  phases: Phase[];
  matchups: Matchup[];
  accentColor?: string | null;
}

export function CompetitionPartidasPanel({
  matches,
  phases,
  matchups,
  accentColor,
}: CompetitionPartidasPanelProps) {
  const sortedPhases = useMemo(() => sortPhases(phases), [phases]);
  const defaultPhaseId = useMemo(
    () => getDefaultPhaseId(sortedPhases),
    [sortedPhases],
  );
  const [phaseId, setPhaseId] = useState<string | null>(defaultPhaseId);

  const activePhaseId = phaseId ?? defaultPhaseId;
  const activePhase = sortedPhases.find((p) => p.id === activePhaseId);

  const phaseItems = useMemo(
    () =>
      sortedPhases.map((p) => ({
        id: p.id,
        label: phaseLabel(p),
      })),
    [sortedPhases],
  );

  const phaseMatches = useMemo(
    () =>
      activePhase
        ? matches.filter((m) => m.phase_id === activePhase.id)
        : [],
    [matches, activePhase],
  );

  const roundGroups = useMemo(
    () => buildRoundGroups(phaseMatches, matchups),
    [phaseMatches, matchups],
  );

  const [selectedRoundId, setSelectedRoundId] = useState<string>("");

  useEffect(() => {
    setSelectedRoundId(roundGroups[0]?.id ?? "");
  }, [activePhase?.id, roundGroups]);

  const roundItems = useMemo(
    () => roundGroups.map((g) => ({ id: g.id, label: g.label })),
    [roundGroups],
  );

  const activeRound =
    roundGroups.find((g) => g.id === selectedRoundId) ?? roundGroups[0];

  if (!sortedPhases.length) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Nenhuma fase cadastrada.
      </p>
    );
  }

  if (!activePhase) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Fase não encontrada.
      </p>
    );
  }

  return (
    <div className="competition-partidas-panel">
      <div className="competition-partidas-steppers">
        <PillStepper
          items={phaseItems}
          selectedId={activePhase.id}
          onSelect={setPhaseId}
          accentColor={accentColor}
          ariaLabel="Fases da competição"
        />
        {roundItems.length > 0 ? (
          <PillStepper
            items={roundItems}
            selectedId={activeRound?.id ?? selectedRoundId}
            onSelect={setSelectedRoundId}
            accentColor={accentColor}
            ariaLabel="Rodadas"
            compact
          />
        ) : null}
      </div>

      <PhaseMatchesGallery
        matches={activeRound?.matches ?? []}
        accentColor={accentColor}
        empty={!phaseMatches.length}
      />
    </div>
  );
}
