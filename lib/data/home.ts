import { getSupabase } from "@/lib/supabase";
import type {
  AthleteStatLeader,
  Competition,
  HomeMatches,
  Match,
  NewsArticle,
} from "@/lib/types";

const MATCH_SELECT = `
  id,
  match_date,
  match_time,
  status,
  score_a,
  score_b,
  teams_a:teams!matches_team_a_id_fkey(full_name, short_name, logo_url),
  teams_b:teams!matches_team_b_id_fkey(full_name, short_name, logo_url),
  phases(
    edition_id,
    competition_editions(
      id,
      competitions(id, full_name, short_name, logo_url, organization_id)
    )
  )
`;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function getPhaseIdsForOrg(orgId: string): Promise<string[]> {
  const supabase = getSupabase();

  const { data: competitions, error: compError } = await supabase
    .from("competitions")
    .select("id")
    .eq("organization_id", orgId);

  if (compError || !competitions?.length) return [];

  const compIds = competitions.map((c) => c.id);

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
      .select(MATCH_SELECT)
      .in("phase_id", phaseIds)
      .gte("match_date", fromRecent)
      .lte("match_date", toRecent)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false }),
    supabase
      .from("matches")
      .select(MATCH_SELECT)
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

export async function getFeaturedNews(orgId: string): Promise<NewsArticle[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("news_articles")
    .select("id, title, subtitle, cover_url, published_at")
    .eq("organization_id", orgId)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("[getFeaturedNews]", error.message);
    return [];
  }

  return (data as NewsArticle[] | null) ?? [];
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
      "goals, assists, athletes(full_name, surname, photo_url), teams(full_name, logo_url)",
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
      "goals, assists, athletes(full_name, surname, photo_url), teams(full_name, logo_url)",
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
