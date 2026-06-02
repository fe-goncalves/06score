import { StandingsTable } from "@/components/competition/StandingsTable";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { StandingRow, TableMarker } from "@/lib/types";

interface HomeStandingsSectionProps {
  rows: StandingRow[];
  accentColor?: string | null;
  markers?: TableMarker[];
}

export function HomeStandingsSection({
  rows,
  accentColor,
  markers = [],
}: HomeStandingsSectionProps) {
  return (
    <SectionEnter className="py-6">
      <StandingsTable
        rows={rows}
        title="Classificação"
        markers={markers}
        accentColor={accentColor}
      />
    </SectionEnter>
  );
}
