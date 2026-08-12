import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { NewsArticleListItem } from "@/lib/types";

interface CompetitionNewsPanelProps {
  news: NewsArticleListItem[];
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CompetitionNewsPanel({ news }: CompetitionNewsPanelProps) {
  if (!news.length) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Nenhuma notícia para esta competição.
      </p>
    );
  }

  return (
    <div className="competition-news-explore">
      {news.map((article) => (
        <Link
          key={article.id}
          href={`/news/${article.id}`}
          className="competition-news-explore-card"
        >
          <div className="competition-news-explore-media">
            <OrgImage
              src={article.cover_url}
              alt=""
              width={640}
              height={800}
              className="competition-news-explore-cover"
            />
          </div>
          <div className="competition-news-explore-meta">
            <h3 className="competition-news-explore-title">{article.title}</h3>
            {article.published_at ? (
              <time
                className="competition-news-explore-date"
                dateTime={article.published_at}
              >
                {formatDate(article.published_at)}
              </time>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
