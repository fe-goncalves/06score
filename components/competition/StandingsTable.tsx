import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { StandingRow } from "@/lib/types";

interface StandingsTableProps {
  rows: StandingRow[];
}

export function StandingsTable({ rows }: StandingsTableProps) {
  if (!rows.length) {
    return <p className="text-sm text-white/40">Classificação indisponível.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-white/50">
            <th className="py-3 pl-2 text-left">#</th>
            <th className="py-3 text-left">Equipe</th>
            <th className="py-3 text-center">PJ</th>
            <th className="py-3 text-center">V</th>
            <th className="py-3 text-center">E</th>
            <th className="py-3 text-center">D</th>
            <th className="py-3 text-center">GP</th>
            <th className="py-3 text-center">GC</th>
            <th className="py-3 text-center">SG</th>
            <th className="py-3 pr-2 text-center">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isLeader = row.position === 1;
            const teamId = row.team.id ?? row.team_id;
            return (
              <tr
                key={row.team_id}
                className={`border-b border-white/[0.04] tabular-nums ${
                  isLeader
                    ? "border-l-2 border-l-[var(--color-brand)] bg-[var(--color-brand)]/5"
                    : ""
                }`}
              >
                <td className="py-3 pl-2 font-bold text-white/50">
                  {row.position}
                </td>
                <td className="py-3">
                  <Link
                    href={teamId ? `/times/${teamId}` : "#"}
                    className="flex items-center gap-2 hover:text-[var(--color-brand)]"
                  >
                    <OrgImage
                      src={row.team.logo_url}
                      alt={row.team.full_name}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded object-contain"
                    />
                    <span className="font-semibold">
                      {row.team.short_name ?? row.team.full_name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 text-center">{row.matches_played}</td>
                <td className="py-3 text-center">{row.wins}</td>
                <td className="py-3 text-center">{row.draws}</td>
                <td className="py-3 text-center">{row.losses}</td>
                <td className="py-3 text-center">{row.goals_scored}</td>
                <td className="py-3 text-center">{row.goals_conceded}</td>
                <td className="py-3 text-center">
                  {row.goal_difference > 0 ? "+" : ""}
                  {row.goal_difference}
                </td>
                <td className="py-3 pr-2 text-center font-bold text-[var(--color-brand)]">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
