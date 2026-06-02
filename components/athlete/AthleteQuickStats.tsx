import type { AthleteCareerStats } from "@/lib/types";

const QUICK_STATS: {
  key: keyof AthleteCareerStats;
  label: string;
}[] = [
  { key: "total_matches", label: "Jogos" },
  { key: "total_goals", label: "Gols" },
  { key: "total_assists", label: "Assists." },
  { key: "total_motm", label: "Craques" },
];

interface AthleteQuickStatsProps {
  stats: AthleteCareerStats | null;
}

export function AthleteQuickStats({ stats }: AthleteQuickStatsProps) {
  return (
    <div className="athlete-quick-stats" aria-label="Resumo da carreira">
      {QUICK_STATS.map(({ key, label }) => {
        const value = stats?.[key] ?? 0;
        const highlight = key === "total_motm" && value > 0;

        return (
          <div
            key={key}
            className={`athlete-quick-stat${highlight ? " athlete-quick-stat--highlight" : ""}`}
          >
            <span className="athlete-quick-stat-value">{value}</span>
            <span className="athlete-quick-stat-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
