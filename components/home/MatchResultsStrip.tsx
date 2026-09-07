"use client";

import { MatchStripCell } from "@/components/home/MatchStripCell";
import type { Match } from "@/lib/types";
import { isMatchLive } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface MatchResultsStripProps {
  matches: Match[];
  pastDays?: number;
  futureDays?: number;
}

function sortForStrip(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const aLive = isMatchLive(a.status) ? 0 : 1;
    const bLive = isMatchLive(b.status) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    const dateCmp = a.match_date.localeCompare(b.match_date);
    if (dateCmp !== 0) return dateCmp;
    return (a.match_time ?? "").localeCompare(b.match_time ?? "");
  });
}

const SCROLL_STEP = 220;

export function MatchResultsStrip({ matches }: MatchResultsStripProps) {
  const all = sortForStrip(matches);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2;
    setCanScrollLeft(overflow && scrollLeft > 4);
    setCanScrollRight(overflow && scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [all.length, updateScrollState]);

  const scrollBy = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (!all.length) return null;

  return (
    <div
      className={`match-results-strip match-results-strip-with-nav${canScrollLeft ? " match-results-strip-can-left" : ""}${canScrollRight ? " match-results-strip-can-right" : ""}`}
      role="region"
      aria-label="Jogos recentes"
    >
      {canScrollLeft ? (
        <button
          type="button"
          className="match-strip-scroll-btn match-strip-scroll-btn-prev"
          onClick={() => scrollBy(-1)}
          aria-label="Jogos anteriores"
        >
          ‹
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className="match-results-strip-scroll scrollbar-hide"
        tabIndex={-1}
      >
        <div className="match-results-strip-track">
          {all.map((match, i) => (
            <MatchStripCell key={match.id} match={match} index={i} />
          ))}
        </div>
      </div>

      {canScrollRight ? (
        <button
          type="button"
          className="match-strip-scroll-btn match-strip-scroll-btn-next"
          onClick={() => scrollBy(1)}
          aria-label="Próximos jogos"
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
