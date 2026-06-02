"use client";

import { useClientTab } from "@/lib/navigation/useClientTab";

export interface TabItem {
  id: string;
  label: string;
}

interface PageTabsProps {
  tabs: TabItem[];
  defaultTab: string;
  paramName?: string;
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export function PageTabs({
  tabs,
  defaultTab,
  paramName = "tab",
  activeTab: controlledActive,
  onTabChange,
}: PageTabsProps) {
  const clientTab = useClientTab(defaultTab, paramName);
  const active = controlledActive ?? clientTab.tab;
  const setTab = onTabChange ?? clientTab.setTab;

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06]">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`font-mono-label shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              isActive
                ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** @deprecated Prefira useClientTab — evita refetch do servidor ao trocar aba. */
export function useActiveTab(
  defaultTab: string,
  paramName = "tab",
): string {
  return useClientTab(defaultTab, paramName).tab;
}
