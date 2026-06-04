import {
  isRedCardActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
} from "@/lib/match/actionTypes";
import { getSupabase } from "@/lib/supabase";
import type { TeamEditionStatRow } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

const MATCH_IN_CHUNK = 80;

type CardCounts = { yellow_cards: number; red_cards: number };

type RawMatchRow = {
  id: string;
  score_a: number | null;
  score_b: number | null;
  team_a_id: string | null;
  team_b_id: string | null;
  status: string;
  phases: {
    edition_id: string | null;
    competition_editions: TeamEditionStatRow["competition_editions"];
  } | null;
};

type ActionRow = {
  match_id: string;
  action_type: string;
};

const MATCH_SELECT = `
  id,
  score_a,
  score_b,
  team_a_id,
  team_b_id,
  status,
  phases(
    edition_id,
    competition_editions!phases_edition_id_fkey(
      id,
      season_id,
      competition_id,
      seasons ( id, name, year_id, years ( id, value ) ),
      competitions ( id, full_name, short_name, logo_url )
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

function countCardAction(actionType: string): CardCounts {
  if (isYellowCardActionType(actionType)) {
    return { yellow_cards: 1, red_cards: 0 };
  }
  if (
    isRedCardActionType(actionType) ||
    isYellowRedCardActionType(actionType)
  ) {
    return { yellow_cards: 0, red_cards: 1 };
  }
  return { yellow_cards: 0, red_cards: 0 };
}

async function fetchFinishedTeamMatches(
  teamId: string,
  phaseIds: string[],
): Promise<RawMatchRow[]> {
  if (!phaseIds.length) return [];
  const supabase = getSupabase();
  const rows: RawMatchRow[] = [];

  for (const chunk of chunkIds(phaseIds, MATCH_IN_CHUNK)) {
    const { data, error } = await supabase
      .from("matches")
      .select(MATCH_SELECT)
      .in("phase_id", chunk)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`);

    if (error) {
      console.error("[fetchTeamHistoricoStats:matches]", error.message);
      continue;
    }
    rows.push(...((data ?? []) as RawMatchRow[]));
  }

  return rows.filter((m) => isMatchFinished(m.status));
}

async function fetchCardCountsForMatches(
  teamId: string,
  matchIds: string[],
): Promise<Map<string, CardCounts>> {
  const countsByMatch = new Map<string, CardCounts>();
  if (!matchIds.length) return countsByMatch;

  const supabase = getSupabase();
  for (const chunk of chunkIds(matchIds, MATCH_IN_CHUNK)) {
    const { data, error } = await supabase
      .from("match_actions")
      .select("match_id, action_type")
      .eq("team_id", teamId)
      .in("match_id", chunk);

    if (error) {
      console.error("[fetchTeamHistoricoStats:cards]", error.message);
      continue;
    }

    for (const row of (data ?? []) as ActionRow[]) {
      const delta = countCardAction(row.action_type);
      if (!delta.yellow_cards && !delta.red_cards) continue;
      const existing = countsByMatch.get(row.match_id) ?? {
        yellow_cards: 0,
        red_cards: 0,
      };
      countsByMatch.set(row.match_id, {
        yellow_cards: existing.yellow_cards + delta.yellow_cards,
        red_cards: existing.red_cards + delta.red_cards,
      });
    }
  }

  return countsByMatch;
}

function editionMetaFromRow(
  editionStats: TeamEditionStatRow[],
  editionId: string,
  matchEdition: RawMatchRow["phases"],
): TeamEditionStatRow["competition_editions"] {
  const meta = editionStats.find((row) => row.edition_id === editionId);
  if (meta?.competition_editions) return meta.competition_editions;
  return matchEdition?.competition_editions ?? null;
}

/** Cartões por edição a partir de `match_actions.team_id`. */
export async function fetchTeamCardCountsByEdition(
  teamId: string,
  editionIds: string[],
): Promise<Map<string, CardCounts>> {
  if (!editionIds.length) return new Map();

  const supabase = getSupabase();
  const editionIdSet = new Set(editionIds);
  const { data: phases, error: phasesError } = await supabase
    .from("phases")
    .select("id, edition_id")
    .in("edition_id", editionIds);

  if (phasesError) {
    console.error("[fetchTeamHistoricoStats:phases]", phasesError.message);
    return new Map();
  }

  const phaseIds = (phases ?? [])
    .map((p) => p.id as string)
    .filter(Boolean);
  if (!phaseIds.length) return new Map();

  const matches = await fetchFinishedTeamMatches(teamId, phaseIds);
  const cardsByMatch = await fetchCardCountsForMatches(
    teamId,
    matches.map((m) => m.id),
  );

  const countsByEdition = new Map<string, CardCounts>();
  for (const match of matches) {
    const editionId = match.phases?.edition_id ?? null;
    if (!editionId || !editionIdSet.has(editionId)) continue;
    const cards = cardsByMatch.get(match.id);
    if (!cards) continue;
    const existing = countsByEdition.get(editionId) ?? {
      yellow_cards: 0,
      red_cards: 0,
    };
    countsByEdition.set(editionId, {
      yellow_cards: existing.yellow_cards + cards.yellow_cards,
      red_cards: existing.red_cards + cards.red_cards,
    });
  }

  return countsByEdition;
}

/** Stats por edição agregadas dos jogos finalizados nas fases selecionadas. */
export async function fetchTeamEditionStatsForPhases(
  teamId: string,
  phaseIds: string[],
  editionStats: TeamEditionStatRow[],
): Promise<TeamEditionStatRow[]> {
  if (!phaseIds.length) return [];

  const matches = await fetchFinishedTeamMatches(teamId, phaseIds);
  const cardsByMatch = await fetchCardCountsForMatches(
    teamId,
    matches.map((m) => m.id),
  );

  type Bucket = TeamEditionStatRow;
  const buckets = new Map<string, Bucket>();

  for (const match of matches) {
    const editionId = match.phases?.edition_id ?? null;
    if (!editionId) continue;

    const isTeamA = match.team_a_id === teamId;
    const isTeamB = match.team_b_id === teamId;
    if (!isTeamA && !isTeamB) continue;

    const scored = isTeamA ? (match.score_a ?? 0) : (match.score_b ?? 0);
    const conceded = isTeamA ? (match.score_b ?? 0) : (match.score_a ?? 0);
    const cards = cardsByMatch.get(match.id) ?? { yellow_cards: 0, red_cards: 0 };

    let bucket = buckets.get(editionId);
    if (!bucket) {
      bucket = {
        edition_id: editionId,
        team_id: teamId,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_scored: 0,
        goals_conceded: 0,
        points: 0,
        yellow_cards: 0,
        red_cards: 0,
        competition_editions: editionMetaFromRow(
          editionStats,
          editionId,
          match.phases,
        ),
      };
      buckets.set(editionId, bucket);
    }

    bucket.matches_played += 1;
    bucket.goals_scored += scored;
    bucket.goals_conceded += conceded;
    bucket.yellow_cards += cards.yellow_cards;
    bucket.red_cards += cards.red_cards;

    if (scored > conceded) {
      bucket.wins += 1;
      bucket.points += 3;
    } else if (scored === conceded) {
      bucket.draws += 1;
      bucket.points += 1;
    } else {
      bucket.losses += 1;
    }
  }

  return [...buckets.values()];
}

export async function enrichTeamEditionStatsWithCards(
  teamId: string,
  rows: TeamEditionStatRow[],
): Promise<TeamEditionStatRow[]> {
  if (!rows.length) return rows;
  const counts = await fetchTeamCardCountsByEdition(
    teamId,
    rows.map((row) => row.edition_id),
  );

  return rows.map((row) => ({
    ...row,
    yellow_cards: counts.get(row.edition_id)?.yellow_cards ?? 0,
    red_cards: counts.get(row.edition_id)?.red_cards ?? 0,
  }));
}
