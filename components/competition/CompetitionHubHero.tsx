import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroNextMatchRow } from "@/components/home/HeroNextMatchRow";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Competition, CompetitionEdition, Match, Phase } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

interface CompetitionHubHeroProps {
  competition: Competition;
  currentEdition: CompetitionEdition | null;
  phases: Phase[];
  matches: Match[];
  teamCount: number;
}

function seasonLabel(edition: CompetitionEdition | null): string {
  if (!edition) return "";
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name ?? edition.custom_name ?? "";
  return seasons?.name ?? edition.custom_name ?? "";
}

function currentPhaseLabel(phases: Phase[]): string {
  const current = phases.find((p) => p.is_current) ?? phases[phases.length - 1];
  if (!current) return "—";
  return current.custom_label ?? current.full_name;
}

function nextUpcomingMatch(matches: Match[]): Match | null {
  const upcoming = matches
    .filter((m) => !isMatchFinished(m.status))
    .sort((a, b) => {
      const da = `${a.match_date ?? ""}T${a.match_time ?? ""}`;
      const db = `${b.match_date ?? ""}T${b.match_time ?? ""}`;
      return da.localeCompare(db);
    });
  return upcoming[0] ?? null;
}

export function CompetitionHubHero({
  competition,
  currentEdition,
  phases,
  matches,
  teamCount,
}: CompetitionHubHeroProps) {
  const accent = competition.primary_color ?? "var(--color-brand)";
  const played = matches.filter((m) => isMatchFinished(m.status)).length;
  const nextMatch = nextUpcomingMatch(matches);

  return (
    <header
      className="competition-hub-hero"
      style={{ "--hub-accent": accent } as CSSProperties}
    >
      <div className="competition-hub-hero-ring" aria-hidden />
      <div className="competition-hub-hero-bg" aria-hidden />
      <div className="competition-hub-hero-accent" aria-hidden />

      <div className="competition-hub-hero-body">
        <div className="min-w-0 flex-1">
          <div className="competition-hub-hero-brand">
            <div className="competition-hub-logo-wrap">
              <OrgImage
                src={competition.logo_url}
                alt={competition.full_name}
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="competition-hub-title">
                {competition.full_name}
              </h1>
              <p className="competition-hub-meta">
                {seasonLabel(currentEdition)}
                {currentEdition?.is_current && (
                  <span className="competition-hub-badge">· Edição atual</span>
                )}
              </p>
            </div>
          </div>

          {nextMatch && (
            <div className="competition-hub-next md:hidden">
              <p className="competition-hub-next-label">Próximo jogo</p>
              <HeroNextMatchRow match={nextMatch} index={0} />
            </div>
          )}
        </div>

        <div className="competition-hub-stats shrink-0">
          <div className="competition-hub-stat">
            <p className="competition-hub-stat-value">{teamCount}</p>
            <p className="competition-hub-stat-label">Equipes</p>
          </div>
          <div className="competition-hub-stat">
            <p className="competition-hub-stat-value">{played}</p>
            <p className="competition-hub-stat-label">Jogos</p>
          </div>
          <div className="competition-hub-stat min-w-[7rem]">
            <p
              className="competition-hub-stat-value truncate text-sm md:text-base"
              title={currentPhaseLabel(phases)}
            >
              {currentPhaseLabel(phases).length > 12
                ? `${currentPhaseLabel(phases).slice(0, 11)}…`
                : currentPhaseLabel(phases)}
            </p>
            <p className="competition-hub-stat-label">Fase</p>
          </div>
        </div>
      </div>

      {nextMatch && (
        <div className="competition-hub-next hidden px-5 pb-5 md:block">
          <p className="competition-hub-next-label">Próximo jogo</p>
          <HeroNextMatchRow match={nextMatch} index={0} />
        </div>
      )}
    </header>
  );
}
