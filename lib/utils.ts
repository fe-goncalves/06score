import type {
  Match,
  MatchAction,
  StandingRow,
  Team,
  TimelineEntry,
} from "@/lib/types";

export function formatMatchDateTime(
  matchDate: string,
  matchTime: string | null,
): string {
  const date = new Date(`${matchDate}T${matchTime ?? "00:00:00"}`);
  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  if (!matchTime) return datePart;
  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatStintDate(date: string | null): string {
  if (!date) return "Atual";
  return new Date(date).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

export function athleteDisplayName(
  fullName: string,
  surname: string | null,
): string {
  return surname ? `${fullName} ${surname}` : fullName;
}

export function isMatchFinished(status: string): boolean {
  const s = status.toLowerCase();
  return (
    s === "finished" ||
    s === "finalizado" ||
    s === "ended" ||
    s === "ft" ||
    s === "complete"
  );
}

export function isMatchLive(status: string): boolean {
  const s = status.toLowerCase();
  return (
    s === "live" ||
    s === "ao_vivo" ||
    s === "in_progress" ||
    s === "ongoing"
  );
}

export function getPositionName(
  positions: { full_name: string } | { full_name: string }[] | null | undefined,
): string {
  if (!positions) return "—";
  const p = Array.isArray(positions) ? positions[0] : positions;
  return p?.full_name ?? "—";
}

export function formatRating(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toFixed(1);
}

export function getActionIcon(actionType: string): string {
  const t = actionType.toLowerCase();
  if (t === "goal") return "⚽";
  if (t === "assist") return "🅰️";
  if (t === "yellow_card") return "🟨";
  if (t === "red_card" || t === "yellow_red_card" || t === "red_yellow_card") {
    return "🟥";
  }
  return "•";
}

export function isGoalAction(actionType: string): boolean {
  return actionType.toLowerCase() === "goal";
}

export function sortStandings(rows: StandingRow[]): StandingRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) {
      return b.goal_difference - a.goal_difference;
    }
    if (b.goals_scored !== a.goals_scored) {
      return b.goals_scored - a.goals_scored;
    }
    return a.team.full_name.localeCompare(b.team.full_name);
  });
  return sorted.map((row, i) => ({ ...row, position: i + 1 }));
}

export function statsToStandings(
  stats: {
    team_id: string;
    teams: Team | null;
    matches_played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_scored: number;
    goals_conceded: number;
    points: number;
  }[],
): StandingRow[] {
  const rows: StandingRow[] = stats
    .filter((s) => s.teams)
    .map((s) => ({
      team_id: s.team_id,
      team: s.teams!,
      position: 0,
      matches_played: s.matches_played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goals_scored: s.goals_scored,
      goals_conceded: s.goals_conceded,
      goal_difference: s.goals_scored - s.goals_conceded,
      points: s.points,
    }));
  return sortStandings(rows);
}

export function computeStandingsFromMatches(
  matches: Match[],
  teamIds: string[],
  teamsMap: Record<string, Team>,
): StandingRow[] {
  const table: Record<
    string,
    Omit<StandingRow, "position" | "team" | "goal_difference">
  > = {};

  for (const tid of teamIds) {
    const team = teamsMap[tid];
    if (!team) continue;
    table[tid] = {
      team_id: tid,
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      points: 0,
    };
  }

  for (const m of matches) {
    if (!isMatchFinished(m.status)) continue;
    const aId = m.team_a_id;
    const bId = m.team_b_id;
    if (!aId || !bId || !table[aId] || !table[bId]) continue;

    const sa = m.score_a ?? 0;
    const sb = m.score_b ?? 0;

    table[aId].matches_played += 1;
    table[bId].matches_played += 1;
    table[aId].goals_scored += sa;
    table[aId].goals_conceded += sb;
    table[bId].goals_scored += sb;
    table[bId].goals_conceded += sa;

    if (sa > sb) {
      table[aId].wins += 1;
      table[aId].points += 3;
      table[bId].losses += 1;
    } else if (sb > sa) {
      table[bId].wins += 1;
      table[bId].points += 3;
      table[aId].losses += 1;
    } else {
      table[aId].draws += 1;
      table[bId].draws += 1;
      table[aId].points += 1;
      table[bId].points += 1;
    }
  }

  const rows: StandingRow[] = Object.entries(table).map(([team_id, row]) => ({
    ...row,
    team: teamsMap[team_id],
    goal_difference: row.goals_scored - row.goals_conceded,
    position: 0,
  }));

  return sortStandings(rows);
}

function actionSortKey(a: MatchAction): number {
  const periodOrder = a.period === "second" ? 1 : 0;
  const minute = a.minute ?? 0;
  return periodOrder * 1000 + minute;
}

export function buildTimelineWithScore(
  actions: MatchAction[],
  teamAId: string,
): TimelineEntry[] {
  let scoreA = 0;
  let scoreB = 0;

  const sorted = [...actions].sort((a, b) => actionSortKey(a) - actionSortKey(b));

  return sorted.map((action) => {
    if (isGoalAction(action.action_type) && !action.is_own_goal) {
      if (action.team_id === teamAId) scoreA += 1;
      else scoreB += 1;
    } else if (isGoalAction(action.action_type) && action.is_own_goal) {
      if (action.team_id === teamAId) scoreB += 1;
      else scoreA += 1;
    }

    return {
      ...action,
      score_a: scoreA,
      score_b: scoreB,
    };
  });
}

export function getMatchupAggregateScore(
  matches: Match[],
  teamAId: string | null,
  teamBId: string | null,
): { scoreA: number; scoreB: number } | null {
  if (!teamAId || !teamBId) return null;
  const finished = matches.filter((m) => isMatchFinished(m.status));
  if (!finished.length) return null;

  let scoreA = 0;
  let scoreB = 0;
  for (const m of finished) {
    const sa = m.score_a ?? 0;
    const sb = m.score_b ?? 0;
    if (m.team_a_id === teamAId) {
      scoreA += sa;
      scoreB += sb;
    } else {
      scoreA += sb;
      scoreB += sa;
    }
  }
  return { scoreA, scoreB };
}

export const PHASE_SELECT = `
  id,
  edition_id,
  full_name,
  custom_label,
  phase_type,
  display_order,
  is_current,
  competition_editions!phases_edition_id_fkey(
    id,
    is_current,
    competitions!competition_editions_competition_id_fkey(
      id,
      full_name,
      short_name,
      logo_url,
      organization_id
    )
  )
`;

export const MATCH_SELECT_BASE = `
  id,
  phase_id,
  round_id,
  matchup_id,
  team_a_id,
  team_b_id,
  match_date,
  match_time,
  status,
  score_a,
  score_b,
  teams_a:teams!matches_team_a_id_fkey(id, full_name, short_name, abbreviation, logo_url, primary_color),
  teams_b:teams!matches_team_b_id_fkey(id, full_name, short_name, abbreviation, logo_url, primary_color),
  phases(${PHASE_SELECT.replace(/\n/g, " ")}),
  rounds(id, phase_id, name, custom_label, display_order)
`;
