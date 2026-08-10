"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_LINKS = [
  { href: "/competicoes", label: "COMPETIÇÕES" },
  { href: "/bid", label: "BID" },
  { href: "/times", label: "EQUIPES" },
  { href: "/atletas", label: "ATLETAS" },
  { href: "/news", label: "NOTÍCIAS" },
  { href: "/arenas", label: "ARENAS" },
  { href: "/hall-da-fama", label: "HALL" },
  { href: "/pesquisa", label: "PESQUISAR" },
] as const;

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="navbar-float-links" aria-label="Principal">
      {NAV_LINKS.map((link) => {
        const active = isNavLinkActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
