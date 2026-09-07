import { getSupabase } from "@/lib/supabase";
import type { HomeSponsor } from "@/lib/types";

export interface PublicSiteHomeConfig {
  organization_id: string;
  slug: string;
  home_games_past_days: number;
  home_games_future_days: number;
  home_sponsors_visible: boolean;
  sponsors: HomeSponsor[];
}

const DEFAULT_HOME_CONFIG: Omit<PublicSiteHomeConfig, "organization_id" | "slug"> = {
  home_games_past_days: 30,
  home_games_future_days: 30,
  home_sponsors_visible: false,
  sponsors: [],
};

function normalizeSponsor(raw: Record<string, unknown>): HomeSponsor {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    logo_url: (raw.logo_url as string | null) ?? null,
    link_url: (raw.link_url as string | null) ?? null,
    display_order: (raw.display_order as number | null) ?? null,
  };
}

function normalizeHomeConfig(
  raw: Record<string, unknown>,
  slug: string,
): PublicSiteHomeConfig {
  const sponsorsRaw = Array.isArray(raw.sponsors) ? raw.sponsors : [];
  const sponsors = sponsorsRaw
    .map((row) => normalizeSponsor(row as Record<string, unknown>))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return {
    organization_id: String(raw.organization_id ?? ""),
    slug: String(raw.slug ?? slug),
    home_games_past_days:
      typeof raw.home_games_past_days === "number"
        ? raw.home_games_past_days
        : DEFAULT_HOME_CONFIG.home_games_past_days,
    home_games_future_days:
      typeof raw.home_games_future_days === "number"
        ? raw.home_games_future_days
        : DEFAULT_HOME_CONFIG.home_games_future_days,
    home_sponsors_visible:
      typeof raw.home_sponsors_visible === "boolean"
        ? raw.home_sponsors_visible
        : DEFAULT_HOME_CONFIG.home_sponsors_visible,
    sponsors: raw.home_sponsors_visible === false ? [] : sponsors,
  };
}

export async function getPublicSiteHomeConfig(
  orgSlug: string,
): Promise<PublicSiteHomeConfig> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("get_public_site_home_config", {
    p_org_slug: orgSlug,
  });

  if (error) {
    console.error("[getPublicSiteHomeConfig]", error.message);
    return {
      organization_id: "",
      slug: orgSlug,
      ...DEFAULT_HOME_CONFIG,
    };
  }

  if (!data || typeof data !== "object") {
    return {
      organization_id: "",
      slug: orgSlug,
      ...DEFAULT_HOME_CONFIG,
    };
  }

  return normalizeHomeConfig(data as Record<string, unknown>, orgSlug);
}
