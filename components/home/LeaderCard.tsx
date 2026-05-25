import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { AthleteStatLeader } from "@/lib/types";
import { athleteDisplayName } from "@/lib/utils";

interface LeaderCardProps {
  label: string;
  stat: number;
  leader: AthleteStatLeader | null;
  href?: string;
}

export function LeaderCard({ label, stat, leader, href }: LeaderCardProps) {
  if (!leader?.athletes) {
    return (
      <div className="card-surface flex min-h-[120px] min-w-[148px] shrink-0 snap-start flex-col p-3 md:min-w-0">
        <span className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
          {label}
        </span>
        <p className="font-mono-label mt-3 text-[10px] text-white/40">
          Sem dados de {label.toLowerCase()}.
        </p>
      </div>
    );
  }

  const athlete = leader.athletes;
  const name = athleteDisplayName(athlete.full_name, athlete.surname);
  const athleteId = athlete.id;
  const teamName =
    leader.teams?.short_name ?? leader.teams?.full_name ?? null;

  const content = (
    <article className="card-surface flex min-h-[120px] min-w-[148px] shrink-0 snap-start flex-col p-3 md:min-w-0">
      <span className="font-mono-label text-[8px] font-bold uppercase text-[var(--color-brand)]">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-2">
        <OrgImage
          src={athlete.photo_url}
          alt={name}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display line-clamp-2 text-[11px] font-bold uppercase leading-tight text-white">
            {name}
          </p>
          {teamName && (
            <p className="font-mono-label mt-0.5 truncate text-[8px] uppercase text-white/45">
              {teamName}
            </p>
          )}
        </div>
      </div>

      <p className="font-display mt-auto pt-2 text-[32px] font-black tabular-nums leading-none text-white">
        {stat}
      </p>
    </article>
  );

  if (href ?? athleteId) {
    return (
      <Link href={href ?? `/atletas/${athleteId}`} className="block shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
