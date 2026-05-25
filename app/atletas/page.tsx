import Link from "next/link";
import { AthletesGrid } from "@/components/athlete/AthletesGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getAthletesList } from "@/lib/data/athlete";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: org ? `${org.name} — Atletas` : "Atletas" };
}

export default async function AthletesListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const athletes = await getAthletesList(org.id);

  return (
    <div className="page-container py-8 md:py-10">
      <Link
        href="/"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Atletas</SectionTitle>
      <div className="mt-8">
        <AthletesGrid athletes={athletes} />
      </div>
    </div>
  );
}
