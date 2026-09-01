# SP1 + SP2 — Portfolio data foundation and the six missing routes

Date: 2026-09-01
Status: approved in brainstorming, not yet planned

## Why this exists

Two problems, deliberately solved together.

**The nav lies.** `SiteHeader` links to `/a-propos`, `/guide-achat` and `/contact`;
`SiteFooter` adds `/actualites`, `/mentions-legales` and `/donnees-personnelles`. None of
those routes exist. Six links 404 today.

**The portfolio is two thirds of itself.** `src/data/projects.ts` holds 14 programmes.
liliskane.com publishes 23. Nine are missing entirely, and four of the fourteen that are
present have live 360 tours the dataset never captured.

They are one slice because SP2's pages consume SP1's data, and because the bundle fix in SP1
must land *before* nine more programmes are added rather than after.

## Scope decisions taken during brainstorming

| Decision | Choice | Consequence |
| --- | --- | --- |
| Information architecture | **Edited, not parity** | The 7 segment pages do not become 7 routes; Guide d'achat + Financement + Conventions merge into one destination |
| Motion lane | **Tier A + B** (video scrubbing, CSS-3D/SVG) | No three.js. The `MOTION.md` §0 ruling against a second WebGL context stands |
| First slice | **SP1 + SP2 together** | Segment routes and all motion work deferred to SP3–SP5 |
| Segment taxonomy | **Client's taxonomy wins** | Four reassignments; `economique` drops to one programme |
| Matterport tours | **All 9 wired** | SP1 is not a pure data import; it touches project pages |

## Source of truth

Every figure in this spec was read from liliskane.com on 2026-08-31 / 2026-09-01. All 14
existing dataset prices were checked against the live site and **matched exactly**, so the
existing data is trustworthy and is not being re-derived.

Where the live site does not publish a field — typologies, delivery years, coordinates,
amenities — that field stays absent and is flagged. Nothing is invented. These are a real
developer's real programmes; fabricated unit prices or delivery dates would be indefensible
if they ever reached a buyer. This is the same posture `MEDIA-PLACEHOLDERS.md` already takes
toward imagery.

---

# SP1 — Data foundation

## 1.1 Nine programmes imported

| Slug | id | Price (DH) | Segment (client) | Tour |
| --- | --- | --- | --- | --- |
| `assafa` | 180 | 250 000 | economique | `qvszE14omLR` |
| `al-anbar` | 189 | 545 000 | moyen-standing | — |
| `al-yassamine` | 77 | 586 000 | moyen-standing | — |
| `al-anbra` | 210 | 595 000 | moyen-standing | — |
| `patio-verde` | 192 | 607 000 | moyen-standing | `5XxiaEBrAZT` |
| `jasmin` | 179 | 732 000 | moyen-standing | `jqeL68ktXZK` |
| `jnane-souss` | 188 | 770 000 | moyen-standing | `htjuMq1UjPr` |
| `les-pins-de-maamora` | 79 | 850 000 | moyen-standing | — |
| `massylia` | 186 | 1 045 000 | moyen-standing | `YqEQdUUCqBC` |

All nine are `unit: "total"`. Each needs a bilingual name, city, neighbourhood, summary and
gallery. Summaries are **written fresh** for this site, not copied from liliskane.com — the
edited-IA decision means the voice is ours, and the source prose is the client's copyright.

## 1.2 Segment reconciliation — the client's taxonomy wins

The live site's own type pages are authoritative. Four existing programmes are reassigned:

| Slug | Dataset had | Client says |
| --- | --- | --- |
| `odyssee` | moyen-standing | **haut-standing** |
| `odyssee-studios` | moyen-standing | **haut-standing** |
| `assalam-tg` | haut-standing | **moyen-standing** |
| `izdihar` | economique | **moyen-standing** |

Resulting distribution across 23 programmes: economique 1 · moyen-standing 12 · terrain 4 ·
haut-standing 6.

Three of the client's seven types — locaux commerciaux, plateaux de bureaux, équipements
sociaux — contain **no programmes at all**. This is the strongest single vindication of the
edited-IA decision: parity would have shipped three empty routes. The `Segment` union in
`src/data/types.ts` needs **no change**; `commercial` and `bureaux` simply go unused as
segments, which is correct, because they already exist meaningfully as `Kind` values
(`riad-garden-ii` carries `kinds: ["appartement", "local-commercial"]`). Segment is what a
programme *is*; kind is what you can buy in it. That distinction is already right.

### Known consequence: a one-programme facet

`economique` will contain only `assafa`. This is acceptable and does not dead-end, because
`src/lib/filter.ts` already lists `segments` among its relaxable facets and the
never-zero-results logic will widen and say so. It should still be raised with the client —
either their taxonomy under-populates the entry-level segment, or genuinely only one
entry-level programme is currently marketed.

## 1.3 Nine Matterport tours wired

Five arrive with the new programmes. Four already exist on live programmes the dataset models
with `tours: []`:

| Slug | Matterport | Note |
| --- | --- | --- |
| `assalam-tg` | `9oWTZCGuoXG` | uncaptured |
| `dyar-al-bahia-2` | `hiNnb5TZFkM` | uncaptured |
| `bougainvillier` | `B5HfsowjF9b` | uncaptured |
| `riad-garden-i` | `LdA3dxyG6dA` | second tour; `aRgKUGQrgkF` is already modelled |

This is the highest-value item in the slice. `DIRECTION.md` builds the site's thesis on
evidence that is "walkable in 360 right now" — a claim currently true of one project page and
about to become true of nine.

Each tour needs a `poster` `MediaRef` framed near its opening camera position, selected from
that programme's gallery. `ofDelivered` must be set honestly per tour: a show flat is not a
delivered unit, and the distinction is load-bearing for the proof argument. Where it cannot be
determined from the source, it is set `false` and flagged rather than guessed generously.

No new component work: `VirtualTour` and the ~700px on-approach observer already exist, as does
the single-active-tour rule that keeps only one WebGL context live.

## 1.4 The bundle fix — and why it belongs here

`REVIEW.md` names the client bundle shipping the full portfolio in both languages as the
largest remaining performance win. Adding nine programmes makes that payload roughly **64%
worse**. Landing the import without the fix means knowingly shipping a regression.

The change: a server-projected, locale-scoped list index. The server component derives a
minimal list shape — slug, name, city, price, segment, status, surfaces, bedrooms, amenities,
thumbnail — for the **active locale only**, and passes that to `SearchExplorer`. Full `Project`
objects, both language variants, typologies, tours and proof pairs stay server-side.

This is a real refactor of the search surface's data boundary, not a data edit. It is the
riskiest part of SP1 and should be planned as its own step with its own verification.

## 1.5 The price floor moves — a copy consequence

`assafa` at 250 000 DH sits below the current portfolio floor. `DIRECTION.md` builds a
home-page segment argument on the **485K–2.45M** range, and `Qualifier`'s bounds assume it.
After this import the true range is **250K–2.45M**.

`RangeArgument` copy and `Qualifier` bounds both need updating in FR and AR. Flagged
explicitly rather than silently rewritten, because the range is an *argument*, not a label —
changing its endpoints changes what the section claims.

---

# SP2 — The six missing routes

All six live under `src/app/[locale]/`, inherit `template.tsx`'s enter transition, and must
work in RTL.

## 2.1 `/a-propos`

Sections, from the live page's own structure: Qui sommes-nous · Nos valeurs · Certifications
& labels (ISO 9001) · Garanties & durabilité · **Dates clés**.

Dates clés is the reason this page matters. It is the one page whose entire content *is* the
forty-year delivery record, which is the site's central argument. It should reuse `Record` and
`ExpandingFrame` rather than inventing a timeline component.

## 2.2 `/guide-achat` — the merge

Absorbs three live pages: the 8-step buying guide, Financement, and Conventions & partenariats.

The 8 steps supply the spine: define need and budget · choose the programme · prepare
financing · verify the legal position · check conformity and documents · understand
co-ownership and charges · formalise and secure the signature · delivery, PV, SAV and
guarantees.

`CreditSimulator` embeds at step 3, where it is the answer to the step rather than a widget
bolted to the page. Conventions & partenariats becomes a band within the financing material.
One page, arriving at the price — consistent with "the price is always reachable."

## 2.3 `/contact` — the RDV booker

The live form's real fields: `nom`, `prenom`, `email`, `tel`, `type_prj`, `ville_prj`,
`date_rdv`, `heure_rdv`, `moyen_rdv`. Plus bureau de vente locations.

`moyen_rdv` (how the appointment happens — in person, phone, video) is worth keeping; it is a
genuine convenience and the live site already asks it.

Submission posture must match the existing `BookingForm` — that component's current behaviour
is the precedent and should be read before this is planned, not assumed.

## 2.4 `/actualites`

An index of articles.

**One thing we deliberately do not reproduce:** the live page renders French and Arabic
articles interleaved in a single list. Under `[locale]` routing that is a defect, not a
feature. Articles carry a language; the index shows the active locale's. Where a translation
does not exist, the article does not appear in that locale rather than appearing untranslated.

## 2.5 `/mentions-legales` and `/donnees-personnelles`

Éditeur · crédits · propriété intellectuelle · marques déposées · produits et prix ·
limitation de responsabilité · cookies; données personnelles on its own route as the footer
already promises.

Legal text is the client's and must come from them verbatim — this is the one place in the
build where rewriting for voice is wrong. Until they supply it, the pages ship with clearly
marked placeholders, listed in `MEDIA-PLACEHOLDERS.md` alongside the imagery.

## 2.6 Nav reconciliation

After SP2, every link in `SiteHeader` and `SiteFooter` resolves. Verified by enumerating both
components' hrefs against the route tree, not by clicking.

---

# Out of scope

- Segment routes and the `/projets` segment views — **SP3**
- A1 render→real dissolve, B2 floor-plan extrusion — **SP4**
- B1 moucharabieh tunnel, B4 map tilt, A4 record counter, A5 persistent hero — **SP5**
- Typologies, coordinates, amenities and delivery years for the nine new programmes — blocked
  on the client, not on us

# Testing

- Extend the existing `node --experimental-strip-types --test` pattern (`credit.test.ts` is the
  precedent) to cover the locale projection and the filter across 23 programmes, including the
  one-programme `economique` relaxation path.
- `npm run typecheck`.
- Browser verification per `CLAUDE.md`: this codebase has a documented history of components
  that measure correct while being visually wrong, and of CSS silently no-oping through
  Tailwind's `@layer` ordering. Computed styles are not evidence on their own.
- Confirm only one Matterport context is ever live now that eight more pages can mount one.

# Operational notes

- **Work in `C:\dev\ChaabiLilIskane`.** The OneDrive copy is stale — it lacks `SmoothScroll`,
  `ScrollChoreography`, `gsap.ts`, `DepthInterstitial`, `ExpandingVideo`, `TourCards`,
  `MOTION.md` and `MEDIA-PLACEHOLDERS.md`.
- **This project is not under version control.** No commit of this spec was possible. Running
  `git init` before a change of this size is strongly advised.
- `MOTION.md` §0 records GSAP as "declined for now", but `gsap@3.15.0` is a real dependency in
  `package.json`. That section is out of date and should be reconciled so the decision is not
  re-litigated from a stale document.
- Use `-LiteralPath` or Bash for anything touching `src/app/[locale]/` — PowerShell treats the
  brackets as wildcards.

# Open questions for the client

1. Should `economique` really contain a single programme?
2. Legal text for `/mentions-legales` and `/donnees-personnelles`, verbatim.
3. Typologies, delivery years and amenities for the nine imported programmes.
4. Confirmation that the four segment reassignments reflect current commercial positioning.
