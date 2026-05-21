import Link from "next/link";
import { notFound } from "next/navigation";
import { RecentMatchesList } from "@/components/athlete/RecentMatchesList";
import { TeamEditionStatsBlock } from "@/components/team/TeamEditionStatsBlock";
import { TeamProfileHeader } from "@/components/team/TeamProfileHeader";
import { TeamSquadGrid } from "@/components/team/TeamSquadGrid";
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
  return { title: profile?.team.full_name ?? "Time" };
}

export default async function TeamProfilePage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const profile = await getTeamProfile(id, org.id);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/times"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Times
      </Link>
      <TeamProfileHeader team={profile.team} />
      <TeamSquadGrid squad={profile.squad} />
      <TeamEditionStatsBlock stats={profile.editionStats} />
      <RecentMatchesList
        matches={profile.recentMatches}
        title="Últimos resultados"
      />
    </div>
  );
}
