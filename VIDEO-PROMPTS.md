# VIDEO PROMPTS — Riad Garden II

> **Status: clip 1 is done and it is a keeper.**
> `wan-2.7_One_continuous…-0.mp4` — 10 s, 1280×720. It travels street → facade →
> courtyard → terrace and ends **at the threshold looking into the salon**. It did pass
> through the opening; it just stops in the doorway instead of settling inside. That is a
> better ending than a full entry would have been, because it is the natural join for
> clip 2. Do not regenerate it.

---

## What went wrong, and the two things to change

**1. You were on the Image tab.** The left panel in your screenshot shows *Image
Dimensions* and *Number of generations* — that is the image UI. Image-to-video lives under
the **Video** tab. Everything below assumes you are there.

**2. Six images in one box does not make keyframes.** Wan 2.7 takes a **single start
image** (and, where offered, an end image). Six loose references get averaged or ignored —
which is why the model invented its own interior rather than travelling to yours. The
model had no interior to aim at, so it improvised one.

## The technique that fixes it: frame chaining

Take the **last frame of the generated clip** and use it as the **start frame of the next
clip**. The join is then invisible, because clip 2 literally begins on clip 1's final
pixel. This works on any tool, needs no multi-keyframe support, and is how continuous
sequences are actually assembled.

I have extracted it for you: **`media-refs/chain/clip1-lastframe.jpg`**.

Repeat for every subsequent clip — generate, extract the last frame, use it as the next
start. Each generation only ever has to invent a few seconds forward from a real image,
which is why it stays stable.

## The section architecture

Your instinct to split this into sections is right, and it is better than one long take.
Each clip becomes a scroll stage on the project page:

| # | Section | Clip | Start frame |
|---|---|---|---|
| 1 | **L'arrivée** — street to threshold | ✅ done | — |
| 2 | **Le seuil** — crossing into the salon | to generate | `clip1-lastframe.jpg` |
| 3 | **L'intérieur** — through the salon | to generate | last frame of clip 2 |
| 4 | **La visite** | the Matterport 360 — already live | — |

Clips carry you in; the 360 lets you walk. That is a real narrative: guided arrival, then
free exploration.

---

## Clip 2 — crossing the threshold

**Start frame:** `media-refs/chain/clip1-lastframe.jpg`
**Duration:** 4–5 s · motion strength 2–3 · 16:9

> The camera continues moving slowly forward from the terrace threshold into the living
> room, crossing fully inside and coming gently to rest facing the seating area. One
> unbroken continuation of the same take at the same walking pace, the same eye-level
> height of about 1.6 metres, and the same unhurried speed, easing to a complete stop in
> the final second. True parallax: the curtain and door frame at the edges of the shot
> sweep past the lens as the camera passes between them, while the far wall moves slowly.
> All architecture and furniture is rigid and holds its exact geometry — walls, ceiling,
> glazing, sofas, tables and the pendant light must not change shape, scale or position.
> The only movement is the sheer curtains breathing gently in the draught and daylight
> shifting fractionally across the floor. The room stays empty; nobody enters.
>
> Photoreal architectural cinematography, shot on an Arri Alexa with a 35mm prime, deep
> focus, natural late-morning Marrakech sunlight, warm limestone and terracotta palette,
> calm and unhurried, no colour grading, no stylisation.

Keep the same negative prompt as below, including `cut, jump cut, scene change`.

**This is a much easier generation than clip 1.** It is a short forward push inside a
single room, starting from a real frame, with no space transition to invent. Expect it to
work on the first or second attempt at low motion strength.

## Clip 3 — through the salon

Generate clip 2 first, extract its last frame, then run essentially the same prompt with
the camera continuing toward the window or turning gently to take in the room. Keep it
short — 3–4 s. By this point every extra second is drift risk for very little gain.

---

## Where your six images actually belong

Not in the video generator. Use them as **start frames for their own clips** — one image,
one clip, one section. The interior and hallway shots are especially valuable as clip
starts, because an interior push is the most reliable generation there is.

Feeding all six to one generation is the one thing guaranteed not to work.

---

# Original single-take prompt (kept for reference)

One continuous ~18-second camera move: **street → facade → courtyard → salon.**
Four reference frames in `media-refs/`, 1920×1080, 16:9, in shot order.

---

## How to feed the four images

This matters more than the prompt wording, so read it first.

**Do not** put all four images in as loose "style references" and ask for one video. The
model has no way to know they are four points on one path, and it will average them into
a drifting hallucination.

**Do** use them as **keyframes**. Two ways, depending on what your tool exposes:

**Option A — multi-keyframe (best).** If Leonardo's video model accepts an ordered
keyframe sequence, feed all four in order (01 → 02 → 03 → 04) with the master prompt
below. One generation, one video.

**Option B — chained start/end frames (works everywhere, recommended for first tries).**
Most tools, including the cheap tiers, only accept a *start frame* and an *end frame*.
So generate three segments:

| Segment | Start frame | End frame | Beat prompt |
|---|---|---|---|
| A | `01-arrival-street` | `02-approach-facade` | Beat 1 |
| B | `02-approach-facade` | `03-courtyard-pool` | Beat 2 |
| C | `03-courtyard-pool` | `04-interior-salon` | Beat 3 |

Concatenate A + B + C. **The joins are invisible** — segment A's last frame *is* segment
B's first frame, pixel for pixel. The result is one continuous video, and it is far more
reliable than asking one generation to invent the whole journey, because at every moment
the model is interpolating between two real images instead of improvising.

If you only try one thing: try Option B. It is how this is done professionally.

---

## Master prompt

> One continuous, unbroken architectural camera move through a Moroccan residential
> development in Marrakech, filmed as a single take at walking pace. The camera travels
> steadily forward the entire time and never stops, never cuts, never reverses. It moves
> down the residential street past the ground-floor shops, continues along the planted
> pedestrian path beside the limestone facade with its deep balconies and perforated
> lattice screens, passes between the buildings into the landscaped courtyard with its
> turquoise pool and tall palms, and finally moves through the open terrace glazing into
> the bright living room, where it comes gently to rest.
>
> True three-dimensional parallax throughout: foreground planting, kerbs and paving sweep
> past the lens noticeably faster than the buildings behind them. The camera holds a
> constant height of about 1.6 metres — human eye level, never drone height — and a
> constant, unhurried speed, easing to a complete stop only in the final second.
>
> All architecture is rigid and must hold its exact geometry: buildings, balconies,
> shopfronts, parasols, furniture and especially the diamond-perforated lattice screens,
> whose pattern must not shimmer, crawl or resolve into a different pattern. The only
> movement in the world is a light breeze in the palm fronds and shrubs, a soft natural
> ripple on the pool surface, sheer curtains breathing gently indoors, and sunlight
> shifting slowly across stone and floor. People already present remain where they are and
> move only slightly at a distance. Nobody new enters frame. No vehicle moves.
>
> Photoreal architectural cinematography, shot on an Arri Alexa with a 35mm prime, deep
> focus, natural late-morning Marrakech sunlight, hard directional shadows, warm limestone
> and terracotta palette, calm and unhurried, no colour grading, no stylisation.

## Per-segment beat lines (Option B only)

Append the relevant line to the master prompt for each segment:

- **Beat 1 —** *The camera moves down the street and turns onto the planted path running
  alongside the residence, the facade opening up ahead and to the side.*
- **Beat 2 —** *The camera continues along the path and passes between two blocks into the
  open courtyard, the pool coming into view ahead.*
- **Beat 3 —** *The camera crosses the courtyard toward the terrace, passes through the
  open floor-to-ceiling glazing into the living room, and settles to a complete stop
  facing the seating area.*

## Negative prompt

> morphing architecture, warping walls, bending or melting buildings, sliding windows,
> rubbery palm trunks, geometry deforming, building outline changing, new objects
> appearing, extra cars, extra people, people morphing, distorted faces, duplicated limbs,
> text, captions, watermark, logo, camera shake, handheld jitter, whip pan, zoom burst,
> dolly zoom, fisheye, barrel distortion, lens flare, heavy bloom, teal and orange grade,
> oversaturation, HDR halo, flickering, strobing, smearing motion blur, time-lapse clouds,
> dramatic sky, cut, jump cut, scene change, split screen

Note `cut, jump cut, scene change` — with a multi-space journey the model's instinct is to
*cut* between locations rather than travel between them. Those three terms are what keep
it a single take.

## Settings

16:9 · 24 fps · ~6 s per segment (18 s total) · **motion strength 2–4 of 10** · no camera
shake · highest available resolution.

Low motion strength is not optional. Architecture punishes high motion harder than any
other subject — a cheap model at low motion will beat an expensive one at high motion
here, which is exactly why testing cheap first is the right call.

---

## The one transition that will fight you

**Courtyard → salon (segment C) is the hard one.** Everything before it is exterior-to-exterior
and the model has plausible geometry to work with. Crossing from outdoors into a room means
inventing a threshold that exists in neither reference frame.

Three things make it work, in order of effectiveness:

1. The phrase **"passes through the open floor-to-ceiling glazing"** — it gives the model a
   named, physical doorway instead of asking it to teleport.
2. **Shorten segment C** to 4 s. Fewer frames to drift across.
3. If it still morphs, generate segment C as a **slow push toward the terrace doors**
   ending outside, and let the site cut to the interior. A clean cut beats a melting wall,
   and on the page it reads as deliberate.

## If a pass fails

One change at a time, in this order:

1. **Warping architecture** → lower motion strength. Almost always sufficient.
2. **Still warping** → shorten the segment. 6 s → 4 s.
3. **It cut instead of travelling** → strengthen "single unbroken take, no cuts" and confirm
   `cut, jump cut, scene change` are in the negative.
4. **Flat, no depth** → strengthen the parallax sentence and name the specific foreground
   object that should move faster.
5. **Distorted faces** (courtyard) → crop the people out of that reference frame.
6. **Sky doing something dramatic** → add "static sky, clouds do not move".

Do not fix warping by piling on negative terms. It is a motion-magnitude problem, not a
prompt-vocabulary problem.

## Delivery

- `.mp4` H.264 master, 1920×1080, 24 fps — the assembled single video
- WebM/AV1 transcode for the site
- **Frame 1 exported as JPG** — the poster, and on a slow connection the only thing many
  mobile users will ever see
- If you generate as three segments, send the three source files too, so the page can hold
  the natural rest points between beats
