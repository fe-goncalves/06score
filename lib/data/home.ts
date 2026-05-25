import { getPhaseIdsForOrg } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  AthleteStatLeader,
  Competition,
  HomeMatches,
  Match,
  HomeEditionData,
  HomeNewsArticle,
  StandingRow,
  Team,
  TeamEditionStats,
} from "@/lib/types";
import { MATCH_SELECT_BASE, statsToStandings } from "@/lib/utils";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getRecentAndUpcomingMatches(
  orgId: string,
): Promise<HomeMatches> {
  const phaseIds = await getPhaseIdsForOrg(orgId);
  if (!phaseIds.length) return { recent: [], upcoming: [] };

  const supabase = getSupabase();
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const thirtyDaysAhead = new Date(today);
  thirtyDaysAhead.setDate(today.getDate() + 30);

  const fromRecent = formatDate(sevenDaysAgo);
  const toRecent = formatDate(today);
  const fromUpcoming = formatDate(today);
  const toUpcoming = formatDate(thirtyDaysAhead);

  const [recentResult, upcomingResult] = await Promise.all([
    supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("phase_id", phaseIds)
      .gte("match_date", fromRecent)
      .lte("match_date", toRecent)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false }),
    supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("phase_id", phaseIds)
      .gte("match_date", fromUpcoming)
      .lte("match_date", toUpcoming)
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true }),
  ]);

  if (recentResult.error) {
    console.error("[getRecentMatches]", recentResult.error.message);
  }
  if (upcomingResult.error) {
    console.error("[getUpcomingMatches]", upcomingResult.error.message);
  }

  return {
    recent: (recentResult.data as Match[] | null) ?? [],
    upcoming: (upcomingResult.data as Match[] | null) ?? [],
  };
}

export async function getActiveCompetitions(
  orgId: string,
): Promise<Competition[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("competitions")
    .select(
      `
      id,
      full_name,
      short_name,
      logo_url,
      primary_color,
      sport_slug,
      gender,
      competition_editions!inner(
        id,
        status,
        is_current,
        seasons(name)
      )
    `,
    )
    .eq("organization_id", orgId)
    .eq("competition_editions.is_current", true);

  if (error) {
    console.error("[getActiveCompetitions]", error.message);
    return [];
  }

  return (data as Competition[] | null) ?? [];
}

export async function getFeaturedNews(orgId: string): Promise<HomeNewsArticle[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select(
      "id, title, subtitle, cover_url, published_at, news_article_competitions(competition_id)",
    )
    .eq("organization_id", orgId)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[getFeaturedNews]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cover_url: row.cover_url,
    published_at: row.published_at,
    competition_ids: (row.news_article_competitions ?? []).map(
      (j: { competition_id: string }) => j.competition_id,
    ),
  }));
}

function competitionLabel(comp: Competition): string {
  return comp.short_name ?? comp.full_name;
}

function currentEditionId(comp: Competition): string | null {
  const editions = comp.competition_editions;
  if (!editions?.length) return null;
  const list = Array.isArray(editions) ? editions : [editions];
  const current = list.find((e) => e.is_current) ?? list[0];
  return current?.id ?? null;
}

export async function getOrgTeams(orgId: string): Promise<Team[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("teams")
    .select(
      "id, full_name, short_name, abbreviation, logo_url, primary_color",
    )
    .eq("organization_id", orgId)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[getOrgTeams]", error.message);
    return [];
  }

  return (data as Team[] | null) ?? [];
}

export async function getHomeEditionsBundle(
  competitions: Competition[],
): Promise<Record<string, HomeEditionData>> {
  const bundle: Record<string, HomeEditionData> = {};

  await Promise.all(
    competitions.map(async (comp) => {
      const editionId = currentEditionId(comp);
      if (!editionId) return;

      const [standings, teams, topScorer, topAssister, topMvp] =
        await Promise.all([
          getEditionStandings(editionId),
          getEditionTeams(editionId),
          getTopScorer(editionId),
          getTopAssister(editionId),
          getTopMotm(editionId),
        ]);

      bundle[comp.id] = {
        editionId,
        competitionId: comp.id,
        competitionName: competitionLabel(comp),
        standings,
        teams,
        topScorer,
        topAssister,
        topMvp,
      };
    }),
  );

  return bundle;
}

export async function getActiveEditionId(orgId: string): Promise<string | null> {
  const supabase = getSupabase();

  const { data: competitions, error: compError } = await supabase
    .from("competitions")
    .select("id")
    .eq("organization_id", orgId);

  if (compError || !competitions?.length) return null;

  const compIds = competitions.map((c) => c.id);

  const { data: edition, error: edError } = await supabase
    .from("competition_editions")
    .select("id")
    .in("competition_id", compIds)
    .eq("is_current", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (edError) {
    console.error("[getActiveEditionId]", edError.message);
    return null;
  }

  return edition?.id ?? null;
}

export async function getTopScorer(
  editionId: string,
): Promise<AthleteStatLeader | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("athlete_edition_stats")
    .select(
      "goals, assists, athletes(id, full_name, surname, photo_url), teams(full_name, logo_url, primary_color)",
    )
    .eq("edition_id", editionId)
    .order("goals", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getTopScorer]", error.message);
    return null;
  }

  return data as AthleteStatLeader | null;
}

export async function getTopAssister(
  editionId: string,
): Promise<AthleteStatLeader | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("athlete_edition_stats")
    .select(
      "goals, assists, athletes(id, full_name, surname, photo_url), teams(full_name, logo_url, primary_color)",
    )
    .eq("edition_id", editionId)
    .order("assists", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getTopAssister]", error.message);
    return null;
  }

  return data as AthleteStatLeader | null;
}

export async function getTopMotm(
  editionId: string,
): Promise<AthleteStatLeader | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("athlete_edition_stats")
    .select(
      "goals, assists, motm_count, athletes(id, full_name, surname, photo_url), teams(full_name, logo_url, primary_color)",
    )
    .eq("edition_id", editionId)
    .order("motm_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getTopMotm]", error.message);
    return null;
  }

  return data as AthleteStatLeader | null;
}

export async function getEditionStandings(
  editionId: string,
): Promise<StandingRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("team_edition_stats")
    .select(
      `
      edition_id,
      team_id,
      matches_played,
      wins,
      draws,
      losses,
      goals_scored,
      goals_conceded,
      points,
      teams(id, full_name, short_name, abbreviation, logo_url, primary_color)
    `,
    )
    .eq("edition_id", editionId)
    .order("points", { ascending: false })
    .order("goals_scored", { ascending: false });

  if (error) {
    console.error("[getEditionStandings]", error.message);
    return [];
  }

  return statsToStandings((data as unknown as TeamEditionStats[]) ?? []);
}

export async function getEditionTeams(editionId: string): Promise<Team[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("edition_teams")
    .select(
      "teams(id, full_name, short_name, abbreviation, logo_url, primary_color)",
    )
    .eq("edition_id", editionId)
    .eq("is_free_agent_pool", false);

  if (error) {
    console.error("[getEditionTeams]", error.message);
    return [];
  }

  const teams: Team[] = [];
  for (const row of data ?? []) {
    const raw = row.teams as Team | Team[] | null;
    const t = Array.isArray(raw) ? raw[0] : raw;
    if (t) teams.push(t);
  }
  return teams;
}
