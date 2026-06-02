import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { NewsArticle } from "@/lib/types";
import { formatPublishedDate } from "@/lib/utils";

interface NewsSectionProps {
  articles: NewsArticle[];
}

function NewsHeroCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="frosted-glass-hover group block h-[200px] shrink-0 md:min-h-[200px]"
    >
      <article className="relative h-full overflow-hidden rounded-lg card-surface">
        <div className="news-card-media absolute inset-0 bg-white/5">
          {article.cover_url && (
            <OrgImage
              src={article.cover_url}
              alt={article.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="frosted-glass absolute inset-x-0 bottom-0 p-4">
          <span className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
            Notícias
          </span>
          <h3 className="font-display mt-1 line-clamp-2 text-[18px] font-black uppercase leading-tight text-white">
            {article.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

function NewsSecondaryCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="group block w-[240px] shrink-0 snap-start md:w-auto"
    >
      <article className="card-surface flex h-[120px] overflow-hidden rounded-lg md:h-full">
        <div className="news-card-media relative h-full w-[100px] shrink-0 bg-white/5">
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center p-3">
          <time className="font-mono-label text-[8px] uppercase text-white/40">
            {formatPublishedDate(article.published_at)}
          </time>
          <h3 className="font-display mt-1 line-clamp-3 text-sm font-black uppercase leading-snug text-white">
            {article.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

export function NewsSection({ articles }: NewsSectionProps) {
  if (!articles.length) {
    return (
      <section className="py-6">
        <SectionTitle>Notícias</SectionTitle>
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma notícia publicada.
        </p>
      </section>
    );
  }

  const [hero, ...rest] = articles;

  return (
    <SectionEnter className="py-6">
      <div className="page-container mb-4">
        <SectionTitle>Notícias</SectionTitle>
      </div>

      {/* Mobile: hero + horizontal scroll */}
      <div className="page-edge-x space-y-3 md:hidden">
        <NewsHeroCard article={hero} />
        {rest.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x-mandatory">
            {rest.map((article) => (
              <NewsSecondaryCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: grid 2fr+1fr só quando há notícias secundárias */}
      {rest.length > 0 ? (
        <div className="page-container hidden gap-4 md:grid md:grid-cols-[2fr_1fr] md:items-stretch">
          <NewsHeroCard article={hero} />
          <div className="flex min-h-[200px] flex-col gap-3">
            {rest.slice(0, 2).map((article) => (
              <NewsSecondaryCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <div className="page-container hidden md:block">
          <NewsHeroCard article={hero} />
        </div>
      )}
    </SectionEnter>
  );
}
