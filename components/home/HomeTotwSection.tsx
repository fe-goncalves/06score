import { ActiveCompetitionGlassCard } from "@/components/home/ActiveCompetitionGlassCard";
import { TotwPlayerList } from "@/components/home/TotwPlayerList";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { Competition, HomeTotw } from "@/lib/types";
import { formatMotwRoundLabel } from "@/lib/utils";
import type { CSSProperties } from "react";

interface HomeTotwSectionProps {
  totw: HomeTotw | null;
  competitions: Competition[];
  competitionName: string;
  competitionColor: string | null;
  competitionLogoUrl: string | null;
}

export function HomeTotwSection({
  totw,
  competitions,
  competitionName,
  competitionColor,
  competitionLogoUrl,
}: HomeTotwSectionProps) {
  if (!totw) return null;

  const roundLabel = formatMotwRoundLabel(totw.round_label);
  const createdAt = new Date(totw.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const accent = competitionColor ?? "var(--color-brand)";
  const panelStyle = { "--totw-color": accent } as CSSProperties;
  const activeCompetitions = competitions.slice(0, 4);

  return (
    <SectionEnter className="home-totw-section py-5 md:py-6">
      <div className="page-container">
        <header className="mb-3 flex items-start gap-3 lg:hidden">
          {competitionLogoUrl ? (
            <div className="totw-competition-logo">
              <OrgImage
                src={competitionLogoUrl}
                alt={competitionName}
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: accent }}
            >
              {competitionName}
            </p>
            <h2 className="section-title text-xl font-bold tracking-wide uppercase">
              Seleção da Rodada
            </h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="totw-meta-pill font-mono text-[10px] font-bold text-white/80">
                {roundLabel}
              </span>
              <span className="totw-meta-pill font-mono text-[10px] text-white/50">
                {createdAt}
              </span>
              <span className="totw-meta-pill font-mono text-[10px] text-white/40">
                {totw.formation}
              </span>
            </div>
          </div>
        </header>

        <div className="totw-desktop-split">
          {activeCompetitions.length > 0 ? (
            <aside className="totw-competitions-aside hidden lg:block">
              <p className="font-mono-label mb-2 text-[8px] font-bold uppercase tracking-[0.14em] text-white/40">
                Campeonatos
              </p>
              <div className="totw-competitions-stack">
                {activeCompetitions.map((competition) => (
                  <ActiveCompetitionGlassCard
                    key={competition.id}
                    competition={competition}
                  />
                ))}
              </div>
            </aside>
          ) : null}

          <div className="totw-main-column min-w-0">
            <header className="mb-3 hidden items-start gap-3 lg:flex">
              {competitionLogoUrl ? (
                <div className="totw-competition-logo">
                  <OrgImage
                    src={competitionLogoUrl}
                    alt={competitionName}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p
                  className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: accent }}
                >
                  {competitionName}
                </p>
                <h2 className="section-title text-xl font-bold tracking-wide uppercase md:text-2xl">
                  Seleção da Rodada
                </h2>
                <span className="totw-meta-pill mt-1.5 inline-block font-mono text-[10px] font-bold text-white/80">
                  {roundLabel}
                </span>
              </div>
            </header>

            <article className="totw-panel" style={panelStyle}>
              <TotwPlayerList totw={totw} />
            </article>
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
