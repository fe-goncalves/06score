import { HomeClient } from "@/components/home/HomeClient";
import {
  getFeaturedNews,
  getHomeEditions,
  getHomeEditionsBundle,
  getHomeStripMatches,
  getOrgTeams,
  homeEditionsToCompetitions,
} from "@/lib/data/home";
import { getPublicSiteHomeConfig } from "@/lib/data/siteHome";
import { getOrgSlug, getOrganization } from "@/lib/org";

/** Janela da faixa de jogos no topo da home (± dias a partir de hoje). */
const HOME_STRIP_DAYS = 7;

export default async function HomePage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);

  if (!org) {
    return null;
  }

  const homeConfig = await getPublicSiteHomeConfig(slug);
  const homeEditionEntries = await getHomeEditions(org.id);
  const competitions = homeEditionsToCompetitions(homeEditionEntries);

  const [stripMatches, news, teams, homeEditions] = await Promise.all([
    getHomeStripMatches(org.id, HOME_STRIP_DAYS, HOME_STRIP_DAYS),
    getFeaturedNews(org.id),
    getOrgTeams(org.id),
    getHomeEditionsBundle(homeEditionEntries),
  ]);

  return (
    <HomeClient
      competitions={competitions}
      homeEditions={homeEditions}
      teams={teams}
      stripMatches={stripMatches}
      news={news}
      sponsors={homeConfig.sponsors}
      sponsorsVisible={homeConfig.home_sponsors_visible}
    />
  );
}
