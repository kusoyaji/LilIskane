# MEDIA — PLACEHOLDERS

Every asset listed here is **temporary**. It is in the build so the layout can be judged with
real photography instead of grey boxes, and it must be replaced with Chaabi's own imagery before
anything goes live.

Read this before showing the site to anyone who might assume the pictures are Chaabi's.

## Why placeholders at all

The client files supplied so far are either too small for the frames they sit in or do not belong
to each other. The four in the depth interstitial were the clearest case: 282–730 px on the long
edge, so the smallest was being upscaled about 2.2× on a retina screen, and a 2005-era aerial
render sat directly beside a contemporary lobby. The result read as a stock grab rather than as
one company's body of work — which is the opposite of what that section is for.

## Licensing

All stock below is from **Unsplash**, under the [Unsplash License](https://unsplash.com/license):
free for commercial use, no attribution required, no permission needed.

Attribution is not legally required, and the credits are recorded here anyway — partly as good
practice, partly so anyone auditing the build can tell instantly which images are ours and which
are not.

**Nothing here was scraped from a competitor, a portfolio site, or an image search.** That
distinction matters for a developer's own site: presenting another firm's building as your own
delivered work is the kind of thing that surfaces in a pitch meeting.

## In use

| Key | Subject | Unsplash ID | Source px | Where |
| --- | --- | --- | --- | --- |
| `st_salon_warm` | Warm-toned living room, tan leather | `CCQi3pV95k0` | 2560×1707 | Depth interstitial |
| `st_villa_pool_dusk` | Villa and pool at dusk, mountains behind | `hap-fa_gV1A` | 2560×1707 | Depth interstitial |
| `st_courtyard_screens` | Courtyard, carved wooden screens, pink lime walls | `Kloc39u0yhk` | 2560×1707 | Depth interstitial |
| `st_facade_beige` | Beige concrete apartment facade | `B9_64BdLjcw` | 2560×1707 | Depth interstitial |

## Downloaded, not yet placed

Kept because they fit the art direction and are likely useful as the maquette grows.

| Key | Subject | Unsplash ID | Source px |
| --- | --- | --- | --- |
| `st_courtyard_arches` | Courtyard with arches and a pool | `b9lxWF89eG0` | 2560×1707 |
| `st_terrace_view` | Modern balcony over open country | `CMx8-3rlPB4` | 2560×1920 |
| `st_marrakech_koutoubia` | Koutoubia, Marrakech | `Im766eHd34c` | 2560×1920 |

## Not placeholders

These are the client's own, and stay.

- `rg1_*` — photographs of the delivered Riad Garden I
- `rg2_*` — renders of Riad Garden II
- `th_*` — programme thumbnails across the portfolio
- `hero_courtyard` — AI-generated courtyard, used as the opening image and the film backdrop

`hero_courtyard` is deliberately **not** replaced with a stock photograph. The headline above it
says the building does not exist yet, which makes a render the only honest thing that can sit
there — the same rule that keeps the photographed Tanger programme out of the hero rotation
(see `src/data/heroCities.ts`). A real photograph of a real courtyard under that sentence would
make the site's one legally-loaded claim untrue.

## Replacing them

1. Drop the new files into `assets-src/` as JPEG or PNG.
2. `npm run media:prep` — resizes to a 2560 px master, emits an LQIP and intrinsic dimensions
   into `src/data/media.generated.ts`.
3. Point the `key` at the new asset and rewrite the `alt` text in both languages. Alt text is
   authored per asset in the data layer, not derived, so it does not follow the image
   automatically.
4. Delete the retired entry from this file.

Anything still listed here at launch is a bug.
