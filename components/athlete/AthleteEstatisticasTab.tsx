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
import {
  buildCareerTotalsRow,
  buildStatsFilterOptions,
  buildTotalsFromEditionRows,
  filterEditionStats,
  formatAvgRating,
  groupEditionStatsBySeason,
  hasActiveStatsFilters,
  ratingToneClass,
  sliceFromEditionRow,
  type AthleteStatsFilterState,
  type AthleteStatsNumericSlice,
} from "@/lib/athlete/athleteStatsDisplay";
import {
  buildEditionStatsFromPhaseMatches,
  groupPhasesForCompetition,
} from "@/lib/athlete/athleteStatsPhases";
import { formatRate } from "@/lib/athlete/statsRates";
import {
  statsColumnsForKind,
  type HubProfileKind,
  type StatsColumnDef,
  type StatsColumnKey,
} from "@/lib/athlete/statsConfig";
import type { AthleteEditionStatRow, AthleteProfileData, Team } from "@/lib/types";

interface AthleteEstatisticasTabProps {
  editionStats: AthleteProfileData["editionStats"];
  careerStats: AthleteProfileData["careerStats"];
  recentMatches: AthleteProfileData["recentMatches"];
  statsPhases: AthleteProfileData["statsPhases"];
  currentTeam: Pick<Team, "full_name" | "abbreviation" | "logo_url"> | null;
  profileKind?: HubProfileKind;
}

function RatingCell({ value }: { value: number | null }) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="athlete-stats-rating-empty">—</span>;
  }
  return (
    <span className={`athlete-stats-rating ${ratingToneClass(value)}`}>
      {formatAvgRating(value)}
    </span>
  );
}

function renderStatCellValue(
  key: StatsColumnKey,
  row: AthleteStatsNumericSlice,
  profileKind: HubProfileKind,
  variant: "total" | "season" | "competition",
): ReactNode {
  if (key === "avg_rating") {
    return <RatingCell value={row.avg_rating} />;
  }
  if (key === "penalties") {
    if (
      profileKind === "athlete" &&
      variant === "competition" &&
      row.penalties_taken <= 0
    ) {
      return "—";
    }
    return formatRate(row.penalties_scored, row.penalties_taken);
  }
  if (key === "shootouts") {
    if (
      profileKind === "athlete" &&
      variant === "competition" &&
      row.shootouts_taken <= 0
    ) {
      return "—";
    }
    return formatRate(row.shootouts_scored, row.shootouts_taken);
  }
  const value = row[key];
  return typeof value === "number" ? value : "—";
}

function StatsNumericCells({
  row,
  columns,
  profileKind,
  variant,
}: {
  row: AthleteStatsNumericSlice;
  columns: StatsColumnDef[];
  profileKind: HubProfileKind;
  variant: "total" | "season" | "competition";
}) {
  return (
    <>
      {columns.map((col) => (
        <td key={col.abbr} className="athlete-stats-num">
          {renderStatCellValue(col.key, row, profileKind, variant)}
        </td>
      ))}
    </>
  );
}

interface StatsDataRowProps {
  variant: "total" | "season" | "competition";
  label: ReactNode;
  teamLogoUrl: string | null | undefined;
  stats: AthleteStatsNumericSlice;
  columns: StatsColumnDef[];
  profileKind: HubProfileKind;
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
  columns,
  profileKind,
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
      <StatsNumericCells
        row={stats}
        columns={columns}
        profileKind={profileKind}
        variant={variant}
      />
    </tr>
  );
}

export function AthleteEstatisticasTab({
  editionStats,
  careerStats,
  recentMatches,
  statsPhases,
  currentTeam,
  profileKind = "athlete",
}: AthleteEstatisticasTabProps) {
  const statColumns = statsColumnsForKind(profileKind);
  const [teamId, setTeamId] = useState("all");
  const [year, setYear] = useState("all");
  const [competitionId, setCompetitionId] = useState("all");
  const [phaseKey, setPhaseKey] = useState("all");
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  const filterOptions = useMemo(
    () => buildStatsFilterOptions(editionStats),
    [editionStats],
  );

  const phaseOptions = useMemo(() => {
    if (competitionId === "all") return [];
    return groupPhasesForCompetition(statsPhases, competitionId);
  }, [statsPhases, competitionId]);

  const filters: AthleteStatsFilterState = useMemo(
    () => ({ teamId, year, competitionId }),
    [teamId, year, competitionId],
  );

  const selectedPhaseGroup = useMemo(
    () => phaseOptions.find((p) => p.key === phaseKey) ?? null,
    [phaseOptions, phaseKey],
  );

  const tableEditionStats = useMemo(() => {
    if (phaseKey !== "all" && selectedPhaseGroup) {
      return buildEditionStatsFromPhaseMatches(
        selectedPhaseGroup.phaseIds,
        recentMatches,
        filters,
        editionStats,
        profileKind,
      );
    }
    return filterEditionStats(editionStats, filters);
  }, [
    phaseKey,
    selectedPhaseGroup,
    recentMatches,
    filters,
    editionStats,
    profileKind,
  ]);

  const seasonGroups = useMemo(
    () => groupEditionStatsBySeason(tableEditionStats, profileKind),
    [tableEditionStats, profileKind],
  );

  const filtersActive = hasActiveStatsFilters(filters, phaseKey);

  const totalsRow = useMemo(() => {
    if (!filtersActive) return buildCareerTotalsRow(careerStats, profileKind);
    return buildTotalsFromEditionRows(tableEditionStats, profileKind);
  }, [filtersActive, careerStats, tableEditionStats, profileKind]);

  const flatSeasonRows =
    competitionId !== "all" && phaseKey !== "all" && selectedPhaseGroup != null;

  const showPhaseFilter = competitionId !== "all";

  const toggleSeason = (key: string) => {
    setExpandedSeason((prev) => (prev === key ? null : key));
  };

  return (
    <div className="athlete-estatisticas-tab space-y-3">
      <section className="athlete-historico-block athlete-stats-section">
        <div
          className={`athlete-stats-filters ${showPhaseFilter ? "athlete-stats-filters--with-phase" : ""}`}
        >
          <AthleteHubFilter
            ariaLabel="Filtrar por clube"
            value={teamId}
            onChange={(id) => {
              setTeamId(id);
              setExpandedSeason(null);
            }}
            options={filterOptions.teams}
            showLogo
          />
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
              setPhaseKey("all");
              setExpandedSeason(null);
            }}
            options={filterOptions.competitions}
            allLabel="Todas"
            showLogo
          />
          {showPhaseFilter && (
            <AthleteHubFilter
              ariaLabel="Filtrar por fase"
              value={phaseKey}
              onChange={(id) => {
                setPhaseKey(id);
                setExpandedSeason(null);
              }}
              options={phaseOptions.map((p) => ({ id: p.key, label: p.label }))}
              allLabel="Todas as fases"
              showLogo={false}
            />
          )}
        </div>

        <div className="athlete-stats-table-wrap">
          <table className="athlete-stats-table">
            <colgroup>
              <col className="athlete-stats-col-label" />
              <col className="athlete-stats-col-team" />
              <col className="athlete-stats-col-num" span={statColumns.length} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="athlete-stats-th-label">
                  Temporada
                </th>
                <th scope="col" className="athlete-stats-th-team">
                  Time
                </th>
                {statColumns.map((col) => (
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
                teamLogoUrl={currentTeam?.logo_url}
                stats={totalsRow}
                columns={statColumns}
                profileKind={profileKind}
              />

              {seasonGroups.length === 0 ? (
                <tr>
                  <td colSpan={2 + statColumns.length} className="athlete-stats-empty">
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
                        columns={statColumns}
                        profileKind={profileKind}
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
                        columns={statColumns}
                        profileKind={profileKind}
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
                        group.competitions.map((row: AthleteEditionStatRow) => {
                          const comp = row.competition_editions?.competitions;
                          const compLabel =
                            comp?.short_name?.trim() ||
                            comp?.full_name?.trim() ||
                            "Competição";

                          return (
                            <StatsDataRow
                              key={`${row.edition_id}-${row.team_id ?? "none"}`}
                              variant="competition"
                              indent
                              teamLogoUrl={row.teams?.logo_url}
                              stats={sliceFromEditionRow(row, profileKind)}
                              columns={statColumns}
                              profileKind={profileKind}
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
            {statColumns.map(({ abbr, label }) => (
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
