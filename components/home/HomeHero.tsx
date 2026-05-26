"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { HomeStandingsCard } from "@/components/home/HomeStandingsCard";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { HomeMotw, HomeNewsArticle, Match, StandingRow } from "@/lib/types";
import { formatMatchDateTime, isMatchUpcoming } from "@/lib/utils";

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

  const topNews = articles.slice(0, 3);
  const count = topNews.length;
  const safeIndex = count ? index % count : 0;
  const nextMatches = upcoming
    .filter((m) => isMatchUpcoming(m))
    .sort((a, b) => {
      const cmp = a.match_date.localeCompare(b.match_date);
      if (cmp !== 0) return cmp;
      return (a.match_time ?? "").localeCompare(b.match_time ?? "");
    })
    .slice(0, 3);
  const sideNews =
    articles.find((a) => !topNews.some((t) => t.id === a.id)) ??
    articles[0] ??
    null;
  const showUpcomingMatches = nextMatches.length > 0;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    setIndex(0);
  }, [topNews]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, count, topNews]);

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
            {count === 0 ? (
              <div className="card-surface flex h-full items-center justify-center">
                <p className="font-mono-label text-xs text-white/40">
                  Nenhuma notícia publicada.
                </p>
              </div>
            ) : (
              topNews.map((article, i) => (
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
                    </div>
                  </article>
                </Link>
              ))
            )}

            {count > 1 && (
              <div className="hero-timeline absolute inset-x-4 bottom-4 z-10 flex gap-2">
                {topNews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIndex(i);
                    }}
                    className={`hero-timeline-dot h-1.5 flex-1 rounded-full ${i === safeIndex ? "hero-timeline-dot-active" : ""}`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hero-side-grid">
            {latestMotw ? (
              <article
                className="motw-card group relative overflow-hidden rounded-lg border border-white/[0.08] p-4 md:p-5"
                style={
                  {
                    "--motw-color": competitionColor ?? "var(--color-brand)",
                  } as CSSProperties
                }
              >
                <div className="motw-card-bg absolute inset-0" aria-hidden="true" />
                <div className="motw-card-accent absolute inset-0" aria-hidden="true" />
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
                    Ultimo MOTW
                  </p>
                  <h3 className="font-display mt-3 truncate text-2xl font-black uppercase leading-none text-white">
                    {latestMotw.athlete_surname ?? latestMotw.athlete_name}
                  </h3>
                  <p className="font-mono-label mt-1 text-[10px] uppercase text-white/70">
                    {latestMotw.team_name ?? "Equipe não informada"}
                  </p>
                  <p className="font-mono-label mt-4 text-[10px] uppercase tracking-[0.08em] text-white/55">
                    {latestMotw.round_label
                      ? `Destaque da ${latestMotw.round_label}`
                      : "Destaque da rodada mais recente"}
                  </p>
                </div>
              </article>
            ) : competitionId ? (
              <div className="min-h-[160px]">
                <HomeStandingsCard
                  competitionId={competitionId}
                  competitionName={competitionName}
                  rows={standings}
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
                <div className="mt-3 space-y-2.5">
                  {nextMatches.map((match, idx) => (
                    <Link
                      key={match.id}
                      href={`/jogos/${match.id}`}
                      className="hero-next-match-row group flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.02] px-2.5 py-2"
                    >
                      <TeamLogo team={match.teams_a} index={idx * 2} size={22} />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono-label truncate text-[9px] uppercase text-white/70">
                          {(match.teams_a?.short_name ?? match.teams_a?.full_name ?? "Time A")} x{" "}
                          {match.teams_b?.short_name ?? match.teams_b?.full_name ?? "Time B"}
                        </p>
                        <p className="font-mono-label text-[8px] uppercase text-white/50">
                          {formatMatchDateTime(match.match_date, match.match_time)}
                        </p>
                      </div>
                      <TeamLogo team={match.teams_b} index={idx * 2 + 1} size={22} />
                    </Link>
                  ))}
                </div>
              </article>
            ) : sideNews ? (
              <Link
                href={`/news/${sideNews.id}`}
                className="card-surface group block overflow-hidden rounded-lg border border-white/10"
              >
                <div className="relative aspect-[16/9] bg-white/5">
                  {sideNews.cover_url ? (
                    <OrgImage
                      src={sideNews.cover_url}
                      alt={sideNews.title}
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
                      {sideNews.title}
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
