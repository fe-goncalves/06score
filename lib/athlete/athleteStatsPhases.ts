import {
  getYearValue,
  type AthleteStatsFilterState,
} from "@/lib/athlete/athleteStatsDisplay";
import {
  isAssistActionType,
  isGoalActionType,
  isRedCardActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
} from "@/lib/match/actionTypes";
import type {
  AthleteEditionStatRow,
  AthleteRecentMatch,
  AthleteStatsPhaseRecord,
  HubProfileKind,
  Match,
} from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

export interface AthleteStatsPhaseGroup {
  key: string;
  label: string;
  phaseIds: string[];
}

export function groupPhasesForCompetition(
  allPhases: AthleteStatsPhaseRecord[],
  competitionId: string,
): AthleteStatsPhaseGroup[] {
  const filtered = allPhases.filter((p) => p.competition_id === competitionId);
  const phaseGroups = new Map<
    string,
    AthleteStatsPhaseGroup & { minOrder: number }
  >();

  for (const phase of [...filtered].sort((a, b) => a.display_order - b.display_order)) {
    const groupKey = phase.template_id ?? phase.full_name;
    const label = phase.custom_label?.trim() || phase.full_name?.trim() || "Fase";
    const existing = phaseGroups.get(groupKey);
    if (existing) {
      existing.phaseIds.push(phase.id);
      existing.minOrder = Math.min(existing.minOrder, phase.display_order);
    } else {
      phaseGroups.set(groupKey, {
        key: groupKey,
        label,
        phaseIds: [phase.id],
        minOrder: phase.display_order,
      });
    }
  }

  return [...phaseGroups.values()]
    .sort((a, b) => a.minOrder - b.minOrder)
    .map(({ minOrder: _minOrder, ...group }) => group);
}

function matchPhaseId(entry: AthleteRecentMatch): string | null {
  return entry.match.phases?.id ?? entry.match.phase_id ?? null;
}

function matchYearValue(
  entry: AthleteRecentMatch,
  editionStats: AthleteEditionStatRow[],
): number | null {
  const editionId = entry.match.phases?.competition_editions?.id;
  if (!editionId) return null;
  const stat = editionStats.find((row) => row.edition_id === editionId);
  return stat ? getYearValue(stat) : null;
}

function matchCompetitionId(entry: AthleteRecentMatch): string | null {
  return entry.match.phases?.competition_editions?.competitions?.id ?? null;
}

export function matchPassesStatsFilters(
  entry: AthleteRecentMatch,
  filters: AthleteStatsFilterState,
  editionStats: AthleteEditionStatRow[],
): boolean {
  if (filters.teamId !== "all" && entry.match.athlete_team_id !== filters.teamId) {
    return false;
  }
  if (filters.competitionId !== "all") {
    if (matchCompetitionId(entry) !== filters.competitionId) return false;
  }
  if (filters.year !== "all") {
    const y = matchYearValue(entry, editionStats);
    if (y == null || String(y) !== filters.year) return false;
  }
  return true;
}

function matchOutcomeForTeam(
  match: Match,
  teamId: string | null,
): "win" | "draw" | "loss" | null {
  if (!teamId || !isMatchFinished(match.status)) return null;
  const scoreA = match.score_a;
  const scoreB = match.score_b;
  if (scoreA == null || scoreB == null) return null;
  const isHome = match.team_a_id === teamId;
  const isAway = match.team_b_id === teamId;
  if (!isHome && !isAway) return null;
  const scored = isHome ? scoreA : scoreB;
  const conceded = isHome ? scoreB : scoreA;
  if (scored > conceded) return "win";
  if (scored < conceded) return "loss";
  return "draw";
}

function countFromActions(actions: AthleteRecentMatch["actions"]) {
  let goals = 0;
  let assists = 0;
  let yellow = 0;
  let red = 0;
  for (const action of actions) {
    if (action.is_own_goal) continue;
    if (isGoalActionType(action.action_type)) goals += 1;
    if (isAssistActionType(action.action_type)) assists += 1;
    if (isYellowCardActionType(action.action_type)) yellow += 1;
    if (
      isRedCardActionType(action.action_type) ||
      isYellowRedCardActionType(action.action_type)
    ) {
      red += 1;
    }
  }
  return { goals, assists, yellow, red };
}

function resolveEditionMeta(
  editionMeta: Map<string, AthleteEditionStatRow>,
  editionId: string,
  teamId: string | null,
): AthleteEditionStatRow | undefined {
  if (teamId) {
    const exact = editionMeta.get(`${editionId}:${teamId}`);
    if (exact) return exact;
  }
  for (const row of editionMeta.values()) {
    if (row.edition_id === editionId) return row;
  }
  return undefined;
}

function matchInPhaseGroup(entry: AthleteRecentMatch, phaseIdSet: Set<string>): boolean {
  const pid = matchPhaseId(entry);
  return pid != null && phaseIdSet.has(pid);
}

type PhaseMatchBucket = {
  edition_id: string;
  team_id: string | null;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  motm_count: number;
  ratings: number[];
  competition_editions: AthleteEditionStatRow["competition_editions"];
  teams: AthleteEditionStatRow["teams"];
};

/** Stats por edição/time calculadas dos jogos nas fases selecionadas. */
export function buildEditionStatsFromPhaseMatches(
  phaseIds: string[],
  recentMatches: AthleteRecentMatch[],
  filters: AthleteStatsFilterState,
  editionStats: AthleteEditionStatRow[],
  profileKind: HubProfileKind = "athlete",
): AthleteEditionStatRow[] {
  const phaseIdSet = new Set(phaseIds);
  const editionMeta = new Map(
    editionStats.map((row) => [`${row.edition_id}:${row.team_id ?? "none"}`, row]),
  );

  const teamVotesByEdition = new Map<string, Map<string, number>>();
  for (const entry of recentMatches) {
    if (!matchInPhaseGroup(entry, phaseIdSet)) continue;
    if (!matchPassesStatsFilters(entry, filters, editionStats)) continue;
    const editionId = entry.match.phases?.competition_editions?.id;
    const teamId = entry.match.athlete_team_id;
    if (!editionId || !teamId) continue;
    const votes = teamVotesByEdition.get(editionId) ?? new Map<string, number>();
    votes.set(teamId, (votes.get(teamId) ?? 0) + 1);
    teamVotesByEdition.set(editionId, votes);
  }

  const canonicalTeamForEdition = (editionId: string): string | null => {
    const votes = teamVotesByEdition.get(editionId);
    if (!votes?.size) return null;
    let best: string | null = null;
    let max = 0;
    for (const [teamId, count] of votes) {
      if (count > max) {
        max = count;
        best = teamId;
      }
    }
    return best;
  };

  const buckets = new Map<string, PhaseMatchBucket>();

  for (const entry of recentMatches) {
    if (!matchInPhaseGroup(entry, phaseIdSet)) continue;
    if (!matchPassesStatsFilters(entry, filters, editionStats)) continue;

    const match = entry.match;
    const editionId = match.phases?.competition_editions?.id;
    if (!editionId) continue;

    const teamId = match.athlete_team_id ?? canonicalTeamForEdition(editionId);
    const meta = resolveEditionMeta(editionMeta, editionId, teamId ?? null);
    const bucketKey = `${editionId}:${teamId ?? "none"}`;

    let bucket = buckets.get(bucketKey);
    if (!bucket) {
      const edition = match.phases?.competition_editions;
      const competition =
        edition?.competitions ?? meta?.competition_editions?.competitions ?? null;
      bucket = {
        edition_id: editionId,
        team_id: teamId ?? null,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        motm_count: 0,
        ratings: [],
        competition_editions: meta?.competition_editions ??
          (edition
            ? {
                id: edition.id,
                season_id: meta?.competition_editions?.season_id ?? null,
                competition_id:
                  competition?.id ?? meta?.competition_editions?.competition_id ?? null,
                competitions: competition,
                seasons: edition.seasons ?? meta?.competition_editions?.seasons ?? null,
              }
            : null),
        teams: meta?.teams ?? null,
      };
      buckets.set(bucketKey, bucket);
    } else if (!bucket.team_id && teamId) {
      bucket.team_id = teamId;
    }
    if (!bucket.teams && meta?.teams) bucket.teams = meta.teams;
    if (!bucket.competition_editions?.seasons && meta?.competition_editions?.seasons) {
      bucket.competition_editions = meta.competition_editions;
    }

    bucket.matches_played += 1;
    const outcome = matchOutcomeForTeam(match, teamId ?? null);
    if (outcome === "win") bucket.wins += 1;
    else if (outcome === "draw") bucket.draws += 1;
    else if (outcome === "loss") bucket.losses += 1;

    if (profileKind === "staff") {
      /* W/D/L já contados acima; staff não usa gols/assistências na tabela. */
    } else {
      const counts = countFromActions(entry.actions);
      bucket.goals += counts.goals;
      bucket.assists += counts.assists;
      bucket.yellow_cards += counts.yellow;
      bucket.red_cards += counts.red;
      if (entry.isMotm) bucket.motm_count += 1;
    }
    if (entry.rating != null && Number.isFinite(entry.rating)) {
      bucket.ratings.push(entry.rating);
    }
  }

  const rows: AthleteEditionStatRow[] = [];
  for (const bucket of buckets.values()) {
    const avg_rating =
      bucket.ratings.length > 0
        ? Math.round(
            (bucket.ratings.reduce((a, b) => a + b, 0) / bucket.ratings.length) * 100,
          ) / 100
        : null;

    rows.push({
      edition_id: bucket.edition_id,
      team_id: bucket.team_id ?? canonicalTeamForEdition(bucket.edition_id),
      matches_played: bucket.matches_played,
      wins: bucket.wins,
      draws: bucket.draws,
      losses: bucket.losses,
      goals: bucket.goals,
      assists: bucket.assists,
      yellow_cards: bucket.yellow_cards,
      red_cards: bucket.red_cards,
      motm_count: bucket.motm_count,
      totw_count: 0,
      motw_count: 0,
      penalties_taken: 0,
      penalties_scored: 0,
      shootouts_taken: 0,
      shootouts_scored: 0,
      goals_conceded: 0,
      penalty_saves: 0,
      avg_rating,
      competition_editions: bucket.competition_editions,
      teams: bucket.teams,
    });
  }

  return rows;
}
