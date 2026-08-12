import { getSupabase } from "@/lib/supabase";
import type { Competition, Season, TeamEditionStatRow } from "@/lib/types";

const EDITION_STATS_JOINED_SELECT = `
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
  competition_editions!inner (
    id,
    season_id,
    competition_id,
    custom_name,
    seasons!inner (
      id,
      name,
      year_id,
      years!inner ( id, value )
    ),
    competitions!inner ( id, full_name, short_name, logo_url )
  )
`;

type RawStat = Record<string, unknown>;

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEditionStatRow(raw: RawStat): TeamEditionStatRow | null {
  const editionId = raw.edition_id as string | undefined;
  if (!editionId) return null;

  const editionRaw = unwrap(raw.competition_editions as RawStat | RawStat[]);
  const seasonsRaw = editionRaw ? unwrap(editionRaw.seasons as RawStat | RawStat[]) : null;
  const yearsRaw = seasonsRaw ? unwrap(seasonsRaw.years as RawStat | RawStat[]) : null;
  const competitionsRaw = editionRaw
    ? unwrap(editionRaw.competitions as RawStat | RawStat[])
    : null;

  const seasons: Season | null = seasonsRaw
    ? {
        id: seasonsRaw.id as string,
        name: String(seasonsRaw.name ?? ""),
        year_id: (seasonsRaw.year_id as string | undefined) ?? undefined,
        years: yearsRaw
          ? {
              id: yearsRaw.id as string,
              value: num(yearsRaw.value),
            }
          : null,
      }
    : null;

  const competitions: Pick<
    Competition,
    "id" | "full_name" | "short_name" | "logo_url"
  > | null = competitionsRaw
    ? {
        id: competitionsRaw.id as string,
        full_name: String(competitionsRaw.full_name ?? ""),
        short_name: (competitionsRaw.short_name as string | null) ?? null,
        logo_url: (competitionsRaw.logo_url as string | null) ?? null,
      }
    : null;

  return {
    edition_id: editionId,
    team_id: (raw.team_id as string | null) ?? null,
    matches_played: num(raw.matches_played),
    wins: num(raw.wins),
    draws: num(raw.draws),
    losses: num(raw.losses),
    goals_scored: num(raw.goals_scored),
    goals_conceded: num(raw.goals_conceded),
    points: num(raw.points),
    yellow_cards: num(raw.yellow_cards),
    red_cards: num(raw.red_cards),
    competition_editions: editionRaw
      ? {
          id: editionRaw.id as string,
          season_id: (editionRaw.season_id as string | null) ?? null,
          competition_id: (editionRaw.competition_id as string | null) ?? null,
          custom_name: (editionRaw.custom_name as string | null) ?? null,
          seasons,
          competitions,
        }
      : null,
  };
}

async function fetchTeamEditionStatsFallback(
  teamId: string,
): Promise<TeamEditionStatRow[]> {
  const supabase = getSupabase();

  const { data: stats, error: statsError } = await supabase
    .from("team_edition_stats")
    .select(
      `edition_id, team_id, matches_played, wins, draws, losses, goals_scored, goals_conceded, points, yellow_cards, red_cards`,
    )
    .eq("team_id", teamId);

  if (statsError) {
    console.error("[fetchTeamEditionStats:fallback:stats]", statsError.message);
    return [];
  }

  if (!stats?.length) return [];

  const editionIds = [...new Set(stats.map((s) => s.edition_id as string))];

  const { data: editions, error: editionsError } = await supabase
    .from("competition_editions")
    .select(
      `
        id, season_id, competition_id, custom_name,
        seasons ( id, name, year_id, years ( id, value ) ),
        competitions ( id, full_name, short_name, logo_url )
      `,
    )
    .in("id", editionIds);

  if (editionsError) {
    console.error("[fetchTeamEditionStats:fallback:editions]", editionsError.message);
    return [];
  }

  const editionMap = new Map(
    (editions ?? []).map((e) => {
      const row = e as RawStat;
      const seasonsRaw = unwrap(row.seasons as RawStat | RawStat[]);
      const yearsRaw = seasonsRaw ? unwrap(seasonsRaw.years as RawStat | RawStat[]) : null;
      const compRaw = unwrap(row.competitions as RawStat | RawStat[]);
      return [
        row.id as string,
        {
          id: row.id as string,
          season_id: (row.season_id as string | null) ?? null,
          competition_id: (row.competition_id as string | null) ?? null,
          custom_name: (row.custom_name as string | null) ?? null,
          seasons: seasonsRaw
            ? {
                id: seasonsRaw.id as string,
                name: String(seasonsRaw.name ?? ""),
                year_id: (seasonsRaw.year_id as string | undefined) ?? undefined,
                years: yearsRaw
                  ? { id: yearsRaw.id as string, value: num(yearsRaw.value) }
                  : null,
              }
            : null,
          competitions: compRaw
            ? {
                id: compRaw.id as string,
                full_name: String(compRaw.full_name ?? ""),
                short_name: (compRaw.short_name as string | null) ?? null,
                logo_url: (compRaw.logo_url as string | null) ?? null,
              }
            : null,
        },
      ];
    }),
  );

  const rows: TeamEditionStatRow[] = [];
  for (const stat of stats) {
    const edition = editionMap.get(stat.edition_id as string);
    const normalized = normalizeEditionStatRow({
      ...stat,
      competition_editions: edition ?? null,
    });
    if (normalized) rows.push(normalized);
  }

  return rows;
}

/** Stats por edição com hierarquia years → seasons → competition_editions. */
export async function fetchTeamEditionStats(
  teamId: string,
): Promise<TeamEditionStatRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("team_edition_stats")
    .select(EDITION_STATS_JOINED_SELECT)
    .eq("team_id", teamId)
    .order("edition_id");

  if (error) {
    console.error("[fetchTeamEditionStats:join]", error.message);
    return fetchTeamEditionStatsFallback(teamId);
  }

  if (!data?.length) {
    if (data && data.length === 0) return [];
    return fetchTeamEditionStatsFallback(teamId);
  }

  const rows: TeamEditionStatRow[] = [];
  for (const raw of data) {
    const row = normalizeEditionStatRow(raw as RawStat);
    if (row) rows.push(row);
  }

  if (!rows.length) {
    return fetchTeamEditionStatsFallback(teamId);
  }

  const hasYearValues = rows.some(
    (r) => r.competition_editions?.seasons?.years?.value != null,
  );
  if (!hasYearValues) {
    return fetchTeamEditionStatsFallback(teamId);
  }

  return rows.sort((a, b) => {
    const ay = a.competition_editions?.seasons?.years?.value ?? 0;
    const by = b.competition_editions?.seasons?.years?.value ?? 0;
    if (ay !== by) return Number(by) - Number(ay);
    const aComp =
      a.competition_editions?.competitions?.short_name ??
      a.competition_editions?.competitions?.full_name ??
      "";
    const bComp =
      b.competition_editions?.competitions?.short_name ??
      b.competition_editions?.competitions?.full_name ??
      "";
    return aComp.localeCompare(bComp, "pt-BR");
  });
}
