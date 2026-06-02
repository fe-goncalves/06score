import { getSupabase } from "@/lib/supabase";
import type {
  Competition,
  EditionTeam,
  Match,
  Matchup,
  Team,
  TeamEditionStats,
} from "@/lib/types";

interface EditionTeamRow {
  id: string;
  edition_id: string;
  team_id: string;
  is_free_agent_pool?: boolean | null;
  is_active?: boolean | null;
  display_order?: number | null;
}

function isRegisteredTeam(row: EditionTeamRow): boolean {
  return row.is_free_agent_pool !== true;
}

function isActiveTeam(row: EditionTeamRow): boolean {
  return row.is_active !== false;
}

function sortEditionTeamRows(rows: EditionTeamRow[]): EditionTeamRow[] {
  return [...rows].sort((a, b) => {
    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
}

const EDITION_TEAM_SCALAR_SELECT =
  "id, edition_id, team_id, is_free_agent_pool, is_active, display_order";

async function fetchEditionTeamRowsByEditionIds(
  editionIds: string[],
): Promise<EditionTeamRow[]> {
  if (!editionIds.length) return [];

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("edition_teams")
    .select(EDITION_TEAM_SCALAR_SELECT)
    .in("edition_id", editionIds)
    .eq("is_free_agent_pool", false)
    .or("is_active.is.null,is_active.eq.true")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchEditionTeamRows]", error.message);
    return [];
  }

  return sortEditionTeamRows(
    ((data as EditionTeamRow[] | null) ?? []).filter(
      (row) => row.team_id && isRegisteredTeam(row) && isActiveTeam(row),
    ),
  );
}

async function attachTeamsToEditionRows(
  rows: EditionTeamRow[],
): Promise<EditionTeam[]> {
  if (!rows.length) return [];

  const supabase = getSupabase();
  const teamIds = [...new Set(rows.map((row) => row.team_id))];
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, full_name, short_name, abbreviation, logo_url, primary_color")
    .in("id", teamIds);

  if (teamsError) {
    console.error("[attachTeamsToEditionRows]", teamsError.message);
    return [];
  }

  const teamsMap: Record<string, Team> = {};
  for (const team of teamsData ?? []) {
    teamsMap[team.id as string] = team as Team;
  }

  return rows
    .filter((row) => teamsMap[row.team_id])
    .map((row) => ({
      id: row.id,
      edition_id: row.edition_id,
      team_id: row.team_id,
      is_free_agent_pool: row.is_free_agent_pool === true,
      is_active: row.is_active !== false,
      display_order: row.display_order ?? undefined,
      teams: teamsMap[row.team_id],
    }));
}

export type EditionTeamLineupEmbed = {
  team_id: string;
  edition_id?: string;
  teams: Team | null;
};

/** `edition_teams` por id + `teams` em query separada (evita embed encadeado no PostgREST). */
export async function fetchEditionTeamsByIds(
  editionTeamIds: string[],
): Promise<Map<string, EditionTeamLineupEmbed>> {
  const uniqueIds = [...new Set(editionTeamIds.filter(Boolean))];
  const map = new Map<string, EditionTeamLineupEmbed>();
  if (!uniqueIds.length) return map;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("edition_teams")
    .select("id, team_id, edition_id")
    .in("id", uniqueIds);

  if (error) {
    console.error("[fetchEditionTeamsByIds]", error.message);
    return map;
  }

  const rows = (data ?? []) as { id: string; team_id: string; edition_id?: string }[];
  if (!rows.length) return map;

  const teamIds = [...new Set(rows.map((r) => r.team_id).filter(Boolean))];
  const teamsMap: Record<string, Team> = {};

  if (teamIds.length) {
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, full_name, short_name, abbreviation, logo_url, primary_color")
      .in("id", teamIds);

    if (teamsError) {
      console.error("[fetchEditionTeamsByIds teams]", teamsError.message);
    } else {
      for (const team of teamsData ?? []) {
        teamsMap[team.id as string] = team as Team;
      }
    }
  }

  for (const row of rows) {
    map.set(row.id, {
      team_id: row.team_id,
      edition_id: row.edition_id,
      teams: teamsMap[row.team_id] ?? null,
    });
  }

  return map;
}

/** Completa inscrições quando `edition_teams` não é legível (RLS) ou está incompleta. */
export async function supplementEditionTeamsForHub(options: {
  editionId: string;
  base: EditionTeam[];
  stats: TeamEditionStats[];
  matches: Match[];
  matchups: Matchup[];
}): Promise<EditionTeam[]> {
  const { editionId, base, stats, matches, matchups } = options;
  const byTeamId = new Map<string, EditionTeam>();

  for (const et of base) {
    if (et.team_id && et.teams) byTeamId.set(et.team_id, et);
  }

  const candidateIds = new Set<string>();
  const noteId = (id?: string | null) => {
    if (id) candidateIds.add(id);
  };

  for (const row of stats) noteId(row.team_id);
  for (const match of matches) {
    noteId(match.team_a_id);
    noteId(match.team_b_id);
  }
  for (const matchup of matchups) {
    noteId(matchup.team_a_id);
    noteId(matchup.team_b_id);
  }

  const supabase = getSupabase();
  const [{ data: awards }, { data: athleteTeams }] = await Promise.all([
    supabase
      .from("edition_awards")
      .select("winning_team_id")
      .eq("edition_id", editionId)
      .eq("award_type", "champion")
      .not("winning_team_id", "is", null),
    supabase
      .from("athlete_edition_stats")
      .select("team_id")
      .eq("edition_id", editionId),
  ]);

  for (const row of awards ?? []) noteId(row.winning_team_id as string);
  for (const row of athleteTeams ?? []) noteId(row.team_id as string);

  const missingIds = [...candidateIds].filter((id) => !byTeamId.has(id));
  let merged = [...byTeamId.values()];

  if (missingIds.length) {
    const attached = await attachTeamsToEditionRows(
      missingIds.map((teamId, index) => ({
        id: `hub-${teamId}`,
        edition_id: editionId,
        team_id: teamId,
        is_free_agent_pool: false,
        is_active: true,
        display_order: 1000 + index,
      })),
    );
    merged = [...merged, ...attached];
  }

  return merged.sort((a, b) => {
    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const nameA = a.teams?.short_name ?? a.teams?.full_name ?? "";
    const nameB = b.teams?.short_name ?? b.teams?.full_name ?? "";
    return nameA.localeCompare(nameB, "pt-BR");
  });
}

export async function getCompetitionIdsForOrg(
  orgId: string,
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select("id")
    .eq("organization_id", orgId);

  if (error || !data?.length) return [];
  return data.map((c) => c.id);
}

export async function getEditionIdsForCompetition(
  competitionId: string,
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId);

  if (error || !data?.length) return [];
  return data.map((e) => e.id);
}

export async function getPhaseIdsForEdition(
  editionId: string,
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("phases")
    .select("id")
    .eq("edition_id", editionId);

  if (error || !data?.length) return [];
  return data.map((p) => p.id);
}

export async function getPhaseIdsForOrg(orgId: string): Promise<string[]> {
  const compIds = await getCompetitionIdsForOrg(orgId);
  if (!compIds.length) return [];

  const supabase = getSupabase();
  const { data: editions, error: edError } = await supabase
    .from("competition_editions")
    .select("id")
    .in("competition_id", compIds);

  if (edError || !editions?.length) return [];

  const editionIds = editions.map((e) => e.id);
  const { data: phases, error: phaseError } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  if (phaseError || !phases?.length) return [];
  return phases.map((p) => p.id);
}

export async function assertOrgOwnsCompetition(
  competitionId: string,
  orgId: string,
): Promise<Competition | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select(
      "id, full_name, short_name, logo_url, primary_color, sport_slug, gender, organization_id",
    )
    .eq("id", competitionId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (error) {
    console.error("[assertOrgOwnsCompetition]", error.message);
    return null;
  }
  return data as Competition | null;
}

export async function enrichMatchupsWithTeams(
  matchups: Matchup[],
): Promise<Matchup[]> {
  if (!matchups.length) return [];

  const teamIds = [
    ...new Set(
      matchups.flatMap((m) =>
        [m.team_a_id, m.team_b_id].filter((id): id is string => Boolean(id)),
      ),
    ),
  ];

  if (!teamIds.length) return matchups;

  const supabase = getSupabase();
  const { data: teamsData, error } = await supabase
    .from("teams")
    .select("id, full_name, short_name, abbreviation, logo_url, primary_color")
    .in("id", teamIds);

  if (error) {
    console.error("[enrichMatchupsWithTeams]", error.message);
    return matchups;
  }

  const teamsMap: Record<string, Team> = {};
  for (const t of teamsData ?? []) {
    teamsMap[t.id] = t as Team;
  }

  return matchups.map((m) => ({
    ...m,
    teams_a: m.team_a_id ? (teamsMap[m.team_a_id] ?? null) : null,
    teams_b: m.team_b_id ? (teamsMap[m.team_b_id] ?? null) : null,
  }));
}

export function unwrapTeamRelation(
  raw: Team | Team[] | null | undefined,
): Team | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

export const EDITION_TEAM_ROW_SELECT = `
  id,
  edition_id,
  team_id,
  is_free_agent_pool,
  is_active,
  display_order,
  teams(id, full_name, short_name, abbreviation, logo_url, primary_color)
`;

/** Equipes inscritas na competição (2 etapas: edition_ids → edition_teams). */
export async function fetchEditionTeamsForCompetition(
  competitionId: string,
  editionId?: string | null,
): Promise<EditionTeam[]> {
  const supabase = getSupabase();

  let editionQuery = supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId);

  if (editionId) {
    editionQuery = editionQuery.eq("id", editionId);
  } else {
    editionQuery = editionQuery.eq("is_current", true);
  }

  const { data: editions, error: editionsError } = await editionQuery;

  if (editionsError) {
    console.error(
      "[fetchEditionTeamsForCompetition editions]",
      editionsError.message,
    );
    return [];
  }

  if (!editions?.length) return [];

  const editionIds = editions.map((e) => e.id);
  const rows = await fetchEditionTeamRowsByEditionIds(editionIds);
  return attachTeamsToEditionRows(rows);
}

/** Inscrições da edição com join manual em `teams` (evita embed nulo por RLS). */
export async function fetchEditionTeamsForEdition(
  editionId: string,
): Promise<EditionTeam[]> {
  const rows = await fetchEditionTeamRowsByEditionIds([editionId]);
  return attachTeamsToEditionRows(rows);
}
