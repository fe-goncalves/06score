import type { TabItem } from "@/components/ui/PageTabs";

export const TEAM_TAB_HUB = "hub";
export const TEAM_TAB_ELENCO = "elenco";
export const TEAM_TAB_PARTIDAS = "partidas";
export const TEAM_TAB_DETALHES = "detalhes";
export const TEAM_TAB_ESTATISTICAS = "estatisticas";
export const TEAM_TAB_HISTORICO = "historico";
export const TEAM_TAB_HALL = "hall";

export const TEAM_TABS: TabItem[] = [
  { id: TEAM_TAB_HUB, label: "HUB" },
  { id: TEAM_TAB_ELENCO, label: "ELENCO" },
  { id: TEAM_TAB_PARTIDAS, label: "PARTIDAS" },
  { id: TEAM_TAB_ESTATISTICAS, label: "ESTATÍSTICAS" },
  { id: TEAM_TAB_HISTORICO, label: "HISTÓRICO" },
  { id: TEAM_TAB_HALL, label: "HALL" },
  { id: TEAM_TAB_DETALHES, label: "DETALHES" },
];

export const DEFAULT_TEAM_TAB = TEAM_TAB_HUB;

const TAB_IDS = new Set(TEAM_TABS.map((t) => t.id));

/** URLs antigas com `tab=informacoes`. */
const LEGACY_TAB_ALIASES: Record<string, string> = {
  informacoes: TEAM_TAB_DETALHES,
};

export function resolveTeamTab(tab: string): string {
  const normalized = LEGACY_TAB_ALIASES[tab] ?? tab;
  return TAB_IDS.has(normalized) ? normalized : DEFAULT_TEAM_TAB;
}

export function teamTabsForViewport(): TabItem[] {
  return TEAM_TABS;
}
