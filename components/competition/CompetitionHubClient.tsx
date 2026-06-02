"use client";

import { Suspense, useMemo } from "react";
import { CompetitionHubHeader } from "@/components/competition/CompetitionHubHeader";
import { CompetitionDetailsPanel } from "@/components/competition/CompetitionDetailsPanel";
import { CompetitionTabPanel } from "@/components/competition/CompetitionTabPanel";
import { EditionStatsLeaders } from "@/components/competition/EditionStatsLeaders";
import { TeamsGrid } from "@/components/competition/TeamsGrid";
import {
  getDefaultHubTab,
  getHubTabs,
  resolveHubTab,
} from "@/lib/competition/hubTabs";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { CompetitionHubData } from "@/lib/types";

function HubContent({
  hub,
  accentColor,
  tab,
}: {
  hub: CompetitionHubData;
  accentColor: string | null;
  tab: string;
}) {
  const active = resolveHubTab(tab);
  const editionKey = hub.currentEdition?.id ?? "edition";

  return (
    <div className="competition-hub-panel">
      <div className={active === "competicao" ? undefined : "hidden"}>
        <CompetitionTabPanel
          key={editionKey}
          phases={hub.phases}
          matches={hub.matches}
          matchups={hub.matchups}
          teamEditionStats={hub.teamEditionStats}
          groups={hub.groups}
          groupTeams={hub.groupTeams}
          tableMarkers={hub.tableMarkers}
          accentColor={accentColor}
        />
      </div>

      <div className={active === "estatisticas" ? undefined : "hidden"}>
        <EditionStatsLeaders
          topScorers={hub.topScorers}
          topAssisters={hub.topAssisters}
          topYellowCards={hub.topYellowCards}
          topMotm={hub.topMotm}
          topRedCards={hub.topRedCards}
          topTotwSelections={hub.topTotwSelections}
          teamEditionStats={hub.teamEditionStats}
          totwGallery={hub.totwGallery}
          accentColor={accentColor}
        />
      </div>

      <div className={active === "equipes" ? undefined : "hidden"}>
        <TeamsGrid editionTeams={hub.editionTeams} />
      </div>

      <div className={active === "detalhes" ? undefined : "hidden"}>
        <CompetitionDetailsPanel
          competition={hub.competition}
          currentEdition={hub.currentEdition}
          teamCount={hub.editionTeams.length}
          matchCount={hub.matches.length}
          details={hub.editionDetails}
          awards={hub.awards}
          totsSquad={hub.totsSquad}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}

export function CompetitionHubClient({ hub }: { hub: CompetitionHubData }) {
  const accentColor = hub.competition.primary_color ?? null;
  const tabs = useMemo(
    () => getHubTabs(hub.currentEdition),
    [hub.currentEdition],
  );
  const defaultTab = useMemo(
    () => getDefaultHubTab(hub.currentEdition),
    [hub.currentEdition],
  );
  const { tab, setTab } = useClientTab(defaultTab, "tab");

  return (
    <Suspense
      fallback={
        <div className="h-40 animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.02]" />
      }
    >
      <CompetitionHubHeader
        competition={hub.competition}
        editions={hub.editions}
        currentEdition={hub.currentEdition}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        accentColor={accentColor}
      />
      <HubContent hub={hub} accentColor={accentColor} tab={tab} />
    </Suspense>
  );
}
