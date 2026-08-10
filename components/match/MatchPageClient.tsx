"use client";

import { Suspense, useMemo } from "react";
import { LineupsPanel } from "@/components/match/LineupsPanel";
import { MatchMotmCard } from "@/components/match/MatchMotmCard";
import { MatchHubHeader } from "@/components/match/MatchHubHeader";
import { MatchMediaPanel } from "@/components/match/MatchMediaPanel";
import { MatchRoundPanel } from "@/components/match/MatchRoundPanel";
import { MatchStatisticsPanel } from "@/components/match/MatchStatisticsPanel";
import { TimelinePanel } from "@/components/match/TimelinePanel";
import {
  buildMatchTabs,
  DEFAULT_MATCH_TAB,
  resolveMatchTab,
} from "@/lib/match/matchTabs";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { MatchPageData } from "@/lib/types";

interface MatchPageClientProps {
  data: MatchPageData;
}

function MatchContent({
  data,
  tab,
  availableTabIds,
}: {
  data: MatchPageData;
  tab: string;
  availableTabIds: string[];
}) {
  const active = resolveMatchTab(tab, availableTabIds);
  const {
    match,
    lineups,
    ratings,
    actions,
    teamAId,
    teamBId,
    periodFoulCounts,
    staffLineups,
    teamStats,
    roundMatches,
  } = data;

  const roundLabel =
    match.rounds?.custom_label?.trim() ||
    match.rounds?.name?.trim() ||
    null;

  return (
    <div className="match-page-panel" key={active}>
      <div
        className={`match-tab-pane ${active === "timeline" ? "match-tab-pane--active" : "hidden"}`}
      >
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

      <div
        className={`match-tab-pane ${active === "formacoes" ? "match-tab-pane--active" : "hidden"}`}
      >
        <LineupsPanel
          match={match}
          lineups={lineups}
          staffLineups={staffLineups}
          ratings={ratings}
          actions={actions}
          teamAId={teamAId}
        />
      </div>

      <div
        className={`match-tab-pane ${active === "estatisticas" ? "match-tab-pane--active" : "hidden"}`}
      >
        <MatchStatisticsPanel
          match={match}
          actions={actions}
          teamAId={teamAId}
          teamStats={teamStats}
        />
      </div>

      <div
        className={`match-tab-pane ${active === "rodada" ? "match-tab-pane--active" : "hidden"}`}
      >
        <MatchRoundPanel
          matches={roundMatches}
          currentMatchId={match.id}
          roundLabel={roundLabel}
        />
      </div>

      <div
        className={`match-tab-pane ${active === "midia" ? "match-tab-pane--active" : "hidden"}`}
      >
        <MatchMediaPanel
          match={match}
          accentColor={
            match.phases?.competition_editions?.competitions?.primary_color ??
            null
          }
        />
      </div>
    </div>
  );
}

export function MatchPageClient({ data }: MatchPageClientProps) {
  const hasMedia = Boolean(
    data.match.photos_url?.trim() || data.match.highlights_url?.trim(),
  );
  const hasRound = Boolean(
    data.match.round_id && data.roundMatches.length > 0,
  );
  const tabs = useMemo(
    () => buildMatchTabs({ hasRound, hasMedia }),
    [hasRound, hasMedia],
  );
  const availableTabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const { tab, setTab } = useClientTab(DEFAULT_MATCH_TAB, "tab");
  const activeTab = resolveMatchTab(tab, availableTabIds);

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
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setTab}
        />
        <MatchContent
          data={data}
          tab={activeTab}
          availableTabIds={availableTabIds}
        />
      </Suspense>
    </div>
  );
}
