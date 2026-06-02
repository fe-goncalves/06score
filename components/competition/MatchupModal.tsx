"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { CompetitionGalleryMatchCard } from "@/components/competition/CompetitionGalleryMatchCard";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Match, Matchup } from "@/lib/types";

interface MatchupModalProps {
  matchup: Matchup;
  matches: Match[];
  accentColor?: string | null;
  onClose: () => void;
}

function teamShortName(team: Matchup["teams_a"]): string {
  if (!team) return "TBD";
  return team.short_name ?? team.full_name ?? "TBD";
}

export function MatchupModal({
  matchup,
  matches,
  accentColor,
  onClose,
}: MatchupModalProps) {
  const related = matches.filter((m) => m.matchup_id === matchup.id);
  const accent = accentColor ?? "var(--color-brand)";
  const title = `${teamShortName(matchup.teams_a)} × ${teamShortName(matchup.teams_b)}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="matchup-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="matchup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matchup-modal-title"
        style={{ "--matchup-accent": accent } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="matchup-modal-head">
          <div className="matchup-modal-teams">
            <OrgImage
              src={matchup.teams_a?.logo_url}
              alt={teamShortName(matchup.teams_a)}
              width={28}
              height={28}
              className="matchup-modal-logo"
            />
            <h2 id="matchup-modal-title" className="matchup-modal-title">
              {title}
            </h2>
            <OrgImage
              src={matchup.teams_b?.logo_url}
              alt={teamShortName(matchup.teams_b)}
              width={28}
              height={28}
              className="matchup-modal-logo"
            />
          </div>
          <button
            type="button"
            className="matchup-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="matchup-modal-body">
          {related.length ? (
            related.map((match, index) => (
              <CompetitionGalleryMatchCard
                key={match.id}
                match={match}
                index={index}
                accentColor={accentColor}
              />
            ))
          ) : (
            <p className="matchup-modal-empty font-mono-label text-xs text-white/40">
              Nenhuma partida registrada neste confronto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
