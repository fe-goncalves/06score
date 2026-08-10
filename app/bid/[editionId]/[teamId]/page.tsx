import { notFound } from "next/navigation";
import { BidTeamDetailView } from "@/components/bid/BidTeamDetailView";
import { getBidTeamDetail } from "@/lib/data/bid";
import { metaIcons } from "@/lib/metaIcons";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

interface BidTeamPageProps {
  params: Promise<{ editionId: string; teamId: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: BidTeamPageProps) {
  const { editionId, teamId } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return { title: metaTitle("BID") };

  const detail = await getBidTeamDetail(editionId, teamId, org.id);
  if (!detail) {
    return { title: metaTitle("BID"), icons: metaIcons(null, org.logo_url) };
  }

  return {
    title: metaTitle(`${detail.team.full_name} — BID`),
    description: `Inscrição de ${detail.team.full_name} no boletim desportivo.`,
    icons: metaIcons(detail.team.logo_url, org.logo_url),
  };
}

export default async function BidTeamPage({
  params,
  searchParams,
}: BidTeamPageProps) {
  const { editionId, teamId } = await params;
  const { from } = await searchParams;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const detail = await getBidTeamDetail(editionId, teamId, org.id);
  if (!detail) notFound();

  const fromTeam = from === "time";

  return (
    <div className="site-list-page bid-page">
      <BidTeamDetailView
        detail={detail}
        backHref={fromTeam ? `/times/${teamId}` : undefined}
        backLabel={fromTeam ? "Voltar ao time" : undefined}
      />
    </div>
  );
}
