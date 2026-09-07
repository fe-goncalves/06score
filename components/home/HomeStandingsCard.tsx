import Link from "next/link";
import type { CSSProperties } from "react";
import { StandingsTable } from "@/components/competition/StandingsTable";
import { OrgImage } from "@/components/ui/OrgImage";
import type { StandingRow, TableMarker } from "@/lib/types";

interface HomeStandingsCardProps {
  competitionId: string;
  competitionName: string;
  competitionLogoUrl: string | null;
  editionName: string | null;
  phaseName: string | null;
  rows: StandingRow[];
  accentColor?: string | null;
  markers?: TableMarker[];
}

export function HomeStandingsCard({
  competitionId,
  competitionName,
  competitionLogoUrl,
  editionName,
  phaseName,
  rows,
  accentColor,
  markers = [],
}: HomeStandingsCardProps) {
  const accent = accentColor ?? "var(--color-brand)";

  return (
    <aside
      className="hero-standings-card flex h-full min-h-0 flex-col overflow-hidden rounded-lg"
      style={{ "--hero-standings-accent": accent } as CSSProperties}
    >
      <header className="hero-standings-header flex shrink-0 items-start justify-between gap-2 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {competitionLogoUrl ? (
            <OrgImage
              src={competitionLogoUrl}
              alt={competitionName}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
            />
          ) : null}
          <div className="min-w-0">
            <p className="font-mono-label text-[8px] uppercase tracking-[0.12em] text-white/50">
              {editionName ?? competitionName}
            </p>
            <h3 className="font-display truncate text-sm font-black uppercase leading-tight text-white">
              {phaseName ?? competitionName}
            </h3>
          </div>
        </div>
        <Link
          href={`/competicoes/${competitionId}`}
          className="hero-standings-more font-mono-label shrink-0 text-[9px] font-bold uppercase transition-opacity hover:opacity-80"
          aria-label={`Ver mais — ${competitionName}`}
        >
          Ver mais →
        </Link>
      </header>

      <div className="hero-standings-body min-h-0 flex-1 overflow-hidden overflow-y-auto px-1 py-1">
        <StandingsTable
          rows={rows}
          embedded
          maxRows={8}
          markers={markers}
          accentColor={accentColor}
          defaultView="summary"
          showViewSwitcher={false}
        />
      </div>
    </aside>
  );
}
