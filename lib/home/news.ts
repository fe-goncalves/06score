import type { HomeNewsArticle } from "@/lib/types";

/** Quantas notícias o carrossel do hero exibe no desktop (mais recentes). */
export const HERO_NEWS_COUNT = 3;

/** Quantas notícias o carrossel do hero exibe no mobile. */
export const HERO_MOBILE_NEWS_COUNT = 7;

/** Quantas notícias o grid lateral do hero exibe (4ª à 7ª). */
export const HERO_SIDE_NEWS_COUNT = 4;

function publishedAtMs(article: HomeNewsArticle): number {
  if (!article.published_at) return 0;
  const ms = new Date(article.published_at).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Mais recentes primeiro (published_at desc). */
export function sortNewsByPublishedAt(
  articles: HomeNewsArticle[],
): HomeNewsArticle[] {
  return [...articles].sort(
    (a, b) => publishedAtMs(b) - publishedAtMs(a),
  );
}

export function getHeroNews(articles: HomeNewsArticle[]): HomeNewsArticle[] {
  return sortNewsByPublishedAt(articles).slice(0, HERO_NEWS_COUNT);
}

export function getHeroMobileNews(articles: HomeNewsArticle[]): HomeNewsArticle[] {
  return sortNewsByPublishedAt(articles).slice(0, HERO_MOBILE_NEWS_COUNT);
}

/** 4ª notícia da fila — fallback do hero quando não há próximos jogos. */
export function getHeroFallbackNews(
  articles: HomeNewsArticle[],
): HomeNewsArticle | null {
  return sortNewsByPublishedAt(articles)[HERO_NEWS_COUNT] ?? null;
}

/** Notícias 4ª à 7ª para o grid lateral do hero. */
export function getHeroSideNews(
  articles: HomeNewsArticle[],
  skip = HERO_NEWS_COUNT,
  limit = HERO_SIDE_NEWS_COUNT,
): HomeNewsArticle[] {
  return sortNewsByPublishedAt(articles).slice(skip, skip + limit);
}

/** Notícias após o hero para a seção jornal (padrão: a partir da 4ª). */
export function getJournalNews(
  articles: HomeNewsArticle[],
  limit: number,
  skip = HERO_NEWS_COUNT,
): HomeNewsArticle[] {
  return sortNewsByPublishedAt(articles).slice(skip, skip + limit);
}
