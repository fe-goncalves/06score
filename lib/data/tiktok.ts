/** Standby: seção TikTok desligada na home; reativar via HomeClient + page.tsx */

import { getSupabase } from "@/lib/supabase";
import { parseTikTokVideoId } from "@/lib/tiktok";
import { fetchTikTokCreatorOEmbed } from "@/lib/tiktok/oembed";
import type { HomeTikTokVideo, Organization } from "@/lib/types";

export interface TikTokFeed {
  videos: HomeTikTokVideo[];
  creatorEmbedHtml: string | null;
}

const VIDEO_SELECT =
  "id, video_url, title, thumbnail_url, display_order, published_at";

export async function getOrgTikTokVideos(
  orgId: string,
  limit = 5,
): Promise<HomeTikTokVideo[]> {
  const supabase = getSupabase();

  let { data, error } = await supabase
    .from("organization_tiktok_videos")
    .select(VIDEO_SELECT)
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error?.message?.includes("is_active")) {
    const retry = await supabase
      .from("organization_tiktok_videos")
      .select(VIDEO_SELECT)
      .eq("organization_id", orgId)
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(limit);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (error.code !== "PGRST205" && error.code !== "42P01") {
      console.error("[getOrgTikTokVideos]", error.message);
    }
    return [];
  }

  const rows = (data ?? []) as Omit<HomeTikTokVideo, "video_id">[];

  return rows
    .map((row) => {
      const video_id = parseTikTokVideoId(row.video_url);
      if (!video_id) return null;
      return { ...row, video_id };
    })
    .filter((row): row is HomeTikTokVideo => row !== null)
    .slice(0, limit);
}

/**
 * Vídeos manuais (tabela) têm prioridade; senão, embed automático do perfil via oEmbed oficial.
 */
export async function getTikTokFeedForOrg(
  org: Pick<Organization, "id" | "tiktok_url">,
  limit = 5,
): Promise<TikTokFeed> {
  const videos = await getOrgTikTokVideos(org.id, limit);
  if (videos.length > 0) {
    return { videos, creatorEmbedHtml: null };
  }

  if (!org.tiktok_url) {
    return { videos: [], creatorEmbedHtml: null };
  }

  const oembed = await fetchTikTokCreatorOEmbed(org.tiktok_url);
  return {
    videos: [],
    creatorEmbedHtml: oembed?.html ?? null,
  };
}
