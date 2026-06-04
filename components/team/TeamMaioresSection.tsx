"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  fetchTeamMaioresLeaders,
  TEAM_MAIORES_CARDS,
  type TeamMaioresCategory,
  type TeamMaioresEntry,
  type TeamMaioresLeaderCard,
} from "@/lib/team/fetchTeamMaiores";
import { athleteSurnameLabel } from "@/lib/utils";

interface TeamMaioresSectionProps {
  teamId: string;
  teamEditionIds: string[];
  championEditionIds: string[];
  accent?: string | null;
}

function MaioresModal({
  card,
  accent,
  onClose,
}: {
  card: TeamMaioresLeaderCard;
  accent: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="team-maiores-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="team-maiores-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-maiores-modal-title"
        style={{ "--team-accent": accent } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="team-maiores-modal-head">
          <h3 id="team-maiores-modal-title" className="team-maiores-modal-title">
            {card.title}
          </h3>
          <button
            type="button"
            className="team-maiores-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <ol className="team-maiores-modal-list">
          {card.entries.length === 0 ? (
            <li className="team-maiores-modal-empty">Nenhum dado registrado.</li>
          ) : (
            card.entries.map((entry) => (
              <MaioresListRow key={entry.athlete_id} entry={entry} valueLabel={card.valueLabel} />
            ))
          )}
        </ol>
      </div>
    </div>
  );
}

function MaioresListRow({
  entry,
  valueLabel,
}: {
  entry: TeamMaioresEntry;
  valueLabel: string;
}) {
  const name = athleteSurnameLabel(entry.full_name, entry.surname);
  return (
    <li>
      <Link href={`/atletas/${entry.athlete_id}`} className="team-maiores-modal-row">
        <span className="team-maiores-modal-rank">{entry.rank}</span>
        <OrgImage
          src={entry.photo_url}
          alt=""
          width={36}
          height={36}
          className="team-maiores-modal-photo"
        />
        <span className="team-maiores-modal-name">{name}</span>
        <span className="team-maiores-modal-value">
          {entry.value} {valueLabel.toLowerCase()}
        </span>
      </Link>
    </li>
  );
}

function MaioresCard({
  card,
  accent,
  onOpen,
}: {
  card: TeamMaioresLeaderCard;
  accent: string;
  onOpen: () => void;
}) {
  const leader = card.leader;
  const name = leader
    ? athleteSurnameLabel(leader.full_name, leader.surname)
    : "—";

  return (
    <button
      type="button"
      className="team-maiores-card"
      style={{ "--team-accent": accent } as CSSProperties}
      onClick={onOpen}
      aria-label={`Ver top 10 — ${card.title}`}
    >
      <div className="team-maiores-card-glow" aria-hidden />
      <p className="team-maiores-card-label">{card.title}</p>
      <div className="team-maiores-card-body">
        <OrgImage
          src={leader?.photo_url}
          alt=""
          width={64}
          height={64}
          className="team-maiores-card-photo"
        />
        <div className="team-maiores-card-meta">
          <p className="team-maiores-card-name">{name}</p>
          <p className="team-maiores-card-value">
            {leader ? leader.value : "—"}
            <span className="team-maiores-card-unit">{card.valueLabel}</span>
          </p>
        </div>
      </div>
    </button>
  );
}

export function TeamMaioresSection({
  teamId,
  teamEditionIds,
  championEditionIds,
  accent = "var(--color-brand)",
}: TeamMaioresSectionProps) {
  const [cards, setCards] = useState<TeamMaioresLeaderCard[]>(
    TEAM_MAIORES_CARDS.map((def) => ({
      ...def,
      entries: [],
      leader: null,
    })),
  );
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<TeamMaioresCategory | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTeamMaioresLeaders(teamId, teamEditionIds, championEditionIds).then((data) => {
      if (!cancelled) {
        setCards(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [teamId, teamEditionIds, championEditionIds]);

  const openCard = openCategory
    ? cards.find((card) => card.category === openCategory) ?? null
    : null;

  return (
    <section className="team-maiores-section">
      {loading ? (
        <p className="athlete-awards-empty">Carregando maiores…</p>
      ) : (
        <div className="team-maiores-grid">
          {cards.map((card) => (
            <MaioresCard
              key={card.category}
              card={card}
              accent={accent}
              onOpen={() => setOpenCategory(card.category)}
            />
          ))}
        </div>
      )}

      {openCard ? (
        <MaioresModal
          card={openCard}
          accent={accent}
          onClose={() => setOpenCategory(null)}
        />
      ) : null}
    </section>
  );
}
