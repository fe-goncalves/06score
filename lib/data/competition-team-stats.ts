import { getSupabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CompetitionTeamStats {
  participations: number;
  titles: number;
  wins: number;
}

function emptyStats(): CompetitionTeamStats {
  return { participations: 0, titles: 0, wins: 0 };
}

const PAGE_SIZE = 1000;

async function fetchAllForEditions(
  supabase: SupabaseClient,
  table: "team_edition_stats" | "edition_awards" | "edition_teams",
  select: string,
  editionIds: string[],
  applyFilters?: (
    query: ReturnType<SupabaseClient["from"]>,
  ) => ReturnType<SupabaseClient["from"]>,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(table)
      .select(select)
      .in("edition_id", editionIds)
      .range(from, from + PAGE_SIZE - 1);

    if (applyFilters) {
      query = applyFilters(query);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`[fetchCompetitionTeamStats ${table}] ${error.message}`);
    }

    const page = (data as Record<string, unknown>[] | null) ?? [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

/** Histórico agregado por equipe nesta competição. */
export async function fetchCompetitionTeamStats(
  competitionId: string,
): Promise<Record<string, CompetitionTeamStats>> {
  const result: Record<string, CompetitionTeamStats> = {};
  const supabase = getSupabase();

  const ensure = (teamId: string): CompetitionTeamStats => {
    if (!result[teamId]) result[teamId] = emptyStats();
    return result[teamId];
  };

  const { data: editions, error: editionsError } = await supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId);

  if (editionsError) {
    console.error(
      "[fetchCompetitionTeamStats editions]",
      editionsError.message,
    );
    return result;
  }

  const editionIds = (editions ?? [])
    .map((row) => row.id as string)
    .filter(Boolean);

  if (!editionIds.length) return result;

  let statsRows: Record<string, unknown>[] = [];
  try {
    statsRows = await fetchAllForEditions(
      supabase,
      "team_edition_stats",
      "team_id, edition_id, wins",
      editionIds,
    );
  } catch (error) {
    console.error(
      "[fetchCompetitionTeamStats team_edition_stats]",
      error instanceof Error ? error.message : error,
    );
  }

  const participationsFromStats: Record<string, Set<string>> = {};
  for (const row of statsRows) {
    const teamId = row.team_id as string | undefined;
    const editionId = row.edition_id as string | undefined;
    if (!teamId) continue;

    if (editionId) {
      if (!participationsFromStats[teamId]) {
        participationsFromStats[teamId] = new Set();
      }
      participationsFromStats[teamId].add(editionId);
    }

    ensure(teamId).wins += Number(row.wins ?? 0);
  }

  for (const [teamId, editionSet] of Object.entries(participationsFromStats)) {
    ensure(teamId).participations = editionSet.size;
  }

  let titleRows: Record<string, unknown>[] = [];
  try {
    titleRows = await fetchAllForEditions(
      supabase,
      "edition_awards",
      "winning_team_id",
      editionIds,
      (query) =>
        query
          .eq("award_type", "champion")
          .not("winning_team_id", "is", null),
    );
  } catch (error) {
    console.error(
      "[fetchCompetitionTeamStats edition_awards]",
      error instanceof Error ? error.message : error,
    );
  }

  for (const row of titleRows) {
    const teamId = row.winning_team_id as string | undefined;
    if (teamId) ensure(teamId).titles += 1;
  }

  const participationRows = await fetchAllForEditions(
    supabase,
    "edition_teams",
    "team_id, edition_id",
    editionIds,
    (query) =>
      query
        .eq("is_free_agent_pool", false)
        .or("is_active.is.null,is_active.eq.true"),
  ).catch((error) => {
    console.error(
      "[fetchCompetitionTeamStats edition_teams]",
      error instanceof Error ? error.message : error,
    );
    return [] as Record<string, unknown>[];
  });

  if (participationRows.length > 0) {
    const participationsFromTeams: Record<string, Set<string>> = {};
    for (const row of participationRows) {
      const teamId = row.team_id as string | undefined;
      const editionId = row.edition_id as string | undefined;
      if (!teamId || !editionId) continue;
      if (!participationsFromTeams[teamId]) {
        participationsFromTeams[teamId] = new Set();
      }
      participationsFromTeams[teamId].add(editionId);
    }

    for (const [teamId, editionSet] of Object.entries(participationsFromTeams)) {
      ensure(teamId).participations = editionSet.size;
    }
  }

  return result;
}
