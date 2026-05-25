"use client";

import { Suspense } from "react";
import { LineupsPanel } from "@/components/match/LineupsPanel";
import { MatchHeader } from "@/components/match/MatchHeader";
import { MatchTeamStats } from "@/components/match/MatchTeamStats";
import { TimelinePanel } from "@/components/match/TimelinePanel";
import { PageTabs, useActiveTab } from "@/components/ui/PageTabs";
import type { MatchDetailData } from "@/lib/types";

const TABS = [
  { id: "escalacoes", label: "ESCALAÇÕES" },
  { id: "timeline", label: "LINHA DO TEMPO" },
  { id: "estatisticas", label: "ESTATÍSTICAS" },
];

interface MatchPageClientProps {
  data: MatchDetailData;
}

function MatchContent({ data }: MatchPageClientProps) {
  const tab = useActiveTab("escalacoes");
  const { match, lineups, ratings, actions, teamAId } = data;

  return (
    <>
      <PageTabs tabs={TABS} defaultTab="escalacoes" />
      <div className="mt-8">
        {tab === "escalacoes" && (
          <LineupsPanel
            match={match}
            lineups={lineups}
            ratings={ratings}
            teamAId={teamAId}
          />
        )}
        {tab === "timeline" && (
          <TimelinePanel match={match} actions={actions} teamAId={teamAId} />
        )}
        {tab === "estatisticas" && (
          <MatchTeamStats match={match} actions={actions} teamAId={teamAId} />
        )}
      </div>
    </>
  );
}

export function MatchPageClient({ data }: MatchPageClientProps) {
  return (
    <Suspense fallback={<div className="h-12 animate-pulse card-surface" />}>
      <MatchHeader match={data.match} />
      <div className="mt-10">
        <MatchContent data={data} />
      </div>
    </Suspense>
  );
}
