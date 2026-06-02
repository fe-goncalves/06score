"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { FormLetter } from "@/lib/competition/standingsForm";
import { winLossRecord } from "@/lib/competition/standingsForm";
import {
  getMarkerForPosition,
  markerCornerStyle,
  standingsRowHoverVars,
} from "@/lib/competition/tableMarkers";
import type { StandingRow, TableMarker } from "@/lib/types";

export type StandingsViewMode = "complete" | "summary" | "form";

const VIEW_OPTIONS: { id: StandingsViewMode; label: string }[] = [
  { id: "complete", label: "Completo" },
  { id: "summary", label: "Resumido" },
  { id: "form", label: "Forma" },
];

interface StandingsTableProps {
  rows: StandingRow[];
  title?: string;
  /** @deprecated Use view switcher; kept for callers that still pass it. */
  variant?: "default" | "compact";
  embedded?: boolean;
  maxRows?: number;
  markers?: TableMarker[];
  accentColor?: string | null;
  defaultView?: StandingsViewMode;
  showViewSwitcher?: boolean;
}

function teamLabel(row: StandingRow): string {
  return row.team.abbreviation ?? row.team.short_name ?? row.team.full_name;
}

function pctDisplay(row: StandingRow): string {
  const pct = row.points_pct ?? 0;
  return pct.toFixed(2);
}

function StandingsLegend({ markers }: { markers: TableMarker[] }) {
  if (!markers.length) return null;

  return (
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
  );
}

function StandingsViewSwitcher({
  view,
  onChange,
}: {
  view: StandingsViewMode;
  onChange: (v: StandingsViewMode) => void;
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
        className="standings-view-switcher-btn"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="standings-view-switcher-label">{current.label}</span>
        <span className="standings-view-switcher-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="standings-view-switcher-menu"
          aria-label="Visualização da tabela"
        >
          {VIEW_OPTIONS.map((opt) => (
            <li key={opt.id} role="option" aria-selected={view === opt.id}>
              <button
                type="button"
                className={`standings-view-switcher-option${view === opt.id ? " is-active" : ""}`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StandingsPositionCell({
  position,
  marker,
}: {
  position: number;
  marker: TableMarker | null;
}) {
  return (
    <td className="standings-pos-cell">
      <div className="standings-pos-wrap">
        {marker && (
          <span
            className="standings-pos-marker"
            style={markerCornerStyle(marker)}
            aria-hidden
          />
        )}
        <span className="standings-pos-num">{position}</span>
      </div>
    </td>
  );
}

function StandingsTeamCell({
  row,
  index,
}: {
  row: StandingRow;
  index: number;
}) {
  const teamId = row.team.id ?? row.team_id;
  return (
    <td className="standings-team-cell">
      <Link
        href={teamId ? `/times/${teamId}` : "#"}
        className="standings-team-link"
        title={row.team.full_name}
      >
        <TeamLogo team={row.team} index={index} size={32} />
        <span className="standings-team-name">{teamLabel(row)}</span>
      </Link>
    </td>
  );
}

function StandingsFormStrip({ form }: { form: FormLetter[] }) {
  const slots: (FormLetter | null)[] = Array.from({ length: 5 }, (_, i) =>
    form[i] ?? null,
  );

  return (
    <div
      className="standings-form-strip"
      aria-label={
        form.length
          ? `Últimos jogos: ${form.join(", ")}`
          : "Sem jogos recentes"
      }
    >
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

function StandingsWinLossRecord({ row }: { row: StandingRow }) {
  const label = winLossRecord(row.wins, row.losses);
  return (
    <span
      className="standings-record-text"
      title={`${row.wins} vitórias, ${row.losses} derrotas`}
    >
      {label}
    </span>
  );
}

function StandingsRow({
  row,
  marker,
  accent,
  children,
}: {
  row: StandingRow;
  marker: TableMarker | null;
  accent: string;
  children: ReactNode;
}) {
  return (
    <tr
      className="standings-row"
      style={standingsRowHoverVars(marker, accent)}
    >
      {children}
    </tr>
  );
}

function StandingsTableBody({
  rows,
  view,
  markers,
  accent,
}: {
  rows: StandingRow[];
  view: StandingsViewMode;
  markers: TableMarker[];
  accent: string;
}) {
  if (view === "form") {
    return (
      <table className="standings-table standings-table--form">
        <thead>
          <tr>
            <th className="standings-th standings-th--pos">#</th>
            <th className="standings-th standings-th--team">Time</th>
            <th className="standings-th standings-th--form">Últimos 5</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const marker = getMarkerForPosition(markers, row.position);
            return (
              <StandingsRow key={row.team_id} row={row} marker={marker} accent={accent}>
                <StandingsPositionCell position={row.position} marker={marker} />
                <StandingsTeamCell row={row} index={i} />
                <td className="standings-form-cell">
                  <StandingsFormStrip form={row.form ?? []} />
                </td>
              </StandingsRow>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (view === "summary") {
    return (
      <table className="standings-table standings-table--summary">
        <thead>
          <tr>
            <th className="standings-th standings-th--pos">#</th>
            <th className="standings-th standings-th--team">Time</th>
            <th className="standings-th standings-th--stat">J</th>
            <th className="standings-th standings-th--stat standings-th--pts">P</th>
            <th className="standings-th standings-th--stat">V-D</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const marker = getMarkerForPosition(markers, row.position);
            return (
              <StandingsRow key={row.team_id} row={row} marker={marker} accent={accent}>
                <StandingsPositionCell position={row.position} marker={marker} />
                <StandingsTeamCell row={row} index={i} />
                <td className="standings-stat-cell">{row.matches_played}</td>
                <td className="standings-stat-cell standings-pts">{row.points}</td>
                <td className="standings-stat-cell standings-record-cell">
                  <StandingsWinLossRecord row={row} />
                </td>
              </StandingsRow>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="standings-table-scroll">
      <table className="standings-table standings-table--complete">
        <thead>
          <tr>
            <th className="standings-th standings-th--pos">#</th>
            <th className="standings-th standings-th--team">Time</th>
            <th className="standings-th standings-th--stat standings-th--pts">P</th>
            <th className="standings-th standings-th--stat">J</th>
            <th className="standings-th standings-th--stat">V</th>
            <th className="standings-th standings-th--stat">E</th>
            <th className="standings-th standings-th--stat">D</th>
            <th className="standings-th standings-th--stat">CA</th>
            <th className="standings-th standings-th--stat">CV</th>
            <th className="standings-th standings-th--stat">GP</th>
            <th className="standings-th standings-th--stat">GC</th>
            <th className="standings-th standings-th--stat">SG</th>
            <th className="standings-th standings-th--stat">%</th>
            <th className="standings-th standings-th--form-col">Forma</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const marker = getMarkerForPosition(markers, row.position);
            const sg =
              row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference;
            return (
              <StandingsRow key={row.team_id} row={row} marker={marker} accent={accent}>
                <StandingsPositionCell position={row.position} marker={marker} />
                <StandingsTeamCell row={row} index={i} />
                <td className="standings-stat-cell standings-pts">{row.points}</td>
                <td className="standings-stat-cell">{row.matches_played}</td>
                <td className="standings-stat-cell">{row.wins}</td>
                <td className="standings-stat-cell">{row.draws}</td>
                <td className="standings-stat-cell">{row.losses}</td>
                <td className="standings-stat-cell">{row.yellow_cards ?? 0}</td>
                <td className="standings-stat-cell">{row.red_cards ?? 0}</td>
                <td className="standings-stat-cell">{row.goals_scored}</td>
                <td className="standings-stat-cell">{row.goals_conceded}</td>
                <td className="standings-stat-cell">{sg}</td>
                <td className="standings-stat-cell">{pctDisplay(row)}</td>
                <td className="standings-form-cell">
                  <StandingsFormStrip form={row.form ?? []} />
                </td>
              </StandingsRow>
            );
          })}
        </tbody>
      </table>
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
  defaultView = "complete",
  showViewSwitcher = true,
}: StandingsTableProps) {
  const [view, setView] = useState<StandingsViewMode>(defaultView);

  if (!rows.length) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Classificação indisponível.
      </p>
    );
  }

  const displayRows = maxRows != null ? rows.slice(0, maxRows) : rows;
  const accent = accentColor ?? "var(--color-brand)";

  const tableBlock = (
    <>
      {(showViewSwitcher || title) && (
        <div
          className={`standings-table-toolbar${title ? "" : " standings-table-toolbar--end"}`}
        >
          {title ? <SectionTitle>{title}</SectionTitle> : null}
          {showViewSwitcher && (
            <StandingsViewSwitcher view={view} onChange={setView} />
          )}
        </div>
      )}
      <StandingsTableBody
        rows={displayRows}
        view={view}
        markers={markers}
        accent={accent}
      />
      <StandingsLegend markers={markers} />
    </>
  );

  return (
    <div
      className="standings-table-root min-w-0"
      style={{ "--standings-accent": accent } as CSSProperties}
    >
      {embedded ? (
        <div className="standings-table-embedded">{tableBlock}</div>
      ) : (
        <div className="card-surface standings-table-card">{tableBlock}</div>
      )}
    </div>
  );
}
