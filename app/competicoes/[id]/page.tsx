import Link from "next/link";
import { notFound } from "next/navigation";
import { CompetitionHubClient } from "@/components/competition/CompetitionHubClient";
import { getCompetitionHub } from "@/lib/data/competition";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: "Competição" };

  const hub = await getCompetitionHub(id, org.id);
  return { title: hub?.competition.full_name ?? "Competição" };
}

export default async function CompetitionHubPage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const hub = await getCompetitionHub(id, org.id);
  if (!hub) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/competicoes"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Competições
      </Link>
      <CompetitionHubClient hub={hub} />
    </div>
  );
}
