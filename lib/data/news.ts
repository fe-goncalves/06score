import { getSupabase } from "@/lib/supabase";
import type { NewsArticleListItem, NewsArticleDetail } from "@/lib/types";

export async function getPublishedNews(
  orgId: string,
): Promise<NewsArticleListItem[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select(
      "id, title, subtitle, cover_url, published_at, news_article_competitions(competition_id)",
    )
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
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select(
      `id, title, subtitle, cover_url, published_at, body,
       news_article_teams(teams(id, full_name, short_name, logo_url)),
       news_article_competitions(competitions(id, full_name, short_name))`,
    )
    .eq("id", id)
    .eq("organization_id", orgId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("[getNewsArticle]", error.message);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    cover_url: data.cover_url,
    published_at: data.published_at,
    body: data.body,
    tags_teams: (data.news_article_teams ?? [])
      .map((j: any) => j.teams)
      .filter(Boolean),
    tags_competitions: (data.news_article_competitions ?? [])
      .map((j: any) => j.competitions)
      .filter(Boolean),
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

  return (data ?? []).map((row) => row.id);
}