import type { AthleteAwardEntry } from "@/lib/types";

export function competitionEditionHrefFromAward(
  award: Pick<AthleteAwardEntry, "edition_id"> & {
    competition_editions: AthleteAwardEntry["competition_editions"];
  },
): string | null {
  const competitionId = award.competition_editions?.competitions?.id;
  const editionId = award.edition_id;
  if (!competitionId || !editionId) return null;
  return `/competicoes/${competitionId}?edition=${editionId}`;
}
