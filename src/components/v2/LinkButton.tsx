import Link from "next/link";
import s from "./v2.module.css";

type Variant = "primary" | "light" | "accent" | "outline";

const VARIANT: Record<Variant, string> = {
  primary: s.btnPrimary,
  light: s.btnLight,
  accent: s.btnAccent,
  outline: s.btnOutline,
};

/** The arrow points "forward" — it is mirrored in RTL by the stylesheet. */
export function Arrow() {
  return (
    <svg className={s.arrow} width="16" height="16" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pill button as a link. External and `tel:` hrefs render a plain anchor so
 * Next does not try to prefetch them.
 */
export function LinkButton({
  href,
  children,
  variant = "primary",
  arrow = true,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  const cls = [s.btn, VARIANT[variant], "u-press", className].filter(Boolean).join(" ");
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );
  if (/^(tel:|mailto:|https?:)/.test(href)) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
