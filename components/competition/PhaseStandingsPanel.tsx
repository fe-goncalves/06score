"use client";

import { PhaseStandingsBlock } from "@/components/competition/PhaseStandingsBlock";
import type {
  Group,
  GroupTeam,
  Match,
  Matchup,
  Phase,
  TeamEditionStats,
} from "@/lib/types";

interface PhaseStandingsPanelProps {
  phases: Phase[];
  matches: Match[];
  matchups: Matchup[];
  teamEditionStats: TeamEditionStats[];
  groups: Group[];
  groupTeams: GroupTeam[];
  accentColor?: string | null;
}

export function PhaseStandingsPanel({
  phases,
  matches,
  matchups,
  teamEditionStats,
  groups,
  groupTeams,
  accentColor,
}: PhaseStandingsPanelProps) {
  if (!phases.length) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Nenhuma fase cadastrada.
      </p>
    );
  }

  return (
    <div>
      {phases.map((phase) => (
        <section key={phase.id} className="mb-12">
          <h3 className="competition-phase-section-title">
            {phase.custom_label ?? phase.full_name}
          </h3>
          <PhaseStandingsBlock
            phase={phase}
            matches={matches}
            matchups={matchups}
            teamEditionStats={teamEditionStats}
            groups={groups}
            groupTeams={groupTeams}
            accentColor={accentColor}
          />
        </section>
      ))}
    </div>
  );
}
