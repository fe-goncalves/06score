import Image from "next/image";
import { TeamShape, getTeamShapeIndex } from "@/components/ui/TeamShape";
import type { Team } from "@/lib/types";

interface TeamLogoProps {
  team: Team | null | undefined;
  index?: number;
  size?: number;
  className?: string;
  alt?: string;
}

export function TeamLogo({
  team,
  index,
  size = 32,
  className = "",
  alt,
}: TeamLogoProps) {
  const label = alt ?? team?.full_name ?? "Time";
  const shapeIndex =
    index ?? getTeamShapeIndex(team?.id, team?.full_name?.length ?? 0);

  if (team?.logo_url) {
    return (
      <Image
        src={team.logo_url}
        alt={label}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <TeamShape
      index={shapeIndex}
      color={team?.primary_color}
      size={size}
      className={className}
    />
  );
}
