"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CompetitionEdition } from "@/lib/types";

export function editionLabel(edition: CompetitionEdition | null): string {
  if (!edition) return "—";
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name ?? edition.custom_name ?? "—";
  return seasons?.name ?? edition.custom_name ?? "—";
}

interface EditionSelectorProps {
  editions: CompetitionEdition[];
  currentEdition: CompetitionEdition | null;
}

export function EditionSelector({
  editions,
  currentEdition,
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

  if (!hasMultiple) {
    return (
      <span className="competition-hub-season-pill competition-hub-season-pill-static">
        {label}
      </span>
    );
  }

  return (
    <div ref={rootRef} className="competition-hub-season-select">
      <button
        type="button"
        className="competition-hub-season-pill"
        aria-label={`Temporada ${label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
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

      {open && (
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
                  className={`competition-hub-season-option ${isSelected ? "competition-hub-season-option-active" : ""}`}
                  onClick={() => selectEdition(edition.id)}
                >
                  <span>{editionLabel(edition)}</span>
                  {edition.is_current && (
                    <span className="competition-hub-season-option-badge">
                      Atual
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
