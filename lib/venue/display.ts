import type { OrgVenue } from "@/lib/types";

export function venueShortName(venue: OrgVenue): string {
  const short = venue.short_name?.trim();
  if (short) return short.toUpperCase();

  const words = venue.full_name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "—";
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}
