import { LeaderCard } from "@/components/home/LeaderCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { AthleteStatLeader } from "@/lib/types";

interface LeadersSectionProps {
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
}

export function LeadersSection({
  topScorer,
  topAssister,
}: LeadersSectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <SectionTitle>Destaques estatísticos</SectionTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <LeaderCard
          label="Artilheiro"
          stat={topScorer?.goals ?? 0}
          leader={topScorer}
        />
        <LeaderCard
          label="Garçom"
          stat={topAssister?.assists ?? 0}
          leader={topAssister}
        />
      </div>
    </section>
  );
}
