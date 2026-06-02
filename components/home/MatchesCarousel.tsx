import { MatchCard } from "@/components/home/MatchCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Match } from "@/lib/types";

interface MatchesCarouselProps {
  recent: Match[];
  upcoming: Match[];
}

export function MatchesCarousel({ recent, upcoming }: MatchesCarouselProps) {
  const all = [...recent, ...upcoming];

  if (!all.length) {
    return (
      <section className="page-container py-6">
        <SectionTitle>Jogos</SectionTitle>
        <p className="font-mono-label text-xs text-white/40">
          Nenhuma partida nos últimos 7 ou próximos 30 dias.
        </p>
      </section>
    );
  }

  return (
    <SectionEnter className="py-6">
      <div className="page-container mb-4">
        <SectionTitle>Jogos</SectionTitle>
      </div>
      <div className="page-edge-x flex gap-3 overflow-x-auto pb-1 snap-x-mandatory">
        {all.map((match, i) => (
          <MatchCard key={match.id} match={match} index={i} />
        ))}
      </div>
    </SectionEnter>
  );
}
