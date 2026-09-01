/**
 * Pass-through root layout.
 *
 * `<html>` and `<body>` live in `app/[locale]/layout.tsx` instead, because the
 * `lang` and `dir` attributes have to be set from the route's locale segment.
 * Setting `dir="rtl"` on the html element (rather than on a wrapper div) is what
 * makes every logical property, scrollbar side, and native form control flip
 * correctly — a wrapper would leave the scrollbar and the date picker on the
 * wrong side.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
