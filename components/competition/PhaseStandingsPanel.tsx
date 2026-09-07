"use client";

import { PhaseStandingsBlock } from "@/components/competition/PhaseStandingsBlock";
import type {
  Group,
  GroupTeam,
  Match,
  MatchRound,
  Matchup,
  Phase,
  TeamEditionStats,
} from "@/lib/types";

interface PhaseStandingsPanelProps {
  phases: Phase[];
  matches: Match[];
  matchups: Matchup[];
  rounds?: MatchRound[];
  teamEditionStats: TeamEditionStats[];
  groups: Group[];
  groupTeams: GroupTeam[];
  accentColor?: string | null;
}

export function PhaseStandingsPanel({
  phases,
  matches,
  matchups,
  rounds = [],
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
            rounds={rounds}
            teamEditionStats={teamEditionStats}
            groups={groups}
            groupTeams={groupTeams}
            tableMarkers={[]}
            accentColor={accentColor}
          />
        </section>
      ))}
    </div>
  );
}
