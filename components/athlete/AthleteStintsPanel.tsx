import Link from "next/link";
import { AthleteSection } from "@/components/athlete/AthleteSection";
import { OrgImage } from "@/components/ui/OrgImage";
import type { AthleteTeamStint } from "@/lib/types";
import { formatStintDate } from "@/lib/utils";

interface AthleteStintsPanelProps {
  stints: AthleteTeamStint[];
}

function teamLabel(stint: AthleteTeamStint): string {
  const t = stint.teams;
  if (!t) return "—";
  return t.abbreviation ?? t.short_name ?? t.full_name;
}

export function AthleteStintsPanel({ stints }: AthleteStintsPanelProps) {
  return (
    <AthleteSection title="Histórico de equipes" titleId="athlete-stints-title">
      {!stints.length ? (
        <p className="athlete-empty-state">Sem histórico de equipes.</p>
      ) : (
        <ul className="athlete-stints-list">
          {stints.map((stint, index) => {
            const teamId = stint.teams?.id ?? stint.team_id;
            const period = stint.is_current
              ? `${formatStintDate(stint.started_at)} — Atual`
              : `${formatStintDate(stint.started_at)} — ${formatStintDate(stint.ended_at)}`;

            return (
              <li
                key={stint.id}
                className="athlete-stint-item"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <Link
                  href={teamId ? `/times/${teamId}` : "#"}
                  className={`athlete-stint-row${stint.is_current ? " athlete-stint-row--current" : ""}`}
                >
                  <OrgImage
                    src={stint.teams?.logo_url}
                    alt=""
                    width={44}
                    height={44}
                    className="athlete-stint-logo"
                  />
                  <div className="athlete-stint-body">
                    <span className="athlete-stint-team">{teamLabel(stint)}</span>
                    <span className="athlete-stint-period">{period}</span>
                  </div>
                  {stint.is_current && (
                    <span className="athlete-stint-badge">Atual</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AthleteSection>
  );
}
