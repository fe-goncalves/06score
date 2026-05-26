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
  "goals, assists, athletes(id, full_name, surname, photo_url), teams(full_name, short_name, logo_url, primary_color)";

const CAREER_SELECT =
  "total_goals, total_assists, athletes(id, full_name, surname, photo_url, athlete_team_stints(is_current, teams(full_name, short_name, logo_url, primary_color)))";

type CareerStatsRow = {
  total_goals: number | null;
  total_assists: number | null;
  athletes: AthleteStatLeader["athletes"] & {
    athlete_team_stints?: { is_current: boolean; teams: Team | null }[];
  };
};

type AggregatedAthlete = {
  goals: number;
  assists: number;
  athletes: AthleteStatLeader["athletes"];
  teams: AthleteStatLeader["teams"];
};

function pickTeamFromCareerRow(row: {
  athletes?: {
    athlete_team_stints?: { is_current: boolean; teams: Team | null }[];
  } | null;
}): Team | null {
  const stints = row.athletes?.athlete_team_stints ?? [];
  const current = stints.find((s) => s.is_current);
  return current?.teams ?? stints[0]?.teams ?? null;
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
  const { data, error } = await supabase
    .from("competition_editions")
    .select("id")
    .eq("competition_id", competitionId);

  if (error) {
    console.error("[getEditionIdsForCompetition]", error.message);
    return [];
  }

  return (data ?? []).map((e) => e.id);
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

  for (const row of data ?? []) {
    const athlete = row.athletes as AthleteStatLeader["athletes"];
    const athleteId = athlete?.id;
    if (!athleteId) continue;

    const goals = (row.goals as number | null) ?? 0;
    const assists = (row.assists as number | null) ?? 0;
    const prev = byAthlete.get(athleteId);

    byAthlete.set(athleteId, {
      goals: (prev?.goals ?? 0) + goals,
      assists: (prev?.assists ?? 0) + assists,
      athletes: athlete,
      teams: (row.teams as Team | null) ?? prev?.teams ?? null,
    });
  }

  const aggregated = [...byAthlete.values()];
  const topScorer = [...aggregated].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...aggregated].sort((a, b) => b.assists - a.assists)[0];

  return {
    topScorer:
      topScorer && topScorer.goals > 0 ? toAthleteLeader(topScorer) : null,
    topAssister:
      topAssister && topAssister.assists > 0
        ? toAthleteLeader(topAssister)
        : null,
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
    return aggregateAthleteLeaders(editionIds);
  }

  const mapRow = (row: CareerStatsRow | null): AthleteStatLeader | null => {
    if (!row?.athletes) return null;
    return {
      goals: row.total_goals ?? 0,
      assists: row.total_assists ?? 0,
      athletes: row.athletes,
      teams: pickTeamFromCareerRow(row),
    };
  };

  const scorerRow = scorerRes.data as CareerStatsRow | null;
  const assisterRow = assisterRes.data as CareerStatsRow | null;

  return {
    topScorer: mapRow(scorerRow),
    topAssister: mapRow(assisterRow),
  };
}

async function getTopTeamByTitlesForEditions(
  editionIds: string[],
  options?: { includeCurrent?: boolean },
): Promise<TeamStatLeader | null> {
  if (!editionIds.length) return null;

  const supabase = getSupabase();

  const { data: editions, error: edError } = await supabase
    .from("competition_editions")
    .select("id, is_current")
    .in("id", editionIds);

  if (edError) {
    console.error("[getTopTeamByTitlesForEditions]", edError.message);
    return null;
  }

  const championEditionIds = (editions ?? [])
    .filter((e) => options?.includeCurrent || !e.is_current)
    .map((e) => e.id);

  const titleCounts = new Map<string, { team: Team; count: number }>();

  if (championEditionIds.length > 0) {
    await Promise.all(
      championEditionIds.map(async (editionId) => {
        const { data, error } = await supabase
          .from("team_edition_stats")
          .select(
            "team_id, teams(id, full_name, short_name, abbreviation, logo_url, primary_color)",
          )
          .eq("edition_id", editionId)
          .order("points", { ascending: false })
          .order("goals_scored", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data?.team_id || !data.teams) return;

        const team = data.teams as Team;
        const prev = titleCounts.get(data.team_id);
        titleCounts.set(data.team_id, {
          team,
          count: (prev?.count ?? 0) + 1,
        });
      }),
    );
  }

  if (titleCounts.size > 0) {
    const best = [...titleCounts.values()].sort((a, b) => b.count - a.count)[0];
    return {
      titles: best.count,
      wins: null,
      points: null,
      teams: best.team,
    };
  }

  const winCounts = new Map<string, { team: Team; wins: number }>();

  const { data: statsRows, error: statsError } = await supabase
    .from("team_edition_stats")
    .select(
      "team_id, wins, teams(id, full_name, short_name, abbreviation, logo_url, primary_color)",
    )
    .in("edition_id", editionIds);

  if (statsError) {
    console.error("[getTopTeamByTitlesForEditions] wins", statsError.message);
    return null;
  }

  for (const row of statsRows ?? []) {
    if (!row.team_id || !row.teams) continue;
    const team = row.teams as Team;
    const wins = (row.wins as number) ?? 0;
    const prev = winCounts.get(row.team_id);
    winCounts.set(row.team_id, {
      team,
      wins: (prev?.wins ?? 0) + wins,
    });
  }

  const bestWins = [...winCounts.values()].sort((a, b) => b.wins - a.wins)[0];
  if (!bestWins?.wins) return null;

  return {
    titles: bestWins.wins,
    wins: bestWins.wins,
    points: null,
    teams: bestWins.team,
  };
}

async function getHighlightsForEditionScope(
  editionIds: string[],
): Promise<HomeHighlights> {
  const [{ topScorer, topAssister }, topTeamByTitles] = await Promise.all([
    aggregateAthleteLeaders(editionIds),
    getTopTeamByTitlesForEditions(editionIds),
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
        getTopTeamByTitlesForEditions(orgEditionIds),
      ]);
      return {
        topScorer: athletes.topScorer,
        topAssister: athletes.topAssister,
        topTeamByTitles,
      };
    })(),
    ...competitions.map(async (comp) => {
      const editionIds = await getEditionIdsForCompetition(comp.id);
      const highlights = await getHighlightsForEditionScope(editionIds);
      return { competitionId: comp.id, highlights };
    }),
  ]);

  const byCompetition: Record<string, HomeHighlights> = {};
  for (const item of competitionHighlights) {
    byCompetition[item.competitionId] = item.highlights;
  }

  return { organization, byCompetition };
}
