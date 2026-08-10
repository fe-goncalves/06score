import { AthletesListClient } from "@/components/athlete/AthletesListClient";
import { getAthletesList } from "@/lib/data/athlete";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: metaTitle(org ? `${org.name} — ATLETAS` : "ATLETAS") };
}

export default async function AthletesListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const athletes = await getAthletesList(org.id);

  return (
    <div className="site-list-page athletes-page">
      <AthletesListClient athletes={athletes} />
    </div>
  );
}
