"use client";

import { useState } from "react";
import { LineupPlayerRow } from "@/components/match/LineupPlayerRow";
import { LineupStaffRow } from "@/components/match/LineupStaffRow";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  buildMatchRatingsMap,
  resolveLineupRating,
  sortLineupsForFormation,
  sortStaffBySurname,
} from "@/lib/match/lineupList";
import type {
  Match,
  MatchAction,
  MatchAthleteRating,
  MatchLineup,
  MatchStaffLineup,
} from "@/lib/types";

type LineupTeamSide = "A" | "B";

interface MatchLineupsListProps {
  match: Match;
  lineups: MatchLineup[];
  staffLineups: MatchStaffLineup[];
  ratings: MatchAthleteRating[];
  actions: MatchAction[];
  teamAId: string;
}

interface TeamBlockProps {
  side: LineupTeamSide;
  teamName: string;
  logoUrl: string | null | undefined;
  players: MatchLineup[];
  staff: MatchStaffLineup[];
  ratingsMap: Map<string, number>;
  actions: MatchAction[];
}

function TeamBlock({
  side,
  teamName,
  logoUrl,
  players,
  staff,
  ratingsMap,
  actions,
}: TeamBlockProps) {
  return (
    <section
      className={`match-lineup-team match-lineup-team--${side.toLowerCase()}`}
    >
      <header className="match-lineup-team-head">
        {logoUrl && (
          <OrgImage
            src={logoUrl}
            alt=""
            width={28}
            height={28}
            className="match-lineup-team-logo"
          />
        )}
        <h3 className="match-lineup-team-name">{teamName}</h3>
      </header>
      <ul className="match-lineup-list match-lineup-list--players">
        {players.map((lineup) => (
          <LineupPlayerRow
            key={lineup.athlete_id}
            lineup={lineup}
            actions={actions}
            rating={resolveLineupRating(lineup, ratingsMap)}
          />
        ))}
      </ul>
      {staff.length > 0 && (
        <div className="match-lineup-staff-block">
          <div className="match-lineup-staff-divider" aria-hidden />
          <p className="match-lineup-staff-heading">Comissão técnica</p>
          <ul className="match-lineup-list match-lineup-list--staff">
            {staff.map((row) => (
              <LineupStaffRow key={row.staff_member_id} staff={row} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

interface LineupTeamSwitchProps {
  side: LineupTeamSide;
  onChange: (side: LineupTeamSide) => void;
  teamAName: string;
  teamBName: string;
  teamALogo?: string | null;
  teamBLogo?: string | null;
}

function LineupTeamSwitch({
  side,
  onChange,
  teamAName,
  teamBName,
  teamALogo,
  teamBLogo,
}: LineupTeamSwitchProps) {
  return (
    <div
      className="match-lineups-team-switch"
      role="tablist"
      aria-label="Selecionar equipe"
    >
      {(
        [
          { id: "A" as const, name: teamAName, logo: teamALogo },
          { id: "B" as const, name: teamBName, logo: teamBLogo },
        ] as const
      ).map((team) => {
        const selected = side === team.id;
        return (
          <button
            key={team.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`match-lineups-team-switch-btn${selected ? " match-lineups-team-switch-btn--active" : ""}`}
            onClick={() => onChange(team.id)}
          >
            {team.logo && (
              <OrgImage
                src={team.logo}
                alt=""
                width={20}
                height={20}
                className="match-lineups-team-switch-logo"
              />
            )}
            <span className="match-lineups-team-switch-label">{team.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function buildEditionTeamSideMap(
  lineups: MatchLineup[],
  teamAId: string,
  teamBId: string,
  match: Match,
): Map<string, "A" | "B"> {
  const map = new Map<string, "A" | "B">();

  for (const row of lineups) {
    if (!row.edition_team_id) continue;
    const tid = row.edition_teams?.team_id;
    if (tid === teamAId || tid === match.team_a_id) {
      map.set(row.edition_team_id, "A");
    } else if (tid === teamBId || tid === match.team_b_id) {
      map.set(row.edition_team_id, "B");
    }
  }

  return map;
}

function resolveLineupSide(
  teamId: string | undefined,
  editionTeamId: string,
  editionSideMap: Map<string, "A" | "B">,
  teamAId: string,
  teamBId: string,
  match: Match,
): "A" | "B" {
  if (teamId === teamAId || teamId === match.team_a_id) return "A";
  if (teamId === teamBId || teamId === match.team_b_id) return "B";
  const byEdition = editionSideMap.get(editionTeamId);
  if (byEdition) return byEdition;
  return "B";
}

function splitByTeam(
  lineups: MatchLineup[],
  staffLineups: MatchStaffLineup[],
  teamAId: string,
  teamBId: string,
  match: Match,
) {
  const playersA: MatchLineup[] = [];
  const playersB: MatchLineup[] = [];
  const staffA: MatchStaffLineup[] = [];
  const staffB: MatchStaffLineup[] = [];
  const editionSideMap = buildEditionTeamSideMap(
    lineups,
    teamAId,
    teamBId,
    match,
  );

  for (const row of lineups) {
    const side = resolveLineupSide(
      row.edition_teams?.team_id,
      row.edition_team_id,
      editionSideMap,
      teamAId,
      teamBId,
      match,
    );
    if (side === "A") playersA.push(row);
    else playersB.push(row);
  }

  for (const row of staffLineups) {
    const side = resolveLineupSide(
      row.edition_teams?.team_id,
      row.edition_team_id,
      editionSideMap,
      teamAId,
      teamBId,
      match,
    );
    if (side === "A") staffA.push(row);
    else staffB.push(row);
  }

  return {
    playersA: sortLineupsForFormation(playersA),
    playersB: sortLineupsForFormation(playersB),
    staffA: sortStaffBySurname(staffA),
    staffB: sortStaffBySurname(staffB),
  };
}

function teamSwitchLabel(
  team: Match["teams_a"],
  fallback: string,
): string {
  return team?.short_name ?? team?.abbreviation ?? team?.full_name ?? fallback;
}

export function MatchLineupsList({
  match,
  lineups,
  staffLineups,
  ratings,
  actions,
  teamAId,
}: MatchLineupsListProps) {
  const [mobileTeam, setMobileTeam] = useState<LineupTeamSide>("A");

  const publicRatings =
    match.ratings_are_public ??
    match.phases?.competition_editions?.ratings_are_public ??
    false;
  const visibleRatings = publicRatings === true ? ratings : [];
  const ratingsMap = buildMatchRatingsMap(visibleRatings);
  const teamBId = match.team_b_id ?? "";

  const { playersA, playersB, staffA, staffB } = splitByTeam(
    lineups,
    staffLineups,
    teamAId,
    teamBId,
    match,
  );

  const teamAName =
    match.teams_a?.full_name ?? match.teams_a?.short_name ?? "Time A";
  const teamBName =
    match.teams_b?.full_name ?? match.teams_b?.short_name ?? "Time B";
  const teamASwitchLabel = teamSwitchLabel(match.teams_a, "Time A");
  const teamBSwitchLabel = teamSwitchLabel(match.teams_b, "Time B");

  if (!playersA.length && !playersB.length && !staffA.length && !staffB.length) {
    return (
      <p className="match-empty-state">Escalações ainda não disponíveis.</p>
    );
  }

  return (
    <div className="match-lineups-list-wrap">
      <h2 className="match-lineups-title">Jogadores</h2>
      <LineupTeamSwitch
        side={mobileTeam}
        onChange={setMobileTeam}
        teamAName={teamASwitchLabel}
        teamBName={teamBSwitchLabel}
        teamALogo={match.teams_a?.logo_url}
        teamBLogo={match.teams_b?.logo_url}
      />
      <div
        className="match-lineups-grid"
        data-mobile-team={mobileTeam}
      >
        <TeamBlock
          side="A"
          teamName={teamAName}
          logoUrl={match.teams_a?.logo_url}
          players={playersA}
          staff={staffA}
          ratingsMap={ratingsMap}
          actions={actions}
        />
        <TeamBlock
          side="B"
          teamName={teamBName}
          logoUrl={match.teams_b?.logo_url}
          players={playersB}
          staff={staffB}
          ratingsMap={ratingsMap}
          actions={actions}
        />
      </div>
    </div>
  );
}
