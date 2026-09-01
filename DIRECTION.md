# DIRECTION

## The concept — *le rendu et le réel*

Every developer selling off-plan sells a promise. Chaabi Lil Iskane is the only one that can
set a promise beside its own kept promises — forty years of them, tens of thousands of homes.

So the site's central mechanism is an explicit, labelled pairing: **this is the render of what
we're building; this is what we delivered last time, photographed, walkable in 360 right now.**

It answers the trust problem with evidence instead of adjectives. It cannot be copied by a
competitor who hasn't built anything. And it turns the legally-required `caractère d'ambiance`
disclaimer from a grey apology into the setup for the proof. The disclosure *is* the argument.

## Art direction

**Moroccan vocabulary as structure, not ornament.** The moucharabieh lattice is already in
Chaabi's own facades — it becomes the layout module, the image mask, the map pin, the loading
state. Geometry carries the grid. No zellige wallpaper, no decorative arches.

**Light.** These renders have hard Marrakech sun and real black shadow. The site commits to
high-key warmth rather than the misty grey-blue of international-luxury default.

**Colour, pulled from the assets rather than invented.** Warm limestone paper, warm near-black
ink, Marrakech terracotta as the single accent, oxblood from the interiors, palm green reserved
to mean *livré*. Every neutral is warm — no grey-blue anywhere in the system.

**Type.** One Latin family in two registers: `Archivo` variable, exploiting its real width axis —
display set large and tight, labels set small and wide-tracked. Arabic gets
`IBM Plex Sans Arabic`, chosen because it is Naskh-derived and warm rather than geometric Kufi,
so the RTL build reads as the same brand and not a translation. Prices are always tabular figures.

## Motion — the camera principle

Reveals are **wipes, not fades**. Type arrives from behind its own baseline; images settle out
of a 1.06 scale as they fade up, finishing after the words have landed. That lag is what gives
a frame weight instead of making it appear. Blocks fire while still below the fold, so one
section begins arriving as the previous is leaving.

**Transform and opacity only.** Headings clip with `overflow: hidden` and translate an inner
span; nothing animates a paint-time property. Two earlier versions are documented in
`globals.css` because both are tempting and both are wrong: `clip-path` gives the element an
empty intersection rectangle, so the observer meant to reveal it never fires; animated
`mask-size` fixes that but repaints every frame.

Timing is 620ms for type, 900ms for media, 70ms stagger capped at four steps. An earlier pass
ran at 1100/1600ms and read as sluggish rather than elegant — fluidity comes from the easing
curve's fast start and long tail, not from a long duration. Controls carry asymmetric press
feedback: down in 100ms, back up in 180ms, hover gated behind `(hover: hover)` so it never
sticks after a tap.


If something moves, it is because the viewer is moving through space, or because a material is
revealing itself. Nothing fades up to prove animation was implemented.

1. Media leads, type follows — type never moves before the image it belongs to has settled.
2. One transform per moment.
3. Two easings only: a long decelerating curve for camera moves, a short one for UI.
4. `prefers-reduced-motion` converts the camera sequence into a stepped sequence tied to scroll
   position. Every frame is still seen; only interpolation is dropped. Reduced-motion users get
   the whole story, not a broken one.
5. Scroll is never hijacked. The price is always reachable.

   Amended: scroll is now *weighted* — Lenis interpolates the wheel's step function so the page
   carries momentum and settles instead of jumping a detent at a time. This is not the thing the
   rule was written against. The rule forbids taking control of *where the user ends up* —
   snap-locking sections, forcing a sequence, putting distance between someone and the price.
   Lenis changes only how the same scroll arrives, never where it can go: every position stays
   reachable at any speed, anchor jumps and keyboard paging stay native and instant, touch
   scrolling is left entirely alone, and under `prefers-reduced-motion` no instance is created.
   If it ever reads as obstruction rather than weight on a page whose purpose is reachable
   information, it comes out — see the open items in `MOTION.md`.

## The camera path

The project page's sequence is a **scroll-scrubbed film**, not a video that plays at you. The
playhead is driven by scroll position, so the building comes toward you at exactly the rate you
scroll and stops when you stop. Captions crossfade on the same progress value that drives the
playhead, so the words always describe the frame on screen.

Three modes, chosen after mount so the server render is never wrong: **scrub** on pointer
devices (5.6 MB, keyframe every 5 frames so any seek lands immediately); **loop** on touch,
because seeking during a touch scroll is unreliable on iOS Safari (0.95 MB half-resolution);
**static** under reduced motion — poster frame, all captions listed, no video fetched at all.

Route changes fade in over 380ms on a front-loaded curve — content is at 90% opacity within
100ms, so navigation reads as instant while still settling rather than snapping. Opacity only:
a transform on the route wrapper would become the containing block for every fixed and sticky
descendant and silently break the pinned stages.

## The 360

Not an icon, not a modal, and not a click. The tour loads **on approach** — an observer starts
the Matterport about 700px before the section reaches the viewport, so the scene is already live
when the user arrives. The still stays on top until the iframe reports ready, then dissolves.
There is no button and no spinner; you simply end up inside the apartment.

Only the active tour mounts. Three live WebGL contexts at 10–15 MB each would make the page
unusable on the target device. The click gate survives in exactly one case: when the browser
reports `saveData` or a 2G/3G connection, we do not spend someone's data without asking.

## Search

Budget is denominated in **DH/month**, because that is the number these buyers actually have.
The monthly-payment control shares its engine with the credit simulator: one calculation module,
two surfaces. Home carries a three-control qualifier with a live count and no dead-end submit.
`/projets` carries the full map-and-facets surface with URL state.

**Zero results are impossible.** The weakest facet relaxes automatically and says so.

## Structure

**Home** — hero, type low-left, delivered-homes count as the argument · qualifier, high · *le
rendu et le réel* · portfolio as a **geographic index**, not a card grid, because 14 projects
across 15 cities is precisely where grids collapse · the 485K–2.45M range as a segment argument ·
simulator · footer.

**Project** — price and status above the fold, always · camera sequence aerial → courtyard →
interior · the 360 moment · the delivered proof · typologies with per-unit pricing · location ·
simulator pre-filled · booking.

**/projets** — the search as a real destination. Map and list, live facet counts, shareable URL.

## Budget

No animation library, no UI kit, no map library. Motion is CSS plus one ~40-line scroll hook,
and exactly one third-party motion dependency: Lenis, at a measured 5.2 KB gzipped with no
dependencies of its own, for scroll weighting. GSAP (44.6 KB for core + ScrollTrigger) and
Vanta (88.7 KB, because it requires three.js) were both evaluated against real measurements and
declined — the reasoning, and the numbers, are in `MOTION.md` §0 so the question does not get
re-litigated from memory.
Every image is AVIF with a WebP fallback, a real `sizes` attribute and a generated LQIP. The
Matterport iframe is never in the initial load.

**Measured:** 129–137 KB first-load JS; all 35 routes prerendered. Was 127–136 KB before the
security patch to Next 15.5.21 and the addition of Lenis. Lenis ships in a first-load chunk
(verified: its chunk is referenced in the prerendered document, so it is not deferred) and
measures 5.5 KB gzipped there; the reported route totals moved by only about a kilobyte, which
is chunk rebalancing between builds rather than the library being free.

The stated target was ≤ 120 KB and it was not met. The honest accounting: 102 KB of that is the
React 19 + App Router baseline, which is fixed by the stack choice, and application code is
only 3.7–9.5 KB per route. The budget was set before measuring the floor. Getting under 120 KB
would mean leaving Next.js, not trimming this code — see the review for what that trade would
cost the handoff.

## References

Sankari for restraint and pacing. Azizi for the portfolio-navigability problem. Amali is used
only for its commitment to full-bleed media — its centred ghosted headline over a water loop is
close to the failure mode this brief names, and is treated as a thing to avoid. `jbschool.ae`
no longer resembles the site the brief describes; nothing was taken from it.
