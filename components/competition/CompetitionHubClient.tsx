"use client";

import { Suspense, useMemo } from "react";
import { CompetitionHallPanel } from "@/components/competition/CompetitionHallPanel";
import { CompetitionHubHeader } from "@/components/competition/CompetitionHubHeader";
import { CompetitionDetailsPanel } from "@/components/competition/CompetitionDetailsPanel";
import { CompetitionNewsPanel } from "@/components/competition/CompetitionNewsPanel";
import { CompetitionPartidasPanel } from "@/components/competition/CompetitionPartidasPanel";
import { CompetitionTabPanel } from "@/components/competition/CompetitionTabPanel";
import { EditionStatsLeaders } from "@/components/competition/EditionStatsLeaders";
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
  availableTabIds,
}: {
  hub: CompetitionHubData;
  accentColor: string | null;
  tab: string;
  availableTabIds: string[];
}) {
  const active = resolveHubTab(tab, availableTabIds);
  const editionKey = hub.currentEdition?.id ?? "edition";

  return (
    <div className="competition-hub-panel" key={active}>
      <div
        className={`competition-tab-pane ${active === "hall" ? "competition-tab-pane--active" : "hidden"}`}
      >
        <CompetitionHallPanel
          awards={hub.awards}
          totsSquad={hub.totsSquad}
          accentColor={accentColor}
        />
      </div>

      <div
        className={`competition-tab-pane ${active === "competicao" ? "competition-tab-pane--active" : "hidden"}`}
      >
        <CompetitionTabPanel
          key={editionKey}
          phases={hub.phases}
          matches={hub.matches}
          matchups={hub.matchups}
          rounds={hub.rounds}
          teamEditionStats={hub.teamEditionStats}
          groups={hub.groups}
          groupTeams={hub.groupTeams}
          tableMarkers={hub.tableMarkers}
          accentColor={accentColor}
        />
      </div>

      <div
        className={`competition-tab-pane ${active === "partidas" ? "competition-tab-pane--active" : "hidden"}`}
      >
        <CompetitionPartidasPanel
          matches={hub.matches}
          phases={hub.phases}
          matchups={hub.matchups}
          accentColor={accentColor}
        />
      </div>

      <div
        className={`competition-tab-pane ${active === "estatisticas" ? "competition-tab-pane--active" : "hidden"}`}
      >
        <EditionStatsLeaders
          topScorers={hub.topScorers}
          topAssisters={hub.topAssisters}
          topYellowCards={hub.topYellowCards}
          topMotm={hub.topMotm}
          topRedCards={hub.topRedCards}
          phases={hub.phases}
          accentColor={accentColor}
        />
      </div>

      <div
        className={`competition-tab-pane ${active === "noticias" ? "competition-tab-pane--active" : "hidden"}`}
      >
        <CompetitionNewsPanel news={hub.news} />
      </div>

      <div
        className={`competition-tab-pane ${active === "detalhes" ? "competition-tab-pane--active" : "hidden"}`}
      >
        <CompetitionDetailsPanel
          teamCount={hub.editionTeams.length}
          matchCount={hub.matches.length}
          details={hub.editionDetails}
          editionTeams={hub.editionTeams}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}

export function CompetitionHubClient({ hub }: { hub: CompetitionHubData }) {
  const accentColor = hub.competition.primary_color ?? null;
  const tabs = useMemo(
    () =>
      getHubTabs(hub.currentEdition, {
        hasNews: hub.news.length > 0,
      }),
    [hub.currentEdition, hub.news.length],
  );
  const availableTabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const defaultTab = useMemo(
    () => getDefaultHubTab(hub.currentEdition),
    [hub.currentEdition],
  );
  const { tab, setTab } = useClientTab(defaultTab, "tab");
  const activeTab = resolveHubTab(tab, availableTabIds);

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
        activeTab={activeTab}
        onTabChange={setTab}
        accentColor={accentColor}
      />
      <HubContent
        hub={hub}
        accentColor={accentColor}
        tab={activeTab}
        availableTabIds={availableTabIds}
      />
    </Suspense>
  );
}
