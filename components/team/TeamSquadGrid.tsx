import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Athlete } from "@/lib/types";
import { athleteDisplayName, getPositionName } from "@/lib/utils";

interface TeamSquadGridProps {
  squad: (Athlete & { id: string })[];
}

export function TeamSquadGrid({ squad }: TeamSquadGridProps) {
  return (
    <section className="py-8">
      <SectionTitle>Elenco atual</SectionTitle>
      {!squad.length ? (
        <p className="mt-4 text-sm text-white/40">Elenco não disponível.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {squad.map((player) => (
            <Link
              key={player.id}
              href={`/atletas/${player.id}`}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] card-surface px-4 py-3 transition-colors hover:border-[var(--color-brand)]/40"
            >
              <OrgImage
                src={player.photo_url}
                alt={player.full_name}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {athleteDisplayName(player.full_name, player.surname)}
                </p>
                <p className="text-xs text-white/50">
                  {getPositionName(player.player_positions)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
