"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface TabItem {
  id: string;
  label: string;
}

interface PageTabsProps {
  tabs: TabItem[];
  defaultTab: string;
  paramName?: string;
}

export function PageTabs({
  tabs,
  defaultTab,
  paramName = "tab",
}: PageTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active =
    searchParams.get(paramName) ?? defaultTab;

  function setTab(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06]">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`shrink-0 px-4 py-3 text-[11px] font-bold tracking-widest transition-colors ${
              isActive
                ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function useActiveTab(
  defaultTab: string,
  paramName = "tab",
): string {
  const searchParams = useSearchParams();
  return searchParams.get(paramName) ?? defaultTab;
}
