import { notFound } from "next/navigation";
import { CompetitionHubClient } from "@/components/competition/CompetitionHubClient";
import {
  getCachedCompetitionHub,
  getCachedOrganization,
  getCompetitionTitle,
} from "@/lib/data/cached";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edition?: string; tab?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edition } = await searchParams;
  const slug = await getOrgSlug();
  const org = await getCachedOrganization(slug);
  if (!org) return { title: metaTitle("Competição") };

  const [title, hub] = await Promise.all([
    getCompetitionTitle(id, org.id, edition),
    getCachedCompetitionHub(id, org.id, edition),
  ]);

  return {
    title: metaTitle(title ?? "Competição"),
    icons: metaIcons(hub?.competition.logo_url, org.logo_url),
  };
}

export default async function CompetitionHubPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { edition } = await searchParams;
  const slug = await getOrgSlug();
  const org = await getCachedOrganization(slug);
  if (!org) return null;

  const hub = await getCachedCompetitionHub(id, org.id, edition);
  if (!hub) notFound();

  return (
    <div className="competitions-page pb-14">
      <div className="page-container pt-6 md:pt-8">
        <CompetitionHubClient hub={hub} />
      </div>
    </div>
  );
}
