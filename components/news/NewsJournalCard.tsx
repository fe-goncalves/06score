import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { formatPublishedDate } from "@/lib/utils";

interface NewsJournalCardProps {
  article: {
    id: string;
    title: string;
    subtitle: string | null;
    cover_url: string | null;
    published_at: string | null;
  };
  featured?: boolean;
}

export function NewsJournalCard({ article, featured = false }: NewsJournalCardProps) {
  return (
    <Link
      href={`/news/${article.id}`}
      className={`news-journal-card-list group ${featured ? "news-journal-card-featured" : ""}`}
    >
      <article>
        <div
          className="news-journal-card-list-media news-card-media aspect-[16/10]"
        >
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="news-journal-card-list-body">
          <time className="news-journal-card-list-date">
            {formatPublishedDate(article.published_at)}
          </time>
          <h3 className="news-journal-card-list-title">{article.title}</h3>
          {article.subtitle ? (
            <p className="news-journal-card-list-sub line-clamp-3">
              {article.subtitle}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
