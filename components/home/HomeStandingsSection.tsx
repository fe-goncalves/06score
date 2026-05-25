import Link from "next/link";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { StandingRow } from "@/lib/types";

interface HomeStandingsSectionProps {
  rows: StandingRow[];
}

export function HomeStandingsSection({ rows }: HomeStandingsSectionProps) {
  if (!rows.length) {
    return (
      <section className="py-6">
        <SectionTitle>Classificação</SectionTitle>
        <p className="font-mono-label text-xs text-white/40">
          Classificação indisponível.
        </p>
      </section>
    );
  }

  return (
    <SectionEnter className="py-6">
      <SectionTitle>Classificação</SectionTitle>
      <div className="card-surface overflow-hidden rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06] font-mono-label text-[8px] font-bold uppercase tracking-wide text-white/40">
              <th className="w-8 py-2.5 pl-3">#</th>
              <th className="py-2.5">Time</th>
              <th className="w-8 py-2.5 text-center">PJ</th>
              <th className="w-8 py-2.5 text-center">V</th>
              <th className="w-8 py-2.5 text-center">D</th>
              <th className="w-10 py-2.5 text-center">SG</th>
              <th className="w-10 py-2.5 pr-3 text-center">PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const teamId = row.team.id ?? row.team_id;
              const isLeader = row.position === 1;
              return (
                <tr
                  key={row.team_id}
                  className={`standings-row border-b border-white/[0.04] font-mono-label text-[10px] tabular-nums last:border-0 ${
                    isLeader ? "bg-[var(--color-brand)]/[0.06]" : ""
                  }`}
                >
                  <td className="py-2.5 pl-3 font-bold text-white/45">
                    {row.position}
                  </td>
                  <td className="py-2.5">
                    <Link
                      href={teamId ? `/times/${teamId}` : "#"}
                      className="flex items-center gap-2 hover:text-[var(--color-brand)]"
                    >
                      <TeamLogo team={row.team} index={i} size={20} />
                      <span className="font-display text-[11px] font-bold uppercase text-white/90">
                        {row.team.abbreviation ??
                          row.team.short_name ??
                          row.team.full_name}
                      </span>
                    </Link>
                  </td>
                  <td className="py-2.5 text-center text-white/55">
                    {row.matches_played}
                  </td>
                  <td className="py-2.5 text-center text-white/55">
                    {row.wins}
                  </td>
                  <td className="py-2.5 text-center text-white/55">
                    {row.losses}
                  </td>
                  <td className="py-2.5 text-center text-white/55">
                    {row.goal_difference > 0 ? "+" : ""}
                    {row.goal_difference}
                  </td>
                  <td className="standings-pts py-2.5 pr-3 text-center font-bold text-[var(--color-brand)]">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionEnter>
  );
}
