"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import type { LabTotsPitchSlot } from "@/components/competition/LabTotsPitch";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  isLabFormationKey,
  LAB_TOTS_FORMATIONS,
} from "@/lib/tots/labPitch";
import type { HomeTotwMember } from "@/lib/types";

interface TotsMobileCarouselProps {
  formation: string;
  slots: (LabTotsPitchSlot | null)[];
  staff?: HomeTotwMember[];
}

function TotsPlayerCard({
  positionLabel,
  player,
}: {
  positionLabel: string;
  player: LabTotsPitchSlot;
}) {
  const accent = player.teamColor ?? "var(--color-brand)";

  return (
    <article
      className="tots-mobile-card"
      style={{ "--tots-card-accent": accent } as CSSProperties}
    >
      <span className="tots-mobile-card-pos">{positionLabel}</span>
      <div className="tots-mobile-card-avatar-wrap">
        <div
          className="tots-mobile-card-avatar-glow"
          aria-hidden
          style={{
            background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
          }}
        />
        <div className="tots-mobile-card-avatar">
          {player.photo ? (
            <OrgImage
              src={player.photo}
              alt={player.name}
              width={72}
              height={72}
              className="tots-mobile-card-avatar-img"
            />
          ) : (
            <span className="tots-mobile-card-avatar-fallback">
              {player.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {player.teamLogo && (
          <span className="tots-mobile-card-team-badge">
            <Image
              src={player.teamLogo}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain"
            />
          </span>
        )}
      </div>
      <p className="tots-mobile-card-name">{player.name}</p>
      {player.teamName && (
        <p className="tots-mobile-card-team">{player.teamName}</p>
      )}
    </article>
  );
}

function TotsStaffCard({ member }: { member: HomeTotwMember }) {
  return (
    <article className="tots-mobile-card tots-mobile-card--staff">
      <span className="tots-mobile-card-pos">Técnico</span>
      <div className="tots-mobile-card-avatar-wrap">
        <div className="tots-mobile-card-avatar">
          {member.photo_url ? (
            <OrgImage
              src={member.photo_url}
              alt={member.name}
              width={72}
              height={72}
              className="tots-mobile-card-avatar-img"
            />
          ) : (
            <span className="tots-mobile-card-avatar-fallback">
              {member.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {member.team_logo_url && (
          <span className="tots-mobile-card-team-badge">
            <Image
              src={member.team_logo_url}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain"
            />
          </span>
        )}
      </div>
      <p className="tots-mobile-card-name">{member.name}</p>
      <p className="tots-mobile-card-team">
        {[member.role, member.team_abbreviation].filter(Boolean).join(" · ")}
      </p>
    </article>
  );
}

export function TotsMobileCarousel({
  formation,
  slots,
  staff = [],
}: TotsMobileCarouselProps) {
  const formationKey = isLabFormationKey(formation) ? formation : "2-3-1";
  const formationSlots = LAB_TOTS_FORMATIONS[formationKey].slots;

  const playerItems = formationSlots
    .map((slot, i) => {
      const player = slots[i];
      if (!player) return null;
      return { key: `slot-${i}`, positionLabel: slot.label, player };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (playerItems.length === 0 && staff.length === 0) {
    return null;
  }

  return (
    <div
      className="tots-mobile-carousel"
      aria-label="Seleção da temporada em cards"
    >
      <ul className="tots-mobile-carousel-track">
        {playerItems.map(({ key, positionLabel, player }) => (
          <li key={key} className="tots-mobile-carousel-item">
            <TotsPlayerCard positionLabel={positionLabel} player={player} />
          </li>
        ))}
        {staff.map((member) => (
          <li
            key={member.staff_member_id ?? member.name}
            className="tots-mobile-carousel-item"
          >
            <TotsStaffCard member={member} />
          </li>
        ))}
      </ul>
    </div>
  );
}
