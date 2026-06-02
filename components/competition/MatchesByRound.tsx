"use client";

import { useMemo, useState } from "react";
import { CompetitionMatchRow } from "@/components/competition/CompetitionMatchRow";
import { PhaseFilter } from "@/components/competition/PhaseFilter";
import { buildRoundGroups } from "@/lib/competition/rounds";
import type { Match, Matchup, Phase } from "@/lib/types";

interface MatchesByRoundProps {
  matches: Match[];
  phases: Phase[];
  matchups: Matchup[];
  accentColor?: string | null;
}

export function MatchesByRound({
  matches,
  phases,
  matchups,
  accentColor,
}: MatchesByRoundProps) {
  const [phaseId, setPhaseId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!phaseId) return matches;
    return matches.filter((m) => m.phase_id === phaseId);
  }, [matches, phaseId]);

  const groups = useMemo(
    () => buildRoundGroups(filtered, matchups),
    [filtered, matchups],
  );

  let rowIndex = 0;

  return (
    <div>
      <PhaseFilter
        phases={phases}
        selectedPhaseId={phaseId}
        onChange={setPhaseId}
        accentColor={accentColor}
      />
      {!groups.length ? (
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma partida encontrada.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="competition-round-title">{group.label}</h3>
              <div className="space-y-2">
                {group.matches.map((m) => {
                  const idx = rowIndex++;
                  return (
                    <CompetitionMatchRow
                      key={m.id}
                      match={m}
                      index={idx}
                      accentColor={accentColor}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
