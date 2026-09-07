import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { HomeNewsArticle } from "@/lib/types";
import { HERO_SIDE_NEWS_COUNT } from "@/lib/home/news";

interface HeroNewsGridProps {
  articles: HomeNewsArticle[];
}

function HeroNewsGridCard({ article }: { article: HomeNewsArticle }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="hero-side-card group block h-full min-h-0"
    >
      <article className="hero-side-card-inner">
        <div className="hero-side-card-media">
          <OrgImage
            src={article.cover_url}
            alt=""
            fill
            className="hero-side-card-image object-cover"
            sizes="160px"
          />
        </div>
        <div className="hero-side-card-vignette" aria-hidden />
        <h3 className="hero-side-card-title">{article.title}</h3>
      </article>
    </Link>
  );
}

export function HeroNewsGrid({ articles }: HeroNewsGridProps) {
  const slots = Array.from({ length: HERO_SIDE_NEWS_COUNT }, (_, i) => articles[i] ?? null);

  if (!articles.length) {
    return (
      <div className="hero-side-news-grid hero-side-news-grid-empty">
        <p className="font-mono-label text-center text-xs text-white/40">
          Sem mais notícias no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="hero-side-news-grid">
      {slots.map((article, index) => (
        <div key={article?.id ?? `empty-${index}`} className="hero-side-news-cell">
          {article ? <HeroNewsGridCard article={article} /> : null}
        </div>
      ))}
    </div>
  );
}
