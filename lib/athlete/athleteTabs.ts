import type { TabItem } from "@/components/ui/PageTabs";

export const ATHLETE_TABS: TabItem[] = [
  { id: "carreira", label: "Carreira" },
  { id: "equipes", label: "Equipes" },
  { id: "partidas", label: "Partidas" },
];

export const DEFAULT_ATHLETE_TAB = "carreira";

export function resolveAthleteTab(tab: string): string {
  return ATHLETE_TABS.some((t) => t.id === tab) ? tab : DEFAULT_ATHLETE_TAB;
}
