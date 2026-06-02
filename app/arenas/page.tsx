import { notFound } from "next/navigation";
import { ArenasListClient } from "@/components/arenas/ArenasListClient";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { getOrgVenues } from "@/lib/data/venue";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: org ? `${org.name} — Arenas` : "Arenas" };
}

export default async function ArenasPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const venues = await getOrgVenues(org.id);

  return (
    <div className="site-list-page">
      <SiteListHero
        eyebrow="Locais"
        title="Arenas"
        description={`Onde a ${org.name} acontece — endereços e locais de disputa dos campeonatos.`}
      />
      <ArenasListClient venues={venues} />
    </div>
  );
}
