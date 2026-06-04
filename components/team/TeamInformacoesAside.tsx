"use client";

import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { teamGenderLabel } from "@/lib/team/awardTypes";
import type { Team, TeamCareerSummary, TeamProfileData } from "@/lib/types";

interface TeamInformacoesAsideProps {
  team: Team & { id: string };
  careerSummary: TeamCareerSummary;
  venue: TeamProfileData["venue"];
  foundedYear: number | null;
  staff: TeamProfileData["staff"];
  className?: string;
}

function formatRecord(summary: TeamCareerSummary): string {
  return `${summary.wins}-${summary.draws}-${summary.losses}`;
}

function formatTitles(count: number): string {
  return count > 0 ? String(count) : "—";
}

export function TeamInformacoesAside({
  team,
  careerSummary,
  venue,
  foundedYear,
  staff,
  className = "",
}: TeamInformacoesAsideProps) {
  return (
    <aside
      className={`team-info-aside athlete-historico-block ${className}`.trim()}
      aria-label="Informações da equipe"
    >
      <h2 className="athlete-section-title">Informações</h2>

      <div className="team-info-head">
        <OrgImage
          src={team.logo_url}
          alt=""
          width={72}
          height={72}
          className="team-info-logo"
        />
        <p className="team-info-name">{team.full_name}</p>
      </div>

      <dl className="team-info-list">
        <div className="team-info-row">
          <dt>Gênero</dt>
          <dd>{teamGenderLabel(team.gender)}</dd>
        </div>
        <div className="team-info-row">
          <dt>Ano de fundação</dt>
          <dd>{foundedYear ?? "—"}</dd>
        </div>
        <div className="team-info-row">
          <dt>Arena</dt>
          <dd>
            {venue?.id ? (
              <Link href={`/arenas/${venue.id}`} className="team-info-link">
                {venue.full_name.trim() || "—"}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="team-info-row">
          <dt>Jogos</dt>
          <dd>{careerSummary.matches}</dd>
        </div>
        <div className="team-info-row">
          <dt>V-E-D</dt>
          <dd>{formatRecord(careerSummary)}</dd>
        </div>
        <div className="team-info-row">
          <dt>Gols pró</dt>
          <dd>{careerSummary.goals_scored}</dd>
        </div>
        <div className="team-info-row">
          <dt>Gols contra</dt>
          <dd>{careerSummary.goals_conceded}</dd>
        </div>
        <div className="team-info-row">
          <dt>Títulos</dt>
          <dd>{formatTitles(careerSummary.titles)}</dd>
        </div>
      </dl>

      <div className="team-info-staff">
        <h3 className="team-info-staff-title">Comissão técnica atual</h3>
        {staff.length === 0 ? (
          <p className="team-info-staff-empty">Nenhum membro registrado.</p>
        ) : (
          <ul className="team-info-staff-list">
            {staff.map((member) => (
              <li key={member.id}>
                <Link href={`/comissao/${member.id}`} className="team-info-staff-link">
                  <OrgImage
                    src={member.photo_url}
                    alt=""
                    width={28}
                    height={28}
                    className="team-info-staff-photo"
                  />
                  <span className="team-info-staff-text">
                    <span className="team-info-staff-name">
                      {member.surname ?? member.full_name}
                    </span>
                    {member.role ? (
                      <span className="team-info-staff-role">{member.role}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
