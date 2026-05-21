import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RankingClient } from "@/components/ranking/RankingClient";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: `Ranking${org ? ` · ${org.name}` : ""}`,
  };
}

export default async function RankingPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-xs font-bold uppercase tracking-wider text-white/40 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Ranking</SectionTitle>
      <RankingClient orgId={org.id} />
    </main>
  );
}