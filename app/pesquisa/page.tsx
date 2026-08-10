import { SearchPageClient } from "@/components/search/SearchPageClient";
import { getAthletesList } from "@/lib/data/athlete";
import { getCompetitionsList } from "@/lib/data/competition";
import { getStaffList } from "@/lib/data/staff";
import { getOrgVenues } from "@/lib/data/venue";
import { getOrgTeams } from "@/lib/data/home";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: metaTitle(org ? `${org.name} — PESQUISAR` : "PESQUISAR"),
  };
}

export default async function SearchPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const [athletes, teams, competitions, staff, venues] = await Promise.all([
    getAthletesList(org.id),
    getOrgTeams(org.id),
    getCompetitionsList(org.id),
    getStaffList(org.id),
    getOrgVenues(org.id),
  ]);

  return (
    <div className="site-list-page">
      <SearchPageClient
        athletes={athletes}
        teams={teams}
        competitions={competitions}
        staff={staff}
        venues={venues}
      />
    </div>
  );
}
