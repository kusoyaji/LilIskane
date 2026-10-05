# Chaabi Lil Iskane — Digital Flagship Rebuild

Read this first in any new session. It's the handoff — what exists, what's pending, and
the operational gotchas that aren't written anywhere else.

**Read next, in this order:** [`DIRECTION.md`](DIRECTION.md) (concept, art direction, motion
principles — the *why* behind every design decision), [`REVIEW.md`](REVIEW.md) (honest
self-critique: what's strong, what's compromised, where the build deviated from the brief and
why), [`MOTION.md`](MOTION.md) (the scroll/media techniques written portably — library
evaluations with measured numbers, the containing-block trap, scroll-scrubbed video, on-approach
embeds, and how to verify motion without being fooled by a non-compositing viewport),
[`MEDIA-REQUESTS.md`](MEDIA-REQUESTS.md) and [`VIDEO-PROMPTS.md`](VIDEO-PROMPTS.md)
(footage/photography specs and the AI video-generation pipeline for the 3D camera sequence).

## Environment — read before touching the dev server

- **Working directory moved.** This project used to live in a OneDrive-synced folder
  (`OneDrive - Ecole Marocaine des Sciences de l'Ingénieur\Bureau\ChaabililIskanRedesign`).
  OneDrive's sync engine was intermittently corrupting writes into `.next` mid-flight
  (truncated JSON manifests → `Unexpected end of JSON input` crashes). The project was copied
  to `C:\dev\ChaabiLilIskane`, outside any sync folder. If you're reading this from `C:\dev`,
  good — that's resolved. If you're back in a synced folder, expect the crash to return.

- **Never run `npm run build` while `npm run dev` is running in the same directory.** Dev
  writes an unbundled `.next`; build overwrites it with a bundled production `.next`. Dev then
  can't resolve its own modules (`Cannot find module './778.js'`, `Cannot find module
  'react/jsx-runtime'`) and needs `.next` deleted and the server restarted. If you need a
  production build, stop the dev server first.

- **Don't kill a dev server you didn't start**, and don't assume a crash means the code is
  broken — check `.next` for truncated files and stale build artifacts before touching source.

- **PowerShell path handling breaks on the `[locale]` route folder.** `Test-Path`, `robocopy`,
  and most PowerShell path cmdlets treat `[` `]` as wildcards, so they silently misreport or
  skip `src/app/[locale]/...`. Use `-LiteralPath` (PowerShell) or plain `cp -r` (Bash) for
  anything touching that tree.

## What's built (v2 — the presentation build of 2026-10-06)

v1 is preserved as git tags `maquette-v1-deployed` / `maquette-v1-local`. The v2 contract is
[`docs/DESIGN-V2.md`](docs/DESIGN-V2.md) (hard rules: facts only from `src/data/*`, brand spelling,
one unified Morocco shape, renders always labelled, every link resolves, FR and AR complete).
The demo script and the open questions for the client are in [`docs/DEMO.md`](docs/DEMO.md).

**Foundation** — Next.js 15 App Router, TypeScript, Tailwind v4, CSS Modules, GSAP + Lenis. FR/AR
via `[locale]` routing, full RTL (logical properties, bidi-isolated numbers — `isolateRun` /
`formatNumber` in `src/i18n/config.ts`), Archivo + IBM Plex Sans Arabic. Section grounds via
`data-tone` on wrapper divs (`globals.css`; ink joins are hard cuts, light joins feather).

**Data — all 23 programmes on liliskane.com** (`src/data/projects.ts`), each checked against the
client's own fiche (address, surfaces, height, price, amenities, map pin). Status uses the client's
vocabulary: `STATUSES` (`en-lancement`, `en-construction`, `en-promotion`, `livre`, `complet`) plus
flags `readySoon` ("Livraison imminente"), `readyNow` ("Livraison immédiate") and `remisePct`
("En promotion · Remise 6 %"). **Every badge goes through `statusText()`** in
`src/content/projects.ts` — never print `STATUS_LABELS[status]` directly. No delivery years
anywhere: none is published. Company facts only from `src/data/company.ts`.

**Media pipeline** — `assets-src/` (gitignored originals) → `npm run media:prep` → `public/media`
+ two manifests: `media.generated.ts` (core; reaches client bundles via `Figure`, keep it small)
and `media.gallery.generated.ts` (`g_*` keys; **server-only**, read only by `GalleryFigure`).
Programme galleries are `src/data/galleries.ts`, generated from the curation of the client's
images — regenerate with the scratch generator rather than hand-reordering (the page hero's
picture is deliberately never a gallery's lead tile). `coreRef()` narrows a gallery image to one
`Figure` can draw.

**Home** (`src/components/home-v2`) — scroll-scrubbed opening film (`Film`/`FilmScrub`, the
AI camera move through Riad Garden II) → Heritage (ink; founding year as architecture, figures,
key dates, the client's institutional film) → Flagship (Riad Garden II) → ProofCompare (render vs
photograph slider, the "trust" device) → Showcase (pinned horizontal rail of all programmes) →
MapSection (Morocco map with loupes) → BudgetFinder (monthly payment → /projets, shares
`src/lib/credit.ts`) → Services → closing band.

**Project page** (`/projets/[slug]`, one template for all 23) — hero → cinematic sequence
(Riad Garden II only) → overview + "En bref" → gallery (spread + `GalleryLightbox`, a native
`<dialog>` viewer) → the programme's film → plans (RG2) → 360 tours (`TourCards`, Matterport,
FLIP open, preconnect on approach) → proof gallery (RG2) → amenities → location → credit
simulator → related → CTA band.

**Films** — `src/data/films.ts`: the client's YouTube films, click-to-play via
youtube-nocookie (`v2/YouTubeFilm` server poster + `YouTubePlayer` island). Posters are always
ours: several of the client's thumbnails print prices that contradict its fiches.

**Other pages** — `/projets` (facets incl. buyer-facing statuses `STATUS_FACETS` in
`src/lib/filter.ts`, SVG map, URL state, never-zero-results relaxation), `/a-propos` (films,
chronology, values, seals, guarantees), `/guide-achat` (steps + simulator), `/actualites`
(only "En lancement" programmes are launches; channel films), `/contact` (appointment form,
prefilled from `?projet=`), legal pages.

**Motion** — Emil Kowalski's rules (`transform`/`opacity`, ≤300 ms UI, `(hover: hover)`,
`prefers-reduced-motion`). Reveals via `ScrollChoreography` (`data-reveal="mask"` +
`.reveal-inner`, `.u-enter`, `data-reveal="media"`, `data-parallax`). Route enter fade in
`template.tsx`. Read the comments in `globals.css` before changing `.u-enter`.

## What's pending

- **Client confirmations** listed in `docs/DEMO.md` (film thumbnails quote prices that differ from
  the fiches; Jasmin exteriors may show Bougainvillier; Al Maamora lot sizes disagree within its
  own fiche; shared map pins; hi-res façades needed for Massylia, Jnane Souss, Al Yassamine,
  Assalam; no Amaïa interiors).
- **Video pipeline**: only clip 1 of the camera move exists. Clips 2–3 — `VIDEO-PROMPTS.md`.
- **Route exit animation**: only enter exists (needs View Transitions or a motion library).
- **Only Riad Garden II has plans, a proof set and a camera move.** Every other programme has the
  client's photographs, film and tour where they exist, and nothing invented beyond them.
- **Never tested on a real device** (Android mid-range, iOS Safari `svh`/video seek, screen
  readers). Everything was verified in desktop Chromium with emulation.
- **Dead CSS**: `.expand-*` and `.depth*` in `globals.css` belong to deleted v1 components.

## Verify before claiming anything works

`npm run dev`, then check the actual page — this project has a history of components that
*measure* correct (computed styles, DOM state) while being visually wrong, and of CSS that
looks right but silently no-ops because of Tailwind's `@layer` cascade order (utilities always
beat component-layer rules regardless of specificity — several past bugs came from this
exact trap; see the layering note at the top of `globals.css`).
