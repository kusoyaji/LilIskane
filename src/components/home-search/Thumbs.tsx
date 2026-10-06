"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatNumber, type Locale } from "@/i18n/config";
import type { SearchDoc } from "@/lib/search";
import s from "./Hero.module.css";

const SLOTS = 6;
/** Incoming pictures fade in one after another, this far apart. */
const STAGGER_MS = 40;
const IN_MS = 240;

/**
 * The current top matches as a strip of small pictures. When the programme
 * in a slot changes, the old picture fades and shrinks a little (faster)
 * while the new one fades in over it — the slots one after another, 40 ms
 * apart — so the strip visibly answers each change of the answer without
 * anything moving around. Land gets a typographic tile: the client's land
 * pictures are signposts, not places.
 *
 * Each picture is a way to its programme (the same link as its card in the
 * results): hover or keyboard focus lifts it by 2px and names it in a small
 * label above. The name is also the link's accessible name, so nothing is
 * hover-only.
 */
export function Thumbs({ docs, locale, plot, sqm }: { docs: SearchDoc[]; locale: Locale; plot: string; sqm: string }) {
  return (
    <ul className={s.thumbs}>
      {Array.from({ length: SLOTS }, (_, i) => (
        <Slot key={i} doc={docs[i] ?? null} locale={locale} plot={plot} sqm={sqm} index={i} />
      ))}
    </ul>
  );
}

type Layer = { id: number; doc: SearchDoc | null };

function Slot({ doc, locale, plot, sqm, index }: { doc: SearchDoc | null; locale: Locale; plot: string; sqm: string; index: number }) {
  const seq = useRef(0);
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, doc }]);
  const slug = doc?.slug ?? null;

  useEffect(() => {
    setLayers((current) => {
      if ((current[current.length - 1]?.doc?.slug ?? null) === slug) return current;
      seq.current += 1;
      return [...current.slice(-1), { id: seq.current, doc }];
    });
    const timer = window.setTimeout(() => setLayers((current) => current.slice(-1)), IN_MS + index * STAGGER_MS + 40);
    return () => window.clearTimeout(timer);
    // `doc` follows `slug`; keyed on the slug so a re-render with the same programme does nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const last = layers.length - 1;
  const pictures = layers.map((layer, i) => (
    <span
      key={layer.id}
      className={s.layer}
      data-fresh={(i === last && last > 0) || undefined}
      data-out={i < last || undefined}
    >
      {layer.doc ? <Tile doc={layer.doc} locale={locale} plot={plot} sqm={sqm} /> : null}
    </span>
  ));

  // Edge slots anchor their label inwards, so it never pokes out of the page.
  const tipSide = index === 0 ? "start" : index === SLOTS - 1 ? "end" : "center";
  return (
    <li className={s.slot} style={{ ["--i" as string]: index }} data-empty={!doc || undefined}>
      {doc ? (
        <Link href={`/${locale}/projets/${doc.slug}`} prefetch={false} className={s.slotLink} aria-label={doc.name[locale]}>
          <span className={s.slotFrame}>{pictures}</span>
          <span className={s.tip} data-side={tipSide} aria-hidden>
            {doc.name[locale]}
          </span>
        </Link>
      ) : (
        <span className={s.slotFrame} aria-hidden>
          {pictures}
        </span>
      )}
    </li>
  );
}

function Tile({ doc, locale, plot, sqm }: { doc: SearchDoc; locale: Locale; plot: string; sqm: string }) {
  if (doc.perSqm !== null || doc.segment === "terrain") {
    return (
      <span className={s.plotTile}>
        <span className={s.plotWord}>{plot}</span>
        <span className={`u-numeric ${s.plotSize}`}>{formatNumber(doc.surfaceMin, locale)} {sqm}</span>
      </span>
    );
  }
  return (
    <Image
      src={doc.hero.src}
      alt=""
      width={doc.hero.width}
      height={doc.hero.height}
      sizes="96px"
      className={s.thumbImg}
      draggable={false}
    />
  );
}
