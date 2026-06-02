import type { CSSProperties } from "react";
import { LabTotsPitch, type LabTotsPitchSlot } from "@/components/competition/LabTotsPitch";
import { TotsMobileCarousel } from "@/components/competition/TotsMobileCarousel";
import { OrgImage } from "@/components/ui/OrgImage";
import type { EditionTotsSquad, HomeTotwMember } from "@/lib/types";

interface TOTSSectionProps {
  squad: EditionTotsSquad;
  accentColor?: string | null;
}

function toPitchSlot(member: HomeTotwMember | null): LabTotsPitchSlot | null {
  if (!member) return null;
  return {
    name: member.name,
    photo: member.photo_url,
    teamName: member.team_abbreviation ?? "",
    teamLogo: member.team_logo_url,
    teamColor: member.team_primary_color,
  };
}

function StaffRow({ member }: { member: HomeTotwMember }) {
  return (
    <div className="lab-tots-staff-row">
      {member.photo_url ? (
        <OrgImage
          src={member.photo_url}
          alt={member.name}
          width={34}
          height={34}
          className="lab-tots-staff-photo"
        />
      ) : (
        <span className="lab-tots-staff-photo lab-tots-staff-photo-fallback">
          {member.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <div className="lab-tots-staff-text">
        <p className="lab-tots-staff-name">{member.name}</p>
        <p className="lab-tots-staff-meta">
          {[member.role, member.team_abbreviation].filter(Boolean).join(" · ")}
        </p>
      </div>
      {member.team_logo_url && (
        <OrgImage
          src={member.team_logo_url}
          alt=""
          width={24}
          height={24}
          className="lab-tots-staff-team-logo"
        />
      )}
    </div>
  );
}

export function TOTSSection({ squad, accentColor }: TOTSSectionProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const pitchSlots = squad.slots.map(toPitchSlot);

  return (
    <section
      className="competition-tots"
      style={{ "--tots-accent": accent } as CSSProperties}
    >
      <h3 className="competition-tots-title">Seleção da Temporada</h3>

      <TotsMobileCarousel
        formation={squad.formation}
        slots={pitchSlots}
        staff={squad.staff}
      />

      <div className="lab-tots-desktop">
        <LabTotsPitch formation={squad.formation} slots={pitchSlots} />
      </div>

      {squad.staff.length > 0 && (
        <div className="lab-tots-staff-block lab-tots-staff-block--desktop">
          <span className="lab-tots-staff-label">Técnico</span>
          <div className="lab-tots-staff-list">
            {squad.staff.map((member) => (
              <StaffRow
                key={member.staff_member_id ?? member.name}
                member={member}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
