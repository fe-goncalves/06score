"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityAvatar } from "@/components/ui/EntityAvatar";
import {
  formatBidCompetitionName,
  formatBidEditionOptionLabel,
  groupBidCompetitions,
} from "@/lib/bid/format";
import type { BidEdition } from "@/lib/types";

interface BidEditionPickerProps {
  editions: BidEdition[];
  selectedCompetitionId: string | null;
  selectedEditionId: string | null;
}

export function BidEditionPicker({
  editions,
  selectedCompetitionId,
  selectedEditionId,
}: BidEditionPickerProps) {
  const router = useRouter();
  const compListId = useId();
  const editionListId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const prevCompetitionIdRef = useRef<string | null>(null);

  const competitions = useMemo(() => groupBidCompetitions(editions), [editions]);

  const selectedCompetition =
    competitions.find((group) => group.competitionId === selectedCompetitionId) ??
    null;

  const selectedEdition =
    editions.find((edition) => edition.id === selectedEditionId) ?? null;

  const [compOpen, setCompOpen] = useState(false);
  const [editionOpen, setEditionOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCompetitions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return competitions;
    return competitions.filter((group) =>
      formatBidCompetitionName(group).toLowerCase().includes(normalized),
    );
  }, [competitions, query]);

  useEffect(() => {
    if (
      selectedCompetitionId &&
      selectedCompetitionId !== prevCompetitionIdRef.current &&
      !selectedEditionId
    ) {
      setEditionOpen(true);
    }
    prevCompetitionIdRef.current = selectedCompetitionId;
  }, [selectedCompetitionId, selectedEditionId]);

  useEffect(() => {
    if (!compOpen && !editionOpen) return;

    const timer = window.setTimeout(() => {
      if (compOpen) searchRef.current?.focus();
    }, 0);

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setCompOpen(false);
        setEditionOpen(false);
        setQuery("");
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCompOpen(false);
        setEditionOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [compOpen, editionOpen]);

  function selectCompetition(competitionId: string) {
    setCompOpen(false);
    setEditionOpen(true);
    setQuery("");
    router.push(`/bid?competicao=${competitionId}`);
  }

  function selectEdition(editionId: string) {
    setEditionOpen(false);
    setQuery("");
    router.push(`/bid?edicao=${editionId}`);
  }

  return (
    <div ref={rootRef} className="bid-picker-toolbar">
      <div
        className={`bid-edition-picker bid-competition-picker${compOpen ? " bid-edition-picker-open" : ""}`}
      >
        <span id={`${compListId}-label`} className="bid-toolbar-label">
          Campeonato
        </span>

        <button
          type="button"
          className="bid-edition-trigger"
          aria-haspopup="listbox"
          aria-expanded={compOpen}
          aria-labelledby={`${compListId}-label`}
          disabled={!competitions.length}
          onClick={() => {
            setEditionOpen(false);
            setCompOpen((value) => !value);
          }}
        >
          {selectedCompetition ? (
            <>
              <EntityAvatar
                kind="competition"
                src={selectedCompetition.competitionLogoUrl}
                alt=""
                size={28}
                className="bid-edition-trigger-logo"
              />
              <span className="bid-edition-trigger-label">
                {formatBidCompetitionName(selectedCompetition)}
              </span>
            </>
          ) : (
            <span className="bid-edition-trigger-placeholder">
              Selecionar campeonato…
            </span>
          )}
          <span className="bid-edition-trigger-chevron" aria-hidden>
            {compOpen ? "▴" : "▾"}
          </span>
        </button>

        {compOpen ? (
          <div className="bid-edition-menu">
            <div className="bid-edition-search-wrap">
              <input
                ref={searchRef}
                type="search"
                className="bid-edition-search"
                placeholder="Pesquisar campeonato…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-controls={compListId}
                autoComplete="off"
              />
            </div>

            <ul
              id={compListId}
              className="bid-edition-options"
              role="listbox"
              aria-labelledby={`${compListId}-label`}
            >
              {filteredCompetitions.length ? (
                filteredCompetitions.map((group) => {
                  const isActive = group.competitionId === selectedCompetitionId;
                  return (
                    <li key={group.competitionId} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`bid-edition-option${isActive ? " bid-edition-option-active" : ""}`}
                        onClick={() => selectCompetition(group.competitionId)}
                      >
                        <EntityAvatar
                          kind="competition"
                          src={group.competitionLogoUrl}
                          alt=""
                          size={32}
                          className="bid-edition-option-logo"
                        />
                        <span className="bid-edition-option-label">
                          {formatBidCompetitionName(group)}
                        </span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="bid-edition-no-results" role="presentation">
                  Nenhum campeonato encontrado.
                </li>
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {selectedCompetition ? (
        <div
          className={`bid-edition-picker bid-edition-secondary-picker${editionOpen ? " bid-edition-picker-open" : ""}`}
        >
          <span id={`${editionListId}-label`} className="bid-toolbar-label">
            Edição
          </span>

          <button
            type="button"
            className="bid-edition-trigger"
            aria-haspopup="listbox"
            aria-expanded={editionOpen}
            aria-labelledby={`${editionListId}-label`}
            onClick={() => {
              setCompOpen(false);
              setEditionOpen((value) => !value);
            }}
          >
            <span className="bid-edition-trigger-label">
              {selectedEdition &&
              selectedEdition.competitionId === selectedCompetition.competitionId
                ? formatBidEditionOptionLabel(selectedEdition)
                : "Selecionar edição…"}
            </span>
            <span className="bid-edition-trigger-chevron" aria-hidden>
              {editionOpen ? "▴" : "▾"}
            </span>
          </button>

          {editionOpen ? (
            <div className="bid-edition-menu">
              <ul
                id={editionListId}
                className="bid-edition-options"
                role="listbox"
                aria-labelledby={`${editionListId}-label`}
              >
                {selectedCompetition.editions.map((edition) => {
                  const isActive = edition.id === selectedEditionId;
                  return (
                    <li key={edition.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`bid-edition-option bid-edition-option-edition${isActive ? " bid-edition-option-active" : ""}`}
                        onClick={() => selectEdition(edition.id)}
                      >
                        <span className="bid-edition-option-label">
                          {formatBidEditionOptionLabel(edition)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
