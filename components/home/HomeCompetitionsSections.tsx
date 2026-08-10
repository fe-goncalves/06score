import { HomeCompetitionSection } from "@/components/home/HomeCompetitionSection";
import type { HomeEditionData } from "@/lib/types";

interface HomeCompetitionsSectionsProps {
  editions: HomeEditionData[];
}

export function HomeCompetitionsSections({
  editions,
}: HomeCompetitionsSectionsProps) {
  if (!editions.length) return null;

  return (
    <>
      {editions.map((edition) => (
        <HomeCompetitionSection key={edition.editionId} data={edition} />
      ))}
    </>
  );
}
