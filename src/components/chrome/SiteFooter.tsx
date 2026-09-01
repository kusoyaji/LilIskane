import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { cities } from "@/data/cities";
import { projects } from "@/data/projects";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  // Only cities we actually build in get a link. A footer listing all fifteen
  // when four have no live programme is a dead end dressed as navigation.
  const activeCityIds = new Set(projects.map((p) => p.cityId));
  const activeCities = cities.filter((c) => activeCityIds.has(c.id));

  return (
    // Keeps its own ink — it is the page's terminal block and must be correct
    // on every route, including before hydration. The tone is declared as well
    // so the field has already ramped to ink by the time you reach it, and the
    // last join on the page is as soft as the rest.
    <footer data-tone="ink" style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}>
      <div className="u-shell" style={{ paddingBlock: "clamp(3.5rem, 8vw, 6rem)" }}>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Image
              src="/brand/wordmark-paper.png"
              alt={t.footer.company}
              width={371}
              height={28}
              className="h-[1.05rem] w-auto"
            />
            <address
              className="u-body mt-6"
              style={{ fontStyle: "normal", color: "color-mix(in oklab, var(--color-paper) 76%, transparent)" }}
            >
              {t.footer.address}
              <br />
              {t.footer.hours}
            </address>
            <a
              href={t.nav.phoneHref}
              className="u-display-tight u-numeric mt-6 inline-block"
              style={{ fontSize: "var(--text-title)", color: "var(--color-paper)" }}
            >
              {t.nav.phone}
            </a>
          </div>

          <nav aria-label={t.footer.sitemap}>
            <h2 className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
              {t.nav.projects}
            </h2>
            <ul className="mt-5 flex flex-col gap-2.5" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {activeCities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/${locale}/projets?ville=${city.id}`}
                    className="u-press inline-flex min-h-11 items-center"
                    style={{ color: "color-mix(in oklab, var(--color-paper) 82%, transparent)" }}
                  >
                    {city.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.legal}>
            <h2 className="u-eyebrow" style={{ color: "var(--color-ochre-bright)" }}>
              {t.footer.company}
            </h2>
            <ul className="mt-5 flex flex-col gap-2.5" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {[
                { href: `/${locale}/a-propos`, label: t.nav.about },
                { href: `/${locale}/guide-achat`, label: t.nav.guide },
                { href: `/${locale}/actualites`, label: t.nav.news },
                { href: `/${locale}/contact`, label: t.nav.contact },
                { href: `/${locale}/mentions-legales`, label: t.footer.legal },
                { href: `/${locale}/donnees-personnelles`, label: t.footer.privacy },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="u-press inline-flex min-h-11 items-center"
                    style={{ color: "color-mix(in oklab, var(--color-paper) 82%, transparent)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className="mt-14 flex flex-col gap-3 pt-7 sm:flex-row sm:items-baseline sm:justify-between"
          style={{ borderBlockStart: "1px solid color-mix(in oklab, var(--color-paper) 18%, transparent)" }}
        >
          <p className="u-eyebrow" style={{ color: "color-mix(in oklab, var(--color-paper) 55%, transparent)" }}>
            {t.footer.company} — {t.footer.group}
          </p>
          <p
            className="u-numeric"
            style={{
              fontSize: "var(--text-label)",
              color: "color-mix(in oklab, var(--color-paper) 45%, transparent)",
            }}
          >
            © {new Date().getFullYear()} — {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
