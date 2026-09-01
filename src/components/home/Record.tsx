import { companyRecord } from "@/data/projects";
import { getDictionary } from "@/i18n";
import { formatNumber, type Locale } from "@/i18n/config";

/**
 * The delivery record, as a sentence rather than a row of stat cards.
 *
 * Three big numbers with small labels underneath is the default move, and it
 * reads as a pitch deck. Setting the figures inside the claim they support
 * makes them evidence instead of decoration, and it is the same rhetorical
 * shape as the rest of the site: a statement, then what backs it.
 */
export function Record({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const figure = (value: string) => (
    <span className="u-numeric" style={{ color: "var(--color-ochre-deep)" }}>
      {value}
    </span>
  );

  return (
    <section
      aria-labelledby="record-title"
      className="u-shell"
      style={{ paddingBlock: "clamp(4.5rem, 10vw, 8rem)" }}
    >
      <p className="u-eyebrow u-enter" style={{ color: "var(--color-ink-mute)" }}>
        {t.home.recordEyebrow}
      </p>

      <h2
        id="record-title"
        className="u-display u-enter mt-6"
        data-reveal="mask"
        data-step="1"
        style={{ fontSize: "var(--text-display)", maxInlineSize: "22ch" }}
      >
        <span className="reveal-inner">
        {locale === "fr" ? (
          <>
            Nous avons remis les clés de {figure(formatNumber(companyRecord.homesDelivered, locale))}{" "}
            logements, dans {figure(formatNumber(companyRecord.cities, locale))} villes,
            depuis {figure("1980")}.
          </>
        ) : (
          <>
            سلّمنا مفاتيح {figure(formatNumber(companyRecord.homesDelivered, locale))} وحدة سكنية،
            في {figure(formatNumber(companyRecord.cities, locale))} مدينة، منذ سنة{" "}
            {figure("1980")}.
          </>
        )}
        </span>
      </h2>

      <p
        className="u-body u-enter mt-8"
        data-step="2"
        style={{ color: "var(--color-ink-soft)", fontSize: "var(--text-lead)" }}
      >
        {t.home.recordBody}
      </p>
    </section>
  );
}
