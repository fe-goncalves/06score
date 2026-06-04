import { notFound } from "next/navigation";
import { TeamPageClient } from "@/components/team/TeamPageClient";
import { getTeamProfile } from "@/lib/data/team";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: "Time" };

  const profile = await getTeamProfile(id, org.id);
  return {
    title:
      profile?.team.short_name?.trim() ||
      profile?.team.full_name ||
      "Time",
  };
}

export default async function TeamProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getTeamProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="page-container athlete-page-wrap team-profile-wrap pb-6 pt-0">
      <TeamPageClient profile={profile} />
    </div>
  );
}
