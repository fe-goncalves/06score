"use client";

import { useMemo, useState, type ReactNode } from "react";
import { editionLabel } from "@/components/competition/EditionSelector";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { EntityAvatar } from "@/components/ui/EntityAvatar";
import { LiquidGlassListRow } from "@/components/ui/LiquidGlassListRow";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { positionAbbreviation } from "@/lib/team/squadDisplay";
import { matchesQuery, normalizeQuery } from "@/lib/search/normalizeQuery";
import { venueShortName } from "@/lib/venue/display";
import type {
  AthleteListItem,
  Competition,
  CompetitionEdition,
  OrgVenue,
  StaffListItem,
  Team,
} from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

export interface SearchPageData {
  athletes: AthleteListItem[];
  teams: Team[];
  competitions: Competition[];
  staff: StaffListItem[];
  venues: OrgVenue[];
}

const AVATAR = 44;

function currentEdition(
  competition: Competition,
): CompetitionEdition | null {
  const editions = competition.competition_editions ?? [];
  if (!editions.length) return null;
  return editions.find((edition) => edition.is_current) ?? editions[0] ?? null;
}

function competitionEditionName(competition: Competition): string {
  const edition = currentEdition(competition);
  return edition ? editionLabel(edition) : "—";
}

export function SearchPageClient({
  athletes,
  teams,
  competitions,
  staff,
  venues,
}: SearchPageData) {
  const [term, setTerm] = useState("");
  const query = normalizeQuery(term);

  const results = useMemo(() => {
    if (!query) {
      return {
        athletes: [] as AthleteListItem[],
        teams: [] as Team[],
        competitions: [] as Competition[],
        staff: [] as StaffListItem[],
        venues: [] as OrgVenue[],
      };
    }

    return {
      athletes: athletes.filter(
        (athlete) =>
          matchesQuery(athlete.full_name, query) ||
          matchesQuery(athlete.surname, query) ||
          matchesQuery(athlete.current_team?.full_name, query) ||
          matchesQuery(athlete.current_team?.short_name, query) ||
          matchesQuery(athlete.current_team?.abbreviation, query) ||
          matchesQuery(positionAbbreviation(athlete.player_positions), query),
      ),
      teams: teams.filter(
        (team) =>
          matchesQuery(team.full_name, query) ||
          matchesQuery(team.short_name, query) ||
          matchesQuery(team.abbreviation, query),
      ),
      competitions: competitions.filter(
        (competition) =>
          matchesQuery(competition.full_name, query) ||
          matchesQuery(competition.short_name, query) ||
          matchesQuery(competitionEditionName(competition), query),
      ),
      staff: staff.filter(
        (member) =>
          matchesQuery(member.full_name, query) ||
          matchesQuery(member.surname, query) ||
          matchesQuery(member.role, query) ||
          matchesQuery(member.current_team?.full_name, query) ||
          matchesQuery(member.current_team?.short_name, query) ||
          matchesQuery(member.current_team?.abbreviation, query),
      ),
      venues: venues.filter(
        (venue) =>
          matchesQuery(venue.full_name, query) ||
          matchesQuery(venue.short_name, query) ||
          matchesQuery(venue.address, query) ||
          matchesQuery(venue.city, query) ||
          matchesQuery(venue.state, query),
      ),
    };
  }, [athletes, teams, competitions, staff, venues, query]);

  const total =
    results.athletes.length +
    results.teams.length +
    results.competitions.length +
    results.staff.length +
    results.venues.length;

  const showIdle = !query;
  const showEmpty = !showIdle && total === 0;

  return (
    <>
      <SiteListHero
        title="PESQUISAR"
        searchId="pesquisa-search"
        searchValue={term}
        onSearchChange={setTerm}
        searchAutoFocus
      />
      <SectionEnter className="page-container pb-14 pt-2">
        {showIdle ? (
          <p className="liquid-glass-list-empty">
            Digite para pesquisar entre atletas, equipes, competições, comissões
            técnicas e arenas.
          </p>
        ) : showEmpty ? (
          <p className="liquid-glass-list-empty">Nenhum resultado encontrado.</p>
        ) : (
          <div className="space-y-6">
            <p className="liquid-glass-list-meta">
              {total} {total === 1 ? "resultado" : "resultados"}
            </p>

            {results.competitions.length > 0 ? (
              <SearchGroup title="Competições">
                {results.competitions.map((competition) => (
                  <LiquidGlassListRow
                    key={competition.id}
                    href={`/competicoes/${competition.id}`}
                    accentColor={competition.primary_color}
                  >
                    <EntityAvatar
                      kind="competition"
                      src={competition.logo_url}
                      alt={competition.full_name}
                      size={AVATAR}
                    />
                    <span className="liquid-glass-list-tag">
                      {competitionEditionName(competition)}
                    </span>
                    <span className="liquid-glass-list-name">
                      {competition.full_name}
                    </span>
                  </LiquidGlassListRow>
                ))}
              </SearchGroup>
            ) : null}

            {results.teams.length > 0 ? (
              <SearchGroup title="Equipes">
                {results.teams.map((team) => {
                  const abbr =
                    team.abbreviation?.trim() ||
                    team.short_name?.trim() ||
                    team.full_name.slice(0, 3).toUpperCase();

                  return (
                    <LiquidGlassListRow
                      key={team.id}
                      href={`/times/${team.id}`}
                      accentColor={team.primary_color}
                    >
                      <TeamLogo
                        team={team}
                        size={AVATAR}
                        className="liquid-glass-list-logo"
                      />
                      <span className="liquid-glass-list-tag">{abbr}</span>
                      <span className="liquid-glass-list-name">{team.full_name}</span>
                    </LiquidGlassListRow>
                  );
                })}
              </SearchGroup>
            ) : null}

            {results.athletes.length > 0 ? (
              <SearchGroup title="Atletas">
                {results.athletes.map((athlete) => {
                  const nickname = athleteSurnameLabel(
                    athlete.full_name,
                    athlete.surname,
                  );
                  const position = positionAbbreviation(athlete.player_positions);

                  return (
                    <LiquidGlassListRow
                      key={athlete.id}
                      href={`/atletas/${athlete.id}`}
                      accentColor={athlete.current_team?.primary_color}
                    >
                      <EntityAvatar
                        kind="athlete"
                        src={athlete.photo_url}
                        alt={athlete.full_name}
                        size={AVATAR}
                      />
                      <TeamLogo
                        team={athlete.current_team}
                        size={22}
                        className="liquid-glass-list-team-logo"
                      />
                      {position ? (
                        <span className="liquid-glass-list-position">{position}</span>
                      ) : null}
                      <span className="liquid-glass-list-strong">{nickname}</span>
                    </LiquidGlassListRow>
                  );
                })}
              </SearchGroup>
            ) : null}

            {results.staff.length > 0 ? (
              <SearchGroup title="Comissão técnica">
                {results.staff.map((member) => {
                  const nickname = athleteSurnameLabel(
                    member.full_name,
                    member.surname,
                  );

                  return (
                    <LiquidGlassListRow
                      key={member.id}
                      href={`/comissao/${member.id}`}
                      accentColor={member.current_team?.primary_color}
                    >
                      <EntityAvatar
                        kind="staff"
                        src={member.photo_url}
                        alt={member.full_name}
                        size={AVATAR}
                      />
                      <TeamLogo
                        team={member.current_team}
                        size={22}
                        className="liquid-glass-list-team-logo"
                      />
                      {member.role ? (
                        <span className="liquid-glass-list-position">{member.role}</span>
                      ) : null}
                      <span className="liquid-glass-list-strong">{nickname}</span>
                    </LiquidGlassListRow>
                  );
                })}
              </SearchGroup>
            ) : null}

            {results.venues.length > 0 ? (
              <SearchGroup title="Arenas">
                {results.venues.map((venue) => {
                  const shortName = venueShortName(venue);

                  return (
                    <LiquidGlassListRow
                      key={venue.id}
                      href={`/arenas/${venue.id}`}
                      accentColor="var(--color-brand)"
                    >
                      <EntityAvatar
                        kind="arena"
                        src={venue.logo_url ?? venue.image_url}
                        alt={venue.full_name}
                        size={AVATAR}
                      />
                      <span className="liquid-glass-list-strong">{shortName}</span>
                      <span className="liquid-glass-list-muted">{venue.full_name}</span>
                    </LiquidGlassListRow>
                  );
                })}
              </SearchGroup>
            ) : null}
          </div>
        )}
      </SectionEnter>
    </>
  );
}

function SearchGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="liquid-glass-list-group-title">{title}</h2>
      <div className="liquid-glass-list">{children}</div>
    </section>
  );
}
