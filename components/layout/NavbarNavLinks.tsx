"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/competicoes", label: "COMPETIÇÕES" },
  { href: "/times", label: "EQUIPES" },
  { href: "/atletas", label: "ATLETAS" },
  { href: "/news", label: "NOTÍCIAS" },
  { href: "/arenas", label: "ARENAS" },
  { href: "/hall-da-fama", label: "HALL DA FAMA" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-1 items-center justify-center gap-3 lg:flex lg:gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-link font-mono-label text-[10px] font-bold uppercase tracking-widest text-white/55 transition-colors hover:text-[var(--color-brand)] ${
            isActive(pathname, link.href) ? "active text-[var(--color-brand)]" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
