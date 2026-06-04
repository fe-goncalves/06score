import {
  isAssistActionType,
  isOwnGoalAction,
  isPenaltyGoalType,
  isPenaltyMissedActionType,
  isRedCardActionType,
  isShootoutGoalType,
  isStrictGoalActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
  normalizeActionType,
} from "@/lib/match/actionTypes";
import type { TeamAthleteStatSortKey } from "@/lib/team/statsConfig";
import { getSupabase } from "@/lib/supabase";
import type { Athlete } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

export type TeamAthleteStatsScope = "current" | "all";

export interface TeamAthleteStatsFilters {
  year: string;
  seasonId: string;
  competitionId: string;
  phaseIds: string[] | null;
}

export interface TeamAthleteStatRow {
  athlete: Athlete & { id: string };
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  motm_count: number;
  captain_matches: number;
  wins: number;
  penalties_taken: number;
  shootouts_taken: number;
}

const MATCH_IN_CHUNK = 80;

type EditionTeamRow = { id: string; edition_id: string };

type LineupRow = {
  athlete_id: string;
  match_id: string;
  edition_team_id: string;
  is_present: boolean | null;
  is_captain: boolean | null;
};

type MatchEditionMeta = {
  edition_id: string | null;
  season_id: string | null;
  competition_id: string | null;
  year_value: number | null;
};

type RawMatchRow = {
  id: string;
  score_a: number | null;
  score_b: number | null;
  team_a_id: string | null;
  team_b_id: string | null;
  status: string;
  motm_athlete_id: string | null;
  phases: {
    id: string | null;
    edition_id: string | null;
    competition_editions: {
      id: string;
      competition_id: string | null;
      seasons: {
        id: string;
        years: { value: number | null } | null;
      } | null;
    } | null;
  } | null;
};

type ActionRow = {
  match_id: string;
  primary_athlete_id: string | null;
  action_type: string;
  goal_type: string | null;
  is_own_goal: boolean | null;
};

type AthleteAcc = {
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  motm_count: number;
  captain_matches: number;
  wins: number;
  penalties_taken: number;
  shootouts_taken: number;
};

const MATCH_SELECT = `
  id,
  score_a,
  score_b,
  team_a_id,
  team_b_id,
  status,
  motm_athlete_id,
  phases(
    id,
    edition_id,
    competition_editions!phases_edition_id_fkey(
      id,
      competition_id,
      seasons ( id, years ( value ) )
    )
  )
`;

function chunkIds(ids: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

function isShootoutMissedActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return (
    t === "shootout_missed" ||
    t === "shootout_miss" ||
    t === "st_missed" ||
    t === "shoot_out_missed"
  );
}

function extractMatchEditionMeta(match: RawMatchRow): MatchEditionMeta {
  const edition = match.phases?.competition_editions ?? null;
  return {
    edition_id: match.phases?.edition_id ?? edition?.id ?? null,
    season_id: edition?.seasons?.id ?? null,
    competition_id: edition?.competition_id ?? null,
    year_value: edition?.seasons?.years?.value ?? null,
  };
}

function matchPassesFilters(
  match: RawMatchRow,
  meta: MatchEditionMeta,
  filters: TeamAthleteStatsFilters,
  allowedEditionIds: Set<string>,
): boolean {
  if (!meta.edition_id || !allowedEditionIds.has(meta.edition_id)) return false;
  if (filters.phaseIds != null) {
    if (filters.phaseIds.length === 0) return false;
    const pid = match.phases?.id ?? null;
    if (!pid || !filters.phaseIds.includes(pid)) return false;
  }
  if (filters.year !== "all") {
    if (meta.year_value == null || String(meta.year_value) !== filters.year) {
      return false;
    }
  }
  if (filters.seasonId !== "all" && meta.season_id !== filters.seasonId) {
    return false;
  }
  if (
    filters.competitionId !== "all" &&
    meta.competition_id !== filters.competitionId
  ) {
    return false;
  }
  return true;
}

async function fetchMatchesByIds(matchIds: string[]): Promise<RawMatchRow[]> {
  if (!matchIds.length) return [];
  const supabase = getSupabase();
  const rows: RawMatchRow[] = [];

  for (const chunk of chunkIds(matchIds, MATCH_IN_CHUNK)) {
    const { data, error } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .in("id", chunk);

    if (error) {
      console.error("[fetchTeamAthleteStats:matches]", error.message);
      continue;
    }
    rows.push(...((data ?? []) as RawMatchRow[]));
  }

  return rows;
}

async function fetchActionsForMatches(
  matchIds: string[],
  athleteIds: string[],
): Promise<ActionRow[]> {
  if (!matchIds.length || !athleteIds.length) return [];
  const supabase = getSupabase();
  const rows: ActionRow[] = [];

  for (const matchChunk of chunkIds(matchIds, MATCH_IN_CHUNK)) {
    for (const athleteChunk of chunkIds(athleteIds, MATCH_IN_CHUNK)) {
      const { data, error } = await supabase
        .from("match_actions")
        .select(
          "match_id, primary_athlete_id, action_type, goal_type, is_own_goal",
        )
        .in("match_id", matchChunk)
        .in("primary_athlete_id", athleteChunk);

      if (error) {
        console.error("[fetchTeamAthleteStats:actions]", error.message);
        continue;
      }
      rows.push(...((data ?? []) as ActionRow[]));
    }
  }

  return rows;
}

function applyActionToAcc(acc: AthleteAcc, action: ActionRow): void {
  if (isStrictGoalActionType(action.action_type) && !isOwnGoalAction(action)) {
    acc.goals++;
  }
  if (isAssistActionType(action.action_type)) acc.assists++;
  if (isYellowCardActionType(action.action_type)) acc.yellow_cards++;
  if (
    isRedCardActionType(action.action_type) ||
    isYellowRedCardActionType(action.action_type)
  ) {
    acc.red_cards++;
  }
  if (
    isStrictGoalActionType(action.action_type) &&
    isPenaltyGoalType(action.goal_type)
  ) {
    acc.penalties_taken++;
  }
  if (isPenaltyMissedActionType(action.action_type)) acc.penalties_taken++;
  if (
    isStrictGoalActionType(action.action_type) &&
    isShootoutGoalType(action.goal_type)
  ) {
    acc.shootouts_taken++;
  }
  if (isShootoutMissedActionType(action.action_type)) acc.shootouts_taken++;
}

export function sortTeamAthleteRows(
  rows: TeamAthleteStatRow[],
  sortKey: TeamAthleteStatSortKey,
  direction: "asc" | "desc",
): TeamAthleteStatRow[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (av !== bv) return (av - bv) * dir;
    return (a.athlete.surname ?? a.athlete.full_name).localeCompare(
      b.athlete.surname ?? b.athlete.full_name,
      "pt-BR",
    );
  });
}

export async function fetchTeamAthleteStats(
  teamId: string,
  scope: TeamAthleteStatsScope,
  currentAthleteIds: string[],
  filters: TeamAthleteStatsFilters,
  teamEditionIds: string[],
): Promise<TeamAthleteStatRow[]> {
  const supabase = getSupabase();

  const allowedEditionIds = new Set(teamEditionIds);
  if (allowedEditionIds.size === 0) return [];

  if (filters.phaseIds != null && filters.phaseIds.length === 0) return [];

  const { data: editionTeams, error: editionTeamsError } = await supabase
    .from("edition_teams")
    .select("id, edition_id")
    .eq("team_id", teamId);

  if (editionTeamsError) {
    console.error(
      "[fetchTeamAthleteStats:edition_teams]",
      editionTeamsError.message,
    );
    return [];
  }

  const scopedEditionTeams = ((editionTeams ?? []) as EditionTeamRow[]).filter(
    (et) => allowedEditionIds.has(et.edition_id),
  );
  const editionTeamIds = scopedEditionTeams.map((et) => et.id);
  if (!editionTeamIds.length) return [];

  const { data: lineupsRaw, error: lineupsError } = await supabase
    .from("match_lineups")
    .select("athlete_id, match_id, edition_team_id, is_present, is_captain")
    .in("edition_team_id", editionTeamIds)
    .eq("is_present", true);

  if (lineupsError) {
    console.error("[fetchTeamAthleteStats:lineups]", lineupsError.message);
    return [];
  }

  let lineups = (lineupsRaw ?? []) as LineupRow[];
  if (!lineups.length) return [];

  if (scope === "current" && currentAthleteIds.length > 0) {
    const roster = new Set(currentAthleteIds);
    lineups = lineups.filter((l) => roster.has(l.athlete_id));
    if (!lineups.length) return [];
  }

  const matchIds = [...new Set(lineups.map((l) => l.match_id))];
  const matches = await fetchMatchesByIds(matchIds);
  const matchMap = new Map(matches.map((m) => [m.id, m]));

  const allowedMatchIds = new Set<string>();
  for (const match of matches) {
    if (!isMatchFinished(match.status)) continue;
    const meta = extractMatchEditionMeta(match);
    if (!matchPassesFilters(match, meta, filters, allowedEditionIds)) continue;
    if (match.team_a_id !== teamId && match.team_b_id !== teamId) continue;
    allowedMatchIds.add(match.id);
  }

  lineups = lineups.filter((l) => allowedMatchIds.has(l.match_id));
  if (!lineups.length) return [];

  const statsByAthlete = new Map<string, AthleteAcc>();
  const processedLineups = new Set<string>();

  for (const lineup of lineups) {
    const lineupKey = `${lineup.athlete_id}:${lineup.match_id}`;
    if (processedLineups.has(lineupKey)) continue;
    processedLineups.add(lineupKey);

    const match = matchMap.get(lineup.match_id);
    if (!match) continue;

    const athleteId = lineup.athlete_id;
    let acc = statsByAthlete.get(athleteId);
    if (!acc) {
      acc = {
        matches_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        motm_count: 0,
        captain_matches: 0,
        wins: 0,
        penalties_taken: 0,
        shootouts_taken: 0,
      };
      statsByAthlete.set(athleteId, acc);
    }

    acc.matches_played++;
    if (lineup.is_captain) acc.captain_matches++;

    const isTeamA = match.team_a_id === teamId;
    const myScore = isTeamA ? (match.score_a ?? 0) : (match.score_b ?? 0);
    const theirScore = isTeamA ? (match.score_b ?? 0) : (match.score_a ?? 0);

    if (myScore > theirScore) acc.wins++;

    if (match.motm_athlete_id === athleteId) acc.motm_count++;
  }

  const athleteIds = [...statsByAthlete.keys()];
  const filteredMatchIds = [...allowedMatchIds];
  const actions = await fetchActionsForMatches(filteredMatchIds, athleteIds);

  for (const action of actions) {
    if (!action.primary_athlete_id) continue;
    if (!allowedMatchIds.has(action.match_id)) continue;
    const acc = statsByAthlete.get(action.primary_athlete_id);
    if (!acc) continue;
    applyActionToAcc(acc, action);
  }

  const { data: athletesData, error: athletesError } = await supabase
    .from("athletes")
    .select(
      `id, full_name, surname, photo_url, player_positions ( full_name, abbreviation )`,
    )
    .in("id", athleteIds);

  if (athletesError) {
    console.error("[fetchTeamAthleteStats:athletes]", athletesError.message);
    return [];
  }

  const athleteMap = new Map(
    (athletesData ?? []).map((a) => [a.id as string, a as Athlete & { id: string }]),
  );

  const rows: TeamAthleteStatRow[] = [];
  for (const [athleteId, acc] of statsByAthlete) {
    const athlete = athleteMap.get(athleteId);
    if (!athlete) continue;

    rows.push({
      athlete,
      matches_played: acc.matches_played,
      goals: acc.goals,
      assists: acc.assists,
      yellow_cards: acc.yellow_cards,
      red_cards: acc.red_cards,
      motm_count: acc.motm_count,
      captain_matches: acc.captain_matches,
      wins: acc.wins,
      penalties_taken: acc.penalties_taken,
      shootouts_taken: acc.shootouts_taken,
    });
  }

  return rows;
}
