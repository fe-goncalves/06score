"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { HomeTotwMember } from "@/lib/types";

interface TotwPlayerCardProps {
  player: HomeTotwMember;
  isMotw?: boolean;
  variant?: "pitch" | "mobile";
  href?: string;
  compact?: boolean;
}

export function TotwPlayerCard({
  player,
  isMotw = false,
  variant = "mobile",
  href,
  compact = false,
}: TotwPlayerCardProps) {
  const linkHref =
    href ?? (player.athlete_id ? `/atletas/${player.athlete_id}` : undefined);
  const isPitch = variant === "pitch";
  const avatarSize = isPitch ? (compact ? 34 : 40) : 56;
  const badgeSize = isPitch ? (compact ? 14 : 16) : 20;

  const inner = (
    <>
      <div
        className={`totw-player-avatar-wrap ${isMotw ? "totw-player-avatar-wrap--motw" : ""}`}
        style={{ width: avatarSize, height: avatarSize }}
      >
        {player.photo_url ? (
          <OrgImage
            src={player.photo_url}
            alt={player.name}
            width={avatarSize}
            height={avatarSize}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-white/75">
            {player.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        {player.team_logo_url && (
          <span
            className="totw-player-team-badge"
            style={
              isPitch
                ? ({ width: badgeSize, height: badgeSize } as CSSProperties)
                : undefined
            }
          >
            <OrgImage
              src={player.team_logo_url}
              alt={player.team_abbreviation ?? "Time"}
              width={badgeSize}
              height={badgeSize}
              className="h-full w-full object-contain"
            />
          </span>
        )}
        {isMotw && !player.is_staff && (
          <span className="totw-player-motw-badge" aria-hidden>
            ★
          </span>
        )}
      </div>

      {!isPitch && (
        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-mono text-sm font-bold ${isMotw ? "text-[var(--color-brand)]" : "text-white"}`}
          >
            {player.name}
          </p>
          {player.team_abbreviation && (
            <p className="truncate font-mono text-[11px] text-white/45">
              {player.team_abbreviation}
            </p>
          )}
        </div>
      )}

      {!isPitch && player.team_logo_url && (
        <OrgImage
          src={player.team_logo_url}
          alt={player.team_abbreviation ?? "Time"}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 object-contain opacity-90"
        />
      )}

      {isPitch && (
        <p
          className={`totw-player-pitch-name ${isMotw ? "totw-player-pitch-name--motw" : ""}`}
        >
          {player.name}
        </p>
      )}
    </>
  );

  const className = `totw-player-card totw-player-card--${variant} ${linkHref ? "" : "totw-player-card--static"} ${isMotw && !isPitch ? "totw-player-card--motw" : ""}`;

  if (linkHref) {
    return (
      <Link
        href={linkHref}
        className={className}
        aria-label={`Ver perfil de ${player.name}`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
