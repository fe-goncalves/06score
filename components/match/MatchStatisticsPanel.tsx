"use client";

import { TeamLogo } from "@/components/ui/TeamLogo";
import {
  computeMatchStatRows,
  hasVisibleMatchStats,
  type MatchStatRow,
} from "@/lib/match/matchStats";
import type { MatchTeamPeriodStat } from "@/lib/match/periodFouls";
import type { CSSProperties } from "react";
import type { Match, MatchAction } from "@/lib/types";

interface MatchStatisticsPanelProps {
  match: Match;
  actions: MatchAction[];
  teamAId: string;
  teamStats: MatchTeamPeriodStat[];
}

/**
 * Barra dinâmica (app): total de segmentos = home + away.
 * Primeiros `home` na cor A; restantes na cor B.
 */
function DynamicStatBar({
  home,
  away,
  colorA,
  colorB,
}: {
  home: number;
  away: number;
  colorA: string;
  colorB: string;
}) {
  const total = home + away;

  if (total <= 0) {
    return (
      <div className="match-stat-dyn-bar" aria-hidden>
        <span className="match-stat-dyn-empty" />
      </div>
    );
  }

  return (
    <div className="match-stat-dyn-bar" aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="match-stat-dyn-seg"
          style={{
            backgroundColor: index < home ? colorA : colorB,
          }}
        />
      ))}
    </div>
  );
}

function StatRowItem({
  row,
  colorA,
  colorB,
}: {
  row: MatchStatRow;
  colorA: string;
  colorB: string;
}) {
  return (
    <li className="match-stat-dyn-row">
      <div className="match-stat-dyn-values">
        <span className="match-stat-dyn-value tabular-nums">{row.home}</span>
        <span className="match-stat-dyn-label">{row.label.toUpperCase()}</span>
        <span className="match-stat-dyn-value tabular-nums">{row.away}</span>
      </div>
      <DynamicStatBar
        home={row.home}
        away={row.away}
        colorA={colorA}
        colorB={colorB}
      />
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
  const colorA = match.teams_a?.primary_color?.trim() || "#3A5A7A";
  const colorB = match.teams_b?.primary_color?.trim() || "#5A3A4A";
  const accent =
    match.phases?.competition_editions?.competitions?.primary_color ??
    "var(--color-brand)";

  if (!hasVisibleMatchStats(rows)) {
    return (
      <p className="match-empty-state">
        Estatísticas ainda não disponíveis.
      </p>
    );
  }

  return (
    <div
      className="match-stats-dyn"
      style={{ "--match-stat-accent": accent } as CSSProperties}
    >
      <div className="match-stats-dyn-logos">
        <TeamLogo team={match.teams_a} index={0} size={48} />
        <TeamLogo team={match.teams_b} index={1} size={48} />
      </div>

      <ul className="match-stats-dyn-list">
        {rows.map((row) => (
          <StatRowItem
            key={row.id}
            row={row}
            colorA={colorA}
            colorB={colorB}
          />
        ))}
      </ul>
    </div>
  );
}
