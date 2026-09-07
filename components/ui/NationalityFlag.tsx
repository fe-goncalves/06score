"use client";

import * as Flags from "country-flag-icons/react/3x2";
import { hasFlag } from "country-flag-icons";
import { nationalityIso2 } from "@/lib/athlete/athleteHeaderFormat";

interface NationalityFlagProps {
  nationality: string | null | undefined;
  className?: string;
}

export function NationalityFlag({
  nationality,
  className,
}: NationalityFlagProps) {
  const iso2 = nationalityIso2(nationality);
  if (!iso2 || !hasFlag(iso2)) return null;

  const Flag = Flags[iso2 as keyof typeof Flags];
  if (!Flag) return null;

  return <Flag className={className} aria-hidden />;
}
