import {
  isStrictGoalActionType,
  resolveActionPeriod,
} from "@/lib/match/actionTypes";
import {
  computePointsPct,
  enrichStandingRows,
} from "@/lib/competition/standingsForm";
import type {
  Match,
  MatchAction,
  StandingRow,
  Team,
  TeamEditionStats,
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

/** Fase e rodada para listagens compactas de jogos (inclui mata-mata via matchup). */
export function formatMatchPhaseRoundLabel(match: {
  phases: {
    custom_label?: string | null;
    full_name?: string;
  } | null;
  rounds?: {
    custom_label?: string | null;
    name?: string;
  } | null;
  matchups?: {
    round_label?: string | null;
  } | null;
}): string {
  const phaseName =
    match.phases?.custom_label?.trim() ||
    match.phases?.full_name?.trim() ||
    "";
  const roundName =
    match.rounds?.custom_label?.trim() ||
    match.rounds?.name?.trim() ||
    match.matchups?.round_label?.trim() ||
    "";
  if (phaseName && roundName) {
    const same =
      phaseName.localeCompare(roundName, "pt-BR", { sensitivity: "accent" }) ===
      0;
    return same ? phaseName : `${phaseName} · ${roundName}`;
  }
  return phaseName || roundName || "—";
}

/** Data compacta para a barra de jogos (ex.: "01/10"). */
export function formatMatchStripDate(matchDate: string): string {
  const date = new Date(`${matchDate}T12:00:00`);
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "2-digit" });
  return `${day}/${month}`;
}

/** Data em destaque para cards compactos do hero (ex.: "30 DE MAI · 05:00"). */
export function formatHeroMatchDate(
  matchDate: string,
  matchTime: string | null,
): string {
  const date = new Date(`${matchDate}T${matchTime ?? "12:00:00"}`);
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(/\./g, "")
    .toUpperCase();
  const datePart = `${day} DE ${month}`;
  if (!matchTime) return datePart;
  const timePart = matchTime.slice(0, 5);
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

/** Sobrenome em destaque (linha do tempo, placar). */
export function athleteSurnameLabel(
  fullName: string,
  surname: string | null,
): string {
  if (surname?.trim()) return surname.trim().toUpperCase();
  const parts = fullName.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? fullName).toUpperCase();
}

/** Cabeçalho da partida: DD/MM/AAAA | HH:MM */
export function formatMatchHeaderDateTime(
  matchDate: string,
  matchTime: string | null,
): string {
  const date = new Date(`${matchDate}T${matchTime ?? "12:00:00"}`);
  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (!matchTime) return datePart;
  return `${datePart} | ${matchTime.slice(0, 5)}`;
}

export function matchStatusLabel(status: string): string {
  const key = status.toLowerCase();
  const map: Record<string, string> = {
    scheduled: "Agendado",
    agendado: "Agendado",
    live: "Ao vivo",
    ao_vivo: "Ao vivo",
    in_progress: "Ao vivo",
    ongoing: "Ao vivo",
    finished: "Finalizado",
    finalizado: "Finalizado",
    ended: "Finalizado",
    ft: "Finalizado",
    complete: "Finalizado",
    postponed: "Adiado",
    cancelled: "Cancelado",
    cancelado: "Cancelado",
  };
  return map[key] ?? status;
}

/** Ex.: "Rodada 5" → "MOTW DA RODADA 5" */
export function formatMotwRoundLabel(roundLabel: string | null): string {
  if (!roundLabel?.trim()) return "MOTW";

  const label = roundLabel.trim();
  if (/rodada/i.test(label)) {
    return `MOTW DA ${label.replace(/^rodada\s*/i, "RODADA ").toUpperCase()}`;
  }

  const roundNumber = label.match(/\d+/)?.[0];
  if (roundNumber) return `MOTW DA RODADA ${roundNumber}`;

  return `MOTW DA ${label.toUpperCase()}`;
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

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Partida ainda não realizada (futura ou hoje com horário à frente). */
export function isMatchUpcoming(match: {
  status: string;
  match_date: string;
  match_time: string | null;
}): boolean {
  if (isMatchFinished(match.status) || isMatchLive(match.status)) {
    return false;
  }

  const status = match.status.toLowerCase();
  if (status === "cancelled" || status === "cancelado") {
    return false;
  }

  const today = todayIsoDate();
  if (match.match_date > today) return true;
  if (match.match_date < today) return false;

  if (!match.match_time) return true;

  const now = new Date();
  const [hours, minutes] = match.match_time.split(":").map(Number);
  const kickoff = new Date();
  kickoff.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return kickoff.getTime() > now.getTime();
}

export function getPositionName(
  positions: { full_name: string } | { full_name: string }[] | null | undefined,
): string {
  if (!positions) return "—";
  const p = Array.isArray(positions) ? positions[0] : positions;
  return p?.full_name ?? "—";
}

export function formatRating(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const v = Math.round(value * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
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
  const t = actionType
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
  return t === "goal" || t === "gol";
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
  stats: TeamEditionStats[],
  matches: Match[] = [],
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
      yellow_cards: s.yellow_cards ?? 0,
      red_cards: s.red_cards ?? 0,
      points_pct: computePointsPct(s.points, s.matches_played),
      form: [] as StandingRow["form"],
    }));
  const sorted = sortStandings(rows);
  return matches.length
    ? enrichStandingRows(sorted, matches, stats)
    : sorted;
}

export function computeStandingsFromMatches(
  matches: Match[],
  teamIds: string[],
  teamsMap: Record<string, Team>,
  editionStats?: TeamEditionStats[],
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
    yellow_cards: 0,
    red_cards: 0,
  }));

  return enrichStandingRows(sortStandings(rows), matches, editionStats);
}

function actionSortKey(a: MatchAction): number {
  const minute = a.minute ?? 0;
  const periodOrder =
    resolveActionPeriod(a.period, a.minute) === "second" ? 1 : 0;
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
    if (isStrictGoalActionType(action.action_type)) {
      if (action.team_id === teamAId) scoreA += 1;
      else scoreB += 1;
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
    custom_name,
    ratings_are_public,
    seasons ( id, name ),
    competitions!competition_editions_competition_id_fkey(
      id,
      full_name,
      short_name,
      logo_url,
      primary_color,
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
  finish_type,
  penalty_score_a,
  penalty_score_b,
  teams_a:teams!matches_team_a_id_fkey(id, full_name, short_name, abbreviation, logo_url, primary_color),
  teams_b:teams!matches_team_b_id_fkey(id, full_name, short_name, abbreviation, logo_url, primary_color),
  phases(${PHASE_SELECT.replace(/\n/g, " ")}),
  rounds(id, phase_id, name, custom_label, display_order)
`;
