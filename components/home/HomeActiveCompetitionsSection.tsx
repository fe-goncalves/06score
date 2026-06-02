import { ActiveCompetitionGlassCard } from "@/components/home/ActiveCompetitionGlassCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { Competition } from "@/lib/types";

interface HomeActiveCompetitionsSectionProps {
  competitions: Competition[];
}

export function HomeActiveCompetitionsSection({
  competitions,
}: HomeActiveCompetitionsSectionProps) {
  const active = competitions.slice(0, 4);
  if (!active.length) return null;

  return (
    <SectionEnter className="home-competitions-section py-4 lg:hidden">
      <div className="page-container">
        <h2 className="section-title mb-3 text-base font-bold tracking-wide uppercase">
          Campeonatos
        </h2>
        <div className="totw-competitions-stack">
          {active.map((competition) => (
            <ActiveCompetitionGlassCard
              key={competition.id}
              competition={competition}
            />
          ))}
        </div>
      </div>
    </SectionEnter>
  );
}
