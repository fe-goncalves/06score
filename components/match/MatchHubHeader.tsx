"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { MatchGoalScorersRecap } from "@/components/match/MatchGoalScorersRecap";
import { MatchHubHeaderBg } from "@/components/match/MatchHubHeaderBg";
import { OrgImage } from "@/components/ui/OrgImage";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { TabItem } from "@/components/ui/PageTabs";
import type { Match, MatchAction } from "@/lib/types";
import {
  formatMatchHeaderDateTime,
  isMatchFinished,
  isMatchLive,
  matchStatusLabel,
} from "@/lib/utils";

interface MatchHubHeaderProps {
  match: Match;
  actions: MatchAction[];
  teamAId: string;
  teamBId: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

function competitionLabel(match: Match): string {
  return (
    match.phases?.competition_editions?.competitions?.full_name ??
    match.phases?.competition_editions?.competitions?.short_name ??
    "Competição"
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path d="M2 6.5h12M5 1.5v2M11 1.5v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function PitchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <rect
        x="1.5"
        y="2.5"
        width="13"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M8 2.5v11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function MatchHubHeader({
  match,
  actions,
  teamAId,
  teamBId,
  tabs,
  activeTab,
  onTabChange,
}: MatchHubHeaderProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const teamA = match.teams_a;
  const teamB = match.teams_b;
  const competition = match.phases?.competition_editions?.competitions;
  const competitionId = competition?.id;
  const venue = match.venues;
  const accent =
    competition?.primary_color ??
    teamA?.primary_color ??
    "var(--color-brand)";
  const showScore = finished || live;

  return (
    <header
      className={`match-hub-header ${live ? "match-hub-header--live" : ""}`}
      style={{ "--match-accent": accent } as CSSProperties}
    >
      <MatchHubHeaderBg accentColor={accent} />

      <div className="match-hub-header-content">
        <nav className="match-hub-breadcrumb" aria-label="Navegação">
          <Link href="/competicoes" className="match-hub-breadcrumb-link">
            Competições
          </Link>
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          {competitionId ? (
            <Link
              href={`/competicoes/${competitionId}`}
              className="match-hub-breadcrumb-link"
            >
              {competitionLabel(match)}
            </Link>
          ) : (
            <span className="match-hub-breadcrumb-current">
              {competitionLabel(match)}
            </span>
          )}
        </nav>

        <div className="match-hub-meta">
          <span className="match-hub-meta-item">
            <CalendarIcon />
            <span>{formatMatchHeaderDateTime(match.match_date, match.match_time)}</span>
          </span>
          <span className="match-hub-meta-sep" aria-hidden>
            ·
          </span>
          {competitionId ? (
            <Link
              href={`/competicoes/${competitionId}`}
              className="match-hub-meta-item match-hub-meta-link"
            >
              {competition?.logo_url && (
                <OrgImage
                  src={competition.logo_url}
                  alt=""
                  width={16}
                  height={16}
                  className="match-hub-meta-comp-logo"
                />
              )}
              <span>{competitionLabel(match)}</span>
            </Link>
          ) : (
            <span className="match-hub-meta-item">
              {competition?.logo_url && (
                <OrgImage
                  src={competition.logo_url}
                  alt=""
                  width={16}
                  height={16}
                  className="match-hub-meta-comp-logo"
                />
              )}
              <span>{competitionLabel(match)}</span>
            </span>
          )}
          {venue?.full_name && (
            <>
              <span className="match-hub-meta-sep" aria-hidden>
                ·
              </span>
              {venue.id ? (
                <Link
                  href={`/arenas/${venue.id}`}
                  className="match-hub-meta-item match-hub-meta-link"
                >
                  <PitchIcon />
                  <span>{venue.full_name}</span>
                </Link>
              ) : (
                <Link
                  href="/arenas"
                  className="match-hub-meta-item match-hub-meta-link"
                >
                  <PitchIcon />
                  <span>{venue.full_name}</span>
                </Link>
              )}
            </>
          )}
        </div>

        <div className="match-hub-scoreboard">
          {teamA?.id ? (
            <Link
              href={`/times/${teamA.id}`}
              className="match-hub-team match-hub-team--home match-hub-team-link"
            >
              <span className="match-hub-team-name">
                {teamA.short_name ?? teamA.full_name ?? "—"}
              </span>
              <TeamLogo team={teamA} index={0} size={76} />
            </Link>
          ) : (
            <div className="match-hub-team match-hub-team--home">
              <span className="match-hub-team-name">
                {teamA?.short_name ?? teamA?.full_name ?? "—"}
              </span>
              <TeamLogo team={teamA} index={0} size={76} />
            </div>
          )}

          <div className="match-hub-score-block">
            {showScore ? (
              <p className="match-hub-score tabular-nums">
                <span>{match.score_a ?? 0}</span>
                <span className="match-hub-score-sep">:</span>
                <span>{match.score_b ?? 0}</span>
              </p>
            ) : (
              <p className="match-hub-kickoff tabular-nums">
                {match.match_time?.slice(0, 5) ?? "—"}
              </p>
            )}
            <p className="match-hub-status">{matchStatusLabel(match.status)}</p>
          </div>

          {teamB?.id ? (
            <Link
              href={`/times/${teamB.id}`}
              className="match-hub-team match-hub-team--away match-hub-team-link"
            >
              <TeamLogo team={teamB} index={1} size={76} />
              <span className="match-hub-team-name">
                {teamB.short_name ?? teamB.full_name ?? "—"}
              </span>
            </Link>
          ) : (
            <div className="match-hub-team match-hub-team--away">
              <TeamLogo team={teamB} index={1} size={76} />
              <span className="match-hub-team-name">
                {teamB?.short_name ?? teamB?.full_name ?? "—"}
              </span>
            </div>
          )}
        </div>

        <MatchGoalScorersRecap
          actions={actions}
          teamAId={teamAId}
          teamBId={teamBId}
        />

        <nav className="match-hub-nav scrollbar-hide" aria-label="Seções da partida">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`match-hub-nav-tab ${isActive ? "match-hub-nav-tab--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
