import { notFound } from "next/navigation";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { NewsListClient } from "@/components/news/NewsListClient";
import { getPublishedNews } from "@/lib/data/news";
import { getCompetitionsList } from "@/lib/data/competition";
import { getOrgSlug, getOrganization } from "@/lib/org";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: `Notícias${org ? ` · ${org.name}` : ""}`,
  };
}

export default async function NoticiasPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const [articles, competitions] = await Promise.all([
    getPublishedNews(org.id),
    getCompetitionsList(org.id),
  ]);

  const competitionFilters = competitions.map((c) => ({
    id: c.id,
    full_name: c.full_name,
    short_name: c.short_name,
  }));

  return (
    <div className="site-list-page">
      <SiteListHero
        eyebrow="Cobertura"
        title="Notícias"
        description={`Últimas novidades, resultados e bastidores da ${org.name}.`}
      />
      <NewsListClient
        articles={articles}
        competitions={competitionFilters}
      />
    </div>
  );
}
