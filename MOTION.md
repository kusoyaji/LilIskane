# MOTION

Scroll, media and motion techniques used in this project, written to be portable.

Nothing here is specific to what the site sells. Every section describes a problem, the
technique, the measurements behind it, and the failure modes that are worth knowing before you
reach for it. Where a decision went the other way — a library evaluated and declined — the
reasoning is recorded too, because "we already looked at that" is only useful if the numbers
come with it.

---

## 0. Library evaluation

Three libraries were evaluated for adoption. Sizes below are **measured**, not quoted: each
package's published minified bundle was downloaded and gzipped locally (`curl | gzip -9 -c | wc -c`),
because published figures are inconsistent about whether they include dependencies.

| Library | Measured gzipped | Deps | Licence | Verdict |
| --- | --- | --- | --- | --- |
| **Lenis** 1.3.25 | **5.2 KB** (5.5 KB as bundled) | none | MIT | **Adopted** |
| GSAP core | 27.6 KB | none | free since 2024 (Webflow) | Declined for now |
| GSAP ScrollTrigger | 17.6 KB | requires core | ” | ” |
| three.js | 84.5 KB | none | MIT | — |
| Vanta effect (fog / waves) | 4.2 / 3.9 KB | **requires three.js** | MIT | **Declined** |

Baseline for context: this project ships **103 KB** of shared first-load JS, of which ~102 KB is
the framework floor. Route totals are 129–137 KB.

A caution on reading a bundler's "first load" table: after adding Lenis those totals moved by
only ~1 KB, which looks like the library was free. It was not — its chunk is referenced in the
prerendered document and measures 5.5 KB gzipped. The table shifted because chunks rebalanced
between builds. Verify what actually ships by finding the library in the built chunks and
checking whether that chunk is referenced in the initial HTML, rather than trusting a diff of
summary figures.

### Lenis — adopted

Interpolates the wheel's step function into weighted, settling motion. This is the single
highest ratio of perceived quality to bytes available: roughly 4% more JS for the thing that
most separates a site that *feels* expensive from one that merely looks it.

Adoptable because **it scrolls the window natively** rather than transforming a wrapper element.
That distinction is the whole evaluation:

- `position: sticky` keeps pinning. Verified: a pinned stage stayed `position: sticky` with
  Lenis active.
- `getBoundingClientRect()` keeps returning truthful numbers, so existing scroll-progress maths
  needs no changes. Verified: across a pinned section, `rect.top` ran 0 → −1584 and derived
  progress 0 → 1, exactly linear.
- No new containing block is introduced (see §2).

Older smooth-scroll libraries translated a wrapper instead, which breaks all three.

### GSAP — declined *for now*, not rejected

Now genuinely free including every plugin, so licensing is not the objection. Two things are:

1. **44.6 KB gzipped** for core + ScrollTrigger is ~33% on top of a route budget that is already
   over its target.
2. It would replace working code rather than add capability. Pinning, scroll progress, sequence
   crossfades and video scrubbing already exist here in ~40 lines plus CSS. ScrollTrigger is an
   excellent authoring tool, but authoring was never the bottleneck.

Revisit if timeline orchestration becomes the constraint — many overlapping, precisely
sequenced scroll animations are where ScrollTrigger stops being a luxury. A design language of
"one transform per moment" never gets there.

### Copy-paste "scroll to expand" components — declined, effect kept

Component marketplaces ship a popular scroll-expanding hero. The effect is worth having; the
common implementation is not, and it is worth knowing why before pasting one in:

- **It takes the wheel.** `preventDefault()` on every wheel event plus a forced
  `scrollTo(0, 0)` until the animation completes — the page is pinned at the top until the user
  has "paid" for the expansion. That is scroll-jacking in the strict sense, and it also collides
  head-on with any smooth-scroll library, since both want to own the same input.
- **It animates pixel `width`/`height`.** Layout properties: every frame relayouts and repaints.
  The same visual is achievable with one `transform: scale()`, which stays on the compositor.
- **It pulls in an animation library** for what is ultimately a single interpolated number.
- No reduced-motion path, and hard-coded colours.

The effect itself — media growing from a tile to full-bleed as you scroll — is §4 plus a scaled
frame, and costs nothing beyond what a pinned stage already provides. Build it on scroll
*position* rather than instead of it: the expansion is driven by where the reader already is, so
scrolling never stops working and the section can be passed at any speed.

### Vanta — declined

Not primarily about the 88.7 KB (three.js + one effect), though that alone is ~65% on top of a
route. Three harder objections:

1. **It is the wrong tool for the effect people usually want from it.** Vanta draws *generative*
   WebGL noise — fog, waves, birds. The atmospheric look it gets reached for is normally
   photographic depth layering: real images at different parallax rates. Generative fog does not
   resemble that and cannot be made to.
2. **WebGL contention.** This project already mounts a third-party 3D tour, each instance a live
   WebGL context in the 10–15 MB range. A second continuously-animating context competes for the
   same GPU and battery on mid-range hardware.
3. **It argues against the content.** A site whose thesis is evidence over adjectives should not
   put a decorative shader behind the evidence.

Depth layering costs ~0 KB in CSS (§6) and looks more like the reference than Vanta does.

---

## 1. Scroll architecture

### Progress as a CSS variable, not React state

The load-bearing pattern. A scroll listener writes a single number to a custom property on one
element; all animation is expressed in CSS against that variable.

```
scroll → rAF (coalesced) → element.style.setProperty('--p', 0…1) → CSS does the rest
```

React renders **once**. Per-frame work is one `setProperty` on one element, and compositing is
the browser's. Driving the same animation through React state re-renders a component tree sixty
times a second to animate an opacity, which is how scroll effects come to jank on mid-range
hardware.

Two framings of "progress" are needed and they are not interchangeable:

- **viewport** — the element crossing the whole viewport. Right for a block that reveals as it
  passes.
- **pinned** — only the stretch during which a sticky child is actually held.

Using the viewport measure on a pinned section is a subtle, costly bug: progress reaches only
~0.7 by the time the pin releases, so anything mapped to it silently never completes. An image
that should finish full-bleed stops at 89% and nothing errors.

### Reduced motion

Preference is read once; when set, **no listener is attached and nothing is written**, so the
stylesheet's own value for the variable wins. That lets each component declare its reduced-motion
end state in CSS — typically the finished state, or both frames shown side by side — rather than
being frozen at whatever the animation's first frame happened to be.

Reduced motion should receive the whole argument, held still. Not a disabled component.

---

## 2. The containing-block trap

**Any ancestor with a `transform`, `filter`, or `perspective` becomes the containing block for
its fixed and sticky descendants.**

This breaks, silently and at a distance:

- fixed overlays stop being fixed to the viewport
- sticky elements pin to the wrong box
- full-viewport background layers scroll away

It bites in three specific places, all of which look innocent:

1. **Animated route wrappers.** A page-transition wrapper that animates `transform` will break
   every pinned section beneath it for the duration of the animation. Animate **opacity only**
   on route wrappers.
2. **Smooth-scroll libraries** that translate a wrapper (see §0).
3. **Global background layers** mounted inside an animated wrapper rather than beside it.

Rule: anything `position: fixed` and anything relying on `sticky` must be mounted **outside** any
element that will ever be transformed.

---

## 3. Reveal on scroll

One `IntersectionObserver` for the whole document, not one per element. Elements opt in with a
class; the observer only ever writes an attribute, and all timing lives in CSS.

Cost is ~1 KB and scales flat across dozens of revealed blocks. A `MutationObserver` re-registers
content added by client navigation.

Fire **before** the element reaches the viewport (a negative bottom root margin of a few
percent). Two reasons: a reveal the user watches *begin* reads as a delay rather than as motion,
and firing early lets one section start arriving while the previous is still leaving — the
overlap that makes a long page feel continuous rather than sectioned.

### Wipes without paint-time properties

To reveal type from behind its own baseline, **clip with `overflow: hidden` on the outer element
and translate an inner span**. Two tempting alternatives are both wrong:

- `clip-path: inset(0 0 100% 0)` gives the element an *empty intersection rectangle*, so the
  IntersectionObserver meant to reveal it reports it as not intersecting and never fires. The
  element hides itself so thoroughly that it deadlocks its own trigger.
- Animated `mask-size` fixes that, but masks are paint-time: every frame repaints the element.

The geometric version is pure transform, composited, and the observed element keeps full
geometry.

Give the clipping element ~0.14em of bottom padding with matching negative margin, or
`overflow: hidden` shaves the descenders off a `g` or `q` at tight display leading.

---

## 4. Pinned stages

A section taller than the viewport with a `position: sticky` child held at the top. Section
height sets how much scroll the pinned moment consumes; progress is measured in *pinned* mode.

Complete the animation slightly **before** the pin releases (~0.86 of travel). Reaching the final
state exactly as the section starts leaving reads as the animation being cut off.

Positioning for pinned stages belongs in stylesheet rules, **not utility classes**, because the
reduced-motion variant has to return those elements to normal document flow — and in Tailwind v4,
utilities are emitted into a layer that always beats component-layer rules regardless of
specificity.

### The layer-order trap

In CSS, *unlayered* rules beat *layered* ones regardless of specificity. A stray unlayered
`img { height: auto }` therefore defeats every height utility in the project — presenting as
"the framework is broken". Base resets go in a base layer, named component rules in a components
layer, utilities on top.

---

## 5. Scroll-scrubbed video

A video whose **playhead is driven by scroll position**. The subject approaches at exactly the
rate the user scrolls and stops when they stop — the difference between a video on a page and a
page moving through space.

Three modes, chosen **after mount** so the server render is never wrong:

| Mode | When | Why |
| --- | --- | --- |
| `scrub` | pointer devices | seek-driven, pinned |
| `loop` | touch / small screens | seeking during touch scroll is unreliable on iOS Safari; a muted half-resolution loop is better than a broken scrub |
| `static` | reduced motion | poster frame, all captions listed, **no video fetched at all** |

### Encoding

Ship **two** encodes. The scrub master needs a keyframe every ~5 frames so any seek lands
immediately, which costs bitrate. The touch encode is half-resolution with a normal GOP because
it only ever plays forward. Sending the scrub master to a phone is paying for seek density
nothing on that device will use.

### Seeking

Ease the playhead toward the scroll-derived target rather than snapping to it, and **skip seeks
while one is already in flight**. Issuing a seek every frame thrashes the decoder and is the
usual reason scroll-video stutters.

### Loading (this one is easy to get wrong)

`preload="auto"` fetches the entire file as soon as the element mounts. For a multi-megabyte
master on a section near the top of the page, that competes directly with the LCP image.

Start at `preload="metadata"` and upgrade to `auto` on approach.

**The approach margin must not include the section while the user is still at rest.** A generous
positive root margin — the sort that suits an embed several screens down — counts a
second-screen section as "approaching" the moment the page hydrates. Measured here: the full
multi-megabyte file fetched at 88 ms with the viewport still at scroll 0, i.e. the deferral
achieved nothing. A **negative bottom margin** fixes it: buffering begins only once the section
is genuinely being scrolled toward.

Result of that one change, measured at rest on the page: **5.79 MB → 0.3 KB**.

Gate the upgrade on `navigator.connection.saveData` and 2G/3G effective types, and leave those
users on metadata.

---

## 5b. Expanding *and* scrubbing at once

The strongest version of "scroll to expand" drives three things from one scroll position:

1. the backdrop settles back and darkens, so the page appears to recede;
2. the frame grows from a tile to full-bleed;
3. the film's **playhead advances**.

Point 3 is what separates it from the common treatment. A loop that merely gets bigger is a
poster that happens to move — the footage runs on its own clock and scrolling only reframes it.
When the playhead *is* the scroll position, the camera travels at the reader's rate and stops
when they stop; they are driving it, not watching it.

Do all three in **one** rAF loop: write progress once to a custom property the backdrop and frame
read in CSS, and use the same number as the video's target time. The scrub then costs no second
subscription and no second layout read.

Use the *same asset* for the preceding hero and this section's backdrop. The film grows out of
the place the reader already arrived in rather than cutting to an unrelated image, so two
set-pieces read as one continuous descent — and the file is already decoded and cached by the
time the backdrop needs it.

**Measured:** a 240-frame clip re-encoded at `-g 5 -keyint_min 5 -sc_threshold 0` yields 48
keyframes and seeks that land in **2–8 ms**, accurate to the exact requested time. The same clip
at a default GOP costs less bitrate (1.28 MB vs 2.72 MB) but stalls on seek — unusable for a
scrub. Pay the bitrate or don't scrub.

## 6. Depth

Parallax read as *distance*, not as an effect: elements move at rates proportional to how far
away they are supposed to be.

**One scroll subscription per band, shared by every child.** Children multiply the band's single
progress value by their own depth factor. A listener per image is exactly how this technique
becomes the jank it was meant to avoid.

```
translate3d(0, (p - 0.5) * depth * -34vh, 0)
```

Centred on 0.5 so a band is at rest when centred in the viewport and travels symmetrically
either side. Depth above ~0.8 reads as a glitch, because the element visibly outruns the scroll
it belongs to.

---

## 7. Continuous ground

The technique that removes visible seams between sections.

Sections normally paint their own backgrounds, so every boundary between two of them is a hard
edge. Instead, **move background ownership up to the page**: one fixed layer behind everything,
whose colour is interpolated between the tone of the section holding the viewport and the tone
of the one arriving. Sections declare a tone and paint nothing.

- Decide the owning section by what sits under the **viewport midline**, not the top edge, so a
  section takes the page's colour while it holds the screen.
- Blend across roughly the last two-thirds of a viewport *before* arrival, so the ground has
  finished changing by the time the incoming section's type is legible on it. Blending on
  arrival reads as the page correcting itself a beat late.
- Under reduced motion keep the layer but drop the interpolation: the ground snaps at
  boundaries. Colour is not motion, and switching the layer off entirely would leave every
  section with no background at all.

Stacking must be explicit: put the layer at `z-index: 0` and content at `1`. `z-index: -1` places
it behind the canvas, where the body background paints over it — the standard way this technique
silently does nothing.

**Guard it.** With fewer than two toned sections there is nothing to blend, and the layer is pure
cost: a full-viewport composited surface painting a flat colour behind sections that already draw
their own. Remove it from the paint tree (`display: none`) rather than leaving it hidden — this
matters most on pages that also run continuous video, which is exactly where the spare composite
is least affordable.

---

## 8. Third-party 3D embeds (360 tours)

Treat a 3D tour as **a place you walk into, not a modal you open**.

- **Load on approach**, ~700 px before the section arrives, so the scene is live by the time the
  user reaches it. No button, no spinner.
- **Hold a poster on top** until the embed reports ready, then dissolve. There is never a black
  rectangle.
- **Mount only the active tour.** Each is a live WebGL context in the 10–15 MB range; three at
  once makes a page unusable on mid-range hardware. Switching tears down the previous one.
- **Keep the click gate for metered connections only** (`saveData`, 2G/3G). Do not spend
  someone's data without asking; everyone else gets it seamlessly.
- **Preconnect** to the embed's origins before mounting the iframe.

Accessibility detail that is easy to miss: put the section's accessible name **outside** the
overlay. If the heading lives in the overlay and the overlay unmounts when the tour goes live,
`aria-labelledby` ends up pointing at nothing and the section loses its name.

### Smooth scroll × iframes

Smooth-scroll libraries commonly ship a stylesheet containing:

```css
.lenis.lenis-smooth iframe { pointer-events: none; }
```

It exists so the wheel is never swallowed by an embedded document. **If your only iframe is an
interactive 3D tour, importing that rule makes your most expensive feature inert.** Write the
handful of rules you need by hand instead of importing the stylesheet wholesale.

Also hand off native `scroll-behavior: smooth` while the library is running, or both animate the
same scroll and fight over anchor jumps. Key it to the class the library sets, so native smooth
remains in force before hydration and under reduced motion.

Leave anchor jumps **instant**. Animating a keyboard-initiated jump adds delay to the one
interaction that exists to remove it.

---

## 9. AI-generated camera sequences

The scrubbed footage in §5 was generated rather than filmed. What made it usable:

- **Frame chaining.** Generate clip *n+1* from the final frame of clip *n* as its init image, so
  cuts line up and the move reads continuous rather than as separate shots.
- **One continuous take, no cuts** in the prompt. Models otherwise invent edits, which destroys
  scrubbability — a cut mid-scrub reads as a seek failure.
- **Architectural camera language**: slow dolly, fixed focal length, consistent time of day.
- **Generate long, cut short.** Trim to the segment that holds up under a slow scrub. Scrubbing
  exposes temporal artefacts that play fine at speed, because the viewer controls the rate and
  can stop on any frame.
- Keep prompts and the chaining order in version control next to the media. Regeneration is
  otherwise unreproducible.

Storyboard the sequence as a path through space — approach, threshold, interior — and caption
each beat. Captions crossfade on the same progress value that drives the playhead, so the words
always describe the frame on screen.

---

## 10. Measuring

Bundle numbers must come from a **production build**. Dev-server figures include HMR machinery
and unminified modules and are meaningless — measured here at ~2.3 MB of "JS" in dev for a route
that ships 137 KB in production.

Per-library cost: download the published minified bundle and gzip it locally. Do not trust
quoted figures, which vary on whether dependencies are counted.

Runtime transfer: `performance.getEntriesByType('resource')`, reading `transferSize` (bytes on
the wire) rather than `decodedBodySize` (bytes in memory). Confusing the two overstates image
cost by roughly 3×.

### Verifying motion in a headless or hidden viewport

**When a browser tab is not compositing frames, `requestAnimationFrame` does not run.** Every
technique in this document is rAF-driven, so in a hidden tab all of it appears frozen:
transitions report `running` forever and never advance, scroll-linked variables never update,
CSS smooth scrolling never moves, and **native `scroll` events are not dispatched at all**.

This produces convincing false failures. Before concluding a scroll effect is broken, check
`document.hidden`, and run a control on a route where the suspect code is not mounted. A
measurement taken in a non-compositing tab is not evidence.

What *does* read correctly while hidden: DOM state and attributes, computed styles, geometry
from `getBoundingClientRect()`, resource timing, and instant (non-smooth) programmatic scrolls.
Structure can be verified anywhere; **feel cannot** — that needs a visible viewport and a human.

---

## 11. Open items

**Verified**

- Smooth scroll coexists with pinned sticky stages, truthful `getBoundingClientRect()`, and the
  page's background field. Production build, typecheck and tests all clean.
- Video deferral: 5.79 MB → 0.3 KB at rest; upgrades on approach; scrub still seeks instantly.
- Hero media: one image on load instead of four; the rest load on interaction.

**Not yet verified — needs a visible viewport**

- The *feel* of smooth scrolling, and its interaction with the video scrub. Both the library and
  the scrub tick apply their own easing; the two may compound into something mushy. If so, drop
  the scrub's internal easing factor and let the scroll layer own the smoothing.
- Whether the scroll weighting suits a page whose reason for existing is reachable information.
  Momentum that feels luxurious on a portfolio can feel obstructive on a page with a price on it.

**Untested platforms**

- No real mid-range Android, no throttled mobile network, no screen reader end to end, no iOS
  Safari. iOS matters most for `svh` units, scrub seeking, and smooth scroll — touch smoothing is
  deliberately left off for this reason.

**Known cost, unaddressed**

- Client bundles on list/filter pages carry the full dataset in every language rather than a
  server-projected, locale-scoped index. Largest remaining JS win.
- Build tooling carries advisories inherited from image-processing and CSS-parsing dependencies.
  Automated "fix" suggestions may propose catastrophic framework downgrades; read them before
  running them.

**Deliberately not built**

- An atmospheric interstitial field (see §0 on why not to reach for a WebGL library for it; §6 is
  the cheaper and closer answer).
- Route *exit* animation. Enter-only, because doing exits properly needs the View Transitions API
  or a motion library.
