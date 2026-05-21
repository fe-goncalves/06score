import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { getHallData, getHallFilterOptions, DEFAULT_FILTERS } from "@/lib/data/hall";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { HallClient } from "@/components/hall/HallClient";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: `Hall da Fama${org ? ` · ${org.name}` : ""}`,
  };
}

export default async function HallDaFamaPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const [options, initialData] = await Promise.all([
    getHallFilterOptions(org.id),
    getHallData(org.id, DEFAULT_FILTERS),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-xs font-bold uppercase tracking-wider text-white/40 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Hall da Fama</SectionTitle>
      <HallClient
        initialData={initialData}
        options={options}
        orgId={org.id}
      />
    </main>
  );
}