import Link from "next/link";
import { CompetitionsGrid } from "@/components/home/CompetitionsGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getCompetitionsList } from "@/lib/data/competition";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: org ? `${org.name} — Competições` : "Competições" };
}

export default async function CompetitionsListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const competitions = await getCompetitionsList(org.id);

  return (
    <div className="page-container py-8 md:py-10">
      <Link
        href="/"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Competições</SectionTitle>
      <div className="mt-8">
        <CompetitionsGrid competitions={competitions} />
      </div>
    </div>
  );
}
