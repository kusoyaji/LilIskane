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
  useLayoutEffect,
  useState,
  useTransition,
  type RefObject,
} from "react";
import { Lattice } from "@/components/v2/Lattice";
import { projectCopy, SEGMENT_LABELS } from "@/content/projects";
import { SEARCH_PAGES, searchCopy } from "@/content/search";
import { formatNumber, type Locale } from "@/i18n/config";
import { formatRange } from "@/lib/format";
import { parseQuery, searchDocs, toProjetsHref, type ParsedQuery, type SearchDoc, type SearchOutcome } from "@/lib/search";
import type { AiResult } from "@/lib/search/ai/types";
import { reducedMotion, slideIndicator } from "@/components/home-search/motion";
import { AiSlot } from "./AiSlot";
import { aiCopy } from "@/lib/search/ai/copy";
import { CriteriaTicks } from "./CriteriaTicks";
import { loadIndex } from "./index-cache";
import { ChipList, useChipListShown } from "./parts/ChipList";
import { FacetButton } from "./parts/FacetButton";
import { MarkedInput } from "./parts/MarkedInput";
import { buildChips, buildFacetGroups, cityNamer, relaxedSentence, removeChip, resolveSearch, type ChipModel, type FacetGroup, type QueryState } from "./parts/model";
import { EMPTY_EXTRA, hasConstraint, isEmptyExtra, matchPages, merge, reconcile, type Extra } from "./query-state";
import { useAiSearch } from "./useAiSearch";
import s from "./ConciergeOverlay.module.css";

type Page = (typeof SEARCH_PAGES)[number];
type Option =
  | { kind: "doc"; key: string; href: string; doc: SearchDoc; ai: AiResult | null }
  | { kind: "page"; key: string; href: string; page: Page };

const LENIS = () => (window as Window & { __lenis?: { stop(): void; start(): void } }).__lenis;
const NO_DISMISSED: ReadonlySet<string> = new Set();

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
  const bodyRef = useRef<HTMLDivElement>(null);
  /** The root's inline overflow and background from before the lock, or null while unlocked. */
  const locked = useRef<{ overflow: string; background: string } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [raw, setRaw] = useState("");
  const [extra, setExtra] = useState<Extra>(EMPTY_EXTRA);
  /** Values the AI added that the visitor removed (see parts/model.ts). */
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(NO_DISMISSED);
  const [active, setActive] = useState(-1);
  const [pending, setPending] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
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

  /* -------------------------------------------------------------- query ---- */
  const deferredRaw = useDeferredValue(raw);
  const deferredExtra = useDeferredValue(extra);
  const parsed = useMemo(() => parseQuery(deferredRaw), [deferredRaw]);
  const pages = useMemo(() => matchPages(deferredRaw), [deferredRaw]);
  /** What the visitor said and picked — before any AI reading. */
  const userQuery: ParsedQuery = useMemo(() => {
    const merged = merge(parsed, deferredExtra);
    return { ...merged, text: merged.text.filter((w) => !pages.words.has(w)) };
  }, [parsed, deferredExtra, pages]);

  const hasQuery = deferredRaw.trim() !== "" || !isEmptyExtra(deferredExtra);
  const constrained = hasConstraint(userQuery);
  const instant: SearchOutcome | null = useMemo(
    () => (docs && constrained ? searchDocs(docs, userQuery) : null),
    [docs, constrained, userQuery],
  );

  // The AI refines on top of the instant answer; it never blocks it, and an
  // answer is only ever shown for the exact text it was given.
  const ai = useAiSearch({ raw: deferredRaw, locale, instant });
  const answer = ai.forQuery === deferredRaw && deferredRaw.trim() !== "" ? ai.answer : null;

  const resolved = useMemo(
    () => (docs && (constrained || answer) ? resolveSearch(docs, userQuery, deferredExtra, answer, dismissed) : null),
    [docs, constrained, answer, userQuery, deferredExtra, dismissed],
  );
  const outcome = resolved?.outcome ?? null;
  const query = resolved?.query ?? userQuery;

  const mode: "browse" | "results" | "pages" = !hasQuery
    ? "browse"
    : resolved
      ? "results"
      : pages.ids.length
        ? "pages"
        : "browse";

  const rows: Array<{ doc: SearchDoc; ai: AiResult | null }> = useMemo(() => {
    if (!docs) return [];
    if (mode === "results") return resolved ? resolved.rows : [];
    if (mode === "pages") return [];
    return docs.map((doc) => ({ doc, ai: null }));
  }, [docs, mode, resolved]);
  const docList = useMemo(() => rows.map((row) => row.doc), [rows]);

  const pageList: Page[] = useMemo(() => {
    if (!hasQuery) return SEARCH_PAGES;
    return SEARCH_PAGES.filter((page) => pages.ids.includes(page.id));
  }, [hasQuery, pages]);

  const options: Option[] = useMemo(() => {
    const docOpts: Option[] = rows.map(({ doc, ai: fit }) => ({
      kind: "doc",
      key: doc.slug,
      href: `/${locale}/projets/${doc.slug}`,
      doc,
      ai: fit,
    }));
    const pageOpts: Option[] = pageList.map((page) => ({
      kind: "page",
      key: `page-${page.id}`,
      href: `/${locale}${page.path}`,
      page,
    }));
    return mode === "results" ? [...docOpts, ...pageOpts] : [...pageOpts, ...docOpts];
  }, [rows, pageList, mode, locale]);

  const optionId = (key: string) => `${uid}-o-${key}`;
  const exact = outcome ? outcome.exact : true;
  // The map link opens /projets with the filters, which knows nothing of the AI's extra picks:
  // it counts the filter result.
  const matchCount = mode === "results" ? (exact && outcome ? outcome.hits.length : null) : (docs?.length ?? null);
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

  /* ------------------------------------------------------------ motion ---- */
  // The rows arrive with a short stagger only when the overlay opens and on
  // the first paint of a new query (the list going from ideas to answers,
  // or the index arriving) — never on each keystroke. Set before paint, so
  // no frame shows the rows before they fade in.
  const listboxRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [entering, setEntering] = useState(false);
  // (Keyed on "a query started", not on the list's mode: the mode can flip
  // between ideas and pages from one letter to the next.)
  const enterKey = `${open}|${hasQuery}|${docs ? 1 : 0}`;
  useLayoutEffect(() => {
    if (!open || reducedMotion()) return;
    setEntering(true);
    const timer = window.setTimeout(() => setEntering(false), 520);
    return () => window.clearTimeout(timer);
  }, [enterKey, open]);

  // One field slides from row to row as ↑/↓ (or the pointer) move the active
  // option: transform only. Anything else (a new query, the list changing
  // under it) snaps it into place — there is nothing to travel along.
  const navigated = useRef(false);
  const placeIndicator = useCallback(
    (animate: boolean) => {
      const box = indicatorRef.current;
      const list = listboxRef.current;
      if (!box || !list) return;
      const row = activeOption ? document.getElementById(optionId(activeOption.key)) : null;
      if (!row || !list.contains(row)) {
        box.dataset.on = "false";
        delete box.dataset.box;
        return;
      }
      slideIndicator(box, { x: row.offsetLeft, y: row.offsetTop, w: row.offsetWidth, h: row.offsetHeight }, { animate: animate && box.dataset.on === "true", duration: 160 });
      box.dataset.on = "true";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeOption?.key],
  );
  useLayoutEffect(() => {
    placeIndicator(navigated.current);
    navigated.current = false;
  });
  useEffect(() => {
    const list = listboxRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => placeIndicator(false));
    ro.observe(list);
    return () => ro.disconnect();
  }, [placeIndicator]);
  useEffect(() => {
    if (!activeOption) return;
    document.getElementById(optionId(activeOption.key))?.scrollIntoView({ block: "nearest" });
    const timer = window.setTimeout(() => router.prefetch(activeOption.href), 120);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOption?.key]);

  // Announced politely, after typing settles, so a screen reader is not
  // interrupted on every keystroke.
  const countMessage = !docs || !hasQuery || mode !== "results" ? "" : exact ? c.count(docList.length, formatNumber(docList.length, locale)) : c.countRelaxed;
  const message = countMessage && ai.state === "thinking" ? `${countMessage} ${aiCopy[locale].thinking}` : countMessage;
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setAnnounce(message), 450);
    return () => window.clearTimeout(timer);
  }, [message, open]);

  /* ------------------------------------------------------------ actions ---- */
  const apply = useCallback((next: QueryState & { dismissed?: ReadonlySet<string> }) => {
    setRaw(next.raw);
    setExtra(next.extra);
    if (next.dismissed) setDismissed(next.dismissed);
    else if (!next.raw && isEmptyExtra(next.extra)) setDismissed(NO_DISMISSED);
  }, []);

  const applyAndRefocus = (next: QueryState & { dismissed?: ReadonlySet<string> }) => {
    apply(next);
    inputRef.current?.focus({ preventScroll: true });
  };

  const onType = (value: string) => {
    setRaw(value);
    setExtra((current) => reconcile(parseQuery(value), current));
    if (!value.trim()) setDismissed(NO_DISMISSED);
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
      navigated.current = true;
      if (n) setActive((i) => (i + 1) % n);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      navigated.current = true;
      if (n) setActive((i) => (i <= 0 ? n - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeOption) choose(activeOption);
      else if (hasQuery) go(mapHref);
    }
  };

  /* -------------------------------------------------------------- chips ---- */
  const cityName = useMemo(() => cityNamer(docs, locale), [docs, locale]);

  const chips: ChipModel[] = useMemo(
    () =>
      buildChips({ user: userQuery, final: query, raw: deferredRaw, parsed, extra: deferredExtra, locale, c, cityName }),
    [userQuery, query, deferredRaw, parsed, deferredExtra, locale, c, cityName],
  );
  const onRemoveChip = (chip: ChipModel) => applyAndRefocus(removeChip(chip, { raw, extra }, dismissed));
  // The row stays until its last chip has faded out.
  const [chipsShown, releaseChips] = useChipListShown(chips.length);

  /* ------------------------------------------------------------- facets ---- */
  const facetGroups: FacetGroup[] = useMemo(
    () => (docs ? buildFacetGroups({ docs, query, raw, extra, locale, c, cityName }) : []),
    [docs, query, raw, extra, locale, c, cityName],
  );

  /* ------------------------------------------------------------- render ---- */
  const relaxedText = outcome ? relaxedSentence(outcome, c) : null;

  const listboxId = `${uid}-listbox`;
  const inputId = `${uid}-input`;

  const renderFacetChip = (chip: FacetGroup["chips"][number]) => (
    <FacetButton key={chip.key} chip={chip} locale={locale} onPick={(picked) => applyAndRefocus(picked.toggle())} />
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
      style: { ["--i" as string]: Math.min(index, 10) } as React.CSSProperties,
      "aria-selected": selected,
      "data-pending": pending === option.href ? "" : undefined,
      onPointerMove: (event: React.PointerEvent) => {
        // A finger dragging the list is scrolling, not pointing.
        if (event.pointerType !== "mouse") return;
        const last = pointer.current;
        pointer.current = { x: event.clientX, y: event.clientY };
        // A row sliding under a still cursor (keyboard scrolling) is not a hover.
        if (last && last.x === event.clientX && last.y === event.clientY) return;
        if (index !== active) {
          navigated.current = true;
          setActive(index);
        }
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
            <span className="u-visually-hidden">{locale === "ar" ? "،" : ","}</span>
            <span aria-hidden> · </span>
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
          {option.ai && <CriteriaTicks locale={locale} doc={doc} ai={option.ai} query={query} className={s.ticks} />}
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
      {/* Decoration inside the listbox (which may hold only options and groups): the group's own label names it. */}
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
            <MarkedInput
              inputRef={inputRef}
              id={inputId}
              className={s.input}
              value={raw}
              onValue={onType}
              spans={parsed.spans}
              spansFor={deferredRaw}
              placeholders={c.placeholders}
              cycle={open}
              role="combobox"
              aria-expanded={options.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeOption ? optionId(activeOption.key) : undefined}
              onKeyDown={onKeyDown}
            />
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

          {chipsShown && (
            <div className={s.chipsRow}>
              <span className={`u-eyebrow ${s.chipsLabel}`}>{parsed.spans.length ? c.understood : c.criteria}</span>
              <ChipList
                chips={chips}
                onRemove={onRemoveChip}
                onEmpty={releaseChips}
                removeLabel={c.removeChip}
                aiMark={c.aiMark}
                aiTitle={c.aiTitle}
                className={s.chips}
              />
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

            {/* The concierge's place above the results: its wait (a skeleton of the answer, with
                the request's stages), then its answer in the same place. The overlay's own live
                region already says it is reading, so the slot only announces the answer. */}
            <AiSlot
              locale={locale}
              state={hasQuery ? ai.state : "idle"}
              answer={answer}
              onQuery={(text) => applyAndRefocus({ raw: text, extra })}
              total={docs?.length ?? null}
              announceBusy={false}
            />

            {/* What had to be widened: there for as long as it is true — through the wait and the
                answer — so the list under it moves once at most (the wait arriving), never back and forth. */}
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

            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label={c.dialog}
              className={s.listbox}
              data-entering={entering || undefined}
            >
              <span ref={indicatorRef} className={s.indicator} aria-hidden />
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
