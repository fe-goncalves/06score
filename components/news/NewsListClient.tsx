"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { NewsJournalCard } from "@/components/news/NewsJournalCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { NewsArticleListItem } from "@/lib/types";

interface NewsListClientProps {
  articles: NewsArticleListItem[];
  competitions: { id: string; full_name: string; short_name: string | null }[];
}

export function NewsListClient({ articles, competitions }: NewsListClientProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return articles;
    return articles.filter((a) => a.competition_ids.includes(filter));
  }, [articles, filter]);

  const [featured, ...rest] = filtered;

  return (
    <SectionEnter className="page-container pb-14 pt-2">
      {competitions.length > 1 && (
        <div className="news-list-filters competition-hub-tabs scrollbar-hide">
          <div className="competition-hub-tabs-track">
            <button
              type="button"
              onClick={() => setFilter("")}
              className={`competition-hub-tab ${!filter ? "competition-hub-tab-active" : ""}`}
              style={{ "--tab-accent": "var(--color-brand)" } as CSSProperties}
            >
              Todas
            </button>
            {competitions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
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
          {featured && (
            <div className="news-list-featured">
              <NewsJournalCard article={featured} featured />
            </div>
          )}
          {rest.length > 0 && (
            <div className="news-list-grid">
              {rest.map((article) => (
                <div key={article.id} className="news-list-grid-item">
                  <NewsJournalCard article={article} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SectionEnter>
  );
}
