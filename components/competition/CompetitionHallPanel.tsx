import { PremiacoesSection } from "@/components/competition/PremiacoesSection";
import type { EditionAward, EditionTotsSquad } from "@/lib/types";

interface CompetitionHallPanelProps {
  awards: EditionAward[];
  totsSquad: EditionTotsSquad | null;
  accentColor?: string | null;
}

export function CompetitionHallPanel({
  awards,
  totsSquad,
  accentColor,
}: CompetitionHallPanelProps) {
  if (!awards.length && !totsSquad) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Premiações ainda não disponíveis para esta edição.
      </p>
    );
  }

  return (
    <PremiacoesSection
      awards={awards}
      totsSquad={totsSquad}
      accentColor={accentColor}
    />
  );
}
