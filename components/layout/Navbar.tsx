"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  NAV_LINKS,
  NavbarNavLinks,
  isNavLinkActive,
} from "@/components/layout/NavbarNavLinks";
import { NavbarSocial } from "@/components/layout/NavbarSocial";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Organization } from "@/lib/types";

interface NavbarProps {
  org: Organization;
}

export function Navbar({ org }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="navbar-spacer" aria-hidden />
      <header
        className={`navbar-float${scrolled ? " is-scrolled" : ""}${mobileOpen ? " is-open" : ""}`}
      >
        <div className="navbar-float-shell">
          <Link
            href="/"
            className="navbar-brand"
            onClick={() => setMobileOpen(false)}
          >
            <OrgImage
              src={org.logo_url}
              alt=""
              width={40}
              height={40}
              className="navbar-brand-logo"
            />
            <span className="navbar-org-name" title={org.name}>
              {org.name.toLocaleUpperCase("pt-BR")}
            </span>
          </Link>

          <NavbarNavLinks />

          <div className="navbar-float-end">
            <div className="navbar-float-social hidden lg:block">
              <NavbarSocial org={org} />
            </div>
            <button
              type="button"
              className="navbar-menu-btn lg:hidden"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeWidth={2.2} d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeWidth={2.2} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={`navbar-float-menu${mobileOpen ? " is-open" : ""}`}
          aria-hidden={!mobileOpen}
        >
          <nav aria-label="Menu">
            <ul className="navbar-float-menu-list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`nav-link-mobile${
                      isNavLinkActive(pathname, link.href) ? " active" : ""
                    }`}
                    tabIndex={mobileOpen ? 0 : -1}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {mobileOpen ? (
        <button
          type="button"
          className="navbar-float-backdrop lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </>
  );
}
