import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Organization } from "@/lib/types";

interface FooterProps {
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
      className="text-xs font-bold uppercase tracking-wider text-white/50 transition-colors hover:text-[var(--color-brand)]"
    >
      {label}
    </a>
  );
}

export function Footer({ org }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#0D0D0D]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <OrgImage
          src={org.logo_url}
          alt={org.name}
          width={56}
          height={56}
          className="h-14 w-14 rounded object-contain"
        />

        <div className="flex flex-wrap items-center justify-center gap-6">
          <SocialLink href={org.instagram_url} label="Instagram" />
          <SocialLink href={org.youtube_url} label="YouTube" />
          <SocialLink href={org.tiktok_url} label="TikTok" />
          <SocialLink href={org.twitter_url} label="X" />
        </div>

        <p className="text-center text-sm text-white/40">
          © {year}{" "}
          <Link href="/" className="hover:text-[var(--color-brand)]">
            {org.name}
          </Link>
          . Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
