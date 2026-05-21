import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import type { TeamListItem } from "@/lib/data/team";

interface TeamsGridProps {
  teams: TeamListItem[];
}

export function TeamsGrid({ teams }: TeamsGridProps) {
  if (!teams.length) {
    return <p className="text-sm text-white/40">Nenhum time encontrado.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {teams.map(({ id, team }) => (
        <Link key={id} href={`/times/${id}`}>
          <Card className="flex flex-col items-center gap-4 p-6 text-center">
            <OrgImage
              src={team.logo_url}
              alt={team.full_name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded object-contain"
            />
            <h3 className="font-bold">{team.full_name}</h3>
          </Card>
        </Link>
      ))}
    </div>
  );
}
