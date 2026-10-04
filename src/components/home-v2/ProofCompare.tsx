import type { Locale } from "@/i18n/config";

/** STUB — replaced during the v2 build. Renders a labelled placeholder so the page composes. */
export function ProofCompare({ locale }: { locale: Locale }) {
  return (
    <section data-stub="ProofCompare" style={{ minBlockSize: "50svh", display: "grid", placeItems: "center" }}>
      <p className="u-eyebrow">ProofCompare · {locale}</p>
    </section>
  );
}
