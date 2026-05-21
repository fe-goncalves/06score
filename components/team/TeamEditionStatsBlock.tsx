import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { TeamEditionStats } from "@/lib/types";

interface TeamEditionStatsBlockProps {
  stats: TeamEditionStats | null;
}

export function TeamEditionStatsBlock({ stats }: TeamEditionStatsBlockProps) {
  if (!stats) {
    return (
      <section className="py-8">
        <SectionTitle>Estatísticas na edição</SectionTitle>
        <p className="mt-4 text-sm text-white/40">Sem dados na edição atual.</p>
      </section>
    );
  }

  const items = [
    { label: "PJ", value: stats.matches_played },
    { label: "V", value: stats.wins },
    { label: "E", value: stats.draws },
    { label: "D", value: stats.losses },
    { label: "GP", value: stats.goals_scored },
    { label: "GC", value: stats.goals_conceded },
    { label: "PTS", value: stats.points, highlight: true },
  ];

  return (
    <section className="py-8">
      <SectionTitle>Estatísticas na edição</SectionTitle>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-7">
        {items.map(({ label, value, highlight }) => (
          <Card key={label} className="p-4 text-center">
            <p
              className={`text-2xl font-bold tabular-nums ${
                highlight ? "text-[var(--color-brand)]" : ""
              }`}
            >
              {value}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
              {label}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
