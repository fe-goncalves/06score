import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import type { EditionTeam } from "@/lib/types";

interface TeamsGridProps {
  editionTeams: EditionTeam[];
}

export function TeamsGrid({ editionTeams }: TeamsGridProps) {
  if (!editionTeams.length) {
    return <p className="text-sm text-white/40">Nenhuma equipe inscrita.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {editionTeams.map((et) => {
        const team = et.teams;
        if (!team) return null;
        const teamId = et.team_id;
        return (
          <Link key={et.id} href={`/times/${teamId}`}>
            <Card className="flex flex-col items-center gap-3 p-6 text-center">
              <OrgImage
                src={team.logo_url}
                alt={team.full_name}
                width={64}
                height={64}
                className="h-16 w-16 rounded object-contain"
              />
              <h3 className="font-bold">{team.full_name}</h3>
              <p className="text-sm text-white/50">
                {et.athlete_count ?? 0} atletas
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
