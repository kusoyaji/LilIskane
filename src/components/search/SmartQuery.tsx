"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { AMENITY_LABELS, KIND_LABELS, SEGMENT_LABELS, searchCopy } from "@/content/projects";
import { searchCopy as conciergeCopy } from "@/content/search";
import { cityById } from "@/data/cities";
import { formatNumber, isolateRun, type Locale } from "@/i18n/config";
import { parseQuery, searchDocs, toProjetsHref, type ParsedQuery, type SearchDoc } from "@/lib/search";
import { namedProgramme } from "@/lib/search/rank";
import { answerProgramme, projetsQuery } from "@/lib/search/ai/apply";
import { aiCopy } from "@/lib/search/ai/copy";
import { isAiWorthy } from "@/lib/search/ai/worthy";
import { AiAnswerCard } from "@/components/search-concierge/AiAnswerCard";
import { loadIndex } from "@/components/search-concierge/index-cache";
import { fetchAiAnswer, useAiSearch } from "@/components/search-concierge/useAiSearch";
import {
  EMPTY_EXTRA,
  hasConstraint,
  regionCities,
  removeRegion,
  removeValue,
  type ValueField,
} from "@/components/search-concierge/query-state";
import { statusFacetLabel } from "./labels";
import s from "./search.module.css";

type Chip = { key: string; label: string; remove: () => string };

/**
 * The sentence version of the facets below it, in the /projets hero.
 *
 * The visitor writes what they want the way they would say it ("3 chambres à
 * Agadir moins de 1,2 million", "شقة بمراكش"). Every keystroke is read by the
 * concierge parser (`@/lib/search`) and what it understood is shown as ochre
 * chips — the same chips, and the same removal rule, as the header's search
 * overlay. Submitting writes those values into the /projets URL with
 * `toProjetsHref`, so the facets, the map and the list below all move to
 * them; a sentence that names exactly one programme and nothing else opens
 * that programme instead.
 *
 * The search index (~18 KB, shared with the overlay's module cache) is only
 * fetched once the visitor reaches for the field; until then the chips work
 * and only the live count waits.
 */
export function SmartQuery({ locale }: { locale: Locale }) {
  const c = searchCopy[locale];
  const cc = conciergeCopy[locale];
  const router = useRouter();
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [raw, setRaw] = useState("");
  const deferredRaw = useDeferredValue(raw);
  const parsed = useMemo(() => parseQuery(deferredRaw), [deferredRaw]);

  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const fetching = useRef(false);
  const warm = useCallback(() => {
    if (fetching.current) return;
    fetching.current = true;
    loadIndex(locale)
      .then(setDocs)
      .catch(() => {
        fetching.current = false;
      });
  }, [locale]);

  const constrained = hasConstraint(parsed);
  const outcome = useMemo(
    () => (docs && constrained ? searchDocs(docs, parsed) : null),
    [docs, constrained, parsed],
  );
  /** The programme the sentence names, when it names one and asks nothing it lacks. */
  const opens = useMemo(() => target(docs, parsed), [docs, parsed]);
  // A name, a neighbourhood ("Tassila") or part of one ("Riad Garden") cannot
  // travel in the /projets URL, so the programmes it matched are offered here.
  const named =
    outcome?.exact && parsed.text.length > 0 && !opens ? outcome.hits.filter((h) => h.score >= 1).slice(0, 4) : [];

  // The concierge reads the same sentence (Gemini, server-side) once the
  // visitor pauses; its one-line answer shows under the chips. The instant
  // parse above never waits for it.
  const ai = useAiSearch({ raw: deferredRaw, locale, instant: outcome });
  const answer = ai.forQuery === deferredRaw && deferredRaw.trim() !== "" ? ai.answer : null;
  const [asking, setAsking] = useState(false);

  /* -------------------------------------------------------------- chips ---- */
  const chips: Chip[] = useMemo(() => {
    const out: Chip[] = [];
    const cut = (field: ValueField, value: string | number) => () => removeValue(raw, EMPTY_EXTRA, field, value).raw;
    const fromRegion = parsed.region ? regionCities(deferredRaw, parsed) : [];
    if (parsed.region) {
      out.push({ key: `region-${parsed.region}`, label: cc.regions[parsed.region], remove: () => removeRegion(raw, EMPTY_EXTRA).raw });
    }
    for (const id of parsed.cities) {
      if (fromRegion.includes(id)) continue;
      out.push({ key: `city-${id}`, label: cityById.get(id)?.name[locale] ?? id, remove: cut("cities", id) });
    }
    for (const kind of parsed.kinds) {
      out.push({ key: `kind-${kind}`, label: KIND_LABELS[kind][locale], remove: cut("kinds", kind) });
    }
    for (const seg of parsed.segments) {
      out.push({ key: `seg-${seg}`, label: SEGMENT_LABELS[seg][locale], remove: cut("segments", seg) });
    }
    if (parsed.bedroomsMin !== null) {
      const n = parsed.bedroomsMin;
      out.push({ key: "beds", label: cc.bedroomsChip(n, isolateRun(String(n), locale)), remove: cut("bedroomsMin", n) });
    }
    if (parsed.priceMax !== null) {
      const v = parsed.priceMax;
      out.push({ key: "price", label: cc.priceChip(formatNumber(v, locale)), remove: cut("priceMax", v) });
    }
    if (parsed.monthlyMax !== null) {
      const v = parsed.monthlyMax;
      out.push({ key: "monthly", label: cc.monthlyChip(formatNumber(v, locale)), remove: cut("monthlyMax", v) });
    }
    for (const st of parsed.statuses) {
      out.push({ key: `st-${st}`, label: statusFacetLabel(st, locale), remove: cut("statuses", st) });
    }
    for (const a of parsed.amenities) {
      out.push({ key: `am-${a}`, label: AMENITY_LABELS[a][locale], remove: cut("amenities", a) });
    }
    return out;
  }, [parsed, deferredRaw, raw, cc, locale]);

  /* ------------------------------------------------------------- submit ---- */
  const [pending, startTransition] = useTransition();
  const scrollAfter = useRef(false);

  const toResults = useCallback(() => {
    const el = document.getElementById("recherche");
    if (!el) return;
    const lenis = (window as Window & { __lenis?: { scrollTo(target: Element, options?: object): void } }).__lenis;
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);

  // The list moves once the server has answered, not before: scrolling while
  // the old results are still on screen would show the wrong programmes.
  useEffect(() => {
    if (!pending && scrollAfter.current) {
      scrollAfter.current = false;
      toResults();
    }
  }, [pending, toResults]);

  const namedRef = useRef<HTMLUListElement>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = parseQuery(raw);
    if (!hasConstraint(query)) {
      toResults();
      return;
    }
    let index = docs;
    if (!index) index = await loadIndex(locale).catch(() => null);
    const programme = target(index, query);
    if (programme) {
      router.push(`/${locale}/projets/${programme.slug}`);
      return;
    }
    // A sentence worth reading: ask the concierge first (≤ 6 s, usually already
    // answered while the visitor paused), then go where its answer points —
    // the one programme it is about, or /projets with its filters. If it
    // cannot answer, the instant parse below decides, as before.
    if (index && isAiWorthy(raw, query, searchDocs(index, query))) {
      setAsking(true);
      const reply = await fetchAiAnswer(raw, locale, { timeoutMs: 6000 });
      setAsking(false);
      if (reply) {
        const slug = answerProgramme(reply);
        if (slug) {
          router.push(`/${locale}/projets/${slug}`);
          return;
        }
        const refined = projetsQuery(query, reply, index);
        if (hasStructured(refined)) {
          scrollAfter.current = true;
          startTransition(() => router.push(toProjetsHref(refined, locale), { scroll: false }));
          return;
        }
      }
    }
    if (!hasStructured(query)) {
      // Only words the URL cannot carry ("Riad Garden", "Tassila"): the
      // programmes they matched are the answer, so go to them, not to an
      // unfiltered list.
      const first = namedRef.current?.querySelector("a");
      if (first) first.focus();
      else toResults();
      return;
    }
    scrollAfter.current = true;
    startTransition(() => router.push(toProjetsHref(query, locale), { scroll: false }));
  };

  const fill = (example: string) => {
    setRaw(example);
    warm();
    inputRef.current?.focus();
  };

  /* -------------------------------------------------------------- status ---- */
  let status: string | null = null;
  if (outcome && named.length === 0) {
    status = outcome.exact
      ? c.smartCount(outcome.hits.length, formatNumber(outcome.hits.length, locale))
      : c.smartClosest;
  }

  return (
    <form role="search" className={s.smart} onSubmit={submit} aria-busy={pending || asking || undefined}>
      <label htmlFor={inputId} className="u-visually-hidden">
        {c.smartLabel}
      </label>
      <div className={s.smartField}>
        <svg className={s.smartIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          dir="auto"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          className={s.smartInput}
          placeholder={c.smartPlaceholder}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          onFocus={warm}
          onPointerEnter={warm}
          aria-describedby={statusId}
        />
        <button type="submit" className={`u-press ${s.smartSubmit}`} disabled={pending || asking}>
          <span className={s.smartSubmitText}>{opens ? c.smartOpen(opens.name[locale]) : c.smartSubmit}</span>
          {asking ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className={s.smartSpinner}>
              <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.28" />
              <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className={s.smartArrow}>
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {asking && <span className="u-visually-hidden">{aiCopy[locale].submitting}</span>}
        </button>
      </div>

      <div className={s.smartBelow}>
        {chips.length > 0 ? (
          <div className={s.smartChipsRow}>
            <span className={`u-eyebrow ${s.smartChipsLabel}`}>{c.smartUnderstood}</span>
            <ul className={s.smartChips}>
              {chips.map((chip) => (
                <li key={chip.key} className={s.smartChip}>
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    className={s.smartChipX}
                    aria-label={c.removeChip(chip.label)}
                    onClick={() => {
                      setRaw(chip.remove());
                      inputRef.current?.focus();
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          raw.trim() === "" && (
            <div className={s.smartChipsRow}>
              <span className={`u-eyebrow ${s.smartChipsLabel}`}>{c.smartTry}</span>
              <ul className={s.smartExamples}>
                {c.smartExamples.map((example) => (
                  <li key={example}>
                    <button type="button" className={s.smartExample} onClick={() => fill(example)}>
                      <bdi>{example}</bdi>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        {named.length > 0 && (
          <div className={s.smartChipsRow}>
            <span className={`u-eyebrow ${s.smartChipsLabel}`}>{c.smartNamed}</span>
            <ul ref={namedRef} className={s.smartExamples}>
              {named.map(({ doc }) => (
                <li key={doc.slug}>
                  <Link href={`/${locale}/projets/${doc.slug}`} className={s.smartNamedLink}>
                    {doc.name[locale]} <span className={s.smartNamedCity}>· {doc.city[locale]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p id={statusId} className={`u-numeric ${s.smartStatus}`} aria-live="polite">
          {status}
        </p>

        {raw.trim() !== "" && ai.state !== "idle" && (
          <AiAnswerCard
            locale={locale}
            state={ai.state}
            answer={answer}
            compact
            onQuery={(text) => {
              setRaw(text);
              warm();
              inputRef.current?.focus();
            }}
          />
        )}
      </div>
    </form>
  );
}

/** Whether the query holds anything `toProjetsHref` can write into the URL. */
function hasStructured(query: ParsedQuery): boolean {
  return (
    query.cities.length > 0 ||
    query.segments.length > 0 ||
    query.kinds.length > 0 ||
    query.statuses.length > 0 ||
    query.amenities.length > 0 ||
    query.bedroomsMin !== null ||
    query.priceMax !== null ||
    query.monthlyMax !== null
  );
}

/**
 * The programme a query opens directly: it names exactly one programme
 * (`namedProgramme`) and that programme meets every other value in it —
 * "Massylia" or "Massylia Agadir" open Massylia, "Massylia Marrakech" does
 * not (the visitor asked for two things that disagree; /projets shows the
 * closest).
 */
function target(docs: SearchDoc[] | null, query: ParsedQuery): SearchDoc | null {
  if (!docs) return null;
  const named = namedProgramme(docs, query);
  if (!named) return null;
  const outcome = searchDocs(docs, query);
  return outcome.exact && outcome.hits.length === 1 && outcome.hits[0].doc.slug === named.slug ? named : null;
}
