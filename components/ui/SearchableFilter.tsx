"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OrgImage } from "@/components/ui/OrgImage";

export type SearchableOption = {
  id: string;
  label: string;
  logoUrl?: string | null;
};

interface SearchableFilterProps {
  label: string;
  value: string;
  options: SearchableOption[];
  onChange: (id: string) => void;
  allLabel?: string;
}

export function SearchableFilter({
  label,
  value,
  options,
  onChange,
  allLabel = "Todas",
}: SearchableFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);
  const selectedLabel =
    value === "all" ? allLabel : (selected?.label ?? allLabel);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectOption(id: string) {
    if (id !== "all" && id === value) {
      onChange("all");
    } else {
      onChange(id);
    }
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="searchable-filter">
      <span className="searchable-filter-label">{label}</span>
      <button
        type="button"
        className="searchable-filter-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
      >
        <span className="searchable-filter-trigger-inner">
          {selected?.logoUrl ? (
            <OrgImage
              src={selected.logoUrl}
              alt=""
              width={16}
              height={16}
              className="searchable-filter-option-logo"
            />
          ) : null}
          <span>{selectedLabel}</span>
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M2.5 3.75L5 6.25L7.5 3.75"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div className="searchable-filter-menu" role="listbox">
          <input
            type="search"
            className="searchable-filter-search"
            placeholder="Pesquisar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className={`searchable-filter-option ${value === "all" ? "searchable-filter-option--active" : ""}`}
            onClick={() => selectOption("all")}
          >
            {allLabel}
          </button>
          {filtered.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`searchable-filter-option ${value === opt.id ? "searchable-filter-option--active" : ""}`}
              onClick={() => selectOption(opt.id)}
            >
              {opt.logoUrl ? (
                <OrgImage
                  src={opt.logoUrl}
                  alt=""
                  width={18}
                  height={18}
                  className="searchable-filter-option-logo"
                />
              ) : null}
              <span>{opt.label}</span>
            </button>
          ))}
          {!filtered.length ? (
            <p className="searchable-filter-empty">Nenhum resultado</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
