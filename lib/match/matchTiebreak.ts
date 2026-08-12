import { getSupabase } from "@/lib/supabase";
import type { Match } from "@/lib/types";

export interface MatchTiebreakFields {
  finish_type?: string | null;
  penalty_score_a?: number | null;
  penalty_score_b?: number | null;
}

export type MatchWithTiebreak = Match & MatchTiebreakFields;

export function matchHasTiebreak(match: MatchTiebreakFields): boolean {
  const finish = match.finish_type?.trim().toLowerCase();
  if (!finish || finish === "normal") return false;
  return (
    finish === "penalties" ||
    finish === "penalty" ||
    finish === "shootouts" ||
    finish === "shootout" ||
    finish.includes("penalt") ||
    finish.includes("shoot")
  );
}

export function resolveMatchTiebreakScores(match: MatchWithTiebreak): {
  penaltyA: number | null;
  penaltyB: number | null;
} {
  const penaltyA = match.penalty_score_a;
  const penaltyB = match.penalty_score_b;
  if (penaltyA != null && penaltyB != null) {
    return { penaltyA, penaltyB };
  }
  return { penaltyA: null, penaltyB: null };
}

function matchNeedsTiebreakEnrichment(match: MatchWithTiebreak): boolean {
  if (!matchHasTiebreak(match)) return false;
  const { penaltyA, penaltyB } = resolveMatchTiebreakScores(match);
  return penaltyA == null || penaltyB == null;
}

export async function enrichMatchesWithTiebreakScores<T extends MatchWithTiebreak>(
  matches: T[],
): Promise<T[]> {
  const matchIds = matches.filter(matchNeedsTiebreakEnrichment).map((m) => m.id);
  if (!matchIds.length) return matches;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("match_penalty_shootout")
    .select("match_id, team_id, result")
    .in("match_id", matchIds)
    .eq("result", "goal");

  if (error) {
    console.error("[enrichMatchesWithTiebreakScores]", error.message);
    return matches;
  }

  const goalsByMatch = new Map<string, Map<string, number>>();
  for (const row of data ?? []) {
    const matchId = row.match_id as string;
    const teamId = row.team_id as string;
    if (!matchId || !teamId) continue;
    if (!goalsByMatch.has(matchId)) goalsByMatch.set(matchId, new Map());
    const teamMap = goalsByMatch.get(matchId)!;
    teamMap.set(teamId, (teamMap.get(teamId) ?? 0) + 1);
  }

  return matches.map((match) => {
    if (!matchNeedsTiebreakEnrichment(match)) return match;
    const teamGoals = goalsByMatch.get(match.id);
    if (!teamGoals?.size) return match;

    const teamAId = match.team_a_id ?? "";
    const teamBId = match.team_b_id ?? "";
    const penaltyA = teamAId ? (teamGoals.get(teamAId) ?? 0) : null;
    const penaltyB = teamBId ? (teamGoals.get(teamBId) ?? 0) : null;
    if (penaltyA == null || penaltyB == null) return match;

    return {
      ...match,
      penalty_score_a: penaltyA,
      penalty_score_b: penaltyB,
    };
  });
}
