import { notFound } from "next/navigation";
import { ArenaPageClient } from "@/components/arenas/ArenaPageClient";
import { getVenueProfile } from "@/lib/data/venue";
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
  if (!org) return { title: metaTitle("Arena") };

  const profile = await getVenueProfile(id, org.id);
  const logo =
    profile?.venue.logo_url?.trim() ||
    profile?.venue.image_url?.trim() ||
    null;
  return {
    title: metaTitle(profile?.venue.full_name ?? "Arena"),
    icons: metaIcons(logo, org.logo_url),
  };
}

export default async function ArenaProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getVenueProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="page-container athlete-page-wrap pb-6 pt-0">
      <ArenaPageClient profile={profile} />
    </div>
  );
}
