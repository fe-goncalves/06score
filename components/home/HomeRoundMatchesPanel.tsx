"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CompetitionGalleryMatchCard } from "@/components/competition/CompetitionGalleryMatchCard";
import { PillStepper } from "@/components/ui/PillStepper";
import { buildRoundGroups } from "@/lib/competition/rounds";
import type { Match, Matchup } from "@/lib/types";

interface HomeRoundMatchesPanelProps {
  competitionId: string | null;
  competitionName: string;
  competitionColor: string | null;
  phaseMatches: Match[];
  phaseMatchups: Matchup[];
  phaseId: string | null;
}

export function HomeRoundMatchesPanel({
  competitionColor,
  phaseMatches,
  phaseMatchups,
  phaseId,
}: HomeRoundMatchesPanelProps) {
  const filteredMatches = useMemo(
    () =>
      phaseId
        ? phaseMatches.filter((m) => m.phase_id === phaseId)
        : phaseMatches,
    [phaseMatches, phaseId],
  );

  const roundGroups = useMemo(
    () => buildRoundGroups(filteredMatches, phaseMatchups),
    [filteredMatches, phaseMatchups],
  );

  const [selectedRoundId, setSelectedRoundId] = useState("");

  useEffect(() => {
    setSelectedRoundId(roundGroups[0]?.id ?? "");
  }, [phaseId, roundGroups]);

  const roundItems = useMemo(
    () => roundGroups.map((g) => ({ id: g.id, label: g.label })),
    [roundGroups],
  );

  const activeRound =
    roundGroups.find((g) => g.id === selectedRoundId) ?? roundGroups[0];

  return (
    <section
      className="home-comp-panel home-comp-panel-matches"
      style={
        {
          "--comp-accent": competitionColor ?? "var(--color-brand)",
        } as CSSProperties
      }
    >
      <h3 className="home-comp-panel-label">Jogos</h3>

      {!filteredMatches.length ? (
        <p className="home-comp-empty">Nenhuma partida nesta fase.</p>
      ) : (
        <>
          <div className="home-comp-round-stepper">
            <PillStepper
              items={roundItems}
              selectedId={activeRound?.id ?? selectedRoundId}
              onSelect={setSelectedRoundId}
              accentColor={competitionColor}
              ariaLabel="Rodadas"
              compact
            />
          </div>

          <div className="home-comp-matches-list">
            {activeRound?.matches.map((match, index) => (
              <CompetitionGalleryMatchCard
                key={match.id}
                match={match}
                index={index}
                accentColor={competitionColor}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
