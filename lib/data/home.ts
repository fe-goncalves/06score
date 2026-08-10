import { enrichMatchupsWithTeams, fetchEditionTeamsForEdition, getPhaseIdsForOrg } from "@/lib/data/shared";
import { getLatestTotwForEdition } from "@/lib/data/totw";
import { computeHomePhaseStandings } from "@/lib/home/phaseStandings";
import { sortNewsByPublishedAt } from "@/lib/home/news";
import { getSupabase } from "@/lib/supabase";
import { filterHomeTeams } from "@/lib/home/teams";
import type {
  Competition,
  HomeEditionEntry,
  HomeMatches,
  HomeMotw,
  HomeTotw,
  Match,
  MatchRound,
  Matchup,
  Phase,
  HomeEditionData,
  HomeNewsArticle,
  Season,
  StandingRow,
  TableMarker,
  Team,
  TeamEditionStats,
  TeamStatLeader,
} from "@/lib/types";
import { isMatchUpcoming, MATCH_SELECT_BASE, statsToStandings } from "@/lib/utils";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function editionSeasonName(
  seasons: Season | Season[] | null | undefined,
): string | null {
  if (!seasons) return null;
  const season = Array.isArray(seasons) ? seasons[0] : seasons;
  return season?.name ?? null;
}

function sortHomeEditions(entries: HomeEditionEntry[]): HomeEditionEntry[] {
  return [...entries].sort(
    (a, b) =>
      (b.competitions?.home_priority ?? 0) -
      (a.competitions?.home_priority ?? 0),
  );
}

export async function getHomeEditions(
  orgId: string,
): Promise<HomeEditionEntry[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("competition_editions")
    .select(
      `
      id, status, show_in_home,
      seasons(name),
      competitions!inner (
        id, full_name, short_name, logo_url,
        organization_id, gender, primary_color, home_priority
      )
    `,
    )
    .eq("status", "ongoing")
    .eq("show_in_home", true)
    .eq("competitions.organization_id", orgId);

  if (error) {
    console.error("[getHomeEditions]", error.message);
    return [];
  }

  type RawRow = Omit<HomeEditionEntry, "competitions"> & {
    competitions: HomeEditionEntry["competitions"] | HomeEditionEntry["competitions"][];
  };

  const rows = (data ?? []) as RawRow[];
  const normalized: HomeEditionEntry[] = [];

  for (const row of rows) {
    const comp = unwrapJoin(row.competitions);
    if (!comp) continue;
    normalized.push({
      id: row.id,
      status: row.status,
      show_in_home: row.show_in_home,
      seasons: row.seasons,
      competitions: comp,
    });
  }

  return sortHomeEditions(normalized);
}

export function homeEditionsToCompetitions(
  entries: HomeEditionEntry[],
): Competition[] {
  return entries.map((entry) => {
    const comp = entry.competitions;
    return {
      id: comp.id,
      full_name: comp.full_name,
      short_name: comp.short_name,
      logo_url: comp.logo_url,
      primary_color: comp.primary_color,
      gender: comp.gender,
      home_priority: comp.home_priority,
      sport_slug: null,
      competition_editions: [
        {
          id: entry.id,
          status: entry.status,
          is_current: true,
          show_in_home: entry.show_in_home,
          seasons: entry.seasons,
        },
      ],
    };
  });
}

async function getPhaseIdsForEditions(
  editionIds: string[],
): Promise<string[]> {
  if (!editionIds.length) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  if (error) {
    console.error("[getPhaseIdsForEditions]", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.id as string);
}

export async function getHomeStripMatches(
  orgId: string,
  pastDays: number,
  futureDays: number,
): Promise<Match[]> {
  const phaseIds = await getPhaseIdsForOrganization(orgId);
  if (!phaseIds.length) return [];

  const today = new Date();
  const fromDate = formatDate(addDays(today, -pastDays));
  const toDate = formatDate(addDays(today, futureDays));

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select(MATCH_SELECT_BASE)
    .in("phase_id", phaseIds)
    .not("match_date", "is", null)
    .gte("match_date", fromDate)
    .lte("match_date", toDate)
    .order("match_date", { ascending: true })
    .order("match_time", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getHomeStripMatches]", error.message);
    return [];
  }

  return (data as Match[] | null) ?? [];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

async function getPhaseIdsForOrganization(orgId: string): Promise<string[]> {
  const supabase = getSupabase();

  const { data: competitions, error: compError } = await supabase
    .from("competitions")
    .select("id")
    .eq("organization_id", orgId);

  if (compError || !competitions?.length) {
    if (compError) {
      console.error("[getPhaseIdsForOrganization] competitions", compError.message);
    }
    return [];
  }

  const competitionIds = competitions.map((row) => row.id as string);

  const { data: editions, error: editionError } = await supabase
    .from("competition_editions")
    .select("id")
    .in("competition_id", competitionIds);

  if (editionError || !editions?.length) {
    if (editionError) {
      console.error("[getPhaseIdsForOrganization] editions", editionError.message);
    }
    return [];
  }

  const editionIds = editions.map((row) => row.id as string);

  const { data: phases, error: phaseError } = await supabase
    .from("phases")
    .select("id")
    .in("edition_id", editionIds);

  if (phaseError) {
    console.error("[getPhaseIdsForOrganization] phases", phaseError.message);
    return [];
  }

  return (phases ?? []).map((row) => row.id as string);
}

/** @deprecated Use getHomeStripMatches with days from getPublicSiteHomeConfig */
export async function getRecentAndUpcomingMatches(
  orgId: string,
  editionIds: string[],
): Promise<HomeMatches> {
  if (!editionIds.length) return { recent: [], upcoming: [] };

  const phaseIds = await getPhaseIdsForEditions(editionIds);
  if (!phaseIds.length) return { recent: [], upcoming: [] };

  const supabase = getSupabase();
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAhead = new Date(today);
  sevenDaysAhead.setDate(today.getDate() + 7);

  const fromRecent = formatDate(sevenDaysAgo);
  const toRecent = formatDate(today);
  const fromUpcoming = formatDate(today);
  const toUpcoming = formatDate(sevenDaysAhead);

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

  const upcomingRaw = (upcomingResult.data as Match[] | null) ?? [];

  return {
    recent: (recentResult.data as Match[] | null) ?? [],
    upcoming: upcomingRaw.filter((m) => isMatchUpcoming(m)),
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
    .limit(15);

  if (error) {
    console.error("[getFeaturedNews]", error.message);
    return [];
  }

  const articles = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cover_url: row.cover_url,
    published_at: row.published_at,
    competition_ids: (row.news_article_competitions ?? []).map(
      (j: { competition_id: string }) => j.competition_id,
    ),
  }));

  return sortNewsByPublishedAt(articles);
}

function competitionLabel(comp: Competition): string {
  return comp.short_name ?? comp.full_name;
}

function currentEditionName(comp: Competition): string | null {
  const editions = comp.competition_editions;
  if (!editions?.length) return null;
  const list = Array.isArray(editions) ? editions : [editions];
  const current = list.find((e) => e.is_current) ?? list[0];
  const seasons = current?.seasons;
  return Array.isArray(seasons)
    ? (seasons[0]?.name ?? null)
    : (seasons?.name ?? null);
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
    .eq("is_virtual", false)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[getOrgTeams]", error.message);
    return [];
  }

  return (data as Team[] | null) ?? [];
}

export async function getHomeEditionsBundle(
  homeEditions: HomeEditionEntry[],
): Promise<HomeEditionData[]> {
  const bundle = await Promise.all(
    homeEditions.map(async (entry) => {
      const comp = entry.competitions;
      const editionId = entry.id;
      const currentPhase = await getCurrentPhaseMeta(editionId);

      const [phaseMatches, phaseMatchups, phaseRounds, teamEditionStats, tableMarkers] =
        await Promise.all([
          getCurrentPhaseMatches(currentPhase?.id ?? null),
          getCurrentPhaseMatchups(currentPhase),
          getCurrentPhaseRounds(currentPhase),
          getTeamEditionStatsRaw(editionId),
          getPhaseTableMarkers(currentPhase?.id ?? null),
        ]);

      const currentPhaseStandings = currentPhase
        ? computeHomePhaseStandings(
            currentPhase,
            phaseMatches,
            teamEditionStats,
          )
        : [];

      return {
        editionId,
        competitionId: comp.id,
        competitionName: comp.short_name ?? comp.full_name,
        competitionLogoUrl: comp.logo_url,
        competitionColor: comp.primary_color,
        homePriority: comp.home_priority ?? 0,
        editionName: editionSeasonName(entry.seasons),
        currentPhaseStandings,
        tableMarkers,
        currentPhaseType: currentPhase?.phase_type ?? null,
        currentPhaseId: currentPhase?.id ?? null,
        currentPhaseName:
          currentPhase?.custom_label ?? currentPhase?.full_name ?? null,
        phaseMatches,
        phaseMatchups,
        phaseRounds,
      } satisfies HomeEditionData;
    }),
  );

  return bundle.sort((a, b) => b.homePriority - a.homePriority);
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
      yellow_cards,
      red_cards,
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
  const rows = await fetchEditionTeamsForEdition(editionId);
  const teams = rows
    .map((row) => row.teams)
    .filter((team): team is Team => team != null);
  return filterHomeTeams(teams);
}

async function getTeamEditionStatsRaw(
  editionId: string,
): Promise<TeamEditionStats[]> {
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
      yellow_cards,
      red_cards,
      teams(id, full_name, short_name, abbreviation, logo_url, primary_color)
    `,
    )
    .eq("edition_id", editionId);

  if (error) {
    console.error("[getTeamEditionStatsRaw]", error.message);
    return [];
  }

  return (data as unknown as TeamEditionStats[]) ?? [];
}

async function getPhaseTableMarkers(
  phaseId: string | null,
): Promise<TableMarker[]> {
  if (!phaseId) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("table_markers")
    .select(
      "id, phase_id, description, color_hex, show_background, position_from, position_to, display_order",
    )
    .eq("phase_id", phaseId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getPhaseTableMarkers]", error.message);
    return [];
  }

  return (data as TableMarker[] | null) ?? [];
}

async function getCurrentPhaseMeta(
  editionId: string,
): Promise<Phase | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("phases")
    .select(
      "id, edition_id, full_name, custom_label, phase_type, display_order, is_current",
    )
    .eq("edition_id", editionId)
    .order("is_current", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return (data as Phase | null) ?? null;
}

async function getCurrentPhaseMatches(phaseId: string | null): Promise<Match[]> {
  if (!phaseId) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select(MATCH_SELECT_BASE)
    .eq("phase_id", phaseId)
    .order("match_date", { ascending: false })
    .order("match_time", { ascending: false });

  if (error) return [];
  return (data as Match[] | null) ?? [];
}

async function getCurrentPhaseMatchups(
  phase: Phase | null,
): Promise<Matchup[]> {
  if (!phase?.id) return [];
  if (phase.phase_type !== "knockout" && phase.phase_type !== "conference") {
    return [];
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matchups")
    .select(
      "id, phase_id, conference_id, round_id, round_label, display_order, is_completed, team_a_id, team_b_id, aggregate_winner_id",
    )
    .eq("phase_id", phase.id)
    .order("display_order", { ascending: true });

  if (error) return [];
  return enrichMatchupsWithTeams((data as Matchup[] | null) ?? []);
}

async function getCurrentPhaseRounds(
  phase: Phase | null,
): Promise<MatchRound[]> {
  if (!phase?.id) return [];
  if (phase.phase_type !== "knockout" && phase.phase_type !== "conference") {
    return [];
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rounds")
    .select(
      "id, phase_id, name, custom_label, display_order, is_current, legs, aggregate_score",
    )
    .eq("phase_id", phase.id)
    .order("display_order", { ascending: true });

  if (error) {
    const { data: fallback } = await supabase
      .from("rounds")
      .select("id, phase_id, name, custom_label, display_order")
      .eq("phase_id", phase.id)
      .order("display_order", { ascending: true });
    return (fallback as MatchRound[] | null) ?? [];
  }

  return (data as MatchRound[] | null) ?? [];
}

async function getLatestMotwForEdition(
  editionId: string,
): Promise<HomeMotw | null> {
  const supabase = getSupabase();
  const activeEditionId = editionId;

  const { data: motwSquad } = await supabase
    .from("selection_squads")
    .select(
      `
      id,
      round_id,
      created_at,
      rounds ( name, custom_label ),
      selection_squad_members (
        athlete_id,
        team_id,
        athletes ( id, full_name, surname, photo_url ),
        teams ( id, full_name, abbreviation, logo_url )
      )
    `,
    )
    .eq("squad_type", "motw")
    .eq("edition_id", activeEditionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // O MOTW tem exatamente 1 membro — o atleta escolhido
  const motwMember = motwSquad?.selection_squad_members?.[0] ?? null;

  const motw = motwMember?.athlete_id
    ? {
        athlete: motwMember.athletes,
        team: motwMember.teams,
        round: motwSquad?.rounds,
      }
    : null;

  if (!motw?.athlete?.id) return null;

  const round = Array.isArray(motw.round) ? motw.round[0] : motw.round;
  return {
    athlete_id: motw.athlete.id,
    team_id: motwMember?.team_id ?? null,
    round_label: round?.custom_label ?? round?.name ?? null,
    athlete_name: motw.athlete.full_name,
    athlete_surname: motw.athlete.surname ?? null,
    athlete_photo_url: motw.athlete.photo_url ?? null,
    team_name: motw.team?.abbreviation ?? motw.team?.full_name ?? null,
    team_logo_url: motw.team?.logo_url ?? null,
  };
}

function unwrapTeam(
  teams: Team | Team[] | null | undefined,
): Team | null {
  if (!teams) return null;
  return Array.isArray(teams) ? (teams[0] ?? null) : teams;
}

type EditionAwardChampionRow = {
  winning_team_id: string;
  teams: Team | Team[] | null;
};

type TeamEditionWinsRow = {
  team_id: string;
  wins: number | null;
  teams: Team | Team[] | null;
};

/**
 * Card "Títulos" com competição selecionada:
 * 1) edition_awards (champion) agrupado por equipe
 * 2) fallback: maior vitórias em team_edition_stats
 */
export async function getTopTeamLeaderForCompetition(
  selectedCompetitionId: string,
  gender: string | null,
): Promise<TeamStatLeader | null> {
  const supabase = getSupabase();

  let titlesQuery = supabase
    .from("edition_awards")
    .select(
      `
      winning_team_id,
      teams!edition_awards_winning_team_id_fkey (
        id, full_name, short_name, abbreviation, logo_url, primary_color, gender
      ),
      competition_editions!inner (
        competition_id
      )
    `,
    )
    .eq("award_type", "champion")
    .eq("competition_editions.competition_id", selectedCompetitionId)
    .not("winning_team_id", "is", null);

  if (gender) {
    titlesQuery = titlesQuery.eq("teams.gender", gender);
  }

  const { data: titlesData, error: titlesError } = await titlesQuery;

  if (titlesError) {
    console.error("[getTopTeamLeaderForCompetition] titles", titlesError.message);
  }

  const titleRows = (titlesData ?? []) as EditionAwardChampionRow[];

  if (titleRows.length > 0) {
    const titleCounts = new Map<string, { team: Team; count: number }>();

    for (const row of titleRows) {
      if (!row.winning_team_id) continue;
      const team = unwrapTeam(row.teams);
      if (!team) continue;
      const prev = titleCounts.get(row.winning_team_id);
      titleCounts.set(row.winning_team_id, {
        team,
        count: (prev?.count ?? 0) + 1,
      });
    }

    const best = [...titleCounts.values()].sort((a, b) => b.count - a.count)[0];
    if (best?.count) {
      return {
        titles: best.count,
        wins: null,
        points: null,
        teams: best.team,
        mode: "titles",
        label: "Títulos na competição",
      };
    }
  }

  let winsQuery = supabase
    .from("team_edition_stats")
    .select(
      `
      team_id, wins,
      teams ( id, full_name, short_name, abbreviation, logo_url, primary_color, gender ),
      competition_editions!inner ( competition_id )
    `,
    )
    .eq("competition_editions.competition_id", selectedCompetitionId)
    .order("wins", { ascending: false })
    .limit(1);

  if (gender) {
    winsQuery = winsQuery.eq("teams.gender", gender);
  }

  const { data: winsData, error: winsError } = await winsQuery.maybeSingle();

  if (winsError) {
    console.error("[getTopTeamLeaderForCompetition] wins", winsError.message);
    return null;
  }

  const winsRow = winsData as TeamEditionWinsRow | null;
  const team = unwrapTeam(winsRow?.teams);
  const wins = winsRow?.wins ?? 0;

  if (!team || wins <= 0) return null;

  return {
    titles: null,
    wins,
    points: null,
    teams: team,
    mode: "wins",
    label: "Mais vitórias na competição",
  };
}
