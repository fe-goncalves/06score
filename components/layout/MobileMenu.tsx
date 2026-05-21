"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/jogos", label: "JOGOS" },
  { href: "/competicoes", label: "COMPETIÇÕES" },
  { href: "/times", label: "TIMES" },
  { href: "/atletas", label: "ATLETAS" },
  { href: "/ranking", label: "RANKING" },
  { href: "/news", label: "NOTÍCIAS" },
  { href: "/hall-da-fama", label: "HALL DA FAMA" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded border border-white/10"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
      >
        <span
          className={`block h-0.5 w-5 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-5 bg-white transition-opacity ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-5 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="fixed left-0 right-0 top-16 z-50 border-b border-white/10 bg-[#0D0D0D] px-6 py-4">
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-bold tracking-widest text-white/80 hover:text-[var(--color-brand)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
