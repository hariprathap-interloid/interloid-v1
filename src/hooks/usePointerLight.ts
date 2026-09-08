"use client";

import { useCallback, useEffect, useRef } from "react";

/* Cursor-follow for the card effects — CommitmentTile's wash and WorkCard's
   lit border both run on this.

   Extracted 2026-09-07 when the second copy was about to be written. The
   subtle part is not the maths, it is the four things around it (the rAF
   parking itself, the first-contact seed, the leave cleanup, the reduced-motion
   opt-out) and having two copies of those drift apart is how one of them ends
   up with a leak nobody notices.

   It writes CSS custom properties and nothing else. Consumers place --x/--y in
   a gradient; the hook never touches a class, a style rule or `transform` —
   the last of those matters because HANDOFF §5.14 has a keyframe on `transform`
   cancelling a hover scale, and this is exactly the code that would do it
   again.

   THE LERP IS THE POINT. Writing the pointer position straight from the event
   pins the light to the cursor and it snaps frame-for-frame; easing toward the
   target at `ease` per frame (0.14 settles in roughly 150ms) makes it glide
   and settle, which is the difference between "a gradient moves" and "a light
   follows you".

   REDUCED MOTION IS HANDLED HERE, and that fixes a real bug rather than
   avoiding a hypothetical one: globals.css kills CSS transitions wholesale,
   but a rAF loop is not a transition and that block never reached it, so
   CommitmentTile's spotlight kept gliding for visitors who had asked for less
   movement. Under the media query the position is written directly — the
   effect still works, it just stops animating. Read live rather than cached,
   because the OS setting can change mid-session. */
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
