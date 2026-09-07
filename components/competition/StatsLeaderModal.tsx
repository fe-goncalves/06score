"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SearchableFilter } from "@/components/ui/SearchableFilter";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Phase } from "@/lib/types";
import { phaseLabel } from "@/lib/competition/phases";

interface StatsLeaderModalProps {
  title: string;
  accentColor?: string | null;
  onClose: () => void;
  children: ReactNode;
  teamOptions: { id: string; label: string; logoUrl?: string | null }[];
  positionOptions: { id: string; label: string }[];
  phases: Phase[];
  teamFilter: string;
  positionFilter: string;
  phaseFilter: string;
  onTeamFilter: (id: string) => void;
  onPositionFilter: (id: string) => void;
  onPhaseFilter: (id: string) => void;
}

export function StatsLeaderModal({
  title,
  accentColor,
  onClose,
  children,
  teamOptions,
  positionOptions,
  phases,
  teamFilter,
  positionFilter,
  phaseFilter,
  onTeamFilter,
  onPositionFilter,
  onPhaseFilter,
}: StatsLeaderModalProps) {
  const accent = accentColor ?? "var(--color-brand)";

  const phaseOptions = useMemo(
    () => phases.map((p) => ({ id: p.id, label: phaseLabel(p) })),
    [phases],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
    <div
      className="stats-leader-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="stats-leader-modal stats-leader-modal--filters"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-leader-modal-title"
        style={{ "--modal-accent": accent } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stats-leader-modal-head">
          <h2 id="stats-leader-modal-title" className="stats-leader-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="stats-leader-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="stats-leader-modal-filters">
          <SearchableFilter
            label="Equipe"
            value={teamFilter}
            options={teamOptions}
            onChange={onTeamFilter}
            allLabel="Todas as equipes"
          />
          <SearchableFilter
            label="Fase"
            value={phaseFilter}
            options={phaseOptions}
            onChange={onPhaseFilter}
            allLabel="Todas as fases"
          />
          <SearchableFilter
            label="Posição"
            value={positionFilter}
            options={positionOptions}
            onChange={onPositionFilter}
            allLabel="Todas as posições"
          />
        </div>

        <div className="stats-leader-modal-main">{children}</div>
      </div>
    </div>
  );
}

export function StatsLeaderModalRow({
  href,
  photo,
  name,
  teamLogo,
  teamAlt,
  value,
}: {
  href?: string;
  photo?: ReactNode;
  name: string;
  teamLogo?: string | null;
  teamAlt?: string;
  value: number | string;
}) {
  const content = (
    <>
      {photo}
      <div className="competition-leader-main">
        <p className="competition-leader-name">{name}</p>
        {teamLogo ? (
          <OrgImage
            src={teamLogo}
            alt={teamAlt ?? "Time"}
            width={18}
            height={18}
            className="competition-leader-team-logo"
          />
        ) : null}
      </div>
      <span className="competition-leader-value">{value}</span>
    </>
  );

  const className = "competition-leader-item stats-leader-modal-row";

  if (href && href !== "#") {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

/** Hook state helper for modal filters. */
export function useStatsModalFilters() {
  const [teamFilter, setTeamFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");

  function reset() {
    setTeamFilter("all");
    setPositionFilter("all");
    setPhaseFilter("all");
  }

  return {
    teamFilter,
    positionFilter,
    phaseFilter,
    setTeamFilter,
    setPositionFilter,
    setPhaseFilter,
    reset,
  };
}
