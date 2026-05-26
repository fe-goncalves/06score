import { HomeClient } from "@/components/home/HomeClient";
import {
  getActiveCompetitions,
  getFeaturedNews,
  getHomeEditionsBundle,
  getOrgSponsors,
  getRecentAndUpcomingMatches,
} from "@/lib/data/home";
import { getHomeHighlightsBundle } from "@/lib/data/home-highlights";
import { getOrgSlug, getOrganization } from "@/lib/org";

export default async function HomePage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);

  if (!org) {
    return null;
  }

  const [competitions, matches, news, sponsors] = await Promise.all([
    getActiveCompetitions(org.id),
    getRecentAndUpcomingMatches(org.id),
    getFeaturedNews(org.id),
    getOrgSponsors(org.id),
  ]);

  const [editionsByCompetition, highlights] = await Promise.all([
    getHomeEditionsBundle(competitions),
    getHomeHighlightsBundle(org.id, competitions),
  ]);

  return (
    <HomeClient
      org={org}
      competitions={competitions}
      matches={matches}
      news={news}
      sponsors={sponsors}
      editionsByCompetition={editionsByCompetition}
      highlights={highlights}
    />
  );
}
