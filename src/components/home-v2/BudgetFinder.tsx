import type { Locale } from "@/i18n/config";

/** STUB — replaced during the v2 build. Renders a labelled placeholder so the page composes. */
export function BudgetFinder({ locale }: { locale: Locale }) {
  return (
    <section data-stub="BudgetFinder" style={{ minBlockSize: "50svh", display: "grid", placeItems: "center" }}>
      <p className="u-eyebrow">BudgetFinder · {locale}</p>
    </section>
  );
}
