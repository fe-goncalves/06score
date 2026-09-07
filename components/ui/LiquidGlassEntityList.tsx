"use client";

import { StatsTablePager } from "@/components/team/StatsTableControls";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { normalizeQuery } from "@/lib/search/normalizeQuery";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const PAGE_SIZE = 30;

interface LiquidGlassEntityListProps<T> {
  items: T[];
  searchId: string;
  searchPlaceholder: string;
  filterItem: (item: T, query: string) => boolean;
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  idleMessage?: string;
  requireQuery?: boolean;
  resultCountLabel?: (count: number) => string;
  containerClassName?: string;
  hideSearch?: boolean;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
}

export function LiquidGlassEntityList<T>({
  items,
  searchId,
  searchPlaceholder,
  filterItem,
  renderItem,
  emptyMessage = "Nenhum resultado encontrado.",
  idleMessage,
  requireQuery = false,
  resultCountLabel,
  containerClassName,
  hideSearch = false,
  searchTerm,
  onSearchTermChange,
}: LiquidGlassEntityListProps<T>) {
  const [internalTerm, setInternalTerm] = useState("");
  const controlled = typeof onSearchTermChange === "function";
  const term = controlled ? (searchTerm ?? "") : internalTerm;
  const setTerm = controlled ? onSearchTermChange : setInternalTerm;
  const [page, setPage] = useState(0);
  const query = normalizeQuery(term);

  const filtered = useMemo(() => {
    if (requireQuery && !query) return [];
    if (!query) return items;
    return items.filter((item) => filterItem(item, query));
  }, [items, query, requireQuery, filterItem]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const paginated = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const showIdle = requireQuery && !query;
  const showEmpty = !showIdle && !filtered.length;

  return (
    <SectionEnter className="page-container pb-14 pt-2">
      {!hideSearch ? (
        <div className="liquid-glass-list-search-wrap">
          <label htmlFor={searchId} className="liquid-glass-list-search-label">
            Pesquisar
          </label>
          <input
            id={searchId}
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="liquid-glass-list-search"
          />
        </div>
      ) : null}

      {!showIdle && filtered.length > 0 && resultCountLabel ? (
        <p className="liquid-glass-list-meta">{resultCountLabel(filtered.length)}</p>
      ) : null}

      {showIdle ? (
        idleMessage ? (
          <p className="liquid-glass-list-empty">{idleMessage}</p>
        ) : null
      ) : showEmpty ? (
        <p className="liquid-glass-list-empty">{emptyMessage}</p>
      ) : (
        <>
          <div className={containerClassName ?? "liquid-glass-list"}>
            {paginated.map((item, index) =>
              renderItem(item, currentPage * PAGE_SIZE + index),
            )}
          </div>
          <StatsTablePager
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </SectionEnter>
  );
}
