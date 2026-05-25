import { OrgImage } from "@/components/ui/OrgImage";
import type { Athlete, AthleteTeamStint } from "@/lib/types";
import { athleteDisplayName, getPositionName } from "@/lib/utils";

interface AthleteProfileHeaderProps {
  athlete: Athlete & { id: string; nationality: string | null };
  currentStint: AthleteTeamStint | null;
}

export function AthleteProfileHeader({
  athlete,
  currentStint,
}: AthleteProfileHeaderProps) {
  const team = currentStint?.teams;

  return (
    <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <OrgImage
        src={athlete.photo_url}
        alt={athlete.full_name}
        width={120}
        height={120}
        className="h-28 w-28 shrink-0 rounded-full object-cover sm:h-32 sm:w-32"
      />
      <div className="text-center sm:text-left">
        <h1 className="font-display text-2xl font-black uppercase tracking-wide sm:text-3xl">
          {athleteDisplayName(athlete.full_name, athlete.surname)}
        </h1>
        <p className="font-mono-label mt-2 text-[10px] font-bold uppercase text-[var(--color-brand)]">
          {getPositionName(athlete.player_positions)}
        </p>
        {team && (
          <p className="font-body mt-1 text-sm text-white/60">{team.full_name}</p>
        )}
        {athlete.nationality && (
          <p className="font-mono-label mt-1 text-[10px] uppercase text-white/40">
            {athlete.nationality}
          </p>
        )}
      </div>
    </header>
  );
}
