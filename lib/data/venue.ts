import { getPhaseIdsForOrg } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type { OrgVenue } from "@/lib/types";

const VENUE_LIST_SELECT =
  "id, full_name, address, city, state, image_url, organization_id";

export async function getOrgVenues(orgId: string): Promise<OrgVenue[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_LIST_SELECT)
    .eq("organization_id", orgId)
    .order("full_name", { ascending: true });

  if (!error && data?.length) {
    return (data as OrgVenue[]).map((v) => ({
      ...v,
      upcoming_matches: 0,
      recent_matches: 0,
    }));
  }

  if (error && !error.message.includes("does not exist")) {
    console.error("[getOrgVenues table]", error.message);
  }

  return getVenuesFromMatches(orgId);
}

async function getVenuesFromMatches(orgId: string): Promise<OrgVenue[]> {
  const phaseIds = await getPhaseIdsForOrg(orgId);
  if (!phaseIds.length) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select("venue_id, venues(id, full_name, address)")
    .in("phase_id", phaseIds)
    .not("venue_id", "is", null);

  if (error) {
    console.error("[getOrgVenues matches]", error.message);
    return [];
  }

  const map = new Map<string, OrgVenue>();

  for (const row of data ?? []) {
    const venueRaw = row.venues as
      | { id: string; full_name: string; address?: string | null }
      | { id: string; full_name: string; address?: string | null }[]
      | null;
    const venue = Array.isArray(venueRaw) ? venueRaw[0] : venueRaw;
    const id = (row.venue_id as string) ?? venue?.id;
    if (!id || !venue?.full_name) continue;

    const existing = map.get(id);
    if (existing) {
      existing.recent_matches = (existing.recent_matches ?? 0) + 1;
    } else {
      map.set(id, {
        id,
        full_name: venue.full_name,
        address: venue.address ?? null,
        city: null,
        state: null,
        image_url: null,
        organization_id: orgId,
        recent_matches: 1,
        upcoming_matches: 0,
      });
    }
  }

  return [...map.values()].sort((a, b) =>
    a.full_name.localeCompare(b.full_name, "pt-BR"),
  );
}
