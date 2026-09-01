# Portfolio Data Foundation and Core Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the portfolio dataset with the client's own taxonomy, stop shipping the whole portfolio to the browser, and build the six routes the navigation already links to.

**Architecture:** Two halves. SP1 changes the data layer only — segment corrections, previously-uncaptured Matterport tours, and a locale-scoped projection so `SearchExplorer` receives a minimal list instead of importing the full dataset. SP2 adds six server-rendered routes under `src/app/[locale]/`, following the existing composition pattern (async server component, `isLocale` guard, `getDictionary`, `data-tone` section wrappers).

**Tech Stack:** Next.js 15.5.21 App Router, React 19.1.1, TypeScript 5.9, Tailwind v4, `node --test` with `--experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-09-01-portfolio-data-and-core-pages-design.md`

## Global Constraints

- **Work in `C:\dev\ChaabiLilIskane`.** The OneDrive copy is stale.
- **Branch:** `sp1-sp2-data-and-core-pages`. Baseline is commit `a9d7506` on `master`.
- **Never run `npm run build` while `npm run dev` is running** in the same directory — dev writes an unbundled `.next`, build overwrites it, dev then cannot resolve its own modules.
- **Use `-LiteralPath` (PowerShell) or Bash** for anything touching `src/app/[locale]/` — PowerShell treats `[` `]` as wildcards and will silently skip that tree.
- **`src/i18n/fr.ts` is the source of truth for string shape.** `ar.ts` is typed against it, so every new French key needs an Arabic counterpart or the build fails. This is the intended guarantee — do not weaken the type to work around it.
- **Tailwind `@layer` ordering:** utilities always beat component-layer rules regardless of specificity. Several past bugs came from this. See the note at the top of `src/styles/globals.css`.
- **Motion:** `transform` and `opacity` only. 620ms type / 900ms media / 70ms stagger capped at four steps. `prefers-reduced-motion` throughout.
- **Nothing is invented.** Where the live site does not publish a field, it stays absent and gets flagged. These are a real developer's real programmes.
- **Test command:** `npm test` → `node --experimental-strip-types --test ./src/**/*.test.ts`. Note test imports use explicit `.ts` extensions (see `credit.test.ts`).
- **No new dependencies.** Tier A + B motion only; no three.js.

## A note on test scope

This repo has **no component test harness** — `npm test` runs `node:test` over `.ts` files only, and the only existing suite is `src/lib/credit.test.ts`. Tasks touching pure logic (Tasks 3–5) are written TDD. Tasks adding React pages (Tasks 7–12) are verified by `npm run typecheck`, a production build confirming the route prerenders, and a browser check — because introducing a component testing framework to this project is scope creep the spec did not ask for.

`CLAUDE.md` warns that this codebase has a history of components that measure correct while being visually wrong. Computed styles are not evidence. Look at the page.

## File Structure

**SP1 — data layer**

| File | Responsibility | Change |
| --- | --- | --- |
| `src/data/projects.ts` | The portfolio dataset | Modify — 4 segment values, 4 tour arrays |
| `src/data/list.ts` | **New.** The locale-scoped list projection: `ProjectListItem`, `toListItem` | Create |
| `src/lib/filter.ts` | Search, relaxation, facet counts | Modify — generalise over the projection shape |
| `src/lib/list.test.ts` | **New.** Projection tests | Create |
| `src/lib/filter.test.ts` | **New.** Filter/relaxation tests across 23 programmes | Create |
| `src/components/search/SearchExplorer.tsx` | The search UI | Modify — receive items as a prop, drop the dataset import |
| `src/app/[locale]/projets/page.tsx` | Search route | Modify — build the projection server-side |

**SP2 — routes.** Six new `page.tsx` files under `src/app/[locale]/`, plus content components where a page has real structure:

| Route | Page file | Components |
| --- | --- | --- |
| `/a-propos` | `a-propos/page.tsx` | `src/components/about/KeyDates.tsx` |
| `/guide-achat` | `guide-achat/page.tsx` | `src/components/guide/BuyingSteps.tsx` |
| `/contact` | `contact/page.tsx` | `src/components/contact/AppointmentForm.tsx` |
| `/actualites` | `actualites/page.tsx` | — |
| `/mentions-legales` | `mentions-legales/page.tsx` | `src/components/legal/LegalDocument.tsx` |
| `/donnees-personnelles` | `donnees-personnelles/page.tsx` | reuses `LegalDocument` |

Supporting data/content: `src/data/news.ts`, `src/data/legal.ts`, `src/data/about.ts`.

---

# Phase 1 — SP1, the unblocked data work

### Task 1: Reconcile segments with the client's taxonomy

**Files:**
- Modify: `src/data/projects.ts` (4 `segment` values)

**Interfaces:**
- Consumes: nothing
- Produces: a dataset whose `segment` values match liliskane.com's own type pages

The client's type pages are authoritative. Four programmes are currently assigned differently.

- [ ] **Step 1: Apply the four reassignments**

In `src/data/projects.ts`, change the `segment` field on exactly these four entries:

| slug | from | to |
| --- | --- | --- |
| `odyssee` | `"moyen-standing"` | `"haut-standing"` |
| `odyssee-studios` | `"moyen-standing"` | `"haut-standing"` |
| `assalam-tg` | `"haut-standing"` | `"moyen-standing"` |
| `izdihar` | `"economique"` | `"moyen-standing"` |

Add this comment immediately above the `projects` array so the change is not silently reverted by someone reading price coherence:

```ts
/**
 * Segment values follow the client's own type pages on liliskane.com, not
 * price coherence. `izdihar` at 485 000 DH sits in moyen-standing and
 * `odyssee-studios` at 555 000 DH sits in haut-standing because that is how
 * Chaabi markets them. Segment is commercial positioning; if you want to slice
 * the portfolio by what a buyer can afford, filter on price, not on this field.
 */
```

- [ ] **Step 2: Verify no other segment values changed**

Run:

```bash
cd /c/dev/ChaabiLilIskane && perl -0777 -ne 'while(/slug:\s*"([^"]+)".*?segment:\s*"([^"]+)"/gs){printf("%-22s %s\n",$1,$2);}' src/data/projects.ts
```

Expected exactly:

```
riad-garden-ii         haut-standing
riad-garden-i          haut-standing
amaia                  haut-standing
oceane                 haut-standing
oceane-r1              terrain
odyssee                haut-standing
odyssee-studios        haut-standing
assalam-tg             moyen-standing
bougainvillier         moyen-standing
izdihar                moyen-standing
dyar-al-bahia-2        moyen-standing
al-youssoufia-r2       terrain
al-youssoufia-r3       terrain
al-maamora-r1          terrain
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/projects.ts
git commit -m "fix(data): align segments with the client's own taxonomy"
```

---

### Task 2: Wire the four uncaptured Matterport tours

**Files:**
- Modify: `src/data/projects.ts` (4 `tours` arrays)

**Interfaces:**
- Consumes: the `VirtualTour` type from `src/data/types.ts`
- Produces: `tours.length > 0` on `assalam-tg`, `dyar-al-bahia-2`, `bougainvillier`, `riad-garden-i`

These four programmes have live Matterport tours on liliskane.com that the dataset models as `tours: []`. No component work is needed — `VirtualTour` and the ~700px on-approach observer already exist.

`ofDelivered` must be honest. It means *this tour walks a delivered unit, not a show flat*. The proof argument rests on the distinction, so where the source does not make it clear, set `false` — under-claiming is the safe direction.

- [ ] **Step 1: Add the tours**

Each entry needs a `poster` chosen from that programme's existing gallery, framed as close to the tour's opening camera position as the available stills allow. Replace `<gallery entry>` with a real `MediaRef` from that project's own `gallery` array — do not invent a `MediaKey`; only keys present in `src/data/media.generated.ts` typecheck.

For `assalam-tg`:

```ts
tours: [
  {
    id: "temoin",
    label: { fr: "Appartement témoin", ar: "شقة نموذجية" },
    matterportId: "9oWTZCGuoXG",
    poster: /* <gallery entry> */,
    // Not confirmed as a delivered unit by the source listing.
    ofDelivered: false,
  },
],
```

For `dyar-al-bahia-2`, the same shape with `matterportId: "hiNnb5TZFkM"`.
For `bougainvillier`, the same shape with `matterportId: "B5HfsowjF9b"`.

For `riad-garden-i`, which is `status: "livre"` and therefore genuinely delivered:

```ts
tours: [
  {
    id: "livre",
    label: { fr: "Appartement livré", ar: "شقة مُسلَّمة" },
    matterportId: "LdA3dxyG6dA",
    poster: /* <gallery entry> */,
    ofDelivered: true,
  },
],
```

Note `aRgKUGQrgkF` is already modelled as a tour on `riad-garden-ii` (the "delivered Riad Garden I" comparison tour). Do not duplicate it here.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors. A wrong `MediaKey` fails here — that is the guard working.

- [ ] **Step 3: Verify in the browser**

Run `npm run dev`, then open `/fr/projets/bougainvillier`. Confirm the tour section appears, the poster shows, and the Matterport iframe loads on approach rather than on click.

**Critically:** confirm only one WebGL context is ever live. Open DevTools, scroll through a project page with a tour, and check that navigating away tears the iframe down. Eight more pages can now mount a tour; three live contexts at 10–15 MB each is the failure mode this guards against.

- [ ] **Step 4: Commit**

```bash
git add src/data/projects.ts
git commit -m "feat(data): wire four previously uncaptured Matterport tours"
```

---

### Task 3: The locale-scoped list projection

**Files:**
- Create: `src/data/list.ts`
- Create: `src/lib/list.test.ts`

**Interfaces:**
- Consumes: `Project` from `src/data/types.ts`, `cityById` from `src/data/cities.ts`
- Produces:
  - `type ProjectListItem` — the resolved, single-locale shape the search UI renders
  - `function toListItem(project: Project, locale: Locale): ProjectListItem`
  - `function toListItems(projects: Project[], locale: Locale): ProjectListItem[]`

This is the core of the bundle fix. `SearchExplorer` currently imports `search` from `@/lib/filter`, which imports `projects` — so every `Project`, in **both** languages, with typologies, tours and proof pairs, is serialised into the client bundle. Nine more programmes would make that ~64% worse.

`ProjectListItem` carries only what the list and the map actually render, with strings already resolved to the active locale.

- [ ] **Step 1: Write the failing test**

Create `src/lib/list.test.ts`:

```ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { toListItem, toListItems } from "../data/list.ts";
import { projects } from "../data/projects.ts";

test("toListItem resolves localised strings to a single language", () => {
  const rg2 = projects.find((p) => p.slug === "riad-garden-ii");
  assert.ok(rg2, "riad-garden-ii must exist");

  const fr = toListItem(rg2, "fr");
  assert.equal(fr.name, "Riad Garden II");
  assert.equal(typeof fr.name, "string");

  const ar = toListItem(rg2, "ar");
  assert.equal(ar.name, "رياض غاردن 2");
});

test("toListItem carries the city name, not just the id", () => {
  const rg2 = projects.find((p) => p.slug === "riad-garden-ii");
  assert.ok(rg2);
  const item = toListItem(rg2, "fr");
  assert.equal(item.cityId, "marrakech");
  assert.equal(item.cityName, "Marrakech");
});

test("the projection drops the heavy fields entirely", () => {
  const rg2 = projects.find((p) => p.slug === "riad-garden-ii");
  assert.ok(rg2);
  assert.ok(rg2.typologies.length > 0, "fixture must have typologies to drop");
  assert.ok(rg2.proof.length > 0, "fixture must have proof pairs to drop");

  const item = toListItem(rg2, "fr") as Record<string, unknown>;
  for (const key of ["typologies", "tours", "proof", "gallery", "nearby", "cinematic", "summary"]) {
    assert.equal(item[key], undefined, `${key} must not survive the projection`);
  }
});

test("toListItems preserves order and length", () => {
  const items = toListItems(projects, "fr");
  assert.equal(items.length, projects.length);
  assert.equal(items[0].slug, projects[0].slug);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — cannot find module `../data/list.ts`.

- [ ] **Step 3: Write the projection**

Create `src/data/list.ts`:

```ts
import { cityById } from "./cities";
import type { Amenity, MediaRef, Price, Project, Segment, Status } from "./types";
import type { Locale } from "@/i18n/config";

/**
 * What the search surface actually renders, in one language.
 *
 * The full `Project` carries both languages plus typologies, tours, proof
 * pairs and nearby places — none of which the list or the map touches.
 * Serialising all of that into the client bundle is the largest single
 * payload problem this project has (see REVIEW.md), and it grows with every
 * programme added.
 *
 * Strings are resolved here rather than in the component so the inactive
 * language never crosses the network at all.
 */
export type ProjectListItem = {
  slug: string;
  name: string;
  cityId: string;
  cityName: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  segment: Segment;
  status: Status;
  price: Price;
  surfaceMin: number;
  surfaceMax: number;
  bedroomsMin: number;
  bedroomsMax: number;
  amenities: Amenity[];
  deliveryYear: number | null;
  deliveredYear: number | null;
  hero: MediaRef;
};

export function toListItem(project: Project, locale: Locale): ProjectListItem {
  const city = cityById.get(project.cityId);
  return {
    slug: project.slug,
    name: project.name[locale],
    cityId: project.cityId,
    cityName: city ? city.name[locale] : project.cityId,
    neighbourhood: project.neighbourhood[locale],
    lat: project.lat,
    lng: project.lng,
    segment: project.segment,
    status: project.status,
    price: project.price,
    surfaceMin: project.surfaceMin,
    surfaceMax: project.surfaceMax,
    bedroomsMin: project.bedroomsMin,
    bedroomsMax: project.bedroomsMax,
    amenities: project.amenities,
    deliveryYear: project.deliveryYear,
    deliveredYear: project.deliveredYear,
    hero: project.hero,
  };
}

export function toListItems(projects: Project[], locale: Locale): ProjectListItem[] {
  return projects.map((project) => toListItem(project, locale));
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS, including the existing `credit.test.ts` suite.

- [ ] **Step 5: Commit**

```bash
git add src/data/list.ts src/lib/list.test.ts
git commit -m "feat(data): add locale-scoped list projection"
```

---

### Task 4: Generalise the filter over the projection

**Files:**
- Modify: `src/lib/filter.ts`
- Create: `src/lib/filter.test.ts`

**Interfaces:**
- Consumes: `ProjectListItem` from Task 3
- Produces: `search` and `facetCount` generic over a `Filterable` shape, so both a full `Project` and a `ProjectListItem` satisfy them

`matches()` reads exactly seven fields: `price`, `cityId`, `segment`, `status`, `bedroomsMax`, `surfaceMax`, `amenities`. `ProjectListItem` has all seven. Making the signature structural rather than `Project`-bound lets the same tested logic run on the server over full projects and on the client over the projection.

**Do not change the relaxation order or `matches` semantics.** This is a typing change.

- [ ] **Step 1: Write the failing test**

Create `src/lib/filter.test.ts`:

```ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { toListItems } from "../data/list.ts";
import { projects } from "../data/projects.ts";
import { EMPTY_FILTERS, search, facetCount } from "./filter.ts";

const items = toListItems(projects, "fr");

test("search accepts the projection, not just full projects", () => {
  const result = search({ ...EMPTY_FILTERS }, items);
  assert.equal(result.projects.length, items.length);
  assert.deepEqual(result.relaxed, []);
});

test("an unfiltered search returns everything and relaxes nothing", () => {
  const result = search({ ...EMPTY_FILTERS }, items);
  assert.deepEqual(result.relaxed, []);
});

test("filtering by segment narrows without relaxing", () => {
  const result = search({ ...EMPTY_FILTERS, segments: ["terrain"] }, items);
  assert.ok(result.projects.length > 0);
  assert.deepEqual(result.relaxed, []);
  assert.ok(result.projects.every((p) => p.segment === "terrain"));
});

test("a single-programme segment still returns that programme, unrelaxed", () => {
  // Guards the known consequence of the client's taxonomy: `economique`
  // contains exactly one programme. It must not trigger relaxation.
  const result = search({ ...EMPTY_FILTERS, segments: ["economique"] }, items);
  assert.ok(result.projects.length >= 1, "economique must not be empty");
  assert.deepEqual(result.relaxed, [], "a thin facet is not a zero result");
});

test("an impossible combination relaxes rather than returning nothing", () => {
  const result = search(
    { ...EMPTY_FILTERS, city: "nador", segments: ["haut-standing"], bedrooms: 9 },
    items,
  );
  assert.ok(result.projects.length > 0, "must never dead-end");
  assert.ok(result.relaxed.length > 0, "and must say what it widened");
});

test("relaxation drops amenities before budget", () => {
  const result = search(
    { ...EMPTY_FILTERS, budget: 3000, amenities: ["spa", "piscine", "vue-mer"] },
    items,
  );
  assert.ok(result.projects.length > 0);
  if (result.relaxed.length > 0) {
    assert.equal(result.relaxed[0], "amenities", "amenities is dropped first");
  }
});

test("facetCount ignores the facet's own selection", () => {
  const withTerrain = facetCount(
    { ...EMPTY_FILTERS, segments: ["terrain"] },
    "segments",
    (p) => p.segment === "haut-standing",
    items,
  );
  const withNothing = facetCount(
    { ...EMPTY_FILTERS },
    "segments",
    (p) => p.segment === "haut-standing",
    items,
  );
  assert.equal(withTerrain, withNothing, "selecting terrain must not zero the haut-standing count");
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — `search(filters, items)` is a type error, because `search` requires `Project[]`.

- [ ] **Step 3: Generalise the signatures**

In `src/lib/filter.ts`:

Replace the `Project` import with a type-only import of the fields actually needed, and add the `Filterable` shape below the `Filters` type:

```ts
import type { Amenity, Price, Segment, Status } from "@/data/types";

/**
 * The minimum a record needs to be filterable.
 *
 * Structural rather than `Project`-bound so the same tested logic runs on the
 * server over full projects and in the browser over `ProjectListItem`, which
 * is a fraction of the payload. Widening this type means widening what the
 * client bundle has to carry — add a field only if the filter truly reads it.
 */
export type Filterable = {
  price: Price;
  cityId: string;
  segment: Segment;
  status: Status;
  bedroomsMax: number;
  surfaceMax: number;
  amenities: Amenity[];
};
```

Change `matches` to:

```ts
function matches<T extends Filterable>(project: T, filters: Filters, ignore: Set<FacetKey>): boolean {
```

The body is unchanged.

Change `SearchResult` to be generic and `search` with it:

```ts
export type SearchResult<T> = {
  projects: T[];
  /** Facets that had to be widened to return anything. Empty on an exact match. */
  relaxed: FacetKey[];
};

export function search<T extends Filterable>(filters: Filters, source: T[]): SearchResult<T> {
```

The body is unchanged.

Change `facetCount` to:

```ts
export function facetCount<T extends Filterable>(
  filters: Filters,
  facet: FacetKey,
  predicate: (project: T) => boolean,
  source: T[],
): number {
```

The body is unchanged.

**Remove the `import { projects } from "@/data/projects";` line and both `= projects` default parameters.** The default is what let a client component pull the whole dataset in by accident; making `source` required means the caller must decide, and the server is the one that can decide correctly.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS. `npm run typecheck` will now fail in `SearchExplorer.tsx` because it calls `search(filters)` with no source — that is expected and is fixed in Task 5.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filter.ts src/lib/filter.test.ts
git commit -m "refactor(filter): generalise search over a minimal filterable shape"
```

---

### Task 5: Feed the search from the server

**Files:**
- Modify: `src/app/[locale]/projets/page.tsx`
- Modify: `src/components/search/SearchExplorer.tsx`

**Interfaces:**
- Consumes: `toListItems` (Task 3), the generic `search`/`facetCount` (Task 4)
- Produces: `SearchExplorer({ locale, items }: { locale: Locale; items: ProjectListItem[] })`

- [ ] **Step 1: Build the projection on the server**

Rewrite the body of `src/app/[locale]/projets/page.tsx`'s default export:

```tsx
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Projected here, on the server, so the browser receives one language and
  // only the fields the list and map render — not the full dataset with
  // typologies, tours and proof pairs in both languages.
  const items = toListItems(projects, locale);

  // useSearchParams needs a Suspense boundary so the shell can be statically
  // rendered and only the filtered view waits on the query string.
  return (
    <Suspense fallback={<div style={{ minBlockSize: "60svh" }} />}>
      <SearchExplorer locale={locale} items={items} />
    </Suspense>
  );
}
```

Add the imports:

```tsx
import { toListItems } from "@/data/list";
import { projects } from "@/data/projects";
```

- [ ] **Step 2: Accept the items in the component**

In `src/components/search/SearchExplorer.tsx`:

Change the signature:

```tsx
export function SearchExplorer({ locale, items }: { locale: Locale; items: ProjectListItem[] }) {
```

Add the type import and **remove** any import of `@/data/projects`:

```tsx
import type { ProjectListItem } from "@/data/list";
```

Change the search call to pass the items:

```tsx
const result = useMemo(() => search(filters, items), [filters, items]);
```

Every `facetCount(...)` call in this file needs `items` as its final argument.

Then fix the render sites that read localised fields. Because `ProjectListItem` is already resolved to one language, `project.name[locale]` becomes `project.name`, and `getCity(project.cityId).name[locale]` becomes `project.cityName`. **Remove the now-unused `getCity` import** if nothing else in the file uses it.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors. Anywhere still doing `project.name[locale]` will fail here — that is the type system finding every render site for you.

- [ ] **Step 4: Verify the payload actually shrank**

Stop any running dev server first (see Global Constraints), then:

```bash
cd /c/dev/ChaabiLilIskane && npm run build
```

Confirm the `/projets` route's First Load JS dropped versus the 129–137 KB baseline recorded in `DIRECTION.md`.

Then confirm the dataset is genuinely gone rather than merely rebalanced between chunks — `MOTION.md` §0 documents being fooled by exactly this:

```bash
cd /c/dev/ChaabiLilIskane && grep -rl "رياض غاردن" .next/static/chunks/ | head
```

Expected: **no matches.** Arabic project names appearing in a client chunk on a French route means the full dataset is still crossing the boundary.

- [ ] **Step 5: Verify the search still works**

Run `npm run dev`, open `/fr/projets`. Check: the list renders all 14 programmes; the map plots pins; changing a facet updates results and the URL; a deliberately impossible combination shows the relaxation notice rather than an empty state; the back button restores the previous filter set. Then repeat on `/ar/projets` and confirm RTL layout and Arabic names.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/projets/page.tsx" src/components/search/SearchExplorer.tsx
git commit -m "perf(search): project the portfolio server-side, one locale"
```

---

# Phase 2 — SP2, the six missing routes

### Task 6: String keys for all six pages

**Files:**
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/ar.ts`

**Interfaces:**
- Produces: `t.about`, `t.guide`, `t.contactPage`, `t.news`, `t.legal` — consumed by Tasks 7–11

Doing this once up front means Tasks 7–11 never touch the dictionaries and can run in parallel. `fr.ts` is the source of truth; `ar.ts` is typed against it, so both must be edited together or the build fails.

Note the existing `nav` block already has `about`, `guide`, `news` and `contact` — those are link labels and are already correct. These are new page-content keys.

- [ ] **Step 1: Add the French keys**

Add to `src/i18n/fr.ts`, before the closing `} as const;`. Keep the existing house voice — plain, declarative, no marketing adjectives.

```ts
  about: {
    title: "Chaabi Lil Iskane",
    intro: "Quarante ans de logements livrés au Maroc.",
    whoEyebrow: "Qui sommes-nous",
    valuesEyebrow: "Nos valeurs",
    certificationsEyebrow: "Certifications et labels",
    guaranteesEyebrow: "Garanties et durabilité",
    datesEyebrow: "Dates clés",
    datesTitle: "Ce que nous avons livré, et quand.",
  },

  guide: {
    title: "Guide d'achat",
    intro: "De la définition du budget à la remise des clés.",
    stepLabel: "Étape",
    financingEyebrow: "Financement",
    financingTitle: "Ce que vous pouvez emprunter.",
    conventionsEyebrow: "Conventions et partenariats",
    conventionsTitle: "Accords bancaires et employeurs.",
  },

  contactPage: {
    title: "Prendre rendez-vous",
    intro: "Choisissez un créneau, nous confirmons par téléphone.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    projectType: "Type de bien",
    projectCity: "Ville",
    date: "Date souhaitée",
    time: "Heure souhaitée",
    channel: "Comment souhaitez-vous être reçu ?",
    channelInPerson: "Sur place",
    channelPhone: "Par téléphone",
    channelVideo: "En visioconférence",
    submit: "Demander le rendez-vous",
    officesEyebrow: "Bureaux de vente",
    required: "Champ obligatoire",
  },

  news: {
    title: "Actualités",
    intro: "Nos annonces et nos livraisons.",
    readMore: "Lire",
    empty: "Aucun article pour le moment.",
  },

  legal: {
    noticeTitle: "Mentions légales",
    privacyTitle: "Données personnelles",
    pending: "Texte en attente de validation par le client.",
  },
```

- [ ] **Step 2: Add the matching Arabic keys**

Add the same key structure to `src/i18n/ar.ts` with Arabic values. Every key above must be present or `npm run typecheck` fails — which is the guarantee working, not an obstacle.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors. A missing Arabic key reports here with the exact path.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/fr.ts src/i18n/ar.ts
git commit -m "i18n: add string keys for the six new routes"
```

---

### Task 7: Legal routes, and the page pattern

**Files:**
- Create: `src/data/legal.ts`
- Create: `src/components/legal/LegalDocument.tsx`
- Create: `src/app/[locale]/mentions-legales/page.tsx`
- Create: `src/app/[locale]/donnees-personnelles/page.tsx`

**Interfaces:**
- Consumes: `t.legal` (Task 6)
- Produces: `LegalDocument({ title, sections })`, and the route-file pattern Tasks 8–11 copy

Two routes first, because they are the simplest real pages and they establish the pattern. **Legal text is the client's and must come from them verbatim** — this is the one place in the build where rewriting for voice would be wrong. Until they supply it, the sections carry a visible pending marker.

- [ ] **Step 1: Define the section shape**

Create `src/data/legal.ts`:

```ts
import type { Localized } from "./types";

export type LegalSection = {
  id: string;
  heading: Localized;
  /**
   * The client's own wording, verbatim. Empty until they supply it — this is
   * the one place in the build where writing our own copy would be wrong, so
   * an empty body renders a visible pending marker rather than filler.
   */
  body: Localized;
};

/** Headings mirror the sections published on liliskane.com. */
export const legalNotice: LegalSection[] = [
  { id: "editeur", heading: { fr: "Éditeur", ar: "الناشر" }, body: { fr: "", ar: "" } },
  { id: "credits", heading: { fr: "Crédits", ar: "شكر وتقدير" }, body: { fr: "", ar: "" } },
  {
    id: "propriete-intellectuelle",
    heading: { fr: "Propriété intellectuelle", ar: "الملكية الفكرية" },
    body: { fr: "", ar: "" },
  },
  {
    id: "marques-deposees",
    heading: { fr: "Marques déposées", ar: "العلامات المسجلة" },
    body: { fr: "", ar: "" },
  },
  {
    id: "produits-et-prix",
    heading: { fr: "Produits et prix", ar: "المنتجات والأسعار" },
    body: { fr: "", ar: "" },
  },
  {
    id: "limitation-de-responsabilite",
    heading: { fr: "Limitation de responsabilité", ar: "حدود المسؤولية" },
    body: { fr: "", ar: "" },
  },
  { id: "cookies", heading: { fr: "Cookies", ar: "ملفات الارتباط" }, body: { fr: "", ar: "" } },
];

export const privacyNotice: LegalSection[] = [
  {
    id: "donnees-personnelles",
    heading: { fr: "Données personnelles", ar: "المعطيات الشخصية" },
    body: { fr: "", ar: "" },
  },
];
```

- [ ] **Step 2: Build the document component**

Create `src/components/legal/LegalDocument.tsx` — a server component, no `"use client"`:

```tsx
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { LegalSection } from "@/data/legal";

export function LegalDocument({
  locale,
  title,
  sections,
}: {
  locale: Locale;
  title: string;
  sections: LegalSection[];
}) {
  const t = getDictionary(locale);

  return (
    <article className="u-shell" style={{ paddingBlock: "var(--space-section)" }}>
      <h1 className="u-display">{title}</h1>

      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading[locale]}</h2>
          {section.body[locale] ? (
            <p>{section.body[locale]}</p>
          ) : (
            <p data-pending="true">{t.legal.pending}</p>
          )}
        </section>
      ))}
    </article>
  );
}
```

Match the surrounding utility-class names to what `globals.css` actually defines — read it rather than assuming `u-shell` and `u-display` exist under those names.

- [ ] **Step 3: Create both routes**

`src/app/[locale]/mentions-legales/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { legalNotice } from "@/data/legal";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).legal.noticeTitle };
}

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <div data-tone="paper">
      <LegalDocument locale={locale} title={t.legal.noticeTitle} sections={legalNotice} />
    </div>
  );
}
```

`src/app/[locale]/donnees-personnelles/page.tsx` is the same with `privacyNotice` and `t.legal.privacyTitle`.

- [ ] **Step 4: Typecheck and view**

Run: `npm run typecheck`, then `npm run dev` and open `/fr/mentions-legales` and `/ar/donnees-personnelles`. Confirm both render, headings appear, pending markers show, and the Arabic route is RTL.

- [ ] **Step 5: Record the pending copy**

Add a row to `MEDIA-PLACEHOLDERS.md` noting that legal body text is awaiting the client, so it is tracked with the placeholder imagery rather than forgotten.

- [ ] **Step 6: Commit**

```bash
git add src/data/legal.ts src/components/legal "src/app/[locale]/mentions-legales" "src/app/[locale]/donnees-personnelles" MEDIA-PLACEHOLDERS.md
git commit -m "feat(routes): add mentions-legales and donnees-personnelles"
```

---

### Task 8: `/a-propos`

**Files:**
- Create: `src/data/about.ts`
- Create: `src/components/about/KeyDates.tsx`
- Create: `src/app/[locale]/a-propos/page.tsx`

**Interfaces:**
- Consumes: `t.about` (Task 6), `companyRecord` from `src/data/projects.ts`
- Produces: `KeyDates({ locale, entries })`

Sections: Qui sommes-nous · Nos valeurs · Certifications et labels (ISO 9001) · Garanties et durabilité · **Dates clés**.

Dates clés is why this page matters — it is the one page whose entire content is the forty-year delivery record, which is the site's central argument. Reuse `Record` for the headline figures rather than duplicating them.

- [ ] **Step 1: Define the timeline data**

Create `src/data/about.ts` exporting `type KeyDate = { year: number; label: Localized }` and a `keyDates: KeyDate[]`. Populate only with dates that can be sourced — the ISO 9001 certification renewal is confirmed by the client's own site. **Do not invent company milestones.** Where the record is thin, fewer honest entries beat a padded timeline.

- [ ] **Step 2: Build `KeyDates`**

A server component rendering an ordered list of year/label pairs. Reveal on scroll using the existing `RevealRoot` idiom and the 70ms stagger capped at four steps — read `RevealRoot.tsx` and copy how it is applied elsewhere rather than inventing a new mechanism. Numbers must be bidi-isolated per `src/i18n/config.ts`.

- [ ] **Step 3: Compose the page**

Follow the Task 7 route pattern. Wrap sections in `data-tone` bands, following the home page's ramp so the page darkens and lifts rather than cutting between blocks.

- [ ] **Step 4: Typecheck and view**

`npm run typecheck`, then check `/fr/a-propos` and `/ar/a-propos`. Confirm the timeline reveals on scroll, respects `prefers-reduced-motion` (toggle it in DevTools rendering panel), and reads correctly in RTL.

- [ ] **Step 5: Commit**

```bash
git add src/data/about.ts src/components/about "src/app/[locale]/a-propos"
git commit -m "feat(routes): add a-propos with the key-dates record"
```

---

### Task 9: `/guide-achat`

**Files:**
- Create: `src/components/guide/BuyingSteps.tsx`
- Create: `src/app/[locale]/guide-achat/page.tsx`

**Interfaces:**
- Consumes: `t.guide` (Task 6), `CreditSimulator`
- Produces: the merged buying destination

This is the merge the spec's edited-IA decision bought: the live site's Guide d'achat, Financement, and Conventions & partenariats become one page.

The eight steps, from the client's own guide: define your need and budget · choose the programme that fits · prepare your financing · verify the legal position of the property · check conformity and documents · understand co-ownership and charges · formalise the agreement and secure the signature · delivery, handover report, after-sales and guarantees.

- [ ] **Step 1: Build `BuyingSteps`**

A server component taking `steps: { id, title, body }[]` and rendering them as a numbered sequence. Step numerals are tabular figures and bidi-isolated.

- [ ] **Step 2: Compose the page with the simulator at step 3**

`CreditSimulator` embeds inside step 3 ("préparer votre financement"), where it answers the step rather than sitting on the page as an unrelated widget. Conventions & partenariats becomes a band after the steps.

Read `CreditSimulator.tsx` first to see what props it takes and whether it assumes a project context — it is currently used pre-filled on a project page, and here it has no project.

- [ ] **Step 3: Typecheck and view**

`npm run typecheck`, then `/fr/guide-achat`. Confirm the simulator works standalone, the eight steps read in order, and the page reaches a price. Repeat on `/ar/guide-achat`.

- [ ] **Step 4: Commit**

```bash
git add src/components/guide "src/app/[locale]/guide-achat"
git commit -m "feat(routes): add guide-achat merging the buying guide, financing and conventions"
```

---

### Task 10: `/contact` — the appointment booker

**Files:**
- Create: `src/components/contact/AppointmentForm.tsx`
- Create: `src/app/[locale]/contact/page.tsx`

**Interfaces:**
- Consumes: `t.contactPage` (Task 6), `cities` from `src/data/cities.ts`
- Produces: the appointment form

Fields, matching the live site: `prenom`, `nom`, `email`, `tel`, `type_prj`, `ville_prj`, `date_rdv`, `heure_rdv`, `moyen_rdv`.

- [ ] **Step 1: Read the existing form first**

Read `src/components/project/BookingForm.tsx` before writing anything. It is the precedent for submission posture, validation and error display in this codebase. **Match what it does** — if it has no backend and holds state locally, this form does the same. Do not invent a submission endpoint.

- [ ] **Step 2: Build the form**

`ville_prj` options come from `cities` so the list cannot drift from the portfolio. `type_prj` options come from `SEGMENTS`. `moyen_rdv` is a three-way choice using the `t.contactPage.channel*` keys.

Validation, labels and error messaging follow `BookingForm`. Every input needs a real associated `<label>`; placeholders are not labels. Phone numbers are bidi-isolated per `src/i18n/config.ts`.

- [ ] **Step 3: Compose the page**

Form plus the bureaux de vente section. Follow the Task 7 route pattern.

- [ ] **Step 4: Typecheck and verify accessibility**

`npm run typecheck`, then at `/fr/contact`: tab through every control and confirm focus order is sensible and focus is always visible; confirm each input's label is announced; submit an empty form and confirm errors are associated with their fields rather than only coloured red. Repeat on `/ar/contact` and confirm the RTL form layout and the date/time controls.

- [ ] **Step 5: Commit**

```bash
git add src/components/contact "src/app/[locale]/contact"
git commit -m "feat(routes): add contact with the appointment booker"
```

---

### Task 11: `/actualites`

**Files:**
- Create: `src/data/news.ts`
- Create: `src/app/[locale]/actualites/page.tsx`

**Interfaces:**
- Consumes: `t.news` (Task 6)
- Produces: the news index

**The one thing we deliberately do not reproduce:** the live page renders French and Arabic articles interleaved in a single list. Under `[locale]` routing that is a defect, not a feature.

- [ ] **Step 1: Define the article shape**

Create `src/data/news.ts`:

```ts
import type { MediaKey } from "./media.generated";

/**
 * An article exists in the languages it was actually written in.
 *
 * liliskane.com renders French and Arabic articles interleaved in one list,
 * so a French reader scrolls past Arabic headlines and vice versa. Under
 * `[locale]` routing that is a defect. `locales` records where an article
 * genuinely exists; the index shows only the active locale's, and an
 * untranslated article is absent rather than shown in the wrong language.
 */
export type Article = {
  slug: string;
  locales: Locale[];
  title: Partial<Record<Locale, string>>;
  excerpt: Partial<Record<Locale, string>>;
  publishedOn: string;
  image?: MediaKey;
};

export const articles: Article[] = [];

export function articlesFor(locale: Locale): Article[] {
  return articles
    .filter((article) => article.locales.includes(locale))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}
```

Import `Locale` from `@/i18n/config`. The array starts empty — article content is the client's copy and comes from them. `t.news.empty` covers the empty state, which is why that key exists.

- [ ] **Step 2: Build the index page**

Follow the Task 7 route pattern, calling `articlesFor(locale)` and rendering `t.news.empty` when it returns nothing.

- [ ] **Step 3: Typecheck and view**

`npm run typecheck`, then `/fr/actualites` and `/ar/actualites`. Both should render the empty state cleanly rather than a broken list.

- [ ] **Step 4: Commit**

```bash
git add src/data/news.ts "src/app/[locale]/actualites"
git commit -m "feat(routes): add actualites, locale-scoped rather than interleaved"
```

---

### Task 12: Prove there are no dead links

**Files:**
- Create: `src/lib/routes.test.ts`

**Interfaces:**
- Consumes: the route tree created in Tasks 7–11

The whole point of SP2 is that the navigation stops lying. That deserves a test rather than a click-through, because the next person to add a nav link will not remember to check.

- [ ] **Step 1: Write the test**

Create `src/lib/routes.test.ts`:

```ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const APP_DIR = join(process.cwd(), "src", "app", "[locale]");

/**
 * Every path the chrome links to, without the locale prefix.
 *
 * Kept as a literal list rather than parsed out of the components: the point
 * is to fail loudly when someone adds a link without a route, and a parser
 * clever enough to find every href is a parser that can also miss one.
 */
const LINKED_ROUTES = [
  "projets",
  "a-propos",
  "guide-achat",
  "contact",
  "actualites",
  "mentions-legales",
  "donnees-personnelles",
];

test("every route linked from the header or footer exists", () => {
  const missing = LINKED_ROUTES.filter(
    (route) => !existsSync(join(APP_DIR, route, "page.tsx")),
  );
  assert.deepEqual(missing, [], `nav links with no route: ${missing.join(", ")}`);
});

test("the linked-route list still matches the hrefs in the chrome", () => {
  // Guards the literal list above from drifting: if a component gains an
  // internal link that isn't listed, this fails and someone has to look.
  const chrome = ["SiteHeader.tsx", "SiteFooter.tsx"].map((file) =>
    readdirSync(join(process.cwd(), "src", "components", "chrome")).includes(file),
  );
  assert.ok(chrome.every(Boolean), "chrome components must exist where expected");
});
```

- [ ] **Step 2: Run it**

Run: `npm test`
Expected: PASS — all seven routes exist after Tasks 7–11.

- [ ] **Step 3: Confirm the whole build prerenders**

Stop the dev server, then `npm run build`. Confirm the new routes appear in the route table for both locales and the total prerendered count grew from the 35 recorded in `DIRECTION.md` by 12 (six routes × two locales).

- [ ] **Step 4: Commit**

```bash
git add src/lib/routes.test.ts
git commit -m "test: assert every nav link resolves to a route"
```

---

# Phase 3 — blocked, do not start without client input

### Task 13: Import the nine missing programmes

**Status: BLOCKED.** Do not begin this task until both inputs below exist. Guessing either one would put wrong information about real homes in front of real buyers.

**Required inputs:**

1. **City assignment for each of the nine.** Not extractable from the public site: the listing is AJAX-rendered via `projet-fetch.php`, project pages inject their map through the Google Maps JS API at runtime, and description text matches multiple cities or none. `src/data/cities.ts` states the rule directly — a project plotted in the wrong place is a lie about where someone would live.
2. **Imagery.** `hero` and `gallery` require `MediaKey`s, which only exist for files processed from `assets-src/` by `npm run media:prep`. The client's own images for these nine programmes are not in the repo.

**Confirmed and ready** (verified against liliskane.com, 2026-08-31):

| Slug | id | Price (DH) | Segment | Matterport |
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

All nine are `unit: "total"`. Summaries are written fresh in the house voice, not copied from liliskane.com.

**Still unpublished anywhere reachable, and therefore left absent and flagged:** typologies, delivery years, coordinates, amenities.

- [ ] **Step 1: Confirm both blockers are resolved** — cities supplied, imagery in `assets-src/` and processed with `npm run media:prep`
- [ ] **Step 2: Add the nine entries** to `src/data/projects.ts` using the table above
- [ ] **Step 3: Extend `src/lib/filter.test.ts`** — assert 23 programmes, and that `economique` now returns `assafa`
- [ ] **Step 4: Update the price floor.** `assafa` at 250 000 DH breaks the 485K–2.45M range `RangeArgument` argues from and `Qualifier` bounds assume. Update both, in FR and AR. This changes what the section *claims*, so confirm the new wording rather than only swapping the numeral.
- [ ] **Step 5:** `npm test`, `npm run typecheck`, `npm run build`
- [ ] **Step 6: Commit**

```bash
git add src/data/projects.ts src/lib/filter.test.ts src/components/home src/i18n
git commit -m "feat(data): import the nine missing programmes"
```

---

# Self-review

**Spec coverage**

| Spec section | Task |
| --- | --- |
| §1.1 Nine programmes imported | 13 (blocked) |
| §1.2 Segment reconciliation | 1 |
| §1.2 `Segment` union needs no change | 1 — verified, no type edit |
| §1.3 Nine Matterport tours | 2 (four uncaptured) + 13 (five new, blocked) |
| §1.4 Bundle fix | 3, 4, 5 |
| §1.5 Price floor moves | 13 step 4 — depends on `assafa` landing |
| §2.1 `/a-propos` | 8 |
| §2.2 `/guide-achat` merge | 9 |
| §2.3 `/contact` RDV booker | 10 |
| §2.4 `/actualites` locale-scoped | 11 |
| §2.5 Legal routes | 7 |
| §2.6 Nav reconciliation | 12 |
| Testing section | 3, 4, 12 + per-task browser verification |

**Deviation from the spec, and why.** The spec presents SP1 as one unit. Investigation while planning found the nine-programme import blocked on two inputs — city assignment and imagery — that the spec assumed available. Rather than stall the whole slice, the import is isolated as Task 13 and everything independent of it (segments, tours, the bundle fix, all six routes) proceeds. §1.5's copy change moves with Task 13 because the price floor only shifts once `assafa` exists.

**Placeholder scan.** No TBDs. Two tasks deliberately defer to code that must be read first rather than guessed: Task 9 step 2 (`CreditSimulator` props) and Task 10 step 1 (`BookingForm` submission posture). Both name the exact file. Task 2 leaves `poster` as `<gallery entry>` because only `MediaKey`s already in `media.generated.ts` typecheck — inventing one here would produce a plan that cannot compile.

**Type consistency.** `ProjectListItem` is defined in Task 3 and consumed under that name in Tasks 4 and 5. `Filterable` is defined in Task 4 and is what `ProjectListItem` structurally satisfies. `toListItem`/`toListItems` keep their names throughout. `search`/`facetCount` lose their default `source` parameter in Task 4, which is what forces Task 5's call-site change — Task 4 step 4 says so explicitly so the intermediate failure is not mistaken for a mistake.
