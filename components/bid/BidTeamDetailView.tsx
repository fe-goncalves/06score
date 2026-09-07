import Link from "next/link";
import { AthletePhotoPlaceholder } from "@/components/ui/AthletePhotoPlaceholder";
import { OrgImage } from "@/components/ui/OrgImage";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { formatBidEditionLabel } from "@/lib/bid/format";
import type { BidTeamDetail } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

interface BidTeamDetailViewProps {
  detail: BidTeamDetail;
  backHref?: string;
  backLabel?: string;
}

export function BidTeamDetailView({
  detail,
  backHref,
  backLabel,
}: BidTeamDetailViewProps) {
  const editionLabel = formatBidEditionLabel(detail.edition);
  const resolvedBackHref = backHref ?? `/bid?edicao=${detail.edition.id}`;
  const resolvedBackLabel = backLabel ?? "Voltar ao BID";
  const teamTitle = (
    detail.team.short_name?.trim() || detail.team.full_name
  ).toUpperCase();

  return (
    <div className="bid-detail page-container pb-10">
      <Link href={resolvedBackHref} className="site-list-back-link bid-detail-back">
        <span aria-hidden>←</span> {resolvedBackLabel}
      </Link>

      <header className="bid-detail-header">
        <TeamLogo team={detail.team} size={72} className="bid-detail-logo" />
        <div className="min-w-0">
          <p className="bid-detail-edition">{editionLabel}</p>
          <h1 className="bid-detail-team-name">{teamTitle}</h1>
          <p className="bid-detail-counts">
            <span>{detail.squad.length} atletas</span>
            <span aria-hidden>·</span>
            <span>{detail.staff.length} comissão técnica</span>
          </p>
        </div>
      </header>

      <section className="bid-detail-section">
        <h2 className="bid-detail-section-title">Atletas inscritos</h2>
        {detail.squad.length === 0 ? (
          <p className="bid-detail-empty">Nenhum atleta inscrito.</p>
        ) : (
          <ul className="bid-athlete-list">
            {detail.squad.map((athlete) => {
              const nickname = athleteSurnameLabel(
                athlete.full_name,
                athlete.surname,
              );
              return (
                <li key={athlete.id}>
                  <Link href={`/atletas/${athlete.id}`} className="bid-athlete-link">
                    {athlete.photo_url ? (
                      <OrgImage
                        src={athlete.photo_url}
                        alt=""
                        width={40}
                        height={40}
                        className="bid-athlete-photo"
                      />
                    ) : (
                      <span
                        className="bid-athlete-photo bid-athlete-photo--placeholder"
                        aria-hidden
                      >
                        <AthletePhotoPlaceholder className="bid-athlete-photo-icon" />
                      </span>
                    )}
                    <span className="bid-athlete-name">{nickname}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="bid-detail-section">
        <h2 className="bid-detail-section-title">Comissão técnica</h2>
        {detail.staff.length === 0 ? (
          <p className="bid-detail-empty">Nenhum membro inscrito.</p>
        ) : (
          <ul className="bid-staff-list">
            {detail.staff.map((member) => (
              <li key={member.id}>
                <Link href={`/comissao/${member.id}`} className="bid-staff-link group">
                  {member.photo_url ? (
                    <OrgImage
                      src={member.photo_url}
                      alt=""
                      width={36}
                      height={36}
                      className="bid-staff-photo"
                    />
                  ) : (
                    <span
                      className="bid-staff-photo bid-staff-photo--placeholder"
                      aria-hidden
                    >
                      <AthletePhotoPlaceholder className="bid-staff-photo-icon" />
                    </span>
                  )}
                  <span className="bid-staff-text">
                    <span className="bid-staff-name">
                      {member.surname ?? member.full_name}
                    </span>
                    {member.role ? (
                      <span className="bid-staff-role">{member.role}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
