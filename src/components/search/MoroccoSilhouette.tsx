import { MOROCCO_PATH, MOROCCO_VIEWBOX, projectMorocco } from "@/data/morocco-geo";

export { projectMorocco };

/** Margin around the outline, in viewBox units, so pins and labels never clip. */
export const MAP_PAD = 24;

/**
 * Morocco as one shape, from `src/data/morocco-geo.ts` and nothing else.
 *
 * The outline is a single unified path including the southern provinces; this
 * component fills it, textures it with the moucharabieh lattice and strokes its
 * outer edge — and never draws, outlines or labels anything inside it. It is
 * always shown whole: cropping the south away would say something too.
 *
 * Rendered on the server; overlays (pins, labels) are passed as children so an
 * interactive layer can be a small client component while the 11 kB outline
 * stays in the HTML.
 */
export function MoroccoSilhouette({
  children,
  label,
  className,
  tone = "ink",
  idBase,
}: {
  children?: React.ReactNode;
  /** Accessible name for the map as a whole. */
  label: string;
  className?: string;
  /** Ground the map sits on. */
  tone?: "ink" | "paper";
  /** Unique per page: prefixes the pattern and clip ids. */
  idBase: string;
}) {
  const id = idBase;
  const onInk = tone === "ink";
  const { width, height } = MOROCCO_VIEWBOX;

  return (
    <svg
      viewBox={`${-MAP_PAD} ${-MAP_PAD} ${width + MAP_PAD * 2} ${height + MAP_PAD * 2}`}
      role="group"
      aria-label={label}
      className={className}
      // Geography does not mirror in RTL; Arabic labels still shape correctly.
      direction="ltr"
      style={{ display: "block", inlineSize: "100%", blockSize: "auto", overflow: "visible" }}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <path d={MOROCCO_PATH} />
        </clipPath>
        <pattern id={`lat-${id}`} width={18} height={18} patternUnits="userSpaceOnUse">
          <rect x={1.5} y={1.5} width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.4} />
        </pattern>
      </defs>

      <path
        d={MOROCCO_PATH}
        fill={onInk ? "color-mix(in oklab, var(--color-paper) 7%, transparent)" : "var(--color-sand)"}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={`url(#lat-${id})`}
        clipPath={`url(#clip-${id})`}
        style={{
          color: onInk ? "var(--color-paper)" : "var(--color-ink)",
          opacity: onInk ? 0.07 : 0.06,
        }}
      />
      <path
        d={MOROCCO_PATH}
        fill="none"
        stroke={onInk ? "color-mix(in oklab, var(--color-paper) 34%, transparent)" : "color-mix(in oklab, var(--color-ink) 30%, transparent)"}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {children}
    </svg>
  );
}
