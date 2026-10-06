"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type RefObject,
} from "react";
import { Lattice } from "@/components/v2/Lattice";
import { AMENITY_LABELS, KIND_LABELS, projectCopy, SEGMENT_LABELS, STATUS_LABELS, statusText } from "@/content/projects";
import { SEARCH_PAGES, searchCopy } from "@/content/search";
import { cityById } from "@/data/cities";
import type { Segment } from "@/data/types";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { formatRange } from "@/lib/format";
import { parseQuery, searchDocs, toProjetsHref, type ParsedQuery, type SearchDoc, type SearchOutcome } from "@/lib/search";
import { STATUS_FACETS, type StatusFacet } from "@/lib/status-facets";
import { loadIndex } from "./index-cache";
import {
  EMPTY_EXTRA,
  hasConstraint,
  isEmptyExtra,
  matchPages,
  merge,
  reconcile,
  regionCities,
  removeRegion,
  removeValue,
  setScalar,
  toggleList,
  type Extra,
  type ListField,
  type ScalarField,
} from "./query-state";
import s from "./ConciergeOverlay.module.css";

type Page = (typeof SEARCH_PAGES)[number];
type Option =
  | { kind: "doc"; key: string; href: string; doc: SearchDoc }
  | { kind: "page"; key: string; href: string; page: Page };

type Chip = { key: string; label: string; remove: () => { raw: string; extra: Extra } };
type FacetChip = { key: string; label: string; count: number; on: boolean; toggle: () => { raw: string; extra: Extra } };
type FacetGroup = { id: string; title: string; chips: FacetChip[] };

const BUDGETS = [600_000, 900_000, 1_500_000];
const MONTHLY = [4_000, 6_000];
const BEDROOMS = [1, 2, 3, 4];
const LENIS = () => (window as Window & { __lenis?: { stop(): void; start(): void } }).__lenis;

function statusFacetLabel(facet: StatusFacet, locale: Locale): string {
  if (facet === "immediate") return projectCopy[locale].readyNow;
  if (facet === "imminente") return statusText({ status: "en-construction", readySoon: true }, locale);
  return STATUS_LABELS[facet][locale];
}

/**
 * The concierge: a full-screen search on the ink ground.
 *
 * The visitor writes the way they talk ("3 chambres à Agadir moins de 1,2
 * million", "شقة في مراكش مع مسبح"); the field is parsed on every keystroke
 * (`@/lib/search`), the understood values appear as ochre chips, and the 23
 * programmes are re-ranked client-side — nothing waits on a server.
 *
 * Built like GalleryLightbox: a native `<dialog>` with `showModal()` (top
 * layer, focus trap, inert page, Escape), `data-lenis-prevent`, the root's
 * overflow held in a ref and released on close AND on unmount, and focus handed
 * back to whatever opened it. The field is an ARIA combobox driving a listbox
 * through `aria-activedescendant`; a polite live region says how many match.
 */
export function ConciergeOverlay({
  locale,
  open,
  nonce,
  onClosed,
  returnTo,
}: {
  locale: Locale;
  open: boolean;
  nonce: number;
  onClosed: () => void;
  returnTo: RefObject<HTMLElement | null>;
}) {
  const c = searchCopy[locale];
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  /** The root's inline overflow and background from before the lock, or null while unlocked. */
  const locked = useRef<{ overflow: string; background: string } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [raw, setRaw] = useState("");
  const [extra, setExtra] = useState<Extra>(EMPTY_EXTRA);
  const [active, setActive] = useState(-1);
  const [pending, setPending] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [phIndex, setPhIndex] = useState(0);
  const [animatedPh, setAnimatedPh] = useState(false);
  const [announce, setAnnounce] = useState("");

  /* ------------------------------------------------------ index loading ---- */
  useEffect(() => {
    if (!open || docs || failed) return;
    let live = true;
    loadIndex(locale)
      .then((index) => live && setDocs(index))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [open, docs, failed, locale]);

  /* ------------------------------------------------ dialog, lock, focus ---- */
  const unlock = useCallback(() => {
    if (locked.current === null) return;
    const root = document.documentElement;
    root.style.overflow = locked.current.overflow;
    root.style.backgroundColor = locked.current.background;
    root.style.scrollbarGutter = "";
    locked.current = null;
    LENIS()?.start();
  }, []);

  const focusField = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    input.select();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      // Locked separately from showModal(): a remount while open (React's dev
      // double-invoke, Fast Refresh) runs the unmount release, and the lock
      // must come back even though the dialog is already open.
      if (locked.current === null) {
        const root = document.documentElement;
        locked.current = { overflow: root.style.overflow, background: root.style.backgroundColor };
        root.style.overflow = "hidden";
        // Keep the space of the (classic, Windows) scrollbar the lock
        // removes, so the page behind the fading dialog does not jump. The
        // top layer does not cover that gutter, so the root's own ground is
        // turned to ink for as long as the overlay is up.
        root.style.scrollbarGutter = "stable";
        root.style.backgroundColor = "var(--color-ink)";
        // Lenis drives the wheel itself: overflow alone would let the page
        // glide on underneath.
        LENIS()?.stop();
      }
      focusField();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, focusField]);

  // A shortcut pressed while already open brings focus back to the field.
  useEffect(() => {
    if (open) focusField();
  }, [nonce, open, focusField]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      unlock();
      setPending(null);
      setMobileGroup(null);
      onClosed();
      // Native <dialog> already restores focus to what was focused before
      // showModal(); this covers an opener that is gone (the mobile menu row:
      // the menu closed as search opened) by handing focus to its stand-in.
      const target = returnTo.current;
      if (target?.isConnected && target.getClientRects().length) target.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [unlock, onClosed, returnTo]);

  // The route can change under the open overlay (a result was chosen, or the
  // browser's Back): close then. And if the component unmounts without
  // "close" ever firing, the lock must still be released, or the next page
  // inherits overflow: hidden.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);
  useEffect(() => unlock, [unlock]);

  // Phones: size the dialog to the visual viewport, so the footer sits above
  // the on-screen keyboard instead of behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    const vv = window.visualViewport;
    if (!open || !dialog || !vv || !window.matchMedia("(pointer: coarse)").matches) return;
    const sync = () => {
      dialog.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
      dialog.style.setProperty("--vvt", `${Math.round(vv.offsetTop)}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      dialog.style.removeProperty("--vvh");
      dialog.style.removeProperty("--vvt");
    };
  }, [open]);

  /* ------------------------------------------------- cycling placeholder ---- */
  useEffect(() => {
    setAnimatedPh(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (!open || raw || !animatedPh) return;
    const id = window.setInterval(() => setPhIndex((i) => (i + 1) % c.placeholders.length), 3200);
    return () => window.clearInterval(id);
  }, [open, raw, animatedPh, c.placeholders.length]);

  /* -------------------------------------------------------------- query ---- */
  const deferredRaw = useDeferredValue(raw);
  const deferredExtra = useDeferredValue(extra);
  const parsed = useMemo(() => parseQuery(deferredRaw), [deferredRaw]);
  const pages = useMemo(() => matchPages(deferredRaw), [deferredRaw]);
  const query: ParsedQuery = useMemo(() => {
    const merged = merge(parsed, deferredExtra);
    return { ...merged, text: merged.text.filter((w) => !pages.words.has(w)) };
  }, [parsed, deferredExtra, pages]);

  const hasQuery = deferredRaw.trim() !== "" || !isEmptyExtra(deferredExtra);
  const constrained = hasConstraint(query);
  const outcome: SearchOutcome | null = useMemo(
    () => (docs && constrained ? searchDocs(docs, query) : null),
    [docs, constrained, query],
  );

  const mode: "browse" | "results" | "pages" = !hasQuery
    ? "browse"
    : constrained
      ? "results"
      : pages.ids.length
        ? "pages"
        : "browse";

  const docList: SearchDoc[] = useMemo(() => {
    if (!docs) return [];
    if (mode === "results") return outcome ? outcome.hits.map((hit) => hit.doc) : [];
    if (mode === "pages") return [];
    return docs;
  }, [docs, mode, outcome]);

  const pageList: Page[] = useMemo(() => {
    if (!hasQuery) return SEARCH_PAGES;
    return SEARCH_PAGES.filter((page) => pages.ids.includes(page.id));
  }, [hasQuery, pages]);

  const options: Option[] = useMemo(() => {
    const docOpts: Option[] = docList.map((doc) => ({
      kind: "doc",
      key: doc.slug,
      href: `/${locale}/projets/${doc.slug}`,
      doc,
    }));
    const pageOpts: Option[] = pageList.map((page) => ({
      kind: "page",
      key: `page-${page.id}`,
      href: `/${locale}${page.path}`,
      page,
    }));
    return mode === "results" ? [...docOpts, ...pageOpts] : [...pageOpts, ...docOpts];
  }, [docList, pageList, mode, locale]);

  const optionId = (key: string) => `${uid}-o-${key}`;
  const exact = outcome ? outcome.exact : true;
  const matchCount = mode === "results" ? (exact ? docList.length : null) : (docs?.length ?? null);
  const mapHref = toProjetsHref(query, locale);

  // A new query puts the first answer under Enter, as in any command palette.
  const queryKey = `${deferredRaw}\u0000${JSON.stringify(deferredExtra)}`;
  useEffect(() => {
    setActive(hasQuery && options.length ? 0 : -1);
    bodyRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, docs]);
  useEffect(() => {
    if (active >= options.length) setActive(options.length ? options.length - 1 : -1);
  }, [active, options.length]);

  // Keep the active row visible, and warm its route.
  const activeOption = active >= 0 ? options[active] : undefined;
  useEffect(() => {
    if (!activeOption) return;
    document.getElementById(optionId(activeOption.key))?.scrollIntoView({ block: "nearest" });
    const timer = window.setTimeout(() => router.prefetch(activeOption.href), 120);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOption?.key]);

  // Announced politely, after typing settles, so a screen reader is not
  // interrupted on every keystroke.
  const message = !docs || !hasQuery || mode !== "results" ? "" : exact ? c.count(docList.length, formatNumber(docList.length, locale)) : c.countRelaxed;
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setAnnounce(message), 450);
    return () => window.clearTimeout(timer);
  }, [message, open]);

  /* ------------------------------------------------------------ actions ---- */
  const apply = useCallback((next: { raw: string; extra: Extra }) => {
    setRaw(next.raw);
    setExtra(next.extra);
  }, []);

  const applyAndRefocus = (next: { raw: string; extra: Extra }) => {
    apply(next);
    inputRef.current?.focus({ preventScroll: true });
  };

  const onType = (value: string) => {
    setRaw(value);
    setExtra((current) => reconcile(parseQuery(value), current));
  };

  const go = (href: string) => {
    const target = new URL(href, window.location.href);
    if (target.pathname === window.location.pathname) {
      // Same page (a hash, or /projets with new filters): nothing will change
      // the pathname, so close now.
      dialogRef.current?.close();
      router.push(href);
      return;
    }
    setPending(href);
    startTransition(() => router.push(href));
  };

  const choose = (option: Option, event?: React.MouseEvent) => {
    if (event && (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1)) {
      window.open(option.href, "_blank", "noopener");
      return;
    }
    go(option.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    const n = options.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (n) setActive((i) => (i + 1) % n);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (n) setActive((i) => (i <= 0 ? n - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeOption) choose(activeOption);
      else if (hasQuery) go(mapHref);
    }
  };

  // The input's own scroll (long queries) is mirrored by the highlight layer.
  const syncMirror = () => {
    if (mirrorRef.current && inputRef.current) mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
  };
  useEffect(syncMirror, [raw]);

  /* -------------------------------------------------------------- chips ---- */
  const cityName = useCallback(
    (id: string) =>
      docs?.find((doc) => doc.cityId === id)?.city[locale] ?? cityById.get(id)?.name[locale] ?? id,
    [docs, locale],
  );

  const chips: Chip[] = useMemo(() => {
    const out: Chip[] = [];
    const fromRegion = query.region ? regionCities(deferredRaw, parsed) : [];
    if (query.region) {
      out.push({ key: `region-${query.region}`, label: c.regions[query.region], remove: () => removeRegion(raw, extra) });
    }
    for (const id of query.cities) {
      if (fromRegion.includes(id)) continue;
      out.push({ key: `city-${id}`, label: cityName(id), remove: () => removeValue(raw, extra, "cities", id) });
    }
    for (const kind of query.kinds) {
      out.push({ key: `kind-${kind}`, label: KIND_LABELS[kind][locale], remove: () => removeValue(raw, extra, "kinds", kind) });
    }
    for (const seg of query.segments) {
      out.push({ key: `seg-${seg}`, label: SEGMENT_LABELS[seg][locale], remove: () => removeValue(raw, extra, "segments", seg) });
    }
    if (query.bedroomsMin !== null) {
      const n = query.bedroomsMin;
      out.push({
        key: "beds",
        label: c.bedroomsChip(n, isolateRun(String(n), locale)),
        remove: () => removeValue(raw, extra, "bedroomsMin", n),
      });
    }
    if (query.priceMax !== null) {
      const v = query.priceMax;
      out.push({ key: "price", label: c.priceChip(formatNumber(v, locale)), remove: () => removeValue(raw, extra, "priceMax", v) });
    }
    if (query.monthlyMax !== null) {
      const v = query.monthlyMax;
      out.push({ key: "monthly", label: c.monthlyChip(formatNumber(v, locale)), remove: () => removeValue(raw, extra, "monthlyMax", v) });
    }
    for (const st of query.statuses) {
      out.push({ key: `st-${st}`, label: statusFacetLabel(st, locale), remove: () => removeValue(raw, extra, "statuses", st) });
    }
    for (const a of query.amenities) {
      out.push({ key: `am-${a}`, label: AMENITY_LABELS[a][locale], remove: () => removeValue(raw, extra, "amenities", a) });
    }
    return out;
  }, [query, parsed, deferredRaw, raw, extra, c, locale, cityName]);

  /** The parsed spans of the raw text, merged, for the highlight layer under the field. */
  const marks = useMemo(() => {
    const ranges = [...parsed.spans]
      .filter((span) => span.end > span.start && span.end <= deferredRaw.length)
      .sort((a, b) => a.start - b.start)
      .reduce<Array<[number, number]>>((acc, span) => {
        const last = acc[acc.length - 1];
        if (last && span.start <= last[1]) last[1] = Math.max(last[1], span.end);
        else acc.push([span.start, span.end]);
        return acc;
      }, []);
    const parts: Array<{ text: string; mark: boolean }> = [];
    let at = 0;
    for (const [a, b] of ranges) {
      if (a > at) parts.push({ text: deferredRaw.slice(at, a), mark: false });
      parts.push({ text: deferredRaw.slice(a, b), mark: true });
      at = b;
    }
    if (at < deferredRaw.length) parts.push({ text: deferredRaw.slice(at), mark: false });
    return parts;
  }, [parsed.spans, deferredRaw]);
  const showMarks = deferredRaw === raw && marks.some((part) => part.mark);

  /* ------------------------------------------------------------- facets ---- */
  const facetGroups: FacetGroup[] = useMemo(() => {
    if (!docs) return [];
    const count = (q: ParsedQuery) => {
      const result = searchDocs(docs, q);
      return result.exact ? result.hits.length : 0;
    };
    const cityIds = [...new Set(docs.map((doc) => doc.cityId))].sort((a, b) =>
      cityName(a).localeCompare(cityName(b), locale),
    );
    const list = (field: ListField, values: string[], label: (v: string) => string, extraQ: Partial<ParsedQuery> = {}): FacetChip[] =>
      values.map((value) => ({
        key: `${field}-${value}`,
        label: label(value),
        count: count({ ...query, [field]: [value], ...extraQ }),
        on: (query[field] as string[]).includes(value),
        toggle: () => toggleList(raw, extra, merge(parseQuery(raw), extra), field, value),
      }));
    // A scalar replaces the current value (one budget at a time), so its count
    // is what the selection would be with that value instead.
    const scalar = (field: ScalarField, values: number[], label: (v: number) => string): FacetChip[] =>
      values.map((value) => {
        const on = query[field] === value;
        return {
          key: `${field}-${value}`,
          label: label(value),
          count: count({ ...query, [field]: value }),
          on,
          toggle: () => (on ? removeValue(raw, extra, field, value) : setScalar(raw, extra, field, value)),
        };
      });
    const segments = (["haut-standing", "moyen-standing", "economique", "terrain"] as Segment[]).filter((seg) =>
      docs.some((doc) => doc.segment === seg),
    );
    const statuses = STATUS_FACETS.filter((st) => docs.some((doc) => doc.statuses.includes(st)));
    return [
      {
        id: "city",
        title: c.filterCity,
        chips: list("cities", cityIds, cityName, { region: null }),
      },
      { id: "standing", title: c.filterStanding, chips: list("segments", segments, (v) => SEGMENT_LABELS[v as Segment][locale]) },
      { id: "status", title: c.filterStatus, chips: list("statuses", statuses, (v) => statusFacetLabel(v as StatusFacet, locale)) },
      {
        id: "bedrooms",
        title: c.filterBedrooms,
        chips: scalar("bedroomsMin", BEDROOMS, (n) => isolateRun(`${n}+`, locale)),
      },
      {
        id: "budget",
        title: c.filterBudget,
        chips: scalar("priceMax", BUDGETS, (v) => c.priceChip(formatNumber(v, locale))),
      },
      {
        id: "monthly",
        title: c.filterMonthly,
        chips: scalar("monthlyMax", MONTHLY, (v) => c.monthlyChip(formatNumber(v, locale))),
      },
    ];
  }, [docs, query, raw, extra, c, locale, cityName]);

  /* ------------------------------------------------------------- render ---- */
  const relaxedText = (() => {
    if (!outcome || outcome.exact) return null;
    const fields = (outcome.relaxed as string[]).map((f) => c.relaxedFields[f]).filter(Boolean);
    return fields.length ? c.relaxedWidened(fields.join(c.listJoin)) : c.relaxedClosest;
  })();

  const listboxId = `${uid}-listbox`;
  const inputId = `${uid}-input`;

  const renderFacetChip = (chip: FacetChip) => (
    <button
      key={chip.key}
      type="button"
      className={`${s.fchip} u-press`}
      aria-pressed={chip.on}
      data-empty={!chip.on && chip.count === 0 ? "" : undefined}
      onClick={() => applyAndRefocus(chip.toggle())}
    >
      <span>{chip.label}</span>
      <span className={`u-numeric ${s.fcount}`}>{formatNumber(chip.count, locale)}</span>
    </button>
  );

  const docGroupTitle =
    mode === "results"
      ? exact
        ? `${c.programmesTitle} · ${formatNumber(docList.length, locale)}`
        : c.programmesTitle
      : `${c.allProgrammes} · ${formatNumber(docList.length, locale)}`;

  const renderOption = (option: Option, index: number) => {
    const selected = index === active;
    const id = optionId(option.key);
    const common = {
      id,
      role: "option" as const,
      "aria-selected": selected,
      "data-pending": pending === option.href ? "" : undefined,
      onPointerMove: (event: React.PointerEvent) => {
        // A finger dragging the list is scrolling, not pointing.
        if (event.pointerType !== "mouse") return;
        const last = pointer.current;
        pointer.current = { x: event.clientX, y: event.clientY };
        // A row sliding under a still cursor (keyboard scrolling) is not a hover.
        if (last && last.x === event.clientX && last.y === event.clientY) return;
        if (index !== active) setActive(index);
      },
      onPointerEnter: () => router.prefetch(option.href),
      onClick: (event: React.MouseEvent) => choose(option, event),
      onAuxClick: (event: React.MouseEvent) => {
        if (event.button === 1) choose(option, event);
      },
    };

    if (option.kind === "page") {
      const page = option.page;
      return (
        <li key={option.key} {...common} className={s.page} aria-labelledby={`${id}-l`}>
          <span className={s.pageMark} aria-hidden />
          <span className={s.pageText}>
            <span id={`${id}-l`} className={s.pageLabel}>
              {page.label[locale]}
            </span>
            <span className={s.pageHint}>{page.hint[locale]}</span>
          </span>
          <Arrow className={s.pageArrow} />
        </li>
      );
    }

    const doc = option.doc;
    const land = doc.perSqm !== null;
    const delivered = doc.statuses.includes("livre") || doc.statuses.includes("immediate");
    const studioOnly = doc.kinds.length === 1 && doc.kinds[0] === "studio";
    const specs = [
      ...(doc.bedroomsMax > 0
        ? [studioOnly ? c.studio : c.bedrooms(doc.bedroomsMin, doc.bedroomsMax, formatRange(doc.bedroomsMin, doc.bedroomsMax, locale))]
        : []),
      `${formatRange(doc.surfaceMin, doc.surfaceMax, locale)} ${c.sqm}`,
    ];
    return (
      <li key={option.key} {...common} className={s.option} aria-labelledby={`${id}-n ${id}-m ${id}-p`}>
        <span className={s.thumb}>
          <Image
            src={doc.hero.src}
            alt={doc.hero.alt}
            width={doc.hero.width}
            height={doc.hero.height}
            sizes="(max-width: 40rem) 72px, 104px"
            className={s.thumbImg}
            draggable={false}
          />
        </span>
        <span className={s.main}>
          <span id={`${id}-n`} className={`u-display-tight ${s.name}`}>
            {doc.name[locale]}
          </span>
          <span id={`${id}-m`} className={s.place}>
            {doc.city[locale]}
            <span aria-hidden> · </span>
            <span className="u-visually-hidden">, </span>
            {doc.neighbourhood[locale]}
          </span>
          <span className={s.badges}>
            <span className={s.badge} data-status-tone={delivered ? "olive" : "ochre"}>
              <span className={s.dot} aria-hidden />
              {doc.statusLabel}
            </span>
            {doc.readyNow && !doc.statuses.includes("livre") && (
              <span className={s.badge} data-status-tone="olive">
                <span className={s.dot} aria-hidden />
                {projectCopy[locale].readyNow}
              </span>
            )}
            <span className={s.segment}>{SEGMENT_LABELS[doc.segment][locale]}</span>
            {doc.tours > 0 && (
              <span className={s.tour}>
                <TourGlyph />
                {c.tours}
              </span>
            )}
          </span>
        </span>
        <span id={`${id}-p`} className={s.side}>
          {land ? (
            <>
              <span className={`u-numeric ${s.landPrice}`}>{c.landFrom(formatNumber(doc.price, locale))}</span>
              <span className={`u-numeric ${s.spec}`}>{c.landPerSqm(formatNumber(doc.perSqm as number, locale))}</span>
            </>
          ) : (
            <>
              <span className={s.priceLabel}>{c.from}</span>
              <span className={`u-numeric ${s.price}`}>
                {formatNumber(doc.price, locale)} {c.currency}
              </span>
            </>
          )}
          <span className={`u-numeric ${s.spec}`}>{specs.join(" · ")}</span>
        </span>
        <span className={s.progress} aria-hidden />
      </li>
    );
  };

  const docOptions = options.map((o, i) => [o, i] as const).filter(([o]) => o.kind === "doc");
  const pageOptions = options.map((o, i) => [o, i] as const).filter(([o]) => o.kind === "page");

  const pageGroup = pageOptions.length > 0 && (
    <Fragment key="pages">
      <p className={s.groupHead} aria-hidden>
        {hasQuery ? c.pagesTitle : c.quickTitle}
      </p>
      <ul role="group" aria-label={hasQuery ? c.pagesTitle : c.quickTitle} className={s.pages} data-browse={!hasQuery || undefined}>
        {pageOptions.map(([o, i]) => renderOption(o, i))}
      </ul>
    </Fragment>
  );
  const docGroup = docOptions.length > 0 && (
    <Fragment key="docs">
      <p className={s.groupHead} aria-hidden>
        {docGroupTitle}
      </p>
      <ul role="group" aria-label={docGroupTitle} className={s.options}>
        {docOptions.map(([o, i]) => renderOption(o, i))}
      </ul>
    </Fragment>
  );

  const activeFilters = (group: FacetGroup) => group.chips.filter((chip) => chip.on).length;

  return (
    <dialog
      ref={dialogRef}
      className={s.dialog}
      aria-label={c.dialog}
      data-lenis-prevent=""
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className={s.shell}>
        <Lattice cell={34} />

        <div className={s.top}>
          <p className={`u-eyebrow ${s.eyebrow}`}>
            <span className={s.cell} aria-hidden />
            {c.eyebrow}
          </p>
          <button type="button" className={`${s.close} u-press`} onClick={() => dialogRef.current?.close()}>
            <span>{c.close}</span>
            <kbd className={s.kbd} aria-hidden dir="ltr">
              {c.escKey}
            </kbd>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false" className={s.closeGlyph}>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>

        <div className={s.query}>
          <label htmlFor={inputId} className="u-visually-hidden">
            {c.inputLabel}
          </label>
          <div className={s.field}>
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden focusable="false" className={s.fieldGlyph}>
              <circle cx="10.5" cy="10.5" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <div className={s.inputWrap}>
              {showMarks && (
                <div ref={mirrorRef} className={`${s.input} ${s.mirror}`} aria-hidden dir="auto">
                  {marks.map((part, i) =>
                    part.mark ? (
                      <mark key={i} className={s.mark}>
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </div>
              )}
              <input
                ref={inputRef}
                id={inputId}
                className={s.input}
                data-ph={animatedPh && !raw ? "" : undefined}
                type="text"
                dir="auto"
                role="combobox"
                aria-expanded={options.length > 0}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeOption ? optionId(activeOption.key) : undefined}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder={c.placeholders[0]}
                value={raw}
                onChange={(event) => onType(event.target.value)}
                onKeyDown={onKeyDown}
                onScroll={syncMirror}
                onSelect={syncMirror}
              />
              {animatedPh && !raw && (
                <span key={phIndex} className={`${s.input} ${s.ph}`} aria-hidden>
                  {c.placeholders[phIndex]}
                </span>
              )}
            </div>
            {raw || !isEmptyExtra(extra) ? (
              <button
                type="button"
                className={`${s.clear} u-press`}
                onClick={() => applyAndRefocus({ raw: "", extra: EMPTY_EXTRA })}
              >
                <span className="u-visually-hidden">{c.clear}</span>
                <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden focusable="false">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            ) : (
              <span />
            )}
          </div>

          {chips.length > 0 && (
            <div className={s.chipsRow}>
              <span className={`u-eyebrow ${s.chipsLabel}`}>{parsed.spans.length ? c.understood : c.criteria}</span>
              <ul className={s.chips}>
                {chips.map((chip) => (
                  <li key={chip.key} className={s.chip}>
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      className={s.chipX}
                      aria-label={c.removeChip(chip.label)}
                      onClick={() => applyAndRefocus(chip.remove())}
                    >
                      <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden focusable="false">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Phones: the filter panel becomes a row of categories; one opens
              its chips in a second, horizontally scrolling row. */}
          {facetGroups.length > 0 && (
            <div className={s.mobileFilters}>
              <div className={s.mobileCats}>
                {facetGroups.map((group) => {
                  const n = activeFilters(group);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={`${s.cat} u-press`}
                      aria-expanded={mobileGroup === group.id}
                      aria-controls={`${uid}-mf`}
                      data-active={n > 0 || undefined}
                      onClick={() => setMobileGroup((g) => (g === group.id ? null : group.id))}
                    >
                      {group.title}
                      {n > 0 && <span className={`u-numeric ${s.catCount}`}>{formatNumber(n, locale)}</span>}
                      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden focusable="false" className={s.catChevron}>
                        <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </button>
                  );
                })}
              </div>
              <div id={`${uid}-mf`} className={s.mobileChips} hidden={!mobileGroup}>
                {facetGroups.find((g) => g.id === mobileGroup)?.chips.map(renderFacetChip)}
              </div>
            </div>
          )}
        </div>

        <div className={s.body} ref={bodyRef}>
          <div className={s.results}>
            {!hasQuery && (
              <section className={s.ideas} aria-labelledby={`${uid}-ideas`}>
                <h2 id={`${uid}-ideas`} className={`u-eyebrow ${s.sectionHead}`}>
                  {c.ideasTitle}
                </h2>
                <ul className={s.ideaList}>
                  {c.ideas.map((idea) => (
                    <li key={idea}>
                      <button
                        type="button"
                        className={`${s.idea} u-press`}
                        onClick={() => applyAndRefocus({ raw: idea, extra: EMPTY_EXTRA })}
                      >
                        <span aria-hidden className={s.ideaQuote}>
                          “
                        </span>
                        {idea}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {relaxedText && (
              <div className={s.relaxed} role="note">
                <p className={s.relaxedLead}>{c.relaxedLead}</p>
                <p>{relaxedText}</p>
              </div>
            )}

            {failed ? (
              <div className={s.state}>
                <p>{c.failed}</p>
                <button type="button" className={`${s.retry} u-press`} onClick={() => setFailed(false)}>
                  {c.retry}
                </button>
              </div>
            ) : !docs ? (
              <div className={s.loading} aria-busy="true">
                <p className="u-visually-hidden">{c.loading}</p>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={s.skeleton} aria-hidden />
                ))}
              </div>
            ) : null}

            <div id={listboxId} role="listbox" aria-label={c.dialog} className={s.listbox}>
              {mode === "results" ? [docGroup, pageGroup] : [pageGroup, docGroup]}
            </div>
          </div>

          {facetGroups.length > 0 && (
            <aside className={s.aside} aria-labelledby={`${uid}-filters`}>
              <h2 id={`${uid}-filters`} className={`u-eyebrow ${s.sectionHead}`}>
                {c.filtersTitle}
              </h2>
              {facetGroups.map((group) => (
                <section key={group.id} className={s.fgroup} aria-labelledby={`${uid}-fg-${group.id}`}>
                  <h3 id={`${uid}-fg-${group.id}`} className={s.fgroupTitle}>
                    {group.title}
                  </h3>
                  <div className={s.fchips}>{group.chips.map(renderFacetChip)}</div>
                </section>
              ))}
            </aside>
          )}
        </div>

        <div className={s.foot}>
          <a
            href={mapHref}
            className={`${s.map} u-press`}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              go(mapHref);
            }}
          >
            <MapGlyph />
            <span>{c.seeOnMap(matchCount, matchCount === null ? "" : formatNumber(matchCount, locale))}</span>
            <Arrow className={s.mapArrow} />
          </a>
          <p className={s.hints} aria-hidden>
            <span>
              <kbd className={s.kbd}>↑</kbd>
              <kbd className={s.kbd}>↓</kbd> {c.hintNavigate}
            </span>
            <span>
              <kbd className={s.kbd}>{locale === "ar" ? "Enter" : "Entrée"}</kbd> {c.hintOpen}
            </span>
            <span>
              <kbd className={s.kbd}>{c.escKey}</kbd> {c.hintClose}
            </span>
          </p>
        </div>
      </div>

      <p className="u-visually-hidden" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
    </dialog>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false" className={className}>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MapGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
      <path d="M1.5 3.5l4-1.5 5 1.5 4-1.5v10.5l-4 1.5-5-1.5-4 1.5z M5.5 2v10.5 M10.5 3.5V14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function TourGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden focusable="false">
      <ellipse cx="8" cy="8" rx="6.5" ry="2.75" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}
