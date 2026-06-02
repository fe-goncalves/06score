import type { TabItem } from "@/components/ui/PageTabs";

export const ATHLETE_TAB_PARTIDAS = "partidas";

export const ATHLETE_TABS_DESKTOP: TabItem[] = [
  { id: "informacoes", label: "INFORMAÇÕES" },
  { id: "historico", label: "HISTÓRICO" },
  { id: "estatisticas", label: "ESTATÍSTICAS" },
];

export const ATHLETE_TABS_MOBILE: TabItem[] = [
  ...ATHLETE_TABS_DESKTOP.slice(0, 1),
  { id: ATHLETE_TAB_PARTIDAS, label: "PARTIDAS" },
  ...ATHLETE_TABS_DESKTOP.slice(1),
];

/** @deprecated use ATHLETE_TABS_DESKTOP */
export const ATHLETE_TABS = ATHLETE_TABS_DESKTOP;

export const DEFAULT_ATHLETE_TAB = "informacoes";

const DESKTOP_IDS = new Set(ATHLETE_TABS_DESKTOP.map((t) => t.id));
const MOBILE_IDS = new Set(ATHLETE_TABS_MOBILE.map((t) => t.id));

export function resolveAthleteTab(tab: string, isMobile = false): string {
  const allowed = isMobile ? MOBILE_IDS : DESKTOP_IDS;
  return allowed.has(tab) ? tab : DEFAULT_ATHLETE_TAB;
}

export function athleteTabsForViewport(isMobile: boolean): TabItem[] {
  return isMobile ? ATHLETE_TABS_MOBILE : ATHLETE_TABS_DESKTOP;
}
