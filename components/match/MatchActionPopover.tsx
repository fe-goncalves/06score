"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ActionAthleteRow } from "@/lib/match/actionAthletes";

interface MatchActionPopoverProps {
  rows: ActionAthleteRow[];
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export function MatchActionPopover({
  rows,
  anchorRect,
  onClose,
}: MatchActionPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [onClose]);

  if (!anchorRect || !rows.length) return null;

  const top = Math.max(8, anchorRect.top - 8);
  const left = anchorRect.left + anchorRect.width / 2;

  return (
    <div
      ref={ref}
      className="match-action-popover"
      style={{
        top: top,
        left: left,
        transform: "translate(-50%, -100%)",
      }}
      role="dialog"
      aria-label="Atletas na ação"
    >
      <ul className="match-action-popover-list">
        {rows.map((row, i) => (
          <li key={`${row.role}-${row.athleteId ?? i}`}>
            {row.athleteId ? (
              <Link
                href={`/atletas/${row.athleteId}`}
                className="match-action-popover-link"
                onClick={onClose}
              >
                <span className="match-action-popover-role">{row.role}</span>
                <span className="match-action-popover-name">{row.surname}</span>
              </Link>
            ) : (
              <div className="match-action-popover-link">
                <span className="match-action-popover-role">{row.role}</span>
                <span className="match-action-popover-name">{row.surname}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
