import Link from "next/link";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Organization } from "@/lib/types";

const NAV_LINKS = [
  { href: "/jogos", label: "JOGOS" },
  { href: "/competicoes", label: "COMPETIÇÕES" },
  { href: "/times", label: "TIMES" },
  { href: "/atletas", label: "ATLETAS" },
  { href: "/ranking", label: "RANKING" },
  { href: "/news", label: "NOTÍCIAS" },
  { href: "/hall-da-fama", label: "HALL DA FAMA" },
];

interface NavbarProps {
  org: Organization;
}

export function Navbar({ org }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0D0D0D]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <OrgImage
            src={org.logo_url}
            alt={org.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded object-contain"
          />
          <span className="hidden text-sm font-bold tracking-wide sm:inline">
            {org.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-bold tracking-widest text-white/70 transition-colors hover:text-[var(--color-brand)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}
