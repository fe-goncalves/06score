"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { OrgLogo } from "@/components/ui/OrgLogo";
import { useFilterMenuPosition } from "@/lib/hooks/useFilterMenuPosition";

export interface HubFilterOption {
  id: string;
  label: string;
  logoUrl?: string | null;
}

interface AthleteHubFilterProps {
  /** Rótulo acessível (sem texto visível acima do campo). */
  ariaLabel: string;
  value: string;
  options: HubFilterOption[];
  onChange: (id: string) => void;
  allLabel?: string;
  disabled?: boolean;
  /** Exibe logo no gatilho e nas opções (Clube, Competição). */
  showLogo?: boolean;
  /** Campo de busca interno no dropdown. */
  searchable?: boolean;
  searchPlaceholder?: string;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function AthleteHubFilter({
  ariaLabel,
  value,
  options,
  onChange,
  allLabel = "Todos",
  disabled = false,
  showLogo = true,
  searchable = false,
  searchPlaceholder = "Buscar…",
}: AthleteHubFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const searchId = useId();
  const menuStyle = useFilterMenuPosition(open, rootRef);

  const selected =
    value === "all"
      ? { id: "all", label: allLabel, logoUrl: null }
      : options.find((o) => o.id === value) ?? {
          id: value,
          label: ariaLabel,
          logoUrl: null,
        };

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = normalizeSearch(search);
    return options.filter((opt) => normalizeSearch(opt.label).includes(query));
  }, [options, search, searchable]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    if (searchable) {
      searchRef.current?.focus();
    }
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, searchable]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div
      className={`athlete-hub-filter-field ${disabled ? "athlete-hub-filter-field--disabled" : ""}`}
    >
      <div
        ref={rootRef}
        className={`athlete-comp-filter ${open ? "athlete-comp-filter--open" : ""} ${!showLogo ? "athlete-comp-filter--no-logo" : ""}`}
      >
        <button
          type="button"
          className="athlete-comp-filter-trigger"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
        >
          <span className="athlete-comp-filter-trigger-inner">
            {showLogo &&
              (selected.logoUrl ? (
                <OrgLogo
                  src={selected.logoUrl}
                  size={20}
                  className="athlete-comp-filter-logo"
                />
              ) : (
                <span className="athlete-comp-filter-logo athlete-comp-filter-logo--ph" />
              ))}
            <span className="athlete-comp-filter-label">{selected.label}</span>
          </span>
          <span className="athlete-comp-filter-chevron" aria-hidden>
            {open ? "▴" : "▾"}
          </span>
        </button>

        {open && (
          <div
            className="athlete-comp-filter-menu athlete-comp-filter-menu--floating"
            style={menuStyle}
          >
            {searchable ? (
              <div className="athlete-comp-filter-search-wrap">
                <label htmlFor={searchId} className="sr-only">
                  {searchPlaceholder}
                </label>
                <input
                  ref={searchRef}
                  id={searchId}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="athlete-comp-filter-search"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : null}
            <ul id={listId} role="listbox">
              <li role="option" aria-selected={value === "all"}>
                <button
                  type="button"
                  className={`athlete-comp-filter-option ${value === "all" ? "athlete-comp-filter-option--active" : ""}`}
                  onClick={() => pick("all")}
                >
                  <span className="athlete-comp-filter-option-label">{allLabel}</span>
                </button>
              </li>
              {filteredOptions.map((opt) => (
                <li key={opt.id} role="option" aria-selected={value === opt.id}>
                  <button
                    type="button"
                    className={`athlete-comp-filter-option ${value === opt.id ? "athlete-comp-filter-option--active" : ""}`}
                    onClick={() => pick(opt.id)}
                  >
                    {showLogo &&
                      (opt.logoUrl ? (
                        <OrgLogo
                          src={opt.logoUrl}
                          size={20}
                          className="athlete-comp-filter-logo"
                        />
                      ) : (
                        <span className="athlete-comp-filter-logo athlete-comp-filter-logo--ph" />
                      ))}
                    <span className="athlete-comp-filter-option-label">{opt.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
