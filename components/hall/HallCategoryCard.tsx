"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
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
              <Link href={`${hrefPrefix}/${entry.id}`} className="hall-modal-row">
                <span className="hall-modal-rank">{index + 1}</span>
                <OrgImage
                  src={entry.photo_url}
                  alt=""
                  width={40}
                  height={40}
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

  return (
    <>
      <button
        type="button"
        className="hall-card"
        onClick={() => setOpen(true)}
        aria-label={`Ver ranking — ${category.label}`}
      >
        <div className="hall-card-glow" aria-hidden />
        <p className="hall-card-label">{category.label}</p>
        <div className="hall-card-body">
          <OrgImage
            src={leader?.photo_url}
            alt=""
            width={72}
            height={72}
            className="hall-card-photo"
          />
          <div className="hall-card-meta">
            <p className="hall-card-name">{leader?.name ?? "—"}</p>
            {leader?.team_name ? (
              <p className="hall-card-sub">{leader.team_name}</p>
            ) : null}
            <p className="hall-card-value">
              {leader ? formatValue(leader) : "—"}
              <span className="hall-card-unit">{category.valueLabel}</span>
            </p>
          </div>
        </div>
        <span className="hall-card-cta">Top {category.entries.length}</span>
      </button>

      {open ? (
        <HallModal category={category} hrefPrefix={hrefPrefix} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
