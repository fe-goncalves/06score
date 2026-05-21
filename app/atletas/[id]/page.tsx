import Link from "next/link";
import { notFound } from "next/navigation";
import { AthleteCareerStatsBlock } from "@/components/athlete/AthleteCareerStats";
import { AthleteProfileHeader } from "@/components/athlete/AthleteProfileHeader";
import { AthleteStintsTimeline } from "@/components/athlete/AthleteStintsTimeline";
import { RecentMatchesList } from "@/components/athlete/RecentMatchesList";
import { getAthleteProfile } from "@/lib/data/athlete";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { athleteDisplayName } from "@/lib/utils";

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
    title: athleteDisplayName(
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

  const currentStint =
    profile.stints.find((s) => s.is_current) ?? profile.stints[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/atletas"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Atletas
      </Link>
      <AthleteProfileHeader
        athlete={profile.athlete}
        currentStint={currentStint}
      />
      <AthleteCareerStatsBlock stats={profile.careerStats} />
      <AthleteStintsTimeline stints={profile.stints} />
      <RecentMatchesList matches={profile.recentMatches} />
    </div>
  );
}
