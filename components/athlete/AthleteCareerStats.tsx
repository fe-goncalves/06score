import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { AthleteCareerStats } from "@/lib/types";

const STAT_ITEMS: { key: keyof AthleteCareerStats; label: string }[] = [
  { key: "total_matches", label: "Partidas" },
  { key: "total_goals", label: "Gols" },
  { key: "total_assists", label: "Assistências" },
  { key: "total_yellow_cards", label: "Amarelos" },
  { key: "total_red_cards", label: "Vermelhos" },
  { key: "total_motm", label: "MOTM" },
];

interface AthleteCareerStatsProps {
  stats: AthleteCareerStats | null;
}

export function AthleteCareerStatsBlock({ stats }: AthleteCareerStatsProps) {
  return (
    <section className="py-8">
      <SectionTitle>Carreira</SectionTitle>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_ITEMS.map(({ key, label }) => (
          <Card key={key} className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-[var(--color-brand)]">
              {stats?.[key] ?? 0}
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
