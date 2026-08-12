"use client";

import { MatchCard } from "@/components/home/MatchCard";
import type { Match } from "@/lib/types";

interface MatchRoundPanelProps {
  matches: Match[];
  currentMatchId: string;
  roundLabel?: string | null;
}

export function MatchRoundPanel({
  matches,
  currentMatchId,
  roundLabel,
}: MatchRoundPanelProps) {
  if (!matches.length) {
    return (
      <p className="match-empty-state match-empty-state--sub">
        Nenhuma partida nesta rodada.
      </p>
    );
  }

  return (
    <div className="match-round-panel">
      {roundLabel ? (
        <h2 className="match-round-panel-title">{roundLabel}</h2>
      ) : null}
      <ul className="match-round-list">
        {matches.map((match, index) => (
          <li
            key={match.id}
            className={
              match.id === currentMatchId
                ? "match-round-item match-round-item--current"
                : "match-round-item"
            }
          >
            <MatchCard match={match} index={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}
