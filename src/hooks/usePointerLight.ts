"use client";

import { useCallback, useEffect, useRef } from "react";

/* Cursor-follow for card lighting effects. Shared so the subtle parts (the
   rAF loop parking itself, the first-contact seed, the leave cleanup, the
   reduced-motion opt-out) live in one place.

   It writes the CSS custom properties --x/--y and nothing else; consumers
   place them in a gradient. It never touches a class or `transform`, so it
   cannot fight a hover transform or keyframe on the same element.

   The lerp is the point: writing the pointer position straight from the
   event snaps frame-for-frame, while easing toward the target at `ease` per
   frame (0.14 settles in roughly 150ms) makes the light glide.

   Reduced motion is handled here because the global CSS rule only disables
   transitions, and a rAF loop is not one. Under the media query the position
   is written directly, so the effect still works without animating. Read
   live rather than cached, since the OS setting can change mid-session. */
export function usePointerLight<T extends HTMLElement>(ease = 0.14) {
  const node = useRef<T | null>(null);
  const target = useRef<[number, number] | null>(null);
  const cur = useRef<[number, number] | null>(null);
  const raf = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  /* The loop parks itself once the light has arrived, so an idle card costs
     nothing and the next pointermove restarts it. */
  const run = useCallback(() => {
    const frame = () => {
      const el = node.current;
      const t = target.current;
      if (!el || !t) {
        raf.current = 0;
        return;
      }
      const c = cur.current ?? t;
      const next: [number, number] = [
        c[0] + (t[0] - c[0]) * ease,
        c[1] + (t[1] - c[1]) * ease,
      ];
      cur.current = next;
      el.style.setProperty("--x", `${next[0].toFixed(1)}px`);
      el.style.setProperty("--y", `${next[1].toFixed(1)}px`);
      raf.current =
        Math.abs(t[0] - next[0]) > 0.5 || Math.abs(t[1] - next[1]) > 0.5
          ? requestAnimationFrame(frame)
          : 0;
    };
    raf.current = requestAnimationFrame(frame);
  }, [ease]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const p: [number, number] = [e.clientX - r.left, e.clientY - r.top];
      target.current = p;
      /* First contact starts where the pointer is, or the light visibly flies
         in from the element's centre. */
      cur.current ??= p;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cur.current = p;
        el.style.setProperty("--x", `${p[0]}px`);
        el.style.setProperty("--y", `${p[1]}px`);
        return;
      }
      if (!raf.current) run();
    },
    [run],
  );

  useEffect(() => stop, [stop]);

  return { ref: node, onPointerMove, onPointerLeave: stop };
}
