"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";

interface HighlightStatCardProps {
  label: string;
  stat: number;
  name: string;
  subtitle?: string | null;
  teamLogoUrl?: string | null;
  teamName?: string | null;
  imageUrl?: string | null;
  href?: string;
  accentColor?: string | null;
  watermark?: string;
  emptyMessage?: string;
  /** 'muted' para fallback (ex.: mais vitórias, sem título de campeão). */
  subtitleTone?: "default" | "muted";
}

function animateCount(
  target: number,
  setter: (n: number) => void,
  duration = 1200,
): () => void {
  const start = performance.now();
  let frame = 0;
  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setter(Math.round(eased * target));
    if (progress < 1) frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

export function HighlightStatCard({
  label,
  stat,
  name,
  subtitle,
  teamLogoUrl,
  teamName,
  imageUrl,
  href,
  accentColor,
  watermark,
  emptyMessage,
  subtitleTone = "default",
}: HighlightStatCardProps) {
  const { ref, isInView } = useInView<HTMLElement>();
  const [displayStat, setDisplayStat] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    if (!isInView || !name) return;
    setDisplayStat(0);
    return animateCount(stat, setDisplayStat, 1200);
  }, [isInView, stat, name]);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setShowLabel(true), 100);
    return () => clearTimeout(timer);
  }, [isInView]);

  if (!name) {
    return (
      <div className="highlight-card highlight-card-empty card-surface flex aspect-[3/4] w-full max-w-[260px] flex-col justify-between rounded-lg border border-white/[0.06] p-4">
        <span className="font-mono-label text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--highlight-color,var(--color-brand))]">
          {label}
        </span>
        <p className="font-mono-label text-[10px] text-white/40">
          {emptyMessage ?? `Sem dados de ${label.toLowerCase()}.`}
        </p>
      </div>
    );
  }

  const cardStyle = {
    "--highlight-color": accentColor ?? "var(--color-brand)",
  } as CSSProperties;

  const content = (
    <article
      ref={ref}
      className="highlight-card group relative flex aspect-[3/4] w-full max-w-[260px] flex-col rounded-lg border border-white/[0.08]"
      style={cardStyle}
      data-watermark={watermark ?? label.slice(0, 3).toUpperCase()}
    >
      <div className="highlight-card-bg absolute inset-0 rounded-lg" aria-hidden="true" />
      <div className="highlight-card-accent absolute inset-0 rounded-lg" aria-hidden="true" />
      <div className="highlight-card-shimmer absolute inset-0 rounded-lg" aria-hidden="true" />

      {imageUrl ? (
        <div className="highlight-card-figure" aria-hidden="true">
          <OrgImage
            src={imageUrl}
            alt=""
            fill
            className="highlight-card-figure-img"
            sizes="(max-width: 768px) 68vw, 260px"
          />
        </div>
      ) : null}

      <div className="highlight-card-vignette" aria-hidden="true" />

      <div className="highlight-card-content relative z-10 flex min-h-0 flex-1 flex-col p-4">
        {teamLogoUrl ? (
          <div className="highlight-card-team-logo" aria-hidden="true">
            <OrgImage
              src={teamLogoUrl}
              alt={teamName ?? "Time"}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </div>
        ) : null}
        <span
          className="font-mono-label text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--highlight-color)]"
          style={{
            clipPath: showLabel ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            transition: "clip-path 0.4s ease",
          }}
        >
          {label}
        </span>

        <div className="highlight-card-stats mt-auto">
          <p className="font-display text-[40px] font-black tabular-nums leading-none text-white">
            {displayStat}
          </p>
          <p className="font-display mt-2 line-clamp-3 text-[13px] font-bold uppercase leading-tight text-white">
            {name}
          </p>
          {subtitle ? (
            <p
              className={`font-mono-label mt-1 line-clamp-2 text-[8px] uppercase ${
                subtitleTone === "muted" ? "text-white/40" : "text-white/65"
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="destaques-grid-item block w-full">
        {content}
      </Link>
    );
  }

  return <div className="destaques-grid-item w-full">{content}</div>;
}
