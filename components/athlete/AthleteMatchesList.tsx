"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AthleteCompetitionFilter } from "@/components/athlete/AthleteCompetitionFilter";
import { CompetitionGalleryMatchCard } from "@/components/competition/CompetitionGalleryMatchCard";
import { MatchEventIcon } from "@/components/match/icons/MatchEventIcon";
import {
  isRedCardActionType,
  isStrictGoalActionType,
  isYellowCardActionType,
  isYellowRedCardActionType,
} from "@/lib/match/actionTypes";
import {
  resolveMatchIconKind,
  type MatchIconKind,
} from "@/lib/match/icons";
import type { AthleteProfileData, Competition, Match, Team } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

type MatchTeam = Pick<
  Team,
  "id" | "short_name" | "full_name" | "logo_url" | "abbreviation"
> | null | undefined;

const TEAM_PAGE_SIZE = 10;

const ATHLETE_ROW_ICON_KINDS = new Set<MatchIconKind>([
  "ball",
  "goal",
  "penalty",
  "yellowCard",
  "redCard",
  "yellowRedCard",
]);

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

function teamShortName(
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

function teamAbbreviation(
  team:
    | {
        abbreviation?: string | null;
        short_name?: string | null;
        full_name?: string;
      }
    | null
    | undefined,
  fallback: string,
): string {
  return (
    team?.abbreviation?.trim() ||
    team?.short_name?.trim()?.slice(0, 3).toUpperCase() ||
    team?.full_name?.trim()?.slice(0, 3).toUpperCase() ||
    fallback
  );
}

function editionSeasonLabel(
  seasons:
    | { name?: string | null }
    | { name?: string | null }[]
    | null
    | undefined,
): string {
  if (!seasons) return "";
  const season = Array.isArray(seasons) ? seasons[0] : seasons;
  return season?.name?.trim() || "";
}

function athleteActionIcons(
  actions: AthleteProfileData["recentMatches"][number]["actions"],
): MatchIconKind[] {
  const kinds: MatchIconKind[] = [];
  for (const action of actions) {
    const isGoal =
      isStrictGoalActionType(action.action_type) && !action.is_own_goal;
    const isCard =
      isYellowCardActionType(action.action_type) ||
      isRedCardActionType(action.action_type) ||
      isYellowRedCardActionType(action.action_type);
    if (!isGoal && !isCard) continue;
    const kind = resolveMatchIconKind(action);
    if (ATHLETE_ROW_ICON_KINDS.has(kind)) kinds.push(kind);
  }
  return kinds;
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
  /** Layout da linha de partida: atleta (padrão) ou time (Partidas do time). */
  variant?: "athlete" | "team";
}

export function AthleteMatchesList({
  matches,
  className = "",
  emptyMessage = "Nenhum jogo com presença encontrado para este atleta.",
  emptyFilterMessage = "Nenhuma partida nesta competição.",
  emptyEditionFilterMessage = "Nenhuma partida nesta edição.",
  enableEditionFilter = false,
  variant = "athlete",
}: AthleteMatchesListProps) {
  const [competitionId, setCompetitionId] = useState("all");
  const [editionId, setEditionId] = useState("all");
  const [page, setPage] = useState(0);

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
      const season = editionSeasonLabel(edition.seasons);
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

  useEffect(() => {
    setPage(0);
  }, [competitionId, editionId, filtered.length]);

  /** Grupos na ordem da partida mais recente de cada competição (variante atleta). */
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

  const teamPageCount = Math.max(1, Math.ceil(filtered.length / TEAM_PAGE_SIZE));
  const safePage = Math.min(page, teamPageCount - 1);
  const teamPageItems = useMemo(() => {
    if (variant !== "team") return [];
    const start = safePage * TEAM_PAGE_SIZE;
    return filtered.slice(start, start + TEAM_PAGE_SIZE);
  }, [variant, filtered, safePage]);

  if (matches.length === 0) {
    return (
      <section
        className={`athlete-matches-panel ${variant === "team" ? "athlete-matches-panel--team" : ""} ${className}`.trim()}
      >
        <p className="athlete-matches-empty">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section
      className={`athlete-matches-panel ${variant === "team" ? "athlete-matches-panel--team" : ""} ${className}`.trim()}
    >
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
      ) : variant === "team" ? (
        <>
          <ul className="athlete-matches-card-list athlete-matches-card-list--flat">
            {teamPageItems.map(({ match }) => (
              <li key={match.id} className="athlete-match-gallery-item">
                <CompetitionGalleryMatchCard
                  match={match}
                  index={0}
                  accentColor={
                    match.phases?.competition_editions?.competitions
                      ?.primary_color ?? undefined
                  }
                />
              </li>
            ))}
          </ul>
          {filtered.length > TEAM_PAGE_SIZE ? (
            <div className="athlete-matches-pager">
              <button
                type="button"
                className="athlete-matches-pager-btn"
                aria-label="Página anterior"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ‹
              </button>
              <span className="athlete-matches-pager-label">
                {safePage + 1}/{teamPageCount}
              </span>
              <button
                type="button"
                className="athlete-matches-pager-btn"
                aria-label="Próxima página"
                disabled={safePage >= teamPageCount - 1}
                onClick={() =>
                  setPage((p) => Math.min(teamPageCount - 1, p + 1))
                }
              >
                ›
              </button>
            </div>
          ) : null}
        </>
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
                  const finished = isMatchFinished(match.status);
                  const sides = resolveMatchSides(match);
                  const scoreA = finished ? (sides.scoreA ?? 0) : null;
                  const scoreB = finished ? (sides.scoreB ?? 0) : null;
                  const aLost =
                    finished &&
                    scoreA != null &&
                    scoreB != null &&
                    scoreA < scoreB;
                  const bLost =
                    finished &&
                    scoreA != null &&
                    scoreB != null &&
                    scoreB < scoreA;
                  const icons = athleteActionIcons(actions);
                  const athleteTeamId = match.athlete_team_id ?? null;
                  const onTeamA =
                    athleteTeamId != null && athleteTeamId === sides.teamA?.id;
                  const onTeamB =
                    athleteTeamId != null && athleteTeamId === sides.teamB?.id;
                  const actionsOnA = onTeamA || (!onTeamA && !onTeamB);
                  const actionsOnB = onTeamB;

                  const actionIcons = (
                    <span className="athlete-match-hub-actions" aria-hidden>
                      {icons.map((kind, index) => (
                        <MatchEventIcon
                          key={`${kind}-${index}`}
                          action={{ action_type: "goal" }}
                          iconKind={kind}
                          size={14}
                          className="athlete-match-hub-action-icon"
                        />
                      ))}
                    </span>
                  );

                  return (
                    <li key={match.id}>
                      <Link
                        href={`/jogos/${match.id}`}
                        className="athlete-match-row athlete-match-row--hub"
                      >
                        <div className="athlete-match-hub-meta">
                          <span className="athlete-match-hub-date">
                            {formatShortDate(match.match_date)}
                          </span>
                        </div>

                        <div className="athlete-match-hub-body">
                          <div
                            className={`athlete-match-hub-side ${aLost ? "athlete-match-hub-side--lost" : ""}`}
                          >
                            {sides.teamA?.logo_url ? (
                              <img
                                src={sides.teamA.logo_url}
                                alt=""
                                className="athlete-match-hub-logo"
                              />
                            ) : (
                              <span className="athlete-match-hub-logo athlete-match-hub-logo--ph" />
                            )}
                            <span className="athlete-match-hub-name">
                              <span className="athlete-match-hub-name-short">
                                {teamShortName(sides.teamA, "Time A")}
                              </span>
                              <span className="athlete-match-hub-name-abbr">
                                {teamAbbreviation(sides.teamA, "A")}
                              </span>
                            </span>
                            {actionsOnA ? actionIcons : (
                              <span className="athlete-match-hub-actions athlete-match-hub-actions--spacer" aria-hidden />
                            )}
                            <span
                              className={`athlete-match-hub-score ${aLost ? "athlete-match-hub-score--lost" : ""}`}
                            >
                              {scoreA != null ? scoreA : "–"}
                            </span>
                          </div>

                          <div
                            className={`athlete-match-hub-side ${bLost ? "athlete-match-hub-side--lost" : ""}`}
                          >
                            {sides.teamB?.logo_url ? (
                              <img
                                src={sides.teamB.logo_url}
                                alt=""
                                className="athlete-match-hub-logo"
                              />
                            ) : (
                              <span className="athlete-match-hub-logo athlete-match-hub-logo--ph" />
                            )}
                            <span className="athlete-match-hub-name">
                              <span className="athlete-match-hub-name-short">
                                {teamShortName(sides.teamB, "Time B")}
                              </span>
                              <span className="athlete-match-hub-name-abbr">
                                {teamAbbreviation(sides.teamB, "B")}
                              </span>
                            </span>
                            {actionsOnB ? actionIcons : (
                              <span className="athlete-match-hub-actions athlete-match-hub-actions--spacer" aria-hidden />
                            )}
                            <span
                              className={`athlete-match-hub-score ${bLost ? "athlete-match-hub-score--lost" : ""}`}
                            >
                              {scoreB != null ? scoreB : "–"}
                            </span>
                          </div>
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
                            {rating != null ? rating.toFixed(1) : "-"}
                          </span>
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
