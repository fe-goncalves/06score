import { CompetitionsListClient } from "@/components/competition/CompetitionsListClient";
import { getCompetitionsList } from "@/lib/data/competition";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: metaTitle(org ? `${org.name} — COMPETIÇÕES` : "COMPETIÇÕES"),
  };
}

export default async function CompetitionsListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const competitions = await getCompetitionsList(org.id);

  return (
    <div className="site-list-page competitions-page">
      <CompetitionsListClient competitions={competitions} />
    </div>
  );
}
