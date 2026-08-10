import { LiquidGlassListRow } from "@/components/ui/LiquidGlassListRow";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { RankingRow, Team } from "@/lib/types";

interface RankingTableProps {
  rows: RankingRow[];
  loading?: boolean;
}

function SkeletonRow() {
  return (
    <div className="liquid-glass-list-row ranking-skeleton-row" aria-hidden>
      <span className="liquid-glass-list-row-content">
        <span className="ranking-skeleton-pos" />
        <span className="ranking-skeleton-logo" />
        <span className="ranking-skeleton-name" />
        <span className="ranking-skeleton-pts" />
      </span>
    </div>
  );
}

function rowTeam(row: RankingRow): Team {
  return {
    id: row.team_id,
    full_name: row.team_name,
    short_name: row.team_name,
    logo_url: row.logo_url,
  };
}

export function RankingTable({ rows, loading = false }: RankingTableProps) {
  if (loading) {
    return (
      <div className="liquid-glass-list" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <p className="liquid-glass-list-empty">
        Nenhum dado de ranking disponível.
      </p>
    );
  }

  return (
    <div className="liquid-glass-list">
      {rows.map((row, index) => {
        const position = index + 1;
        const posClass =
          position <= 3
            ? `ranking-list-pos ranking-list-pos--${position}`
            : "ranking-list-pos";

        return (
          <LiquidGlassListRow
            key={row.team_id}
            href={`/times/${row.team_id}`}
            accentColor="var(--color-brand)"
            dashHover
          >
            <span className={posClass}>{position}</span>
            <TeamLogo
              team={rowTeam(row)}
              size={40}
              className="liquid-glass-list-logo"
            />
            <span className="liquid-glass-list-info">
              <span className="liquid-glass-list-name liquid-glass-list-name--strong">
                {row.team_name.toUpperCase()}
              </span>
            </span>
            <span className="ranking-list-points">
              <span className="ranking-list-points-value">{row.total_points}</span>
              <span className="ranking-list-points-label">pts</span>
            </span>
          </LiquidGlassListRow>
        );
      })}
    </div>
  );
}
