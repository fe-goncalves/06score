import { notFound } from "next/navigation";
import { ArenasListClient } from "@/components/arenas/ArenasListClient";
import { getOrgVenues } from "@/lib/data/venue";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: metaTitle(org ? `${org.name} — ARENAS` : "ARENAS") };
}

export default async function ArenasPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const venues = await getOrgVenues(org.id);

  return (
    <div className="site-list-page arenas-page">
      <ArenasListClient venues={venues} />
    </div>
  );
}
