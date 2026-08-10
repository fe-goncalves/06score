"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { NewsJournalCard } from "@/components/news/NewsJournalCard";
import { StatsTablePager } from "@/components/team/StatsTableControls";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { matchesQuery, normalizeQuery } from "@/lib/search/normalizeQuery";
import type { NewsArticleListItem } from "@/lib/types";

const PAGE_SIZE = 20;

interface NewsListClientProps {
  articles: NewsArticleListItem[];
  competitions: { id: string; full_name: string; short_name: string | null }[];
}

export function NewsListClient({ articles, competitions }: NewsListClientProps) {
  const [filter, setFilter] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);
  const query = normalizeQuery(term);

  const filtered = useMemo(() => {
    let rows = articles;
    if (filter) {
      rows = rows.filter((a) => a.competition_ids.includes(filter));
    }
    if (query) {
      rows = rows.filter(
        (a) =>
          matchesQuery(a.title, query) ||
          matchesQuery(a.subtitle, query),
      );
    }
    return rows;
  }, [articles, filter, query]);

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
    <div className="site-list-page">
      <SiteListHero
        title="NOTÍCIAS"
        searchId="news-search"
        searchValue={term}
        onSearchChange={(value) => {
          setTerm(value);
          setPage(0);
        }}
      />
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
          <p className="liquid-glass-list-empty">Nenhuma notícia encontrada.</p>
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
    </div>
  );
}
