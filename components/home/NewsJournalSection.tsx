import Link from "next/link";
import type { CSSProperties } from "react";
import { BracketView } from "@/components/competition/BracketView";
import { StandingsTable } from "@/components/competition/StandingsTable";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type {
  HomeNewsArticle,
  Match,
  Matchup,
  Phase,
  StandingRow,
} from "@/lib/types";

interface NewsJournalSectionProps {
  articles: HomeNewsArticle[];
  competitionId: string | null;
  competitionName: string;
  competitionColor: string | null;
  competitionLogoUrl: string | null;
  editionName: string | null;
  phaseName: string | null;
  standings: StandingRow[];
  currentPhaseType: Phase["phase_type"] | null;
  phaseMatches: Match[];
  phaseMatchups: Matchup[];
  /** Quantas notícias o hero já exibe (evita repetir no grid) */
  skipCount?: number;
}

function JournalCard({
  article,
  featured = false,
}: {
  article: HomeNewsArticle;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/news/${article.id}`}
      className={`news-journal-card group block ${featured ? "news-journal-featured" : ""}`}
    >
      <article className="flex flex-col">
        <div
          className={`news-card-media relative overflow-hidden bg-white/[0.05] ${featured ? "aspect-[16/10] md:aspect-[2/1]" : "aspect-[16/11]"}`}
        >
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col border-t border-white/[0.06] p-4 md:p-5">
          <h3
            className={`font-display font-black uppercase leading-tight text-white group-hover:text-[var(--color-brand)] ${featured ? "text-xl md:text-2xl" : "text-base"}`}
          >
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="font-body mt-2 line-clamp-3 text-sm leading-relaxed text-white/50">
              {article.subtitle}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

export function NewsJournalSection({
  articles,
  competitionId,
  competitionName,
  competitionColor,
  competitionLogoUrl,
  editionName,
  phaseName,
  standings,
  currentPhaseType,
  phaseMatches,
  phaseMatchups,
  skipCount = 3,
}: NewsJournalSectionProps) {
  const items = articles.slice(skipCount, skipCount + 5);

  if (!items.length) {
    return null;
  }

  const [lead, ...rest] = items;
  if (!lead) return null;
  const columnA = rest.filter((_, i) => i % 2 === 0);
  const columnB = rest.filter((_, i) => i % 2 === 1);

  return (
    <SectionEnter className="py-8 md:py-10">
      <div className="page-container">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
          <div className="news-journal-grid border border-white/[0.06]">
            <div className="news-journal-lead border-b border-white/[0.06] md:border-b-0 md:border-r">
              <JournalCard article={lead} featured />
            </div>

            <div className="news-journal-columns grid md:grid-cols-2">
              <div className="news-journal-col border-b border-white/[0.06] md:border-b-0 md:border-r">
                {columnA.map((article) => (
                  <div
                    key={article.id}
                    className="border-b border-white/[0.06] last:border-b-0"
                  >
                    <JournalCard article={article} />
                  </div>
                ))}
              </div>
              <div className="news-journal-col">
                {columnB.map((article) => (
                  <div
                    key={article.id}
                    className="border-b border-white/[0.06] last:border-b-0"
                  >
                    <JournalCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside
            className="news-side-panel card-surface overflow-hidden rounded-lg border border-white/[0.06] p-3"
            style={
              {
                "--news-panel-color": competitionColor ?? "var(--color-brand)",
              } as CSSProperties
            }
          >
            <Link
              href={competitionId ? `/competicoes/${competitionId}` : "/competicoes"}
              className="news-side-competition group mb-3 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5"
            >
              {competitionLogoUrl ? (
                <OrgImage
                  src={competitionLogoUrl}
                  alt={competitionName || "Competição"}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              ) : null}
              <div className="min-w-0">
                <p className="font-mono-label text-[8px] uppercase tracking-[0.14em] text-white/45">
                  {editionName ?? competitionName ?? "Edição atual"}
                </p>
                <p className="font-display truncate text-sm font-black uppercase text-white">
                  {phaseName ?? "Fase atual"}
                </p>
              </div>
            </Link>
            {currentPhaseType === "conference" || currentPhaseType === "knockout" ? (
              <BracketView matchups={phaseMatchups} matches={phaseMatches} />
            ) : (
              <StandingsTable rows={standings} />
            )}
          </aside>
        </div>
      </div>
    </SectionEnter>
  );
}
