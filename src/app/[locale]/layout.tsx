import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { archivo, plexArabic } from "@/lib/fonts";
import { dirOf, isLocale, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { Field } from "@/components/motion/Field";
import { RevealRoot } from "@/components/motion/RevealRoot";
import { ScrollChoreography } from "@/components/motion/ScrollChoreography";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import "@/styles/globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Theme colour goes here rather than in a hand-written <head>. App Router owns
 * the document head; adding one manually produces invalid nesting that silently
 * aborts hydration — the page renders and looks fine, but no client component
 * ever mounts.
 */
export const viewport: Viewport = {
  themeColor: "#1c1e14",
  colorScheme: "light",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    title: { default: t.meta.homeTitle, template: `%s — ${t.footer.company}` },
    description: t.meta.homeDescription,
    // The legacy site carried a keyword-stuffed meta tag longer than most
    // homepages. It is deliberately not reproduced: keywords have been ignored
    // by every major engine for over a decade and it read as spam to humans.
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", ar: "/ar" },
    },
    openGraph: {
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const t = getDictionary(typedLocale);

  return (
    <html
      lang={typedLocale}
      dir={dirOf(typedLocale)}
      className={`${archivo.variable} ${plexArabic.variable}`}
    >
      <body>
        <a className="u-skip" href="#main">
          {t.nav.skip}
        </a>
        {/* Mounted here rather than inside template.tsx: the route wrapper is
            animated, and a transform there would become the containing block
            for every fixed descendant — the field would stop being fixed to the
            viewport for the length of each navigation.

            Paper is the pre-hydration tone for every route. The home page opens
            on ink, but its hero is opaque and full-height, so nothing of the
            field is visible until the first toned section after it. */}
        {/* Headless, like the two below it: no wrapper element, so nothing new
            becomes a containing block for the pinned stages. */}
        <SmoothScroll />
        <ScrollChoreography />
        <Field />
        {/* Still mounted: it sets `data-visible` on `.u-enter`, which the
            reduced-motion stylesheet depends on. Under motion the GSAP
            choreography owns the actual animation and the CSS transitions are
            neutralised by the `gsap-on` class. */}
        <RevealRoot />
        <SiteHeader locale={typedLocale} />
        <main id="main">{children}</main>
        <SiteFooter locale={typedLocale} />
      </body>
    </html>
  );
}
