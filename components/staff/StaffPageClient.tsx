"use client";

import type { StaffProfileData } from "@/lib/types";
import { AthletePageClient } from "@/components/athlete/AthletePageClient";
import type { AthleteProfileData } from "@/lib/types";

interface StaffPageClientProps {
  profile: StaffProfileData;
}

export function StaffPageClient({ profile }: StaffPageClientProps) {
  const hubProfile: AthleteProfileData = {
    profileKind: "staff",
    breadcrumb: { href: "/comissao", label: "Comissão técnica" },
    athlete: {
      id: profile.staff.id,
      full_name: profile.staff.full_name,
      surname: profile.staff.surname,
      photo_url: profile.staff.photo_url,
      nationality: profile.staff.nationality,
      player_positions: profile.staff.role
        ? { full_name: profile.staff.role, abbreviation: null }
        : null,
      birth_date: profile.staff.birth_date,
    },
    careerStats: null,
    careerSummary: profile.careerSummary,
    stints: profile.stints,
    recentMatches: profile.recentMatches,
    rosterEntries: profile.rosterEntries,
    editionStats: profile.editionStats,
    phases: profile.phases,
    statsPhases: profile.statsPhases,
    awards: profile.awards,
    teamAwards: profile.teamAwards,
  };

  return (
    <AthletePageClient
      profile={{
        ...hubProfile,
        careerStats: profile.careerStats,
      }}
    />
  );
}
