"use client";

import {
  Fragment,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AthleteHubFilter } from "@/components/athlete/AthleteHubFilter";
import { OrgLogo } from "@/components/ui/OrgLogo";
import { TEAM_STATS_COLUMNS } from "@/lib/team/statsConfig";
import {
  buildCareerTotalsRow,
  buildStatsFilterOptions,
  buildTotalsFromEditionRows,
  filterEditionStats,
  groupEditionStatsBySeason,
  hasActiveStatsFilters,
  sliceFromEditionRow,
  type TeamStatsFilterState,
  type TeamStatsNumericSlice,
} from "@/lib/team/teamStatsDisplay";
import type { Team, TeamCareerSummary, TeamEditionStatRow } from "@/lib/types";

interface TeamEstatisticasTabProps {
  editionStats: TeamEditionStatRow[];
  careerSummary: TeamCareerSummary;
  team: Team & { id: string };
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
      <td className="athlete-stats-num athlete-stats-num--pts">{row.points}</td>
    </>
  );
}

interface StatsDataRowProps {
  variant: "total" | "season" | "competition";
  label: ReactNode;
  teamLogoUrl: string | null | undefined;
  stats: TeamStatsNumericSlice;
  indent?: boolean;
  expanded?: boolean;
  interactive?: boolean;
  onActivate?: () => void;
}

function StatsDataRow({
  variant,
  label,
  teamLogoUrl,
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
      <td className="athlete-stats-team">
        <OrgLogo src={teamLogoUrl} size={22} className="athlete-stats-team-logo" />
      </td>
      <StatsNumericCells row={stats} />
    </tr>
  );
}

export function TeamEstatisticasTab({
  editionStats,
  careerSummary,
  team,
}: TeamEstatisticasTabProps) {
  const [year, setYear] = useState("all");
  const [competitionId, setCompetitionId] = useState("all");
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  const filterOptions = useMemo(
    () => buildStatsFilterOptions(editionStats),
    [editionStats],
  );

  const filters: TeamStatsFilterState = useMemo(
    () => ({ year, competitionId }),
    [year, competitionId],
  );

  const tableEditionStats = useMemo(
    () => filterEditionStats(editionStats, filters),
    [editionStats, filters],
  );

  const seasonGroups = useMemo(
    () => groupEditionStatsBySeason(tableEditionStats, team.logo_url ?? null),
    [tableEditionStats, team.logo_url],
  );

  const filtersActive = hasActiveStatsFilters(filters);

  const totalsRow = useMemo(() => {
    if (!filtersActive) return buildCareerTotalsRow(careerSummary);
    return buildTotalsFromEditionRows(tableEditionStats);
  }, [filtersActive, careerSummary, tableEditionStats]);

  const flatSeasonRows = competitionId !== "all";

  const toggleSeason = (key: string) => {
    setExpandedSeason((prev) => (prev === key ? null : key));
  };

  return (
    <div className="athlete-estatisticas-tab space-y-3">
      <section className="athlete-historico-block athlete-stats-section">
        <div className="athlete-stats-filters athlete-stats-filters--team">
          <AthleteHubFilter
            ariaLabel="Filtrar por ano"
            value={year}
            onChange={(id) => {
              setYear(id);
              setExpandedSeason(null);
            }}
            options={filterOptions.years}
            allLabel="Todos os anos"
            showLogo={false}
          />
          <AthleteHubFilter
            ariaLabel="Filtrar por competição"
            value={competitionId}
            onChange={(id) => {
              setCompetitionId(id);
              setExpandedSeason(null);
            }}
            options={filterOptions.competitions}
            allLabel="Todas"
            showLogo
          />
        </div>

        <div className="athlete-stats-table-wrap">
          <table className="athlete-stats-table">
            <colgroup>
              <col className="athlete-stats-col-label" />
              <col className="athlete-stats-col-team" />
              <col className="athlete-stats-col-num" span={7} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="athlete-stats-th-label">
                  Temporada
                </th>
                <th scope="col" className="athlete-stats-th-team">
                  Comp.
                </th>
                {TEAM_STATS_COLUMNS.map((col) => (
                  <th key={col.abbr} scope="col">
                    {col.abbr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <StatsDataRow
                variant="total"
                label={<span className="athlete-stats-total-label">TOTAL</span>}
                teamLogoUrl={team.logo_url}
                stats={totalsRow}
              />

              {seasonGroups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="athlete-stats-empty">
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
                        teamLogoUrl={group.teamLogoUrl}
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
                        teamLogoUrl={group.teamLogoUrl}
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
                              teamLogoUrl={comp?.logo_url}
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
            {TEAM_STATS_COLUMNS.map(({ abbr, label }) => (
              <li key={abbr}>
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
