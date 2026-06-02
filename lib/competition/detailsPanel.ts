import { unwrapTeamRelation } from "@/lib/data/shared";
import type {
  CompetitionEditionDetails,
  EditionTeam,
  Match,
  Phase,
  Team,
  TeamEditionStats,
} from "@/lib/types";
import { computeStandingsFromMatches } from "@/lib/utils";

function resolveTeam(et: EditionTeam): Team | null {
  return unwrapTeamRelation(et.teams as Team | Team[] | null) ?? null;
}

export function buildEditionDetailsPanelData(input: {
  editionTeams: EditionTeam[];
  phases: Phase[];
  matches: Match[];
  teamEditionStats: TeamEditionStats[];
  totalGoalsFromAthletes: number;
  totalYellowCards: number;
  totalRedCards: number;
  pastChampions: Team[];
  defendingChampion: Team | null;
}): CompetitionEditionDetails {
  const {
    editionTeams,
    phases,
    matches,
    teamEditionStats,
    totalGoalsFromAthletes,
    totalYellowCards,
    totalRedCards,
    pastChampions,
    defendingChampion,
  } = input;

  const teamIds = editionTeams
    .map((et) => et.team_id)
    .filter((id): id is string => Boolean(id));

  const teamsMap: Record<string, Team> = {};
  for (const et of editionTeams) {
    const team = resolveTeam(et);
    if (team?.id) teamsMap[team.id] = team;
  }

  const goalsFromTeams = teamEditionStats.reduce(
    (sum, row) => sum + (row.goals_scored ?? 0),
    0,
  );
  const totalGoals = goalsFromTeams || totalGoalsFromAthletes;

  const totalAthletes = editionTeams.reduce(
    (sum, et) => sum + (et.athlete_count ?? 0),
    0,
  );

  const debutTeams = editionTeams
    .filter((et) => (et.competition_participations ?? 0) === 1)
    .map(resolveTeam)
    .filter((team): team is Team => team != null);

  const phaseLeaders = phases.map((phase) => {
    const phaseMatches = matches.filter((m) => m.phase_id === phase.id);
    const rows = computeStandingsFromMatches(phaseMatches, teamIds, teamsMap);
    const leader = rows[0] ?? null;

    return {
      phaseId: phase.id,
      phaseName: phase.custom_label ?? phase.full_name,
      isCurrent: Boolean(phase.is_current),
      team: leader?.team ?? null,
      points: leader?.points ?? 0,
    };
  });

  return {
    totalGoals,
    totalAthletes,
    totalYellowCards,
    totalRedCards,
    totalCards: totalYellowCards + totalRedCards,
    debutTeams,
    phaseLeaders,
    pastChampions,
    defendingChampion,
  };
}
