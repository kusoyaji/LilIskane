"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";

/**
 * Site-wide scroll choreography.
 *
 * Every section on this site already marks its animated blocks with `.u-enter`,
 * and headings that should wipe up from their own baseline already wrap their
 * text in `.reveal-inner`. Rather than rewrite each component, this takes over
 * that existing vocabulary and drives it with ScrollTrigger — so one file
 * upgrades the motion on every page, including sections nobody has touched.
 *
 * The CSS implementation is stood down rather than left to fight this: `html`
 * gets a `gsap-on` class, and the stylesheet's `.u-enter` transitions are
 * neutralised under it. Two systems animating the same opacity is how elements
 * end up flickering or stuck half-revealed.
 *
 * What each kind of element gets:
 *
 *   - **type and blocks** rise and fade, staggered within their own section so
 *     a group arrives as a group rather than all at once;
 *   - **headings** wipe up from behind their own baseline, clipped by the
 *     overflow their markup already provides;
 *   - **media** settles out of a slight over-scale, finishing *after* the type
 *     it belongs to — that lag is what gives a frame weight instead of making
 *     it appear;
 *   - **anything marked `data-parallax`** drifts against the scroll for its
 *     whole time on screen.
 *
 * Triggers fire at 88% of the viewport — before the element is centred. A
 * reveal the reader watches *begin* reads as a delay; one already in motion as
 * it arrives reads as the page being alive.
 */
export function ScrollChoreography() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.documentElement.classList.add("gsap-on");

      const ctx = gsap.context(() => {
        // ---- display headings: word by word --------------------------------
        //
        // The single biggest change in perceived quality, and it is pure
        // transform. A heading that arrives as one block is a heading that
        // faded in; the same heading arriving word by word is a heading being
        // *written*. Each word is wrapped in its own clipping span so it wipes
        // from behind its own baseline rather than sliding over the layout.
        gsap.utils.toArray<HTMLElement>('[data-reveal="mask"] .reveal-inner').forEach((inner) => {
          if (!inner.dataset.split) {
            /**
             * Split **text nodes**, never `innerHTML`.
             *
             * The string version of this is a trap worth naming: splitting
             * `innerHTML` on whitespace tears markup apart *inside its own
             * tags*, because the spaces between attributes are whitespace too.
             * A heading containing `<span class="u-numeric" style="...">` came
             * out with `class="u-numeric"` wrapped as a visible word. The
             * delivery-record heading — which sets its figures in styled spans
             * — rendered its own attributes as body copy.
             *
             * Walking the DOM instead leaves every element node untouched and
             * splits only the characters that were ever text. Nested markup
             * keeps working: the walker still reaches the text *inside* those
             * spans, so a styled figure animates as words and keeps its colour.
             */
            const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT);
            const texts: Text[] = [];
            let node = walker.nextNode();
            while (node) {
              if (node.textContent?.trim()) texts.push(node as Text);
              node = walker.nextNode();
            }

            texts.forEach((text) => {
              const frag = document.createDocumentFragment();
              // Split on whitespace only — never on characters. Arabic letters
              // join, and boxing them individually would break the script.
              (text.textContent ?? "").split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (!part.trim()) {
                  frag.appendChild(document.createTextNode(part));
                  return;
                }
                const box = document.createElement("span");
                box.className = "rv-w";
                const travel = document.createElement("span");
                travel.className = "rv-i";
                travel.textContent = part;
                box.appendChild(travel);
                frag.appendChild(box);
              });
              text.replaceWith(frag);
            });

            inner.dataset.split = "true";
          }

          gsap.fromTo(
            inner.querySelectorAll(".rv-i"),
            { yPercent: 118, rotate: 4 },
            {
              yPercent: 0,
              rotate: 0,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.055,
              scrollTrigger: { trigger: inner.parentElement ?? inner, start: "top 85%" },
            },
          );
        });

        // ---- media: arrive from a real distance -----------------------------
        gsap.utils.toArray<HTMLElement>('[data-reveal="media"]').forEach((el) => {
          const img = el.querySelector("img, video");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 85%" },
          });

          tl.fromTo(
            el,
            { opacity: 0, yPercent: 14, scale: 0.92 },
            { opacity: 1, yPercent: 0, scale: 1, duration: 1.3, ease: "expo.out" },
            0,
          );
          if (img) {
            // The picture keeps moving after its frame has stopped — the frame
            // lands, the image settles into it. That trailing beat is most of
            // what separates a photograph with weight from one that appeared.
            tl.fromTo(
              img,
              { scale: 1.32 },
              { scale: 1, duration: 1.9, ease: "expo.out" },
              0,
            );
          }
        });

        // ---- everything else: rise, staggered per section --------------------
        //
        // Batched by section so a group reads as one arrival. Batching the
        // whole document would stagger across unrelated blocks and make the
        // delay feel arbitrary.
        const sections = gsap.utils.toArray<HTMLElement>("main section, main > div > div");
        sections.forEach((section) => {
          const items = gsap.utils
            .toArray<HTMLElement>(".u-enter", section)
            .filter((el) => !el.matches('[data-reveal="mask"], [data-reveal="media"]'));
          if (items.length === 0) return;

          gsap.fromTo(
            items,
            { opacity: 0, y: 72 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "expo.out",
              stagger: 0.13,
              scrollTrigger: { trigger: section, start: "top 85%" },
            },
          );
        });

        // ---- opt-in parallax ------------------------------------------------
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const depth = Number(el.dataset.parallax || 0.2);
          gsap.fromTo(
            el,
            { yPercent: -depth * 12 },
            {
              yPercent: depth * 12,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });

      // Images decoding late change section heights; without this every trigger
      // below the fold is measured against a layout that no longer exists.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);

      return () => {
        window.removeEventListener("load", refresh);
        ctx.revert();
        document.documentElement.classList.remove("gsap-on");
      };
    });

    return () => mm.revert();
  }, [pathname]);

  return null;
}
