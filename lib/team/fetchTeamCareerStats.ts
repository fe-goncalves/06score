import { getSupabase } from "@/lib/supabase";
import type { TeamCareerSummary } from "@/lib/types";

export interface TeamCareerStatsRow {
  total_matches: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
  total_goals_scored: number;
  total_goals_conceded: number;
  total_titles: number;
}

const CAREER_STATS_SELECT = `
  total_matches,
  total_wins,
  total_draws,
  total_losses,
  total_goals_scored,
  total_goals_conceded,
  total_titles
`;

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCareerStatsRow(raw: Record<string, unknown>): TeamCareerStatsRow {
  return {
    total_matches: num(raw.total_matches),
    total_wins: num(raw.total_wins),
    total_draws: num(raw.total_draws),
    total_losses: num(raw.total_losses),
    total_goals_scored: num(raw.total_goals_scored),
    total_goals_conceded: num(raw.total_goals_conceded),
    total_titles: num(raw.total_titles),
  };
}

export function teamCareerSummaryFromStats(
  stats: TeamCareerStatsRow,
): TeamCareerSummary {
  return {
    matches: stats.total_matches,
    wins: stats.total_wins,
    draws: stats.total_draws,
    losses: stats.total_losses,
    goals_scored: stats.total_goals_scored,
    goals_conceded: stats.total_goals_conceded,
    points: stats.total_wins * 3 + stats.total_draws,
    titles: stats.total_titles,
  };
}

/** Carreira agregada em `team_career_stats` (fonte oficial do perfil). */
export async function fetchTeamCareerStats(
  teamId: string,
): Promise<TeamCareerStatsRow | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("team_career_stats")
    .select(CAREER_STATS_SELECT)
    .eq("team_id", teamId)
    .maybeSingle();

  if (error) {
    console.error("[fetchTeamCareerStats]", error.message);
    return null;
  }

  if (!data) return null;
  return normalizeCareerStatsRow(data as Record<string, unknown>);
}
