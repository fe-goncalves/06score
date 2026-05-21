import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Competition } from "@/lib/types";

interface CompetitionCardProps {
  competition: Competition;
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const edition = competition.competition_editions?.[0];
  const seasons = edition?.seasons;
  const seasonName = Array.isArray(seasons)
    ? (seasons[0]?.name ?? "Temporada atual")
    : (seasons?.name ?? "Temporada atual");

  return (
    <Link href={`/competicoes/${competition.id}`}>
      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <OrgImage
          src={competition.logo_url}
          alt={competition.full_name}
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded object-contain"
        />
        <div>
          <h3 className="font-bold leading-tight">{competition.full_name}</h3>
          <p className="mt-1 text-sm text-white/50">{seasonName}</p>
        </div>
      </Card>
    </Link>
  );
}
