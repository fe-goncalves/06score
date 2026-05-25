import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { getPublishedNews } from "@/lib/data/news";
import { getSupabase } from "@/lib/supabase";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { NewsListClient } from "@/components/news/NewsListClient";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: `Notícias${org ? ` · ${org.name}` : ""}`,
  };
}

async function getCompetitions(orgId: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("competitions")
    .select("id, full_name, short_name")
    .eq("organization_id", orgId)
    .order("full_name");
  return data ?? [];
}

export default async function NoticiasPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const [articles, competitions] = await Promise.all([
    getPublishedNews(org.id),
    getCompetitions(org.id),
  ]);

  return (
    <main className="page-container py-8 md:py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-xs font-bold uppercase tracking-wider text-white/40 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Voltar
      </Link>
      <SectionTitle>Notícias</SectionTitle>
      <NewsListClient articles={articles} competitions={competitions} />
    </main>
  );
}