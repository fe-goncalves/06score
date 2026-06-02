"use client";

import { useMemo, useState } from "react";
import { CompetitionSelector } from "@/components/layout/CompetitionSelector";
import { HomeHero } from "@/components/home/HomeHero";
import { LeadersSection } from "@/components/home/LeadersSection";
import { MatchResultsStrip } from "@/components/home/MatchResultsStrip";
import { HomeActiveCompetitionsSection } from "@/components/home/HomeActiveCompetitionsSection";
import { HomeTotwSection } from "@/components/home/HomeTotwSection";
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
import { HERO_NEWS_COUNT } from "@/lib/home/news";
import type { CompetitionFilterId } from "@/lib/home/filters";
import { standingsWithPhaseForm } from "@/lib/competition/mergePhaseStandings";
import {
  filterMatches,
  filterNews,
  getActiveCompetitionMeta,
  getLatestMotwForFilter,
  getLatestTotwForFilter,
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

  const currentEditionData = useMemo(
    () => resolveEditionData(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const standingsForTable = useMemo(
    () =>
      standingsWithPhaseForm(
        standings,
        currentEditionData?.phaseMatches ?? [],
      ),
    [standings, currentEditionData?.phaseMatches],
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

  const latestMotw = useMemo(
    () =>
      getLatestMotwForFilter(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const latestTotw = useMemo(
    () =>
      getLatestTotwForFilter(editionsByCompetition, competitions, selectedId),
    [editionsByCompetition, competitions, selectedId],
  );

  const activeCompetitionId = selectedId ?? competitionMeta?.id ?? null;

  return (
    <div className="home-page">
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
        standings={standingsForTable}
        upcoming={matches.upcoming}
        latestMotw={latestMotw}
        competitionId={competitionMeta?.id ?? null}
        competitionName={competitionMeta?.name ?? ""}
        competitionColor={competitionMeta?.primaryColor ?? null}
      />

      <NewsJournalSection
        articles={filteredNews}
        skipCount={HERO_NEWS_COUNT}
        competitionId={activeCompetitionId}
        competitionName={competitionMeta?.name ?? ""}
        competitionColor={competitionMeta?.primaryColor ?? null}
        competitionLogoUrl={competitionMeta?.logoUrl ?? null}
        editionName={currentEditionData?.editionName ?? null}
        phaseName={currentEditionData?.currentPhaseName ?? null}
        standings={standingsForTable}
        currentPhaseType={currentEditionData?.currentPhaseType ?? null}
        phaseMatches={currentEditionData?.phaseMatches ?? []}
        phaseMatchups={currentEditionData?.phaseMatchups ?? []}
      />

      <HomeActiveCompetitionsSection competitions={competitions} />

      <HomeTotwSection
        totw={latestTotw}
        competitions={competitions}
        competitionName={competitionMeta?.name ?? ""}
        competitionColor={competitionMeta?.primaryColor ?? null}
        competitionLogoUrl={competitionMeta?.logoUrl ?? null}
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
