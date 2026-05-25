import Link from "next/link";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { StandingRow } from "@/lib/types";

interface HomeStandingsCardProps {
  competitionId: string;
  competitionName: string;
  rows: StandingRow[];
}

export function HomeStandingsCard({
  competitionId,
  competitionName,
  rows,
}: HomeStandingsCardProps) {
  const top = rows.slice(0, 6);

  return (
    <aside className="hero-standings-card flex h-full flex-col overflow-hidden rounded-lg">
      <header className="hero-standings-header flex items-center justify-between gap-2 px-4 py-3">
        <h3 className="font-display truncate text-sm font-black uppercase leading-tight text-white">
          {competitionName}
        </h3>
        <Link
          href={`/competicoes/${competitionId}`}
          className="font-mono-label shrink-0 text-[9px] font-bold uppercase text-[var(--color-brand)] transition-opacity hover:opacity-80"
          aria-label={`Ver mais — ${competitionName}`}
        >
          Ver mais →
        </Link>
      </header>

      {top.length === 0 ? (
        <p className="font-mono-label px-4 py-6 text-[10px] text-white/40">
          Classificação indisponível.
        </p>
      ) : (
        <table className="w-full flex-1 text-left">
          <thead>
            <tr className="font-mono-label border-b border-white/[0.06] text-[8px] font-bold uppercase text-white/40">
              <th className="w-7 py-2 pl-4">#</th>
              <th className="py-2">Time</th>
              <th className="w-9 py-2 text-center">PTS</th>
              <th className="w-9 py-2 pr-4 text-center">SG</th>
            </tr>
          </thead>
          <tbody>
            {top.map((row, i) => {
              const isLeader = row.position === 1;
              const teamId = row.team.id ?? row.team_id;
              return (
                <tr
                  key={row.team_id}
                  className="standings-row font-mono-label border-b border-white/[0.04] text-[10px] tabular-nums last:border-0"
                >
                  <td className="py-2 pl-4 font-bold text-white/45">
                    {row.position}
                  </td>
                  <td className="py-2">
                    <Link
                      href={teamId ? `/times/${teamId}` : "#"}
                      className="flex items-center gap-1.5"
                    >
                      <TeamLogo team={row.team} index={i} size={18} />
                      <span className="font-display truncate text-[10px] font-bold uppercase text-white/85">
                        {row.team.abbreviation ??
                          row.team.short_name ??
                          row.team.full_name}
                      </span>
                    </Link>
                  </td>
                  <td
                    className={`py-2 text-center font-bold ${isLeader ? "text-[var(--color-brand)]" : "text-white/70"}`}
                  >
                    {row.points}
                  </td>
                  <td className="py-2 pr-4 text-center text-white/50">
                    {row.goal_difference > 0 ? "+" : ""}
                    {row.goal_difference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </aside>
  );
}
