import { getPhaseIdsForOrg } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type { Match, OrgVenue, VenueProfileData } from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

const MATCH_LIMIT = 120;

const VENUE_FULL_SELECT =
  "id, full_name, address, city, state, image_url, organization_id";

const VENUE_MINIMAL_SELECT = "id, full_name, address, organization_id";

const VENUE_EMBED_MINIMAL = "venues ( id, full_name, address )";

function unwrapVenueEmbed(
  raw:
    | { id?: string; full_name?: string; address?: string | null }
    | { id?: string; full_name?: string; address?: string | null }[]
    | null
    | undefined,
) {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

async function fetchVenueRecord(
  venueId: string,
  orgId: string,
): Promise<OrgVenue | null> {
  const supabase = getSupabase();

  const trySelect = async (columns: string, withOrg: boolean) => {
    let query = supabase.from("venues").select(columns).eq("id", venueId);
    if (withOrg) query = query.eq("organization_id", orgId);
    return query.maybeSingle();
  };

  let { data, error } = await trySelect(VENUE_FULL_SELECT, true);
  if (error) {
    console.error("[getVenueProfile:venue:full]", error.message);
    const retry = await trySelect(VENUE_MINIMAL_SELECT, true);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("[getVenueProfile:venue:minimal]", error.message);
    return null;
  }

  if (data) return data as unknown as OrgVenue;

  const { data: byId, error: byIdError } = await trySelect(VENUE_MINIMAL_SELECT, false);
  if (byIdError) {
    console.error("[getVenueProfile:venue:byId]", byIdError.message);
    return null;
  }

  return (byId as unknown as OrgVenue | null) ?? null;
}

async function fetchVenueMatches(
  venueId: string,
  phaseIds: string[],
): Promise<Match[]> {
  const supabase = getSupabase();

  const run = async (withVenueEmbed: boolean) => {
    const select = withVenueEmbed
      ? `
      ${MATCH_SELECT_BASE},
      venue_id,
      ${VENUE_EMBED_MINIMAL}
    `
      : `
      ${MATCH_SELECT_BASE},
      venue_id
    `;

    return supabase
      .from("matches")
      .select(select)
      .eq("venue_id", venueId)
      .in("phase_id", phaseIds)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false })
      .limit(MATCH_LIMIT);
  };

  const primary = await run(true);
  if (!primary.error) {
    return (primary.data as unknown as Match[] | null) ?? [];
  }

  console.error("[getVenueProfile:matches]", primary.error.message);

  const fallback = await run(false);
  if (fallback.error) {
    console.error("[getVenueProfile:matches:fallback]", fallback.error.message);
    return [];
  }

  return (fallback.data as unknown as Match[] | null) ?? [];
}

function venueFromEmbed(
  id: string,
  raw: { full_name?: string; address?: string | null } | null,
  orgId: string,
): OrgVenue | null {
  if (!raw?.full_name) return null;
  return {
    id,
    full_name: raw.full_name,
    address: raw.address ?? null,
    city: null,
    state: null,
    image_url: null,
    organization_id: orgId,
  };
}

export async function getOrgVenues(orgId: string): Promise<OrgVenue[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_FULL_SELECT)
    .eq("organization_id", orgId)
    .order("full_name", { ascending: true });

  if (!error && data?.length) {
    return (data as OrgVenue[]).map((v) => ({
      ...v,
      upcoming_matches: 0,
      recent_matches: 0,
    }));
  }

  if (error) {
    const { data: minimal, error: minimalError } = await supabase
      .from("venues")
      .select(VENUE_MINIMAL_SELECT)
      .eq("organization_id", orgId)
      .order("full_name", { ascending: true });

    if (!minimalError && minimal?.length) {
      return (minimal as OrgVenue[]).map((v) => ({
        ...v,
        city: null,
        state: null,
        image_url: null,
        upcoming_matches: 0,
        recent_matches: 0,
      }));
    }

    if (minimalError && !minimalError.message.includes("does not exist")) {
      console.error("[getOrgVenues table]", minimalError.message);
    } else if (error && !error.message.includes("does not exist")) {
      console.error("[getOrgVenues table]", error.message);
    }
  }

  return getVenuesFromMatches(orgId);
}

async function getVenuesFromMatches(orgId: string): Promise<OrgVenue[]> {
  const phaseIds = await getPhaseIdsForOrg(orgId);
  if (!phaseIds.length) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select(`venue_id, ${VENUE_EMBED_MINIMAL}`)
    .in("phase_id", phaseIds)
    .not("venue_id", "is", null);

  if (error) {
    console.error("[getOrgVenues matches]", error.message);
    return [];
  }

  const map = new Map<string, OrgVenue>();

  for (const row of data ?? []) {
    const venue = unwrapVenueEmbed(
      row.venues as
        | { id?: string; full_name?: string; address?: string | null }
        | { id?: string; full_name?: string; address?: string | null }[]
        | null,
    );
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

export async function getVenueProfile(
  venueId: string,
  orgId: string,
): Promise<VenueProfileData | null> {
  const phaseIds = await getPhaseIdsForOrg(orgId);
  if (!phaseIds.length) return null;

  const [venueFromTable, matches] = await Promise.all([
    fetchVenueRecord(venueId, orgId),
    fetchVenueMatches(venueId, phaseIds),
  ]);

  let venue = venueFromTable;

  if (!venue && matches.length) {
    const embed = unwrapVenueEmbed(matches[0].venues ?? null);
    venue =
      venueFromEmbed(venueId, embed, orgId) ??
      ({
        id: venueId,
        full_name: embed?.full_name ?? "Arena",
        address: embed?.address ?? null,
        city: null,
        state: null,
        image_url: null,
        organization_id: orgId,
      } satisfies OrgVenue);
  }

  if (!venue) return null;

  return { venue, matches };
}
