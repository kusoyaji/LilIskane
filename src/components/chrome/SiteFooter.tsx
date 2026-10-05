import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { cities } from "@/data/cities";
import { projects } from "@/data/projects";

/** Glyphs from Simple Icons (CC0), inlined so no icon library ships for three marks. */
const SOCIAL = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/liliskane/",
    icon: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/chaabililiskane/",
    icon: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCJc9VddeHiZgkZCvW6HPh6Q",
    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

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
            {/* The client's own mark, as they publish it — on its white card,
                unaltered. The type-only wordmark is the site's signature; this
                is the company's. */}
            <div className="flex items-center gap-5">
              <Image
                src="/brand/logo.png"
                alt={`${t.footer.company} — الشعبي للإسكان`}
                width={150}
                height={196}
                className="h-[4.5rem] w-auto rounded-[6px]"
              />
              <div className="flex flex-col gap-2.5">
                <Image src="/brand/wordmark-paper.png" alt="" width={371} height={28} className="h-[0.95rem] w-auto" />
                <span
                  lang="ar"
                  dir="rtl"
                  style={{ fontFamily: "var(--font-plex-arabic), sans-serif", fontWeight: 600, fontSize: "1.1rem", lineHeight: 1, letterSpacing: 0 }}
                >
                  الشعبي للإسكان
                </span>
              </div>
            </div>
            <address
              className="u-body mt-7"
              style={{ fontStyle: "normal", color: "color-mix(in oklab, var(--color-paper) 76%, transparent)" }}
            >
              {t.footer.address}
            </address>
            <a
              href={t.nav.phoneHref}
              className="u-display-tight u-numeric mt-6 inline-block"
              style={{ fontSize: "var(--text-title)", color: "var(--color-paper)" }}
            >
              {t.nav.phone}
            </a>
            {/* The client's own published profiles (linked from liliskane.com). */}
            <ul className="mt-6 flex gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {SOCIAL.map((n) => (
                <li key={n.name}>
                  <a
                    href={n.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={n.name}
                    className="u-press flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ border: "1px solid color-mix(in oklab, var(--color-paper) 26%, transparent)", color: "var(--color-paper)" }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
                      <path d={n.icon} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
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
