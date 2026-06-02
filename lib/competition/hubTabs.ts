import type { TabItem } from "@/components/ui/PageTabs";
import type { CompetitionEdition } from "@/lib/types";

const TAB_BY_ID: Record<string, TabItem> = {
  competicao: { id: "competicao", label: "Competição" },
  estatisticas: { id: "estatisticas", label: "Estatísticas" },
  equipes: { id: "equipes", label: "Equipes" },
  detalhes: { id: "detalhes", label: "Detalhes" },
};

const OPEN_EDITION_ORDER = [
  "competicao",
  "estatisticas",
  "equipes",
  "detalhes",
] as const;

const CLOSED_EDITION_ORDER = [
  "detalhes",
  "competicao",
  "estatisticas",
  "equipes",
] as const;

const LEGACY_TAB_ALIASES: Record<string, string> = {
  jogos: "competicao",
  classificacao: "competicao",
  times: "equipes",
};

export function isEditionClosed(
  status: CompetitionEdition["status"] | null | undefined,
): boolean {
  return status === "closed" || status === "finished";
}

export function getHubTabs(
  edition: CompetitionEdition | null | undefined,
): TabItem[] {
  const order = isEditionClosed(edition?.status)
    ? CLOSED_EDITION_ORDER
    : OPEN_EDITION_ORDER;

  return order.map((id) => TAB_BY_ID[id]);
}

export function getDefaultHubTab(
  edition: CompetitionEdition | null | undefined,
): string {
  return isEditionClosed(edition?.status) ? "detalhes" : "competicao";
}

export function resolveHubTab(tab: string): string {
  const normalized = LEGACY_TAB_ALIASES[tab] ?? tab;
  if (normalized in TAB_BY_ID) return normalized;
  return "competicao";
}
