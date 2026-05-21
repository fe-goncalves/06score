import { CompetitionsGrid } from "@/components/home/CompetitionsGrid";
import { LeadersSection } from "@/components/home/LeadersSection";
import { MatchesCarousel } from "@/components/home/MatchesCarousel";
import { NewsGrid } from "@/components/home/NewsGrid";
import {
  getActiveCompetitions,
  getActiveEditionId,
  getFeaturedNews,
  getRecentAndUpcomingMatches,
  getTopAssister,
  getTopScorer,
} from "@/lib/data/home";
import { getOrgSlug, getOrganization } from "@/lib/org";

export default async function HomePage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);

  if (!org) {
    return null;
  }

  const editionIdPromise = getActiveEditionId(org.id);

  const [matches, competitions, news, editionId] = await Promise.all([
    getRecentAndUpcomingMatches(org.id),
    getActiveCompetitions(org.id),
    getFeaturedNews(org.id),
    editionIdPromise,
  ]);

  const [topScorer, topAssister] = editionId
    ? await Promise.all([
        getTopScorer(editionId),
        getTopAssister(editionId),
      ])
    : [null, null];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <MatchesCarousel recent={matches.recent} upcoming={matches.upcoming} />
      <CompetitionsGrid competitions={competitions} />
      <NewsGrid articles={news} />
      <LeadersSection topScorer={topScorer} topAssister={topAssister} />
    </div>
  );
}
