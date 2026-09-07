"use client";

import type { CSSProperties } from "react";
import type { Match } from "@/lib/types";

interface MatchMediaPanelProps {
  match: Match;
  accentColor?: string | null;
}

function MediaLinkCard({
  title,
  subtitle,
  href,
  accent,
}: {
  title: string;
  subtitle: string;
  href: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="match-media-link-card"
      style={{ "--media-accent": accent } as CSSProperties}
    >
      <span className="match-media-link-icon" aria-hidden>
        {title === "Fotos" ? "▣" : "▶"}
      </span>
      <span className="match-media-link-text">
        <span className="match-media-link-title">{title}</span>
        <span className="match-media-link-sub">{subtitle}</span>
      </span>
      <span className="match-media-link-open" aria-hidden>
        ↗
      </span>
    </a>
  );
}

export function MatchMediaPanel({ match, accentColor }: MatchMediaPanelProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const photos = match.photos_url?.trim() || null;
  const video = match.highlights_url?.trim() || null;

  if (!photos && !video) {
    return (
      <div className="match-media-empty">
        <p className="match-media-empty-title">Sem mídia nesta partida</p>
        <p className="match-media-empty-hint">
          Fotos e vídeos aparecerão aqui quando forem publicados.
        </p>
      </div>
    );
  }

  return (
    <div className="match-media-panel">
      <section className="match-media-section">
        <div className="match-media-links">
          {photos ? (
            <MediaLinkCard
              title="Fotos"
              subtitle="Abrir álbum da partida"
              href={photos}
              accent={accent}
            />
          ) : null}
          {video ? (
            <MediaLinkCard
              title="Vídeo"
              subtitle="Abrir highlights / transmissão"
              href={video}
              accent={accent}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
