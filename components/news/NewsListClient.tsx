"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { NewsJournalCard } from "@/components/news/NewsJournalCard";
import { StatsTablePager } from "@/components/team/StatsTableControls";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { NewsArticleListItem } from "@/lib/types";

const PAGE_SIZE = 20;

interface NewsListClientProps {
  articles: NewsArticleListItem[];
  competitions: { id: string; full_name: string; short_name: string | null }[];
}

export function NewsListClient({ articles, competitions }: NewsListClientProps) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!filter) return articles;
    return articles.filter((a) => a.competition_ids.includes(filter));
  }, [articles, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const paginated = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  function handleFilterChange(nextFilter: string) {
    setFilter(nextFilter);
    setPage(0);
  }

  return (
    <SectionEnter className="page-container pb-14 pt-2">
      {competitions.length > 1 && (
        <div className="news-list-filters competition-hub-tabs scrollbar-hide">
          <div className="competition-hub-tabs-track">
            <button
              type="button"
              onClick={() => handleFilterChange("")}
              className={`competition-hub-tab ${!filter ? "competition-hub-tab-active" : ""}`}
              style={{ "--tab-accent": "var(--color-brand)" } as CSSProperties}
            >
              Todas
            </button>
            {competitions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleFilterChange(c.id)}
                className={`competition-hub-tab ${filter === c.id ? "competition-hub-tab-active" : ""}`}
                style={{ "--tab-accent": "var(--color-brand)" } as CSSProperties}
              >
                {c.short_name ?? c.full_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!filtered.length ? (
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma notícia encontrada.
        </p>
      ) : (
        <>
          <div className="news-list-grid">
            {paginated.map((article) => (
              <div key={article.id} className="news-list-grid-item">
                <NewsJournalCard article={article} />
              </div>
            ))}
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
