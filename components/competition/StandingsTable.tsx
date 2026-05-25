import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { StandingRow } from "@/lib/types";

interface StandingsTableProps {
  rows: StandingRow[];
  title?: string;
}

export function StandingsTable({ rows, title }: StandingsTableProps) {
  if (!rows.length) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Classificação indisponível.
      </p>
    );
  }

  return (
    <div>
      {title && <SectionTitle>{title}</SectionTitle>}
      <div className="card-surface overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] font-mono-label text-[8px] font-bold uppercase tracking-wide text-white/40">
                <th className="py-3 pl-3">#</th>
                <th className="py-3">Equipe</th>
                <th className="py-3 text-center">PJ</th>
                <th className="py-3 text-center">V</th>
                <th className="py-3 text-center">E</th>
                <th className="py-3 text-center">D</th>
                <th className="py-3 text-center">GP</th>
                <th className="py-3 text-center">GC</th>
                <th className="py-3 text-center">SG</th>
                <th className="py-3 pr-3 text-center">PTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isLeader = row.position === 1;
                const teamId = row.team.id ?? row.team_id;
                return (
                  <tr
                    key={row.team_id}
                    className={`standings-row border-b border-white/[0.04] font-mono-label text-[10px] tabular-nums ${
                      isLeader
                        ? "border-l-2 border-l-[var(--color-brand)] bg-[var(--color-brand)]/[0.06]"
                        : ""
                    }`}
                  >
                    <td className="py-3 pl-3 font-bold text-white/45">
                      {row.position}
                    </td>
                    <td className="py-3">
                      <Link
                        href={teamId ? `/times/${teamId}` : "#"}
                        className="flex items-center gap-2 hover:text-[var(--color-brand)]"
                      >
                        <TeamLogo team={row.team} index={i} size={24} />
                        <span className="font-display text-[11px] font-bold uppercase">
                          {row.team.short_name ?? row.team.full_name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.matches_played}
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.wins}
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.draws}
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.losses}
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.goals_scored}
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.goals_conceded}
                    </td>
                    <td className="py-3 text-center text-white/55">
                      {row.goal_difference > 0 ? "+" : ""}
                      {row.goal_difference}
                    </td>
                    <td className="standings-pts py-3 pr-3 text-center font-bold text-[var(--color-brand)]">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
