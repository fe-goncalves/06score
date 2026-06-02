"use client";

import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TabItem } from "@/components/ui/PageTabs";

interface CompetitionHubTabsProps {
  tabs: TabItem[];
  defaultTab: string;
  accentColor?: string | null;
}

export function CompetitionHubTabs({
  tabs,
  defaultTab,
  accentColor,
}: CompetitionHubTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") ?? defaultTab;
  const accent = accentColor ?? "var(--color-brand)";

  function setTab(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <nav className="competition-hub-tabs scrollbar-hide" aria-label="Seções da competição">
      <div className="competition-hub-tabs-track">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`competition-hub-tab ${isActive ? "competition-hub-tab-active" : ""}`}
              style={{ "--tab-accent": accent } as CSSProperties}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function useCompetitionHubTab(
  defaultTab: string,
): string {
  const searchParams = useSearchParams();
  return searchParams.get("tab") ?? defaultTab;
}
