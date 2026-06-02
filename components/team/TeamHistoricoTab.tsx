"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { OrgLogo } from "@/components/ui/OrgLogo";
import type { TeamEditionStatRow, TeamProfileData } from "@/lib/types";
import { athleteDisplayName, getPositionName } from "@/lib/utils";

interface TeamHistoricoTabProps {
  profile: TeamProfileData;
}

function participationLabel(row: TeamEditionStatRow): string {
  const comp = row.competition_editions?.competitions;
  return (
    comp?.short_name?.trim() || comp?.full_name?.trim() || "Competição"
  );
}

function participationMeta(row: TeamEditionStatRow): string {
  const season = row.competition_editions?.seasons?.name ?? "Temporada";
  const pts = row.points;
  const record = `${row.wins}V · ${row.draws}E · ${row.losses}D`;
  return `${season} · ${record} · ${pts} pts`;
}

export function TeamHistoricoTab({ profile }: TeamHistoricoTabProps) {
  const participations = useMemo(
    () =>
      [...profile.editionStats].sort((a, b) => {
        const ay = a.competition_editions?.seasons?.years?.value ?? 0;
        const by = b.competition_editions?.seasons?.years?.value ?? 0;
        if (ay !== by) return Number(by) - Number(ay);
        return participationLabel(a).localeCompare(participationLabel(b), "pt-BR");
      }),
    [profile.editionStats],
  );

  return (
    <div className="athlete-historico-tab space-y-4">
      <section className="athlete-section athlete-historico-block">
        <h2 className="athlete-section-title">Temporadas e competições</h2>
        {participations.length === 0 ? (
          <p className="athlete-historico-empty">Nenhuma participação registrada.</p>
        ) : (
          <ul className="athlete-roster-list">
            {participations.map((row) => {
              const comp = row.competition_editions?.competitions;
              return (
                <li key={`${row.edition_id}`} className="athlete-roster-row">
                  <div className="athlete-roster-logos" aria-hidden>
                    <OrgLogo
                      src={profile.team.logo_url}
                      size={20}
                      className="athlete-roster-logo"
                    />
                    <OrgLogo
                      src={comp?.logo_url}
                      size={20}
                      className="athlete-roster-logo athlete-roster-logo--comp"
                    />
                  </div>
                  <div className="athlete-roster-text">
                    <p className="athlete-roster-primary">{participationLabel(row)}</p>
                    <p className="athlete-roster-secondary">{participationMeta(row)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="athlete-section athlete-historico-block">
        <h2 className="athlete-section-title">Elenco atual</h2>
        {!profile.squad.length ? (
          <p className="athlete-historico-empty">Elenco não disponível.</p>
        ) : (
          <ul className="team-squad-list">
            {profile.squad.map((player) => (
              <li key={player.id}>
                <Link href={`/atletas/${player.id}`} className="team-squad-row">
                  <OrgImage
                    src={player.photo_url}
                    alt={player.full_name}
                    width={40}
                    height={40}
                    className="team-squad-photo"
                  />
                  <div className="team-squad-body">
                    <p className="team-squad-name">
                      {athleteDisplayName(player.full_name, player.surname)}
                    </p>
                    <p className="team-squad-meta">
                      {getPositionName(player.player_positions)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
