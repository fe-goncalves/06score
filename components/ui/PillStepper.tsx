"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

export interface PillStepperItem {
  id: string;
  label: string;
}

interface PillStepperProps {
  items: PillStepperItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  accentColor?: string | null;
  ariaLabel?: string;
  compact?: boolean;
}

export function PillStepper({
  items,
  selectedId,
  onSelect,
  accentColor,
  ariaLabel = "Seleção",
  compact = false,
}: PillStepperProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const accent = accentColor ?? "var(--color-brand)";

  const currentIndex = items.findIndex((item) => item.id === selectedId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const current = items[safeIndex];

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (!items.length || !current) return null;

  const canPrev = safeIndex > 0;
  const canNext = safeIndex < items.length - 1;
  const hasMultiple = items.length > 1;

  function go(dir: -1 | 1) {
    const next = items[safeIndex + dir];
    if (next) onSelect(next.id);
  }

  return (
    <div
      ref={rootRef}
      className={`pill-stepper ${compact ? "pill-stepper-compact" : ""}`}
      style={{ "--stepper-accent": accent } as CSSProperties}
    >
      <div className="pill-stepper-glass">
        <button
          type="button"
          className="pill-stepper-nav"
          aria-label="Anterior"
          disabled={!canPrev}
          onClick={() => go(-1)}
        >
          ‹
        </button>

        <button
          type="button"
          className="pill-stepper-main"
          aria-label={current.label}
          aria-haspopup={hasMultiple ? "listbox" : undefined}
          aria-expanded={hasMultiple ? menuOpen : undefined}
          disabled={!hasMultiple}
          onClick={() => hasMultiple && setMenuOpen((v) => !v)}
        >
          <span className="pill-stepper-label">{current.label}</span>
          {hasMultiple && (
            <svg
              width="9"
              height="9"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden
              className={menuOpen ? "pill-stepper-chevron-open" : undefined}
            >
              <path
                d="M2.5 3.75L5 6.25L7.5 3.75"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="pill-stepper-nav"
          aria-label="Próximo"
          disabled={!canNext}
          onClick={() => go(1)}
        >
          ›
        </button>
      </div>

      {menuOpen && hasMultiple && (
        <ul
          className="pill-stepper-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <li key={item.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`pill-stepper-option ${isSelected ? "pill-stepper-option-active" : ""}`}
                  onClick={() => {
                    onSelect(item.id);
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
