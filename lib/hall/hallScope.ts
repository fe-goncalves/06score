import { getSupabase } from "@/lib/supabase";
import type { HallFilters, HallGender } from "@/lib/types";

export interface HallEditionFilters {
  gender?: string;
  yearValue?: number;
  competitionId?: string;
}

/** Ano, competição ou temporada ativa → agregar por edição. Gênero sozinho não entra aqui. */
export function hasEditionScopeFilters(filters: HallFilters): boolean {
  return Boolean(filters.competitionId || filters.year || filters.editionId);
}

export async function getFilteredEditionIds(
  organizationId: string,
  filters: HallEditionFilters,
): Promise<string[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("competition_editions")
    .select("id, competitions!inner(id, organization_id, gender)")
    .eq("competitions.organization_id", organizationId);

  if (filters.competitionId) {
    query = query.eq("competition_id", filters.competitionId);
  }
  if (filters.gender) {
    query = query.eq("competitions.gender", filters.gender);
  }
  if (filters.yearValue != null && Number.isFinite(filters.yearValue)) {
    const { data: years } = await supabase
      .from("years")
      .select("id")
      .eq("value", filters.yearValue);
    const yearIds = (years ?? []).map((y) => y.id as string);
    if (!yearIds.length) return [];

    const { data: seasons } = await supabase
      .from("seasons")
      .select("id")
      .in("year_id", yearIds);
    const seasonIds = (seasons ?? []).map((s) => s.id as string);
    if (!seasonIds.length) return [];

    query = query.in("season_id", seasonIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getFilteredEditionIds]", error.message);
    return [];
  }
  return (data ?? []).map((e) => e.id as string);
}

/** Todas as edições da organização (premiações / GK sem escopo de edição). */
export async function getOrgEditionIds(organizationId: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competition_editions")
    .select("id, competitions!inner(organization_id)")
    .eq("competitions.organization_id", organizationId);

  if (error) {
    console.error("[getOrgEditionIds]", error.message);
    return [];
  }
  return (data ?? []).map((e) => e.id as string);
}

export async function resolveHallEditionIds(
  organizationId: string,
  filters: HallFilters,
): Promise<string[]> {
  if (!hasEditionScopeFilters(filters)) return [];

  if (filters.editionId) return [filters.editionId];

  return getFilteredEditionIds(organizationId, {
    competitionId: filters.competitionId || undefined,
    yearValue: filters.year ? Number(filters.year) : undefined,
  });
}

export async function getAthleteIdsByGender(
  organizationId: string,
  gender: HallGender,
): Promise<Set<string> | null> {
  if (!gender || gender === "all") return null;

  const supabase = getSupabase();
  const { data: careerRows, error: careerError } = await supabase
    .from("athlete_career_stats")
    .select("athlete_id")
    .eq("organization_id", organizationId);

  if (careerError) {
    console.error("[getAthleteIdsByGender:career]", careerError.message);
    return null;
  }

  const orgAthleteIds = [...new Set((careerRows ?? []).map((r) => r.athlete_id as string))];
  if (!orgAthleteIds.length) return new Set();

  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, gender")
    .in("id", orgAthleteIds)
    .eq("gender", gender);

  if (error) {
    console.error("[getAthleteIdsByGender]", error.message);
    return null;
  }

  return new Set((athletes ?? []).map((a) => a.id as string));
}

export async function getTeamIdsByGender(
  organizationId: string,
  gender: HallGender,
): Promise<Set<string> | null> {
  if (!gender || gender === "all") return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("gender", gender)
    .eq("is_virtual", false);

  if (error) {
    console.error("[getTeamIdsByGender]", error.message);
    return null;
  }

  return new Set((data ?? []).map((t) => t.id as string));
}

/** @deprecated Use resolveHallEditionIds */
export async function resolveHallScope(orgId: string, filters: HallFilters) {
  const editionIds = await resolveHallEditionIds(orgId, filters);
  const supabase = getSupabase();
  const { data } = await supabase
    .from("competitions")
    .select("id")
    .eq("organization_id", orgId);

  let competitionIds = (data ?? []).map((c) => c.id as string);
  if (filters.competitionId) {
    competitionIds = competitionIds.filter((id) => id === filters.competitionId);
  }

  return { editionIds, competitionIds };
}
