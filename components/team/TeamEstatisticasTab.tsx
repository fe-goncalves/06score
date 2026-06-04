"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { AthleteHubFilter } from "@/components/athlete/AthleteHubFilter";
import {
  SortableStatTh,
  StatsTablePager,
  toggleSortDirection,
} from "@/components/team/StatsTableControls";
import {
  fetchTeamAthleteStats,
  sortTeamAthleteRows,
  type TeamAthleteStatsScope,
  type TeamAthleteStatRow,
} from "@/lib/team/fetchTeamAthleteStats";
import { phaseIdsForPhaseFilter, phaseFilterOptions } from "@/lib/team/phaseFilter";
import {
  TEAM_ATHLETE_STATS_COLUMNS,
  TEAM_ATHLETE_STATS_PAGE_SIZE,
  type TeamAthleteStatSortKey,
  type TeamAthleteStatsColumnDef,
} from "@/lib/team/statsConfig";
import { buildStatsFilterOptions } from "@/lib/team/teamStatsDisplay";
import type {
  Athlete,
  AthleteStatsPhaseRecord,
  Team,
  TeamEditionStatRow,
} from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

interface TeamEstatisticasTabProps {
  team: Team & { id: string };
  squad: (Athlete & { id: string })[];
  editionStats: TeamEditionStatRow[];
  statsPhases: AthleteStatsPhaseRecord[];
}

function statsColClass(col: TeamAthleteStatsColumnDef): string {
  return col.mobileHidden
    ? "athlete-stats-col-num athlete-stats-col--desktop-only"
    : "athlete-stats-col-num athlete-stats-col-num--visible";
}

function statsCellClass(col: TeamAthleteStatsColumnDef): string {
  return col.mobileHidden
    ? "athlete-stats-num athlete-stats-col--desktop-only"
    : "athlete-stats-num athlete-stats-num--visible";
}

function statsHeaderClass(col: TeamAthleteStatsColumnDef): string {
  return col.mobileHidden ? "athlete-stats-col--desktop-only" : "";
}

function statValue(row: TeamAthleteStatRow, sortKey: TeamAthleteStatSortKey): number {
  return row[sortKey];
}

export function TeamEstatisticasTab({
  team,
  squad,
  editionStats,
  statsPhases,
}: TeamEstatisticasTabProps) {
  const [scope, setScope] = useState<TeamAthleteStatsScope>("current");
  const [year, setYear] = useState("all");
  const [seasonId, setSeasonId] = useState("all");
  const [competitionId, setCompetitionId] = useState("all");
  const [phaseKey, setPhaseKey] = useState("all");
  const [sortKey, setSortKey] = useState<TeamAthleteStatSortKey>("goals");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchTeamAthleteStats>>>([]);
  const [loading, setLoading] = useState(true);

  const squadIds = useMemo(() => squad.map((a) => a.id), [squad]);

  const teamEditionIds = useMemo(
    () => editionStats.map((row) => row.edition_id),
    [editionStats],
  );

  const filterOptions = useMemo(
    () => buildStatsFilterOptions(editionStats, year, seasonId, competitionId),
    [editionStats, year, seasonId, competitionId],
  );

  const phaseOptions = useMemo(
    () => phaseFilterOptions(statsPhases, competitionId),
    [statsPhases, competitionId],
  );

  const phaseIdsInFilter = useMemo(
    () => phaseIdsForPhaseFilter(statsPhases, competitionId, phaseKey),
    [statsPhases, competitionId, phaseKey],
  );

  const showSeasonFilter = year !== "all";
  const showPhaseFilter = competitionId !== "all";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTeamAthleteStats(
      team.id,
      scope,
      squadIds,
      {
        year,
        seasonId,
        competitionId,
        phaseIds: phaseIdsInFilter,
      },
      teamEditionIds,
    ).then((data) => {
      if (!cancelled) {
        setRows(data);
        setLoading(false);
        setPage(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [
    team.id,
    scope,
    squadIds,
    year,
    seasonId,
    competitionId,
    phaseIdsInFilter,
    teamEditionIds,
  ]);

  const sortedRows = useMemo(
    () => sortTeamAthleteRows(rows, sortKey, sortDir),
    [rows, sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / TEAM_ATHLETE_STATS_PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = page * TEAM_ATHLETE_STATS_PAGE_SIZE;
    return sortedRows.slice(start, start + TEAM_ATHLETE_STATS_PAGE_SIZE);
  }, [sortedRows, page]);

  const handleSort = (key: string) => {
    const k = key as TeamAthleteStatSortKey;
    setSortDir(toggleSortDirection(sortKey, k, sortDir));
    setSortKey(k);
    setPage(0);
  };

  return (
    <div className="athlete-estatisticas-tab space-y-3">
      <section className="athlete-historico-block athlete-stats-section">
        <div className="athlete-awards-head team-stats-scope-head">
          <div
            className="athlete-awards-switch"
            role="tablist"
            aria-label="Escopo das estatísticas"
          >
            <button
              type="button"
              role="tab"
              aria-selected={scope === "current"}
              className={`athlete-awards-switch-btn ${scope === "current" ? "athlete-awards-switch-btn--active" : ""}`}
              onClick={() => setScope("current")}
            >
              Elenco atual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scope === "all"}
              className={`athlete-awards-switch-btn ${scope === "all" ? "athlete-awards-switch-btn--active" : ""}`}
              onClick={() => setScope("all")}
            >
              Toda história
            </button>
          </div>
        </div>

        <div
          className={`athlete-stats-filters athlete-stats-filters--inline ${showPhaseFilter ? "athlete-stats-filters--with-phase" : ""}`}
        >
          <AthleteHubFilter
            ariaLabel="Filtrar por ano"
            value={year}
            onChange={(id) => {
              setYear(id);
              setSeasonId("all");
              setCompetitionId("all");
              setPhaseKey("all");
            }}
            options={filterOptions.years}
            allLabel="Todos os anos"
            showLogo={false}
          />
          {showSeasonFilter ? (
            <AthleteHubFilter
              ariaLabel="Filtrar por temporada"
              value={seasonId}
              onChange={(id) => {
              setSeasonId(id);
            }}
              options={filterOptions.seasons}
              allLabel="Todas as temporadas"
              showLogo={false}
            />
          ) : null}
          <AthleteHubFilter
            ariaLabel="Filtrar por competição"
            value={competitionId}
            onChange={(id) => {
              setCompetitionId(id);
              setPhaseKey("all");
            }}
            options={filterOptions.competitions}
            allLabel="Todas"
            showLogo
          />
          {showPhaseFilter ? (
            <AthleteHubFilter
              ariaLabel="Filtrar por fase"
              value={phaseKey}
              onChange={setPhaseKey}
              options={phaseOptions}
              allLabel="Todas as fases"
              showLogo={false}
            />
          ) : null}
        </div>

        <div className="athlete-stats-table-wrap">
          <table className="athlete-stats-table team-athlete-stats-table">
            <colgroup>
              <col className="athlete-stats-col-label" />
              {TEAM_ATHLETE_STATS_COLUMNS.map((col) => (
                <col key={col.sortKey} className={statsColClass(col)} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="athlete-stats-th-label">
                  Atleta
                </th>
                {TEAM_ATHLETE_STATS_COLUMNS.map((col) => (
                  <SortableStatTh
                    key={col.abbr}
                    abbr={col.abbr}
                    sortKey={col.sortKey}
                    activeSortKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className={statsHeaderClass(col)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="athlete-stats-empty">
                    Carregando estatísticas…
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="athlete-stats-empty">
                    Nenhuma estatística para este escopo.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.athlete.id} className="athlete-stats-row">
                    <td className="athlete-stats-label">
                      <Link
                        href={`/atletas/${row.athlete.id}`}
                        className="team-athlete-stats-name-link"
                      >
                        <OrgImage
                          src={row.athlete.photo_url}
                          alt=""
                          width={28}
                          height={28}
                          className="team-athlete-stats-photo"
                        />
                        <span>
                          {athleteSurnameLabel(
                            row.athlete.full_name,
                            row.athlete.surname,
                          )}
                        </span>
                      </Link>
                    </td>
                    {TEAM_ATHLETE_STATS_COLUMNS.map((col) => (
                      <td key={col.sortKey} className={statsCellClass(col)}>
                        {statValue(row, col.sortKey)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <StatsTablePager
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <div className="athlete-stats-legend">
          <p className="athlete-stats-legend-title">Legenda</p>
          <ul className="athlete-stats-legend-list">
            {TEAM_ATHLETE_STATS_COLUMNS.map(({ abbr, label, mobileHidden }) => (
              <li
                key={abbr}
                className={mobileHidden ? "athlete-stats-col--desktop-only" : undefined}
              >
                <span className="athlete-stats-legend-abbr">{abbr}</span>
                <span className="athlete-stats-legend-desc">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
