"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AthleteCompetitionFilter } from "@/components/athlete/AthleteCompetitionFilter";
import { isAssistActionType } from "@/lib/match/actionTypes";
import type { AthleteProfileData, Competition, Match, Team } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

type MatchTeam = Pick<Team, "id" | "short_name" | "full_name" | "logo_url"> | null | undefined;

/** Garante linha 1 = mandante (team_a) e linha 2 = visitante (team_b), com placar alinhado. */
function resolveMatchSides(match: Match) {
  const teamA =
    match.teams_a?.id === match.team_a_id
      ? match.teams_a
      : match.teams_b?.id === match.team_a_id
        ? match.teams_b
        : match.teams_a;
  const teamB =
    match.teams_b?.id === match.team_b_id
      ? match.teams_b
      : match.teams_a?.id === match.team_b_id
        ? match.teams_a
        : match.teams_b;

  return {
    teamA: teamA as MatchTeam,
    teamB: teamB as MatchTeam,
    scoreA: match.score_a,
    scoreB: match.score_b,
  };
}

function formatShortDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function teamDisplayName(
  team:
    | {
        short_name?: string | null;
        full_name?: string;
      }
    | null
    | undefined,
  fallback: string,
): string {
  return team?.short_name?.trim() || team?.full_name?.trim() || fallback;
}

function getMatchEvents(
  actions: AthleteProfileData["recentMatches"][number]["actions"],
) {
  return {
    goals: actions.filter((a) => a.action_type === "goal" && !a.is_own_goal).length,
    assists: actions.filter((a) => isAssistActionType(a.action_type)).length,
    yellowCards: actions.filter((a) => a.action_type === "yellow_card").length,
    redCards: actions.filter(
      (a) => a.action_type === "red_card" || a.action_type === "yellow_red_card",
    ).length,
  };
}

function ratingTone(rating: number | null): string {
  if (rating == null) return "athlete-match-rating--empty";
  if (rating >= 8) return "athlete-match-rating--elite";
  if (rating > 7) return "athlete-match-rating--high";
  if (rating >= 6) return "athlete-match-rating--mid";
  return "athlete-match-rating--low";
}

type MatchItem = AthleteProfileData["recentMatches"][number];

type CompetitionInfo = Pick<
  Competition,
  "id" | "full_name" | "short_name" | "logo_url"
> | null;

interface AthleteMatchesListProps {
  matches: AthleteProfileData["recentMatches"];
  className?: string;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  emptyEditionFilterMessage?: string;
  /** Exibe filtro por edição após escolher uma competição (página do time). */
  enableEditionFilter?: boolean;
}

export function AthleteMatchesList({
  matches,
  className = "",
  emptyMessage = "Nenhum jogo com presença encontrado para este atleta.",
  emptyFilterMessage = "Nenhuma partida nesta competição.",
  emptyEditionFilterMessage = "Nenhuma partida nesta edição.",
  enableEditionFilter = false,
}: AthleteMatchesListProps) {
  const [competitionId, setCompetitionId] = useState("all");
  const [editionId, setEditionId] = useState("all");

  const sorted = useMemo(
    () =>
      [...matches].sort((a, b) =>
        b.match.match_date.localeCompare(a.match.match_date),
      ),
    [matches],
  );

  const competitionOptions = useMemo(() => {
    const map = new Map<
      string,
      { id: string; label: string; logoUrl: string | null }
    >();
    for (const item of sorted) {
      const comp = item.match.phases?.competition_editions?.competitions;
      if (!comp?.id) continue;
      if (map.has(comp.id)) continue;
      map.set(comp.id, {
        id: comp.id,
        label: comp.short_name ?? comp.full_name ?? "Competição",
        logoUrl: comp.logo_url ?? null,
      });
    }
    return [...map.values()].sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR"),
    );
  }, [sorted]);

  const editionOptions = useMemo(() => {
    if (!enableEditionFilter || competitionId === "all") return [];
    const map = new Map<string, { id: string; label: string }>();
    for (const item of sorted) {
      const edition = item.match.phases?.competition_editions;
      const comp = edition?.competitions;
      if (comp?.id !== competitionId || !edition?.id) continue;
      if (map.has(edition.id)) continue;
      const season = edition.seasons?.name?.trim();
      map.set(edition.id, {
        id: edition.id,
        label: season || "Edição",
      });
    }
    return [...map.values()].sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR"),
    );
  }, [sorted, competitionId, enableEditionFilter]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (competitionId !== "all") {
      list = list.filter(
        (item) =>
          item.match.phases?.competition_editions?.competitions?.id ===
          competitionId,
      );
    }
    if (enableEditionFilter && editionId !== "all") {
      list = list.filter(
        (item) => item.match.phases?.competition_editions?.id === editionId,
      );
    }
    return list;
  }, [sorted, competitionId, editionId, enableEditionFilter]);

  /** Grupos na ordem da partida mais recente de cada competição */
  const grouped = useMemo(() => {
    const groups: { competition: CompetitionInfo; matches: MatchItem[] }[] = [];
    const indexByKey = new Map<string, number>();

    for (const item of filtered) {
      const comp = item.match.phases?.competition_editions?.competitions;
      const key = comp?.id ?? "other";
      let idx = indexByKey.get(key);
      if (idx === undefined) {
        idx = groups.length;
        indexByKey.set(key, idx);
        groups.push({ competition: comp ?? null, matches: [] });
      }
      groups[idx].matches.push(item);
    }
    return groups
      .map((group) => ({
        ...group,
        matches: [...group.matches].sort((a, b) =>
          b.match.match_date.localeCompare(a.match.match_date),
        ),
      }))
      .sort((a, b) =>
        b.matches[0]!.match.match_date.localeCompare(
          a.matches[0]!.match.match_date,
        ),
      );
  }, [filtered]);

  if (matches.length === 0) {
    return (
      <section className={`athlete-matches-panel ${className}`.trim()}>
        <p className="athlete-matches-empty">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className={`athlete-matches-panel ${className}`.trim()}>
      <div className="athlete-matches-toolbar athlete-matches-toolbar--inline">
        <AthleteCompetitionFilter
          value={competitionId}
          options={competitionOptions}
          onChange={(id) => {
            setCompetitionId(id);
            setEditionId("all");
          }}
        />
        {enableEditionFilter && competitionId !== "all" && editionOptions.length > 0 ? (
          <AthleteCompetitionFilter
            value={editionId}
            allLabel="Todas as edições"
            showLogo={false}
            options={editionOptions.map((o) => ({
              id: o.id,
              label: o.label,
              logoUrl: null,
            }))}
            onChange={setEditionId}
          />
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="athlete-matches-empty">
          {enableEditionFilter && editionId !== "all"
            ? emptyEditionFilterMessage
            : competitionId !== "all"
              ? emptyFilterMessage
              : emptyMessage}
        </p>
      ) : (
        <div className="athlete-matches-cards">
          {grouped.map((group) => (
            <article
              key={group.competition?.id ?? group.competition?.full_name ?? "other"}
              className="athlete-matches-card"
            >
              <header className="athlete-matches-card-head">
                {group.competition?.logo_url ? (
                  <img
                    src={group.competition.logo_url}
                    alt=""
                    className="athlete-matches-card-logo"
                  />
                ) : (
                  <span className="athlete-matches-card-logo athlete-matches-card-logo--ph" />
                )}
                <p className="athlete-matches-card-title">
                  {group.competition?.short_name ??
                    group.competition?.full_name ??
                    "Outras competições"}
                </p>
              </header>

              <ul className="athlete-matches-card-list">
                {group.matches.map(({ match, rating, actions }) => {
                  const events = getMatchEvents(actions);
                  const finished = isMatchFinished(match.status);
                  const sides = resolveMatchSides(match);
                  const scoreA = finished ? (sides.scoreA ?? 0) : null;
                  const scoreB = finished ? (sides.scoreB ?? 0) : null;

                  return (
                    <li key={match.id}>
                      <Link
                        href={`/jogos/${match.id}`}
                        className="athlete-match-row"
                      >
                        <div className="athlete-match-main">
                          <div className="athlete-match-meta">
                            <span className="athlete-match-date">
                              {formatShortDate(match.match_date)}
                            </span>
                            <span className="athlete-match-status">
                              {finished ? "FT" : match.match_time ?? "AG"}
                            </span>
                          </div>

                          <div className="athlete-match-body">
                          <div className="athlete-match-line">
                            {sides.teamA?.logo_url ? (
                              <img
                                src={sides.teamA.logo_url}
                                alt=""
                                className="athlete-match-team-logo"
                              />
                            ) : (
                              <span className="athlete-match-team-logo athlete-match-team-logo--ph" />
                            )}
                            <span className="athlete-match-team-name">
                              {teamDisplayName(sides.teamA, "Time A")}
                            </span>
                          </div>
                          <div className="athlete-match-line">
                            {sides.teamB?.logo_url ? (
                              <img
                                src={sides.teamB.logo_url}
                                alt=""
                                className="athlete-match-team-logo"
                              />
                            ) : (
                              <span className="athlete-match-team-logo athlete-match-team-logo--ph" />
                            )}
                            <span className="athlete-match-team-name">
                              {teamDisplayName(sides.teamB, "Time B")}
                            </span>
                          </div>
                          </div>
                        </div>

                        <div className="athlete-match-trailing">
                          <div className="athlete-match-events">
                            {events.goals > 0 && (
                              <span className="athlete-match-event" title="Gols">
                                ⚽{events.goals > 1 ? events.goals : ""}
                              </span>
                            )}
                            {events.assists > 0 && (
                              <span
                                className="athlete-match-event"
                                title="Assistências"
                              >
                                👟{events.assists > 1 ? events.assists : ""}
                              </span>
                            )}
                            {events.yellowCards > 0 && (
                              <span
                                className="athlete-match-event athlete-match-event--card"
                                title="Cartão amarelo"
                              />
                            )}
                            {events.redCards > 0 && (
                              <span
                                className="athlete-match-event athlete-match-event--card athlete-match-event--red"
                                title="Cartão vermelho"
                              />
                            )}
                          </div>
                          <div className="athlete-match-scores">
                            <span className="athlete-match-score-val">
                              {scoreA != null ? scoreA : "–"}
                            </span>
                            <span className="athlete-match-score-val">
                              {scoreB != null ? scoreB : "–"}
                            </span>
                          </div>
                          <div
                            className="athlete-match-rating"
                            aria-label={
                              rating != null
                                ? `Nota ${rating.toFixed(1)}`
                                : "Sem nota"
                            }
                          >
                            <span
                              className={`athlete-match-rating-badge ${ratingTone(rating)}`}
                            >
                              {rating != null ? rating.toFixed(1) : "—"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
