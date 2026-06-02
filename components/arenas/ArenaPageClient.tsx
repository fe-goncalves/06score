"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { AthleteMatchesList } from "@/components/athlete/AthleteMatchesList";
import { ArenaHubHeader } from "@/components/arenas/ArenaHubHeader";
import type { AthleteRecentMatch, VenueProfileData } from "@/lib/types";

interface ArenaPageClientProps {
  profile: VenueProfileData;
}

export function ArenaPageClient({ profile }: ArenaPageClientProps) {
  const accent = "var(--color-brand)";

  const recentMatches = useMemo<AthleteRecentMatch[]>(
    () =>
      profile.matches.map((match) => ({
        match,
        rating: null,
        isMotm: false,
        actions: [],
      })),
    [profile.matches],
  );

  return (
    <div
      className="athlete-page arena-page"
      style={
        {
          "--athlete-accent": accent,
          "--match-accent": accent,
        } as CSSProperties
      }
    >
      <ArenaHubHeader venue={profile.venue} matchCount={profile.matches.length} />

      <div className="athlete-page-panel">
        <div className="arena-page-main">
          <h2 className="arena-page-section-title">Jogos nesta arena</h2>
          <AthleteMatchesList
            matches={recentMatches}
            emptyMessage="Nenhum jogo registrado nesta arena."
            emptyFilterMessage="Nenhuma partida nesta competição."
            className="arena-matches-panel"
          />
        </div>
      </div>
    </div>
  );
}
