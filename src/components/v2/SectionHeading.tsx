import s from "./v2.module.css";

/**
 * Eyebrow, display title and lead — the opening of almost every section.
 * The title uses the site-wide word-by-word wipe (ScrollChoreography picks up
 * `data-reveal="mask"` + `.reveal-inner`), so headings behave the same on
 * every page without each section re-implementing it.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  as: Tag = "h2",
  eyebrowColor = "var(--color-ochre-deep)",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  /** Use `var(--color-ochre-bright)` on ink. */
  eyebrowColor?: string;
}) {
  return (
    <div className={[s.heading, align === "center" ? s.headingCenter : ""].join(" ")}>
      {eyebrow && (
        <p className="u-eyebrow u-enter" style={{ color: eyebrowColor }}>
          {eyebrow}
        </p>
      )}
      <Tag className={`u-display ${s.headingTitle}`} data-reveal="mask">
        <span className="reveal-inner">{title}</span>
      </Tag>
      {lead && <p className={`u-enter ${s.headingLead}`}>{lead}</p>}
    </div>
  );
}
