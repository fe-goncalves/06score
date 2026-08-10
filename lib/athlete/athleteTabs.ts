import type { TabItem } from "@/components/ui/PageTabs";

export const ATHLETE_TAB_RESUMO = "resumo";
export const ATHLETE_TAB_PARTIDAS = "partidas";
export const ATHLETE_TAB_ESTATISTICAS = "estatisticas";

export const ATHLETE_TABS: TabItem[] = [
  { id: ATHLETE_TAB_RESUMO, label: "RESUMO" },
  { id: ATHLETE_TAB_PARTIDAS, label: "PARTIDAS" },
  { id: ATHLETE_TAB_ESTATISTICAS, label: "ESTATÍSTICAS" },
];

export const DEFAULT_ATHLETE_TAB = ATHLETE_TAB_RESUMO;

const TAB_IDS = new Set(ATHLETE_TABS.map((t) => t.id));

/** URLs antigas → abas atuais do app. */
const LEGACY_TAB_ALIASES: Record<string, string> = {
  informacoes: ATHLETE_TAB_RESUMO,
  historico: ATHLETE_TAB_RESUMO,
};

export function resolveAthleteTab(tab: string, _isMobile = false): string {
  const normalized = LEGACY_TAB_ALIASES[tab] ?? tab;
  return TAB_IDS.has(normalized) ? normalized : DEFAULT_ATHLETE_TAB;
}

export function athleteTabsForViewport(_isMobile: boolean): TabItem[] {
  return ATHLETE_TABS;
}
