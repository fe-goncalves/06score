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
      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <OrgImage
          src={competition.logo_url}
          alt={competition.full_name}
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
        />
        <div>
          <h3 className="font-display text-sm font-black uppercase leading-tight">
            {competition.full_name}
          </h3>
          <p className="font-mono-label mt-1 text-[10px] uppercase text-white/45">
            {seasonName}
          </p>
        </div>
      </Card>
    </Link>
  );
}
