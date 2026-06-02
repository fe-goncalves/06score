import { getSupabase } from "@/lib/supabase";
import type { NewsArticleDetail, NewsArticleListItem } from "@/lib/types";

const LIST_SELECT =
  "id, title, subtitle, cover_url, published_at, news_article_competitions(competition_id)";

const BODY_FIELDS = ["body", "content", "body_json", "article_body"] as const;

type ArticleRow = {
  id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  published_at: string | null;
  [key: string]: unknown;
};

async function fetchArticleTags(
  articleId: string,
): Promise<{
  tags_teams: NewsArticleDetail["tags_teams"];
  tags_competitions: NewsArticleDetail["tags_competitions"];
}> {
  const supabase = getSupabase();
  const empty = { tags_teams: [], tags_competitions: [] };

  const teamQueries = [
    () =>
      supabase
        .from("news_article_teams")
        .select("teams(id, full_name, short_name, logo_url)")
        .eq("article_id", articleId),
    () =>
      supabase
        .from("news_article_teams")
        .select("teams(id, full_name, short_name, logo_url)")
        .eq("news_article_id", articleId),
  ];

  const competitionQueries = [
    () =>
      supabase
        .from("news_article_competitions")
        .select("competitions(id, full_name, short_name)")
        .eq("article_id", articleId),
    () =>
      supabase
        .from("news_article_competitions")
        .select("competitions(id, full_name, short_name)")
        .eq("news_article_id", articleId),
  ];

  type TagQueryResult<T> = {
    data: T[] | null;
    error: { message: string } | null;
  };

  async function runFirstSuccessful<T>(
    queries: Array<() => PromiseLike<TagQueryResult<T>>>,
    label: string,
  ): Promise<T[]> {
    for (const query of queries) {
      const { data, error } = await query();
      if (!error) return data ?? [];
      if (!error.message.includes("does not exist")) {
        console.error(`[fetchArticleTags] ${label}`, error.message);
        return [];
      }
    }
    return [];
  }

  const [teamRows, competitionRows] = await Promise.all([
    runFirstSuccessful(teamQueries, "teams"),
    runFirstSuccessful(competitionQueries, "competitions"),
  ]);

  return {
    tags_teams: teamRows
      .map((row: { teams: NewsArticleDetail["tags_teams"][number] | null }) => row.teams)
      .filter(Boolean),
    tags_competitions: competitionRows
      .map(
        (row: {
          competitions: NewsArticleDetail["tags_competitions"][number] | null;
        }) => row.competitions,
      )
      .filter(Boolean),
  };
}

async function fetchArticleBase(
  id: string,
  orgId: string,
): Promise<ArticleRow | null> {
  const supabase = getSupabase();

  for (const bodyField of BODY_FIELDS) {
    const { data, error } = await supabase
      .from("news_articles")
      .select(
        `id, title, subtitle, cover_url, published_at, ${bodyField}`,
      )
      .eq("id", id)
      .eq("organization_id", orgId)
      .eq("is_published", true)
      .maybeSingle();

    if (!error && data) {
      return data as ArticleRow;
    }

    if (error && !error.message.includes("does not exist")) {
      console.error("[fetchArticleBase]", error.message);
      return null;
    }
  }

  const { data, error } = await supabase
    .from("news_articles")
    .select("id, title, subtitle, cover_url, published_at")
    .eq("id", id)
    .eq("organization_id", orgId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("[fetchArticleBase]", error.message);
    return null;
  }

  return (data as ArticleRow | null) ?? null;
}

function extractBody(row: ArticleRow): object | null {
  for (const field of BODY_FIELDS) {
    const value = row[field];
    if (value != null && typeof value === "object") {
      return value as object;
    }
  }
  return null;
}

export async function getPublishedNews(
  orgId: string,
): Promise<NewsArticleListItem[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select(LIST_SELECT)
    .eq("organization_id", orgId)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getPublishedNews]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cover_url: row.cover_url,
    published_at: row.published_at,
    competition_ids: (row.news_article_competitions ?? []).map(
      (j: { competition_id: string }) => j.competition_id,
    ),
  }));
}

export async function getNewsArticle(
  id: string,
  orgId: string,
): Promise<NewsArticleDetail | null> {
  const row = await fetchArticleBase(id, orgId);
  if (!row) return null;

  const tags = await fetchArticleTags(row.id);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cover_url: row.cover_url,
    published_at: row.published_at,
    body: extractBody(row),
    ...tags,
  };
}

export async function getPublishedNewsIds(orgId: string): Promise<string[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select("id")
    .eq("organization_id", orgId)
    .eq("is_published", true);

  if (error) {
    console.error("[getPublishedNewsIds]", error.message);
    return [];
  }

  return (data ?? []).map((row) => String(row.id));
}
