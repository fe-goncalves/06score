import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchPageClient } from "@/components/match/MatchPageClient";
import { getMatchDetail } from "@/lib/data/match";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: "Partida" };

  const data = await getMatchDetail(id, org.id);
  if (!data) return { title: "Partida" };

  const a = data.match.teams_a?.short_name ?? data.match.teams_a?.full_name;
  const b = data.match.teams_b?.short_name ?? data.match.teams_b?.full_name;
  return { title: `${a} × ${b}` };
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const data = await getMatchDetail(id, org.id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <MatchPageClient data={data} />
    </div>
  );
}
