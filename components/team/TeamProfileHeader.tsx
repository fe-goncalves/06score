import { OrgImage } from "@/components/ui/OrgImage";
import type { Team } from "@/lib/types";

interface TeamProfileHeaderProps {
  team: Team & { id: string };
}

export function TeamProfileHeader({ team }: TeamProfileHeaderProps) {
  const accent = team.primary_color ?? "var(--color-brand)";

  return (
    <header
      className="flex flex-col items-center gap-6 rounded-xl border border-white/[0.06] bg-[#141414] p-8 sm:flex-row"
      style={{ borderColor: `${accent}44` }}
    >
      <OrgImage
        src={team.logo_url}
        alt={team.full_name}
        width={120}
        height={120}
        className="h-28 w-28 shrink-0 rounded object-contain sm:h-32 sm:w-32"
      />
      <div className="text-center sm:text-left">
        <h1
          className="text-2xl font-bold uppercase tracking-wide sm:text-3xl"
          style={{ color: accent }}
        >
          {team.full_name}
        </h1>
        {team.abbreviation && (
          <p className="mt-2 text-sm text-white/50">{team.abbreviation}</p>
        )}
      </div>
    </header>
  );
}
