"use client";

import { BracketView } from "@/components/competition/BracketView";
import { StandingsTable } from "@/components/competition/StandingsTable";
import type {
  Group,
  GroupTeam,
  Match,
  Matchup,
  Phase,
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

interface PhaseStandingsPanelProps {
  phases: Phase[];
  matches: Match[];
  matchups: Matchup[];
  teamEditionStats: TeamEditionStats[];
  groups: Group[];
  groupTeams: GroupTeam[];
}

function PhaseSection({
  phase,
  matches,
  matchups,
  teamEditionStats,
  groups,
  groupTeams,
}: {
  phase: Phase;
  matches: Match[];
  matchups: Matchup[];
  teamEditionStats: TeamEditionStats[];
  groups: Group[];
  groupTeams: GroupTeam[];
}) {
  const phaseMatches = matches.filter((m) => m.phase_id === phase.id);
  const phaseMatchups = matchups.filter((m) => m.phase_id === phase.id);
  const title = phase.custom_label ?? phase.full_name;
  const isKnockout =
    phase.phase_type === "knockout" || phase.phase_type === "conference";

  if (isKnockout) {
    return (
      <section className="mb-12">
        <h3 className="section-title mb-6">{title}</h3>
        <BracketView matchups={phaseMatchups} matches={phaseMatches} />
      </section>
    );
  }

  if (phase.phase_type === "group_stage") {
    const phaseGroups = groups.filter((g) => g.phase_id === phase.id);
    return (
      <section className="mb-12">
        <h3 className="section-title mb-6">{title}</h3>
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
          );
          return (
            <div key={group.id} className="mb-8">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-brand)]">
                {group.custom_label ?? group.name}
              </h4>
              <StandingsTable rows={rows} />
            </div>
          );
        })}
        {!phaseGroups.length && (
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
            )}
          />
        )}
      </section>
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
      ? computeStandingsFromMatches(phaseMatches, teamIds, tMap)
      : statsToStandings(teamEditionStats);

  return (
    <section className="mb-12">
      <h3 className="section-title mb-6">{title}</h3>
      <StandingsTable rows={rows} />
    </section>
  );
}

export function PhaseStandingsPanel({
  phases,
  matches,
  matchups,
  teamEditionStats,
  groups,
  groupTeams,
}: PhaseStandingsPanelProps) {
  if (!phases.length) {
    return <p className="text-sm text-white/40">Nenhuma fase cadastrada.</p>;
  }

  return (
    <div>
      {phases.map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          matches={matches}
          matchups={matchups}
          teamEditionStats={teamEditionStats}
          groups={groups}
          groupTeams={groupTeams}
        />
      ))}
    </div>
  );
}
