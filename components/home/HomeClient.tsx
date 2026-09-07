"use client";

import { HomeHero } from "@/components/home/HomeHero";
import { MatchResultsStrip } from "@/components/home/MatchResultsStrip";
import { HomeActiveCompetitionsSection } from "@/components/home/HomeActiveCompetitionsSection";
import { HomeCompetitionsSections } from "@/components/home/HomeCompetitionsSections";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { TeamsLogoCarousel } from "@/components/home/TeamsLogoCarousel";
import type {
  Competition,
  HomeEditionData,
  HomeNewsArticle,
  HomeSponsor,
  Match,
  Team,
} from "@/lib/types";

export interface HomeClientProps {
  competitions: Competition[];
  homeEditions: HomeEditionData[];
  teams: Team[];
  stripMatches: Match[];
  news: HomeNewsArticle[];
  sponsors: HomeSponsor[];
  sponsorsVisible: boolean;
}

export function HomeClient({
  competitions,
  homeEditions,
  teams,
  stripMatches,
  news,
  sponsors,
  sponsorsVisible,
}: HomeClientProps) {
  return (
    <div className="home-page">
      <MatchResultsStrip matches={stripMatches} />

      <HomeHero articles={news} />

      <HomeCompetitionsSections editions={homeEditions} />

      <HomeActiveCompetitionsSection competitions={competitions} />

      <TeamsLogoCarousel teams={teams} />

      {sponsorsVisible ? <SponsorsSection sponsors={sponsors} /> : null}
    </div>
  );
}
