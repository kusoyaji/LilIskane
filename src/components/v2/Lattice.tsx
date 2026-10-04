import { useId } from "react";
import s from "./v2.module.css";

/**
 * The moucharabieh from Chaabi's own facades as a ground texture for ink
 * panels: square cells with one unit of void, the rhythm of the concrete
 * screens in the Riad Garden renders. Decorative, so hidden from assistive tech.
 */
export function Lattice({ cell = 28 }: { cell?: number }) {
  const id = useId();
  const gap = cell / 8;
  return (
    <svg aria-hidden className={s.lattice} width="100%" height="100%">
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse">
          <rect x={gap / 2} y={gap / 2} width={cell - gap} height={cell - gap} fill="none" stroke="currentColor" strokeWidth={gap} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
