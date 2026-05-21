import { CompetitionCard } from "@/components/home/CompetitionCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Competition } from "@/lib/types";

interface CompetitionsGridProps {
  competitions: Competition[];
}

export function CompetitionsGrid({ competitions }: CompetitionsGridProps) {
  if (!competitions.length) {
    return (
      <section className="py-20 lg:py-28">
        <SectionTitle>Competições ativas</SectionTitle>
        <p className="text-sm text-white/40">Nenhuma competição ativa no momento.</p>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28">
      <SectionTitle>Competições ativas</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((competition) => (
          <CompetitionCard key={competition.id} competition={competition} />
        ))}
      </div>
    </section>
  );
}
