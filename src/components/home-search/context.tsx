"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { parseQuery, searchDocs, type ParsedQuery, type SearchDoc, type SearchOutcome } from "@/lib/search";
import { orderWithAi, type RankedRow } from "@/lib/search/ai/merge";
import type { AiAnswer, AiState } from "@/lib/search/ai/types";
import {
  EMPTY_EXTRA,
  merge,
  reconcile,
  removeRegion as removeRegionFrom,
  removeValue as removeValueFrom,
  type Extra,
  type ValueField,
} from "@/components/search-concierge/query-state";
import { useAiSearch } from "@/components/search-concierge/useAiSearch";

/**
 * The home's one search — CONTRACT SKELETON (the home builder completes it;
 * the API below is what the hero, the results, the map and the budget code
 * against, so keep it stable).
 *
 * Three ways in write into the same state: words (the hero's concierge field),
 * place (the map), monthly payment (the budget finder). The text the visitor
 * typed stays the source of truth for what it says; picked values live in
 * `extra` beside it — the same model as the header overlay
 * (search-concierge/query-state.ts), so chips behave identically everywhere.
 */
export type HomeSearch = {
  locale: Locale;
  docs: SearchDoc[];
  raw: string;
  extra: Extra;
  /** merge(parseQuery(raw), extra) — what the ranker sees. */
  query: ParsedQuery;
  instant: SearchOutcome;
  ai: { state: AiState; answer: AiAnswer | null; ask: () => void };
  /** Display order: the AI's picks first when it has answered this exact text, then the instant hits. */
  rows: RankedRow[];
  /** Label of a price ceiling set by the budget finder, e.g. "≤ 1 057 000 DH · 6 000 DH/mois". */
  priceLabel: string | null;
  setRaw: (raw: string) => void;
  setExtra: (extra: Extra) => void;
  removeValue: (field: ValueField, value: string | number) => void;
  removeRegion: () => void;
  /** From the map: show this city's programmes (null clears the city filter). */
  setCity: (cityId: string | null) => void;
  /** From the budget finder: its computed "Prix accessible jusqu'à". */
  setPriceCeiling: (price: number | null, label?: string | null) => void;
  clear: () => void;
  /** Smooth-scroll to the results and move focus to their heading. */
  showResults: () => void;
};

const HomeSearchContext = createContext<HomeSearch | null>(null);

export const RESULTS_ID = "resultats";

export function HomeSearchProvider({
  locale,
  docs,
  children,
}: {
  locale: Locale;
  docs: SearchDoc[];
  children: ReactNode;
}) {
  const [raw, setRawState] = useState("");
  const [extra, setExtra] = useState<Extra>(EMPTY_EXTRA);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);

  const parsed = useMemo(() => parseQuery(raw), [raw]);
  const query = useMemo(() => merge(parsed, extra), [parsed, extra]);
  const instant = useMemo(() => searchDocs(docs, query), [docs, query]);
  const aiHook = useAiSearch({ raw, locale, instant });
  const answer = aiHook.forQuery === raw ? aiHook.answer : null;
  const rows = useMemo(() => orderWithAi(docs, instant.hits, answer), [docs, instant, answer]);

  const setRaw = useCallback(
    (next: string) => {
      setRawState(next);
      setExtra((current) => reconcile(parseQuery(next), current));
    },
    [],
  );

  const value: HomeSearch = {
    locale,
    docs,
    raw,
    extra,
    query,
    instant,
    ai: { state: aiHook.state, answer, ask: aiHook.ask },
    rows,
    priceLabel,
    setRaw,
    setExtra,
    removeValue: (field, v) => {
      const next = removeValueFrom(raw, extra, field, v);
      setRawState(next.raw);
      setExtra(next.extra);
      if (field === "priceMax") setPriceLabel(null);
    },
    removeRegion: () => {
      const next = removeRegionFrom(raw, extra);
      setRawState(next.raw);
      setExtra(next.extra);
    },
    setCity: (cityId) => setExtra((current) => ({ ...current, cities: cityId ? [cityId] : [] })),
    setPriceCeiling: (price, label = null) => {
      setExtra((current) => ({ ...current, priceMax: price }));
      setPriceLabel(price === null ? null : label);
    },
    clear: () => {
      setRawState("");
      setExtra(EMPTY_EXTRA);
      setPriceLabel(null);
    },
    showResults: () => {
      const target = document.getElementById(RESULTS_ID);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.querySelector<HTMLElement>("h2, [data-results-heading]")?.focus({ preventScroll: true });
    },
  };

  return <HomeSearchContext.Provider value={value}>{children}</HomeSearchContext.Provider>;
}

export function useHomeSearch(): HomeSearch {
  const value = useContext(HomeSearchContext);
  if (!value) throw new Error("useHomeSearch must be used inside <HomeSearchProvider>");
  return value;
}
