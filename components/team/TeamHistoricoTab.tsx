"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TeamHistoricoStatsTable } from "@/components/team/TeamHistoricoStatsTable";
import { OrgLogo } from "@/components/ui/OrgLogo";
import {
  formatEditionTablePosition,
  teamEditionEnrollmentPrimary,
  teamEditionEnrollmentSecondary,
} from "@/lib/team/editionLabels";
import type { TeamEditionStatRow, TeamProfileData } from "@/lib/types";

interface TeamHistoricoTabProps {
  profile: TeamProfileData;
}

function sortParticipations(rows: TeamEditionStatRow[]): TeamEditionStatRow[] {
  return [...rows].sort((a, b) => {
    const ay = a.competition_editions?.seasons?.years?.value ?? 0;
    const by = b.competition_editions?.seasons?.years?.value ?? 0;
    if (ay !== by) return Number(by) - Number(ay);
    return teamEditionEnrollmentPrimary(a).localeCompare(
      teamEditionEnrollmentPrimary(b),
      "pt-BR",
    );
  });
}

export function TeamHistoricoTab({ profile }: TeamHistoricoTabProps) {
  const participations = useMemo(
    () => sortParticipations(profile.editionStats),
    [profile.editionStats],
  );

  return (
    <div className="athlete-historico-tab space-y-4">
      <TeamHistoricoStatsTable
        editionStats={profile.editionStats}
        careerSummary={profile.careerSummary}
        team={profile.team}
        statsPhases={profile.statsPhases}
      />

      <section className="athlete-section athlete-historico-block">
        <h2 className="athlete-section-title">Inscrições em edições</h2>
        {participations.length === 0 ? (
          <p className="athlete-historico-empty">Nenhuma inscrição registrada.</p>
        ) : (
          <ul className="team-enrollment-list">
            {participations.map((row) => {
              const comp = row.competition_editions?.competitions;
              const position = profile.editionPositions[row.edition_id] ?? null;
              const href = `/bid/${row.edition_id}/${profile.team.id}?from=time`;

              return (
                <li key={row.edition_id}>
                  <Link href={href} className="team-enrollment-row">
                    <div className="team-enrollment-logos" aria-hidden>
                      <OrgLogo
                        src={comp?.logo_url}
                        size={22}
                        className="athlete-roster-logo athlete-roster-logo--comp"
                      />
                    </div>
                    <div className="team-enrollment-text">
                      <p className="team-enrollment-primary">
                        {teamEditionEnrollmentPrimary(row)}
                      </p>
                      <p className="team-enrollment-secondary">
                        {teamEditionEnrollmentSecondary(row)}
                      </p>
                    </div>
                    <div className="team-enrollment-position">
                      <span className="team-enrollment-position-label">Pos.</span>
                      <span className="team-enrollment-position-value">
                        {formatEditionTablePosition(position)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
