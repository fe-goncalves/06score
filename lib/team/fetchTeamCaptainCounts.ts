import { getSupabase } from "@/lib/supabase";

export interface TeamCaptainCountFilters {
  editionIds: string[] | null;
}

async function matchIdsForEditions(editionIds: string[]): Promise<string[]> {
  if (!editionIds.length) return [];
  const supabase = getSupabase();

  const { data: phases, error: phaseError } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  if (phaseError || !phases?.length) {
    if (phaseError) {
      console.error("[fetchTeamCaptainCounts:phases]", phaseError.message);
    }
    return [];
  }

  const phaseIds = phases.map((p) => p.id as string).filter(Boolean);
  if (!phaseIds.length) return [];

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("id")
    .in("phase_id", phaseIds);

  if (matchError) {
    console.error("[fetchTeamCaptainCounts:matches]", matchError.message);
    return [];
  }

  return (matches ?? [])
    .map((m) => m.id as string | undefined)
    .filter((id): id is string => !!id);
}

/** Jogos como capitão por atleta no time (via escalações). */
export async function fetchTeamCaptainCounts(
  teamId: string,
  filters: TeamCaptainCountFilters = { editionIds: null },
): Promise<Record<string, number>> {
  const supabase = getSupabase();

  let query = supabase
    .from("match_lineups")
    .select("athlete_id, edition_teams!inner(team_id)")
    .eq("is_captain", true)
    .eq("is_present", true)
    .eq("edition_teams.team_id", teamId);

  if (filters.editionIds?.length) {
    const matchIds = await matchIdsForEditions(filters.editionIds);
    if (!matchIds.length) return {};
    query = query.in("match_id", matchIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[fetchTeamCaptainCounts]", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.athlete_id as string | undefined;
    if (!id) continue;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
