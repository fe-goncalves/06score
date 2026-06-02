import { fetchEditionTeamsByIds } from "@/lib/data/shared";
import { getSupabase, getSupabaseServiceRole } from "@/lib/supabase";
import type { MatchStaffLineup } from "@/lib/types";

const STAFF_MEMBER_SELECT = "id, full_name, surname, photo_url";

type RawStaffLineupRow = Pick<
  MatchStaffLineup,
  "staff_member_id" | "edition_team_id" | "is_present"
>;

type StaffMemberRow = NonNullable<MatchStaffLineup["staff_members"]>;

/** `staff_members` exige service role ou policy pública (RLS bloqueia anon). */
export async function fetchStaffMembersByIds(
  staffMemberIds: string[],
): Promise<Map<string, StaffMemberRow>> {
  const uniqueIds = [...new Set(staffMemberIds.filter(Boolean))];
  const map = new Map<string, StaffMemberRow>();
  if (!uniqueIds.length) return map;

  const supabase = getSupabaseServiceRole() ?? getSupabase();
  const { data, error } = await supabase
    .from("staff_members")
    .select(STAFF_MEMBER_SELECT)
    .in("id", uniqueIds);

  if (error) {
    console.error("[fetchStaffMembersByIds]", error.message);
    return map;
  }

  for (const row of (data as StaffMemberRow[] | null) ?? []) {
    if (row.id) map.set(row.id, row);
  }

  if (map.size === 0 && uniqueIds.length > 0 && !getSupabaseServiceRole()) {
    console.warn(
      "[fetchStaffMembersByIds] Nenhum membro retornado com anon key; defina SUPABASE_SERVICE_ROLE_KEY no servidor ou libere SELECT em staff_members para leitura pública.",
    );
  }

  return map;
}

/**
 * Presença da comissão na partida — sem embed encadeado; nomes em query separada.
 */
export async function fetchMatchStaffLineups(
  matchId: string,
): Promise<MatchStaffLineup[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("match_staff_lineups")
    .select("staff_member_id, edition_team_id, is_present")
    .eq("match_id", matchId)
    .eq("is_present", true);

  if (error) {
    const code = error.code;
    if (code === "PGRST205" || code === "42P01") return [];
    console.error("[fetchMatchStaffLineups]", error.message);
    return [];
  }

  const rows = (data as RawStaffLineupRow[] | null) ?? [];
  if (!rows.length) return [];

  const [staffMembersMap, editionTeamsMap] = await Promise.all([
    fetchStaffMembersByIds(rows.map((r) => r.staff_member_id)),
    fetchEditionTeamsByIds(
      [...new Set(rows.map((r) => r.edition_team_id).filter(Boolean))],
    ),
  ]);

  return rows.map((row) => ({
    ...row,
    staff_members: staffMembersMap.get(row.staff_member_id) ?? null,
    edition_teams: editionTeamsMap.get(row.edition_team_id) ?? null,
  }));
}
