"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CompetitionEdition } from "@/lib/types";

export function editionLabel(edition: CompetitionEdition | null): string {
  if (!edition) return "—";
  const custom = edition.custom_name?.trim();
  if (custom) return custom;
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name ?? "—";
  return seasons?.name ?? "—";
}

interface EditionSelectorProps {
  editions: CompetitionEdition[];
  currentEdition: CompetitionEdition | null;
  align?: "left" | "right";
  compact?: boolean;
}

export function EditionSelector({
  editions,
  currentEdition,
  align = "left",
  compact = false,
}: EditionSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasMultiple = editions.length > 1;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectEdition(editionId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (editionId === editions.find((e) => e.is_current)?.id) {
      params.delete("edition");
    } else {
      params.set("edition", editionId);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
    setOpen(false);
  }

  const label = editionLabel(currentEdition);
  const rootClass = [
    "competition-hub-season-select",
    compact ? "competition-hub-season-select--compact" : "",
    align === "right" ? "competition-hub-season-select--right" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!hasMultiple) {
    return (
      <span
        className={`competition-hub-season-pill competition-hub-season-pill-static${compact ? " competition-hub-season-pill--compact" : ""}`}
      >
        {label}
      </span>
    );
  }

  return (
    <div ref={rootRef} className={rootClass}>
      <button
        type="button"
        className={`competition-hub-season-pill${compact ? " competition-hub-season-pill--compact" : ""}`}
        aria-label={`Edição ${label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="competition-hub-season-pill-label">{label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={open ? "competition-hub-season-chevron-open" : undefined}
        >
          <path
            d="M2.5 3.75L5 6.25L7.5 3.75"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul
          className="competition-hub-season-menu"
          role="listbox"
          aria-label="Edições da competição"
        >
          {editions.map((edition) => {
            const isSelected = edition.id === currentEdition?.id;
            return (
              <li key={edition.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`competition-hub-season-option${isSelected ? " competition-hub-season-option-active" : ""}`}
                  onClick={() => selectEdition(edition.id)}
                >
                  <span>{editionLabel(edition)}</span>
                  {edition.is_current ? (
                    <span className="competition-hub-season-option-badge">
                      Atual
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
