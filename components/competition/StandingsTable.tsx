"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { FormLetter } from "@/lib/competition/standingsForm";
import { winLossRecord } from "@/lib/competition/standingsForm";
import { getMarkerForPosition } from "@/lib/competition/tableMarkers";
import type { StandingRow, TableMarker } from "@/lib/types";

export type StandingsViewMode = "summary" | "form" | "complete";

const VIEW_OPTIONS: { id: StandingsViewMode; label: string }[] = [
  { id: "summary", label: "RESUMIDA" },
  { id: "form", label: "FORMA" },
  { id: "complete", label: "COMPLETO" },
];

interface StandingsTableProps {
  rows: StandingRow[];
  title?: string;
  /** @deprecated */
  variant?: "default" | "compact";
  embedded?: boolean;
  maxRows?: number;
  markers?: TableMarker[];
  accentColor?: string | null;
  defaultView?: StandingsViewMode;
  showViewSwitcher?: boolean;
  showToolbar?: boolean;
}

function gdLabel(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function teamLabel(row: StandingRow): string {
  return (
    row.team.short_name ||
    row.team.abbreviation ||
    row.team.full_name
  );
}

function FormStrip({ form }: { form?: FormLetter[] }) {
  const slots: (FormLetter | null)[] = Array.from(
    { length: 5 },
    (_, i) => form?.[i] ?? null,
  );

  return (
    <div className="standings-form-strip" aria-hidden={!form?.length}>
      {slots.map((letter, i) => (
        <span
          key={i}
          className={
            letter
              ? `standings-form-chip standings-form-chip--${letter}`
              : "standings-form-chip standings-form-chip--empty"
          }
        >
          {letter ?? ""}
        </span>
      ))}
    </div>
  );
}

function ViewSwitcher({
  view,
  onChange,
  accent,
}: {
  view: StandingsViewMode;
  onChange: (v: StandingsViewMode) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = VIEW_OPTIONS.find((o) => o.id === view) ?? VIEW_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="standings-view-switcher" ref={rootRef}>
      <button
        type="button"
        className="standings-view-btn"
        style={{ borderColor: `${accent}66`, color: accent }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={`Visualização: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>{view === "summary" ? "☰" : view === "form" ? "▦" : "▣"}</span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="standings-view-menu"
          aria-label="Visualização da tabela"
        >
          {VIEW_OPTIONS.map((opt) => {
            const active = opt.id === view;
            return (
              <li key={opt.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`standings-view-option${active ? " is-active" : ""}`}
                  style={
                    active
                      ? {
                          background: `${accent}22`,
                          color: accent,
                        }
                      : undefined
                  }
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function StandingsTable({
  rows,
  title,
  embedded = false,
  maxRows,
  markers = [],
  accentColor,
  defaultView = "summary",
  showViewSwitcher = true,
  showToolbar = true,
}: StandingsTableProps) {
  const [view, setView] = useState<StandingsViewMode>(defaultView);

  if (!rows.length) {
    return (
      <p className="standings-empty">Classificação indisponível.</p>
    );
  }

  const displayRows = maxRows != null ? rows.slice(0, maxRows) : rows;
  const accent = accentColor ?? "var(--color-brand)";
  const showBar = showToolbar && (showViewSwitcher || Boolean(title));

  const body = (
    <>
      {showBar ? (
        <div className="standings-toolbar">
          <p className="standings-toolbar-title">
            {title?.trim() || "Classificação"}
          </p>
          {showViewSwitcher ? (
            <ViewSwitcher view={view} onChange={setView} accent={accent} />
          ) : null}
        </div>
      ) : null}

      <div className={`standings-grid standings-grid--${view}`}>
        <div className="standings-head" role="row">
          <span className="standings-h standings-h--pos">#</span>
          <span className="standings-h standings-h--team">EQUIPE</span>
          {view === "summary" ? (
            <>
              <span className="standings-h standings-h--stat">J</span>
              <span className="standings-h standings-h--stat">SG</span>
              <span className="standings-h standings-h--pts">PTS</span>
            </>
          ) : null}
          {view === "form" ? (
            <>
              <span className="standings-h standings-h--form">FORMA</span>
              <span className="standings-h standings-h--record">V-D</span>
            </>
          ) : null}
          {view === "complete" ? (
            <>
              <span className="standings-h standings-h--stat">J</span>
              <span className="standings-h standings-h--stat">V</span>
              <span className="standings-h standings-h--stat">GP</span>
              <span className="standings-h standings-h--stat">GC</span>
              <span className="standings-h standings-h--stat">SG</span>
              <span className="standings-h standings-h--pts">PTS</span>
            </>
          ) : null}
        </div>

        {displayRows.map((row, i) => {
          const marker = getMarkerForPosition(markers, row.position);
          const teamId = row.team.id ?? row.team_id;
          const rowStyle: CSSProperties = {
            ...(marker?.show_background
              ? { backgroundColor: `${marker.color_hex}12` }
              : null),
          };

          return (
            <Link
              key={row.team_id}
              href={teamId ? `/times/${teamId}` : "#"}
              className="standings-row"
              style={rowStyle}
            >
              <span className="standings-pos-wrap">
                {marker ? (
                  <span
                    className="standings-pos-marker"
                    style={{ backgroundColor: marker.color_hex }}
                    aria-hidden
                  />
                ) : null}
                <span
                  className="standings-pos-num"
                  style={{ color: marker?.color_hex ?? "#FFFFFF" }}
                >
                  {row.position}
                </span>
              </span>

              <span className="standings-team-cell">
                <TeamLogo team={row.team} index={i} size={30} />
                <span className="standings-team-name">{teamLabel(row)}</span>
              </span>

              {view === "summary" ? (
                <>
                  <span className="standings-cell">{row.matches_played}</span>
                  <span className="standings-cell">
                    {gdLabel(row.goal_difference)}
                  </span>
                  <span
                    className="standings-cell standings-cell--pts"
                    style={{ color: accent }}
                  >
                    {row.points}
                  </span>
                </>
              ) : null}

              {view === "form" ? (
                <>
                  <span className="standings-form-cell">
                    <FormStrip form={row.form} />
                  </span>
                  <span className="standings-cell standings-cell--record">
                    {winLossRecord(row.wins, row.losses)}
                  </span>
                </>
              ) : null}

              {view === "complete" ? (
                <>
                  <span className="standings-cell">{row.matches_played}</span>
                  <span className="standings-cell">{row.wins}</span>
                  <span className="standings-cell">{row.goals_scored}</span>
                  <span className="standings-cell">{row.goals_conceded}</span>
                  <span className="standings-cell">
                    {gdLabel(row.goal_difference)}
                  </span>
                  <span
                    className="standings-cell standings-cell--pts"
                    style={{ color: accent }}
                  >
                    {row.points}
                  </span>
                </>
              ) : null}
            </Link>
          );
        })}
      </div>

      {markers.length ? (
        <ul className="standings-markers-legend">
          {markers.map((marker) => (
            <li key={marker.id} className="standings-markers-legend-item">
              <span
                className="standings-markers-swatch"
                style={{ backgroundColor: marker.color_hex }}
                aria-hidden
              />
              <span>{marker.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <div
      className="standings-table-root min-w-0"
      style={{ "--standings-accent": accent } as CSSProperties}
    >
      {embedded ? (
        <div className="standings-table-embedded">{body}</div>
      ) : (
        <div className="card-surface standings-table-card">{body}</div>
      )}
    </div>
  );
}
