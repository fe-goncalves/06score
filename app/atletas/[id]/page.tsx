import { notFound } from "next/navigation";
import { AthletePageClient } from "@/components/athlete/AthletePageClient";
import { getAthleteProfile } from "@/lib/data/athlete";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { athleteSurnameLabel } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: "Atleta" };

  const profile = await getAthleteProfile(id, org.id);
  if (!profile) return { title: "Atleta" };

  return {
    title: athleteSurnameLabel(
      profile.athlete.full_name,
      profile.athlete.surname,
    ),
  };
}

export default async function AthleteProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getAthleteProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="page-container athlete-page-wrap pb-6 pt-0">
      <AthletePageClient profile={profile} />
    </div>
  );
}
