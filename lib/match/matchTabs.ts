import type { TabItem } from "@/components/ui/PageTabs";

export const MATCH_TABS: TabItem[] = [
  { id: "detalhes", label: "DETALHES" },
  { id: "formacoes", label: "FORMAÇÕES" },
  { id: "estatisticas", label: "ESTATÍSTICAS" },
  { id: "partidas", label: "PARTIDAS" },
  { id: "competicao", label: "COMPETIÇÃO" },
  { id: "midia", label: "MÍDIA" },
];

const TAB_IDS = new Set(MATCH_TABS.map((t) => t.id));

const LEGACY_TAB_ALIASES: Record<string, string> = {
  escalacoes: "formacoes",
  timeline: "detalhes",
  informacao: "detalhes",
  "pos-jogo": "detalhes",
  pos_jogo: "detalhes",
};

export const DEFAULT_MATCH_TAB = "detalhes";

export function resolveMatchTab(tab: string): string {
  const normalized = LEGACY_TAB_ALIASES[tab] ?? tab;
  if (TAB_IDS.has(normalized)) return normalized;
  return DEFAULT_MATCH_TAB;
}
