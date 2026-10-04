# DESIGN v2 — brief for the presentation build

Presented to Chaabi Lil Iskane's own leadership on **2026-10-06**. v1 is preserved as git tags
`maquette-v1-deployed` and `maquette-v1-local`. This document is the contract every part of v2 is
built against. When in doubt, re-read §2.

---

## 1. What they must feel

The people in the room built these buildings, and have done since 1948. They know every figure,
every façade, every spelling. The site must make them feel **proud and precisely represented** —
and then show them a website that will **sell** better than anything they have.

So: authority without bombast. Generous space, big confident type, their real buildings large.
Every click lands somewhere finished. Nothing reads as a template, a wireframe or a stock site.

## 2. Hard rules — breaking any of these fails the presentation

1. **Facts come only from `src/data/company.ts`, `src/data/projects.ts`, `src/data/cities.ts`.**
   Founded **1948**. "Plus de 75 ans". ISO 9001 since **2005**. 1er Prix de la Ligue Arabe de
   l'Habitat **2003**. Essaouira El Jadida **11 000** logements / **180 ha**. **15** villes.
   Never write "1980", never write "40 000 logements", never invent any number, date, award,
   client count, testimonial, partner bank, press quote or review.
2. **Brand:** "Chaabi Lil Iskane" / **"الشعبي للإسكان"**. Group: Groupe Ynna / مجموعة ينا.
3. **Map of Morocco:** only `src/data/morocco-geo.ts`. It is one unified shape including the
   southern provinces. Never draw, outline or label any boundary inside it.
4. **Never present stock or AI imagery as a Chaabi programme.** `st_*` are Unsplash stock —
   atmosphere only, never captioned as Chaabi's. Do **not** use `hero_courtyard` (generic AI city).
   Do **not** use `public/video/atrium.mp4` (it misspells the brand).
5. **Renders are labelled renders.** Any `nature: "render"` image shown as a programme visual
   carries a small "Rendu — image non contractuelle" / "تصور — صورة غير تعاقدية" note somewhere
   near it (caption or corner). Photographs (`rg1_*`) are what was delivered.
6. **Every link resolves.** Internal routes that exist: `/{locale}`, `/projets`,
   `/projets/[slug]`, `/a-propos`, `/guide-achat`, `/contact`, `/actualites`, `/mentions-legales`,
   `/donnees-personnelles`. Link nowhere else.
7. **French and Arabic, both complete.** Every visible string exists in both. Arabic is not a
   mirrored afterthought — check `/ar` as carefully as `/fr`.

## 3. Concept and narrative

v1 opened on a provocation over a generic skyline. v2 **walks the visitor in, then makes the
case**:

1. **Film** — scroll-scrubbed walk into Riad Garden II (`/video/sequence.mp4`: street → façade →
   courtyard pool → terrace → salon). Their real architecture. The opening act.
2. **Heritage** — since 1948; 75+ years; ISO 9001 since 2005; Arab League prize; 15 cities.
3. **Flagship** — Riad Garden II, the programme being launched.
4. **Le rendu et le réel** — drag to compare a render with the delivered building. A live demo
   moment for the meeting.
5. **Showcase** — the portfolio as large cards on a horizontal scroll.
6. **Map** — Morocco, 15 cities, where the programmes are.
7. **Budget** — start from the monthly payment; see what it buys.
8. **Services** — guide d'achat, simulateur, visites 360°, rendez-vous.
9. **Rendez-vous** — `CtaBand`.

## 4. Visual language

**Tokens:** `src/styles/tokens.css` — use only these. Paper `--color-paper`, warm
`--color-paper-warm`, sand `--color-sand`, ink `--color-ink` (warm olive-black), single accent ochre
(`--color-ochre` fill · `--color-ochre-deep` text on paper · `--color-ochre-bright` text on ink),
olive reserved for **livré**.

**Type:** Archivo (Latin) / IBM Plex Sans Arabic. `.u-display` for display, `--text-mega` for
page-opening statements, `--text-display` for section titles, `.u-eyebrow` for labels, `.u-body`
for reading text, `.u-numeric` for prices and figures. **Go big.** v1's weakness was small type
floating in large empty beige fields. Fill the frame: either a big image, or big type, never a
small thing alone in a void.

**Grounds:** sections declare `data-tone` on a wrapper (`ink | paper | warm | sand`) and paint no
background themselves — `Field` blends between them. Any section on a dark ground or full-bleed
image must also carry `data-nav-media` so the header turns light.

**Imagery:** fewer, larger. Full-bleed or near-full-bleed for hero moments. Object-fit cover,
generous crops. Never stretch a small asset (see §8). The lattice (`<Lattice />`) is the only
ornament allowed — on ink panels only.

**Layout:** `.u-shell` for the content column (max 96rem, fluid gutter). Use CSS grid. Asymmetric
editorial compositions beat centred stacks. Section vertical padding ≥ `clamp(5rem, 12vh, 9rem)`.

## 5. Motion

Already global — use it, don't rebuild it:

| Markup | What happens |
| --- | --- |
| `data-reveal="mask"` on a heading + inner `<span className="reveal-inner">` | words wipe up from their baseline |
| `className="u-enter"` | rises and fades, staggered within its section |
| `data-reveal="media"` on a frame containing an img/video | frame arrives, image settles from 1.32× |
| `data-parallax="0.3"` | drifts against scroll |

For pinned / scrubbed / horizontal sections use GSAP: `import { gsap, ScrollTrigger } from
"@/components/motion/gsap"`, always inside `gsap.matchMedia()` with a
`(prefers-reduced-motion: no-preference)` branch and a readable static fallback. Lenis smooth
scroll is active site-wide (window scroll is native, `position: sticky` works). **Transform and
opacity only.** Pin with ScrollTrigger `pin`, never by animating layout. See `TourCards.tsx` for a
working pinned horizontal pan, `CinematicSequence.tsx` for scroll-scrubbed video.

## 6. Arabic / RTL

- Logical properties only (`inline`, `block`, `inset-inline-start`, `margin-inline-end`…). Never
  `left/right` for layout.
- **Numbers:** always `formatNumber(n, locale)` or `isolateRun(str, locale)` from
  `@/i18n/config`. Never a hard-coded "40 000" inside an Arabic sentence. A number in a display
  heading must be a single formatted run.
- No letter-spacing in Arabic (already enforced globally) — don't fight it.
- Directional icons (arrows, chevrons) must mirror in RTL (`LinkButton`'s `Arrow` already does).
- Check `/ar/...` with the shoot tool every time you check `/fr/...`.

## 7. Engineering rules for parallel work

- **You own only the files your task names.** Do not edit anything else — especially not
  `src/styles/globals.css`, `src/styles/tokens.css`, `src/i18n/*`, `src/app/[locale]/layout.tsx`,
  `src/components/chrome/*`, `src/components/v2/*`, `src/components/motion/*`,
  `src/data/projects.ts`, `src/data/company.ts`. If you believe a shared file needs a change, say
  so in your report — do not make it.
- **Styles:** a CSS Module beside your component (`Foo.module.css`) plus Tailwind utilities.
  Tokens via `var(--…)`.
- **Copy:** a typed module `src/content/<area>.ts` exporting `Copy<{…}>` (see
  `src/content/shared.ts`). Both languages, every key.
- **Server first.** Pages and sections are server components. Interactive parts are small
  `"use client"` children that receive **only the data they need** as props. Never import
  `src/data/projects.ts` into a client component (it would ship the whole portfolio in both
  languages) — project data for client components goes through `toListItems()` from
  `src/data/list.ts` or a hand-picked prop.
- **Dev server:** one shared server on `http://localhost:3000`, started from `C:\dev`. **Never
  start, stop or restart it. Never run `npm run build`.** If it is unreachable, wait and retry; if
  it stays down, continue with typecheck and say so.
- **Typecheck:** `npx tsc --noEmit -p C:/dev/ChaabiLilIskane` — other builders are working at the
  same time, so judge only errors in **your** files.
- **Look at your work:** `node <scratchpad>/shoot.cjs /fr/your-route your-name` and the same for
  `/ar/...`. Read the printed `*-sheet.jpg` with the Read tool, then individual frames for detail.
  It also reports console errors, failed requests and horizontal overflow. Iterate until it looks
  like the best real-estate site you have seen, at 1440 and at 390.
- **Bash on Windows:** Git Bash rewrites leading-slash arguments; `shoot.cjs` already undoes it.
  For PowerShell paths containing `[locale]`, use `-LiteralPath`.

## 8. Assets

Visual catalogue: `<scratchpad>/shots/media-catalog.jpg` (every key, labelled with its pixel size).
Key list: `<scratchpad>/media-keys.txt`.

| Use freely, full-bleed | Use small only (≤ 480px wide) | Do not use |
| --- | --- | --- |
| `rg1_*` (delivered Riad Garden I photography, 2560px) · `rg2_*` (Riad Garden II renders, 2560px) · `th_amaia`, `th_assalam_tg`, `th_bougainvillier`, `th_izdihar`, `th_oceane`, `th_odyssee` · `villas_pool_*` · `st_*` (stock — atmosphere only) | `th_dyar_al_bahia` (1304) · `th_odyssee_studios` (1536) · `lobby_terrazzo` (730) · `aerial_resort` (654) · `maquette_model` (515) · `facade_street` (282) | `hero_courtyard` · `th_lots` and `th_maamora` (clip-art signposts — give land programmes a typographic/lattice card instead) · `atrium.mp4` |

Video: `/video/sequence.mp4` (1280×720, 10 s, dense keyframes — scrub master),
`/video/sequence-sm.mp4` (mobile loop), `/video/sequence-poster.jpg` (first frame).

## 9. Code you can build on

- Data: `projects`, `getProject(slug)` (`src/data/projects.ts`) · `cities`, `cityById`, `getCity`
  (`src/data/cities.ts`) · `toListItems(projects, locale)` (`src/data/list.ts`) · `company`,
  `milestones`, `values`, `guarantees` (`src/data/company.ts`) · `MOROCCO_PATH`,
  `MOROCCO_VIEWBOX`, `projectMorocco(lat, lng)` (`src/data/morocco-geo.ts`).
- Logic: `src/lib/credit.ts` (monthly payment / affordability) · `src/lib/filter.ts` (search,
  never-zero relaxation, URL params) · `src/lib/format.ts` (`formatPrice`, `formatMonthly`,
  `formatSurfaceRange`, `statusLabel`, `statusColor`, `effectiveTotal`).
- i18n: `getDictionary(locale)` (`src/i18n`) for existing shared strings (nav, footer, common,
  project labels) · `formatNumber`, `isolateRun`, `dirOf` (`src/i18n/config.ts`).
- Components: `Figure` (the only image component) · `CreditSimulator` · `BookingForm` ·
  `TourCards` · `ProofGallery` · `CinematicSequence` · `Typologies` · `LocationAndAmenities` ·
  v2 primitives `PageHero`, `SectionHeading`, `LinkButton`, `Stat`, `CtaBand`, `Lattice`
  (`src/components/v2`).
- Client's own source texts (for pages built from their content): `<scratchpad>/client/*.txt`
  (about, guide, financement, conventions, contact, actualites, home). Rewrite in our voice; keep
  their facts.

## 10. Definition of done

- Looks premium and finished at **1440×900** and **390×844**, in **FR and AR**.
- No console errors, no failed requests, **zero horizontal overflow**.
- Headings reveal, media settles, interactive parts work by mouse, touch and keyboard, with
  visible focus. Reduced motion shows everything, statically.
- Every fact traceable to §2's sources. Every link resolves.
