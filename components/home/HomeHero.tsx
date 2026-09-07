"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroNewsGrid } from "@/components/home/HeroNewsGrid";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import {
  getHeroMobileNews,
  getHeroNews,
  getHeroSideNews,
} from "@/lib/home/news";
import type { HomeNewsArticle } from "@/lib/types";

interface HomeHeroProps {
  articles: HomeNewsArticle[];
}

function useIsMobileHero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function HomeHero({ articles }: HomeHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const isMobile = useIsMobileHero();

  const carouselNews = isMobile ? getHeroMobileNews(articles) : getHeroNews(articles);
  const sideNews = getHeroSideNews(articles);
  const count = carouselNews.length;
  const safeIndex = count ? index % count : 0;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const carouselKey = carouselNews.map((a) => a.id).join(",");

  useEffect(() => {
    setIndex(0);
  }, [carouselKey]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, count, carouselKey]);

  const activeArticle = carouselNews[safeIndex];

  return (
    <SectionEnter className="home-hero-section py-6">
      <div className="page-container">
        <div className="hero-grid-v2">
          <div
            className="hero-carousel-shell"
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
              <div className="hero-carousel-empty">
                <p className="font-mono-label text-xs text-white/40">
                  Nenhuma notícia publicada.
                </p>
              </div>
            ) : (
              <>
                <Link
                  href={`/news/${activeArticle.id}`}
                  className="hero-carousel-link group block h-full"
                >
                  <article className="hero-carousel-article">
                    <div className="hero-carousel-media">
                      {activeArticle.cover_url && (
                        <OrgImage
                          src={activeArticle.cover_url}
                          alt=""
                          fill
                          className="hero-carousel-image object-cover"
                          sizes="(max-width: 768px) 100vw, 65vw"
                        />
                      )}
                    </div>
                    <div className="hero-carousel-vignette" aria-hidden />
                    <div className="hero-carousel-caption">
                      {activeArticle.subtitle ? (
                        <span className="hero-carousel-kicker">
                          {activeArticle.subtitle}
                        </span>
                      ) : null}
                      <h2 className="hero-carousel-title">{activeArticle.title}</h2>
                    </div>
                  </article>
                </Link>

                {count > 1 ? (
                  <div className="hero-carousel-controls hero-carousel-controls-dots-only">
                    <div
                      className="hero-carousel-dots"
                      role="tablist"
                      aria-label="Escolher notícia"
                    >
                      {carouselNews.map((article, i) => (
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
                ) : null}
              </>
            )}
          </div>

          <div className="hero-side-news-slot hidden md:block">
            <HeroNewsGrid articles={sideNews} />
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
