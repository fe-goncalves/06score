"use client";

import { useMemo, useState } from "react";
import { CompetitionSelector } from "@/components/layout/CompetitionSelector";
import { HomeHero } from "@/components/home/HomeHero";
import { LeadersSection } from "@/components/home/LeadersSection";
import { MatchResultsStrip } from "@/components/home/MatchResultsStrip";
import { NewsJournalSection } from "@/components/home/NewsJournalSection";
import { TeamsLogoCarousel } from "@/components/home/TeamsLogoCarousel";
import type {
  Competition,
  HomeEditionData,
  HomeMatches,
  HomeNewsArticle,
  Organization,
} from "@/lib/types";
import type { CompetitionFilterId } from "@/lib/home/filters";
import {
  filterMatches,
  filterNews,
  getActiveCompetitionMeta,
  getLeadersForFilter,
  getStandingsForFilter,
  getTeamsForFilter,
} from "@/lib/home/filters";

export interface HomeClientProps {
  org: Organization;
  competitions: Competition[];
  matches: HomeMatches;
  news: HomeNewsArticle[];
  editionsByCompetition: Record<string, HomeEditionData>;
}

export function HomeClient({
  org,
  competitions,
  matches,
  news,
  editionsByCompetition,
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

  const { topScorer, topAssister, topMvp } = useMemo(
    () => getLeadersForFilter(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const competitionMeta = useMemo(
    () =>
      getActiveCompetitionMeta(editionsByCompetition, competitions, selectedId),
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
        competitionId={competitionMeta?.id ?? null}
        competitionName={competitionMeta?.name ?? ""}
      />

      <NewsJournalSection articles={filteredNews} skipCount={3} />

      <LeadersSection
        topScorer={topScorer}
        topAssister={topAssister}
        topMvp={topMvp}
      />

      <TeamsLogoCarousel teams={teams} org={org} />
    </div>
  );
}
