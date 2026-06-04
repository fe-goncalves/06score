"use client";

import Link from "next/link";
import { useMemo } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { teamAwardLabel } from "@/lib/team/awardTypes";
import type { AthleteAwardEntry } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

interface TeamPremiosSectionProps {
  awards: AthleteAwardEntry[];
}

export function TeamPremiosSection({ awards }: TeamPremiosSectionProps) {
  const sorted = useMemo(
    () =>
      [...awards].sort((a, b) => {
        const aSeason = a.competition_editions?.seasons?.name ?? "";
        const bSeason = b.competition_editions?.seasons?.name ?? "";
        return bSeason.localeCompare(aSeason, "pt-BR");
      }),
    [awards],
  );

  if (!sorted.length) {
    return (
      <p className="athlete-awards-empty">Nenhuma premiação individual registrada.</p>
    );
  }

  return (
    <div className="athlete-awards-list">
      {sorted.map((award) => {
        const athlete = award.athletes;
        const competition = award.competition_editions?.competitions;
        const competitionName =
          competition?.short_name?.trim() ||
          competition?.full_name?.trim() ||
          "Competição";
        const seasonName = award.competition_editions?.seasons?.name ?? "Temporada";
        const athleteName = athlete
          ? athleteSurnameLabel(athlete.full_name, athlete.surname)
          : "Atleta";

        const content = (
          <>
            <OrgImage
              src={athlete?.photo_url}
              alt=""
              width={40}
              height={40}
              className="team-premio-photo"
            />
            <div className="athlete-award-body">
              <p className="athlete-award-name">{athleteName}</p>
              <p className="athlete-award-meta">
                {teamAwardLabel(award.award_type)} · {competitionName} · {seasonName}
              </p>
            </div>
            <OrgImage
              src={competition?.logo_url}
              alt=""
              width={22}
              height={22}
              className="athlete-award-logo athlete-award-logo--comp"
            />
          </>
        );

        return athlete?.id ? (
          <Link
            key={award.id}
            href={`/atletas/${athlete.id}`}
            className="athlete-award-row team-premio-row"
          >
            {content}
          </Link>
        ) : (
          <article key={award.id} className="athlete-award-row team-premio-row">
            {content}
          </article>
        );
      })}
    </div>
  );
}
