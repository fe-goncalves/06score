"use server";

import { getSupabase } from "@/lib/supabase";
import type { RankingRow } from "@/lib/types";

export async function fetchRanking(
  orgId: string,
  gender: string,
  sportSlug: string,
): Promise<RankingRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("calculate_ranking", {
    p_organization_id: orgId,
    p_gender: gender,
    p_sport_slug: sportSlug,
  });

  if (error) {
    console.error("[fetchRanking]", error.message);
    return [];
  }

  return (data ?? []) as RankingRow[];
}