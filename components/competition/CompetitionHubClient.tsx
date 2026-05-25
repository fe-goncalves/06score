"use client";

import { Suspense } from "react";
import { CompetitionHubHeader } from "@/components/competition/CompetitionHubHeader";
import { EditionStatsLeaders } from "@/components/competition/EditionStatsLeaders";
import { MatchesByRound } from "@/components/competition/MatchesByRound";
import { PhaseStandingsPanel } from "@/components/competition/PhaseStandingsPanel";
import { StandingsTable } from "@/components/competition/StandingsTable";
import { TeamsGrid } from "@/components/competition/TeamsGrid";
import { PageTabs, useActiveTab } from "@/components/ui/PageTabs";
import type { CompetitionHubData } from "@/lib/types";
import { statsToStandings } from "@/lib/utils";

const TABS = [
  { id: "classificacao", label: "CLASSIFICAÇÃO" },
  { id: "jogos", label: "JOGOS" },
  { id: "fases", label: "FASES" },
  { id: "equipes", label: "EQUIPES" },
  { id: "estatisticas", label: "ESTATÍSTICAS" },
];

function HubContent({ hub }: { hub: CompetitionHubData }) {
  const tab = useActiveTab("classificacao");
  const standings = statsToStandings(hub.teamEditionStats);

  return (
    <>
      <PageTabs tabs={TABS} defaultTab="classificacao" />
      <div className="mt-8">
        {tab === "classificacao" && <StandingsTable rows={standings} />}
        {tab === "jogos" && (
          <MatchesByRound
            matches={hub.matches}
            phases={hub.phases}
            matchups={hub.matchups}
          />
        )}
        {tab === "fases" && (
          <PhaseStandingsPanel
            phases={hub.phases}
            matches={hub.matches}
            matchups={hub.matchups}
            teamEditionStats={hub.teamEditionStats}
            groups={hub.groups}
            groupTeams={hub.groupTeams}
          />
        )}
        {tab === "equipes" && <TeamsGrid editionTeams={hub.editionTeams} />}
        {tab === "estatisticas" && (
          <EditionStatsLeaders
            topScorers={hub.topScorers}
            topAssisters={hub.topAssisters}
            topYellowCards={hub.topYellowCards}
          />
        )}
      </div>
    </>
  );
}

export function CompetitionHubClient({ hub }: { hub: CompetitionHubData }) {
  return (
    <Suspense fallback={<div className="h-12 animate-pulse card-surface" />}>
      <CompetitionHubHeader
        competition={hub.competition}
        currentEdition={hub.currentEdition}
      />
      <HubContent hub={hub} />
    </Suspense>
  );
}
