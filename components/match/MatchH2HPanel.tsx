"use client";

import { useMemo, useState } from "react";
import { MatchCard } from "@/components/home/MatchCard";
import { OrgImage } from "@/components/ui/OrgImage";
import { PillStepper } from "@/components/ui/PillStepper";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match, Team } from "@/lib/types";

interface MatchH2HPanelProps {
  match: Match;
  h2hMatches: Match[];
  upcomingA: Match[];
  upcomingB: Match[];
  teamAId: string;
  teamBId: string;
}

type EditionGroup = {
  key: string;
  title: string;
  logoUrl: string | null;
  matches: Match[];
};

function teamSigla(team: Team | null | undefined): string {
  return (
    team?.abbreviation?.trim() ||
    team?.short_name?.trim() ||
    team?.full_name?.trim()?.slice(0, 3).toUpperCase() ||
    "—"
  );
}

function editionTitle(m: Match): string {
  const edition = m.phases?.competition_editions;
  const competition =
    edition?.competitions?.short_name?.trim() ||
    edition?.competitions?.full_name?.trim() ||
    "Competição";
  const seasons = edition?.seasons;
  const editionName =
    edition?.custom_name?.trim() ||
    (Array.isArray(seasons)
      ? seasons[0]?.name?.trim()
      : seasons?.name?.trim()) ||
    null;
  return editionName ? `${competition} · ${editionName}` : competition;
}

function editionKey(m: Match): string {
  return m.phases?.edition_id || m.phases?.competition_editions?.id || "—";
}

function groupByEdition(matches: Match[]): EditionGroup[] {
  const map = new Map<string, EditionGroup>();

  for (const row of matches) {
    const key = editionKey(row);
    const existing = map.get(key);
    if (existing) {
      existing.matches.push(row);
      continue;
    }
    map.set(key, {
      key,
      title: editionTitle(row),
      logoUrl: row.phases?.competition_editions?.competitions?.logo_url ?? null,
      matches: [row],
    });
  }

  return [...map.values()].sort((a, b) => {
    const dateA = a.matches[0]?.match_date ?? "";
    const dateB = b.matches[0]?.match_date ?? "";
    return dateB.localeCompare(dateA);
  });
}

export function MatchH2HPanel({
  match,
  h2hMatches,
  upcomingA,
  upcomingB,
}: MatchH2HPanelProps) {
  const [mode, setMode] = useState<"upcoming" | "h2h">("upcoming");
  const [teamSide, setTeamSide] = useState<"a" | "b">("a");
  const [h2hScope, setH2hScope] = useState<"competition" | "all">(
    "competition",
  );

  const brand =
    match.phases?.competition_editions?.competitions?.primary_color ??
    "var(--color-brand)";
  const competitionId =
    match.phases?.competition_editions?.competitions?.id ?? null;

  const filteredH2H = useMemo(() => {
    const base =
      h2hScope === "competition" && competitionId
        ? h2hMatches.filter(
            (m) =>
              m.phases?.competition_editions?.competitions?.id ===
              competitionId,
          )
        : h2hMatches;
    return [...base].sort((a, b) =>
      (b.match_date ?? "").localeCompare(a.match_date ?? ""),
    );
  }, [h2hMatches, h2hScope, competitionId]);

  const h2hGroups = useMemo(
    () => groupByEdition(filteredH2H),
    [filteredH2H],
  );

  const upcoming = teamSide === "a" ? upcomingA : upcomingB;
  const teamAccent =
    (teamSide === "a"
      ? match.teams_a?.primary_color
      : match.teams_b?.primary_color) || brand;

  return (
    <div className="match-partidas-app">
      <div className="match-partidas-switches">
        <PillStepper
          items={[
            { id: "upcoming", label: "Próximos jogos" },
            { id: "h2h", label: "H-2-H" },
          ]}
          selectedId={mode}
          onSelect={(id) => setMode(id as "upcoming" | "h2h")}
          accentColor={brand}
          ariaLabel="Modo da aba partidas"
        />

        {mode === "upcoming" ? (
          <PillStepper
            items={[
              {
                id: "a",
                label: `${teamSigla(match.teams_a)}`,
              },
              {
                id: "b",
                label: `${teamSigla(match.teams_b)}`,
              },
            ]}
            selectedId={teamSide}
            onSelect={(id) => setTeamSide(id as "a" | "b")}
            accentColor={teamAccent}
            ariaLabel="Equipe"
            compact
          />
        ) : (
          <PillStepper
            items={[
              { id: "competition", label: "Nesta competição" },
              { id: "all", label: "Todas" },
            ]}
            selectedId={h2hScope}
            onSelect={(id) => setH2hScope(id as "competition" | "all")}
            accentColor={brand}
            ariaLabel="Escopo H2H"
          />
        )}
      </div>

      {mode === "upcoming" ? (
        <div className="match-partidas-team-hint">
          <TeamLogo
            team={teamSide === "a" ? match.teams_a : match.teams_b}
            index={teamSide === "a" ? 0 : 1}
            size={28}
          />
          <span>
            {teamSide === "a"
              ? (match.teams_a?.short_name ?? match.teams_a?.full_name)
              : (match.teams_b?.short_name ?? match.teams_b?.full_name)}
          </span>
        </div>
      ) : null}

      <div className="match-partidas-list">
        {mode === "upcoming" ? (
          upcoming.length ? (
            upcoming.map((row, index) => (
              <MatchCard key={row.id} match={row} index={index} />
            ))
          ) : (
            <p className="match-empty-state">Sem próximos jogos</p>
          )
        ) : h2hGroups.length ? (
          h2hGroups.map((group) => (
            <section key={group.key} className="match-partidas-group">
              <header className="match-partidas-group-head">
                {group.logoUrl ? (
                  <OrgImage
                    src={group.logoUrl}
                    alt=""
                    width={22}
                    height={22}
                    className="match-partidas-group-logo"
                  />
                ) : null}
                <h3 className="match-partidas-group-title">{group.title}</h3>
              </header>
              {group.matches.map((row, index) => (
                <MatchCard key={row.id} match={row} index={index} />
              ))}
            </section>
          ))
        ) : (
          <p className="match-empty-state">Sem confrontos anteriores</p>
        )}
      </div>
    </div>
  );
}
