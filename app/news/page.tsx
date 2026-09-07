import { notFound } from "next/navigation";
import { NewsListClient } from "@/components/news/NewsListClient";
import { getPublishedNews } from "@/lib/data/news";
import { getCompetitionsList } from "@/lib/data/competition";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: metaTitle(org ? `${org.name} — NOTÍCIAS` : "NOTÍCIAS"),
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
    <NewsListClient
      articles={articles}
      competitions={competitionFilters}
    />
  );
}
