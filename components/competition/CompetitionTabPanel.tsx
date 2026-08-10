"use client";

import { useMemo, useState } from "react";
import { PhaseStandingsBlock } from "@/components/competition/PhaseStandingsBlock";
import { PillStepper } from "@/components/ui/PillStepper";
import {
  getDefaultPhaseId,
  phaseLabel,
  sortPhases,
} from "@/lib/competition/phases";
import type {
  Group,
  GroupTeam,
  Match,
  MatchRound,
  Matchup,
  Phase,
  TableMarker,
  TeamEditionStats,
} from "@/lib/types";

interface CompetitionTabPanelProps {
  phases: Phase[];
  matches: Match[];
  matchups: Matchup[];
  rounds: MatchRound[];
  teamEditionStats: TeamEditionStats[];
  groups: Group[];
  groupTeams: GroupTeam[];
  tableMarkers: TableMarker[];
  accentColor?: string | null;
}

export function CompetitionTabPanel({
  phases,
  matches,
  matchups,
  rounds,
  teamEditionStats,
  groups,
  groupTeams,
  tableMarkers,
  accentColor,
}: CompetitionTabPanelProps) {
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
    <div className="competition-tab-panel">
      <div className="competition-tab-phase-bar">
        <span className="competition-tab-phase-label">Fase</span>
        <PillStepper
          items={phaseItems}
          selectedId={activePhase.id}
          onSelect={setPhaseId}
          accentColor={accentColor}
          ariaLabel="Fases da competição"
        />
      </div>

      <div className="competition-tab-standings competition-tab-standings--solo">
        <PhaseStandingsBlock
          phase={activePhase}
          matches={matches}
          matchups={matchups}
          rounds={rounds}
          teamEditionStats={teamEditionStats}
          groups={groups}
          groupTeams={groupTeams}
          tableMarkers={tableMarkers}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}
