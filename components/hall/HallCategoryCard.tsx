"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { hallCardCssVars, hallCardVariantClass } from "@/lib/hall/hallCardTheme";
import type { HallCategory, HallEntry } from "@/lib/types";

interface HallCategoryCardProps {
  category: HallCategory;
  hrefPrefix: "/atletas" | "/times";
}

function formatValue(entry: HallEntry): string {
  if (entry.value_display) return entry.value_display;
  return String(entry.value);
}

function HallModal({
  category,
  hrefPrefix,
  onClose,
}: {
  category: HallCategory;
  hrefPrefix: "/atletas" | "/times";
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
    <div className="hall-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="hall-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hall-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="hall-modal-head">
          <h3 id="hall-modal-title" className="hall-modal-title">
            {category.label}
          </h3>
          <button type="button" className="hall-modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <ol className="hall-modal-list">
          {category.entries.map((entry, index) => (
            <li key={`${entry.id}-${index}`}>
              <Link
                href={`${hrefPrefix}/${entry.id}`}
                className="hall-modal-row"
                style={hallCardCssVars({
                  accent: entry.accent_color,
                  categoryKey: `${category.key}-row`,
                })}
              >
                <span className="hall-modal-rank">{index + 1}</span>
                <OrgImage
                  src={entry.photo_url}
                  alt=""
                  width={44}
                  height={44}
                  className="hall-modal-photo"
                />
                <span className="hall-modal-body">
                  <span className="hall-modal-name">{entry.name}</span>
                  {entry.team_name ? (
                    <span className="hall-modal-meta">{entry.team_name}</span>
                  ) : null}
                </span>
                <span className="hall-modal-value">
                  {formatValue(entry)}
                  <span className="hall-modal-unit">{category.valueLabel}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function HallCategoryCard({ category, hrefPrefix }: HallCategoryCardProps) {
  const [open, setOpen] = useState(false);
  const leader = category.entries[0] ?? null;
  const cardStyle = hallCardCssVars({
    accent: leader?.accent_color,
    categoryKey: category.key,
  });
  const variantClass = hallCardVariantClass(category.key);
  const isTeam = hrefPrefix === "/times";

  return (
    <>
      <button
        type="button"
        className={`hall-card ${variantClass}`}
        style={cardStyle}
        onClick={() => setOpen(true)}
        aria-label={`Ver ranking — ${category.label}`}
      >
        <div className="hall-card-bg" aria-hidden>
          <div className="hall-card-bg-base" />
          <div className="hall-card-bg-texture" />
          <div className="hall-card-bg-tint" />
          <div className="hall-card-bg-grain" />
          <div className="hall-card-bg-vignette" />
          <div className="hall-card-bg-glow" />
        </div>

        <header className="hall-card-head">
          <span className="hall-card-label">{category.label}</span>
          <span className="hall-card-badge">#1</span>
        </header>

        <div className="hall-card-visual">
          {leader?.team_logo && isTeam ? (
            <OrgImage
              src={leader.team_logo}
              alt=""
              width={56}
              height={56}
              className="hall-card-watermark"
            />
          ) : null}
          <OrgImage
            src={leader?.photo_url}
            alt=""
            width={160}
            height={200}
            className={`hall-card-photo ${isTeam ? "hall-card-photo--logo" : ""}`}
          />
        </div>

        <footer className="hall-card-foot">
          <p className="hall-card-name">{leader?.name ?? "—"}</p>
          {leader?.team_name ? (
            <p className="hall-card-sub">{leader.team_name}</p>
          ) : null}
          <p className="hall-card-value">
            <span className="hall-card-value-num">{leader ? formatValue(leader) : "—"}</span>
            <span className="hall-card-unit">{category.valueLabel}</span>
          </p>
          <span className="hall-card-cta">Top {category.entries.length}</span>
        </footer>
      </button>

      {open ? (
        <HallModal category={category} hrefPrefix={hrefPrefix} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
