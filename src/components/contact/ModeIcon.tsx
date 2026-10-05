import type { MeetingMode } from "./model";

/** Line icons for the three appointment modes. Decorative: always beside a label. */
export function ModeIcon({ mode, size = 22 }: { mode: MeetingMode; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  if (mode === "agence")
    return (
      <svg {...common}>
        <path d="M3.5 20.5h17" />
        <path d="M5.5 20.5V8.5L12 4l6.5 4.5v12" />
        <path d="M9.5 20.5v-5h5v5" />
        <path d="M9 10.5h.01M15 10.5h.01" strokeWidth={2.2} />
      </svg>
    );
  if (mode === "telephone")
    return (
      <svg {...common}>
        <path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10.5l5-3v9l-5-3" />
    </svg>
  );
}
