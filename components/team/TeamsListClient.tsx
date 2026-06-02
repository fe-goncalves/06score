"use client";

import { TeamGlassCard } from "@/components/team/TeamGlassCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { Team } from "@/lib/types";

interface TeamsListClientProps {
  teams: Team[];
}

export function TeamsListClient({ teams }: TeamsListClientProps) {
  if (!teams.length) {
    return (
      <SectionEnter className="page-container pb-14">
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma equipe cadastrada no momento.
        </p>
      </SectionEnter>
    );
  }

  return (
    <SectionEnter className="page-container pb-14 pt-2">
      <h2 className="section-title mb-4">
        {teams.length} {teams.length === 1 ? "equipe" : "equipes"}
      </h2>
      <div className="teams-list-grid">
        {teams.map((team) => (
          <TeamGlassCard key={team.id} team={team} />
        ))}
      </div>
    </SectionEnter>
  );
}
