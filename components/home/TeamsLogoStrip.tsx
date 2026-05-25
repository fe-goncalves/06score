import Link from "next/link";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Team } from "@/lib/types";

interface TeamsLogoStripProps {
  teams: Team[];
}

export function TeamsLogoStrip({ teams }: TeamsLogoStripProps) {
  if (!teams.length) return null;

  return (
    <SectionEnter className="py-6">
      <div className="page-edge-x flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
        {teams.map((team, i) => {
          const href = team.id ? `/times/${team.id}` : "#";
          return (
            <Link
              key={team.id ?? i}
              href={href}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <TeamLogo team={team} index={i} size={40} />
              <span className="font-display max-w-[56px] truncate text-[9px] font-bold uppercase text-white/50">
                {team.abbreviation ?? team.short_name ?? team.full_name}
              </span>
            </Link>
          );
        })}
      </div>
    </SectionEnter>
  );
}
