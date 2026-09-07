import { AthletePhotoPlaceholder } from "@/components/ui/AthletePhotoPlaceholder";
import { MatchIcon } from "@/components/match/icons/MatchIcon";
import { OrgImage } from "@/components/ui/OrgImage";

type EntityAvatarKind = "athlete" | "staff" | "team" | "competition" | "arena";

interface EntityAvatarProps {
  kind: EntityAvatarKind;
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

/** Avatar padronizado nas listas (pesquisa e afins). */
export function EntityAvatar({
  kind,
  src,
  alt,
  size = 28,
  className = "",
}: EntityAvatarProps) {
  const dim = { width: size, height: size };
  const rounded =
    kind === "athlete" || kind === "staff" || kind === "arena"
      ? "liquid-glass-list-photo"
      : "liquid-glass-list-logo object-contain";

  if (src) {
    return (
      <OrgImage
        src={src}
        alt={alt}
        {...dim}
        className={`${rounded} ${className}`.trim()}
      />
    );
  }

  if (kind === "athlete" || kind === "staff") {
    return (
      <span
        className={`liquid-glass-list-photo-placeholder liquid-glass-list-avatar-slot ${className}`.trim()}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <AthletePhotoPlaceholder className="liquid-glass-list-avatar-icon" />
      </span>
    );
  }

  if (kind === "arena") {
    return (
      <span
        className={`liquid-glass-list-logo-placeholder liquid-glass-list-avatar-slot ${className}`.trim()}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <MatchIcon name="stadium" size={Math.round(size * 0.62)} tinted />
      </span>
    );
  }

  return (
    <span
      className={`liquid-glass-list-logo-placeholder liquid-glass-list-avatar-slot ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
