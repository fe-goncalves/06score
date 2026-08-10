import { BidPageClient } from "@/components/bid/BidPageClient";
import { getBidEditions, getBidTeamSummaries } from "@/lib/data/bid";
import { metaTitle } from "@/lib/metaTitle";
import { getOrgSlug, getOrganization } from "@/lib/org";

export async function generateMetadata() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: metaTitle(org ? `${org.name} — BID` : "BID"),
    description:
      "Boletim de Informação Desportiva — consulta pública de inscrições por competição.",
  };
}

interface BidPageProps {
  searchParams: Promise<{ edicao?: string; competicao?: string }>;
}

export default async function BidPage({ searchParams }: BidPageProps) {
  const { edicao, competicao } = await searchParams;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return null;

  const editions = await getBidEditions(org.id);

  const selectedEditionId =
    edicao && editions.some((edition) => edition.id === edicao) ? edicao : null;

  const selectedCompetitionId = selectedEditionId
    ? (editions.find((edition) => edition.id === selectedEditionId)
        ?.competitionId ?? null)
    : competicao &&
        editions.some((edition) => edition.competitionId === competicao)
      ? competicao
      : null;

  const teams = selectedEditionId
    ? await getBidTeamSummaries(selectedEditionId)
    : [];

  return (
    <div className="site-list-page bid-page">
      <BidPageClient
        editions={editions}
        teams={teams}
        selectedCompetitionId={selectedCompetitionId}
        selectedEditionId={selectedEditionId}
      />
    </div>
  );
}
