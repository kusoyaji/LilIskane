"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { searchCopy } from "@/content/search";
import { parseQuery, searchDocs, type ParsedQuery, type SearchDoc, type SearchOutcome } from "@/lib/search";
import type { RankedRow } from "@/lib/search/ai/merge";
import type { AiAnswer, AiState } from "@/lib/search/ai/types";
import {
  buildChips,
  buildFacetGroups,
  cityNamer,
  removeChip as removeChipFrom,
  resolveSearch,
  withCity,
  withPriceCeiling,
  type ChipModel,
  type FacetGroup,
  type QueryState,
} from "@/components/search-concierge/parts/model";
import {
  EMPTY_EXTRA,
  isEmptyExtra,
  merge,
  reconcile,
  removeRegion as removeRegionFrom,
  removeValue as removeValueFrom,
  type Extra,
  type ValueField,
} from "@/components/search-concierge/query-state";
import { useAiSearch } from "@/components/search-concierge/useAiSearch";
import { MAP_ID, RESULTS_ID } from "./ids";
import { keepInPlace, pulse } from "./motion";

/**
 * The home's one search.
 *
 * Three ways in write into the same state: words (the hero's concierge field),
 * place (the map), monthly payment (the budget finder). The text the visitor
 * typed stays the source of truth for what it says; picked values live in
 * `extra` beside it — the same model as the header overlay
 * (search-concierge/query-state.ts), so chips behave identically everywhere.
 * The AI, when it has answered the current text, folds in through the same
 * rules as in the overlay (search-concierge/parts/model.ts).
 *
 * Every count on the page — the hero's live answer, the results heading, the
 * map's pins and panel, the budget finder — is taken from `rows`, or from
 * `preview()` for "what would this button give", which runs the very same
 * pipeline on the state the button would produce. They cannot disagree.
 */
export type HomeSearch = {
  locale: Locale;
  docs: SearchDoc[];
  raw: string;
  extra: Extra;
  /** merge(parseQuery(raw), extra) — what the visitor said and picked. */
  userQuery: ParsedQuery;
  /** What the ranker saw: the visitor's query plus the AI's filters, when it has answered this text. */
  query: ParsedQuery;
  /** The instant engine's outcome for the visitor's query (what the AI layer is told). */
  instant: SearchOutcome;
  /** The outcome behind `rows` (with the AI's filters folded in). */
  outcome: SearchOutcome;
  /** willAsk: the concierge will be asked about this text (its place can be kept ready). */
  ai: { state: AiState; answer: AiAnswer | null; ask: () => void; willAsk: boolean };
  /** Display order: the AI's picks first when it has answered this exact text, then the instant hits. */
  rows: RankedRow[];
  /** True when nothing had to be widened. */
  exact: boolean;
  /** Distinct cities among `rows`. */
  cityCount: number;
  /** The understood values, one chip each (AI ones marked). */
  chips: ChipModel[];
  /** Quick pickers / filter groups, with the count each choice would give. */
  facets: FacetGroup[];
  /** Label of a price ceiling set by the budget finder, e.g. "≤ 1 057 000 DH · 6 000 DH/mois". */
  priceLabel: string | null;
  /** Whether anything at all is asked. */
  active: boolean;
  setRaw: (raw: string) => void;
  setExtra: (extra: Extra) => void;
  /** Apply a state produced by a facet toggle (query-state helpers). */
  apply: (next: QueryState) => void;
  removeValue: (field: ValueField, value: string | number) => void;
  removeRegion: () => void;
  removeChip: (chip: ChipModel) => void;
  /** From the map: show this city's programmes (null clears the city filter). */
  setCity: (cityId: string | null) => void;
  /** From the budget finder: its computed "Prix accessible jusqu'à". */
  setPriceCeiling: (price: number | null, label?: string | null) => void;
  /** What the page would show after `setCity` / `setPriceCeiling` — without doing it. */
  preview: (patch: { city?: string | null; price?: number | null }) => { rows: RankedRow[]; exact: boolean };
  clear: () => void;
  /** Smooth-scroll to the results and move focus to their heading. */
  showResults: () => void;
  /** Smooth-scroll to the map. */
  showMap: () => void;
};

const HomeSearchContext = createContext<HomeSearch | null>(null);

export { MAP_ID, RESULTS_ID };

const NO_DISMISSED: ReadonlySet<string> = new Set();

type Lenis = {
  scrollTo: (
    target: HTMLElement | number,
    options?: { offset?: number; duration?: number; immediate?: boolean; onComplete?: () => void },
  ) => void;
};

/**
 * Scroll to a section once the state change that asked for it has been laid
 * out (two frames): a city or a ceiling set on the way changes the height of
 * what sits above the target, and a position measured before would land short.
 */
function scrollToSection(id: string, focusHeading: boolean) {
  requestAnimationFrame(() => requestAnimationFrame(() => scrollNow(id, focusHeading)));
}

/** A scroll to a section (showResults / showMap) is under way: it re-aims itself on landing. */
let aiming = 0;
export function isAiming(): boolean {
  return aiming > 0;
}

function scrollNow(id: string, focusHeading: boolean) {
  const target = document.getElementById(id);
  if (!target) return;
  aiming += 1;
  let landed = false;
  // A glide the visitor interrupts never "completes": stop counting it as ours anyway.
  window.setTimeout(() => {
    if (landed) return;
    landed = true;
    aiming = Math.max(0, aiming - 1);
  }, 1800);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  // Something above may change height on the way (the concierge's answer landing in the hero):
  // once there, re-aim so the section really starts under the header.
  const reaim = () => {
    const off = target.getBoundingClientRect().top - navH;
    if (Math.abs(off) <= 2) return;
    if (lenis) lenis.scrollTo(window.scrollY + off, { immediate: true });
    else window.scrollTo({ top: window.scrollY + off, behavior: "instant" as ScrollBehavior });
  };
  // Landed: the results' count pulses once, so the eye finds the figure the
  // button promised (the budget's "Voir les 17 programmes" → "17 programmes").
  const land = () => {
    if (landed) return;
    landed = true;
    aiming = Math.max(0, aiming - 1);
    reaim();
    if (focusHeading) pulse(target.querySelector("[data-results-count]"), 1.12, 320);
  };
  if (lenis && !reduced) lenis.scrollTo(target, { offset: -navH, duration: 1.1, onComplete: land });
  else {
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: reduced ? "auto" : "smooth" });
    window.setTimeout(land, reduced ? 50 : 900);
  }
  if (focusHeading) target.querySelector<HTMLElement>("[data-results-heading], h2")?.focus({ preventScroll: true });
}

type Anchor = { el: Element; top: number; scrollY: number };

/**
 * The home's block (one of the grounds: hero, results, map, budget — or the
 * footer) under the middle of the screen, with its place in the page.
 */
function pickAnchor(): Anchor | null {
  const hero = document.querySelector("section[data-nav-media]");
  const ground = hero?.parentElement;
  const blocks = [...(ground?.parentElement?.children ?? []), ...document.querySelectorAll("footer")];
  const mid = window.innerHeight / 2;
  for (const el of blocks) {
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) return { el, top: r.top + window.scrollY, scrollY: window.scrollY };
  }
  return null;
}

export function HomeSearchProvider({
  locale,
  docs,
  children,
}: {
  locale: Locale;
  docs: SearchDoc[];
  children: ReactNode;
}) {
  const c = searchCopy[locale];
  const [raw, setRawState] = useState("");
  const [extra, setExtraState] = useState<Extra>(EMPTY_EXTRA);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(NO_DISMISSED);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);

  const parsed = useMemo(() => parseQuery(raw), [raw]);
  const userQuery = useMemo(() => merge(parsed, extra), [parsed, extra]);
  const instant = useMemo(() => searchDocs(docs, userQuery), [docs, userQuery]);
  const aiHook = useAiSearch({ raw, locale, instant });
  const answer = aiHook.forQuery === raw && raw.trim() !== "" ? aiHook.answer : null;
  const resolved = useMemo(
    () => resolveSearch(docs, userQuery, extra, answer, dismissed),
    [docs, userQuery, extra, answer, dismissed],
  );
  const active = raw.trim() !== "" || !isEmptyExtra(extra);
  // Nothing asked: the catalogue in its own order (the ranker's neutral
  // order is by price, which the sort toggle already offers).
  const rows = useMemo(
    () => (active ? resolved.rows : docs.map((doc) => ({ doc, ai: null }))),
    [active, resolved.rows, docs],
  );
  const cityName = useMemo(() => cityNamer(docs, locale), [docs, locale]);

  const chips = useMemo(
    () => buildChips({ user: userQuery, final: resolved.query, raw, parsed, extra, locale, c, cityName, priceLabel }),
    [userQuery, resolved.query, raw, parsed, extra, locale, c, cityName, priceLabel],
  );
  const facets = useMemo(
    () => buildFacetGroups({ docs, query: resolved.query, raw, extra, locale, c, cityName }),
    [docs, resolved.query, raw, extra, locale, c, cityName],
  );

  const apply = useCallback((next: QueryState) => {
    setRawState(next.raw);
    setExtraState(next.extra);
    if (!next.raw.trim() && isEmptyExtra(next.extra)) {
      setDismissed(NO_DISMISSED);
      setPriceLabel(null);
    }
  }, []);

  const setRaw = useCallback((next: string) => {
    setRawState(next);
    setExtraState((current) => reconcile(parseQuery(next), current));
    if (!next.trim()) setDismissed(NO_DISMISSED);
  }, []);

  const preview = useCallback(
    (patch: { city?: string | null; price?: number | null }) => {
      let next: QueryState = { raw, extra };
      if ("city" in patch) next = withCity(next, patch.city ?? null);
      if ("price" in patch) next = withPriceCeiling(next, patch.price ?? null);
      const sameText = next.raw === raw;
      const user = merge(sameText ? parsed : parseQuery(next.raw), next.extra);
      const r = resolveSearch(docs, user, next.extra, sameText ? answer : null, dismissed);
      return { rows: r.rows, exact: r.outcome.exact };
    },
    [raw, extra, parsed, docs, answer, dismissed],
  );

  /* ----------------------------------------------------------- anchor ---- */
  // The answer can change with no keystroke at all — the concierge lands
  // seconds after the visitor stopped typing, by which time they may be on
  // the results, the map, the budget or the footer. Every section reads this
  // one search, so any of them above the reader can change height in that
  // commit. This effect runs after all of theirs (a parent's layout effects
  // run after its children's): it finds the block the reader had at the
  // middle of the screen, sees how far it moved in the page, and moves the
  // scroll by the same amount before anything is painted — what they are
  // reading stays still (manual scroll anchoring; the native one is undone
  // by the smooth-scroll's own writes). Our own scrolls to a section re-aim
  // themselves instead.
  //
  // The browser's own scroll anchoring is switched off on this page: it
  // would move the scroll for the same change during layout, and this effect
  // would then add the same delta again (the page jumped by twice the change).
  // The browser may also have clamped the scroll to the new, shorter page
  // before this runs: the correction starts from the scroll the anchor was
  // read at, unless a smoothed glide is legitimately moving it.
  const anchor = useRef<Anchor | null>(null);
  useLayoutEffect(() => {
    const held = anchor.current;
    if (held && held.el.isConnected && !isAiming()) {
      const delta = held.el.getBoundingClientRect().top + window.scrollY - held.top;
      if (Math.abs(delta) >= 1) keepInPlace(delta, held.scrollY);
    }
    anchor.current = pickAnchor();
  });
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflowAnchor;
    html.style.overflowAnchor = "none";
    return () => {
      html.style.overflowAnchor = before;
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => (anchor.current = pickAnchor()));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const value: HomeSearch = {
    locale,
    docs,
    raw,
    extra,
    userQuery,
    query: resolved.query,
    instant,
    outcome: resolved.outcome,
    ai: { state: aiHook.state, answer, ask: aiHook.ask, willAsk: aiHook.willAsk },
    rows,
    exact: resolved.outcome.exact,
    cityCount: new Set(rows.map((row) => row.doc.cityId)).size,
    chips,
    facets,
    priceLabel,
    active,
    setRaw,
    setExtra: setExtraState,
    apply,
    removeValue: (field, v) => {
      const next = removeValueFrom(raw, extra, field, v);
      apply(next);
      setDismissed((d) => new Set(d).add(`${field}:${v}`));
      if (field === "priceMax") setPriceLabel(null);
    },
    removeRegion: () => apply(removeRegionFrom(raw, extra)),
    removeChip: (chip) => {
      const next = removeChipFrom(chip, { raw, extra }, dismissed);
      apply(next);
      setDismissed(next.dismissed);
      if (chip.field === "priceMax") setPriceLabel(null);
    },
    setCity: (cityId) => apply(withCity({ raw, extra }, cityId)),
    setPriceCeiling: (price, label = null) => {
      apply(withPriceCeiling({ raw, extra }, price));
      setPriceLabel(price === null ? null : label);
    },
    preview,
    clear: () => {
      setRawState("");
      setExtraState(EMPTY_EXTRA);
      setDismissed(NO_DISMISSED);
      setPriceLabel(null);
    },
    showResults: () => scrollToSection(RESULTS_ID, true),
    showMap: () => scrollToSection(MAP_ID, false),
  };

  return <HomeSearchContext.Provider value={value}>{children}</HomeSearchContext.Provider>;
}

export function useHomeSearch(): HomeSearch {
  const value = useContext(HomeSearchContext);
  if (!value) throw new Error("useHomeSearch must be used inside <HomeSearchProvider>");
  return value;
}
