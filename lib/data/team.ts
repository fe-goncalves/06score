import { buildTeamCareerSummary, countTeamChampionTitles } from "@/lib/team/teamCareerSummary";
import {
  COLLECTIVE_TEAM_AWARD_TYPES,
  isCollectiveTeamAwardType,
} from "@/lib/team/awardTypes";
import {
  fetchTeamCareerStats,
  teamCareerSummaryFromStats,
} from "@/lib/team/fetchTeamCareerStats";
import {
  fetchCurrentTeamStaff,
  resolveTeamHomeVenue,
  venueFromTeamEmbed,
} from "@/lib/team/fetchTeamProfileExtras";
import { fetchTeamEditionStats } from "@/lib/team/fetchTeamEditionStats";
import { fetchTeamEditionPositions } from "@/lib/team/fetchTeamEditionPositions";
import { getActiveEditionId } from "@/lib/data/home";
import { fetchEditionTeamsForEdition, getPhaseIdsForOrg } from "@/lib/data/shared";
import { getSupabase } from "@/lib/supabase";
import type {
  Athlete,
  AthleteAwardEntry,
  AthleteRecentMatch,
  AthleteStatsPhaseRecord,
  Match,
  Team,
  TeamCareerSummary,
  TeamProfileData,
} from "@/lib/types";
import { MATCH_SELECT_BASE } from "@/lib/utils";

const MATCH_LIMIT = 40;

const TEAM_SELECT = `
  id, full_name, short_name, abbreviation, logo_url, primary_color, secondary_color,
  organization_id, gender, founded_year, nationality, home_venue_id,
  venues!teams_home_venue_id_fkey ( id, full_name, short_name )
`;

type TeamRecordRow = Team & {
  id: string;
  founded_year?: number | null;
  nationality?: string | null;
  home_venue_id?: string | null;
  venues?:
    | { id: string; full_name?: string | null; short_name?: string | null }
    | { id: string; full_name?: string | null; short_name?: string | null }[]
    | null;
};

type FetchTeamRecordResult = {
  team: Team & { id: string };
  foundedYear: number | null;
  homeVenueId: string | null;
  embeddedVenue: ReturnType<typeof venueFromTeamEmbed>;
};

async function fetchTeamRecord(
  teamId: string,
  orgId: string,
): Promise<FetchTeamRecordResult | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_SELECT)
    .eq("id", teamId)
    .eq("organization_id", orgId)
    .eq("is_virtual", false)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getTeamProfile:team]", error.message);
    return null;
  }

  const row = data as TeamRecordRow;
  const foundedRaw = row.founded_year;
  const foundedYear =
    foundedRaw != null && Number.isFinite(Number(foundedRaw))
      ? Number(foundedRaw)
      : null;

  const { venues, founded_year: _fy, home_venue_id, ...teamFields } = row;

  return {
    team: teamFields as Team & { id: string },
    foundedYear,
    homeVenueId: home_venue_id ?? null,
    embeddedVenue: venueFromTeamEmbed(venues),
  };
}

export interface TeamListItem {
  id: string;
  team: Team;
}

export async function getTeamsList(orgId: string): Promise<TeamListItem[]> {
  const editionId = await getActiveEditionId(orgId);
  if (!editionId) return [];

  const rows = await fetchEditionTeamsForEdition(editionId);

  return rows
    .map((row) => {
      if (!row.teams) return null;
      return { id: row.team_id, team: row.teams };
    })
    .filter((row): row is TeamListItem => row !== null);
}

export async function getTeamProfile(
  teamId: string,
  orgId: string,
): Promise<TeamProfileData | null> {
  const supabase = getSupabase();

  const teamRecord = await fetchTeamRecord(teamId, orgId);
  if (!teamRecord) return null;

  const { team, foundedYear, homeVenueId, embeddedVenue } = teamRecord;

  const [
    squadResult,
    editionStats,
    teamAwardsResult,
    individualAwardsResult,
    careerStatsRow,
    staff,
    phaseIds,
  ] = await Promise.all([
    supabase
      .from("athlete_team_stints")
      .select(
        `
        athletes(id, full_name, surname, photo_url, birth_date, nationality, player_positions(full_name, abbreviation))
      `,
      )
      .eq("team_id", teamId)
      .eq("is_current", true),
    fetchTeamEditionStats(teamId),
    supabase
      .from("edition_awards")
      .select(
        `
        id,
        award_type,
        winning_team_id,
        edition_id,
        competition_editions (
          competitions ( id, full_name, short_name, logo_url ),
          seasons ( name )
        ),
        teams!edition_awards_winning_team_id_fkey (
          id, full_name, abbreviation, logo_url
        )
      `,
      )
      .eq("winning_team_id", teamId)
      .in("award_type", Array.from(COLLECTIVE_TEAM_AWARD_TYPES))
      .is("athlete_id", null)
      .is("staff_member_id", null),
    supabase
      .from("edition_awards")
      .select(
        `
        id,
        award_type,
        winning_team_id,
        edition_id,
        athlete_id,
        athletes ( id, full_name, surname, photo_url ),
        competition_editions (
          competitions ( id, full_name, short_name, logo_url ),
          seasons ( name )
        ),
        teams!edition_awards_winning_team_id_fkey (
          id, full_name, abbreviation, logo_url
        )
      `,
      )
      .eq("winning_team_id", teamId)
      .not("athlete_id", "is", null),
    fetchTeamCareerStats(teamId),
    fetchCurrentTeamStaff(teamId),
    getPhaseIdsForOrg(orgId),
  ]);

  const venue = await resolveTeamHomeVenue(
    teamId,
    homeVenueId,
    phaseIds,
    embeddedVenue,
  );

  if (squadResult.error) {
    console.error("[getTeamProfile:squad]", squadResult.error.message);
  }
  if (teamAwardsResult.error) {
    console.error("[getTeamProfile:teamAwards]", teamAwardsResult.error.message);
  }
  if (individualAwardsResult.error) {
    console.error("[getTeamProfile:individualAwards]", individualAwardsResult.error.message);
  }

  const squad: (Athlete & { id: string })[] = [];
  for (const row of squadResult.data ?? []) {
    const a = row.athletes as (Athlete & { id: string }) | (Athlete & { id: string })[] | null;
    if (a && !Array.isArray(a) && a.id) squad.push(a);
    if (Array.isArray(a)) {
      for (const x of a) {
        if (x.id) squad.push(x as Athlete & { id: string });
      }
    }
  }

  squad.sort((a, b) =>
    (a.surname ?? a.full_name).localeCompare(b.surname ?? b.full_name, "pt-BR"),
  );

  const teamAwards = (teamAwardsResult.data as AthleteAwardEntry[] | null) ?? [];
  const individualAwards = ((individualAwardsResult.data as AthleteAwardEntry[] | null) ?? []).filter(
    (row) => !isCollectiveTeamAwardType(row.award_type),
  );

  const editionIds = editionStats.map((r) => r.edition_id);
  const editionPositions = await fetchTeamEditionPositions(teamId, editionIds);

  let recentMatches: AthleteRecentMatch[] = [];
  if (phaseIds.length) {
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(MATCH_SELECT_BASE)
      .in("phase_id", phaseIds)
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .order("match_date", { ascending: false })
      .order("match_time", { ascending: false })
      .limit(MATCH_LIMIT);

    if (matchesError) {
      console.error("[getTeamProfile:matches]", matchesError.message);
    } else {
      recentMatches = ((matchesData as unknown as Match[] | null) ?? []).map((match) => ({
        match: {
          ...match,
          athlete_team_id: teamId,
        } as Match,
        rating: null,
        isMotm: false,
        actions: [],
      }));
    }
  }

  const careerSummary: TeamCareerSummary = {
    ...(careerStatsRow
      ? teamCareerSummaryFromStats(careerStatsRow)
      : buildTeamCareerSummary({
          editionStats,
          teamAwards,
          presenceMatches: recentMatches.length,
        })),
    titles: countTeamChampionTitles(teamAwards),
  };

  const editionToCompetition = new Map<string, string>();
  for (const row of editionStats) {
    const compId = row.competition_editions?.competition_id;
    if (compId) editionToCompetition.set(row.edition_id, compId);
  }

  let statsPhases: AthleteStatsPhaseRecord[] = [];
  const editionIdsForPhases = [...editionToCompetition.keys()];
  if (editionIdsForPhases.length) {
    const { data: phasesRaw, error: phasesError } = await supabase
      .from("phases")
      .select(
        "id, full_name, custom_label, phase_type, display_order, edition_id, template_id",
      )
      .in("edition_id", editionIdsForPhases)
      .order("display_order", { ascending: true });

    if (phasesError) {
      console.error("[getTeamProfile:statsPhases]", phasesError.message);
    } else {
      statsPhases = (phasesRaw ?? []).map((phase) => ({
        id: phase.id as string,
        edition_id: phase.edition_id as string,
        full_name: String(phase.full_name ?? ""),
        custom_label: (phase.custom_label as string | null) ?? null,
        display_order: Number(phase.display_order) || 0,
        template_id: (phase.template_id as string | null) ?? null,
        competition_id:
          editionToCompetition.get(phase.edition_id as string) ?? null,
      }));
    }
  }

  return {
    team: team as Team & { id: string },
    careerSummary,
    squad,
    editionStats,
    editionPositions,
    statsPhases,
    teamAwards,
    individualAwards,
    venue,
    foundedYear,
    staff,
    recentMatches,
  };
}
