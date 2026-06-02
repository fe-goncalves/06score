import { fetchEditionTeamsByIds } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  AthleteRosterEntry,
  Competition,
  Season,
} from "@/lib/types";

type RosterRow = {
  id: string;
  edition_team_id?: string | null;
  status: string | null;
};

/** Preenche `edition_id`, `edition_teams.teams` e `competition_editions` (evita embed/RLS). */
export async function enrichAthleteRosterEntries(
  entries: RosterRow[],
): Promise<AthleteRosterEntry[]> {
  if (!entries.length) return [];

  const editionTeamIds = [
    ...new Set(
      entries.map((e) => e.edition_team_id).filter((id): id is string => !!id),
    ),
  ];

  const supabase = getSupabase();
  const teamsByEditionTeamId = await fetchEditionTeamsByIds(editionTeamIds);

  const editionIds = [
    ...new Set(
      entries
        .map((e) => {
          const etId = e.edition_team_id;
          if (!etId) return null;
          return teamsByEditionTeamId.get(etId)?.edition_id ?? null;
        })
        .filter((id): id is string => !!id),
    ),
  ];

  const editionsMap = await fetchEditionsMap(editionIds, supabase);

  return entries.map((entry) => {
    const etId = entry.edition_team_id;
    const resolvedTeam = etId ? teamsByEditionTeamId.get(etId) : undefined;
    const editionId = resolvedTeam?.edition_id ?? "";

    return {
      id: entry.id,
      edition_id: editionId,
      edition_team_id: entry.edition_team_id ?? null,
      status: entry.status,
      created_at: null,
      competition_editions: editionId
        ? (editionsMap.get(editionId) ?? null)
        : null,
      edition_teams: resolvedTeam?.teams
        ? { team_id: resolvedTeam.team_id, teams: resolvedTeam.teams }
        : null,
    };
  });
}

async function fetchEditionsMap(
  editionIds: string[],
  supabase: ReturnType<typeof getSupabase>,
): Promise<
  Map<
    string,
    {
      competitions: Pick<
        Competition,
        "id" | "full_name" | "short_name" | "logo_url"
      > | null;
      seasons: Season | null;
    }
  >
> {
  const map = new Map<
    string,
    {
      competitions: Pick<
        Competition,
        "id" | "full_name" | "short_name" | "logo_url"
      > | null;
      seasons: Season | null;
    }
  >();
  if (!editionIds.length) return map;

  const { data, error } = await supabase
    .from("competition_editions")
    .select(
      "id, competitions(id, full_name, short_name, logo_url), seasons(name)",
    )
    .in("id", editionIds);

  if (error) {
    console.error("[enrichAthleteRosterEntries:editions]", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const id = row.id as string;
    const competitions = row.competitions as Pick<
      Competition,
      "id" | "full_name" | "short_name" | "logo_url"
    > | null;
    const seasons = row.seasons as Season | null;
    map.set(id, { competitions, seasons });
  }

  return map;
}
