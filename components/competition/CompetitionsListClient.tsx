"use client";

import { ActiveCompetitionGlassCard } from "@/components/home/ActiveCompetitionGlassCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { Competition } from "@/lib/types";

interface CompetitionsListClientProps {
  competitions: Competition[];
}

function isActiveCompetition(comp: Competition): boolean {
  const editions = comp.competition_editions ?? [];
  if (!editions.length) return true;
  return editions.some((e) => e.is_current);
}

export function CompetitionsListClient({
  competitions,
}: CompetitionsListClientProps) {
  const active = competitions.filter(isActiveCompetition);
  const archived = competitions.filter((c) => !isActiveCompetition(c));

  if (!competitions.length) {
    return (
      <SectionEnter className="page-container py-12">
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma competição cadastrada no momento.
        </p>
      </SectionEnter>
    );
  }

  return (
    <>
      {active.length > 0 && (
        <SectionEnter className="page-container pb-10 pt-4">
          <h2 className="section-title mb-4">Em andamento</h2>
          <div className="competitions-grid">
            {active.map((competition) => (
              <ActiveCompetitionGlassCard
                key={competition.id}
                competition={competition}
              />
            ))}
          </div>
        </SectionEnter>
      )}

      {archived.length > 0 && (
        <SectionEnter className="page-container pb-14">
          <h2 className="section-title mb-4">Outras edições</h2>
          <div className="competitions-grid">
            {archived.map((competition) => (
              <ActiveCompetitionGlassCard
                key={competition.id}
                competition={competition}
              />
            ))}
          </div>
        </SectionEnter>
      )}
    </>
  );
}
