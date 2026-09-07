import { TeamsListClient } from "@/components/team/TeamsListClient";
import { getOrgTeams } from "@/lib/data/home";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: metaTitle(org ? `${org.name} — EQUIPES` : "EQUIPES") };
}

export default async function TeamsListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const teams = await getOrgTeams(org.id);

  return (
    <div className="site-list-page times-page">
      <TeamsListClient teams={teams} />
    </div>
  );
}
