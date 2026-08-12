import { notFound } from "next/navigation";
import { AthletePageClient } from "@/components/athlete/AthletePageClient";
import { getCachedAthleteProfile } from "@/lib/data/cached";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { athleteSurnameLabel } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: metaTitle("Atleta") };

  const profile = await getCachedAthleteProfile(id, org.id);
  if (!profile) return { title: metaTitle("Atleta"), icons: metaIcons(null, org.logo_url) };

  const currentTeam =
    profile.stints.find((stint) => stint.is_current)?.teams ??
    profile.stints[0]?.teams ??
    null;

  return {
    title: metaTitle(
      athleteSurnameLabel(profile.athlete.full_name, profile.athlete.surname),
    ),
    icons: metaIcons(
      profile.athlete.photo_url ?? currentTeam?.logo_url,
      org.logo_url,
    ),
  };
}

export default async function AthleteProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getCachedAthleteProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="page-container athlete-page-wrap pb-6 pt-0">
      <AthletePageClient profile={profile} />
    </div>
  );
}
