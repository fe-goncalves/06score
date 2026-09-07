import { notFound } from "next/navigation";
import { StaffPageClient } from "@/components/staff/StaffPageClient";
import { getCachedStaffProfile } from "@/lib/data/cached";
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
  if (!org) return { title: metaTitle("Comissão técnica") };

  const profile = await getCachedStaffProfile(id, org.id);
  const label =
    profile?.staff.surname ?? profile?.staff.full_name ?? "Comissão técnica";
  const currentTeam =
    profile?.stints.find((stint) => stint.is_current)?.teams ??
    profile?.stints[0]?.teams ??
    null;

  return {
    title: metaTitle(label),
    icons: metaIcons(profile?.staff.photo_url ?? currentTeam?.logo_url, org.logo_url),
  };
}

export default async function StaffProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getCachedStaffProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="page-container athlete-page-wrap pb-6 pt-0">
      <StaffPageClient profile={profile} />
    </div>
  );
}
