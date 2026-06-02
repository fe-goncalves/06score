"use client";

import Link from "next/link";
import { TotwPlayerCard } from "@/components/home/TotwPlayerCard";
import { OrgImage } from "@/components/ui/OrgImage";
import type { HomeTotw } from "@/lib/types";

function memberIsMotw(
  athleteId: string | null | undefined,
  motwAthleteId: string | null,
): boolean {
  return !!athleteId && athleteId === motwAthleteId;
}

interface TotwMobileGridProps {
  totw: HomeTotw;
}

export function TotwMobileGrid({ totw }: TotwMobileGridProps) {
  const motwAthleteId = totw.motw_athlete_id;
  const players = totw.slots.filter(
    (slot): slot is NonNullable<typeof slot> => slot !== null,
  );

  return (
    <div className="totw-mobile">
      <ul className="totw-mobile-grid">
        {players.map((player, index) => (
          <li key={player.athlete_id ?? player.staff_member_id ?? index}>
            <TotwPlayerCard
              player={player}
              isMotw={memberIsMotw(player.athlete_id, motwAthleteId)}
              variant="mobile"
            />
          </li>
        ))}
      </ul>

      {totw.coach && (
        <div className="totw-mobile-coach">
          <span className="font-mono text-[10px] font-bold tracking-wide text-white/40 uppercase">
            Técnico
          </span>
          <div className="mt-2 flex items-center gap-3">
            {totw.coach.photo_url ? (
              <OrgImage
                src={totw.coach.photo_url}
                alt={totw.coach.name}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-white/50">
                {totw.coach.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm font-bold text-white">
                {totw.coach.name}
              </p>
              <p className="truncate font-mono text-[10px] text-white/45">
                {[totw.coach.role, totw.coach.team_abbreviation]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {totw.coach.team_logo_url && (
              <OrgImage
                src={totw.coach.team_logo_url}
                alt={totw.coach.team_abbreviation ?? "Time"}
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 object-contain"
              />
            )}
          </div>
        </div>
      )}

      {motwAthleteId && (
        <Link
          href={`/atletas/${motwAthleteId}`}
          className="totw-mobile-motw"
        >
          <span className="text-[var(--color-brand)]">★ MOTW</span>
          <span className="font-bold text-white/90">
            {players.find((p) => p.athlete_id === motwAthleteId)?.name}
          </span>
        </Link>
      )}
    </div>
  );
}
