import type { Match, Team } from "@/lib/types";
import { isMatchFinished, isMatchLive } from "@/lib/utils";

export type TeamFormResult = "W" | "D" | "L";

export type TeamFormEntry = {
  match: Match;
  result: TeamFormResult;
  opponent: Team | null;
  magnitude: number;
};

function matchInstant(match: Match): number {
  const time = match.match_time?.slice(0, 8) || "12:00:00";
  const d = new Date(`${match.match_date}T${time}`);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function daysFromNow(match: Match): number {
  return Math.abs(matchInstant(match) - Date.now()) / (1000 * 60 * 60 * 24);
}

export function resolveTeamResult(
  match: Match,
  teamId: string,
): TeamFormResult | null {
  if (!isMatchFinished(match.status) && !isMatchLive(match.status)) return null;
  const scoreA = match.score_a ?? 0;
  const scoreB = match.score_b ?? 0;
  const isA = match.team_a_id === teamId;
  const isB = match.team_b_id === teamId;
  if (!isA && !isB) return null;

  if (scoreA === scoreB) return "D";
  const teamWon = isA ? scoreA > scoreB : scoreB > scoreA;
  return teamWon ? "W" : "L";
}

/** Últimos N confrontos finalizados (mais antigo → mais recente). */
export function buildTeamRecentForm(
  matches: Match[],
  teamId: string,
  limit = 10,
): TeamFormEntry[] {
  const finished: TeamFormEntry[] = [];

  for (const m of matches) {
    if (!isMatchFinished(m.status)) continue;
    const result = resolveTeamResult(m, teamId);
    if (!result) continue;
    const opponent =
      m.team_a_id === teamId ? (m.teams_b ?? null) : (m.teams_a ?? null);
    const gd = Math.abs((m.score_a ?? 0) - (m.score_b ?? 0));
    const magnitude = Math.min(1, 0.42 + gd * 0.12);
    finished.push({ match: m, result, opponent, magnitude });
  }

  return finished
    .sort((a, b) => matchInstant(b.match) - matchInstant(a.match))
    .slice(0, limit)
    .reverse();
}

/**
 * Próximo jogo se existir; senão o último.
 * Se ambos existirem, o de menor distância em dias ao agora.
 */
export function pickFeaturedTeamMatch(
  matches: Match[],
  teamId: string,
): { match: Match; kind: "next" | "last" } | null {
  const now = Date.now();
  const upcoming = matches
    .filter(
      (m) =>
        (m.team_a_id === teamId || m.team_b_id === teamId) &&
        !isMatchFinished(m.status) &&
        !isMatchLive(m.status) &&
        matchInstant(m) >= now - 2 * 60 * 60 * 1000,
    )
    .sort((a, b) => matchInstant(a) - matchInstant(b));

  const past = matches
    .filter(
      (m) =>
        (m.team_a_id === teamId || m.team_b_id === teamId) &&
        isMatchFinished(m.status),
    )
    .sort((a, b) => matchInstant(b) - matchInstant(a));

  const next = upcoming[0] ?? null;
  const last = past[0] ?? null;

  if (!next && !last) return null;
  if (next && !last) return { match: next, kind: "next" };
  if (!next && last) return { match: last, kind: "last" };

  return daysFromNow(next!) <= daysFromNow(last!)
    ? { match: next!, kind: "next" }
    : { match: last!, kind: "last" };
}
