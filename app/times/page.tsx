import Link from "next/link";
import { TeamsGrid } from "@/components/team/TeamsGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getTeamsList } from "@/lib/data/team";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: org ? `${org.name} — Times` : "Times" };
}

export default async function TeamsListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const teams = await getTeamsList(org.id);

  return (
    <div className="page-container py-8 md:py-10">
      <Link
        href="/"
        className="mb-8 inline-block text-[11px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Times</SectionTitle>
      <div className="mt-8">
        <TeamsGrid teams={teams} />
      </div>
    </div>
  );
}
