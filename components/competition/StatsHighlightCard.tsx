"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { STATS_PREVIEW_LIMIT } from "@/lib/competition/statsHelpers";

interface StatsHighlightCardProps {
  title: string;
  accentColor?: string | null;
  rows: {
    key: string;
    href?: string;
    name: string;
    nickname?: string;
    value: number | string;
    photoUrl?: string | null;
    photoAlt?: string;
    teamLogoUrl?: string | null;
    teamAlt?: string;
  }[];
  onOpen?: () => void;
  emptyMessage?: string;
  /** Quantidade de linhas no card (padrão: stats da competição). */
  previewLimit?: number;
}

export function StatsHighlightCard({
  title,
  accentColor,
  rows,
  onOpen,
  emptyMessage = "Sem dados.",
  previewLimit = STATS_PREVIEW_LIMIT,
}: StatsHighlightCardProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const preview = rows.slice(0, previewLimit);
  const leader = preview[0] ?? null;
  const rest = preview.slice(1);

  return (
    <article
      className="stats-highlight-card stats-highlight-card--award stats-highlight-card--hero"
      style={{ "--card-accent": accent } as CSSProperties}
    >
      {!leader ? (
        <>
          <header className="stats-highlight-card-head">
            <h3 className="stats-highlight-card-title">{title}</h3>
          </header>
          <p className="stats-highlight-card-empty font-mono-label text-xs text-white/40">
            {emptyMessage}
          </p>
        </>
      ) : (
        <button
          type="button"
          className="stats-hero-card-body"
          onClick={onOpen}
          aria-label={`Ver ranking completo de ${title}`}
        >
          <div className="stats-hero-photo-stage">
            <div className="stats-hero-bg" aria-hidden />
            <span className="stats-hero-category">{title}</span>
            <OrgImage
              src={leader.photoUrl}
              alt={leader.photoAlt ?? leader.name}
              width={280}
              height={320}
              className="stats-hero-photo"
            />
            <div className="stats-hero-overlay">
              {leader.teamLogoUrl ? (
                <OrgImage
                  src={leader.teamLogoUrl}
                  alt={leader.teamAlt ?? "Time"}
                  width={28}
                  height={28}
                  className="stats-hero-overlay-team"
                />
              ) : null}
              <span className="stats-hero-overlay-name">{leader.name}</span>
              <span className="stats-hero-overlay-value">{leader.value}</span>
            </div>
          </div>

          {rest.length ? (
            <ul className="stats-hero-list">
              {rest.map((row) => (
                <li key={row.key} className="stats-hero-list-item">
                  {row.teamLogoUrl ? (
                    <OrgImage
                      src={row.teamLogoUrl}
                      alt={row.teamAlt ?? "Time"}
                      width={22}
                      height={22}
                      className="stats-hero-list-team"
                    />
                  ) : (
                    <span className="stats-hero-list-team-spacer" aria-hidden />
                  )}
                  <span className="stats-hero-list-name">
                    {row.nickname ?? row.name}
                  </span>
                  <span className="stats-hero-list-value">{row.value}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </button>
      )}

      {leader?.href ? (
        <Link href={leader.href} className="sr-only">
          Ver {leader.name}
        </Link>
      ) : null}
    </article>
  );
}
