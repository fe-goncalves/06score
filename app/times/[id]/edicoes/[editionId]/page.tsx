import { notFound } from "next/navigation";
import { TeamEditionPageClient } from "@/components/team/TeamEditionPageClient";
import { getTeamEditionPage } from "@/lib/data/teamEdition";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string; editionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id, editionId } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: metaTitle("Edição") };

  const data = await getTeamEditionPage(id, editionId, org.id);
  return {
    title: metaTitle(
      data
        ? `${data.team.short_name ?? data.team.full_name} — ${data.editionLabel}`
        : "Edição",
    ),
    icons: metaIcons(data?.team.logo_url, org.logo_url),
  };
}

export default async function TeamEditionPage({ params }: PageProps) {
  const { id, editionId } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const data = await getTeamEditionPage(id, editionId, org.id);
  if (!data) notFound();

  return (
    <div className="page-container athlete-page-wrap team-profile-wrap pb-6 pt-0">
      <TeamEditionPageClient data={data} />
    </div>
  );
}
