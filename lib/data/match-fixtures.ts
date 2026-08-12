import { getSupabase } from "@/lib/supabase";
import type { Match } from "@/lib/types";

const H2H_MATCH_SELECT = `
  id,
  match_date,
  match_time,
  score_a,
  score_b,
  status,
  team_a_id,
  team_b_id,
  teams_a:teams!matches_team_a_id_fkey(id, full_name, short_name, abbreviation, logo_url),
  teams_b:teams!matches_team_b_id_fkey(id, full_name, short_name, abbreviation, logo_url),
  phases(
    edition_id,
    competition_editions!phases_edition_id_fkey(
      id,
      competition_id,
      custom_name,
      seasons(name),
      competitions!competition_editions_competition_id_fkey(id, full_name, short_name, logo_url)
    )
  )
`;

const NEXT_MATCH_SELECT = `
  id,
  match_date,
  match_time,
  status,
  team_a_id,
  team_b_id,
  teams_a:teams!matches_team_a_id_fkey(id, full_name, short_name, abbreviation, logo_url),
  teams_b:teams!matches_team_b_id_fkey(id, full_name, short_name, abbreviation, logo_url),
  phases(
    competition_editions!phases_edition_id_fkey(
      competitions!competition_editions_competition_id_fkey(full_name, short_name, logo_url)
    )
  )
`;

/** Data de hoje em YYYY-MM-DD (sem hora) — fuso da competição/app. */
function todayDateYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** Todos os jogos finalizados entre as duas equipes (qualquer competição). */
export async function fetchH2HMatches(
  teamAId: string,
  teamBId: string,
  excludeMatchId?: string,
  limit = 50,
): Promise<Match[]> {
  if (!teamAId || !teamBId) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select(H2H_MATCH_SELECT)
    .or(
      `and(team_a_id.eq.${teamAId},team_b_id.eq.${teamBId}),and(team_a_id.eq.${teamBId},team_b_id.eq.${teamAId})`,
    )
    .eq("status", "finished")
    .order("match_date", { ascending: false })
    .order("match_time", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[fetchH2HMatches]", error.message);
    return [];
  }

  const rows = (data as Match[] | null) ?? [];
  return excludeMatchId ? rows.filter((m) => m.id !== excludeMatchId) : rows;
}

/** Próximo jogo agendado da equipe (qualquer adversário / competição). */
export async function fetchNextTeamMatch(
  teamId: string,
): Promise<Match | null> {
  const list = await fetchUpcomingTeamMatches(teamId, 1);
  return list[0] ?? null;
}

/** Próximos jogos da equipe (scheduled/live a partir de hoje). */
export async function fetchUpcomingTeamMatches(
  teamId: string,
  limit = 8,
): Promise<Match[]> {
  if (!teamId) return [];

  const today = todayDateYmd();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select(NEXT_MATCH_SELECT)
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .in("status", ["scheduled", "live"])
    .gte("match_date", today)
    .order("match_date", { ascending: true })
    .order("match_time", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[fetchUpcomingTeamMatches]", error.message);
    return [];
  }

  return (data as Match[] | null) ?? [];
}
