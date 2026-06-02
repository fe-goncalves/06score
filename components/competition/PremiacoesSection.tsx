import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { unwrapTeamRelation } from "@/lib/data/shared";
import { TOTSSection } from "@/components/competition/TOTSSection";
import type {
  EditionAward,
  EditionAwardPerson,
  EditionTotsSquad,
  Team,
} from "@/lib/types";
import { athleteDisplayName } from "@/lib/utils";

interface PremiacoesSectionProps {
  awards: EditionAward[];
  totsSquad?: EditionTotsSquad | null;
  accentColor?: string | null;
}

const COLLECTIVE_AWARDS = [
  { type: "champion", label: "Campeão", icon: "🏆", rank: 1 },
  { type: "runner_up", label: "Vice-campeão", icon: "🥈", rank: 2 },
  { type: "third_place", label: "3º Lugar", icon: "🥉", rank: 3 },
  { type: "fourth_place", label: "4º Lugar", icon: "4", rank: 4 },
  { type: "fifth_place", label: "5º Lugar", icon: "5", rank: 5 },
] as const;

const INDIVIDUAL_AWARDS = [
  { type: "mvp", label: "MVP" },
  { type: "top_scorer", label: "Artilheiro" },
  { type: "top_assists", label: "Garçom" },
  { type: "best_goalkeeper", label: "Melhor Goleiro" },
  { type: "revelation", label: "Revelação" },
  { type: "best_coach", label: "Melhor Técnico" },
] as const;

function unwrapPerson(
  raw: EditionAwardPerson | EditionAwardPerson[] | null | undefined,
): EditionAwardPerson | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function awardByType(
  awards: EditionAward[],
  type: string,
): EditionAward | undefined {
  return awards.find((row) => row.award_type === type);
}

function teamLabel(team: Team): string {
  return team.short_name ?? team.abbreviation ?? team.full_name;
}

interface CollectiveRowProps {
  label: string;
  icon: string;
  rank: number;
  team: Team;
}

function CollectiveChampionCard({
  label,
  icon,
  team,
  accent,
}: CollectiveRowProps & { accent: string }) {
  return (
    <article
      className="competition-premiacoes-champion"
      style={{ "--premiacoes-accent": accent } as CSSProperties}
    >
      <span className="competition-premiacoes-collective-icon" aria-hidden="true">
        {icon}
      </span>
      <OrgImage
        src={team.logo_url}
        alt={team.full_name}
        width={72}
        height={72}
        className="competition-premiacoes-champion-logo"
      />
      <div className="competition-premiacoes-collective-text">
        <span className="competition-premiacoes-collective-label">{label}</span>
        <span className="competition-premiacoes-champion-name">
          {teamLabel(team)}
        </span>
      </div>
    </article>
  );
}

function CollectiveCompactRow({
  label,
  icon,
  rank,
  team,
}: CollectiveRowProps) {
  return (
    <li className="competition-premiacoes-collective-row">
      <span className="competition-premiacoes-collective-rank">{rank}</span>
      <span className="competition-premiacoes-collective-icon-sm" aria-hidden="true">
        {icon}
      </span>
      <OrgImage
        src={team.logo_url}
        alt={team.full_name}
        width={32}
        height={32}
        className="competition-premiacoes-collective-logo-sm"
      />
      <div className="competition-premiacoes-collective-text">
        <span className="competition-premiacoes-collective-label">{label}</span>
        <span className="competition-premiacoes-collective-name">
          {teamLabel(team)}
        </span>
      </div>
    </li>
  );
}

interface IndividualCardProps {
  label: string;
  name: string;
  photoUrl: string | null;
  photoAlt: string;
}

function IndividualCard({ label, name, photoUrl, photoAlt }: IndividualCardProps) {
  return (
    <article className="competition-premiacoes-individual-card">
      <OrgImage
        src={photoUrl}
        alt={photoAlt}
        width={48}
        height={48}
        className="competition-premiacoes-individual-avatar"
      />
      <div className="competition-premiacoes-individual-text">
        <span className="competition-premiacoes-individual-name">{name}</span>
        <span className="competition-premiacoes-individual-label">{label}</span>
      </div>
    </article>
  );
}

export function PremiacoesSection({
  awards,
  totsSquad,
  accentColor,
}: PremiacoesSectionProps) {
  const accent = accentColor ?? "var(--color-brand)";

  const collectiveRows = COLLECTIVE_AWARDS.map((def) => {
    const row = awardByType(awards, def.type);
    const team = row ? unwrapTeamRelation(row.teams) : null;
    if (!team) return null;
    return { ...def, team };
  }).filter((row): row is (typeof COLLECTIVE_AWARDS)[number] & { team: Team } =>
    Boolean(row),
  );

  const individualRows = INDIVIDUAL_AWARDS.map((def) => {
    const row = awardByType(awards, def.type);
    if (!row) return null;

    if (def.type === "best_coach") {
      const staff = unwrapPerson(row.staff_members);
      if (!staff) return null;
      return {
        ...def,
        name: athleteDisplayName(staff.full_name, staff.surname),
        photoUrl: staff.photo_url,
        photoAlt: staff.full_name,
      };
    }

    const athlete = unwrapPerson(row.athletes);
    if (!athlete) return null;
    return {
      ...def,
      name: athleteDisplayName(athlete.full_name, athlete.surname),
      photoUrl: athlete.photo_url,
      photoAlt: athlete.full_name,
    };
  }).filter(
    (
      row,
    ): row is (typeof INDIVIDUAL_AWARDS)[number] & {
      name: string;
      photoUrl: string | null;
      photoAlt: string;
    } => Boolean(row),
  );

  const hasAwards = collectiveRows.length > 0 || individualRows.length > 0;

  if (!hasAwards && !totsSquad) {
    return null;
  }

  const champion = collectiveRows.find((row) => row.type === "champion");
  const otherCollective = collectiveRows.filter((row) => row.type !== "champion");

  return (
    <section
      className="competition-premiacoes"
      style={{ "--premiacoes-accent": accent } as CSSProperties}
    >
      <h2 className="competition-premiacoes-title">Premiações</h2>

      {hasAwards && (
      <div className="competition-premiacoes-grid">
        {collectiveRows.length > 0 && (
          <div className="competition-premiacoes-block">
            <h3 className="competition-premiacoes-block-title">Coletivas</h3>
            {champion && (
              <CollectiveChampionCard
                label={champion.label}
                icon={champion.icon}
                team={champion.team}
                accent={accent}
              />
            )}
            {otherCollective.length > 0 && (
              <ul className="competition-premiacoes-collective-list">
                {otherCollective.map((row) => (
                  <CollectiveCompactRow
                    key={row.type}
                    label={row.label}
                    icon={row.icon}
                    rank={row.rank}
                    team={row.team}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {individualRows.length > 0 && (
          <div className="competition-premiacoes-block">
            <h3 className="competition-premiacoes-block-title">Individuais</h3>
            <div className="competition-premiacoes-individual-grid">
              {individualRows.map((row) => (
                <IndividualCard
                  key={row.type}
                  label={row.label}
                  name={row.name}
                  photoUrl={row.photoUrl}
                  photoAlt={row.photoAlt}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {totsSquad && <TOTSSection squad={totsSquad} accentColor={accentColor} />}
    </section>
  );
}
