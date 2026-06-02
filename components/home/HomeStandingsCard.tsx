import Link from "next/link";
import { StandingsTable } from "@/components/competition/StandingsTable";
import type { StandingRow, TableMarker } from "@/lib/types";

interface HomeStandingsCardProps {
  competitionId: string;
  competitionName: string;
  rows: StandingRow[];
  accentColor?: string | null;
  markers?: TableMarker[];
}

export function HomeStandingsCard({
  competitionId,
  competitionName,
  rows,
  accentColor,
  markers = [],
}: HomeStandingsCardProps) {
  return (
    <aside className="hero-standings-card flex h-full min-h-0 flex-col overflow-hidden rounded-lg">
      <header className="hero-standings-header flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <h3 className="font-display truncate text-sm font-black uppercase leading-tight text-white">
          {competitionName}
        </h3>
        <Link
          href={`/competicoes/${competitionId}`}
          className="font-mono-label shrink-0 text-[9px] font-bold uppercase text-[var(--color-brand)] transition-opacity hover:opacity-80"
          aria-label={`Ver mais — ${competitionName}`}
        >
          Ver mais →
        </Link>
      </header>

      <div className="hero-standings-body min-h-0 flex-1 overflow-hidden px-1 pb-2">
        <StandingsTable
          rows={rows}
          embedded
          maxRows={6}
          markers={markers}
          accentColor={accentColor}
          defaultView="summary"
        />
      </div>
    </aside>
  );
}
