import { fetchTeamAthleteStats } from "@/lib/team/fetchTeamAthleteStats";
import { getSupabase } from "@/lib/supabase";
import type { Athlete } from "@/lib/types";

export type TeamMaioresCategory =
  | "goals"
  | "assists"
  | "captain"
  | "champion"
  | "goalkeeper_matches"
  | "wins";

export interface TeamMaioresEntry {
  rank: number;
  athlete_id: string;
  full_name: string;
  surname: string | null;
  photo_url: string | null;
  value: number;
}

export interface TeamMaioresLeaderCard {
  category: TeamMaioresCategory;
  title: string;
  valueLabel: string;
  entries: TeamMaioresEntry[];
  leader: TeamMaioresEntry | null;
}

export const TEAM_MAIORES_CARDS: {
  category: TeamMaioresCategory;
  title: string;
  valueLabel: string;
}[] = [
  { category: "goals", title: "Maior artilheiro", valueLabel: "Gols" },
  { category: "assists", title: "Mais assistências", valueLabel: "Assist." },
  { category: "captain", title: "Mais vezes capitão", valueLabel: "Jogos" },
  { category: "champion", title: "Mais vezes campeão", valueLabel: "Títulos" },
  { category: "goalkeeper_matches", title: "Goleiro com mais jogos", valueLabel: "Jogos" },
  { category: "wins", title: "Atleta com mais vitórias", valueLabel: "Vitórias" },
];

function topEntries(
  counts: Map<string, number>,
  athletes: Map<string, Athlete & { id: string }>,
  limit = 10,
): TeamMaioresEntry[] {
  const sorted = [...counts.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return sorted.slice(0, limit).map(([athleteId, value], index) => {
    const athlete = athletes.get(athleteId);
    return {
      rank: index + 1,
      athlete_id: athleteId,
      full_name: athlete?.full_name ?? "Atleta",
      surname: athlete?.surname ?? null,
      photo_url: athlete?.photo_url ?? null,
      value,
    };
  });
}

async function fetchAthleteMap(ids: string[]): Promise<Map<string, Athlete & { id: string }>> {
  if (!ids.length) return new Map();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("athletes")
    .select("id, full_name, surname, photo_url")
    .in("id", ids);

  if (error) {
    console.error("[fetchTeamMaiores:athletes]", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((a) => [a.id as string, a as Athlete & { id: string }]),
  );
}

async function fetchGoalkeeperCounts(teamId: string): Promise<Map<string, number>> {
  const supabase = getSupabase();

  const { data: editionTeams, error: etError } = await supabase
    .from("edition_teams")
    .select("id")
    .eq("team_id", teamId);

  if (etError) {
    console.error("[fetchTeamMaiores:edition_teams]", etError.message);
    return new Map();
  }

  const editionTeamIds = editionTeams?.map((et) => et.id as string) ?? [];
  if (!editionTeamIds.length) return new Map();

  const { data: goalkeeperPositions, error: posError } = await supabase
    .from("player_positions")
    .select("id")
    .eq("is_goalkeeper", true);

  if (posError) {
    console.error("[fetchTeamMaiores:goalkeeper_positions]", posError.message);
    return new Map();
  }

  const goalkeeperPositionIds = goalkeeperPositions?.map((p) => p.id as string) ?? [];
  if (!goalkeeperPositionIds.length) return new Map();

  const { data: goalkeepers, error: gkError } = await supabase
    .from("athletes")
    .select("id, full_name, surname, photo_url, position_id")
    .in("position_id", goalkeeperPositionIds);

  if (gkError) {
    console.error("[fetchTeamMaiores:goalkeepers]", gkError.message);
    return new Map();
  }

  const goalkeeperIds = goalkeepers?.map((g) => g.id as string) ?? [];
  if (!goalkeeperIds.length) return new Map();

  const { data: goalkeeperLineups, error: luError } = await supabase
    .from("match_lineups")
    .select("athlete_id, match_id")
    .in("edition_team_id", editionTeamIds)
    .in("athlete_id", goalkeeperIds)
    .eq("is_present", true);

  if (luError) {
    console.error("[fetchTeamMaiores:goalkeeper_lineups]", luError.message);
    return new Map();
  }

  const matchIdsByAthlete = new Map<string, Set<string>>();
  for (const row of goalkeeperLineups ?? []) {
    const athleteId = row.athlete_id as string | undefined;
    const matchId = row.match_id as string | undefined;
    if (!athleteId || !matchId) continue;
    let matchIds = matchIdsByAthlete.get(athleteId);
    if (!matchIds) {
      matchIds = new Set();
      matchIdsByAthlete.set(athleteId, matchIds);
    }
    matchIds.add(matchId);
  }

  const counts = new Map<string, number>();
  for (const [athleteId, matchIds] of matchIdsByAthlete) {
    counts.set(athleteId, matchIds.size);
  }
  return counts;
}

async function fetchChampionCounts(
  teamId: string,
  championEditionIds: string[],
): Promise<Map<string, number>> {
  if (!championEditionIds.length) return new Map();
  const supabase = getSupabase();

  const { data: editionTeams, error: etError } = await supabase
    .from("edition_teams")
    .select("id, edition_id")
    .eq("team_id", teamId)
    .in("edition_id", championEditionIds);

  if (etError || !editionTeams?.length) {
    if (etError) console.error("[fetchTeamMaiores:champion:edition_teams]", etError.message);
    return new Map();
  }

  const editionTeamIds = editionTeams.map((row) => row.id as string);
  const editionByTeam = new Map(
    editionTeams.map((row) => [row.id as string, row.edition_id as string]),
  );

  const { data, error } = await supabase
    .from("match_lineups")
    .select("athlete_id, edition_team_id")
    .in("edition_team_id", editionTeamIds)
    .eq("is_present", true);

  if (error) {
    console.error("[fetchTeamMaiores:champion:lineups]", error.message);
    return new Map();
  }

  const seen = new Set<string>();
  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const athleteId = row.athlete_id as string | undefined;
    const editionTeamId = row.edition_team_id as string | undefined;
    const editionId = editionTeamId ? editionByTeam.get(editionTeamId) : null;
    if (!athleteId || !editionId) continue;
    const key = `${athleteId}:${editionId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(athleteId, (counts.get(athleteId) ?? 0) + 1);
  }

  return counts;
}

export async function fetchTeamMaioresLeaders(
  teamId: string,
  teamEditionIds: string[],
  championEditionIds: string[],
): Promise<TeamMaioresLeaderCard[]> {
  const [athleteStats, goalkeeperCounts, championCounts] = await Promise.all([
    fetchTeamAthleteStats(
      teamId,
      "all",
      [],
      {
        year: "all",
        seasonId: "all",
        competitionId: "all",
        phaseIds: null,
      },
      teamEditionIds,
    ),
    fetchGoalkeeperCounts(teamId),
    fetchChampionCounts(teamId, championEditionIds),
  ]);

  const countMaps: Record<TeamMaioresCategory, Map<string, number>> = {
    goals: new Map(),
    assists: new Map(),
    captain: new Map(),
    champion: championCounts,
    goalkeeper_matches: goalkeeperCounts,
    wins: new Map(),
  };

  for (const row of athleteStats) {
    const id = row.athlete.id;
    if (row.goals > 0) countMaps.goals.set(id, row.goals);
    if (row.assists > 0) countMaps.assists.set(id, row.assists);
    if (row.captain_matches > 0) countMaps.captain.set(id, row.captain_matches);
    if (row.wins > 0) countMaps.wins.set(id, row.wins);
  }

  const allAthleteIds = [
    ...new Set(
      Object.values(countMaps).flatMap((map) => [...map.keys()]),
    ),
  ];
  const athleteMap = await fetchAthleteMap(allAthleteIds);

  return TEAM_MAIORES_CARDS.map(({ category, title, valueLabel }) => {
    const entries = topEntries(countMaps[category], athleteMap);
    return {
      category,
      title,
      valueLabel,
      entries,
      leader: entries[0] ?? null,
    };
  });
}
