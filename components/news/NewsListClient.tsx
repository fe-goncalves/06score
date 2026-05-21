"use client";

import { useMemo, useState } from "react";
import { NewsCard } from "@/components/news/NewsCard";
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

  return (
    <div>
      {competitions.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("")}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              !filter
                ? "bg-[var(--color-brand)] text-black"
                : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white/90"
            }`}
          >
            Todas
          </button>
          {competitions.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                filter === c.id
                  ? "bg-[var(--color-brand)] text-black"
                  : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white/90"
              }`}
            >
              {c.short_name ?? c.full_name}
            </button>
          ))}
        </div>
      )}

      {!filtered.length ? (
        <p className="text-sm text-white/40">Nenhuma notícia encontrada.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}