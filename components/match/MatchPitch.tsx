"use client";

import Link from "next/link";
import { TotwPitchLines } from "@/components/home/TotwPitchLines";
import { OrgImage } from "@/components/ui/OrgImage";
import type { PitchPlayer } from "@/lib/match/lineupPitch";
import { formatRating } from "@/lib/utils";

interface MatchPitchProps {
  players: PitchPlayer[];
  formationLabel: string;
  teamName: string;
  logoUrl: string | null | undefined;
  mirrored?: boolean;
}

export function MatchPitch({
  players,
  formationLabel,
  teamName,
  logoUrl,
  mirrored = false,
}: MatchPitchProps) {
  return (
    <section
      className={`match-pitch ${mirrored ? "match-pitch--mirrored" : ""}`}
    >
      <header className="match-pitch-header">
        <OrgImage
          src={logoUrl}
          alt={teamName}
          width={28}
          height={28}
          className="match-pitch-team-logo"
        />
        <div className="min-w-0">
          <h3 className="match-pitch-team-name">{teamName}</h3>
          <p className="match-pitch-formation">{formationLabel}</p>
        </div>
      </header>

      <div className="match-pitch-field">
        <TotwPitchLines />
        <div className="match-pitch-inner">
          {players.map((player) => (
            <Link
              key={player.athleteId}
              href={`/atletas/${player.athleteId}`}
              className="match-pitch-player"
              style={{
                left: `${player.x * 100}%`,
                top: `${player.y * 100}%`,
              }}
            >
              <div className="match-pitch-player-avatar">
                {player.photoUrl ? (
                  <OrgImage
                    src={player.photoUrl}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="match-pitch-player-initial">
                    {player.name.charAt(0)}
                  </span>
                )}
                {player.isCaptain && (
                  <span className="match-pitch-captain" title="Capitão">
                    C
                  </span>
                )}
              </div>
              <span className="match-pitch-player-name">{player.name}</span>
              <span className="match-pitch-player-rating tabular-nums">
                {formatRating(player.rating)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
