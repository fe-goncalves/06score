"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CompetitionGalleryMatchCard } from "@/components/competition/CompetitionGalleryMatchCard";
import { OrgImage } from "@/components/ui/OrgImage";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { buildTeamRecentForm } from "@/lib/team/form";
import type { Match, NewsArticleListItem, Team } from "@/lib/types";

interface TeamHubTabProps {
  team: Team & { id: string };
  matches: Match[];
  news: NewsArticleListItem[];
  accent: string;
  onOpenPartidas: () => void;
}

function FormCard({
  matches,
  teamId,
  accent,
  onOpenPartidas,
}: {
  matches: Match[];
  teamId: string;
  accent: string;
  onOpenPartidas: () => void;
}) {
  const form = buildTeamRecentForm(matches, teamId, 10);

  return (
    <section className="team-hub-card">
      <h2 className="team-hub-card-title">Forma recente</h2>
      {form.length === 0 ? (
        <p className="team-hub-empty">Sem confrontos recentes.</p>
      ) : (
        <div className="team-hub-form-inner">
          <div className="team-hub-form-flags">
            {form.map((entry) => (
              <Link
                key={entry.match.id}
                href={`/jogos/${entry.match.id}`}
                className="team-hub-form-col"
              >
                <TeamLogo team={entry.opponent} size={28} />
              </Link>
            ))}
          </div>
          <div className="team-hub-form-bars">
            <span className="team-hub-form-baseline" aria-hidden />
            {form.map((entry) => {
              const color =
                entry.result === "W"
                  ? "#22C55E"
                  : entry.result === "D"
                    ? "#94A3B8"
                    : "#F87171";
              const h =
                entry.result === "D" ? 14 : 22 + entry.magnitude * 26;
              return (
                <Link
                  key={`${entry.match.id}-bar`}
                  href={`/jogos/${entry.match.id}`}
                  className="team-hub-form-col"
                >
                  <span className="team-hub-form-bar-track">
                    <span
                      className={
                        entry.result === "D"
                          ? "team-hub-form-bar team-hub-form-bar--center"
                          : entry.result === "W"
                            ? "team-hub-form-bar team-hub-form-bar--up"
                            : "team-hub-form-bar team-hub-form-bar--down"
                      }
                      style={{
                        height: entry.result === "L" ? h * 0.9 : h,
                        backgroundColor: color,
                      }}
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        className="team-hub-card-link"
        style={{ color: accent }}
        onClick={onOpenPartidas}
      >
        Ver todas as partidas →
      </button>
    </section>
  );
}

function RecentMatchesCard({
  matches,
  accent,
}: {
  matches: Match[];
  accent: string;
}) {
  const recent = useMemo(() => {
    return [...matches]
      .sort((a, b) => {
        const ta = `${a.match_date}T${a.match_time ?? "12:00:00"}`;
        const tb = `${b.match_date}T${b.match_time ?? "12:00:00"}`;
        return tb.localeCompare(ta);
      })
      .slice(0, 5);
  }, [matches]);

  return (
    <section className="team-hub-card team-hub-card--matches">
      <h2 className="team-hub-card-title">Últimos jogos</h2>
      {recent.length === 0 ? (
        <p className="team-hub-empty">Nenhuma partida disponível.</p>
      ) : (
        <div className="team-hub-recent-gallery">
          {recent.map((match, index) => (
            <CompetitionGalleryMatchCard
              key={match.id}
              match={match}
              index={index}
              accentColor={accent}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TeamNewsFeed({
  articles,
  accent,
}: {
  articles: NewsArticleListItem[];
  accent: string;
}) {
  if (!articles.length) {
    return (
      <section className="team-hub-news">
        <h2 className="team-hub-card-title">Notícias</h2>
        <p className="team-hub-empty">Sem notícias para esta equipe.</p>
      </section>
    );
  }

  return (
    <section className="team-hub-news">
      <h2 className="team-hub-card-title">Notícias</h2>
      <div className="team-hub-news-feed">
        {articles.slice(0, 8).map((article) => (
          <Link
            key={article.id}
            href={`/noticias/${article.id}`}
            className="team-hub-news-card"
          >
            {article.cover_url ? (
              <OrgImage
                src={article.cover_url}
                alt=""
                width={480}
                height={640}
                className="team-hub-news-cover"
              />
            ) : (
              <span
                className="team-hub-news-cover team-hub-news-cover--ph"
                style={{ backgroundColor: `${accent}33` }}
              />
            )}
            <span className="team-hub-news-body">
              {article.subtitle ? (
                <span className="team-hub-news-sub">{article.subtitle}</span>
              ) : null}
              <span className="team-hub-news-title">{article.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TeamHubTab({
  team,
  matches,
  news,
  accent,
  onOpenPartidas,
}: TeamHubTabProps) {
  return (
    <div className="team-hub-tab">
      <div className="team-hub-grid">
        <FormCard
          matches={matches}
          teamId={team.id}
          accent={accent}
          onOpenPartidas={onOpenPartidas}
        />
        <RecentMatchesCard matches={matches} accent={accent} />
      </div>
      <TeamNewsFeed articles={news} accent={accent} />
    </div>
  );
}
