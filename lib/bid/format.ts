import type { BidEdition } from "@/lib/types";

export function formatBidCompetitionName(
  edition: Pick<BidEdition, "competitionName" | "competitionShortName">,
): string {
  return edition.competitionShortName?.trim() || edition.competitionName.trim();
}

/** Rótulo da edição (temporada / nome custom), sem repetir o campeonato. */
export function formatBidEditionOptionLabel(edition: BidEdition): string {
  const custom = edition.customName?.trim();
  const season = edition.seasonName?.trim();
  if (custom) return custom;
  if (season) return season;
  return "Edição em andamento";
}

/** @deprecated Prefer formatBidCompetitionName + formatBidEditionOptionLabel */
export function formatBidEditionLabel(edition: BidEdition): string {
  const comp = formatBidCompetitionName(edition);
  const editionLabel = formatBidEditionOptionLabel(edition);
  if (editionLabel === "Edição em andamento") return comp;
  return `${editionLabel} — ${comp}`;
}

export interface BidCompetitionGroup {
  competitionId: string;
  competitionName: string;
  competitionShortName: string | null;
  competitionLogoUrl: string | null;
  competitionColor: string | null;
  editions: BidEdition[];
}

export function groupBidCompetitions(editions: BidEdition[]): BidCompetitionGroup[] {
  const map = new Map<string, BidCompetitionGroup>();

  for (const edition of editions) {
    const existing = map.get(edition.competitionId);
    if (existing) {
      existing.editions.push(edition);
      continue;
    }

    map.set(edition.competitionId, {
      competitionId: edition.competitionId,
      competitionName: edition.competitionName,
      competitionShortName: edition.competitionShortName,
      competitionLogoUrl: edition.competitionLogoUrl,
      competitionColor: edition.competitionColor,
      editions: [edition],
    });
  }

  return [...map.values()].sort((a, b) =>
    formatBidCompetitionName(a).localeCompare(formatBidCompetitionName(b), "pt-BR"),
  );
}
