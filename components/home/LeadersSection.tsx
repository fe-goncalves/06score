import { LeaderCard } from "@/components/home/LeaderCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { AthleteStatLeader } from "@/lib/types";

interface LeadersSectionProps {
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
  topMvp: AthleteStatLeader | null;
}

export function LeadersSection({
  topScorer,
  topAssister,
  topMvp,
}: LeadersSectionProps) {
  const hasAny = topScorer || topAssister || topMvp;

  if (!hasAny) {
    return (
      <section className="page-container py-6">
        <SectionTitle>Destaques</SectionTitle>
        <p className="font-mono-label text-xs text-white/40">
          Estatísticas indisponíveis.
        </p>
      </section>
    );
  }

  return (
    <SectionEnter className="py-6">
      <div className="page-container mb-4">
        <SectionTitle>Destaques</SectionTitle>
      </div>
      <div className="page-edge-x flex gap-3 overflow-x-auto pb-1 snap-x-mandatory scrollbar-hide md:page-container md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
        <LeaderCard
          label="Artilheiro"
          stat={topScorer?.goals ?? 0}
          leader={topScorer}
        />
        <LeaderCard
          label="Assistências"
          stat={topAssister?.assists ?? 0}
          leader={topAssister}
        />
        <LeaderCard
          label="MVP"
          stat={topMvp?.motm_count ?? 0}
          leader={topMvp}
        />
      </div>
    </SectionEnter>
  );
}
