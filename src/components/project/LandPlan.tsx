/**
 * The image a land programme does not have.
 *
 * Chaabi's only pictures of its lotissements are clip-art signposts on grass,
 * which would undercut every other page. This draws the thing itself instead:
 * a subdivision as the moucharabieh lattice the rest of the site uses — square
 * lots, one unit of void between them, a wider void where the roads run — with
 * the smallest and largest plot sizes written into two of the lots. It is an
 * abstraction, not a site plan, and is hidden from assistive technology: the
 * figures it shows are stated in text beside it.
 */
const COLS = 6;
const ROWS = 6;
const CELL = 88;
const GAP = 12;
const ROAD = 40;
/** Roads run after these column / row indices. */
const ROAD_AFTER_COL = 2;
const ROAD_AFTER_ROW = 2;

function offset(index: number, roadAfter: number) {
  return index * (CELL + GAP) + (index > roadAfter ? ROAD - GAP : 0);
}

const SIZE = offset(COLS - 1, ROAD_AFTER_COL) + CELL;

/**
 * The lattice is drawn left to right, but a label is read in its own script:
 * an Arabic "⁦150⁩ م²" is set right to left so the unit follows the
 * (already isolated) number the way Arabic reads it.
 */
const labelDir = (label: string) => (/[؀-ۿ]/.test(label) ? "rtl" : "ltr");

export function LandPlan({
  minLabel,
  maxLabel,
  className,
}: {
  minLabel: string;
  maxLabel: string;
  className?: string;
}) {
  const cells: { x: number; y: number; key: string }[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      cells.push({ x: offset(c, ROAD_AFTER_COL), y: offset(r, ROAD_AFTER_ROW), key: `${r}-${c}` });
    }
  }
  const small = { x: offset(1, ROAD_AFTER_COL), y: offset(1, ROAD_AFTER_ROW) };
  const large = { x: offset(3, ROAD_AFTER_COL), y: offset(3, ROAD_AFTER_ROW) };
  // The large lot spans two cells, so the plan says "bigger" without a number.
  const largeW = CELL * 2 + GAP;

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      className={className}
      direction="ltr"
      style={{ display: "block", inlineSize: "100%", blockSize: "auto" }}
    >
      {cells.map((cell) => {
        const inLarge =
          cell.y === large.y && (cell.x === large.x || cell.x === offset(4, ROAD_AFTER_COL));
        const isSmall = cell.x === small.x && cell.y === small.y;
        if (inLarge || isSmall) return null;
        return (
          <rect
            key={cell.key}
            x={cell.x}
            y={cell.y}
            width={CELL}
            height={CELL}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.22}
            strokeWidth={1.5}
          />
        );
      })}

      <rect x={small.x} y={small.y} width={CELL} height={CELL} fill="var(--color-ochre)" />
      <text
        x={small.x + CELL / 2}
        y={small.y + CELL / 2 + 8}
        textAnchor="middle"
        direction={labelDir(minLabel)}
        style={{ fontSize: 22, fontWeight: 600, fill: "var(--color-ink)", fontVariantNumeric: "tabular-nums" }}
      >
        {minLabel}
      </text>

      <rect
        x={large.x}
        y={large.y}
        width={largeW}
        height={CELL}
        fill="none"
        stroke="var(--color-ochre-bright)"
        strokeWidth={2.5}
      />
      <text
        x={large.x + largeW / 2}
        y={large.y + CELL / 2 + 8}
        textAnchor="middle"
        direction={labelDir(maxLabel)}
        style={{ fontSize: 22, fontWeight: 600, fill: "var(--color-ochre-bright)", fontVariantNumeric: "tabular-nums" }}
      >
        {maxLabel}
      </text>
    </svg>
  );
}
