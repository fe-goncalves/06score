import type { CSSProperties } from "react";
import { BracketView } from "@/components/competition/BracketView";
import { StandingsTable } from "@/components/competition/StandingsTable";
import { markersForPhase } from "@/lib/competition/tableMarkers";
import type {
  Group,
  GroupTeam,
  Match,
  Matchup,
  Phase,
  TableMarker,
  Team,
  TeamEditionStats,
} from "@/lib/types";
import { computeStandingsFromMatches, statsToStandings } from "@/lib/utils";

function teamsMapFromMatches(matches: Match[]): Record<string, Team> {
  const map: Record<string, Team> = {};
  for (const m of matches) {
    if (m.team_a_id && m.teams_a) {
      map[m.team_a_id] = { ...m.teams_a, id: m.team_a_id };
    }
    if (m.team_b_id && m.teams_b) {
      map[m.team_b_id] = { ...m.teams_b, id: m.team_b_id };
    }
  }
  return map;
}

interface PhaseStandingsBlockProps {
  phase: Phase;
  matches: Match[];
  matchups: Matchup[];
  teamEditionStats: TeamEditionStats[];
  groups: Group[];
  groupTeams: GroupTeam[];
  tableMarkers: TableMarker[];
  accentColor?: string | null;
}

export function PhaseStandingsBlock({
  phase,
  matches,
  matchups,
  teamEditionStats,
  groups,
  groupTeams,
  tableMarkers,
  accentColor,
}: PhaseStandingsBlockProps) {
  const phaseMatches = matches.filter((m) => m.phase_id === phase.id);
  const phaseMatchups = matchups.filter((m) => m.phase_id === phase.id);
  const phaseMarkers = markersForPhase(tableMarkers, phase.id);
  const isKnockout =
    phase.phase_type === "knockout" || phase.phase_type === "conference";

  if (isKnockout) {
    return (
      <div className="competition-bracket-wrap competition-tab-bracket">
        <BracketView
          matchups={phaseMatchups}
          matches={phaseMatches}
          accentColor={accentColor}
        />
      </div>
    );
  }

  if (phase.phase_type === "group_stage") {
    const phaseGroups = groups.filter((g) => g.phase_id === phase.id);
    if (!phaseGroups.length) {
      return (
        <div className="competition-standings-wrap">
          <StandingsTable
            rows={computeStandingsFromMatches(
              phaseMatches,
              [
                ...new Set(
                  phaseMatches.flatMap((m) =>
                    [m.team_a_id, m.team_b_id].filter((id): id is string =>
                      Boolean(id),
                    ),
                  ),
                ),
              ],
              teamsMapFromMatches(phaseMatches),
              teamEditionStats,
            )}
            markers={phaseMarkers}
            accentColor={accentColor}
            embedded
          />
        </div>
      );
    }

    return (
      <div className="competition-tab-groups">
        {phaseGroups.map((group) => {
          const gt = groupTeams.filter((x) => x.group_id === group.id);
          const teamIds = gt
            .map((x) => x.edition_teams?.team_id)
            .filter((id): id is string => Boolean(id));
          const tMap: Record<string, Team> = {};
          for (const row of gt) {
            const tid = row.edition_teams?.team_id;
            const team = row.edition_teams?.teams;
            if (tid && team) tMap[tid] = { ...team, id: tid };
          }
          const rows = computeStandingsFromMatches(
            phaseMatches,
            teamIds,
            tMap,
            teamEditionStats,
          );
          return (
            <div key={group.id} className="competition-tab-group-block">
              <h4
                className="competition-group-label"
                style={
                  accentColor
                    ? ({ "--hub-accent": accentColor } as CSSProperties)
                    : undefined
                }
              >
                {group.custom_label ?? group.name}
              </h4>
              <div className="competition-standings-wrap">
                <StandingsTable
                  rows={rows}
                  markers={phaseMarkers}
                  accentColor={accentColor}
                  embedded
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const teamIds = [
    ...new Set(
      phaseMatches.flatMap((m) =>
        [m.team_a_id, m.team_b_id].filter((id): id is string => Boolean(id)),
      ),
    ),
  ];
  const tMap = teamsMapFromMatches(phaseMatches);
  const rows =
    teamIds.length > 0
      ? computeStandingsFromMatches(
          phaseMatches,
          teamIds,
          tMap,
          teamEditionStats,
        )
      : statsToStandings(teamEditionStats, phaseMatches);

  return (
    <div className="competition-standings-wrap">
      <StandingsTable
        rows={rows}
        markers={phaseMarkers}
        accentColor={accentColor}
        embedded
      />
    </div>
  );
}
