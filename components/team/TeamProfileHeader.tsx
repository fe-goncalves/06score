import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Team } from "@/lib/types";

interface TeamProfileHeaderProps {
  team: Team & { id: string };
}

export function TeamProfileHeader({ team }: TeamProfileHeaderProps) {
  const accent = team.primary_color ?? "var(--color-brand)";

  return (
    <header
      className="card-surface flex flex-col items-center gap-6 rounded-lg p-8 sm:flex-row"
      style={{ borderColor: `${accent}44` }}
    >
      <TeamLogo team={team} size={120} className="h-28 w-28 sm:h-32 sm:w-32" />
      <div className="text-center sm:text-left">
        <h1
          className="font-display text-2xl font-black uppercase tracking-wide sm:text-3xl"
          style={{ color: accent }}
        >
          {team.full_name}
        </h1>
        {team.abbreviation && (
          <p className="font-mono-label mt-2 text-[10px] uppercase text-white/45">
            {team.abbreviation}
          </p>
        )}
      </div>
    </header>
  );
}
