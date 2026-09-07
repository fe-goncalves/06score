"use client";

import Link from "next/link";
import { BidEditionPicker } from "@/components/bid/BidEditionPicker";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { BidEdition, BidTeamSummary } from "@/lib/types";

interface BidPageClientProps {
  editions: BidEdition[];
  teams: BidTeamSummary[];
  selectedCompetitionId: string | null;
  selectedEditionId: string | null;
}

export function BidPageClient({
  editions,
  teams,
  selectedCompetitionId,
  selectedEditionId,
}: BidPageClientProps) {
  return (
    <>
      <SiteListHero
        title="BID"
        description="Boletim de Informação Desportiva — inscrições oficiais das equipes ativas."
      />

      <div className="bid-page-body page-container pb-10">
        <BidEditionPicker
          editions={editions}
          selectedCompetitionId={selectedCompetitionId}
          selectedEditionId={selectedEditionId}
        />

        {!editions.length ? (
          <p className="liquid-glass-list-empty">
            Não há competições em andamento no momento.
          </p>
        ) : !selectedEditionId ? (
          <p className="liquid-glass-list-empty">
            {selectedCompetitionId
              ? "Selecione uma edição para ver as equipes inscritas."
              : "Selecione um campeonato para começar."}
          </p>
        ) : !teams.length ? (
          <p className="liquid-glass-list-empty">
            Nenhuma equipe ativa inscrita nesta edição.
          </p>
        ) : (
          <ul className="bid-team-grid">
            {teams.map((entry) => {
              const href = `/bid/${selectedEditionId}/${entry.teamId}`;
              const label =
                entry.team.short_name ??
                entry.team.abbreviation ??
                entry.team.full_name;
              const title = (
                entry.team.short_name?.trim() || entry.team.full_name
              ).toUpperCase();

              return (
                <li key={entry.editionTeamId}>
                  <Link href={href} className="bid-team-card group">
                    <TeamLogo
                      team={entry.team}
                      size={56}
                      className="bid-team-card-logo"
                    />
                    <div className="bid-team-card-body">
                      <h2 className="bid-team-card-name">{title}</h2>
                      <p className="bid-team-card-meta">
                        <span>
                          <strong>{entry.athleteCount}</strong> atletas
                        </span>
                        <span className="bid-team-card-meta-sep" aria-hidden>
                          ·
                        </span>
                        <span>
                          <strong>{entry.staffCount}</strong> comissão técnica
                        </span>
                      </p>
                      <span className="bid-team-card-cta">
                        Ver inscrição — {label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
