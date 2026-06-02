import { getTopTeamLeaderForCompetition } from "@/lib/data/home";
import { getSupabase } from "@/lib/supabase";
import type {
  AthleteStatLeader,
  Competition,
  HomeHighlights,
  HomeHighlightsBundle,
  Team,
  TeamStatLeader,
} from "@/lib/types";

const ATHLETE_SELECT =
  "goals, assists, athletes(id, full_name, surname, photo_url), teams(id, full_name, short_name, abbreviation, logo_url, primary_color)";

const CAREER_SELECT =
  "total_goals, total_assists, athletes(id, full_name, surname, photo_url)";

const TEAM_CAREER_SELECT =
  "teams!inner(id, full_name, short_name, abbreviation, logo_url, primary_color, gender)";

type CareerStatsRow = {
  total_goals: number | null;
  total_assists: number | null;
  athletes: AthleteStatLeader["athletes"];
};

type AggregatedAthlete = {
  goals: number;
  assists: number;
  athletes: AthleteStatLeader["athletes"];
  teams: AthleteStatLeader["teams"];
};

type AthleteEditionRow = {
  goals: number | null;
  assists: number | null;
  athletes: AthleteStatLeader["athletes"];
  teams?: Team | Team[] | null;
  edition_teams?: { teams?: Team | Team[] | null } | { teams?: Team | Team[] | null }[] | null;
};

type AthleteStintRow = {
  athlete_id: string;
  is_current: boolean | null;
  teams: Team | Team[] | null;
};

function normalizeTeamValue(value: unknown): Team | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as Team) : null;
  }
  return typeof value === "object" ? (value as Team) : null;
}

function teamFromEditionStatsRow(row: AthleteEditionRow): Team | null {
  const direct = normalizeTeamValue(row.teams);
  if (direct) return direct;
  const editionTeam = row.edition_teams;
  if (Array.isArray(editionTeam)) {
    for (const entry of editionTeam) {
      const team = normalizeTeamValue(entry?.teams);
      if (team) return team;
    }
    return null;
  }
  return normalizeTeamValue(editionTeam?.teams);
}

async function getFallbackTeamsForAthletes(
  athleteIds: string[],
  editionIds: string[] = [],
): Promise<Map<string, Team>> {
  if (!athleteIds.length) return new Map<string, Team>();

  const supabase = getSupabase();
  const map = new Map<string, Team>();

  if (editionIds.length) {
    const { data: editionRows, error: editionError } = await supabase
      .from("athlete_edition_stats")
      .select(
        "athlete_id, edition_teams(team_id, teams(id, full_name, short_name, abbreviation, logo_url, primary_color))",
      )
      .in("edition_id", editionIds)
      .in("athlete_id", athleteIds);

    if (editionError) {
      console.error(
        "[getFallbackTeamsForAthletes] edition",
        editionError.message,
      );
    } else {
      for (const row of editionRows ?? []) {
        const athleteId = row.athlete_id as string | undefined;
        if (!athleteId || map.has(athleteId)) continue;
        const team = teamFromEditionStatsRow(row as AthleteEditionRow);
        if (team) map.set(athleteId, team);
      }
    }
  }

  const missingIds = athleteIds.filter((id) => !map.has(id));
  if (!missingIds.length) return map;

  const { data, error } = await supabase
    .from("athlete_team_stints")
    .select(
      "athlete_id, is_current, teams(id, full_name, short_name, abbreviation, logo_url, primary_color)",
    )
    .in("athlete_id", missingIds)
    .order("is_current", { ascending: false });

  if (error) {
    console.error("[getFallbackTeamsForAthletes] stints", error.message);
    return map;
  }

  for (const row of (data ?? []) as AthleteStintRow[]) {
    if (map.has(row.athlete_id)) continue;
    const team = normalizeTeamValue(row.teams);
    if (team) map.set(row.athlete_id, team);
  }
  return map;
}

/** Equipe atual do atleta (stint com is_current = true). */
async function getCurrentTeamsForAthletes(
  athleteIds: string[],
): Promise<Map<string, Team>> {
  if (!athleteIds.length) return new Map<string, Team>();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("athlete_team_stints")
    .select(
      "athlete_id, is_current, teams(id, full_name, short_name, abbreviation, logo_url, primary_color)",
    )
    .in("athlete_id", athleteIds)
    .eq("is_current", true);

  if (error) {
    console.error("[getCurrentTeamsForAthletes]", error.message);
    return new Map<string, Team>();
  }

  const map = new Map<string, Team>();
  for (const row of (data ?? []) as AthleteStintRow[]) {
    if (!row.athlete_id || map.has(row.athlete_id)) continue;
    const team = normalizeTeamValue(row.teams);
    if (team) map.set(row.athlete_id, team);
  }
  return map;
}

async function applyCurrentTeamToOrgLeaders(leaders: {
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
}): Promise<{
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
}> {
  const athleteIds = [
    leaders.topScorer?.athletes?.id,
    leaders.topAssister?.athletes?.id,
  ].filter((id): id is string => Boolean(id));

  const currentTeams = await getCurrentTeamsForAthletes(athleteIds);

  const withCurrentTeam = (
    leader: AthleteStatLeader | null,
  ): AthleteStatLeader | null => {
    if (!leader?.athletes?.id) return leader;
    const team = currentTeams.get(leader.athletes.id);
    if (!team) return leader;
    return { ...leader, teams: team };
  };

  return {
    topScorer: withCurrentTeam(leaders.topScorer),
    topAssister: withCurrentTeam(leaders.topAssister),
  };
}

function toAthleteLeader(
  agg: AggregatedAthlete,
): AthleteStatLeader | null {
  if (!agg.athletes) return null;
  return {
    goals: agg.goals,
    assists: agg.assists,
    athletes: agg.athletes,
    teams: agg.teams,
  };
}

async function getEditionIdsForCompetition(
  competitionId: string,
): Promise<string[]> {
  const supabase = getSupabase();

  const { data: current, error: currentError } = await supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("is_current", true);

  if (currentError) {
    console.error("[getEditionIdsForCompetition]", currentError.message);
    return [];
  }

  if (current?.length) {
    return current.map((e) => e.id);
  }

  const { data: all, error: allError } = await supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId);

  if (allError) {
    console.error("[getEditionIdsForCompetition] fallback", allError.message);
    return [];
  }

  return (all ?? []).map((e) => e.id);
}

async function getEditionIdsForOrg(orgId: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competition_editions")
    .select("id, competitions!inner(organization_id)")
    .eq("competitions.organization_id", orgId);

  if (error) {
    console.error("[getEditionIdsForOrg]", error.message);
    return [];
  }

  return (data ?? []).map((e) => e.id);
}

async function aggregateAthleteLeaders(
  editionIds: string[],
): Promise<{
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
}> {
  if (!editionIds.length) {
    return { topScorer: null, topAssister: null };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("athlete_edition_stats")
    .select(ATHLETE_SELECT)
    .in("edition_id", editionIds);

  if (error) {
    console.error("[aggregateAthleteLeaders]", error.message);
    return { topScorer: null, topAssister: null };
  }

  const byAthlete = new Map<string, AggregatedAthlete>();

  for (const row of (data ?? []) as AthleteEditionRow[]) {
    const athlete = row.athletes as AthleteStatLeader["athletes"];
    const athleteId = athlete?.id;
    if (!athleteId) continue;

    const goals = (row.goals as number | null) ?? 0;
    const assists = (row.assists as number | null) ?? 0;
    const prev = byAthlete.get(athleteId);

    const teamFromRow = teamFromEditionStatsRow(row);
    byAthlete.set(athleteId, {
      goals: (prev?.goals ?? 0) + goals,
      assists: (prev?.assists ?? 0) + assists,
      athletes: athlete,
      teams: teamFromRow ?? prev?.teams ?? null,
    });
  }

  const aggregated = [...byAthlete.values()];
  const topScorer = [...aggregated].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...aggregated].sort((a, b) => b.assists - a.assists)[0];
  const topScorerLeader =
    topScorer && topScorer.goals > 0 ? toAthleteLeader(topScorer) : null;
  const topAssisterLeader =
    topAssister && topAssister.assists > 0 ? toAthleteLeader(topAssister) : null;

  const fallbackIds = [
    topScorerLeader?.athletes?.id,
    topAssisterLeader?.athletes?.id,
  ].filter((id): id is string => Boolean(id));
  const fallbackTeams = await getFallbackTeamsForAthletes(
    fallbackIds,
    editionIds,
  );

  const withFallbackTeam = (
    leader: AthleteStatLeader | null,
  ): AthleteStatLeader | null => {
    if (!leader?.athletes?.id || leader.teams) return leader;
    const team = fallbackTeams.get(leader.athletes.id);
    if (!team) return leader;
    return { ...leader, teams: team };
  };

  return {
    topScorer: withFallbackTeam(topScorerLeader),
    topAssister: withFallbackTeam(topAssisterLeader),
  };
}

async function getOrgAthleteLeaders(
  orgId: string,
  editionIds: string[],
): Promise<{
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
}> {
  const supabase = getSupabase();

  const [scorerRes, assisterRes] = await Promise.all([
    supabase
      .from("athlete_career_stats")
      .select(CAREER_SELECT)
      .eq("organization_id", orgId)
      .order("total_goals", { ascending: false })
      .gt("total_goals", 0)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("athlete_career_stats")
      .select(CAREER_SELECT)
      .eq("organization_id", orgId)
      .order("total_assists", { ascending: false })
      .gt("total_assists", 0)
      .limit(1)
      .maybeSingle(),
  ]);

  const careerFailed =
    scorerRes.error ||
    assisterRes.error ||
    (!scorerRes.data?.athletes && !assisterRes.data?.athletes);

  if (careerFailed) {
    if (scorerRes.error) {
      console.error("[getOrgAthleteLeaders] scorer", scorerRes.error.message);
    }
    if (assisterRes.error) {
      console.error("[getOrgAthleteLeaders] assister", assisterRes.error.message);
    }
    const aggregated = await aggregateAthleteLeaders(editionIds);
    return applyCurrentTeamToOrgLeaders(aggregated);
  }

  const mapRow = (row: CareerStatsRow | null): AthleteStatLeader | null => {
    if (!row?.athletes) return null;
    return {
      goals: row.total_goals ?? 0,
      assists: row.total_assists ?? 0,
      athletes: row.athletes,
      teams: null,
    };
  };

  const scorerRow = scorerRes.data as CareerStatsRow | null;
  const assisterRow = assisterRes.data as CareerStatsRow | null;

  return applyCurrentTeamToOrgLeaders({
    topScorer: mapRow(scorerRow),
    topAssister: mapRow(assisterRow),
  });
}

function normalizeTeamLeaderRow(
  teams: Team | Team[] | null | undefined,
): Team | null {
  return normalizeTeamValue(teams);
}

/** Escopo "Todas": maior total_titles em team_career_stats. */
async function getTopTeamByTitlesForOrg(
  orgId: string,
  gender: string | null,
): Promise<TeamStatLeader | null> {
  const supabase = getSupabase();

  let query = supabase
    .from("team_career_stats")
    .select(`total_titles, ${TEAM_CAREER_SELECT}`)
    .eq("organization_id", orgId)
    .gt("total_titles", 0)
    .order("total_titles", { ascending: false })
    .limit(1);

  if (gender) {
    query = query.eq("teams.gender", gender);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("[getTopTeamByTitlesForOrg]", error.message);
    return null;
  }

  if (!data?.teams) return null;

  const team = normalizeTeamLeaderRow(data.teams as Team | Team[]);
  const titles = (data.total_titles as number) ?? 0;
  if (!team || titles <= 0) return null;

  return {
    titles,
    wins: null,
    points: null,
    teams: team,
  };
}

async function getHighlightsForCompetition(
  competitionId: string,
  editionIds: string[],
  gender: string | null,
): Promise<HomeHighlights> {
  const [{ topScorer, topAssister }, topTeamByTitles] = await Promise.all([
    aggregateAthleteLeaders(editionIds),
    getTopTeamLeaderForCompetition(competitionId, gender),
  ]);

  return { topScorer, topAssister, topTeamByTitles };
}

export async function getHomeHighlightsBundle(
  orgId: string,
  competitions: Competition[],
): Promise<HomeHighlightsBundle> {
  const orgEditionIds = await getEditionIdsForOrg(orgId);

  const [organization, ...competitionHighlights] = await Promise.all([
    (async (): Promise<HomeHighlights> => {
      const [athletes, topTeamByTitles] = await Promise.all([
        getOrgAthleteLeaders(orgId, orgEditionIds),
        getTopTeamByTitlesForOrg(orgId, null),
      ]);
      return {
        topScorer: athletes.topScorer,
        topAssister: athletes.topAssister,
        topTeamByTitles,
      };
    })(),
    ...competitions.map(async (comp) => {
      const editionIds = await getEditionIdsForCompetition(comp.id);
      const highlights = await getHighlightsForCompetition(
        comp.id,
        editionIds,
        comp.gender,
      );
      return { competitionId: comp.id, highlights };
    }),
  ]);

  const byCompetition: Record<string, HomeHighlights> = {};
  for (const item of competitionHighlights) {
    byCompetition[item.competitionId] = item.highlights;
  }

  return { organization, byCompetition };
}
