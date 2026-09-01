# REVIEW

An honest account of what was built, what is compromised, and where I departed from the brief.

## What is genuinely strong

**The central device works, and it is not decoration.** The render/photograph pairing survived
contact with the real assets — seven matched pairs, including pool-to-pool and facade-to-facade,
with the moucharabieh screens visible in both the synthetic and the built version. It answers the
brief's stated emotional problem (trust in an unbuilt thing) with evidence rather than adjectives,
and no competitor can copy it without having delivered something first.

**The palette is derived, not chosen.** Sampling Chaabi's own renders returned limestone, dusty
olive and burnt amber under Marrakech sky — not the cream-and-terracotta that "warm Moroccan
luxury" defaults to. That sampling pass is the single decision that most kept this from looking
like every AI-generated landing page of the last two years. The structural dark being a warm
olive-black rather than neutral black comes directly from the Palmeraie planting in the
photographs.

**Money is handled seriously.** One amortisation module drives both the DH/month filter and the
simulator, with a test asserting that `maxAffordablePrice` is the exact inverse of
`computeCredit` — so search can never surface a project the simulator then says you cannot
afford. The simulator shows the insurance premium and total credit cost, not just the flattering
monthly figure.

**The bidi work is real.** In Arabic, `05 20 39 34 00` renders as `00 34 39 20 05` without a
bidi isolate, and `84–116 m²` becomes `116–84`. Both were live bugs, both are invisible to
anyone who does not read Arabic, and a reversed phone number on a page whose purpose is getting
someone to call is close to the worst defect this site could ship. Fixed at the formatter and at
the dictionary so no call site can forget.

**Reduced motion gets the argument, not a stub.** The pinned wipe becomes two frames side by
side, both labelled, both fully visible — the same comparison, held still. Verified by forcing
the media query through the CSSOM and screenshotting the result.

## What is compromised

**The JS budget was missed: 127–136 KB against a stated ≤ 120 KB.** 102 KB of that is the React
19 + App Router baseline. Application code is 3.7–9.5 KB per route, which is lean. The budget was
written before the floor was measured, which was a process failure — I should have measured
first. Meeting it would mean abandoning Next.js for Astro or plain SSR, which would cost the
handoff team the routing, image pipeline and data-fetching conventions the brief asked to be
legible. I think the stack is still the right call and the budget number was wrong, but that is
a judgement, not a fact, and it should be re-examined.

**The client bundle ships both languages and all project copy.** `Qualifier`, `PortfolioIndex`
and `SearchExplorer` import the full project dataset — including every alt text in French and
Arabic — because they filter on the client. The right fix is a narrow server-projected search
index carrying only the fields search needs, in the active locale. It is the largest remaining
performance win and it was not done.

**The camera sequence is the weakest section on the project page.** It cross-fades three stills
with a scale settle. That is a competent version of the wrong thing: real continuity needs
footage whose cut points match, which is exactly what `MEDIA-REQUESTS.md` §3 specifies and does
not yet exist. Right now it reads as three good photographs rather than one continuous move.

**I did not build a real map.** `MoroccoMap` plots true coordinates with greedy label
collision-avoidance and costs about 2 KB, which I stand behind over a 200 KB tile map with a
cookie banner. But it has no coastline, so it asks the user to recognise the shape of their own
country from nine dots. For Moroccan users that is probably fine. For MRE buyers in Brussels
choosing between neighbourhoods, it is thinner than it should be.

**Not tested on a real device.** Everything here was verified in a desktop Chromium at 1440px
and by measurement. No mid-range Android, no real 4G, no actual screen reader, no iOS Safari —
which matters most for `svh` units and the `clip-path` wipe. The performance claims are budget
arithmetic, not field measurement.

**Only Riad Garden II is deep.** The other thirteen projects have summaries, prices, heroes and
correct filtering, but no typologies, tours or proof pairs. The components degrade correctly
when those arrays are empty — which is the point of the stress test — but only one project page
is genuinely finished.

## Where I deviated from the brief, and why

**I built Riad Garden II instead of Amaïa.** Amaïa's entire image library is six PDF pages
exported to JPG at 2116 px, with no interiors and no 360. Building the flagship page there would
have meant art-directing around placeholders for precisely the moments the brief says must land.
Riad Garden II has 4–6K renders, both Matterports, and — decisively — an adjacent delivered phase
with real photography, which is what made the whole concept possible. This was raised and
approved before any code was written. Amaïa is fully present in the portfolio and search.

**I added a third page.** `/projets` exists because the home qualifier has to hand off somewhere
URL-shareable, and stopping at "filters on the home page" would have left the brief's most
detailed requirement half-built. Also approved up front.

**I cut the dissolve from the hero.** The first build had the render dissolving into the
photograph on the home hero. It was removed: the headline sits at the foot of the viewport, so
the payoff finished after the type had scrolled away. Fixing the timing meant pinning the hero
for another half-screen of dead scroll plus a second full-resolution image competing with LCP.
The claim now sits in the hero and the proof pays it off in its own section, which is better
pacing and a faster first screen.

**The comparison is a wipe, not a crossfade.** Dissolving between two differently-framed images
produced a ghosted middle state that read as a rendering fault. A hard moving edge is legible at
every frame. The seam is honest — these are two different buildings two years apart, and the
design says so rather than implying they are the same shot.

**I used the client's logo in monochrome.** Chaabi's mark is corporate blue, which fights the
sampled palette. The nav uses their actual wordmark letterforms knocked out to paper or ink —
standard responsive-logo practice — but recolouring a brand mark is not mine to authorise, and
it needs sign-off.

**Two of the four reference sites did not survive inspection.** `jbschool.ae` is now a generic
school template with a mega-nav and a chat widget; nothing was taken from it. `amaliproperties.com`
opens with a centred ghosted headline over a water loop, which is close to the failure mode the
brief names — I used it for its commitment to full-bleed media and treated its hero as a thing to
avoid. Sankari and the Azizi navigability problem did the real reference work.

## What I would do next, in order

1. Server-projected search index; measure again.
2. Commission `MEDIA-REQUESTS.md` §2 (matched-camera photography) — it improves the site's core
   argument more than any code change available to me.
3. Test on a real mid-range Android over throttled 4G, and on iOS Safari for `svh` and
   `clip-path`.
4. Run a screen reader end to end, particularly the compare slider and the live result counts.
5. Add the coastline to the map, or replace it with a proper one if the neighbourhood-level
   browsing the brief hints at becomes a requirement.

## Verification performed

- `npm run build` — clean, 35 routes prerendered.
- `npx tsc --noEmit` — clean.
- `npm test` — 11/11, including the credit round-trip property.
- Contrast measured programmatically; four failures found (4.47, 4.38, 3.13, 4.43:1) and fixed by
  splitting the accent into surface-specific tokens. All text pairs now ≥ 4.7:1.
- Accessibility pass on the project page: one `h1`, ordered headings, 9/9 images with meaningful
  alt, 56/56 focusables labelled, zero iframes before interaction.
- Reduced motion verified by forcing the media query via CSSOM.
- Arabic RTL verified: mirrored layout, correct phone number, correct ranges, IBM Plex Sans
  Arabic loading, `dir="rtl"` on the root element.
