import { MATCH_ICONS, type MatchIconAsset } from "@/lib/match/icons";

interface MatchIconProps {
  name: MatchIconAsset;
  size?: number;
  className?: string;
}

export function MatchIcon({ name, size = 16, className = "" }: MatchIconProps) {
  const src = MATCH_ICONS[name];
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  );
}
