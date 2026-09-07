import { notFound } from "next/navigation";
import { TeamPageClient } from "@/components/team/TeamPageClient";
import { getTeamProfile } from "@/lib/data/team";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: metaTitle("Time") };

  const profile = await getTeamProfile(id, org.id);
  const raw =
    profile?.team.short_name?.trim() ||
    profile?.team.full_name ||
    "Time";
  return {
    title: metaTitle(raw),
    icons: metaIcons(profile?.team.logo_url, org.logo_url),
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
