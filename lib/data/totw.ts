import { getSupabase } from "@/lib/supabase";
import { isTotwFormationKey } from "@/lib/totw/formations";
import type {
  HomeTotw,
  HomeTotwMember,
  Phase,
  StaffStatLeader,
  TotwGalleryEntry,
} from "@/lib/types";

type TotwMemberRow = {
  display_order: number;
  athlete_id: string | null;
  staff_member_id: string | null;
  team_id: string | null;
  athletes: {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
    player_positions?: { full_name: string; abbreviation: string | null } | null;
  } | null;
  staff_members: {
    id: string;
    full_name: string;
    surname: string | null;
    photo_url: string | null;
    staff_roles?: { full_name: string } | null;
  } | null;
  teams: {
    full_name: string;
    abbreviation: string | null;
    logo_url: string | null;
    primary_color: string | null;
  } | null;
};

type TotwSquadRow = {
  id: string;
  formation: string;
  round_id: string | null;
  created_at: string;
  rounds: {
    id: string;
    name: string;
    custom_label: string | null;
    display_order: number;
    phase_id: string;
    phases: {
      id: string;
      full_name: string;
      custom_label: string | null;
      display_order: number;
    } | null;
  } | null;
  selection_squad_members: TotwMemberRow[];
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapTotwMember(row: TotwMemberRow): HomeTotwMember {
  const isAthlete = !!row.athlete_id;
  const athlete = unwrapRelation(row.athletes);
  const staff = unwrapRelation(row.staff_members);
  const team = unwrapRelation(row.teams);
  const person = isAthlete ? athlete : staff;
  const position = unwrapRelation(athlete?.player_positions ?? null);
  const staffRole = unwrapRelation(staff?.staff_roles ?? null);
  const role = isAthlete
    ? (position?.abbreviation ?? position?.full_name ?? null)
    : (staffRole?.full_name ?? "Comissão");

  return {
    athlete_id: row.athlete_id,
    staff_member_id: row.staff_member_id,
    name: person?.surname?.trim() || person?.full_name || "—",
    photo_url: person?.photo_url ?? null,
    team_abbreviation: team?.abbreviation ?? team?.full_name ?? null,
    team_logo_url: team?.logo_url ?? null,
    team_primary_color: team?.primary_color ?? null,
    role,
    is_staff: !isAthlete,
  };
}

function mapTotwSquadRow(
  row: TotwSquadRow,
  motwByRound: Record<string, string | null>,
): HomeTotw | null {
  const members = [...(row.selection_squad_members ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
  if (!members.length) return null;

  const playerRows = members.filter((m) => (m.display_order ?? 0) <= 7);
  const coachRow = members.find((m) => m.display_order === 8);
  const slots: (HomeTotwMember | null)[] = Array.from({ length: 7 }, () => null);

  playerRows.forEach((member, index) => {
    if (index < 7) slots[index] = mapTotwMember(member);
  });

  const round = unwrapRelation(row.rounds);
  const formation = isTotwFormationKey(row.formation) ? row.formation : "2-3-1";

  return {
    id: row.id,
    formation,
    round_label: round?.custom_label ?? round?.name ?? null,
    created_at: row.created_at,
    slots,
    coach: coachRow ? mapTotwMember(coachRow) : null,
    motw_athlete_id: row.round_id ? (motwByRound[row.round_id] ?? null) : null,
  };
}

async function fetchMotwByRoundIds(
  editionId: string,
  roundIds: string[],
): Promise<Record<string, string | null>> {
  if (!roundIds.length) return {};

  const supabase = getSupabase();
  const { data } = await supabase
    .from("selection_squads")
    .select("round_id, selection_squad_members ( athlete_id )")
    .eq("squad_type", "motw")
    .eq("edition_id", editionId)
    .in("round_id", roundIds);

  const map: Record<string, string | null> = {};
  for (const row of data ?? []) {
    if (row.round_id) {
      map[row.round_id] =
        row.selection_squad_members?.[0]?.athlete_id ?? null;
    }
  }
  return map;
}

const TOTW_SQUAD_SELECT = `
  id,
  formation,
  round_id,
  created_at,
  rounds (
    id,
    name,
    custom_label,
    display_order,
    phase_id,
    phases ( id, full_name, custom_label, display_order )
  ),
  selection_squad_members (
    display_order,
    athlete_id,
    staff_member_id,
    team_id,
    athletes ( id, full_name, surname, photo_url, player_positions ( full_name, abbreviation ) ),
    staff_members ( id, full_name, surname, photo_url, staff_roles ( full_name ) ),
    teams ( full_name, abbreviation, logo_url, primary_color )
  )
`;

export async function getTotwGalleryForEdition(
  editionId: string,
  phases: Phase[] = [],
): Promise<TotwGalleryEntry[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("selection_squads")
    .select(TOTW_SQUAD_SELECT)
    .eq("squad_type", "totw")
    .eq("edition_id", editionId)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  const rows = data as unknown as TotwSquadRow[];
  const roundIds = [
    ...new Set(rows.map((r) => r.round_id).filter((id): id is string => !!id)),
  ];
  const motwByRound = await fetchMotwByRoundIds(editionId, roundIds);

  const phaseOrderMap = new Map(phases.map((p) => [p.id, p.display_order]));

  const entries: TotwGalleryEntry[] = [];

  for (const row of rows) {
    const totw = mapTotwSquadRow(row, motwByRound);
    if (!totw) continue;

    const round = unwrapRelation(row.rounds);
    const phase = unwrapRelation(round?.phases ?? null);
    const phaseId = phase?.id ?? round?.phase_id ?? null;
    const phaseLabel =
      phase?.custom_label ?? phase?.full_name ?? "Fase";
    const phaseOrder =
      phase?.display_order ?? phaseOrderMap.get(phaseId ?? "") ?? 0;
    const roundLabel = round?.custom_label ?? round?.name ?? "Rodada";
    const roundOrder = round?.display_order ?? 0;

    entries.push({
      id: row.id,
      phaseId,
      phaseLabel,
      phaseOrder,
      roundId: row.round_id,
      roundLabel,
      roundOrder,
      totw,
    });
  }

  return entries.sort(
    (a, b) =>
      a.phaseOrder - b.phaseOrder ||
      a.roundOrder - b.roundOrder ||
      new Date(b.totw.created_at).getTime() -
        new Date(a.totw.created_at).getTime(),
  );
}

export function buildCoachLeadersFromGallery(
  gallery: TotwGalleryEntry[],
): StaffStatLeader[] {
  const map = new Map<
    string,
    StaffStatLeader & { staffId: string }
  >();

  for (const entry of gallery) {
    const coach = entry.totw.coach;
    if (!coach?.staff_member_id || !coach.is_staff) continue;

    const staffId = coach.staff_member_id;
    const existing = map.get(staffId);

    if (existing) {
      existing.totw_count += 1;
      continue;
    }

    map.set(staffId, {
      staffId,
      totw_count: 1,
      staff_members: {
        id: staffId,
        full_name: coach.name,
        surname: coach.name,
        photo_url: coach.photo_url,
      },
      teams: coach.team_logo_url
        ? {
            id: "",
            full_name: coach.team_abbreviation ?? "",
            short_name: coach.team_abbreviation,
            abbreviation: coach.team_abbreviation,
            logo_url: coach.team_logo_url,
            primary_color: coach.team_primary_color,
          }
        : null,
    });
  }

  return [...map.values()]
    .sort((a, b) => b.totw_count - a.totw_count)
    .slice(0, 10)
    .map(({ staffId: _staffId, ...rest }) => rest);
}

export async function getLatestTotwForEdition(
  editionId: string,
): Promise<HomeTotw | null> {
  const gallery = await getTotwGalleryForEdition(editionId);
  if (!gallery.length) return null;
  const latest = [...gallery].sort(
    (a, b) =>
      new Date(b.totw.created_at).getTime() -
      new Date(a.totw.created_at).getTime(),
  )[0];
  return latest.totw;
}
