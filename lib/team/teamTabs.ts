import type { TabItem } from "@/components/ui/PageTabs";

export const TEAM_TAB_PARTIDAS = "partidas";

export const TEAM_TABS_DESKTOP: TabItem[] = [
  { id: "informacoes", label: "INFORMAÇÕES" },
  { id: "historico", label: "HISTÓRICO" },
  { id: "estatisticas", label: "ESTATÍSTICAS" },
];

export const TEAM_TABS_MOBILE: TabItem[] = [
  ...TEAM_TABS_DESKTOP.slice(0, 1),
  { id: TEAM_TAB_PARTIDAS, label: "PARTIDAS" },
  ...TEAM_TABS_DESKTOP.slice(1),
];

export const DEFAULT_TEAM_TAB = "informacoes";

const DESKTOP_IDS = new Set(TEAM_TABS_DESKTOP.map((t) => t.id));
const MOBILE_IDS = new Set(TEAM_TABS_MOBILE.map((t) => t.id));

export function resolveTeamTab(tab: string, isMobile = false): string {
  const allowed = isMobile ? MOBILE_IDS : DESKTOP_IDS;
  return allowed.has(tab) ? tab : DEFAULT_TEAM_TAB;
}

export function teamTabsForViewport(isMobile: boolean): TabItem[] {
  return isMobile ? TEAM_TABS_MOBILE : TEAM_TABS_DESKTOP;
}
