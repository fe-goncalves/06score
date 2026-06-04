import { getSupabase } from "@/lib/supabase";
import type { AthleteEditionStatRow, Competition, Season, Team } from "@/lib/types";

const EDITION_STATS_JOINED_SELECT = `
  edition_id,
  team_id,
  matches_played,
  wins,
  draws,
  losses,
  yellow_cards,
  red_cards,
  totw_count,
  motw_count,
  avg_rating,
  penalties_taken,
  penalties_scored,
  shootouts_taken,
  shootouts_scored,
  goals_conceded,
  penalty_saves,
  competition_editions!inner (
    id,
    season_id,
    competition_id,
    seasons!inner (
      id,
      name,
      year_id,
      years!inner ( id, value )
    ),
    competitions!inner ( id, full_name, short_name, logo_url )
  ),
  teams ( id, full_name, abbreviation, logo_url )
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

function numOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function normalizeEditionStatRow(raw: RawStat): AthleteEditionStatRow | null {
  const editionId = raw.edition_id as string | undefined;
  if (!editionId) return null;

  const editionRaw = unwrap(raw.competition_editions as RawStat | RawStat[]);
  const seasonsRaw = editionRaw ? unwrap(editionRaw.seasons as RawStat | RawStat[]) : null;
  const yearsRaw = seasonsRaw ? unwrap(seasonsRaw.years as RawStat | RawStat[]) : null;
  const competitionsRaw = editionRaw
    ? unwrap(editionRaw.competitions as RawStat | RawStat[])
    : null;
  const teamsRaw = unwrap(raw.teams as RawStat | RawStat[]);

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

  const teams: Pick<Team, "id" | "full_name" | "abbreviation" | "logo_url"> | null =
    teamsRaw
      ? {
          id: teamsRaw.id as string,
          full_name: String(teamsRaw.full_name ?? ""),
          abbreviation: (teamsRaw.abbreviation as string | null) ?? null,
          logo_url: (teamsRaw.logo_url as string | null) ?? null,
        }
      : null;

  const wins = num(raw.wins ?? raw.goals);
  const draws = num(raw.draws ?? raw.assists);
  const losses = num(raw.losses ?? raw.motm_count);

  return {
    edition_id: editionId,
    team_id: (raw.team_id as string | null) ?? null,
    matches_played: num(raw.matches_played),
    wins,
    draws,
    losses,
    goals: wins,
    assists: draws,
    motm_count: losses,
    yellow_cards: num(raw.yellow_cards),
    red_cards: num(raw.red_cards),
    totw_count: num(raw.totw_count),
    motw_count: num(raw.motw_count),
    penalties_taken: num(raw.penalties_taken),
    penalties_scored: num(raw.penalties_scored),
    shootouts_taken: num(raw.shootouts_taken),
    shootouts_scored: num(raw.shootouts_scored),
    goals_conceded: num(raw.goals_conceded),
    penalty_saves: num(raw.penalty_saves),
    avg_rating: numOrNull(raw.avg_rating),
    competition_editions: editionRaw
      ? {
          id: editionRaw.id as string,
          season_id: (editionRaw.season_id as string | null) ?? null,
          competition_id: (editionRaw.competition_id as string | null) ?? null,
          seasons,
          competitions,
        }
      : null,
    teams,
  };
}

async function fetchStaffEditionStatsFallback(
  staffMemberId: string,
): Promise<AthleteEditionStatRow[]> {
  const supabase = getSupabase();

  const { data: stats, error: statsError } = await supabase
    .from("staff_edition_stats")
    .select(
      `edition_id, team_id, matches_played, wins, draws, losses, yellow_cards, red_cards, totw_count, motw_count, avg_rating, penalties_taken, penalties_scored, shootouts_taken, shootouts_scored, goals_conceded, penalty_saves`,
    )
    .eq("staff_member_id", staffMemberId);

  if (statsError) {
    console.error("[fetchStaffEditionStats:fallback:stats]", statsError.message);
    return [];
  }

  if (!stats?.length) return [];

  const editionIds = [...new Set(stats.map((s) => s.edition_id as string))];
  const teamIds = [
    ...new Set(stats.map((s) => s.team_id).filter((id): id is string => !!id)),
  ];

  const [{ data: editions, error: editionsError }, { data: teams, error: teamsError }] =
    await Promise.all([
      supabase
        .from("competition_editions")
        .select(
          `
            id, season_id, competition_id,
            seasons ( id, name, year_id, years ( id, value ) ),
            competitions ( id, full_name, short_name, logo_url )
          `,
        )
        .in("id", editionIds),
      teamIds.length
        ? supabase
            .from("teams")
            .select("id, full_name, abbreviation, logo_url")
            .in("id", teamIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (editionsError) {
    console.error("[fetchStaffEditionStats:fallback:editions]", editionsError.message);
  }
  if (teamsError) {
    console.error("[fetchStaffEditionStats:fallback:teams]", teamsError.message);
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

  const teamMap = new Map(
    (teams ?? []).map((t) => [
      t.id as string,
      {
        id: t.id as string,
        full_name: String(t.full_name ?? ""),
        abbreviation: (t.abbreviation as string | null) ?? null,
        logo_url: (t.logo_url as string | null) ?? null,
      },
    ]),
  );

  const rows: AthleteEditionStatRow[] = [];
  for (const stat of stats) {
    const edition = editionMap.get(stat.edition_id as string);
    const teamId = stat.team_id as string | null;
    const normalized = normalizeEditionStatRow({
      ...stat,
      competition_editions: edition ?? null,
      teams: teamId ? (teamMap.get(teamId) ?? null) : null,
    });
    if (normalized) rows.push(normalized);
  }

  return rows;
}

/** Stats por edição com hierarquia years → seasons → competition_editions. */
export async function fetchStaffEditionStats(
  staffMemberId: string,
): Promise<AthleteEditionStatRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("staff_edition_stats")
    .select(EDITION_STATS_JOINED_SELECT)
    .eq("staff_member_id", staffMemberId)
    .order("edition_id");

  if (error) {
    console.error("[fetchStaffEditionStats:join]", error.message);
    return fetchStaffEditionStatsFallback(staffMemberId);
  }

  if (!data?.length) {
    if (data && data.length === 0) return [];
    return fetchStaffEditionStatsFallback(staffMemberId);
  }

  const rows: AthleteEditionStatRow[] = [];
  for (const raw of data) {
    const row = normalizeEditionStatRow(raw as RawStat);
    if (row) rows.push(row);
  }

  if (!rows.length) {
    return fetchStaffEditionStatsFallback(staffMemberId);
  }

  const hasYearValues = rows.some(
    (r) => r.competition_editions?.seasons?.years?.value != null,
  );
  if (!hasYearValues) {
    return fetchStaffEditionStatsFallback(staffMemberId);
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
