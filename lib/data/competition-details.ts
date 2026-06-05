import { getSupabase } from "@/lib/supabase";
import type { EditionAward, Team } from "@/lib/types";

const TEAM_SELECT =
  "id, full_name, short_name, abbreviation, logo_url, primary_color";

const EDITION_AWARDS_BASE_SELECT = `
  award_type,
  athlete_id,
  staff_member_id,
  winning_team_id,
  athletes ( id, full_name, surname, photo_url ),
  staff_members ( id, full_name, surname, photo_url )
`;

async function fetchTeamsMap(teamIds: string[]): Promise<Map<string, Team>> {
  if (!teamIds.length) return new Map();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_SELECT)
    .in("id", teamIds)
    .eq("is_virtual", false);

  if (error) {
    console.error("[fetchTeamsMap]", error.message);
    return new Map();
  }

  const map = new Map<string, Team>();
  for (const team of (data as Team[] | null) ?? []) {
    if (team.id) map.set(team.id, team);
  }
  return map;
}

/** Premiações da edição — join manual em teams (evita embed ambíguo no PostgREST). */
export async function fetchEditionAwardsForHub(
  editionId: string,
): Promise<EditionAward[]> {
  const supabase = getSupabase();

  const { data: rows, error } = await supabase
    .from("edition_awards")
    .select(EDITION_AWARDS_BASE_SELECT)
    .eq("edition_id", editionId)
    .order("award_type");

  if (error) {
    console.error("[fetchEditionAwardsForHub]", error.message);
    return [];
  }

  const awards = (rows ?? []) as Omit<EditionAward, "teams">[];
  const teamIds = [
    ...new Set(
      awards
        .map((row) => row.winning_team_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const teamsMap = await fetchTeamsMap(teamIds);

  return awards.map((row) => ({
    ...row,
    teams: row.winning_team_id
      ? (teamsMap.get(row.winning_team_id) ?? null)
      : null,
  }));
}

export interface CompetitionChampionsData {
  pastChampions: Team[];
  defendingChampion: Team | null;
}

export interface EditionAthleteTotals {
  totalGoals: number;
  totalYellowCards: number;
  totalRedCards: number;
}

type ChampionAwardRow = {
  edition_id: string;
  winning_team_id: string | null;
};

async function fetchAthleteStatTotals(
  editionId: string,
): Promise<EditionAthleteTotals> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("athlete_edition_stats")
    .select("goals, yellow_cards, red_cards")
    .eq("edition_id", editionId);

  if (error) {
    console.error("[fetchAthleteStatTotals]", error.message);
    return { totalGoals: 0, totalYellowCards: 0, totalRedCards: 0 };
  }

  let totalGoals = 0;
  let totalYellowCards = 0;
  let totalRedCards = 0;

  for (const row of data ?? []) {
    totalGoals += row.goals ?? 0;
    totalYellowCards += row.yellow_cards ?? 0;
    totalRedCards += row.red_cards ?? 0;
  }

  return { totalGoals, totalYellowCards, totalRedCards };
}

function uniqueTeams(teams: Team[]): Team[] {
  const seen = new Set<string>();
  const result: Team[] = [];
  for (const team of teams) {
    const id = team.id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(team);
  }
  return result;
}

export async function fetchCompetitionChampions(
  competitionId: string,
  currentEditionId: string,
): Promise<CompetitionChampionsData> {
  const supabase = getSupabase();

  const { data: editions, error: editionsError } = await supabase
    .from("competition_editions")
    .select("id, created_at")
    .eq("competition_id", competitionId)
    .order("created_at", { ascending: false });

  if (editionsError) {
    console.error("[fetchCompetitionChampions editions]", editionsError.message);
    return { pastChampions: [], defendingChampion: null };
  }

  const orderedIds = (editions ?? []).map((e) => e.id as string);
  if (!orderedIds.length) {
    return { pastChampions: [], defendingChampion: null };
  }

  const currentIndex = orderedIds.indexOf(currentEditionId);
  const previousEditionId =
    currentIndex >= 0 && currentIndex + 1 < orderedIds.length
      ? orderedIds[currentIndex + 1]
      : null;

  const pastEditionIds =
    currentIndex >= 0
      ? orderedIds.slice(currentIndex + 1)
      : orderedIds.filter((id) => id !== currentEditionId);

  const { data: awardRows, error: awardsError } = await supabase
    .from("edition_awards")
    .select("edition_id, winning_team_id")
    .in("edition_id", orderedIds)
    .eq("award_type", "champion")
    .not("winning_team_id", "is", null);

  if (awardsError) {
    console.error("[fetchCompetitionChampions awards]", awardsError.message);
    return { pastChampions: [], defendingChampion: null };
  }

  const rows = (awardRows ?? []) as ChampionAwardRow[];
  const teamIds = [
    ...new Set(
      rows
        .map((row) => row.winning_team_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const teamsMap = await fetchTeamsMap(teamIds);

  const pastTeams: Team[] = [];
  let defendingChampion: Team | null = null;

  for (const row of rows) {
    const team = row.winning_team_id
      ? teamsMap.get(row.winning_team_id)
      : undefined;
    if (!team?.id) continue;

    if (previousEditionId && row.edition_id === previousEditionId) {
      defendingChampion = team;
    }

    if (pastEditionIds.includes(row.edition_id)) {
      pastTeams.push(team);
    }
  }

  return {
    pastChampions: uniqueTeams(pastTeams),
    defendingChampion,
  };
}

export async function fetchEditionDetailsExtras(
  competitionId: string,
  editionId: string,
): Promise<EditionAthleteTotals & CompetitionChampionsData> {
  const [totals, champions] = await Promise.all([
    fetchAthleteStatTotals(editionId),
    fetchCompetitionChampions(competitionId, editionId),
  ]);

  return { ...totals, ...champions };
}
