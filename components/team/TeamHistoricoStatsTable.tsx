"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AthleteHubFilter } from "@/components/athlete/AthleteHubFilter";
import { MatchIcon } from "@/components/match/icons/MatchIcon";
import { OrgLogo } from "@/components/ui/OrgLogo";
import {
  SortableStatTh,
  toggleSortDirection,
} from "@/components/team/StatsTableControls";
import {
  enrichTeamEditionStatsWithCards,
  fetchTeamEditionStatsForPhases,
} from "@/lib/team/fetchTeamHistoricoStats";
import { phaseIdsForPhaseFilter, phaseFilterOptions } from "@/lib/team/phaseFilter";
import {
  TEAM_STATS_COLUMNS,
  type TeamCompetitionStatSortKey,
} from "@/lib/team/statsConfig";
import {
  buildCareerTotalsRow,
  buildStatsFilterOptions,
  buildTotalsFromEditionRows,
  filterEditionStats,
  groupEditionStatsBySeason,
  hasActiveStatsFilters,
  sliceFromEditionRow,
  sortStatsSliceRows,
  type TeamStatsFilterState,
  type TeamStatsNumericSlice,
} from "@/lib/team/teamStatsDisplay";
import type {
  AthleteStatsPhaseRecord,
  Team,
  TeamCareerSummary,
  TeamEditionStatRow,
} from "@/lib/types";

interface TeamHistoricoStatsTableProps {
  editionStats: TeamEditionStatRow[];
  careerSummary: TeamCareerSummary;
  team: Team & { id: string };
  statsPhases: AthleteStatsPhaseRecord[];
}

function StatsNumericCells({ row }: { row: TeamStatsNumericSlice }) {
  return (
    <>
      <td className="athlete-stats-num">{row.matches_played}</td>
      <td className="athlete-stats-num">{row.wins}</td>
      <td className="athlete-stats-num">{row.draws}</td>
      <td className="athlete-stats-num">{row.losses}</td>
      <td className="athlete-stats-num">{row.goals_scored}</td>
      <td className="athlete-stats-num">{row.goals_conceded}</td>
      <td className="athlete-stats-num athlete-stats-num--pts">
        {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
      </td>
      <td className="athlete-stats-num">{row.yellow_cards}</td>
      <td className="athlete-stats-num">{row.red_cards}</td>
    </>
  );
}

interface StatsDataRowProps {
  variant: "total" | "season" | "competition";
  label: ReactNode;
  stats: TeamStatsNumericSlice;
  indent?: boolean;
  expanded?: boolean;
  interactive?: boolean;
  onActivate?: () => void;
}

function StatsDataRow({
  variant,
  label,
  stats,
  indent = false,
  expanded = false,
  interactive = false,
  onActivate,
}: StatsDataRowProps) {
  const rowClass = [
    "athlete-stats-row",
    `athlete-stats-row--${variant}`,
    expanded ? "athlete-stats-row--expanded" : "",
    interactive ? "athlete-stats-row--interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sharedProps = interactive
    ? {
        onClick: onActivate,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate?.();
          }
        },
        tabIndex: 0,
        role: "button" as const,
        "aria-expanded": expanded,
      }
    : {};

  return (
    <tr className={rowClass} {...sharedProps}>
      <td
        className={[
          "athlete-stats-label",
          indent ? "athlete-stats-label--child" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </td>
      <StatsNumericCells row={stats} />
    </tr>
  );
}

export function TeamHistoricoStatsTable({
  editionStats,
  careerSummary,
  team,
  statsPhases,
}: TeamHistoricoStatsTableProps) {
  const [year, setYear] = useState("all");
  const [seasonId, setSeasonId] = useState("all");
  const [competitionId, setCompetitionId] = useState("all");
  const [phaseKey, setPhaseKey] = useState("all");
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<TeamCompetitionStatSortKey>("goal_difference");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [enrichedEditionStats, setEnrichedEditionStats] =
    useState<TeamEditionStatRow[]>(editionStats);
  const [phaseEditionStats, setPhaseEditionStats] = useState<TeamEditionStatRow[] | null>(
    null,
  );
  const [cardsLoading, setCardsLoading] = useState(true);
  const [phaseLoading, setPhaseLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCardsLoading(true);
    enrichTeamEditionStatsWithCards(team.id, editionStats).then((rows) => {
      if (!cancelled) {
        setEnrichedEditionStats(rows);
        setCardsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [team.id, editionStats]);

  const filterOptions = useMemo(
    () => buildStatsFilterOptions(enrichedEditionStats, year),
    [enrichedEditionStats, year],
  );

  const phaseOptions = useMemo(
    () => phaseFilterOptions(statsPhases, competitionId),
    [statsPhases, competitionId],
  );

  const filters: TeamStatsFilterState = useMemo(
    () => ({ year, seasonId, competitionId, phaseKey }),
    [year, seasonId, competitionId, phaseKey],
  );

  const phaseIdsInFilter = useMemo(
    () => phaseIdsForPhaseFilter(statsPhases, competitionId, phaseKey),
    [statsPhases, competitionId, phaseKey],
  );

  useEffect(() => {
    if (phaseIdsInFilter == null) {
      setPhaseEditionStats(null);
      setPhaseLoading(false);
      return;
    }

    if (phaseIdsInFilter.length === 0) {
      setPhaseEditionStats([]);
      setPhaseLoading(false);
      return;
    }

    let cancelled = false;
    setPhaseLoading(true);
    fetchTeamEditionStatsForPhases(
      team.id,
      phaseIdsInFilter,
      enrichedEditionStats,
    ).then((rows) => {
      if (!cancelled) {
        setPhaseEditionStats(rows);
        setPhaseLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [phaseIdsInFilter, team.id, enrichedEditionStats]);

  const tableEditionStats = useMemo(() => {
    if (phaseIdsInFilter != null) {
      return filterEditionStats(phaseEditionStats ?? [], filters);
    }
    return filterEditionStats(enrichedEditionStats, filters);
  }, [phaseIdsInFilter, phaseEditionStats, enrichedEditionStats, filters]);

  const seasonGroups = useMemo(() => {
    const groups = groupEditionStatsBySeason(tableEditionStats, null);
    return sortStatsSliceRows(groups, sortKey, sortDir);
  }, [tableEditionStats, sortKey, sortDir]);

  const filtersActive = hasActiveStatsFilters(filters);

  const cardTotals = useMemo(
    () => ({
      yellow_cards: enrichedEditionStats.reduce(
        (sum, row) => sum + (row.yellow_cards ?? 0),
        0,
      ),
      red_cards: enrichedEditionStats.reduce(
        (sum, row) => sum + (row.red_cards ?? 0),
        0,
      ),
    }),
    [enrichedEditionStats],
  );

  const totalsRow = useMemo(() => {
    if (!filtersActive) return buildCareerTotalsRow(careerSummary, cardTotals);
    return buildTotalsFromEditionRows(tableEditionStats);
  }, [filtersActive, careerSummary, cardTotals, tableEditionStats]);

  const flatSeasonRows = competitionId !== "all";

  const showSeasonFilter = year !== "all";
  const showPhaseFilter = competitionId !== "all";
  const tableLoading = cardsLoading || phaseLoading;

  const handleSort = (key: string) => {
    const k = key as TeamCompetitionStatSortKey;
    setSortDir(toggleSortDirection(sortKey, k, sortDir));
    setSortKey(k);
  };

  const toggleSeason = (key: string) => {
    setExpandedSeason((prev) => (prev === key ? null : key));
  };

  const colSpan = 1 + TEAM_STATS_COLUMNS.length;

  return (
    <section className="athlete-historico-block athlete-stats-section">
      <h2 className="athlete-section-title">Histórico em competições</h2>

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
            setExpandedSeason(null);
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
              setExpandedSeason(null);
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
            setExpandedSeason(null);
          }}
          options={filterOptions.competitions}
          allLabel="Todas"
          showLogo
        />
        {showPhaseFilter ? (
          <AthleteHubFilter
            ariaLabel="Filtrar por fase"
            value={phaseKey}
            onChange={(id) => {
              setPhaseKey(id);
              setExpandedSeason(null);
            }}
            options={phaseOptions}
            allLabel="Todas as fases"
            showLogo={false}
          />
        ) : null}
      </div>

      <div className="athlete-stats-table-wrap">
        <table className="athlete-stats-table">
          <colgroup>
            <col className="athlete-stats-col-label" />
            <col className="athlete-stats-col-num" span={TEAM_STATS_COLUMNS.length} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="athlete-stats-th-label">
                Temporada
              </th>
              {TEAM_STATS_COLUMNS.map((col) => (
                <SortableStatTh
                  key={col.abbr}
                  abbr={col.abbr}
                  label={col.label}
                  icon={col.icon}
                  sortKey={col.sortKey}
                  activeSortKey={sortKey}
                  direction={sortDir}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            <StatsDataRow
              variant="total"
              label={<span className="athlete-stats-total-label">TOTAL</span>}
              stats={totalsRow}
            />

            {tableLoading ? (
              <tr>
                <td colSpan={colSpan} className="athlete-stats-empty">
                  Carregando estatísticas…
                </td>
              </tr>
            ) : seasonGroups.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="athlete-stats-empty">
                  Nenhum dado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              seasonGroups.map((group) => {
                if (flatSeasonRows) {
                  return (
                    <StatsDataRow
                      key={group.key}
                      variant="season"
                      stats={group.summary}
                      label={
                        <span className="athlete-stats-season-name">{group.seasonName}</span>
                      }
                    />
                  );
                }

                const expanded = expandedSeason === group.key;

                return (
                  <Fragment key={group.key}>
                    <StatsDataRow
                      variant="season"
                      interactive
                      expanded={expanded}
                      onActivate={() => toggleSeason(group.key)}
                      stats={group.summary}
                      label={
                        <span className="athlete-stats-season-inner">
                          <span className="athlete-stats-chevron" aria-hidden>
                            {expanded ? "▾" : "▸"}
                          </span>
                          <span className="athlete-stats-season-name">{group.seasonName}</span>
                        </span>
                      }
                    />

                    {expanded &&
                      group.competitions.map((row) => {
                        const comp = row.competition_editions?.competitions;
                        const compLabel =
                          comp?.short_name?.trim() ||
                          comp?.full_name?.trim() ||
                          "Competição";

                        return (
                          <StatsDataRow
                            key={`${row.edition_id}`}
                            variant="competition"
                            indent
                            stats={sliceFromEditionRow(row)}
                            label={
                              <span className="athlete-stats-comp-inner">
                                <OrgLogo
                                  src={comp?.logo_url}
                                  size={18}
                                  className="athlete-stats-comp-logo"
                                />
                                <span className="athlete-stats-comp-name">{compLabel}</span>
                              </span>
                            }
                          />
                        );
                      })}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="athlete-stats-legend">
        <p className="athlete-stats-legend-title">Legenda</p>
        <ul className="athlete-stats-legend-list">
          {TEAM_STATS_COLUMNS.map(({ abbr, label, icon }) => (
            <li key={abbr}>
              <span className="athlete-stats-legend-abbr">
                {icon ? (
                  <MatchIcon
                    name={icon}
                    size={14}
                    className="athlete-stats-legend-icon"
                    tinted
                  />
                ) : (
                  abbr
                )}
              </span>
              <span className="athlete-stats-legend-desc">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
