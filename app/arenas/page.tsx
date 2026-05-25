import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: org ? `${org.name} — Arenas` : "Arenas" };
}

export default async function ArenasPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  return (
    <main className="page-container py-8 md:py-12">
      <Link
        href="/"
        className="mb-8 inline-block font-mono-label text-[10px] font-bold uppercase tracking-wider text-white/40 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Arenas</SectionTitle>
      <p className="font-body mt-4 max-w-lg text-sm text-white/50">
        Em breve: mapa e informações das arenas da {org.name}.
      </p>
    </main>
  );
}
