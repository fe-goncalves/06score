"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { STATS_PREVIEW_LIMIT } from "@/lib/competition/statsHelpers";

interface StatsHighlightCardProps {
  title: string;
  accentColor?: string | null;
  rows: {
    key: string;
    href?: string;
    rank: number;
    name: string;
    value: number | string;
    photoUrl?: string | null;
    photoAlt?: string;
    teamLogoUrl?: string | null;
    teamAlt?: string;
    sub?: string;
    photoNode?: ReactNode;
    isTeam?: boolean;
  }[];
  onVerMais?: () => void;
  emptyMessage?: string;
}

export function StatsHighlightCard({
  title,
  accentColor,
  rows,
  onVerMais,
  emptyMessage = "Sem dados.",
}: StatsHighlightCardProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const preview = rows.slice(0, STATS_PREVIEW_LIMIT);
  const hasMore = rows.length > STATS_PREVIEW_LIMIT;

  return (
    <article
      className="stats-highlight-card"
      style={{ "--card-accent": accent } as CSSProperties}
    >
      <header className="stats-highlight-card-head">
        <h3 className="stats-highlight-card-title">{title}</h3>
        {hasMore && onVerMais && (
          <button
            type="button"
            className="stats-highlight-card-more"
            onClick={onVerMais}
          >
            Ver mais
          </button>
        )}
      </header>

      {!preview.length ? (
        <p className="stats-highlight-card-empty font-mono-label text-xs text-white/40">
          {emptyMessage}
        </p>
      ) : (
        <ol className="stats-highlight-card-list">
          {preview.map((row, index) => {
            const isTop = row.rank === 1;
            const itemClass = `stats-highlight-row ${isTop ? "stats-highlight-row-top" : ""}`;
            const style = {
              animationDelay: `${index * 45}ms`,
            } as CSSProperties;

            const inner = (
              <>
                <span className="stats-highlight-rank">{row.rank}</span>
                {row.photoNode ??
                  (row.photoUrl !== undefined ? (
                    <OrgImage
                      src={row.photoUrl}
                      alt={row.photoAlt ?? row.name}
                      width={32}
                      height={32}
                      className={
                        row.isTeam
                          ? "stats-highlight-team-photo"
                          : "stats-highlight-photo"
                      }
                    />
                  ) : null)}
                <div
                  className={`stats-highlight-main ${row.sub ? "stats-highlight-main-team" : ""}`}
                >
                  <span className="stats-highlight-name">{row.name}</span>
                  {row.sub ? (
                    <span className="stats-highlight-sub">{row.sub}</span>
                  ) : row.teamLogoUrl ? (
                    <OrgImage
                      src={row.teamLogoUrl}
                      alt={row.teamAlt ?? "Time"}
                      width={16}
                      height={16}
                      className="stats-highlight-team-logo"
                    />
                  ) : null}
                </div>
                <span className="stats-highlight-value">{row.value}</span>
              </>
            );

            return (
              <li key={row.key} className="stats-highlight-item" style={style}>
                {row.href && row.href !== "#" ? (
                  <Link href={row.href} className={itemClass}>
                    {inner}
                  </Link>
                ) : (
                  <div className={itemClass}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
