"use client";

import type { TeamAthleteStatSortKey, TeamCompetitionStatSortKey } from "@/lib/team/statsConfig";

interface SortableStatThProps {
  abbr: string;
  sortKey: string;
  activeSortKey: string;
  direction: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export function SortableStatTh({
  abbr,
  sortKey,
  activeSortKey,
  direction,
  onSort,
  className = "",
}: SortableStatThProps) {
  const isActive = activeSortKey === sortKey;
  return (
    <th scope="col" className={className}>
      <button
        type="button"
        className={`athlete-stats-sort-btn ${isActive ? "athlete-stats-sort-btn--active" : ""}`}
        onClick={() => onSort(sortKey)}
        aria-sort={
          isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <span>{abbr}</span>
        {isActive ? (
          <span className="athlete-stats-sort-dir" aria-hidden>
            {direction === "asc" ? "▲" : "▼"}
          </span>
        ) : null}
      </button>
    </th>
  );
}

interface StatsTablePagerProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function StatsTablePager({
  page,
  totalPages,
  onPageChange,
}: StatsTablePagerProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="stats-table-pager" aria-label="Paginação">
      <button
        type="button"
        className="stats-table-pager-btn"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
      >
        ‹
      </button>
      <span className="stats-table-pager-label">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        className="stats-table-pager-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Próxima página"
      >
        ›
      </button>
    </nav>
  );
}

export function toggleSortDirection(
  currentKey: string,
  nextKey: string,
  currentDir: "asc" | "desc",
): "asc" | "desc" {
  return currentKey === nextKey && currentDir === "desc" ? "asc" : "desc";
}

export type { TeamAthleteStatSortKey, TeamCompetitionStatSortKey };
