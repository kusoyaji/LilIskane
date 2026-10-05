"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import s from "./GalleryLightbox.module.css";

/** One image, already resolved on the server — no manifest crosses to the client. */
export type LightboxItem = {
  src: string;
  width: number;
  height: number;
  blur: string;
  alt: string;
  render: boolean;
};

type Labels = {
  dialog: string;
  close: string;
  previous: string;
  next: string;
  render: string;
};

/** Horizontal travel, in px, that counts as a swipe rather than a tap. */
const SWIPE = 48;

/**
 * Full-screen viewer for a programme's gallery.
 *
 * The spread itself stays server-rendered and passes through as `children`;
 * any element inside it carrying `data-gallery-index` opens the viewer at that
 * image, by event delegation, so the tiles need no client code of their own.
 *
 * Built on the native `<dialog>`: `showModal()` gives the top layer, a real
 * focus trap, an inert page and Escape for free, and closing hands focus back
 * to the tile that opened it. The page under it is held still two ways — the
 * dialog carries `data-lenis-prevent` so the smooth-scroll driver ignores wheel
 * input over it, and the root's overflow stops touch and keyboard scrolling.
 *
 * Only the current image and its two neighbours are mounted, stacked in one
 * stage and cross-faded on `opacity`, so stepping is instant (the neighbours
 * have already loaded) and nothing else is ever downloaded.
 */
export function GalleryLightbox({
  items,
  labels,
  dir,
  children,
}: {
  items: LightboxItem[];
  labels: Labels;
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const pointerX = useRef<number | null>(null);
  const count = items.length;

  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? null : (i + delta + count) % count)),
    [count],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || index === null || dialog.open) return;
    dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onClose = () => {
      root.style.overflow = previous;
      setIndex(null);
    };
    dialog.addEventListener("close", onClose, { once: true });
  }, [index]);

  const onOpen = (event: React.MouseEvent) => {
    const tile = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-index]");
    if (!tile) return;
    event.preventDefault();
    setIndex(Number(tile.dataset.galleryIndex));
  };

  // Arrows follow reading direction: in Arabic the next image is to the left.
  const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === forward) step(1);
    else if (event.key === back) step(-1);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: React.PointerEvent) => {
    pointerX.current = event.clientX;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointerX.current;
    pointerX.current = null;
    if (start === null) return;
    const dx = event.clientX - start;
    if (Math.abs(dx) < SWIPE) return;
    // A leftward swipe advances in LTR and goes back in RTL.
    step((dx < 0 ? 1 : -1) * (dir === "rtl" ? -1 : 1));
  };

  const current = index === null ? null : items[index];
  const window_ =
    index === null ? [] : [...new Set([(index - 1 + count) % count, index, (index + 1) % count])];

  return (
    <>
      <div onClick={onOpen}>{children}</div>

      <dialog
        ref={dialogRef}
        className={s.dialog}
        aria-label={labels.dialog}
        data-lenis-prevent=""
        onKeyDown={onKeyDown}
        onClick={(event) => {
          // A press on the backdrop (the dialog box itself, not its content) closes.
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        {current && index !== null && (
          <div className={s.frame}>
            <div className={s.bar}>
              <p className={s.count} aria-live="polite">
                <bdi dir="ltr">
                  {index + 1} / {count}
                </bdi>
              </p>
              <button
                type="button"
                className={`${s.close} u-press`}
                onClick={() => dialogRef.current?.close()}
                autoFocus
              >
                {labels.close}
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>

            <div className={s.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              {window_.map((i) => {
                const item = items[i];
                return (
                  <Image
                    key={i}
                    src={item.src}
                    alt={i === index ? item.alt : ""}
                    aria-hidden={i === index ? undefined : true}
                    width={item.width}
                    height={item.height}
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL={item.blur}
                    className={s.image}
                    data-active={i === index ? "" : undefined}
                    draggable={false}
                  />
                );
              })}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    className={`${s.nav} ${s.prev} u-press`}
                    onClick={() => step(-1)}
                    aria-label={labels.previous}
                  >
                    <Chevron />
                  </button>
                  <button
                    type="button"
                    className={`${s.nav} ${s.next} u-press`}
                    onClick={() => step(1)}
                    aria-label={labels.next}
                  >
                    <Chevron />
                  </button>
                </>
              )}
            </div>

            <p className={s.caption}>
              {current.render && <span className={s.render}>{labels.render}</span>}
              <span>{current.alt}</span>
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}

function Chevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
