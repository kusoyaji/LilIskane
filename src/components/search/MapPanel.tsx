"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { searchCopy } from "@/content/projects";
import s from "./search.module.css";

/**
 * The map's frame. Always open beside the list on wide screens; on a phone it
 * folds behind a button, because the list is what a phone visitor came for and
 * the country is tall.
 */
export function MapPanel({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const c = searchCopy[locale];
  const [open, setOpen] = useState(false);
  return (
    <div className={s.mapPanel} data-open={open || undefined}>
      <div className={s.mapHead}>
        <p className={`u-eyebrow ${s.mapEyebrow}`}>{c.mapEyebrow}</p>
        <p className={s.mapHint}>{c.mapHint}</p>
        <button type="button" className={s.mapToggle} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? c.hideMap : c.showMap}
        </button>
      </div>
      <div className={s.mapBody}>{children}</div>
    </div>
  );
}
