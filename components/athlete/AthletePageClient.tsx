"use client";

import type { CSSProperties } from "react";
import { AthleteCareerPanel } from "@/components/athlete/AthleteCareerPanel";
import { AthleteHubHeader } from "@/components/athlete/AthleteHubHeader";
import { AthleteMatchesPanel } from "@/components/athlete/AthleteMatchesPanel";
import { AthleteQuickStats } from "@/components/athlete/AthleteQuickStats";
import { AthleteStintsPanel } from "@/components/athlete/AthleteStintsPanel";
import {
  ATHLETE_TABS,
  DEFAULT_ATHLETE_TAB,
  resolveAthleteTab,
} from "@/lib/athlete/athleteTabs";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { AthleteProfileData } from "@/lib/types";

interface AthletePageClientProps {
  profile: AthleteProfileData;
}

function AthleteTabPanels({
  profile,
  tab,
}: {
  profile: AthleteProfileData;
  tab: string;
}) {
  const active = resolveAthleteTab(tab);

  return (
    <div className="athlete-tab-panels">
      <div
        className={`athlete-tab-panel${active === "carreira" ? " athlete-tab-panel--active" : ""}`}
        role="tabpanel"
        aria-hidden={active !== "carreira"}
      >
        <AthleteCareerPanel stats={profile.careerStats} />
      </div>
      <div
        className={`athlete-tab-panel${active === "equipes" ? " athlete-tab-panel--active" : ""}`}
        role="tabpanel"
        aria-hidden={active !== "equipes"}
      >
        <AthleteStintsPanel stints={profile.stints} />
      </div>
      <div
        className={`athlete-tab-panel${active === "partidas" ? " athlete-tab-panel--active" : ""}`}
        role="tabpanel"
        aria-hidden={active !== "partidas"}
      >
        <AthleteMatchesPanel matches={profile.recentMatches} />
      </div>
    </div>
  );
}

export function AthletePageClient({ profile }: AthletePageClientProps) {
  const { tab, setTab } = useClientTab(DEFAULT_ATHLETE_TAB, "tab");
  const activeTab = resolveAthleteTab(tab);
  const currentStint =
    profile.stints.find((s) => s.is_current) ?? profile.stints[0] ?? null;

  const accent =
    currentStint?.teams?.primary_color ?? "var(--color-brand)";

  return (
    <div
      className="athlete-page"
      style={{ "--athlete-accent": accent } as CSSProperties}
    >
      <AthleteHubHeader
        athlete={profile.athlete}
        currentStint={currentStint}
        tabs={ATHLETE_TABS}
        activeTab={activeTab}
        onTabChange={setTab}
      />

      <div className="athlete-page-panel">
        <AthleteQuickStats stats={profile.careerStats} />
        <AthleteTabPanels profile={profile} tab={activeTab} />
      </div>
    </div>
  );
}
