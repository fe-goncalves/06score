import { getSupabase } from "@/lib/supabase";
import type { Competition, Matchup, Team } from "@/lib/types";

export async function getCompetitionIdsForOrg(
  orgId: string,
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select("id")
    .eq("organization_id", orgId);

  if (error || !data?.length) return [];
  return data.map((c) => c.id);
}

export async function getEditionIdsForCompetition(
  competitionId: string,
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId);

  if (error || !data?.length) return [];
  return data.map((e) => e.id);
}

export async function getPhaseIdsForEdition(
  editionId: string,
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("phases")
    .select("id")
    .eq("edition_id", editionId);

  if (error || !data?.length) return [];
  return data.map((p) => p.id);
}

export async function getPhaseIdsForOrg(orgId: string): Promise<string[]> {
  const compIds = await getCompetitionIdsForOrg(orgId);
  if (!compIds.length) return [];

  const supabase = getSupabase();
  const { data: editions, error: edError } = await supabase
    .from("competition_editions")
    .select("id")
    .in("competition_id", compIds);

  if (edError || !editions?.length) return [];

  const editionIds = editions.map((e) => e.id);
  const { data: phases, error: phaseError } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  if (phaseError || !phases?.length) return [];
  return phases.map((p) => p.id);
}

export async function assertOrgOwnsCompetition(
  competitionId: string,
  orgId: string,
): Promise<Competition | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select(
      "id, full_name, short_name, logo_url, primary_color, sport_slug, gender, organization_id",
    )
    .eq("id", competitionId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (error) {
    console.error("[assertOrgOwnsCompetition]", error.message);
    return null;
  }
  return data as Competition | null;
}

export async function enrichMatchupsWithTeams(
  matchups: Matchup[],
): Promise<Matchup[]> {
  if (!matchups.length) return [];

  const teamIds = [
    ...new Set(
      matchups.flatMap((m) =>
        [m.team_a_id, m.team_b_id].filter((id): id is string => Boolean(id)),
      ),
    ),
  ];

  if (!teamIds.length) return matchups;

  const supabase = getSupabase();
  const { data: teamsData, error } = await supabase
    .from("teams")
    .select("id, full_name, short_name, abbreviation, logo_url, primary_color")
    .in("id", teamIds);

  if (error) {
    console.error("[enrichMatchupsWithTeams]", error.message);
    return matchups;
  }

  const teamsMap: Record<string, Team> = {};
  for (const t of teamsData ?? []) {
    teamsMap[t.id] = t as Team;
  }

  return matchups.map((m) => ({
    ...m,
    teams_a: m.team_a_id ? (teamsMap[m.team_a_id] ?? null) : null,
    teams_b: m.team_b_id ? (teamsMap[m.team_b_id] ?? null) : null,
  }));
}
