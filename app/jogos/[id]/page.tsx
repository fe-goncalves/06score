import { notFound } from "next/navigation";
import { MatchPageClient } from "@/components/match/MatchPageClient";
import { getCachedCompetitionHub } from "@/lib/data/cached";
import { getMatchPageData } from "@/lib/data/match";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: "Partida" };

  const data = await getMatchPageData(id, org.id);
  if (!data) return { title: "Partida" };

  const a = data.match.teams_a?.short_name ?? data.match.teams_a?.full_name;
  const b = data.match.teams_b?.short_name ?? data.match.teams_b?.full_name;
  return { title: `${a} × ${b}` };
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const data = await getMatchPageData(id, org.id);
  if (!data) notFound();

  const competitionId =
    data.match.phases?.competition_editions?.competitions?.id;
  const editionId = data.match.phases?.edition_id;

  const competitionHub = competitionId
    ? await getCachedCompetitionHub(competitionId, org.id, editionId ?? null)
    : null;

  return (
    <div className="page-container match-page-wrap pb-14 pt-0">
      <MatchPageClient data={data} competitionHub={competitionHub} />
    </div>
  );
}
