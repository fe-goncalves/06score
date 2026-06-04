"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { TeamElencoTab } from "@/components/team/TeamElencoTab";
import { TeamMatchesPanel } from "@/components/team/TeamMatchesPanel";
import { formatEditionTablePosition } from "@/lib/team/editionLabels";
import { teamGenderNavLabel } from "@/lib/team/teamLabels";
import type { TeamEditionPageData } from "@/lib/data/teamEdition";

interface TeamEditionPageClientProps {
  data: TeamEditionPageData;
}

export function TeamEditionPageClient({ data }: TeamEditionPageClientProps) {
  const { team, editionLabel, tablePosition, squad, matches } = data;
  const accent = team.primary_color ?? "var(--color-brand)";
  const genderLabel = teamGenderNavLabel(team.gender);
  const shortName = team.short_name?.trim() || team.full_name;

  return (
    <div
      className="athlete-page team-page team-edition-page"
      style={
        {
          "--athlete-accent": accent,
          "--match-accent": accent,
        } as CSSProperties
      }
    >
      <header className="team-edition-header">
        <nav className="match-hub-breadcrumb athlete-hub-breadcrumb" aria-label="Navegação">
          <Link href="/times" className="match-hub-breadcrumb-link">
            TIMES
          </Link>
          {genderLabel ? (
            <>
              <span className="match-hub-breadcrumb-sep" aria-hidden>
                ›
              </span>
              <Link href="/times" className="match-hub-breadcrumb-link">
                {genderLabel}
              </Link>
            </>
          ) : null}
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <Link href={`/times/${team.id}`} className="match-hub-breadcrumb-link">
            {shortName}
          </Link>
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <span className="match-hub-breadcrumb-current">{editionLabel}</span>
        </nav>

        <h1 className="team-edition-title">{editionLabel}</h1>
        <p className="team-edition-meta">
          {shortName} · Posição na edição:{" "}
          <strong>{formatEditionTablePosition(tablePosition)}</strong>
        </p>
      </header>

      <div className="athlete-page-panel">
        <div className="athlete-page-main space-y-4">
          <section className="athlete-section">
            <h2 className="athlete-section-title">Elenco da edição</h2>
            <TeamElencoTab squad={squad} />
          </section>

          <section className="athlete-section">
            <h2 className="athlete-section-title">Partidas na edição</h2>
            <TeamMatchesPanel matches={matches} />
          </section>
        </div>
      </div>
    </div>
  );
}
