"use client";

import { CompetitionGalleryMatchCard } from "@/components/competition/CompetitionGalleryMatchCard";
import type { Match } from "@/lib/types";

interface PhaseMatchesGalleryProps {
  matches: Match[];
  accentColor?: string | null;
  empty?: boolean;
}

export function PhaseMatchesGallery({
  matches,
  accentColor,
  empty = false,
}: PhaseMatchesGalleryProps) {
  if (empty || !matches.length) {
    return (
      <div className="competition-tab-matches-empty">
        <p className="font-mono-label text-xs text-white/40">
          {empty
            ? "Nenhuma partida nesta fase."
            : "Nenhuma partida nesta rodada."}
        </p>
      </div>
    );
  }

  return (
    <div className="competition-tab-matches">
      <div className="competition-tab-matches-list">
        {matches.map((match, index) => (
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
