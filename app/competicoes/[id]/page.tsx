import { notFound } from "next/navigation";
import { CompetitionHubClient } from "@/components/competition/CompetitionHubClient";
import {
  getCachedCompetitionHub,
  getCachedOrganization,
  getCompetitionTitle,
} from "@/lib/data/cached";
import { getOrgSlug } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edition?: string; tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getCachedOrganization(slug);
  if (!org) return { title: "Competição" };

  const title = await getCompetitionTitle(id, org.id);
  return { title: title ?? "Competição" };
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
