"use client";

import { TeamInformacoesAside } from "@/components/team/TeamInformacoesAside";
import type { TeamProfileData } from "@/lib/types";

interface TeamDetalhesTabProps {
  profile: TeamProfileData;
}

/** Aba Detalhes: informações da equipe (títulos/maiores ficam no Hall). */
export function TeamDetalhesTab({ profile }: TeamDetalhesTabProps) {
  return (
    <div className="team-detalhes-main">
      <TeamInformacoesAside
        team={profile.team}
        careerSummary={profile.careerSummary}
        venue={profile.venue}
        foundedYear={profile.foundedYear}
        staff={profile.staff}
      />
    </div>
  );
}
