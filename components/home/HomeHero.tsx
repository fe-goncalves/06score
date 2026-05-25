"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeStandingsCard } from "@/components/home/HomeStandingsCard";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { HomeNewsArticle, StandingRow } from "@/lib/types";
import { formatPublishedDate } from "@/lib/utils";

interface HomeHeroProps {
  articles: HomeNewsArticle[];
  standings: StandingRow[];
  competitionId: string | null;
  competitionName: string;
}

export function HomeHero({
  articles,
  standings,
  competitionId,
  competitionName,
}: HomeHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = articles.length;
  const safeIndex = count ? index % count : 0;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    setIndex(0);
  }, [articles]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, count, articles]);

  const standingsBlock =
    competitionId && competitionName ? (
      <HomeStandingsCard
        competitionId={competitionId}
        competitionName={competitionName}
        rows={standings}
      />
    ) : null;

  return (
    <SectionEnter className="py-6">
      <div className="page-container">
        <div className="hero-grid">
          <div
            className="hero-carousel relative h-[240px] overflow-hidden rounded-lg md:h-[420px]"
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
            {count === 0 ? (
              <div className="card-surface flex h-full items-center justify-center">
                <p className="font-mono-label text-xs text-white/40">
                  Nenhuma notícia publicada.
                </p>
              </div>
            ) : (
              articles.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className={`hero-slide frosted-glass-hover group block ${i === safeIndex ? "active" : ""}`}
                  aria-hidden={i !== safeIndex}
                  tabIndex={i === safeIndex ? 0 : -1}
                >
                  <article className="relative h-full w-full overflow-hidden rounded-lg">
                    <div className="news-card-media absolute inset-0 bg-white/5">
                      {article.cover_url && (
                        <OrgImage
                          src={article.cover_url}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="frosted-glass absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <span className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
                        Notícias
                      </span>
                      <h2 className="font-display mt-1 line-clamp-2 text-lg font-black uppercase leading-tight text-white md:text-[22px]">
                        {article.title}
                      </h2>
                      <time className="font-mono-label mt-2 block text-[8px] uppercase text-white/50">
                        {formatPublishedDate(article.published_at)}
                      </time>
                    </div>
                  </article>
                </Link>
              ))
            )}

            {count > 1 && (
              <div className="absolute bottom-4 left-4 z-10 flex gap-1.5">
                {articles.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIndex(i);
                    }}
                    className={`hero-dot h-1.5 w-1.5 rounded-full ${i === safeIndex ? "hero-dot-active" : ""}`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {standingsBlock && (
            <div className="hidden min-h-[420px] md:block">{standingsBlock}</div>
          )}
        </div>

        {standingsBlock && (
          <div className="mt-4 md:hidden">{standingsBlock}</div>
        )}
      </div>
    </SectionEnter>
  );
}
