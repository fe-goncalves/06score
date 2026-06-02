"use client";

import { useEffect, useMemo, useState } from "react";
import { CompetitionGalleryMatchCard } from "@/components/competition/CompetitionGalleryMatchCard";
import { PillStepper } from "@/components/ui/PillStepper";
import { buildRoundGroups } from "@/lib/competition/rounds";
import type { Match, Matchup } from "@/lib/types";

interface PhaseMatchesGalleryProps {
  matches: Match[];
  matchups: Matchup[];
  phaseId: string;
  accentColor?: string | null;
}

export function PhaseMatchesGallery({
  matches,
  matchups,
  phaseId,
  accentColor,
}: PhaseMatchesGalleryProps) {
  const phaseMatches = useMemo(
    () => matches.filter((m) => m.phase_id === phaseId),
    [matches, phaseId],
  );

  const roundGroups = useMemo(
    () => buildRoundGroups(phaseMatches, matchups),
    [phaseMatches, matchups],
  );

  const [selectedRoundId, setSelectedRoundId] = useState<string>("");

  useEffect(() => {
    setSelectedRoundId(roundGroups[0]?.id ?? "");
  }, [phaseId, roundGroups]);

  const roundItems = useMemo(
    () => roundGroups.map((g) => ({ id: g.id, label: g.label })),
    [roundGroups],
  );

  const activeRound =
    roundGroups.find((g) => g.id === selectedRoundId) ?? roundGroups[0];

  if (!phaseMatches.length) {
    return (
      <div className="competition-tab-matches-empty">
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma partida nesta fase.
        </p>
      </div>
    );
  }

  return (
    <div className="competition-tab-matches">
      <div className="competition-tab-matches-head">
        <PillStepper
          items={roundItems}
          selectedId={activeRound?.id ?? selectedRoundId}
          onSelect={setSelectedRoundId}
          accentColor={accentColor}
          ariaLabel="Rodadas"
          compact
        />
      </div>

      <div className="competition-tab-matches-list">
        {activeRound?.matches.map((match, index) => (
          <CompetitionGalleryMatchCard
            key={match.id}
            match={match}
            index={index}
            accentColor={accentColor}
          />
        ))}
      </div>
    </div>
  );
}
