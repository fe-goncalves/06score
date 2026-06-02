import { SiteListHero } from "@/components/layout/SiteListHero";
import { TeamsListClient } from "@/components/team/TeamsListClient";
import { getOrgTeams } from "@/lib/data/home";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return { title: org ? `${org.name} — Equipes` : "Equipes" };
}

export default async function TeamsListPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const teams = await getOrgTeams(org.id);

  return (
    <div className="site-list-page">
      <SiteListHero
        eyebrow="Elenco"
        title="Equipes"
        description={`Conheça todos os times da ${org.name} — elencos, estatísticas e histórico de partidas.`}
      />
      <TeamsListClient teams={teams} />
    </div>
  );
}
