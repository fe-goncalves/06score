import { getSupabase } from "@/lib/supabase";
import type { OrgVenue, TeamStaffMember } from "@/lib/types";

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function unwrapVenue(
  raw:
    | OrgVenue
    | OrgVenue[]
    | { id?: string; full_name?: string | null; short_name?: string | null; address?: string | null }
    | { id?: string; full_name?: string | null; short_name?: string | null; address?: string | null }[]
    | null
    | undefined,
): OrgVenue | null {
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row?.id) return null;
  const label = row.full_name?.trim() || row.short_name?.trim();
  if (!label) return null;
  return {
    id: row.id,
    full_name: label,
    address: row.address ?? undefined,
    logo_url:
      "logo_url" in row
        ? ((row as { logo_url?: string | null }).logo_url ?? null)
        : null,
  };
}

const VENUE_SELECT = "id, full_name, address, logo_url";

/** Arena embarcada via `venues!teams_home_venue_id_fkey`. */
export function venueFromTeamEmbed(
  venues:
    | { id?: string; full_name?: string | null; short_name?: string | null }
    | { id?: string; full_name?: string | null; short_name?: string | null }[]
    | null
    | undefined,
): OrgVenue | null {
  return unwrapVenue(venues);
}

async function fetchVenueById(venueId: string): Promise<OrgVenue | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_SELECT)
    .eq("id", venueId)
    .maybeSingle();

  if (error) {
    console.error("[fetchVenueById]", error.message);
    return null;
  }

  return data ? (data as OrgVenue) : null;
}

/** Local mais frequente nas partidas finalizadas do time (fallback da arena). */
async function fetchMostFrequentTeamVenue(
  teamId: string,
  phaseIds: string[],
): Promise<OrgVenue | null> {
  if (!phaseIds.length) return null;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("matches")
    .select(`venue_id, venues(${VENUE_SELECT})`)
    .in("phase_id", phaseIds)
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .not("venue_id", "is", null);

  if (error) {
    console.error("[fetchMostFrequentTeamVenue]", error.message);
    return null;
  }

  const counts = new Map<string, { count: number; venue: OrgVenue }>();

  for (const row of data ?? []) {
    const venueId = row.venue_id as string | undefined;
    if (!venueId) continue;
    const venue = unwrapVenue(
      row.venues as OrgVenue | OrgVenue[] | null | undefined,
    );
    if (!venue) continue;

    const existing = counts.get(venueId);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(venueId, { count: 1, venue });
    }
  }

  let best: { count: number; venue: OrgVenue } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }

  return best?.venue ?? null;
}

export async function resolveTeamHomeVenue(
  teamId: string,
  homeVenueId: string | null,
  phaseIds: string[],
  embeddedVenue: OrgVenue | null = null,
): Promise<OrgVenue | null> {
  if (embeddedVenue) return embeddedVenue;

  if (homeVenueId) {
    const venue = await fetchVenueById(homeVenueId);
    if (venue) return venue;
  }

  return fetchMostFrequentTeamVenue(teamId, phaseIds);
}

const STAFF_SELECT = `
  staff_member_id,
  started_at,
  staff_members (
    id,
    full_name,
    surname,
    photo_url,
    staff_roles ( full_name )
  )
`;

function parseStaffMember(row: Record<string, unknown>): TeamStaffMember | null {
  const member = unwrapRelation(
    row.staff_members as
      | (TeamStaffMember & { staff_roles?: { full_name?: string | null } | null })
      | (TeamStaffMember & { staff_roles?: { full_name?: string | null } | null })[]
      | null
      | undefined,
  );
  if (!member?.id) return null;

  const roleRow = unwrapRelation(member.staff_roles ?? null);
  return {
    id: member.id,
    full_name: member.full_name,
    surname: member.surname ?? null,
    photo_url: member.photo_url ?? null,
    role: roleRow?.full_name?.trim() || null,
  };
}

/** Comissão técnica atual (`is_current`; `is_active` quando disponível). */
export async function fetchCurrentTeamStaff(
  teamId: string,
): Promise<TeamStaffMember[]> {
  const supabase = getSupabase();

  const attempts = [
    () =>
      supabase
        .from("staff_team_stints")
        .select(STAFF_SELECT)
        .eq("team_id", teamId)
        .eq("is_current", true)
        .eq("is_active", true),
    () =>
      supabase
        .from("staff_team_stints")
        .select(STAFF_SELECT)
        .eq("team_id", teamId)
        .eq("is_current", true),
    () =>
      supabase
        .from("staff_team_stints")
        .select(STAFF_SELECT)
        .eq("team_id", teamId)
        .is("ended_at", null),
  ];

  for (const run of attempts) {
    const { data, error } = await run();
    if (error) {
      console.error("[fetchCurrentTeamStaff]", error.message);
      continue;
    }

    const members = (data ?? [])
      .map((row) => parseStaffMember(row as Record<string, unknown>))
      .filter((row): row is TeamStaffMember => row != null);

    if (members.length) {
      return members.sort((a, b) =>
        (a.surname ?? a.full_name).localeCompare(b.surname ?? b.full_name, "pt-BR"),
      );
    }
  }

  return [];
}
