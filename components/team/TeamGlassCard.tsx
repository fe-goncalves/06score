import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Team } from "@/lib/types";

interface TeamGlassCardProps {
  team: Team;
}

export function TeamGlassCard({ team }: TeamGlassCardProps) {
  if (!team.id) return null;

  const accent = team.primary_color ?? "var(--color-brand)";
  const label = team.short_name ?? team.abbreviation ?? team.full_name;

  return (
    <Link
      href={`/times/${team.id}`}
      className="competition-team-card group"
      style={{ "--team-color": accent } as CSSProperties}
    >
      <div className="competition-team-card-inner">
        <OrgImage
          src={team.logo_url}
          alt={team.full_name}
          width={72}
          height={72}
          className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <h3 className="competition-team-card-name">{label}</h3>
        {team.short_name && team.short_name !== team.full_name ? (
          <p className="competition-team-card-count truncate" title={team.full_name}>
            {team.full_name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
