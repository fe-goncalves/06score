"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { HomeStandingsCard } from "@/components/home/HomeStandingsCard";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { HeroNextMatchRow } from "@/components/home/HeroNextMatchRow";
import type { HomeMotw, HomeNewsArticle, Match, StandingRow } from "@/lib/types";
import {
  getHeroFallbackNews,
  getHeroNews,
} from "@/lib/home/news";
import { getHeroUpcomingMatches } from "@/lib/home/hero-matches";
import { formatMotwRoundLabel } from "@/lib/utils";

interface HomeHeroProps {
  articles: HomeNewsArticle[];
  upcoming: Match[];
  latestMotw: HomeMotw | null;
  standings: StandingRow[];
  competitionId: string | null;
  competitionName: string;
  competitionColor: string | null;
}

export function HomeHero({
  articles,
  upcoming,
  latestMotw,
  standings,
  competitionId,
  competitionName,
  competitionColor,
}: HomeHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const topNews = getHeroNews(articles);
  const count = topNews.length;
  const safeIndex = count ? index % count : 0;
  const nextMatches = getHeroUpcomingMatches(upcoming, 7, 3);
  const fallbackNews = getHeroFallbackNews(articles);
  const showUpcomingMatches = nextMatches.length > 0;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const topNewsKey = topNews.map((a) => a.id).join(",");

  useEffect(() => {
    setIndex(0);
  }, [topNewsKey]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, count, topNewsKey]);

  const activeArticle = topNews[safeIndex];

  return (
    <SectionEnter className="py-6">
      <div className="page-container">
        <div className="hero-grid-v2">
          <div
            className="hero-carousel relative h-[260px] overflow-hidden rounded-lg md:h-[420px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              const start = touchStartX.current;
              if (start == null || count <= 1) return;
              const end = e.changedTouches[0]?.clientX ?? start;
              const delta = end - start;
              if (Math.abs(delta) > 40) {
                goTo(delta < 0 ? safeIndex + 1 : safeIndex - 1);
              }
              touchStartX.current = null;
            }}
          >
            {count === 0 || !activeArticle ? (
              <div className="card-surface flex h-full items-center justify-center">
                <p className="font-mono-label text-xs text-white/40">
                  Nenhuma notícia publicada.
                </p>
              </div>
            ) : (
              <>
                <Link
                  href={`/news/${activeArticle.id}`}
                  className="frosted-glass-hover group block h-full"
                >
                  <article className="relative h-full w-full overflow-hidden rounded-lg">
                    <div className="news-card-media absolute inset-0 bg-white/5">
                      {activeArticle.cover_url && (
                        <OrgImage
                          src={activeArticle.cover_url}
                          alt={activeArticle.title}
                          fill
                          className="object-cover transition-opacity duration-300"
                        />
                      )}
                    </div>
                    <div className="hero-slide-caption frosted-glass absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <span className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
                        Notícias
                      </span>
                      <h2 className="font-display mt-1 line-clamp-2 text-lg font-black uppercase leading-tight text-white md:text-[22px]">
                        {activeArticle.title}
                      </h2>
                    </div>
                  </article>
                </Link>

                {count > 1 && (
                  <>
                    <button
                      type="button"
                      className="hero-carousel-arrow hero-carousel-arrow-prev"
                      onClick={() => goTo(safeIndex - 1)}
                      aria-label="Notícia anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="hero-carousel-arrow hero-carousel-arrow-next"
                      onClick={() => goTo(safeIndex + 1)}
                      aria-label="Próxima notícia"
                    >
                      ›
                    </button>

                    <div className="hero-carousel-controls">
                      <span className="font-mono-label text-[9px] font-bold uppercase text-white/50">
                        {safeIndex + 1} / {count}
                      </span>
                      <div
                        className="hero-carousel-dots"
                        role="tablist"
                        aria-label="Escolher notícia"
                      >
                        {topNews.map((article, i) => (
                          <button
                            key={article.id}
                            type="button"
                            role="tab"
                            aria-selected={i === safeIndex}
                            aria-label={`Notícia ${i + 1}: ${article.title}`}
                            onClick={() => setIndex(i)}
                            className={`hero-carousel-dot ${i === safeIndex ? "hero-carousel-dot-active" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="hero-side-grid">
            {latestMotw ? (
              <article
                className="motw-card group relative overflow-hidden rounded-lg p-4 md:p-5"
                style={
                  {
                    "--motw-color": competitionColor ?? "var(--color-brand)",
                  } as CSSProperties
                }
              >
                <div className="motw-card-ring" aria-hidden="true" />
                <div className="motw-card-bg absolute inset-0 rounded-lg" aria-hidden="true" />
                <div className="motw-card-accent absolute inset-0 rounded-lg" aria-hidden="true" />
                {latestMotw.team_logo_url ? (
                  <div className="motw-card-team-logo">
                    <OrgImage
                      src={latestMotw.team_logo_url}
                      alt={latestMotw.team_name ?? "Equipe"}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                ) : null}
                {latestMotw.athlete_photo_url && (
                  <div className="motw-athlete-figure absolute bottom-0 right-0 h-[84%] w-[58%]">
                    <OrgImage
                      src={latestMotw.athlete_photo_url}
                      alt={latestMotw.athlete_surname ?? latestMotw.athlete_name}
                      fill
                      className="object-contain object-bottom"
                    />
                  </div>
                )}
                <div className="relative z-10 max-w-[68%]">
                  <p className="font-mono-label text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--motw-color)]">
                    {formatMotwRoundLabel(latestMotw.round_label)}
                  </p>
                  <h3 className="motw-card-surname font-display mt-3 truncate text-2xl font-black uppercase leading-none text-white">
                    {latestMotw.athlete_surname ?? latestMotw.athlete_name}
                  </h3>
                  <p className="font-mono-label mt-1 text-[10px] uppercase text-white/70">
                    {latestMotw.team_name ?? "Equipe não informada"}
                  </p>
                </div>
              </article>
            ) : competitionId ? (
              <div className="min-h-[160px]">
                <HomeStandingsCard
                  competitionId={competitionId}
                  competitionName={competitionName}
                  rows={standings}
                  accentColor={competitionColor}
                />
              </div>
            ) : (
              <article className="card-surface rounded-lg border border-white/10 p-4 md:p-5">
                <p className="font-body text-sm leading-relaxed text-white/65">
                  Sem MOTW registrado e sem tabela disponível no momento.
                </p>
              </article>
            )}

            {showUpcomingMatches ? (
              <article className="card-surface rounded-lg border border-white/10 p-4 md:p-5">
                <p className="font-mono-label text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
                  Proximos jogos
                </p>
                <div className="mt-3 space-y-2">
                  {nextMatches.map((match, idx) => (
                    <HeroNextMatchRow key={match.id} match={match} index={idx} />
                  ))}
                </div>
              </article>
            ) : fallbackNews ? (
              <Link
                href={`/news/${fallbackNews.id}`}
                className="card-surface group block overflow-hidden rounded-lg border border-white/10"
              >
                <div className="relative aspect-[16/9] bg-white/5">
                  {fallbackNews.cover_url ? (
                    <OrgImage
                      src={fallbackNews.cover_url}
                      alt={fallbackNews.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
                      Notícias
                    </span>
                    <h4 className="font-display mt-1 line-clamp-2 text-sm font-black uppercase leading-tight text-white md:text-base">
                      {fallbackNews.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ) : (
              <article className="card-surface rounded-lg border border-white/10 p-4 md:p-5">
                <p className="font-body text-sm leading-relaxed text-white/65">
                  Nenhuma partida ou notícia disponível no momento.
                </p>
              </article>
            )}
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
