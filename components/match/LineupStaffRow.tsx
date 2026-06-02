import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { staffLineupSurnameLabel } from "@/lib/match/lineupList";
import type { MatchStaffLineup } from "@/lib/types";

interface LineupStaffRowProps {
  staff: MatchStaffLineup;
}

export function LineupStaffRow({ staff }: LineupStaffRowProps) {
  const person = staff.staff_members;
  const surname = staffLineupSurnameLabel(staff);
  const staffId = staff.staff_member_id;

  const rowBody = (
    <>
      <OrgImage
        src={person?.photo_url ?? null}
        alt=""
        width={40}
        height={40}
        className="match-lineup-photo"
      />
      <div className="match-lineup-row-body">
        <span className="match-lineup-surname match-lineup-surname--staff">
          {surname}
        </span>
      </div>
    </>
  );

  return (
    <li className="match-lineup-row match-lineup-row--staff">
      {staffId ? (
        <Link href={`/comissao/${staffId}`} className="match-lineup-row-link">
          {rowBody}
        </Link>
      ) : (
        <div className="match-lineup-row-link match-lineup-row-link--static">
          {rowBody}
        </div>
      )}
    </li>
  );
}
