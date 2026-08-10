import type { Match, StandingRow, TeamEditionStats } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

/** Vitória, empate, derrota (últimos jogos, mais recente por último). */
export type FormLetter = "V" | "E" | "D";

const FORM_SLOTS = 5;

function matchSortKey(m: Match): string {
  const d = m.match_date ?? "";
  const t = m.match_time ?? "00:00";
  return `${d}T${t}`;
}

function resultForTeam(m: Match, teamId: string): FormLetter | null {
  if (!isMatchFinished(m.status)) return null;
  const aId = m.team_a_id;
  const bId = m.team_b_id;
  if (!aId || !bId) return null;

  const sa = m.score_a ?? 0;
  const sb = m.score_b ?? 0;
  if (sa === sb) {
    if (m.penalty_score_a != null && m.penalty_score_b != null) {
      const won =
        (teamId === aId && m.penalty_score_a > m.penalty_score_b) ||
        (teamId === bId && m.penalty_score_b > m.penalty_score_a);
      return won ? "V" : "D";
    }
    return "E";
  }

  const won =
    (teamId === aId && sa > sb) || (teamId === bId && sb > sa);
  return won ? "V" : "D";
}

/** Últimos N resultados na fase (ordem cronológica: antigo → recente). */
export function computeTeamForm(
  matches: Match[],
  teamId: string,
  limit = FORM_SLOTS,
): FormLetter[] {
  const finished = matches
    .filter((m) => {
      if (!isMatchFinished(m.status)) return false;
      return m.team_a_id === teamId || m.team_b_id === teamId;
    })
    .sort((a, b) => matchSortKey(a).localeCompare(matchSortKey(b)));

  const results: FormLetter[] = [];
  for (const m of finished) {
    const r = resultForTeam(m, teamId);
    if (r) results.push(r);
  }

  return results.slice(-limit);
}

export function computePointsPct(
  points: number,
  matchesPlayed: number,
): number {
  if (matchesPlayed <= 0) return 0;
  return Math.round((points / (matchesPlayed * 3)) * 10000) / 100;
}

/** Vitórias–derrotas (sem empates), ex.: 2-0 */
export function winLossRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function enrichStandingRows(
  rows: StandingRow[],
  matches: Match[],
  editionStats?: TeamEditionStats[],
): StandingRow[] {
  const statsMap = new Map(
    (editionStats ?? []).map((s) => [s.team_id, s]),
  );

  return rows.map((row) => {
    const form = computeTeamForm(matches, row.team_id);
    const stats = statsMap.get(row.team_id);
    return {
      ...row,
      form,
      points_pct: computePointsPct(row.points, row.matches_played),
      yellow_cards:
        row.yellow_cards ??
        stats?.yellow_cards ??
        0,
      red_cards: row.red_cards ?? stats?.red_cards ?? 0,
    };
  });
}
