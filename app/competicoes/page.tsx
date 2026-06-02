import { CompetitionsListClient } from "@/components/competition/CompetitionsListClient";
import { SiteListHero } from "@/components/layout/SiteListHero";
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
    <div className="site-list-page competitions-page">
      <SiteListHero
        eyebrow="Campeonatos"
        title="Competições"
        description={`Acompanhe classificação, jogos, chaveamento e estatísticas de cada campeonato da ${org.name}.`}
      />
      <CompetitionsListClient competitions={competitions} />
    </div>
  );
}
