"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { StatsTotwGallery } from "@/components/competition/StatsTotwGallery";
import { OrgImage } from "@/components/ui/OrgImage";
import type { TotwGalleryEntry } from "@/lib/types";

interface StatsLeaderModalProps {
  title: string;
  accentColor?: string | null;
  totwGallery: TotwGalleryEntry[];
  onClose: () => void;
  children: ReactNode;
}

export function StatsLeaderModal({
  title,
  accentColor,
  totwGallery,
  onClose,
  children,
}: StatsLeaderModalProps) {
  const accent = accentColor ?? "var(--color-brand)";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="stats-leader-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="stats-leader-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-leader-modal-title"
        style={{ "--modal-accent": accent } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stats-leader-modal-head">
          <h2 id="stats-leader-modal-title" className="stats-leader-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="stats-leader-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="stats-leader-modal-split">
          <div className="stats-leader-modal-main">{children}</div>
          <aside className="stats-leader-modal-aside">
            <StatsTotwGallery
              entries={totwGallery}
              accentColor={accentColor}
              compact
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function StatsLeaderModalRow({
  href,
  rank,
  photo,
  name,
  teamLogo,
  teamAlt,
  value,
  sub,
  isTop,
}: {
  href?: string;
  rank: number;
  photo?: ReactNode;
  name: string;
  teamLogo?: string | null;
  teamAlt?: string;
  value: number | string;
  sub?: string;
  isTop?: boolean;
}) {
  const content = (
    <>
      <span className="competition-leader-rank">{rank}</span>
      {photo}
      <div
        className={`competition-leader-main ${sub ? "competition-leader-main-team" : ""}`}
      >
        <p className="competition-leader-name">{name}</p>
        {sub ? (
          <p className="competition-leader-sub">{sub}</p>
        ) : teamLogo ? (
          <OrgImage
            src={teamLogo}
            alt={teamAlt ?? "Time"}
            width={18}
            height={18}
            className="competition-leader-team-logo"
          />
        ) : null}
      </div>
      <span className="competition-leader-value">{value}</span>
    </>
  );

  const className = `competition-leader-item stats-leader-modal-row ${
    isTop ? "competition-leader-item-top" : ""
  }`;

  if (href && href !== "#") {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
