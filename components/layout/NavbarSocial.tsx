import type { ReactNode } from "react";
import type { Organization } from "@/lib/types";

interface NavbarSocialProps {
  org: Organization;
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="navbar-social-link"
    >
      {children}
    </a>
  );
}

export function NavbarSocial({ org }: NavbarSocialProps) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <SocialIcon href={org.tiktok_url} label="TikTok">
        <svg className="h-4 w-4 md:h-[18px] md:w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.18 8.18 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z" />
        </svg>
      </SocialIcon>
      <SocialIcon href={org.instagram_url} label="Instagram">
        <svg className="h-4 w-4 md:h-[18px] md:w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </SocialIcon>
      <SocialIcon href={org.youtube_url} label="YouTube">
        <svg className="h-4 w-4 md:h-[18px] md:w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.58 7.2a2.43 2.43 0 00-1.7-1.72C18.88 5 12 5 12 5s-6.88 0-7.88.48A2.43 2.43 0 002.42 7.2 25.1 25.1 0 002 12a25.1 25.1 0 00.42 4.8 2.43 2.43 0 001.7 1.72C5.12 19 12 19 12 19s6.88 0 7.88-.48a2.43 2.43 0 001.7-1.72A25.1 25.1 0 0022 12a25.1 25.1 0 00-.42-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      </SocialIcon>
    </div>
  );
}
