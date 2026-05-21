import { MatchCard } from "@/components/home/MatchCard";
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
      <section className="py-20 lg:py-28">
        <SectionTitle>Jogos</SectionTitle>
        <p className="text-sm text-white/40">Nenhuma partida nos últimos 7 ou próximos 30 dias.</p>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28">
      <SectionTitle>Jogos</SectionTitle>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x-mandatory sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {all.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
