import { Figure } from "@/components/media/Figure";
import { company } from "@/data/company";
import type { MediaRef } from "@/data/types";
import { isolateRun, type Locale } from "@/i18n/config";
import { shared } from "@/content/shared";
import { LinkButton } from "./LinkButton";
import s from "./v2.module.css";

/** Default image: the delivered Riad Garden I salon — a real, lived-in room. */
const DEFAULT_MEDIA: MediaRef = {
  key: "rg1_DSC08344",
  nature: "photograph",
  alt: {
    fr: "Séjour d'un appartement livré de Riad Garden I, baie vitrée ouverte sur la terrasse.",
    ar: "صالون شقة مُسلَّمة برياض غاردن 1، نافذة زجاجية مفتوحة على الشرفة.",
  },
};

/**
 * The closing call to action shared by every page: book a visit, or call.
 * Same words and same destination everywhere, so the one thing the site exists
 * to produce is never more than one screen away.
 */
export function CtaBand({
  locale,
  media = DEFAULT_MEDIA,
  title,
  body,
  href,
}: {
  locale: Locale;
  media?: MediaRef;
  title?: string;
  body?: string;
  /** Booking destination; project pages pass /contact?projet=<slug> so the form arrives prefilled. */
  href?: string;
}) {
  const t = shared[locale];
  return (
    <section className={s.cta} data-nav-media>
      <div style={{ position: "absolute", inset: "-8% 0", zIndex: -2 }} data-parallax="0.3">
        <Figure ref_={media} locale={locale} sizes="100vw" className="h-full w-full object-cover" />
      </div>
      <div aria-hidden className={s.ctaScrim} />
      <div className="u-shell w-full">
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ochre-bright)", marginBlockEnd: "1.4rem" }}>
          {t.ctaEyebrow}
        </p>
        <h2 className="u-display" data-reveal="mask" style={{ fontSize: "var(--text-mega)", maxInlineSize: "14ch" }}>
          <span className="reveal-inner">{title ?? t.ctaTitle}</span>
        </h2>
        <p className="u-enter" style={{ marginBlockStart: "1.5rem", fontSize: "var(--text-lead)", lineHeight: 1.45, maxInlineSize: "44ch", opacity: 0.88 }}>
          {body ?? t.ctaBody}
        </p>
        <div className="u-enter" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBlockStart: "2.25rem" }}>
          <LinkButton href={href ?? `/${locale}/contact`} variant="light">
            {t.bookVisit}
          </LinkButton>
          <LinkButton href={company.phoneHref} variant="outline" arrow={false}>
            {t.callUs} · {isolateRun(company.phone, locale)}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
