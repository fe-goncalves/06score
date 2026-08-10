import { notFound } from "next/navigation";
import { MatchPageClient } from "@/components/match/MatchPageClient";
import { getMatchPageData } from "@/lib/data/match";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: metaTitle("Partida") };

  const data = await getMatchPageData(id, org.id);
  if (!data) return { title: metaTitle("Partida"), icons: metaIcons(null, org.logo_url) };

  const a =
    data.match.teams_a?.short_name ?? data.match.teams_a?.full_name ?? "";
  const b =
    data.match.teams_b?.short_name ?? data.match.teams_b?.full_name ?? "";
  const competitionLogo =
    data.match.phases?.competition_editions?.competitions?.logo_url ?? null;

  return {
    title: metaTitle(`${a} × ${b}`),
    icons: metaIcons(competitionLogo, org.logo_url),
  };
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const data = await getMatchPageData(id, org.id);
  if (!data) notFound();

  return (
    <div className="page-container match-page-wrap pb-14 pt-0">
      <MatchPageClient data={data} />
    </div>
  );
}
