import type { Organization } from "@/lib/types";

interface FooterSocialProps {
  org: Organization;
}

function SocialLink({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono-label text-[9px] uppercase text-white/40 transition-colors hover:text-[var(--color-brand)]"
    >
      {label}
    </a>
  );
}

export function FooterSocial({ org }: FooterSocialProps) {
  const links = [
    { href: org.instagram_url, label: "Instagram" },
    { href: org.tiktok_url, label: "TikTok" },
    { href: org.youtube_url, label: "YouTube" },
  ].filter((l) => l.href);

  if (!links.length) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
      aria-label="Redes sociais"
    >
      {links.map((link) => (
        <SocialLink key={link.label} href={link.href} label={link.label} />
      ))}
    </nav>
  );
}
