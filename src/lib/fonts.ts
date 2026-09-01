import { Archivo, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * Archivo, loaded with its width axis.
 *
 * The width axis is the point. Chaabi's display type is set semi-expanded and
 * tight (112% / -0.03em) so large headings read like signage cut into stone,
 * while eyebrows sit at normal width with wide tracking. One family, two
 * registers, no second download.
 */
export const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  // Fallback metrics are adjusted automatically by next/font, which keeps CLS
  // at zero while the variable font streams in.
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

/**
 * IBM Plex Sans Arabic for the RTL build.
 *
 * Chosen over Cairo/Almarai because it is Naskh-derived rather than geometric
 * Kufi: it has real joins, proper kerning on diacritics, and a warmth that sits
 * with Archivo instead of fighting it. The Arabic site is not the French site
 * mirrored — it gets its own face, its own type ramp, and no letter-spacing.
 */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  fallback: ["Segoe UI", "Tahoma", "sans-serif"],
});
