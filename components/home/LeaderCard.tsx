import { OrgImage } from "@/components/ui/OrgImage";
import type { AthleteStatLeader } from "@/lib/types";
import { athleteDisplayName } from "@/lib/utils";

interface LeaderCardProps {
  label: string;
  stat: number;
  leader: AthleteStatLeader | null;
}

export function LeaderCard({ label, stat, leader }: LeaderCardProps) {
  if (!leader?.athletes) {
    return (
      <div className="relative flex min-h-[280px] items-end overflow-hidden rounded-xl border border-white/[0.06] bg-[#141414] p-6">
        <p className="text-sm text-white/40">Sem dados de {label.toLowerCase()}.</p>
      </div>
    );
  }

  const athlete = leader.athletes;
  const name = athleteDisplayName(athlete.full_name, athlete.surname);
  const photoUrl = athlete.photo_url;

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-white/[0.06] transition-[border-color] duration-250 hover:border-[var(--color-brand)]">
      {photoUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${photoUrl})` }}
          role="img"
          aria-label={name}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6">
        <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand)]">
          {label}
        </span>
        <p className="text-5xl font-bold tabular-nums leading-none text-white">
          {stat}
        </p>
        <p className="mt-2 text-lg font-bold text-white">{name}</p>

        {leader.teams?.logo_url && (
          <div className="mt-4 flex items-center gap-2">
            <OrgImage
              src={leader.teams.logo_url}
              alt={leader.teams.full_name}
              width={28}
              height={28}
              className="h-7 w-7 rounded object-contain"
            />
            <span className="text-xs text-white/60">
              {leader.teams.full_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
