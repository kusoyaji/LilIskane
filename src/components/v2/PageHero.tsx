import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import type { MediaRef, ResolvedMediaRef } from "@/data/types";
import type { Locale } from "@/i18n/config";
import { shared } from "@/content/shared";
import { Lattice } from "./Lattice";
import s from "./v2.module.css";

/**
 * The opening of every secondary page, in three grounds:
 *
 * - `media`: full-bleed photograph or render under a floor scrim — for pages
 *   whose subject can be shown (À propos, a project family, Contact).
 * - `ink`: the warm olive-black with the moucharabieh lattice — for pages
 *   whose subject is a process or a promise rather than a place.
 * - `paper`: limestone ground — for reading pages (legal, news).
 *
 * Dark grounds mark themselves `data-nav-media` so the header turns light over
 * them; `paper` does not.
 */
export function PageHero({
  locale,
  variant = "ink",
  eyebrow,
  title,
  lead,
  media,
  actions,
  crumb,
}: {
  locale: Locale;
  variant?: "media" | "ink" | "paper";
  eyebrow?: string;
  title: string;
  lead?: string;
  media?: MediaRef | ResolvedMediaRef;
  actions?: React.ReactNode;
  /** Current page label for the breadcrumb; omit to hide it. */
  crumb?: string;
}) {
  const dark = variant !== "paper";
  const cls = [s.hero, variant === "media" ? s.heroMedia : variant === "ink" ? s.heroInk : s.heroPaper].join(" ");

  return (
    <section className={cls} {...(dark ? { "data-nav-media": "" } : {})}>
      {variant === "media" && media && (
        <>
          <div className={s.heroBackdrop} data-parallax="0.35">
            <Figure ref_={media} locale={locale} sizes="100vw" priority className="h-full w-full object-cover" />
          </div>
          <div aria-hidden className={s.heroScrim} />
        </>
      )}
      {variant === "ink" && <Lattice />}

      <div className="u-shell w-full">
        {crumb && (
          <nav aria-label={locale === "ar" ? "مسار التصفح" : "Fil d'Ariane"} className={`u-eyebrow u-enter ${s.crumbs}`}>
            <Link href={`/${locale}`}>{shared[locale].home}</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
        )}
        {eyebrow && (
          <p
            className="u-eyebrow u-enter"
            style={{ color: dark ? "var(--color-ochre-bright)" : "var(--color-ochre-deep)", marginBlockEnd: "1.4rem" }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className={`u-display ${s.heroTitle}`} data-reveal="mask">
          <span className="reveal-inner">{title}</span>
        </h1>
        {lead && <p className={`u-enter ${s.heroLead}`}>{lead}</p>}
        {actions && <div className={`u-enter ${s.heroActions}`}>{actions}</div>}
      </div>
    </section>
  );
}
