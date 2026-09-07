import { fetchEditionTeamsForEdition } from "@/lib/data/shared";
import { fetchStaffMembersByIds } from "@/lib/data/match-staff-lineups";
import { getSupabase, getSupabaseServiceRole } from "@/lib/supabase";
import type {
  Athlete,
  BidEdition,
  BidTeamDetail,
  BidTeamSummary,
  Team,
  TeamStaffMember,
} from "@/lib/types";

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

type RawBidEditionRow = {
  id: string;
  custom_name: string | null;
  seasons: { name: string } | { name: string }[] | null;
  competitions:
    | {
        id: string;
        full_name: string;
        short_name: string | null;
        logo_url: string | null;
        primary_color: string | null;
        organization_id: string;
      }
    | {
        id: string;
        full_name: string;
        short_name: string | null;
        logo_url: string | null;
        primary_color: string | null;
        organization_id: string;
      }[];
};

function mapBidEdition(row: RawBidEditionRow): BidEdition | null {
  const comp = unwrapJoin(row.competitions);
  if (!comp) return null;
  const season = unwrapJoin(row.seasons);

  return {
    id: row.id,
    competitionId: comp.id,
    competitionName: comp.full_name,
    competitionShortName: comp.short_name,
    competitionLogoUrl: comp.logo_url,
    competitionColor: comp.primary_color,
    seasonName: season?.name ?? null,
    customName: row.custom_name,
  };
}

export async function getBidEditions(orgId: string): Promise<BidEdition[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("competition_editions")
    .select(
      `
      id,
      custom_name,
      seasons ( name ),
      competitions!inner (
        id,
        full_name,
        short_name,
        logo_url,
        primary_color,
        organization_id
      )
    `,
    )
    .not("status", "in", "(closed,finished)")
    .eq("competitions.organization_id", orgId)
    .order("id", { ascending: false });

  if (error) {
    console.error("[getBidEditions]", error.message);
    return [];
  }

  const editions: BidEdition[] = [];
  for (const row of (data as RawBidEditionRow[] | null) ?? []) {
    const mapped = mapBidEdition(row);
    if (mapped) editions.push(mapped);
  }

  return editions;
}

export async function getBidEdition(
  editionId: string,
  orgId: string,
): Promise<BidEdition | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("competition_editions")
    .select(
      `
      id,
      custom_name,
      seasons ( name ),
      competitions!inner (
        id,
        full_name,
        short_name,
        logo_url,
        primary_color,
        organization_id
      )
    `,
    )
    .eq("id", editionId)
    .eq("competitions.organization_id", orgId)
    .maybeSingle();

  if (error) {
    console.error("[getBidEdition]", error.message);
    return null;
  }

  if (!data) return null;
  return mapBidEdition(data as RawBidEditionRow);
}

export async function getBidTeamSummaries(
  editionId: string,
): Promise<BidTeamSummary[]> {
  const editionTeams = await fetchEditionTeamsForEdition(editionId);
  if (!editionTeams.length) return [];

  const editionTeamIds = editionTeams.map((row) => row.id);
  const supabase = getSupabase();

  const { data: rosterData, error } = await supabase
    .from("edition_roster_entries")
    .select("edition_team_id, member_type")
    .in("edition_team_id", editionTeamIds)
    .eq("status", "approved");

  if (error) {
    console.error("[getBidTeamSummaries:roster]", error.message);
  }

  const counts = new Map<string, { athletes: number; staff: number }>();

  for (const row of rosterData ?? []) {
    const id = row.edition_team_id as string;
    const current = counts.get(id) ?? { athletes: 0, staff: 0 };
    if (row.member_type === "staff") {
      current.staff += 1;
    } else {
      current.athletes += 1;
    }
    counts.set(id, current);
  }

  return editionTeams
    .filter((row): row is typeof row & { teams: Team } => row.teams != null)
    .map((row) => {
      const tally = counts.get(row.id) ?? { athletes: 0, staff: 0 };
      return {
        editionTeamId: row.id,
        teamId: row.team_id,
        team: row.teams,
        athleteCount: tally.athletes,
        staffCount: tally.staff,
      };
    });
}

type StaffRoleRow = { full_name?: string | null };

async function fetchBidStaffRoster(
  editionTeamId: string,
): Promise<TeamStaffMember[]> {
  const supabase = getSupabaseServiceRole() ?? getSupabase();

  const { data: rosterRows, error: rosterError } = await supabase
    .from("edition_roster_entries")
    .select("staff_member_id")
    .eq("edition_team_id", editionTeamId)
    .eq("member_type", "staff")
    .eq("status", "approved");

  if (rosterError) {
    console.error("[fetchBidStaffRoster:entries]", rosterError.message);
    return [];
  }

  const staffIds = [
    ...new Set(
      (rosterRows ?? [])
        .map((row) => row.staff_member_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (!staffIds.length) return [];

  const { data: roleRows, error: roleError } = await supabase
    .from("staff_members")
    .select("id, staff_roles ( full_name )")
    .in("id", staffIds);

  const roleById = new Map<string, string | null>();
  if (!roleError) {
    for (const row of roleRows ?? []) {
      const role = unwrapJoin(row.staff_roles as StaffRoleRow | StaffRoleRow[] | null);
      roleById.set(row.id as string, role?.full_name?.trim() || null);
    }
  }

  const membersMap = await fetchStaffMembersByIds(staffIds);

  return staffIds
    .map((id) => {
      const member = membersMap.get(id);
      if (!member) return null;
      return {
        id: member.id,
        full_name: member.full_name,
        surname: member.surname,
        photo_url: member.photo_url,
        role: roleById.get(id) ?? null,
      } satisfies TeamStaffMember;
    })
    .filter((member): member is TeamStaffMember => member != null)
    .sort((a, b) =>
      (a.surname ?? a.full_name).localeCompare(b.surname ?? b.full_name, "pt-BR"),
    );
}

async function fetchBidAthleteRoster(
  editionTeamId: string,
): Promise<(Athlete & { id: string })[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("edition_roster_entries")
    .select(
      `
      athletes (
        id,
        full_name,
        surname,
        photo_url,
        birth_date,
        nationality,
        player_positions ( full_name, abbreviation )
      )
    `,
    )
    .eq("edition_team_id", editionTeamId)
    .or("member_type.eq.athlete,member_type.is.null")
    .eq("status", "approved");

  if (error) {
    console.error("[fetchBidAthleteRoster]", error.message);
    return [];
  }

  const squad: (Athlete & { id: string })[] = [];

  for (const row of data ?? []) {
    const athlete = row.athletes as
      | (Athlete & { id: string })
      | (Athlete & { id: string })[]
      | null;
    if (athlete && !Array.isArray(athlete) && athlete.id) {
      squad.push(athlete);
      continue;
    }
    if (Array.isArray(athlete)) {
      for (const item of athlete) {
        if (item.id) squad.push(item);
      }
    }
  }

  squad.sort((a, b) =>
    (a.surname ?? a.full_name).localeCompare(b.surname ?? b.full_name, "pt-BR"),
  );

  return squad;
}

export async function getBidTeamDetail(
  editionId: string,
  teamId: string,
  orgId: string,
): Promise<BidTeamDetail | null> {
  const edition = await getBidEdition(editionId, orgId);
  if (!edition) return null;

  const supabase = getSupabase();

  const { data: editionTeam, error: etError } = await supabase
    .from("edition_teams")
    .select(
      `
      id,
      edition_id,
      team_id,
      is_active,
      is_free_agent_pool,
      teams (
        id,
        full_name,
        short_name,
        abbreviation,
        logo_url,
        primary_color
      )
    `,
    )
    .eq("edition_id", editionId)
    .eq("team_id", teamId)
    .eq("is_free_agent_pool", false)
    .maybeSingle();

  if (etError) {
    console.error("[getBidTeamDetail:edition_teams]", etError.message);
    return null;
  }

  if (!editionTeam) return null;

  const team = unwrapJoin(
    editionTeam.teams as Team | Team[] | null,
  ) as Team | null;

  if (!team) return null;

  const editionTeamId = editionTeam.id as string;

  const [squad, staff] = await Promise.all([
    fetchBidAthleteRoster(editionTeamId),
    fetchBidStaffRoster(editionTeamId),
  ]);

  return {
    edition,
    team,
    editionTeamId,
    squad,
    staff,
  };
}
