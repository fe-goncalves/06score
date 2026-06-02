"use client";

import Link from "next/link";
import { TotwPitchLines } from "@/components/home/TotwPitchLines";import { TotwPlayerCard } from "@/components/home/TotwPlayerCard";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  isTotwFormationKey,
  pitchInnerBounds,
  slotPosition,
  TOTW_FORMATIONS,
} from "@/lib/totw/formations";
import type { HomeTotw } from "@/lib/types";

function memberIsMotw(
  athleteId: string | null | undefined,
  motwAthleteId: string | null,
): boolean {
  return !!athleteId && athleteId === motwAthleteId;
}

interface TotwPitchDesktopProps {
  totw: HomeTotw;
  compact?: boolean;
}

export function TotwPitchDesktop({ totw, compact = false }: TotwPitchDesktopProps) {
  const formationKey = isTotwFormationKey(totw.formation)
    ? totw.formation
    : "2-3-1";
  const formationSlots = TOTW_FORMATIONS[formationKey].slots;
  const inner = pitchInnerBounds();
  const motwAthleteId = totw.motw_athlete_id;
  const motwPlayer = totw.slots.find(
    (slot) => slot && memberIsMotw(slot.athlete_id, motwAthleteId),
  );

  return (
    <div className={`totw-pitch-desktop ${compact ? "totw-pitch-desktop-compact" : ""}`}>
      <div className="totw-pitch-frame">
        <TotwPitchLines />
        <div
          className="totw-pitch-inner"
          style={{
            left: `${inner.leftPct}%`,
            top: `${inner.topPct}%`,
            width: `${inner.widthPct}%`,
            height: `${inner.heightPct}%`,
          }}
        >
          {formationSlots.map((slot, index) => {
            const player = totw.slots[index];
            if (!player) return null;

            const { x, y } = slotPosition(slot.col, slot.row, slot.total);

            return (
              <div
                key={index}
                className="totw-pitch-slot"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              >
                <TotwPlayerCard
                  player={player}
                  isMotw={memberIsMotw(player.athlete_id, motwAthleteId)}
                  variant="pitch"
                  compact={compact}
                />
              </div>
            );
          })}
        </div>
      </div>

      {(totw.coach || motwPlayer) && (
        <div className="totw-desktop-footer">
          {totw.coach && (
            <div className="totw-desktop-coach">
              {totw.coach.photo_url ? (
                <OrgImage
                  src={totw.coach.photo_url}
                  alt={totw.coach.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-white/50">
                  {totw.coach.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[11px] font-bold text-white">
                  {totw.coach.name}
                </p>
                <p className="truncate font-mono text-[10px] text-white/45">
                  Técnico
                  {totw.coach.team_abbreviation
                    ? ` · ${totw.coach.team_abbreviation}`
                    : ""}
                </p>
              </div>
              {totw.coach.team_logo_url && (
                <OrgImage
                  src={totw.coach.team_logo_url}
                  alt={totw.coach.team_abbreviation ?? "Time"}
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 object-contain"
                />
              )}
            </div>
          )}
          {motwPlayer && motwAthleteId && (
            <Link href={`/atletas/${motwAthleteId}`} className="totw-desktop-motw">
              <span className="text-[var(--color-brand)]">★ MOTW</span>
              <span className="font-bold text-white/85">{motwPlayer.name}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
