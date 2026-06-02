import { AthleteSection } from "@/components/athlete/AthleteSection";
import type { AthleteCareerStats } from "@/lib/types";

const STAT_ITEMS: {
  key: keyof AthleteCareerStats;
  label: string;
  short: string;
}[] = [
  { key: "total_matches", label: "Partidas", short: "J" },
  { key: "total_goals", label: "Gols", short: "G" },
  { key: "total_assists", label: "Assistências", short: "A" },
  { key: "total_yellow_cards", label: "Cartões amarelos", short: "CA" },
  { key: "total_red_cards", label: "Cartões vermelhos", short: "CV" },
  { key: "total_motm", label: "Craques do jogo", short: "MOTM" },
];

interface AthleteCareerPanelProps {
  stats: AthleteCareerStats | null;
}

export function AthleteCareerPanel({ stats }: AthleteCareerPanelProps) {
  return (
    <AthleteSection title="Estatísticas de carreira" titleId="athlete-career-title">
      <div className="athlete-stats-grid">
        {STAT_ITEMS.map(({ key, label, short }, index) => {
          const value = stats?.[key] ?? 0;
          const highlight = key === "total_motm" && value > 0;

          return (
            <div
              key={key}
              className={`athlete-stat-card${highlight ? " athlete-stat-card--highlight" : ""}`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span className="athlete-stat-value">{value}</span>
              <span className="athlete-stat-short" aria-hidden>
                {short}
              </span>
              <span className="athlete-stat-label">{label}</span>
            </div>
          );
        })}
      </div>
    </AthleteSection>
  );
}
