import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { HomeNewsArticle } from "@/lib/types";
import { formatPublishedDate } from "@/lib/utils";

interface NewsJournalSectionProps {
  articles: HomeNewsArticle[];
  /** Quantas notícias o hero já exibe (evita repetir no grid) */
  skipCount?: number;
}

function JournalCard({
  article,
  featured = false,
}: {
  article: HomeNewsArticle;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/news/${article.id}`}
      className={`news-journal-card group block ${featured ? "news-journal-featured" : ""}`}
    >
      <article className="flex h-full flex-col">
        <div
          className={`news-card-media relative overflow-hidden bg-white/[0.05] ${featured ? "aspect-[16/10] md:aspect-[2/1]" : "aspect-[16/11]"}`}
        >
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col border-t border-white/[0.06] p-4 md:p-5">
          <time className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
            {formatPublishedDate(article.published_at)}
          </time>
          <h3
            className={`font-display mt-2 font-black uppercase leading-tight text-white group-hover:text-[var(--color-brand)] ${featured ? "text-xl md:text-2xl" : "text-base"}`}
          >
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="font-body mt-2 line-clamp-3 text-sm leading-relaxed text-white/50">
              {article.subtitle}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

export function NewsJournalSection({
  articles,
  skipCount = 3,
}: NewsJournalSectionProps) {
  const items = articles.slice(skipCount);

  if (!items.length) {
    return null;
  }

  const [lead, ...rest] = items;
  if (!lead) return null;
  const columnA = rest.filter((_, i) => i % 2 === 0);
  const columnB = rest.filter((_, i) => i % 2 === 1);

  return (
    <SectionEnter className="py-8 md:py-10">
      <div className="page-container">
        <SectionTitle>Últimas notícias</SectionTitle>

        <div className="news-journal-grid mt-4 border border-white/[0.06] md:mt-6">
          <div className="news-journal-lead border-b border-white/[0.06] md:border-b-0 md:border-r">
            <JournalCard article={lead} featured />
          </div>

          <div className="news-journal-columns grid md:grid-cols-2">
            <div className="news-journal-col border-b border-white/[0.06] md:border-b-0 md:border-r">
              {columnA.map((article) => (
                <div
                  key={article.id}
                  className="border-b border-white/[0.06] last:border-b-0"
                >
                  <JournalCard article={article} />
                </div>
              ))}
            </div>
            <div className="news-journal-col">
              {columnB.map((article) => (
                <div
                  key={article.id}
                  className="border-b border-white/[0.06] last:border-b-0"
                >
                  <JournalCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
