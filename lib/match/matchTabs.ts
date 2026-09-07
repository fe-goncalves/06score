import type { TabItem } from "@/components/ui/PageTabs";

export const MATCH_TAB_DEFS = {
  timeline: { id: "timeline", label: "TIMELINE" },
  formacoes: { id: "formacoes", label: "FORMAÇÕES" },
  estatisticas: { id: "estatisticas", label: "ESTATÍSTICAS" },
  rodada: { id: "rodada", label: "RODADA" },
  midia: { id: "midia", label: "MÍDIA" },
} as const satisfies Record<string, TabItem>;

/** @deprecated Prefer buildMatchTabs — kept for static imports. */
export const MATCH_TABS: TabItem[] = [
  MATCH_TAB_DEFS.timeline,
  MATCH_TAB_DEFS.formacoes,
  MATCH_TAB_DEFS.estatisticas,
  MATCH_TAB_DEFS.rodada,
  MATCH_TAB_DEFS.midia,
];

const LEGACY_TAB_ALIASES: Record<string, string> = {
  detalhes: "timeline",
  escalacoes: "formacoes",
  informacao: "timeline",
  "pos-jogo": "timeline",
  pos_jogo: "timeline",
  partidas: "rodada",
  competicao: "timeline",
};

export const DEFAULT_MATCH_TAB = "timeline";

export function buildMatchTabs(options: {
  hasRound?: boolean;
  hasMedia?: boolean;
}): TabItem[] {
  const tabs: TabItem[] = [
    MATCH_TAB_DEFS.timeline,
    MATCH_TAB_DEFS.formacoes,
    MATCH_TAB_DEFS.estatisticas,
  ];
  if (options.hasRound) tabs.push(MATCH_TAB_DEFS.rodada);
  if (options.hasMedia) tabs.push(MATCH_TAB_DEFS.midia);
  return tabs;
}

export function resolveMatchTab(
  tab: string,
  availableIds?: string[],
): string {
  const normalized = LEGACY_TAB_ALIASES[tab] ?? tab;
  if (availableIds?.length) {
    if (availableIds.includes(normalized)) return normalized;
    return availableIds[0] ?? DEFAULT_MATCH_TAB;
  }
  const known = new Set(Object.values(MATCH_TAB_DEFS).map((t) => t.id));
  if (known.has(normalized)) return normalized;
  return DEFAULT_MATCH_TAB;
}
