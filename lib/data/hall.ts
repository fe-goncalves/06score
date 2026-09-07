import { getSupabase } from "@/lib/supabase";
import {
  HALL_ATHLETE_CATEGORY_ORDER,
  HALL_ATHLETE_CUSTOM_CATEGORIES,
  HALL_ATHLETE_STAT_CATEGORIES,
  HALL_TEAM_CATEGORY_ORDER,
  HALL_TEAM_SPECIAL_CATEGORIES,
  HALL_TEAM_STAT_CATEGORIES,
  sortHallCategories,
  type AthleteStatCategoryDef,
  type HallCustomCategoryDef,
  type TeamStatCategoryDef,
} from "@/lib/hall/categories";
import { fetchTeamRankingCategory } from "@/lib/data/teamRanking";
import {
  canUseHallCache,
  getHallOfFameFromCache,
  hallSectionFromCache,
} from "@/lib/hall/hallCacheRead";
import { HALL_INDIVIDUAL_AWARD_TYPES } from "@/lib/hall/individualAwards";
import {
  getAthleteIdsByGender,
  getOrgEditionIds,
  getTeamIdsByGender,
  hasEditionScopeFilters,
  resolveHallEditionIds,
} from "@/lib/hall/hallScope";
import type {
  HallCategory,
  HallEntry,
  HallEntryContext,
  HallFilters,
  HallGender,
  HallSectionData,
} from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

const TOP_N = 50;
const MIN_SHOT_ATTEMPTS = 3;

type SupabaseClient = ReturnType<typeof getSupabase>;

function athleteName(row: {
  full_name?: string | null;
  surname?: string | null;
} | null): string {
  if (!row?.full_name) return "—";
  return athleteSurnameLabel(row.full_name, row.surname ?? null);
}

interface HallQueryContext {
  editionIds: string[];
  useEditionStats: boolean;
  awardEditionIds: string[];
  athleteGenderSet: Set<string> | null;
  teamGenderSet: Set<string> | null;
}

function passesAthleteGender(id: string, allowed: Set<string> | null): boolean {
  return !allowed || allowed.has(id);
}

function passesTeamGender(id: string, allowed: Set<string> | null): boolean {
  return !allowed || allowed.has(id);
}

async function buildHallQueryContext(
  orgId: string,
  filters: HallFilters,
): Promise<HallQueryContext> {
  const editionIds = await resolveHallEditionIds(orgId, filters);
  const useEditionStats = hasEditionScopeFilters(filters);
  const awardEditionIds = useEditionStats
    ? editionIds
    : await getOrgEditionIds(orgId);
  const gender = (filters.gender || "all") as HallGender;
  const [athleteGenderSet, teamGenderSet] = await Promise.all([
    getAthleteIdsByGender(orgId, gender),
    getTeamIdsByGender(orgId, gender),
  ]);
  return { editionIds, useEditionStats, awardEditionIds, athleteGenderSet, teamGenderSet };
}

async function fetchGoalkeeperIds(supabase: SupabaseClient): Promise<Set<string>> {
  const { data: positions } = await supabase
    .from("player_positions")
    .select("id")
    .eq("is_goalkeeper", true);

  const positionIds = (positions ?? []).map((p) => p.id as string);
  if (!positionIds.length) return new Set();

  const { data: athletes } = await supabase
    .from("athletes")
    .select("id")
    .in("position_id", positionIds);

  return new Set((athletes ?? []).map((a) => a.id as string));
}

async function fetchAthleteTeamSnippet(
  supabase: SupabaseClient,
  athleteIds: string[],
): Promise<
  Map<
    string,
    {
      team_name: string | null;
      team_logo: string | null;
      accent_color: string | null;
    }
  >
> {
  if (!athleteIds.length) return new Map();

  const { data } = await supabase
    .from("athletes")
    .select(
      "id, athlete_team_stints(is_current, teams(full_name, logo_url, primary_color))",
    )
    .in("id", athleteIds);

  const map = new Map<
    string,
    { team_name: string | null; team_logo: string | null; accent_color: string | null }
  >();
  for (const row of data ?? []) {
    const stints = row.athlete_team_stints as
      | {
          is_current?: boolean;
          teams?: {
            full_name?: string;
            logo_url?: string | null;
            primary_color?: string | null;
          } | null;
        }[]
      | null;
    const current = (stints ?? []).find((s) => s.is_current) ?? stints?.[0];
    map.set(row.id as string, {
      team_name: current?.teams?.full_name ?? null,
      team_logo: current?.teams?.logo_url ?? null,
      accent_color: current?.teams?.primary_color ?? null,
    });
  }
  return map;
}

function buildAthleteEntries(
  sorted: { id: string; value: number; value_display?: string | null }[],
  athleteMap: Map<string, { full_name?: string; surname?: string | null; photo_url?: string | null }>,
  teamMap: Map<
    string,
    { team_name: string | null; team_logo: string | null; accent_color: string | null }
  >,
): HallEntry[] {
  return sorted.map(({ id, value, value_display }) => {
    const athlete = athleteMap.get(id);
    const team = teamMap.get(id);
    return {
      id,
      name: athleteName(athlete ?? null),
      photo_url: athlete?.photo_url ?? null,
      value,
      value_display: value_display ?? null,
      team_name: team?.team_name ?? null,
      team_logo: team?.team_logo ?? null,
      accent_color: team?.accent_color ?? null,
    };
  });
}

async function loadAthletesByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, { full_name?: string; surname?: string | null; photo_url?: string | null }>> {
  if (!ids.length) return new Map();
  const { data } = await supabase
    .from("athletes")
    .select("id, full_name, surname, photo_url")
    .in("id", ids);
  return new Map((data ?? []).map((a) => [a.id as string, a]));
}

async function fetchAthleteStatCategory(
  supabase: SupabaseClient,
  orgId: string,
  cat: AthleteStatCategoryDef,
  ctx: HallQueryContext,
  goalkeeperIds: Set<string>,
): Promise<HallCategory | null> {
  let rows: { athlete_id: string; value: number }[] = [];

  if (ctx.useEditionStats) {
    if (!ctx.editionIds.length) return null;

    const { data, error } = await supabase
      .from("athlete_edition_stats")
      .select(`athlete_id, ${cat.editionField}`)
      .in("edition_id", ctx.editionIds);

    if (error) {
      if (cat.key === "hat_tricks" || cat.key === "pokers") {
        return fetchAthleteAchievementCountCategory(
          supabase,
          cat,
          ctx,
          cat.key === "hat_tricks" ? "hat_trick" : "poker",
        );
      }
      console.error(`[hall:athlete:${cat.key}]`, error.message);
      return null;
    }

    const totals = new Map<string, number>();
    for (const row of data ?? []) {
      const id = row.athlete_id as string;
      if (!id) continue;
      if (cat.goalkeepersOnly && !goalkeeperIds.has(id)) continue;
      if (!passesAthleteGender(id, ctx.athleteGenderSet)) continue;
      const val = Number(row[cat.editionField as keyof typeof row]) || 0;
      if (val <= 0) continue;
      totals.set(id, (totals.get(id) ?? 0) + val);
    }
    rows = [...totals.entries()].map(([athlete_id, value]) => ({ athlete_id, value }));
  } else {
    const { data, error } = await supabase
      .from("athlete_career_stats")
      .select(`athlete_id, ${cat.careerField}`)
      .eq("organization_id", orgId);

    if (error) {
      console.error(`[hall:athlete:${cat.key}]`, error.message);
      return null;
    }

    rows = (data ?? [])
      .filter((row) => {
        const id = row.athlete_id as string;
        if (!id) return false;
        if (cat.goalkeepersOnly && !goalkeeperIds.has(id)) return false;
        if (!passesAthleteGender(id, ctx.athleteGenderSet)) return false;
        return (Number(row[cat.careerField as keyof typeof row]) || 0) > 0;
      })
      .map((row) => ({
        athlete_id: row.athlete_id as string,
        value: Number(row[cat.careerField as keyof typeof row]) || 0,
      }));
  }

  const sorted = rows
    .sort((a, b) => b.value - a.value || a.athlete_id.localeCompare(b.athlete_id))
    .slice(0, TOP_N);

  if (!sorted.length) return null;

  const athleteIds = sorted.map((r) => r.athlete_id);
  const [athleteMap, teamMap] = await Promise.all([
    loadAthletesByIds(supabase, athleteIds),
    fetchAthleteTeamSnippet(supabase, athleteIds),
  ]);

  return {
    key: cat.key,
    label: cat.label,
    valueLabel: cat.valueLabel,
    section: "athletes",
    entries: buildAthleteEntries(
      sorted.map((r) => ({ id: r.athlete_id, value: r.value })),
      athleteMap,
      teamMap,
    ),
  };
}

async function fetchGoalParticipation(
  supabase: SupabaseClient,
  orgId: string,
  ctx: HallQueryContext,
): Promise<HallCategory | null> {
  const totals = new Map<string, number>();

  if (ctx.useEditionStats) {
    if (!ctx.editionIds.length) return null;

    const { data } = await supabase
      .from("athlete_edition_stats")
      .select("athlete_id, goals, assists")
      .in("edition_id", ctx.editionIds);

    for (const row of data ?? []) {
      const id = row.athlete_id as string;
      if (!id || !passesAthleteGender(id, ctx.athleteGenderSet)) continue;
      const val = (Number(row.goals) || 0) + (Number(row.assists) || 0);
      if (val <= 0) continue;
      totals.set(id, (totals.get(id) ?? 0) + val);
    }
  } else {
    const { data } = await supabase
      .from("athlete_career_stats")
      .select("athlete_id, total_goals, total_assists")
      .eq("organization_id", orgId);

    for (const row of data ?? []) {
      const id = row.athlete_id as string;
      if (!id || !passesAthleteGender(id, ctx.athleteGenderSet)) continue;
      const val = (Number(row.total_goals) || 0) + (Number(row.total_assists) || 0);
      if (val <= 0) continue;
      totals.set(id, val);
    }
  }

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);

  if (!sorted.length) return null;

  const athleteIds = sorted.map(([id]) => id);
  const [athleteMap, teamMap] = await Promise.all([
    loadAthletesByIds(supabase, athleteIds),
    fetchAthleteTeamSnippet(supabase, athleteIds),
  ]);

  const def = HALL_ATHLETE_CUSTOM_CATEGORIES.find((c) => c.key === "goal_participation")!;
  return {
    key: def.key,
    label: def.label,
    valueLabel: def.valueLabel,
    section: "athletes",
    entries: buildAthleteEntries(
      sorted.map(([id, value]) => ({ id, value })),
      athleteMap,
      teamMap,
    ),
  };
}

async function fetchRateCategory(
  supabase: SupabaseClient,
  orgId: string,
  ctx: HallQueryContext,
  kind: "penalty" | "shootout",
): Promise<HallCategory | null> {
  const totals = new Map<string, { scored: number; taken: number }>();
  const scoredField = kind === "penalty" ? "penalties_scored" : "shootouts_scored";
  const takenField = kind === "penalty" ? "penalties_taken" : "shootouts_taken";
  const careerScored = kind === "penalty" ? "total_penalties_scored" : "total_shootouts_scored";
  const careerTaken = kind === "penalty" ? "total_penalties_taken" : "total_shootouts_taken";

  if (ctx.useEditionStats) {
    if (!ctx.editionIds.length) return null;

    const { data } = await supabase
      .from("athlete_edition_stats")
      .select(`athlete_id, ${scoredField}, ${takenField}`)
      .in("edition_id", ctx.editionIds);

    for (const row of data ?? []) {
      const id = row.athlete_id as string;
      if (!id || !passesAthleteGender(id, ctx.athleteGenderSet)) continue;
      const cur = totals.get(id) ?? { scored: 0, taken: 0 };
      cur.scored += Number(row[scoredField as keyof typeof row]) || 0;
      cur.taken += Number(row[takenField as keyof typeof row]) || 0;
      totals.set(id, cur);
    }
  } else {
    const { data } = await supabase
      .from("athlete_career_stats")
      .select(`athlete_id, ${careerScored}, ${careerTaken}`)
      .eq("organization_id", orgId);

    for (const row of data ?? []) {
      const id = row.athlete_id as string;
      if (!id || !passesAthleteGender(id, ctx.athleteGenderSet)) continue;
      totals.set(id, {
        scored: Number(row[careerScored as keyof typeof row]) || 0,
        taken: Number(row[careerTaken as keyof typeof row]) || 0,
      });
    }
  }

  const ranked = [...totals.entries()]
    .filter(([, t]) => t.taken >= MIN_SHOT_ATTEMPTS)
    .map(([id, t]) => ({
      id,
      value: Math.round((t.scored / t.taken) * 1000) / 10,
      value_display: `${Math.round((t.scored / t.taken) * 1000) / 10}%`,
    }))
    .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id))
    .slice(0, TOP_N);

  if (!ranked.length) return null;

  const athleteIds = ranked.map((r) => r.id);
  const [athleteMap, teamMap] = await Promise.all([
    loadAthletesByIds(supabase, athleteIds),
    fetchAthleteTeamSnippet(supabase, athleteIds),
  ]);

  const key = kind === "penalty" ? "penalty_rate" : "shootout_rate";
  const def = HALL_ATHLETE_CUSTOM_CATEGORIES.find((c) => c.key === key)!;

  return {
    key: def.key,
    label: def.label,
    valueLabel: def.valueLabel,
    section: "athletes",
    entries: buildAthleteEntries(ranked, athleteMap, teamMap),
  };
}

async function fetchAthleteTitles(
  supabase: SupabaseClient,
  editionIds: string[],
  athleteGenderSet: Set<string> | null,
): Promise<HallCategory | null> {
  if (!editionIds.length) return null;

  const { data, error } = await supabase
    .from("edition_awards")
    .select("athlete_id")
    .in("edition_id", editionIds)
    .eq("award_type", "champion")
    .not("athlete_id", "is", null);

  if (error) {
    console.error("[hall:athlete:titles]", error.message);
    return null;
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.athlete_id as string;
    if (!id || !passesAthleteGender(id, athleteGenderSet)) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return buildAthleteCountCategory(counts, "titles", supabase);
}

async function fetchAthleteIndividualAwards(
  supabase: SupabaseClient,
  editionIds: string[],
  athleteGenderSet: Set<string> | null,
): Promise<HallCategory | null> {
  if (!editionIds.length) return null;

  const { data, error } = await supabase
    .from("edition_awards")
    .select("athlete_id, award_type")
    .in("edition_id", editionIds)
    .in("award_type", [...HALL_INDIVIDUAL_AWARD_TYPES])
    .not("athlete_id", "is", null);

  if (error) {
    console.error("[hall:athlete:awards]", error.message);
    return null;
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.athlete_id as string;
    if (!id || !passesAthleteGender(id, athleteGenderSet)) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return buildAthleteCountCategory(counts, "awards", supabase);
}

async function fetchAthleteFinals(
  supabase: SupabaseClient,
  editionIds: string[],
  athleteGenderSet: Set<string> | null,
): Promise<HallCategory | null> {
  if (!editionIds.length) return null;

  const finalMatchIds = await getFinalMatchIds(supabase, editionIds);
  if (!finalMatchIds.length) return null;

  const { data, error } = await supabase
    .from("match_lineups")
    .select("athlete_id")
    .in("match_id", finalMatchIds)
    .eq("is_present", true)
    .not("athlete_id", "is", null);

  if (error) {
    console.error("[hall:athlete:finals]", error.message);
    return null;
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.athlete_id as string;
    if (!id || !passesAthleteGender(id, athleteGenderSet)) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return buildAthleteCountCategory(counts, "finals", supabase);
}

async function buildAthleteCountCategory(
  counts: Map<string, number>,
  mode: "awards" | "titles" | "finals",
  supabase: SupabaseClient,
): Promise<HallCategory | null> {
  const sorted = [...counts.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);

  if (!sorted.length) return null;

  const key =
    mode === "awards" ? "athlete_awards" : mode === "titles" ? "athlete_titles" : "athlete_finals";
  const def = HALL_ATHLETE_CUSTOM_CATEGORIES.find((c) => c.key === key)!;
  const athleteIds = sorted.map(([id]) => id);
  const [athleteMap, teamMap] = await Promise.all([
    loadAthletesByIds(supabase, athleteIds),
    fetchAthleteTeamSnippet(supabase, athleteIds),
  ]);

  return {
    key: def.key,
    label: def.label,
    valueLabel: def.valueLabel,
    section: "athletes",
    entries: buildAthleteEntries(
      sorted.map(([id, value]) => ({ id, value })),
      athleteMap,
      teamMap,
    ),
  };
}

async function fetchGkCleanSheets(
  supabase: SupabaseClient,
  editionIds: string[],
  goalkeeperIds: Set<string>,
  athleteGenderSet: Set<string> | null,
): Promise<HallCategory | null> {
  if (!editionIds.length || !goalkeeperIds.size) return null;

  const { data: editionTeams } = await supabase
    .from("edition_teams")
    .select("id, team_id")
    .in("edition_id", editionIds);

  const etIds = (editionTeams ?? []).map((e) => e.id as string);
  if (!etIds.length) return null;

  const { data: lineups } = await supabase
    .from("match_lineups")
    .select("athlete_id, match_id, edition_team_id, played_as_goalkeeper")
    .in("edition_team_id", etIds)
    .in("athlete_id", [...goalkeeperIds])
    .eq("is_present", true);

  if (!(lineups ?? []).length) return null;

  const matchIds = [...new Set((lineups ?? []).map((l) => l.match_id as string))];
  const { data: matches } = await supabase
    .from("matches")
    .select("id, team_a_id, team_b_id, score_a, score_b, status")
    .in("id", matchIds)
    .eq("status", "finished");

  const matchMap = new Map((matches ?? []).map((m) => [m.id as string, m]));
  const teamByEt = new Map((editionTeams ?? []).map((e) => [e.id as string, e.team_id as string]));

  const counts = new Map<string, number>();
  const seen = new Set<string>();

  for (const row of lineups ?? []) {
    const athleteId = row.athlete_id as string;
    const matchId = row.match_id as string;
    const teamId = teamByEt.get(row.edition_team_id as string);
    const match = matchMap.get(matchId);
    if (!athleteId || !match || !teamId) continue;
    if (!passesAthleteGender(athleteId, athleteGenderSet)) continue;
    const key = `${athleteId}:${matchId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const isHome = match.team_a_id === teamId;
    const conceded = isHome ? Number(match.score_b) : Number(match.score_a);
    if (Number.isFinite(conceded) && conceded === 0) {
      counts.set(athleteId, (counts.get(athleteId) ?? 0) + 1);
    }
  }

  return buildAthleteCountCategory(counts, "awards", supabase).then((cat) =>
    cat
      ? {
          ...cat,
          key: "gk_clean_sheets",
          label: "Clean sheets (goleiros)",
          valueLabel: "CS",
        }
      : null,
  );
}

async function getMatchIdsForEditions(
  supabase: SupabaseClient,
  editionIds: string[],
): Promise<string[]> {
  if (!editionIds.length) return [];

  const { data: phases, error: phaseError } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  if (phaseError) {
    console.error("[hall:phases]", phaseError.message);
    return [];
  }

  const phaseIds = (phases ?? []).map((p) => p.id as string);
  if (!phaseIds.length) return [];

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("id")
    .in("phase_id", phaseIds);

  if (matchError) {
    console.error("[hall:matches]", matchError.message);
    return [];
  }

  return (matches ?? []).map((m) => m.id as string);
}

function unwrapRow<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function matchToEntryContext(match: Record<string, unknown> | null): HallEntryContext | null {
  if (!match) return null;

  const teamA = unwrapRow(
    match.teams_a as { abbreviation?: string | null; full_name?: string | null } | null,
  );
  const teamB = unwrapRow(
    match.teams_b as { abbreviation?: string | null; full_name?: string | null } | null,
  );
  const labelA = teamA?.abbreviation?.trim() || teamA?.full_name?.trim() || "—";
  const labelB = teamB?.abbreviation?.trim() || teamB?.full_name?.trim() || "—";
  const scoreA = Number(match.score_a);
  const scoreB = Number(match.score_b);
  const score =
    Number.isFinite(scoreA) && Number.isFinite(scoreB) ? `${scoreA}×${scoreB}` : null;

  const phase = unwrapRow(match.phases as Record<string, unknown> | null);
  const edition = phase
    ? unwrapRow(phase.competition_editions as Record<string, unknown> | null)
    : null;
  const competition = edition
    ? unwrapRow(edition.competitions as { full_name?: string | null } | null)
    : null;

  return {
    match_date: (match.match_date as string | null) ?? null,
    team_a: labelA,
    team_b: labelB,
    score,
    competition: competition?.full_name?.trim() || null,
  };
}

function formatMatchAchievementContext(match: Record<string, unknown> | null): string | null {
  const ctx = matchToEntryContext(match);
  if (!ctx) return null;
  const matchup = ctx.score
    ? `${ctx.team_a} ${ctx.score} ${ctx.team_b}`
    : `${ctx.team_a} vs ${ctx.team_b}`;
  return ctx.competition ? `${matchup} · ${ctx.competition}` : matchup;
}

async function getFinalMatchIds(
  supabase: SupabaseClient,
  editionIds: string[],
): Promise<string[]> {
  const { data: finalRounds, error: roundError } = await supabase
    .from("rounds")
    .select("id")
    .eq("name", "Final");

  if (roundError) {
    console.error("[hall:finals:rounds]", roundError.message);
    return [];
  }

  const finalRoundIds = (finalRounds ?? []).map((r) => r.id as string);
  if (!finalRoundIds.length) return [];

  let phaseIds: string[] | null = null;
  if (editionIds.length) {
    const { data: phases, error: phaseError } = await supabase
      .from("phases")
      .select("id")
      .in("edition_id", editionIds);

    if (phaseError) {
      console.error("[hall:finals:phases]", phaseError.message);
      return [];
    }
    phaseIds = (phases ?? []).map((p) => p.id as string);
    if (!phaseIds.length) return [];
  }

  let matchQuery = supabase
    .from("matches")
    .select("id")
    .in("round_id", finalRoundIds)
    .eq("status", "finished");

  if (phaseIds) {
    matchQuery = matchQuery.in("phase_id", phaseIds);
  }

  const { data: finalMatches, error: matchError } = await matchQuery;
  if (matchError) {
    console.error("[hall:finals:matches]", matchError.message);
    return [];
  }

  return (finalMatches ?? []).map((m) => m.id as string);
}

/** Conta hat-tricks / pokers por edição via athlete_match_achievements (fallback). */
async function fetchAthleteAchievementCountCategory(
  supabase: SupabaseClient,
  cat: AthleteStatCategoryDef,
  ctx: HallQueryContext,
  achievementType: string,
): Promise<HallCategory | null> {
  if (!ctx.editionIds.length) return null;

  const matchIds = await getMatchIdsForEditions(supabase, ctx.editionIds);
  if (!matchIds.length) return null;

  const { data, error } = await supabase
    .from("athlete_match_achievements")
    .select("athlete_id")
    .eq("achievement_type", achievementType)
    .in("match_id", matchIds);

  if (error) {
    console.error(`[hall:athlete:${cat.key}:achievements]`, error.message);
    return null;
  }

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.athlete_id as string;
    if (!id || !passesAthleteGender(id, ctx.athleteGenderSet)) continue;
    totals.set(id, (totals.get(id) ?? 0) + 1);
  }

  const sorted = [...totals.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_N);

  if (!sorted.length) return null;

  const athleteIds = sorted.map(([id]) => id);
  const [athleteMap, teamMap] = await Promise.all([
    loadAthletesByIds(supabase, athleteIds),
    fetchAthleteTeamSnippet(supabase, athleteIds),
  ]);

  return {
    key: cat.key,
    label: cat.label,
    valueLabel: cat.valueLabel,
    section: "athletes",
    entries: buildAthleteEntries(
      sorted.map(([id, value]) => ({ id, value })),
      athleteMap,
      teamMap,
    ),
  };
}

const GOALS_IN_MATCH_TYPES = ["hat_trick", "poker", "manita"] as const;

async function fetchGoalsInMatch(
  supabase: SupabaseClient,
  ctx: HallQueryContext,
): Promise<HallCategory | null> {
  const editionScope = ctx.useEditionStats ? ctx.editionIds : ctx.awardEditionIds;
  if (ctx.useEditionStats && !editionScope.length) return null;

  const matchIds = await getMatchIdsForEditions(supabase, editionScope);
  if (!matchIds.length) return null;

  const { data, error } = await supabase
    .from("athlete_match_achievements")
    .select(
      `
      athlete_id,
      value,
      match_id,
      achievement_type,
      matches (
        id,
        match_date,
        score_a,
        score_b,
        teams_a:teams!matches_team_a_id_fkey ( full_name, abbreviation ),
        teams_b:teams!matches_team_b_id_fkey ( full_name, abbreviation ),
        phases (
          competition_editions (
            competitions ( full_name )
          )
        )
      )
    `,
    )
    .in("achievement_type", [...GOALS_IN_MATCH_TYPES])
    .in("match_id", matchIds)
    .gt("value", 0)
    .order("value", { ascending: false })
    .limit(TOP_N * 6);

  if (error) {
    console.error("[hall:athlete:goals_in_match]", error.message);
    return null;
  }

  type RankedRow = {
    athlete_id: string;
    value: number;
    match_id: string;
    contextLine: string | null;
    entryContext: HallEntryContext | null;
  };

  const ranked: RankedRow[] = [];
  for (const row of data ?? []) {
    const athleteId = row.athlete_id as string;
    const value = Number(row.value) || 0;
    if (!athleteId || value <= 0) continue;
    if (!passesAthleteGender(athleteId, ctx.athleteGenderSet)) continue;

    const match = unwrapRow(row.matches as Record<string, unknown> | Record<string, unknown>[] | null);
    ranked.push({
      athlete_id: athleteId,
      value,
      match_id: row.match_id as string,
      contextLine: formatMatchAchievementContext(match),
      entryContext: matchToEntryContext(match),
    });
    if (ranked.length >= TOP_N) break;
  }

  if (!ranked.length) return null;

  const athleteIds = [...new Set(ranked.map((r) => r.athlete_id))];
  const [athleteMap, teamMap] = await Promise.all([
    loadAthletesByIds(supabase, athleteIds),
    fetchAthleteTeamSnippet(supabase, athleteIds),
  ]);
  const def = HALL_ATHLETE_CUSTOM_CATEGORIES.find((c) => c.key === "goals_in_match")!;

  return {
    key: def.key,
    label: def.label,
    valueLabel: def.valueLabel,
    section: "athletes",
    entries: ranked.map((row) => {
      const athlete = athleteMap.get(row.athlete_id);
      const team = teamMap.get(row.athlete_id);
      return {
        id: row.athlete_id,
        name: athleteName(athlete ?? null),
        photo_url: athlete?.photo_url ?? null,
        value: row.value,
        team_name: row.contextLine,
        context: row.entryContext,
        accent_color: team?.accent_color ?? null,
      };
    }),
  };
}

async function fetchGkPenaltySaves(
  supabase: SupabaseClient,
  orgId: string,
  ctx: HallQueryContext,
  goalkeeperIds: Set<string>,
): Promise<HallCategory | null> {
  const def = HALL_ATHLETE_STAT_CATEGORIES.find((c) => c.key === "gk_penalty_saves");
  if (!def) return null;
  const queryCtx: HallQueryContext = ctx.useEditionStats
    ? ctx
    : {
        ...ctx,
        useEditionStats: true,
        editionIds: ctx.awardEditionIds,
      };
  return fetchAthleteStatCategory(supabase, orgId, def, queryCtx, goalkeeperIds);
}

async function fetchGkShootoutSaves(
  supabase: SupabaseClient,
  editionIds: string[],
  goalkeeperIds: Set<string>,
  athleteGenderSet: Set<string> | null,
): Promise<HallCategory | null> {
  if (!editionIds.length || !goalkeeperIds.size) return null;

  const { data: phases } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  const phaseIds = (phases ?? []).map((p) => p.id as string);
  if (!phaseIds.length) return null;

  const { data: matches } = await supabase
    .from("matches")
    .select("id")
    .in("phase_id", phaseIds);

  const matchIds = (matches ?? []).map((m) => m.id as string);
  if (!matchIds.length) return null;

  const { data: actions } = await supabase
    .from("match_actions")
    .select("athlete_id, match_result, action_type")
    .in("match_id", matchIds)
    .in("athlete_id", [...goalkeeperIds]);

  const counts = new Map<string, number>();
  for (const row of actions ?? []) {
    const id = row.athlete_id as string;
    const result = String(row.match_result ?? "").toLowerCase();
    const type = String(row.action_type ?? "").toLowerCase();
    const isSave =
      result.includes("save") ||
      result.includes("defended") ||
      type.includes("save") ||
      type.includes("shootout_miss");
    if (!id || !isSave || !passesAthleteGender(id, athleteGenderSet)) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const cat = await buildAthleteCountCategory(counts, "awards", supabase);
  return cat
    ? {
        ...cat,
        key: "gk_shootout_saves",
        label: "Defesas de shoot-out",
        valueLabel: "Defesas",
      }
    : null;
}

async function fetchTeamStatCategory(
  supabase: SupabaseClient,
  orgId: string,
  cat: TeamStatCategoryDef,
  ctx: HallQueryContext,
): Promise<HallCategory | null> {
  if (cat.key === "team_titles" && ctx.useEditionStats) {
    if (!ctx.editionIds.length) return null;
    const { data } = await supabase
      .from("edition_awards")
      .select("winning_team_id")
      .in("edition_id", ctx.editionIds)
      .eq("award_type", "champion")
      .is("athlete_id", null)
      .is("staff_member_id", null);

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const id = row.winning_team_id as string;
      if (!id || !passesTeamGender(id, ctx.teamGenderSet)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return buildTeamCountCategory(supabase, counts, cat);
  }

  if (ctx.useEditionStats) {
    if (!ctx.editionIds.length) return null;

    const field = cat.editionField;
    const { data, error } = await supabase
      .from("team_edition_stats")
      .select(`team_id, ${field}`)
      .in("edition_id", ctx.editionIds);

    if (error) {
      console.error(`[hall:team:${cat.key}]`, error.message);
      return null;
    }

    const totals = new Map<string, number>();
    for (const row of data ?? []) {
      const id = row.team_id as string;
      if (!id || !passesTeamGender(id, ctx.teamGenderSet)) continue;
      const val = Number(row[field as keyof typeof row]) || 0;
      if (val <= 0) continue;
      totals.set(id, (totals.get(id) ?? 0) + val);
    }

    return buildTeamCountCategory(supabase, totals, cat);
  }

  const { data, error } = await supabase
    .from("team_career_stats")
    .select(`team_id, ${cat.careerField}`)
    .eq("organization_id", orgId);

  if (error) {
    console.error(`[hall:team:${cat.key}]`, error.message);
    return null;
  }

  const ranked = (data ?? [])
    .map((row) => ({
      team_id: row.team_id as string,
      value: Number(row[cat.careerField as keyof typeof row]) || 0,
    }))
    .filter(
      (row) =>
        row.team_id &&
        row.value > 0 &&
        passesTeamGender(row.team_id, ctx.teamGenderSet),
    )
    .sort((a, b) => b.value - a.value || a.team_id.localeCompare(b.team_id));

  if (!ranked.length) return null;

  const teamIds = ranked.map((r) => r.team_id);
  const { data: teams } = await supabase
    .from("teams")
    .select("id, full_name, logo_url, primary_color, abbreviation")
    .in("id", teamIds)
    .eq("is_virtual", false);
  const teamMap = new Map((teams ?? []).map((t) => [t.id as string, t]));

  const rankedReal = ranked.filter((r) => teamMap.has(r.team_id)).slice(0, TOP_N);
  if (!rankedReal.length) return null;

  return {
    key: cat.key,
    label: cat.label,
    valueLabel: cat.valueLabel,
    section: "teams",
    entries: rankedReal.map((r) => {
      const team = teamMap.get(r.team_id);
      return {
        id: r.team_id,
        name: team?.full_name ?? "—",
        photo_url: team?.logo_url ?? null,
        accent_color: (team?.primary_color as string | null) ?? null,
        abbreviation: (team?.abbreviation as string | null) ?? null,
        value: r.value,
      };
    }),
  };
}

async function buildTeamCountCategory(
  supabase: SupabaseClient,
  counts: Map<string, number>,
  cat: TeamStatCategoryDef | HallCustomCategoryDef,
): Promise<HallCategory | null> {
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  if (!sorted.length) return null;

  const teamIds = sorted.map(([id]) => id);
  const { data: teams } = await supabase
    .from("teams")
    .select("id, full_name, logo_url, primary_color, abbreviation")
    .in("id", teamIds)
    .eq("is_virtual", false);

  const teamMap = new Map((teams ?? []).map((t) => [t.id as string, t]));
  const sortedReal = sorted.filter(([id]) => teamMap.has(id)).slice(0, TOP_N);
  if (!sortedReal.length) return null;

  return {
    key: cat.key,
    label: cat.label,
    valueLabel: cat.valueLabel,
    section: "teams",
    entries: sortedReal.map(([id, value]) => {
      const team = teamMap.get(id);
      return {
        id,
        name: team?.full_name ?? "—",
        photo_url: team?.logo_url ?? null,
        accent_color: (team?.primary_color as string | null) ?? null,
        abbreviation: (team?.abbreviation as string | null) ?? null,
        value,
      };
    }),
  };
}

async function buildStreakEntries(
  supabase: SupabaseClient,
  rows: { team_id: string; edition_id: string; [key: string]: unknown }[],
  valueField: string,
): Promise<HallEntry[]> {
  const teamIds = [...new Set(rows.map((r) => r.team_id))];
  const editionIds = [...new Set(rows.map((r) => r.edition_id))];

  const [teamsRes, editionsRes] = await Promise.all([
    supabase
      .from("teams")
      .select("id, full_name, logo_url, primary_color, abbreviation")
      .in("id", teamIds)
      .eq("is_virtual", false),
    supabase
      .from("competition_editions")
      .select("id, competitions(short_name, full_name), seasons(name)")
      .in("id", editionIds),
  ]);

  const teamsMap = new Map((teamsRes.data ?? []).map((t) => [t.id as string, t]));
  const editionsMap = new Map(
    (editionsRes.data ?? []).map((e) => {
      const cn = (e.competitions as { short_name?: string; full_name?: string })?.short_name ??
        (e.competitions as { full_name?: string })?.full_name ?? "";
      const sn = (e.seasons as { name?: string })?.name ?? "";
      return [e.id as string, [cn, sn].filter(Boolean).join(" · ") || null];
    }),
  );

  return rows
    .filter((r) => teamsMap.has(r.team_id))
    .map((r) => {
      const t = teamsMap.get(r.team_id);
      return {
        id: r.team_id,
        name: t?.full_name ?? "—",
        photo_url: t?.logo_url ?? null,
        accent_color: (t?.primary_color as string | null) ?? null,
        abbreviation: (t?.abbreviation as string | null) ?? null,
        value: Number(r[valueField]) || 0,
        team_name: editionsMap.get(r.edition_id as string) ?? null,
      };
    });
}

async function fetchTeamSpecialCategories(
  supabase: SupabaseClient,
  orgId: string,
  teamGenderSet: Set<string> | null,
): Promise<HallCategory[]> {
  const results: HallCategory[] = [];

  const { data: careerStats } = await supabase
    .from("team_career_stats")
    .select("team_id, total_wins, total_draws")
    .eq("organization_id", orgId);

  const pontosList = (careerStats ?? [])
    .map((r) => ({
      team_id: r.team_id as string,
      pts: (Number(r.total_wins) || 0) * 3 + (Number(r.total_draws) || 0),
    }))
    .filter((r) => passesTeamGender(r.team_id, teamGenderSet) && r.pts > 0)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, TOP_N);

  if (pontosList.length) {
    const pontosTeamIds = pontosList.map((r) => r.team_id);
    const { data: pontosTeams } = await supabase
      .from("teams")
      .select("id, full_name, logo_url, primary_color, abbreviation")
      .in("id", pontosTeamIds)
      .eq("is_virtual", false);
    const pontosTeamMap = new Map((pontosTeams ?? []).map((t) => [t.id as string, t]));
    const def = HALL_TEAM_SPECIAL_CATEGORIES.find((c) => c.key === "mais_pontos")!;
    const entries = pontosList
      .filter((r) => pontosTeamMap.has(r.team_id))
      .map((r) => {
        const t = pontosTeamMap.get(r.team_id)!;
        return {
          id: r.team_id,
          name: t.full_name as string,
          photo_url: t.logo_url as string | null,
          accent_color: t.primary_color as string | null,
          abbreviation: (t.abbreviation as string | null) ?? null,
          value: r.pts,
        };
      });
    if (entries.length) {
      results.push({
        key: def.key,
        label: def.label,
        valueLabel: def.valueLabel,
        section: "teams",
        entries,
      });
    }
  }

  return results;
}

export async function fetchHallAthletes(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory[]> {
  const supabase = getSupabase();
  const ctx = await buildHallQueryContext(orgId, filters);
  const goalkeeperIds = await fetchGoalkeeperIds(supabase);

  const statCats = await Promise.all(
    HALL_ATHLETE_STAT_CATEGORIES.map((cat) =>
      fetchAthleteStatCategory(supabase, orgId, cat, ctx, goalkeeperIds),
    ),
  );

  const customCats = await Promise.all([
    fetchGoalParticipation(supabase, orgId, ctx),
    ctx.awardEditionIds.length
      ? fetchAthleteTitles(supabase, ctx.awardEditionIds, ctx.athleteGenderSet)
      : Promise.resolve(null),
    ctx.awardEditionIds.length
      ? fetchAthleteFinals(supabase, ctx.awardEditionIds, ctx.athleteGenderSet)
      : Promise.resolve(null),
    ctx.awardEditionIds.length
      ? fetchAthleteIndividualAwards(supabase, ctx.awardEditionIds, ctx.athleteGenderSet)
      : Promise.resolve(null),
    ctx.awardEditionIds.length
      ? fetchGkCleanSheets(
          supabase,
          ctx.awardEditionIds,
          goalkeeperIds,
          ctx.athleteGenderSet,
        )
      : Promise.resolve(null),
  ]);

  return sortHallCategories(
    [...statCats, ...customCats].filter((c): c is HallCategory => c != null),
    HALL_ATHLETE_CATEGORY_ORDER,
  );
}

export async function fetchHallTeams(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory[]> {
  const supabase = getSupabase();
  const ctx = await buildHallQueryContext(orgId, filters);

  const [ranking, statCats, specialCats] = await Promise.all([
    fetchTeamRankingCategory(orgId, filters),
    Promise.all(
      HALL_TEAM_STAT_CATEGORIES.map((cat) =>
        fetchTeamStatCategory(supabase, orgId, cat, ctx),
      ),
    ),
    fetchTeamSpecialCategories(supabase, orgId, ctx.teamGenderSet),
  ]);

  return sortHallCategories(
    [ranking, ...specialCats, ...statCats.filter(Boolean)].filter(
      (c): c is HallCategory => c != null,
    ),
    HALL_TEAM_CATEGORY_ORDER,
  );
}

export async function computeHallData(
  orgId: string,
  filters: HallFilters,
  tab?: "athletes" | "teams" | "all",
): Promise<HallSectionData> {
  const fetchAthletes = tab !== "teams";
  const fetchTeams = tab !== "athletes";

  const [athletes, teams] = await Promise.all([
    fetchAthletes ? fetchHallAthletes(orgId, filters) : Promise.resolve([]),
    fetchTeams ? fetchHallTeams(orgId, filters) : Promise.resolve([]),
  ]);

  return { athletes, teams, staff: [] };
}

export async function getHallData(
  orgId: string,
  filters: HallFilters,
  tab?: "athletes" | "teams" | "all",
): Promise<HallSectionData> {
  const gender = filters.gender || "all";

  if (canUseHallCache(filters)) {
    const cached = await getHallOfFameFromCache(
      orgId,
      gender,
      filters.editionId || null,
    );
    const fromCache = hallSectionFromCache(cached);
    if (fromCache) {
      if (tab === "athletes") {
        return { athletes: fromCache.athletes, teams: [], staff: [] };
      }

      // Ranking de equipes vem do ledger (igual ao app), não do cache de stats
      const ranking = await fetchTeamRankingCategory(orgId, filters);
      const teams = sortHallCategories(
        [
          ranking,
          ...fromCache.teams.filter((c) => c.key !== "team_ranking"),
        ],
        HALL_TEAM_CATEGORY_ORDER,
      );

      if (tab === "teams") {
        return { athletes: [], teams, staff: [] };
      }
      return { ...fromCache, teams };
    }
  }

  return computeHallData(orgId, filters, tab);
}

export async function getHallFilterOptions(orgId: string): Promise<import("@/lib/types").HallFilterOptions> {
  const supabase = getSupabase();

  const [{ data: competitions }, { data: teamsRaw }] = await Promise.all([
    supabase
      .from("competitions")
      .select("id, full_name, short_name, gender, logo_url")
      .eq("organization_id", orgId)
      .order("full_name"),
    supabase
      .from("teams")
      .select("id, full_name, short_name, abbreviation, logo_url, gender")
      .eq("organization_id", orgId)
      .eq("is_virtual", false)
      .order("full_name", { ascending: true }),
  ]);

  const compIds = (competitions ?? []).map((c) => c.id as string);

  const { data: editionsRaw } = compIds.length
    ? await supabase
        .from("competition_editions")
        .select("id, competition_id, custom_name, seasons ( name, years ( value ) )")
        .in("competition_id", compIds)
    : { data: [] };

  const editions = (editionsRaw ?? []).map((e) => {
    const seasons = e.seasons as
      | { name?: string; years?: { value?: number } | { value?: number }[] }
      | { name?: string; years?: { value?: number } | { value?: number }[] }[]
      | null;
    const season = Array.isArray(seasons) ? seasons[0] : seasons;
    const years = season?.years;
    const yearRow = Array.isArray(years) ? years[0] : years;
    return {
      id: e.id as string,
      competition_id: e.competition_id as string,
      season_name: season?.name ?? "",
      custom_name: (e.custom_name as string | null) ?? null,
      year: yearRow?.value != null ? Number(yearRow.value) : null,
    };
  });

  const yearSet = new Set<number>();
  for (const e of editions) {
    if (e.year != null) yearSet.add(e.year);
  }
  const years = [...yearSet]
    .sort((a, b) => b - a)
    .map((y) => ({ id: String(y), label: String(y) }));

  return {
    competitions: (competitions ?? []).map((c) => ({
      id: c.id as string,
      full_name: c.full_name as string,
      short_name: (c.short_name as string | null) ?? null,
      gender: (c.gender as string | null) ?? null,
      logo_url: (c.logo_url as string | null) ?? null,
    })),
    editions,
    years,
    teams: (teamsRaw ?? []).map((team) => ({
      id: team.id as string,
      full_name: team.full_name as string,
      short_name: (team.short_name as string | null) ?? null,
      abbreviation: (team.abbreviation as string | null) ?? null,
      logo_url: (team.logo_url as string | null) ?? null,
      gender: (team.gender as string | null) ?? null,
    })),
  };
}

export const DEFAULT_FILTERS: HallFilters = {
  competitionId: "",
  editionId: "",
  year: "",
  gender: "all",
};

export {
  getFilteredEditionIds,
  getOrgEditionIds,
  hasEditionScopeFilters,
  resolveHallEditionIds,
} from "@/lib/hall/hallScope";

export { getHallOfFameFromCache } from "@/lib/hall/hallCacheRead";
export { refreshHallOfFameCache } from "@/lib/hall/refreshHallCache";
