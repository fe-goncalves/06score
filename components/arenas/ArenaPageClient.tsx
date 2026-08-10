"use client";

import type { CSSProperties } from "react";
import { ArenaHubHeader } from "@/components/arenas/ArenaHubHeader";
import { PhaseMatchesGallery } from "@/components/competition/PhaseMatchesGallery";
import type { VenueProfileData } from "@/lib/types";

interface ArenaPageClientProps {
  profile: VenueProfileData;
}

export function ArenaPageClient({ profile }: ArenaPageClientProps) {
  const accent = "var(--color-brand)";

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
          {profile.matches.length ? (
            <PhaseMatchesGallery
              matches={profile.matches}
              accentColor={accent}
            />
          ) : (
            <div className="competition-tab-matches-empty">
              <p className="font-mono-label text-xs text-white/40">
                Nenhum jogo registrado nesta arena.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
