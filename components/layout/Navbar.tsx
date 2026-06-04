 "use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, NavbarNavLinks, isNavLinkActive } from "@/components/layout/NavbarNavLinks";
import { NavbarSocial } from "@/components/layout/NavbarSocial";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Organization } from "@/lib/types";

interface NavbarProps {
  org: Organization;
}

export function Navbar({ org }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="navbar-top sticky top-0 z-50">
      <div className="page-container mx-auto flex h-14 max-w-7xl items-center gap-4 md:h-16">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <OrgImage
            src={org.logo_url}
            alt={org.name}
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </Link>

        <NavbarNavLinks />

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:block">
            <NavbarSocial org={org} />
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-black/30 text-white/80 transition-colors hover:text-white md:hidden"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-[#090909]/95 md:hidden">
          <nav className="page-container py-3">
            <ul className="grid gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-md px-3 py-2 font-mono-label text-[10px] uppercase tracking-wider ${
                      isNavLinkActive(pathname, link.href) ? "bg-white/10 text-[var(--color-brand)]" : "text-white/70"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
