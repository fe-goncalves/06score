"use client";

import { AthleteMatchesList } from "@/components/athlete/AthleteMatchesList";
import type { AthleteRecentMatch } from "@/lib/types";

interface TeamMatchesPanelProps {
  matches: AthleteRecentMatch[];
  className?: string;
}

export function TeamMatchesPanel({ matches, className }: TeamMatchesPanelProps) {
  return (
    <AthleteMatchesList
      matches={matches}
      className={className}
      variant="team"
      enableEditionFilter
      emptyMessage="Nenhuma partida encontrada para este time."
      emptyFilterMessage="Nenhuma partida nesta competição."
      emptyEditionFilterMessage="Nenhuma partida nesta edição."
    />
  );
}
