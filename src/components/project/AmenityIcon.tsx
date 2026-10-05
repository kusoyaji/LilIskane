import type { Amenity } from "@/data/types";

/**
 * One line icon per amenity, drawn on a 32-unit grid with a single stroke
 * weight so the set reads as a family. Decorative: the label beside each icon
 * carries the meaning.
 */
const PATHS: Record<Amenity, React.ReactNode> = {
  piscine: (
    <>
      <path d="M10 20V7a3 3 0 0 1 6 0" />
      <path d="M20 20V7a3 3 0 0 1 6 0" />
      <path d="M10 12h10M10 16h10" />
      <path d="M3 24c2.2 0 2.2-1.6 4.4-1.6S9.6 24 11.8 24s2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6S27.2 24 29 24" />
      <path d="M3 28.5c2.2 0 2.2-1.6 4.4-1.6s2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6 2.2 1.6 4 1.6" />
    </>
  ),
  mosquee: (
    <>
      <path d="M5 28h22" />
      <path d="M9 28V17h14v11" />
      <path d="M9 17c0-4 3.2-6.5 7-8.5 3.8 2 7 4.5 7 8.5" />
      <path d="M16 8.5V5" />
      <path d="M27 28V10M25.5 10h3M27 10l0-3" />
      <path d="M14 28v-5a2 2 0 0 1 4 0v5" />
    </>
  ),
  ecoles: (
    <>
      <path d="M4 12l12-6 12 6-12 6z" />
      <path d="M9 14.5V21c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5v-6.5" />
      <path d="M28 12v8" />
    </>
  ),
  "parking-sous-sol": (
    <>
      <rect x="5" y="5" width="22" height="22" rx="2" />
      <path d="M13 22V10h4.5a3.5 3.5 0 0 1 0 7H13" />
    </>
  ),
  "espaces-verts": (
    <>
      <path d="M16 28V16" />
      <path d="M16 20l-4-3M16 18l4-3" />
      <path d="M16 4c5 0 9 4 9 9s-4 8-9 8-9-3-9-8 4-9 9-9z" />
      <path d="M8 28h16" />
    </>
  ),
  commerces: (
    <>
      <path d="M5 13l2-7h18l2 7" />
      <path d="M5 13c0 1.8 1.6 3 3.7 3s3.6-1.2 3.6-3c0 1.8 1.6 3 3.7 3s3.7-1.2 3.7-3c0 1.8 1.5 3 3.6 3S27 14.8 27 13" />
      <path d="M7 16v11h18V16" />
      <path d="M13 27v-6h6v6" />
    </>
  ),
  "centre-commercial": (
    <>
      <path d="M7 10h18l-1.5 18h-15z" />
      <path d="M12 13V8a4 4 0 0 1 8 0v5" />
    </>
  ),
  "aires-de-jeux": (
    <>
      <path d="M6 28V9h6v19" />
      <path d="M6 14h6M6 19h6M6 24h6" />
      <path d="M12 9c6 0 7 8 14 19" />
      <circle cx="23" cy="8" r="3" />
    </>
  ),
  "terrains-de-sport": (
    <>
      <circle cx="16" cy="16" r="11" />
      <path d="M16 5c-3.5 3-5 6.7-5 11s1.5 8 5 11" />
      <path d="M16 5c3.5 3 5 6.7 5 11s-1.5 8-5 11" />
      <path d="M5 16h22" />
    </>
  ),
  spa: (
    <>
      <path d="M16 26c-4-2.5-6-6-6-10 0-3 2-6 6-9 4 3 6 6 6 9 0 4-2 7.5-6 10z" />
      <path d="M16 26c-5.5 0-10-2.5-11-7 2.5-1 5-.8 7 .3" />
      <path d="M16 26c5.5 0 10-2.5 11-7-2.5-1-5-.8-7 .3" />
    </>
  ),
  ascenseur: (
    <>
      <rect x="7" y="4" width="18" height="24" rx="1.5" />
      <path d="M16 4v24" />
      <path d="M10 13l2-2.5 2 2.5M18 11l2 2.5 2-2.5" />
    </>
  ),
  securite: (
    <>
      <path d="M16 4l10 4v7c0 6.5-4.2 11-10 13-5.8-2-10-6.5-10-13V8z" />
      <path d="M11.5 16l3.2 3.2 6-6.2" />
    </>
  ),
  "vue-mer": (
    <>
      <path d="M10 17a6 6 0 0 1 12 0" />
      <path d="M16 6v3M7.5 9.5l2 2M24.5 9.5l-2 2M4 17h3M25 17h3" />
      <path d="M3 22c2.2 0 2.2-1.6 4.4-1.6S9.6 22 11.8 22s2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6S27.2 22 29 22" />
      <path d="M6 27c2 0 2-1.4 4-1.4s2 1.4 4 1.4 2-1.4 4-1.4 2 1.4 4 1.4 2-1.4 4-1.4" />
    </>
  ),
  "vue-montagne": (
    <>
      <path d="M3 26l9-14 5 7 4-5 8 12z" />
      <path d="M9.5 16l2.5 2 2-2" />
      <circle cx="24" cy="7.5" r="2.5" />
    </>
  ),
  plage: (
    <>
      <path d="M5 13c1.5-5 6-8 11-8s9.5 3 11 8c-2-1.4-4-1.4-5.5 0-1.5-1.4-4-1.4-5.5 0-1.5-1.4-4-1.4-5.5 0-1.5-1.4-3.5-1.4-5.5 0z" />
      <path d="M16 13l4 14" />
      <path d="M4 27h24" />
    </>
  ),
};

export function AmenityIcon({ amenity, size = 32 }: { amenity: Amenity; size?: number }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[amenity]}
    </svg>
  );
}
