import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import type { Organization } from "@/lib/types";

export async function getOrgSlug(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-org-slug") ??
    process.env.NEXT_PUBLIC_ORG_SLUG ??
    "orange"
  );
}

export async function getOrganization(
  slug: string,
): Promise<Organization | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, custom_domain, logo_url, primary_color, secondary_color, description, instagram_url, youtube_url, tiktok_url, twitter_url",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getOrganization]", error.message);
    return null;
  }

  return data;
}
