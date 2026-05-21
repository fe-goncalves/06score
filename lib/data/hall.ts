import { getSupabase } from "@/lib/supabase";
import { ATHLETE_CATEGORIES, TEAM_CATEGORIES } from "@/lib/hall/categories";
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

// ─── Atletas ──────────────────────────────────────────────────────────────────

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

// ─── Equipes ──────────────────────────────────────────────────────────────────

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

// ─── Export principal ─────────────────────────────────────────────────────────

export async function getHallData(
  orgId: string,
  filters: HallFilters,
): Promise<HallSectionData> {
  const [athletes, teams] = await Promise.all([
    getAthleteCategories(orgId, filters),
    getTeamCategories(orgId, filters),
  ]);

  return { athletes, teams, staff: [] };
}

export const DEFAULT_FILTERS: HallFilters = {
  competitionId: "",
  editionId: "",
  teamId: "",
  gender: "",
};