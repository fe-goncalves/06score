import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Competition } from "@/lib/types";

interface ActiveCompetitionGlassCardProps {
  competition: Competition;
}

function seasonLabel(competition: Competition): string {
  const edition = competition.competition_editions?.[0];
  const seasons = edition?.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name ?? "Temporada atual";
  return seasons?.name ?? "Temporada atual";
}

export function ActiveCompetitionGlassCard({
  competition,
}: ActiveCompetitionGlassCardProps) {
  const accent = competition.primary_color ?? "var(--color-brand)";
  const name = competition.short_name ?? competition.full_name;

  return (
    <Link
      href={`/competicoes/${competition.id}`}
      className="competition-glass-card group"
      style={{ "--comp-color": accent } as CSSProperties}
    >
      <div className="competition-glass-card-inner">
        <div className="competition-glass-card-glow" aria-hidden />
        {competition.logo_url ? (
          <OrgImage
            src={competition.logo_url}
            alt={competition.full_name}
            width={48}
            height={48}
            className="competition-glass-card-logo"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-sm font-black uppercase leading-tight text-white">
            {name}
          </p>
          <p className="font-mono-label mt-0.5 truncate text-[9px] uppercase text-white/45">
            {seasonLabel(competition)}
          </p>
        </div>
      </div>
    </Link>
  );
}
