"use client";

import { useMemo, useState } from "react";
import { CompetitionSelector } from "@/components/layout/CompetitionSelector";
import { HomeHero } from "@/components/home/HomeHero";
import { LeadersSection } from "@/components/home/LeadersSection";
import { MatchResultsStrip } from "@/components/home/MatchResultsStrip";
import { NewsJournalSection } from "@/components/home/NewsJournalSection";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { TeamsLogoCarousel } from "@/components/home/TeamsLogoCarousel";
import type {
  Competition,
  HomeEditionData,
  HomeHighlightsBundle,
  HomeMatches,
  HomeNewsArticle,
  HomeSponsor,
  Organization,
} from "@/lib/types";
import type { CompetitionFilterId } from "@/lib/home/filters";
import {
  filterMatches,
  filterNews,
  getActiveCompetitionMeta,
  getLatestMotwForFilter,
  getLeadersForFilter,
  resolveEditionData,
  getStandingsForFilter,
  getTeamsForFilter,
} from "@/lib/home/filters";

export interface HomeClientProps {
  org: Organization;
  competitions: Competition[];
  matches: HomeMatches;
  news: HomeNewsArticle[];
  sponsors: HomeSponsor[];
  editionsByCompetition: Record<string, HomeEditionData>;
  highlights: HomeHighlightsBundle;
}

export function HomeClient({
  org,
  competitions,
  matches,
  news,
  sponsors,
  editionsByCompetition,
  highlights,
}: HomeClientProps) {
  const [selectedId, setSelectedId] = useState<CompetitionFilterId>(null);

  const filteredMatches = useMemo(
    () => filterMatches(matches, selectedId),
    [matches, selectedId],
  );

  const filteredNews = useMemo(
    () => filterNews(news, selectedId),
    [news, selectedId],
  );

  const standings = useMemo(
    () =>
      getStandingsForFilter(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const teams = useMemo(
    () => getTeamsForFilter(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const { topScorer, topAssister, topTeamByTitles } = useMemo(
    () => getLeadersForFilter(highlights, selectedId),
    [highlights, selectedId],
  );

  const competitionMeta = useMemo(
    () =>
      getActiveCompetitionMeta(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const currentEditionData = useMemo(
    () => resolveEditionData(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const latestMotw = useMemo(
    () =>
      getLatestMotwForFilter(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  return (
    <div>
      <MatchResultsStrip
        recent={filteredMatches.recent}
        upcoming={filteredMatches.upcoming}
      />

      <CompetitionSelector
        competitions={competitions}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <HomeHero
        articles={filteredNews}
        standings={standings}
        upcoming={filteredMatches.upcoming}
        latestMotw={latestMotw}
        competitionId={competitionMeta?.id ?? null}
        competitionName={competitionMeta?.name ?? ""}
        competitionColor={competitionMeta?.primaryColor ?? null}
      />

      <NewsJournalSection
        articles={filteredNews}
        skipCount={3}
        competitionId={competitionMeta?.id ?? null}
        competitionName={competitionMeta?.name ?? ""}
        competitionColor={competitionMeta?.primaryColor ?? null}
        competitionLogoUrl={competitionMeta?.logoUrl ?? null}
        editionName={currentEditionData?.editionName ?? null}
        phaseName={currentEditionData?.currentPhaseName ?? null}
        standings={standings}
        currentPhaseType={currentEditionData?.currentPhaseType ?? null}
        phaseMatches={currentEditionData?.phaseMatches ?? []}
        phaseMatchups={currentEditionData?.phaseMatchups ?? []}
      />

      <LeadersSection
        topScorer={topScorer}
        topAssister={topAssister}
        topTeamByTitles={topTeamByTitles}
        competitionColor={competitionMeta?.primaryColor ?? null}
        isOrganizationScope={selectedId === null}
      />

      <TeamsLogoCarousel teams={teams} org={org} />

      <SponsorsSection sponsors={sponsors} />
    </div>
  );
}
