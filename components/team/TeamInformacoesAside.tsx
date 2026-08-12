"use client";

import type { ReactNode } from "react";
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

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="team-info-social-link"
    >
      {children}
    </a>
  );
}

const SOCIAL_ICON_CLASS = "team-info-social-icon";

export function TeamInformacoesAside({
  team,
  careerSummary,
  venue,
  foundedYear,
  staff,
  className = "",
}: TeamInformacoesAsideProps) {
  const tiktok = team.tiktok_url?.trim() || null;
  const instagram = team.instagram_url?.trim() || null;
  const youtube = team.youtube_url?.trim() || null;
  const twitter = team.twitter_url?.trim() || null;
  const hasSocials = Boolean(tiktok || instagram || youtube || twitter);

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

      <div className="team-info-socials">
        <h3 className="team-info-staff-title">Redes sociais</h3>
        {!hasSocials ? (
          <p className="team-info-staff-empty">Nenhuma rede cadastrada.</p>
        ) : (
          <ul className="team-info-social-list">
            {tiktok ? (
              <li>
                <SocialIcon href={tiktok} label="TikTok">
                  <svg
                    className={SOCIAL_ICON_CLASS}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.18 8.18 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z" />
                  </svg>
                </SocialIcon>
              </li>
            ) : null}
            {instagram ? (
              <li>
                <SocialIcon href={instagram} label="Instagram">
                  <svg
                    className={SOCIAL_ICON_CLASS}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </SocialIcon>
              </li>
            ) : null}
            {youtube ? (
              <li>
                <SocialIcon href={youtube} label="YouTube">
                  <svg
                    className={SOCIAL_ICON_CLASS}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M21.58 7.2a2.43 2.43 0 00-1.7-1.72C18.88 5 12 5 12 5s-6.88 0-7.88.48A2.43 2.43 0 002.42 7.2 25.1 25.1 0 002 12a25.1 25.1 0 00.42 4.8 2.43 2.43 0 001.7 1.72C5.12 19 12 19 12 19s6.88 0 7.88-.48a2.43 2.43 0 001.7-1.72A25.1 25.1 0 0022 12a25.1 25.1 0 00-.42-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
                  </svg>
                </SocialIcon>
              </li>
            ) : null}
            {twitter ? (
              <li>
                <SocialIcon href={twitter} label="X / Twitter">
                  <svg
                    className={SOCIAL_ICON_CLASS}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialIcon>
              </li>
            ) : null}
          </ul>
        )}
      </div>

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
