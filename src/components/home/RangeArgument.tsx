import Link from "next/link";
import { Figure } from "@/components/media/Figure";
import { getCity } from "@/data/cities";
import { projects } from "@/data/projects";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { effectiveTotal, formatMonthly, formatPrice } from "@/lib/format";

/**
 * The two ends of the portfolio, given identical treatment.
 *
 * The brief's hardest constraint is that a 485 000 DH flat in Essaouira must
 * not look like the discount tier beside a 2 450 000 DH one in Marrakech. The
 * only way to make that credible is to spend the same space, the same crop and
 * the same typography on both — so this section is deliberately symmetrical,
 * and the cheaper programme is placed first.
 */
export function RangeArgument({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const sorted = [...projects].sort((a, b) => effectiveTotal(a.price) - effectiveTotal(b.price));
  const cheapest = sorted.find((p) => p.price.unit === "total") ?? sorted[0];
  const dearest = [...sorted].reverse()[0];

  const cards = [cheapest, dearest];

  return (
    <section
      aria-labelledby="range-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4.5rem, 10vw, 8rem)" }}
    >
      <div className="max-w-[52ch]">
        <p className="u-eyebrow u-enter" style={{ color: "var(--color-ink-mute)" }}>
          {t.home.rangeEyebrow}
        </p>
        <h2
          id="range-title"
          className="u-display u-enter mt-5"
          data-reveal="mask"
          data-step="1"
          style={{ fontSize: "var(--text-display)" }}
        >
          <span className="reveal-inner">{t.home.rangeTitle}</span>
        </h2>
        <p className="u-body u-enter mt-7" data-step="2" style={{ color: "var(--color-ink-soft)" }}>
          {t.home.rangeBody}
        </p>
      </div>

      <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
        {cards.map((project, index) => (
          <article key={project.id} className="u-enter" data-step={index === 0 ? "1" : "2"}>
            <Link href={`/${locale}/projets/${project.slug}`} className="group block">
              <div className="u-enter overflow-hidden" data-reveal="media" style={{ background: "var(--color-paper-warm)" }}>
                <Figure
                  ref_={project.hero}
                  locale={locale}
                  sizes="(min-width: 48rem) 44vw, 92vw"
                  ratio="3 / 2"
                  className="h-full w-full object-cover"
                />
              </div>

              <div
                className="mt-5 flex items-baseline justify-between gap-4 pt-4"
                style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-ink) 18%, transparent)" }}
              >
                <h3 className="u-display-tight" style={{ fontSize: "var(--text-title)" }}>
                  {project.name[locale]}
                </h3>
                <p className="u-eyebrow" style={{ color: "var(--color-ink-mute)" }}>
                  {getCity(project.cityId).name[locale]}
                </p>
              </div>

              <p className="u-numeric mt-3" style={{ fontSize: "var(--text-lead)" }}>
                {t.common.from} {formatPrice(project.price, locale)}
              </p>
              <p
                className="u-numeric mt-1"
                style={{ fontSize: "var(--text-small)", color: "var(--color-ink-mute)" }}
              >
                {t.project.monthlyFrom} {formatMonthly(project.price, locale)}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
