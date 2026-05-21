import { NewsCard } from "@/components/home/NewsCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { NewsArticle } from "@/lib/types";

interface NewsGridProps {
  articles: NewsArticle[];
}

export function NewsGrid({ articles }: NewsGridProps) {
  if (!articles.length) {
    return (
      <section className="py-20 lg:py-28">
        <SectionTitle>Notícias em destaque</SectionTitle>
        <p className="text-sm text-white/40">Nenhuma notícia publicada.</p>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28">
      <SectionTitle>Notícias em destaque</SectionTitle>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
