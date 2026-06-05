import { getSupabase } from "@/lib/supabase";
import { isTotwFormationKey } from "@/lib/totw/formations";
import type { EditionTotsSquad, HomeTotwMember, Team } from "@/lib/types";

const TOTS_MEMBER_SELECT = `
  display_order,
  athlete_id,
  staff_member_id,
  team_id,
  athletes ( id, full_name, surname, photo_url ),
  staff_members (
    id,
    full_name,
    surname,
    photo_url,
    staff_roles ( full_name )
  )
`;

type TotsMemberRow = {
  display_order: number | null;
  athlete_id: string | null;
  staff_member_id: string | null;
  team_id: string | null;
  athletes: {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
  } | {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
  }[] | null;
  staff_members: {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
    staff_roles?: { full_name: string } | { full_name: string }[] | null;
  } | {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
    staff_roles?: { full_name: string } | { full_name: string }[] | null;
  }[] | null;
};

type TotsSquadRow = {
  id: string;
  formation: string;
  created_at: string;
  selection_squad_members?: TotsMemberRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

async function fetchTeamsMap(teamIds: string[]): Promise<Map<string, Team>> {
  if (!teamIds.length) return new Map();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select("id, full_name, short_name, abbreviation, logo_url, primary_color")
    .in("id", teamIds)
    .eq("is_virtual", false);

  if (error) {
    console.error("[fetchEditionTotsSquad teams]", error.message);
    return new Map();
  }

  const map = new Map<string, Team>();
  for (const team of (data as Team[] | null) ?? []) {
    if (team.id) map.set(team.id, team);
  }
  return map;
}

async function fetchTotsMembers(squadId: string): Promise<TotsMemberRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("selection_squad_members")
    .select(TOTS_MEMBER_SELECT)
    .eq("selection_squad_id", squadId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchEditionTotsSquad members]", error.message);
    return [];
  }

  return (data as TotsMemberRow[] | null) ?? [];
}

function mapTotsMember(
  row: TotsMemberRow,
  teamsMap: Map<string, Team>,
): HomeTotwMember {
  const isAthlete = Boolean(row.athlete_id);
  const athlete = unwrapRelation(row.athletes);
  const staff = unwrapRelation(row.staff_members);
  const team = row.team_id ? teamsMap.get(row.team_id) : undefined;
  const person = isAthlete ? athlete : staff;
  const staffRole = unwrapRelation(staff?.staff_roles ?? null);
  const role = isAthlete
    ? null
    : (staffRole?.full_name ?? "Comissão técnica");

  return {
    athlete_id: row.athlete_id,
    staff_member_id: row.staff_member_id,
    name: isAthlete
      ? (athlete?.surname?.trim() || athlete?.full_name || "—")
      : (staff?.surname?.trim() || staff?.full_name || "—"),
    photo_url: person?.photo_url ?? null,
    team_abbreviation: team?.abbreviation ?? team?.short_name ?? null,
    team_logo_url: team?.logo_url ?? null,
    team_primary_color: team?.primary_color ?? null,
    role,
    is_staff: !isAthlete,
  };
}

function mapTotsSquadRow(
  row: Pick<TotsSquadRow, "id" | "formation" | "created_at">,
  members: TotsMemberRow[],
  teamsMap: Map<string, Team>,
): EditionTotsSquad | null {
  const sorted = [...members].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
  if (!sorted.length) return null;

  const playerRows = sorted.filter((m) => m.athlete_id);
  const staffRows = sorted.filter((m) => !m.athlete_id && m.staff_member_id);

  const slots: (HomeTotwMember | null)[] = Array.from({ length: 7 }, () => null);

  playerRows.forEach((member, index) => {
    if (index < 7) slots[index] = mapTotsMember(member, teamsMap);
  });

  const formation = isTotwFormationKey(row.formation) ? row.formation : "2-3-1";

  return {
    id: row.id,
    formation,
    created_at: row.created_at,
    slots,
    staff: staffRows.map((member) => mapTotsMember(member, teamsMap)),
  };
}

/** TOTS da edição — 2 etapas (squad → members) para evitar falha de embed/RLS. */
export async function fetchEditionTotsSquad(
  editionId: string,
): Promise<EditionTotsSquad | null> {
  const supabase = getSupabase();

  const { data: squads, error: squadError } = await supabase
    .from("selection_squads")
    .select("id, formation, created_at")
    .eq("squad_type", "tots")
    .eq("edition_id", editionId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (squadError) {
    console.error("[fetchEditionTotsSquad]", squadError.message);
    return null;
  }

  const squad = squads?.[0];
  if (!squad) return null;

  let members = await fetchTotsMembers(squad.id);

  if (!members.length) {
    const { data: embedded, error: embedError } = await supabase
      .from("selection_squads")
      .select(`id, formation, created_at, selection_squad_members ( ${TOTS_MEMBER_SELECT} )`)
      .eq("id", squad.id)
      .maybeSingle();

    if (embedError) {
      console.error("[fetchEditionTotsSquad embed]", embedError.message);
    } else {
      const row = embedded as TotsSquadRow | null;
      members = row?.selection_squad_members ?? [];
    }
  }

  const teamIds = [
    ...new Set(
      members
        .map((m) => m.team_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const teamsMap = await fetchTeamsMap(teamIds);
  return mapTotsSquadRow(squad, members, teamsMap);
}
