import { notFound } from "next/navigation";
import { RankingClient } from "@/components/ranking/RankingClient";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: metaTitle(org ? `${org.name} — RANKING` : "RANKING"),
  };
}

export default async function RankingPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  return (
    <div className="site-list-page">
      <RankingClient orgId={org.id} />
    </div>
  );
}
