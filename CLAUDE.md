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

## What's built

**Foundation** — Next.js 15 App Router, TypeScript, Tailwind v4. FR/AR via `[locale]` routing,
full RTL support (logical properties, bidi-isolated numbers/phone numbers — see
`src/i18n/config.ts`), Archivo + IBM Plex Sans Arabic. Palette sampled programmatically from
Chaabi's own renders, not chosen from a swatch — see `src/styles/tokens.css`.

**Home** — hero (static, LCP-first) → proof stage (scroll-wiped render/photograph comparison,
the site's central "trust" device) → delivery record → budget qualifier (shares
`src/lib/credit.ts` with the simulator) → **expanding frame** (Amali-style: a photograph grows
from a tile to full-bleed on scroll, hinge into the portfolio section) → portfolio index
(geographic, not a card grid) → price-range argument → footer.

**Project page** (`riad-garden-ii`, the only fully-built project) — hero → **cinematic
sequence**: a scroll-scrubbed video (not autoplay — the playhead is driven by scroll position)
using the AI-generated camera move, `public/video/sequence.mp4` (desktop scrub encode, dense
keyframes) / `sequence-sm.mp4` (mobile loop) — → Matterport 360 tours, **preloaded on
approach** (~700px before viewport, not click-gated, except on metered connections) → proof
gallery (draggable compare slider) → typologies → location/amenities → credit simulator →
booking form.

**Search** (`/projets`) — facet filters, SVG index-map (no tile-map library), URL-driven state,
never-zero-results relaxation logic in `src/lib/filter.ts`.

**Motion system** — audited against Emil Kowalski's rules (`transform`/`opacity` only, ≤300ms
UI timing, asymmetric press feedback, `(hover: hover)` gating, `prefers-reduced-motion`
throughout). Route transitions via `template.tsx` (enter-only fade; App Router has no exit
phase without a motion library). Full rationale and the two "tried it, it was wrong" histories
(clip-path deadlocking its own IntersectionObserver; animated `mask-size` not compositing) are
documented as comments directly in `src/styles/globals.css` — read those before changing
`.u-enter` or `.expand-*`.

## What's pending

- **Video pipeline**: only clip 1 (arrival: street → facade → courtyard → terrace threshold) is
  generated and live. Clips 2–3 (crossing the threshold, through the salon) still need
  generation — full prompts and the frame-chaining technique are in `VIDEO-PROMPTS.md`.
- **Amali interstitial**: the cloud-white atmospheric field with scattered depth images between
  sections — not built. The expanding-frame hinge covers *scale*; it doesn't cover this.
- **Persistent-headline hero**: Amali's "headline stays fixed, background media swaps beneath
  it" pattern — not built. Would mean rebuilding the home hero, not just adding a section.
- **Route exit animation**: only enter exists. Needs View Transitions API or a motion library to
  do properly.
- **Only Riad Garden II has full depth** (typologies, tours, proof pairs). The other 13 projects
  in `src/data/projects.ts` have prices/summaries/filtering but no deep content — intentional,
  per the brief's stress-test requirement, but worth knowing before assuming a project page
  "should" look like Riad Garden II's.
- **Amaïa has no usable imagery** — its six source files are PDF-page exports at 2116px with no
  interiors. Flagged in `MEDIA-REQUESTS.md`.
- **Never tested on a real device.** Everything verified via desktop Chromium + measurement.
  No real mid-range Android, no real 4G, no real screen reader, no iOS Safari (matters for
  `svh` units and the video-scrub `clip-path`/seek behaviour).
- **Client bundle ships full portfolio data in both languages** — search/filter components
  import the whole dataset rather than a server-projected, locale-scoped index. Flagged as the
  largest remaining perf win in `REVIEW.md`.

## Verify before claiming anything works

`npm run dev`, then check the actual page — this project has a history of components that
*measure* correct (computed styles, DOM state) while being visually wrong, and of CSS that
looks right but silently no-ops because of Tailwind's `@layer` cascade order (utilities always
beat component-layer rules regardless of specificity — several past bugs came from this
exact trap; see the layering note at the top of `globals.css`).
