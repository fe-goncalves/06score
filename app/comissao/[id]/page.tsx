import { notFound } from "next/navigation";
import { StaffPageClient } from "@/components/staff/StaffPageClient";
import { getStaffProfile } from "@/lib/data/staff";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: "Comissão técnica" };

  const profile = await getStaffProfile(id, org.id);
  const label = profile?.staff.surname ?? profile?.staff.full_name ?? "Comissão técnica";
  return { title: label };
}

export default async function StaffProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getStaffProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="page-container athlete-page-wrap pb-6 pt-0">
      <StaffPageClient profile={profile} />
    </div>
  );
}
