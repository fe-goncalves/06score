import type { TabItem } from "@/components/ui/PageTabs";
import type { CompetitionEdition } from "@/lib/types";

export type HubTabId =
  | "hall"
  | "competicao"
  | "partidas"
  | "estatisticas"
  | "noticias"
  | "detalhes";

const TAB_BY_ID: Record<HubTabId, TabItem> = {
  hall: { id: "hall", label: "HALL" },
  competicao: { id: "competicao", label: "COMPETIÇÃO" },
  partidas: { id: "partidas", label: "PARTIDAS" },
  estatisticas: { id: "estatisticas", label: "ESTATÍSTICAS" },
  noticias: { id: "noticias", label: "NOTÍCIAS" },
  detalhes: { id: "detalhes", label: "DETALHES" },
};

const LEGACY_TAB_ALIASES: Record<string, HubTabId> = {
  jogos: "partidas",
  classificacao: "competicao",
  times: "detalhes",
  equipes: "detalhes",
};

export function isEditionClosed(
  status: CompetitionEdition["status"] | null | undefined,
): boolean {
  return status === "closed" || status === "finished";
}

export function getHubTabs(
  edition: CompetitionEdition | null | undefined,
  options?: { hasNews?: boolean },
): TabItem[] {
  const closed = isEditionClosed(edition?.status);
  const hasNews = Boolean(options?.hasNews);

  const order: HubTabId[] = [];
  if (closed) order.push("hall");
  order.push("competicao", "partidas", "estatisticas");
  if (hasNews) order.push("noticias");
  order.push("detalhes");

  return order.map((id) => TAB_BY_ID[id]);
}

export function getDefaultHubTab(
  edition: CompetitionEdition | null | undefined,
): string {
  return isEditionClosed(edition?.status) ? "hall" : "competicao";
}

export function resolveHubTab(
  tab: string,
  availableIds: string[],
): string {
  const normalized = LEGACY_TAB_ALIASES[tab] ?? tab;
  if (availableIds.includes(normalized)) return normalized;
  return availableIds[0] ?? "competicao";
}
