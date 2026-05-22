import { getSupabase } from "@/lib/supabase";
import {
  ATHLETE_CATEGORIES,
  TEAM_CATEGORIES,
  ATHLETE_ACHIEVEMENT_CATEGORIES,
  TEAM_SPECIAL_CATEGORIES,
} from "@/lib/hall/categories";
import type {
  HallCategory,
  HallEntry,
  HallFilterOptions,
  HallSectionData,
  HallFilters,
} from "@/lib/types";

export async function getHallFilterOptions(
  orgId: string,
): Promise<HallFilterOptions> {
  const supabase = getSupabase();

  const [compRes, editionRes, teamRes] = await Promise.all([
    supabase
      .from("competitions")
      .select("id, full_name, short_name, gender")
      .eq("organization_id", orgId)
      .order("full_name"),
    supabase
      .from("competition_editions")
      .select("id, competition_id, seasons(name)")
      .in(
        "competition_id",
        await supabase
          .from("competitions")
          .select("id")
          .eq("organization_id", orgId)
          .then((r) => (r.data ?? []).map((c) => c.id)),
      ),
    supabase
      .from("teams")
      .select("id, full_name")
      .eq("organization_id", orgId)
      .order("full_name"),
  ]);

  const editions = (editionRes.data ?? []).map((e: any) => ({
    id: e.id,
    competition_id: e.competition_id,
    season_name: Array.isArray(e.seasons)
      ? (e.seasons[0]?.name ?? "")
      : (e.seasons?.name ?? ""),
  }));

  return {
    competitions: compRes.data ?? [],
    editions,
    teams: teamRes.data ?? [],
  };
}

// ─── Helper: busca todas as edition_ids da org ────────────────────────────────

async function getAllEditionIds(orgId: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("competition_editions")
    .select("id, competitions!inner(organization_id)")
    .eq("competitions.organization_id", orgId);
  return (data ?? []).map((e: any) => e.id);
}

// ─── Atletas – categorias de stats ────────────────────────────────────────────

async function getAthleteCategories(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory[]> {
  const supabase = getSupabase();
  const results: HallCategory[] = [];

  for (const cat of ATHLETE_CATEGORIES) {
    let query;

    if (filters.editionId) {
      query = supabase
        .from("athlete_edition_stats")
        .select(
          `${cat.field}, athletes(id, full_name, surname, photo_url), edition_teams(team_id, teams(full_name, logo_url))`,
        )
        .eq("edition_id", filters.editionId);
    } else {
      query = supabase
        .from("athlete_career_stats")
        .select(
          `${cat.field}, athletes(id, full_name, surname, photo_url, athlete_team_stints(team_id, is_current, teams(full_name, logo_url)))`,
        )
        .eq("organization_id", orgId);
    }

    if (filters.teamId && filters.editionId) {
      query = (query as any).eq("edition_teams.team_id", filters.teamId);
    }

    const { data, error } = await (query as any)
      .order(cat.field, { ascending: false })
      .gt(cat.field, 0)
      .limit(10);

    if (error) {
      console.error(`[getAthleteCategories] ${cat.key}`, error.message);
      continue;
    }

    const entries: HallEntry[] = (data ?? []).map((row: any) => {
      const athlete = row.athletes;
      const surname = athlete?.surname ?? "";
      const name = surname
        ? `${athlete?.full_name} ${surname}`
        : (athlete?.full_name ?? "—");

      let team_name: string | null = null;
      let team_logo: string | null = null;

      if (filters.editionId) {
        team_name = row.edition_teams?.teams?.full_name ?? null;
        team_logo = row.edition_teams?.teams?.logo_url ?? null;
      } else {
        const currentStint = (athlete?.athlete_team_stints ?? []).find(
          (s: any) => s.is_current,
        );
        team_name = currentStint?.teams?.full_name ?? null;
        team_logo = currentStint?.teams?.logo_url ?? null;
      }

      return {
        id: athlete?.id ?? "",
        name,
        photo_url: athlete?.photo_url ?? null,
        value: row[cat.field] ?? 0,
        team_name,
        team_logo,
      };
    });

    if (entries.length > 0) {
      results.push({
        key: cat.key,
        label: cat.label,
        section: "athletes",
        entries,
      });
    }
  }

  return results;
}

// ─── Atletas – categorias de achievements ─────────────────────────────────────

async function getAthleteAchievementCategories(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory[]> {
  const supabase = getSupabase();
  const results: HallCategory[] = [];

  // Determina as edition_ids a usar
  const editionIds = filters.editionId
    ? [filters.editionId]
    : await getAllEditionIds(orgId);

  if (editionIds.length === 0) return results;

  for (const cat of ATHLETE_ACHIEVEMENT_CATEGORIES) {
    let query = supabase
      .from("athlete_match_achievements")
      .select("athlete_id")
      .eq("achievement_type", cat.achievementType)
      .in("edition_id", editionIds);

    if (filters.teamId) {
      query = query.eq("team_id", filters.teamId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`[getAthleteAchievementCategories] ${cat.key}`, error.message);
      continue;
    }

    // Conta por athlete_id
    const counts = new Map<string, number>();
    for (const row of (data ?? []) as any[]) {
      counts.set(row.athlete_id, (counts.get(row.athlete_id) ?? 0) + 1);
    }

    if (counts.size === 0) continue;

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Busca dados dos atletas em batch
    const athleteIds = sorted.map(([id]) => id);
    const { data: athleteData } = await supabase
      .from("athletes")
      .select("id, full_name, surname, photo_url, athlete_team_stints(is_current, teams(full_name, logo_url))")
      .in("id", athleteIds);

    const athleteMap = new Map((athleteData ?? []).map((a: any) => [a.id, a]));

    const entries: HallEntry[] = sorted.map(([id, count]) => {
      const a = athleteMap.get(id);
      const surname = a?.surname ?? "";
      const name = surname ? `${a?.full_name} ${surname}` : (a?.full_name ?? "—");
      const currentStint = (a?.athlete_team_stints ?? []).find((s: any) => s.is_current);

      return {
        id,
        name,
        photo_url: a?.photo_url ?? null,
        value: count,
        team_name: currentStint?.teams?.full_name ?? null,
        team_logo: currentStint?.teams?.logo_url ?? null,
      };
    });

    if (entries.length > 0) {
      results.push({
        key: cat.key,
        label: cat.label,
        section: "athletes",
        entries,
      });
    }
  }

  return results;
}

// ─── Equipes – categorias de stats ────────────────────────────────────────────

async function getTeamCategories(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory[]> {
  const supabase = getSupabase();
  const results: HallCategory[] = [];

  for (const cat of TEAM_CATEGORIES) {
    let query;

    if (filters.editionId) {
      query = supabase
        .from("team_edition_stats")
        .select(`${cat.field}, teams(id, full_name, logo_url)`)
        .eq("edition_id", filters.editionId);
    } else {
      query = supabase
        .from("team_career_stats")
        .select(`${cat.field}, teams(id, full_name, logo_url)`)
        .eq("organization_id", orgId);
    }

    const { data, error } = await (query as any)
      .order(cat.field, { ascending: false })
      .gt(cat.field, 0)
      .limit(10);

    if (error) {
      console.error(`[getTeamCategories] ${cat.key}`, error.message);
      continue;
    }

    const entries: HallEntry[] = (data ?? []).map((row: any) => ({
      id: row.teams?.id ?? "",
      name: row.teams?.full_name ?? "—",
      photo_url: row.teams?.logo_url ?? null,
      value: row[cat.field] ?? 0,
    }));

    if (entries.length > 0) {
      results.push({
        key: cat.key,
        label: cat.label,
        section: "teams",
        entries,
      });
    }
  }

  return results;
}

// ─── Equipes – categorias especiais ──────────────────────────────────────────

async function getTeamSpecialCategories(
  orgId: string,
  filters: HallFilters,
): Promise<HallCategory[]> {
  const supabase = getSupabase();
  const results: HallCategory[] = [];

  const editionIds = filters.editionId
    ? [filters.editionId]
    : await getAllEditionIds(orgId);

  if (editionIds.length === 0) return results;

  // ── Sequências de vitórias ────────────────────────────────────────────────

  const winStreakRes = await supabase
    .from("view_team_winning_streaks")
    .select("team_id, edition_id, max_winning_streak")
    .in("edition_id", editionIds)
    .gt("max_winning_streak", 0)
    .order("max_winning_streak", { ascending: false })
    .limit(10);

  if (!winStreakRes.error && (winStreakRes.data ?? []).length > 0) {
    const entries = await buildStreakEntries(supabase, winStreakRes.data ?? [], "max_winning_streak");
    if (entries.length > 0) {
      results.push({ key: "sequencia_vitorias", label: "Sequência de Vitórias", section: "teams", entries });
    }
  }

  // ── Sequências de invencibilidade ─────────────────────────────────────────

  const unbeatenRes = await supabase
    .from("view_team_unbeaten_streaks")
    .select("team_id, edition_id, max_unbeaten_streak")
    .in("edition_id", editionIds)
    .gt("max_unbeaten_streak", 0)
    .order("max_unbeaten_streak", { ascending: false })
    .limit(10);

  if (!unbeatenRes.error && (unbeatenRes.data ?? []).length > 0) {
    const entries = await buildStreakEntries(supabase, unbeatenRes.data ?? [], "max_unbeaten_streak");
    if (entries.length > 0) {
      results.push({ key: "sequencia_invicto", label: "Maior Invencibilidade", section: "teams", entries });
    }
  }

  // ── Maior goleada ─────────────────────────────────────────────────────────

  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, home_team_id, away_team_id, score_home, score_away, edition_id")
    .eq("status", "finished")
    .in("edition_id", editionIds)
    .not("score_home", "is", null)
    .not("score_away", "is", null);

  if ((matchesData ?? []).length > 0) {
    type GoleadaRow = {
      winner_team_id: string;
      loser_team_id: string;
      edition_id: string;
      score_winner: number;
      score_loser: number;
      diff: number;
    };

    const goleadas: GoleadaRow[] = ((matchesData ?? []) as any[])
      .map((m) => {
        const sh = m.score_home ?? 0;
        const sa = m.score_away ?? 0;
        const diff = Math.abs(sh - sa);
        if (diff === 0) return null;
        const [winner, loser, sw, sl] = sh > sa
          ? [m.home_team_id, m.away_team_id, sh, sa]
          : [m.away_team_id, m.home_team_id, sa, sh];
        return { winner_team_id: winner, loser_team_id: loser, edition_id: m.edition_id, score_winner: sw, score_loser: sl, diff };
      })
      .filter(Boolean) as GoleadaRow[];

    goleadas.sort((a, b) => b.diff - a.diff || b.score_winner - a.score_winner);

    const top10 = goleadas.slice(0, 10);

    if (top10.length > 0) {
      const goleadaTeamIds = [...new Set(top10.flatMap((g) => [g.winner_team_id, g.loser_team_id]).filter(Boolean))];
      const goleadaEditionIds = [...new Set(top10.map((g) => g.edition_id))];

      const [teamsRes, editionsRes] = await Promise.all([
        goleadaTeamIds.length > 0
          ? supabase.from("teams").select("id, full_name, logo_url").in("id", goleadaTeamIds)
          : Promise.resolve({ data: [] }),
        goleadaEditionIds.length > 0
          ? supabase.from("competition_editions").select("id, competitions(short_name, full_name), seasons(name)").in("id", goleadaEditionIds)
          : Promise.resolve({ data: [] }),
      ]);

      const teamsMap = new Map((teamsRes.data ?? []).map((t: any) => [t.id, t]));
      const editionsMap = new Map((editionsRes.data ?? []).map((e: any) => {
        const cn = e.competitions?.short_name ?? e.competitions?.full_name ?? "";
        const sn = e.seasons?.name ?? "";
        return [e.id, [cn, sn].filter(Boolean).join(" · ") || null];
      }));

      const entries: HallEntry[] = top10.map((g) => {
        const t = teamsMap.get(g.winner_team_id);
        const loserTeam = teamsMap.get(g.loser_team_id);
        const edLabel = editionsMap.get(g.edition_id);
        const placar = `${g.score_winner}×${g.score_loser} vs ${loserTeam?.full_name ?? "—"}`;
        const subtitle = edLabel ? `${placar} · ${edLabel}` : placar;
        return {
          id: g.winner_team_id,
          name: t?.full_name ?? "—",
          photo_url: t?.logo_url ?? null,
          value: g.diff,
          team_name: subtitle,
        };
      });

      if (entries.length > 0) {
        results.push({ key: "maior_goleada", label: "Maior Goleada", section: "teams", entries });
      }
    }
  }

  // ── Mais cleansheets ──────────────────────────────────────────────────────

  const { data: csMatchesData } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, score_home, score_away")
    .eq("status", "finished")
    .in("edition_id", editionIds)
    .not("score_home", "is", null)
    .not("score_away", "is", null);

  if ((csMatchesData ?? []).length > 0) {
    const csCount = new Map<string, number>();

    for (const m of (csMatchesData ?? []) as any[]) {
      const sh = m.score_home ?? 0;
      const sa = m.score_away ?? 0;
      if (sa === 0 && m.home_team_id) {
        csCount.set(m.home_team_id, (csCount.get(m.home_team_id) ?? 0) + 1);
      }
      if (sh === 0 && m.away_team_id) {
        csCount.set(m.away_team_id, (csCount.get(m.away_team_id) ?? 0) + 1);
      }
    }

    const sortedCs = Array.from(csCount.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sortedCs.length > 0) {
      const csTeamIds = sortedCs.map(([id]) => id);
      const { data: csTeamsData } = await supabase
        .from("teams")
        .select("id, full_name, logo_url")
        .in("id", csTeamIds);
      const csTeamsMap = new Map((csTeamsData ?? []).map((t: any) => [t.id, t]));

      const entries: HallEntry[] = sortedCs.map(([id, count]) => {
        const t = csTeamsMap.get(id);
        return { id, name: t?.full_name ?? "—", photo_url: t?.logo_url ?? null, value: count };
      });

      results.push({ key: "mais_cleansheets", label: "Mais Cleansheets", section: "teams", entries });
    }
  }

  return results;
}

// ─── Helper: monta HallEntry[] para streak rows ───────────────────────────────

async function buildStreakEntries(
  supabase: ReturnType<typeof getSupabase>,
  rows: any[],
  valueField: string,
): Promise<HallEntry[]> {
  const teamIds = [...new Set(rows.map((r) => r.team_id))];
  const editionIds = [...new Set(rows.map((r) => r.edition_id))];

  const [teamsRes, editionsRes] = await Promise.all([
    teamIds.length > 0
      ? supabase.from("teams").select("id, full_name, logo_url").in("id", teamIds)
      : Promise.resolve({ data: [] }),
    editionIds.length > 0
      ? supabase.from("competition_editions").select("id, competitions(short_name, full_name), seasons(name)").in("id", editionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const teamsMap = new Map((teamsRes.data ?? []).map((t: any) => [t.id, t]));
  const editionsMap = new Map((editionsRes.data ?? []).map((e: any) => {
    const cn = e.competitions?.short_name ?? e.competitions?.full_name ?? "";
    const sn = e.seasons?.name ?? "";
    return [e.id, [cn, sn].filter(Boolean).join(" · ") || null];
  }));

  return rows.map((r) => {
    const t = teamsMap.get(r.team_id);
    const edLabel = editionsMap.get(r.edition_id);
    return {
      id: r.team_id,
      name: t?.full_name ?? "—",
      photo_url: t?.logo_url ?? null,
      value: r[valueField] ?? 0,
      team_name: edLabel ?? null, // reutiliza team_name como subtitle de edição
    };
  });
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function getHallData(
  orgId: string,
  filters: HallFilters,
): Promise<HallSectionData> {
  const [athletes, athleteAchievements, teams, teamSpecial] = await Promise.all([
    getAthleteCategories(orgId, filters),
    getAthleteAchievementCategories(orgId, filters),
    getTeamCategories(orgId, filters),
    getTeamSpecialCategories(orgId, filters),
  ]);

  return {
    athletes: [...athletes, ...athleteAchievements],
    teams: [...teams, ...teamSpecial],
    staff: [],
  };
}

export const DEFAULT_FILTERS: HallFilters = {
  competitionId: "",
  editionId: "",
  teamId: "",
  gender: "",
};