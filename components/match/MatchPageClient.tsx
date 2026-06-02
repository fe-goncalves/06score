"use client";

import { Suspense } from "react";
import { LineupsPanel } from "@/components/match/LineupsPanel";
import { MatchCompetitionPreview } from "@/components/match/MatchCompetitionPreview";
import { MatchMotmCard } from "@/components/match/MatchMotmCard";
import { MatchH2HPanel } from "@/components/match/MatchH2HPanel";
import { MatchHubHeader } from "@/components/match/MatchHubHeader";
import { MatchStatisticsPanel } from "@/components/match/MatchStatisticsPanel";
import { MatchTabPlaceholder } from "@/components/match/MatchTabPlaceholder";
import { TimelinePanel } from "@/components/match/TimelinePanel";
import {
  DEFAULT_MATCH_TAB,
  MATCH_TABS,
  resolveMatchTab,
} from "@/lib/match/matchTabs";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { CompetitionHubData, MatchPageData } from "@/lib/types";

interface MatchPageClientProps {
  data: MatchPageData;
  competitionHub: CompetitionHubData | null;
}

function MatchContent({
  data,
  tab,
  competitionHub,
}: {
  data: MatchPageData;
  tab: string;
  competitionHub: CompetitionHubData | null;
}) {
  const active = resolveMatchTab(tab);
  const {
    match,
    lineups,
    ratings,
    actions,
    teamAId,
    teamBId,
    h2hMatches,
    nextGameA,
    nextGameB,
    periodFoulCounts,
    staffLineups,
    teamStats,
  } = data;

  return (
    <div className="match-page-panel">
      <div className={active === "detalhes" ? undefined : "hidden"}>
        <div className="match-details-stack">
          <MatchMotmCard
            match={match}
            ratings={ratings}
            lineups={lineups}
            accentColor={
              match.phases?.competition_editions?.competitions?.primary_color ??
              null
            }
          />
          <TimelinePanel
            actions={actions}
            teamAId={teamAId}
            teamBId={teamBId}
            periodFoulCounts={periodFoulCounts}
            accentColor={
              match.phases?.competition_editions?.competitions?.primary_color ??
              null
            }
          />
        </div>
      </div>

      <div className={active === "formacoes" ? undefined : "hidden"}>
        <LineupsPanel
          match={match}
          lineups={lineups}
          staffLineups={staffLineups}
          ratings={ratings}
          actions={actions}
          teamAId={teamAId}
        />
      </div>

      <div className={active === "estatisticas" ? undefined : "hidden"}>
        <MatchStatisticsPanel
          match={match}
          actions={actions}
          teamAId={teamAId}
          teamStats={teamStats}
        />
      </div>

      <div className={active === "partidas" ? undefined : "hidden"}>
        <MatchH2HPanel
          match={match}
          h2hMatches={h2hMatches}
          nextGameA={nextGameA}
          nextGameB={nextGameB}
          teamAId={teamAId}
          teamBId={teamBId}
        />
      </div>

      <div className={active === "competicao" ? undefined : "hidden"}>
        <MatchCompetitionPreview match={match} hub={competitionHub} />
      </div>

      <div className={active === "midia" ? undefined : "hidden"}>
        <MatchTabPlaceholder label="Mídia" />
      </div>
    </div>
  );
}

export function MatchPageClient({
  data,
  competitionHub,
}: MatchPageClientProps) {
  const { tab, setTab } = useClientTab(DEFAULT_MATCH_TAB, "tab");
  const activeTab = resolveMatchTab(tab);

  return (
    <div className="match-page">
      <Suspense
        fallback={
          <div className="h-48 animate-pulse bg-black/40" aria-hidden />
        }
      >
        <MatchHubHeader
          match={data.match}
          actions={data.actions}
          teamAId={data.teamAId}
          teamBId={data.teamBId}
          tabs={MATCH_TABS}
          activeTab={activeTab}
          onTabChange={setTab}
        />
        <MatchContent
          data={data}
          tab={activeTab}
          competitionHub={competitionHub}
        />
      </Suspense>
    </div>
  );
}
