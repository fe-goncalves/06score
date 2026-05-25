import { HomeClient } from "@/components/home/HomeClient";
import {
  getActiveCompetitions,
  getFeaturedNews,
  getHomeEditionsBundle,
  getRecentAndUpcomingMatches,
} from "@/lib/data/home";
import { getOrgSlug, getOrganization } from "@/lib/org";

export default async function HomePage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);

  if (!org) {
    return null;
  }

  const [competitions, matches, news] = await Promise.all([
    getActiveCompetitions(org.id),
    getRecentAndUpcomingMatches(org.id),
    getFeaturedNews(org.id),
  ]);

  const editionsByCompetition = await getHomeEditionsBundle(competitions);

  return (
    <HomeClient
      org={org}
      competitions={competitions}
      matches={matches}
      news={news}
      editionsByCompetition={editionsByCompetition}
    />
  );
}
