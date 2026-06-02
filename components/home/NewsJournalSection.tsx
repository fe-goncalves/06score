import Link from "next/link";
import type { CSSProperties } from "react";
import { BracketView } from "@/components/competition/BracketView";
import { StandingsTable } from "@/components/competition/StandingsTable";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { getJournalNews, HERO_NEWS_COUNT } from "@/lib/home/news";
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

const MOBILE_NEWS_LIMIT = 2;
const DESKTOP_NEWS_LIMIT = 5;

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

function JournalListItem({ article }: { article: HomeNewsArticle }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="news-journal-list-item group block"
    >
      <h3 className="font-display line-clamp-2 text-sm font-black uppercase leading-snug text-white group-hover:text-[var(--color-brand)]">
        {article.title}
      </h3>
      {article.subtitle ? (
        <p className="font-body mt-1 line-clamp-2 text-xs leading-relaxed text-white/45">
          {article.subtitle}
        </p>
      ) : null}
    </Link>
  );
}

function VerMaisLink() {
  return (
    <div className="flex shrink-0 justify-end pt-2">
      <Link
        href="/news"
        className="font-mono-label inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
      >
        Ver mais
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function CompetitionPreviewPanel({
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
}: Omit<NewsJournalSectionProps, "articles" | "skipCount">) {
  return (
    <aside
      className="news-side-panel card-surface min-w-0 overflow-hidden rounded-lg border border-white/[0.06] p-3"
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
      <div className="news-side-panel-scroll">
        {currentPhaseType === "conference" || currentPhaseType === "knockout" ? (
          <BracketView matchups={phaseMatchups} matches={phaseMatches} />
        ) : (
          <StandingsTable
            rows={standings}
            embedded
            maxRows={8}
            accentColor={competitionColor}
          />
        )}
      </div>
    </aside>
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
  skipCount = HERO_NEWS_COUNT,
}: NewsJournalSectionProps) {
  const desktopItems = getJournalNews(articles, DESKTOP_NEWS_LIMIT, skipCount);
  const mobileItems = getJournalNews(articles, MOBILE_NEWS_LIMIT, skipCount);
  const hasDesktopJournal = desktopItems.length > 0;
  const hasMobileJournal = mobileItems.length > 0;
  const showCompetitionPanel = Boolean(competitionId);

  if (!hasDesktopJournal && !hasMobileJournal && !showCompetitionPanel) {
    return null;
  }

  const [lead, ...rest] = desktopItems;
  const columnA = rest.filter((_, i) => i % 2 === 0);
  const columnB = rest.filter((_, i) => i % 2 === 1);

  const panelProps = {
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
  };

  return (
    <SectionEnter className="news-journal-section py-8 md:py-10">
      <div className="page-container min-w-0">
        {/* Mobile: scroll horizontal — prévia + notícias em lista */}
        {(showCompetitionPanel || hasMobileJournal) && (
          <div className="news-journal-mobile md:hidden">
            <div className="news-journal-mobile-scroll">
              <div className="news-journal-mobile-track">
                {showCompetitionPanel ? (
                  <div className="news-journal-mobile-panel">
                    <CompetitionPreviewPanel {...panelProps} />
                  </div>
                ) : null}
                {hasMobileJournal ? (
                  <div className="news-journal-mobile-news">
                    <div className="news-journal-list border border-white/[0.06]">
                      {mobileItems.map((article, index) => (
                        <div
                          key={article.id}
                          className={
                            index < mobileItems.length - 1
                              ? "border-b border-white/[0.06]"
                              : ""
                          }
                        >
                          <JournalListItem article={article} />
                        </div>
                      ))}
                    </div>
                    <VerMaisLink />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Desktop: grid jornal + painel */}
        <div
          className={`hidden md:grid md:gap-4 md:items-start ${
            hasDesktopJournal && showCompetitionPanel
              ? "md:grid-cols-[minmax(0,1fr)_360px]"
              : ""
          }`}
        >
          {hasDesktopJournal && lead ? (
            <div className="flex min-w-0 flex-col gap-3">
              <div className="news-journal-grid min-w-0 border border-white/[0.06]">
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

              <VerMaisLink />
            </div>
          ) : null}

          {showCompetitionPanel ? (
            <div className={hasDesktopJournal ? "min-w-0" : "max-w-lg"}>
              <CompetitionPreviewPanel {...panelProps} />
            </div>
          ) : null}
        </div>
      </div>
    </SectionEnter>
  );
}
