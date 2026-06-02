"use client";

import { MatchRatingBadge } from "@/components/match/MatchRatingBadge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import {
  computeMatchStatRows,
  hasVisibleMatchStats,
  type MatchStatRow,
} from "@/lib/match/matchStats";
import { getTeamMatchAvgRating } from "@/lib/match/periodFouls";
import type { MatchTeamPeriodStat } from "@/lib/match/periodFouls";
import {
  statBarSegmentsFilled,
  useMatchStatBarSegmentCount,
} from "@/lib/hooks/useMatchStatBarSegmentCount";
import type { CSSProperties } from "react";
import type { Match, MatchAction } from "@/lib/types";

interface MatchStatisticsPanelProps {
  match: Match;
  actions: MatchAction[];
  teamAId: string;
  teamStats: MatchTeamPeriodStat[];
}

function StatBarHalf({
  filled,
  side,
  segmentCount,
}: {
  filled: number;
  side: "home" | "away";
  segmentCount: number;
}) {
  const on = statBarSegmentsFilled(filled, segmentCount);

  return (
    <div
      className={`match-stat-bar-half match-stat-bar-half--${side}`}
      style={{
        gridTemplateColumns: `repeat(${segmentCount}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: segmentCount }, (_, index) => {
        const active =
          side === "home"
            ? index >= segmentCount - on
            : index < on;
        return (
          <div
            key={index}
            className={
              active
                ? "match-stat-bar-segment match-stat-bar-segment--on"
                : "match-stat-bar-segment"
            }
          />
        );
      })}
    </div>
  );
}

function StatBar({ home, away }: { home: number; away: number }) {
  const segmentCount = useMatchStatBarSegmentCount();

  return (
    <div className="match-stat-bar" aria-hidden>
      <StatBarHalf filled={home} side="home" segmentCount={segmentCount} />
      <div className="match-stat-bar-axis" />
      <StatBarHalf filled={away} side="away" segmentCount={segmentCount} />
    </div>
  );
}

function convertedSubLabel(count: number | undefined): string | null {
  if (count == null || count <= 0) return null;
  return count === 1 ? "1 convertido" : `${count} convertidos`;
}

function StatValue({
  value,
  converted,
  align,
}: {
  value: number;
  converted?: number;
  align: "home" | "away";
}) {
  const sub = convertedSubLabel(converted);
  return (
    <div
      className={`match-stat-value-wrap match-stat-value-wrap--${align}`}
    >
      <span
        className={`match-stat-value match-stat-value--${align} tabular-nums`}
      >
        {value}
      </span>
      {sub && <span className="match-stat-sub">{sub}</span>}
    </div>
  );
}

function StatRowItem({ row }: { row: MatchStatRow }) {
  return (
    <li className="match-stat-row">
      <div className="match-stat-values">
        <StatValue value={row.home} converted={row.homeConverted} align="home" />
        <span className="match-stat-label">{row.label}</span>
        <StatValue value={row.away} converted={row.awayConverted} align="away" />
      </div>
      <StatBar home={row.home} away={row.away} />
    </li>
  );
}

export function MatchStatisticsPanel({
  match,
  actions,
  teamAId,
  teamStats,
}: MatchStatisticsPanelProps) {
  const teamBId = match.team_b_id ?? "";
  const rows = computeMatchStatRows(actions, teamAId, teamBId, teamStats);
  const competitionColor =
    match.phases?.competition_editions?.competitions?.primary_color ??
    "var(--color-brand, #bff205)";
  const statsStyle = {
    "--match-stat-accent": competitionColor,
  } as CSSProperties;

  const avgHome = getTeamMatchAvgRating(teamStats, teamAId);
  const avgAway = getTeamMatchAvgRating(teamStats, teamBId);

  if (!hasVisibleMatchStats(rows) && !avgHome && !avgAway) {
    return (
      <p className="match-empty-state">
        Nenhuma estatística registrada para esta partida.
      </p>
    );
  }

  return (
    <div className="match-stats" style={statsStyle}>
      <div className="match-stats-teams">
        <div className="match-stats-team-side match-stats-team-side--home">
          <TeamLogo team={match.teams_a} index={0} size={32} />
          {avgHome && <MatchRatingBadge rating={avgHome.avgRating} />}
        </div>
        <span className="match-stats-vs">vs</span>
        <div className="match-stats-team-side match-stats-team-side--away">
          {avgAway && <MatchRatingBadge rating={avgAway.avgRating} />}
          <TeamLogo team={match.teams_b} index={1} size={32} />
        </div>
      </div>

      {hasVisibleMatchStats(rows) && (
        <ul className="match-stats-list">
          {rows.map((row) => (
            <StatRowItem key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
