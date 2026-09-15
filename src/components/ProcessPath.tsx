"use client";

import { useEffect, useRef } from "react";

/* The "How we work" connector: a generated motion path through the step
   nodes, with a comet that lights each waypoint as it reaches it. Alternating
   bow; horizontal at lg, vertical below. The ends are inset.

   ── THE PATH IS NEVER AUTHORED ─────────────────────────────────────────────
   Every point comes from measuring the rendered nodes; a hard-coded `d` is
   correct at exactly one viewport width and drifts at every other.

   1. MEASUREMENT IGNORES TRANSFORMS, ON PURPOSE. getBoundingClientRect
      returns the visual box, including any transform in flight: [data-reveal]
      holds each step 20px low until it scrolls in, and the node scales on
      hover. `centre()` walks offsetLeft/offsetTop instead — layout values
      that transforms do not touch — so the path runs through where the nodes
      REST, whatever is animating.
   2. `build()` READS LAYOUT, `frame()` DOES NOT. Measuring happens on mount,
      resize and intersection; per-frame work only writes attributes. A layout
      read inside frame() would thrash at 60fps.

   ── MOTION ────────────────────────────────────────────────────────────────
   · The coloured path is drawn once and stays whole, so there is no seam when
     the loop wraps.
   · The comet travels on an eased cycle and fades out before the wrap, so it
     never visibly jumps from the end back to the start.
   · The head moves via a `transform` on a group.
   · The loop runs only while the section is on screen, and the cycle starts
     at the first intersection, so the reader sees the sweep happen.

   ── THE COMET LIGHTS THE WAYPOINTS, AND THE SEQUENCE REPLAYS ─────────────
   Lighting follows the comet, not scroll position, so the section plays the
   same sequence however the reader arrives. Each cycle has four beats: sweep
   (0 -> TRAVEL), hold on the completed row (TRAVEL -> RESET_AT), dark
   (RESET_AT -> 1), replay. The reset fires only in the dark phase, after the
   comet has faded, so steps never blink off mid-sweep. The unlit state (no
   --lit, no data-lit) matches the server render, so a replayed cycle is
   identical to first paint.

   Reduced motion is handled here in JS, because CSS reduced-motion rules never
   reach a rAF loop: the steps are simply lit and the comet is hidden. */

const LG = 1024; /* Tailwind's lg. The layout flips here, so the path does. */
const CYCLE = 6500; /* ms for one comet pass, including its fade-out tail. */
const TRAVEL = 0.84; /* fraction of the cycle spent moving; the rest is dark. */
/* Where in the cycle the steps drop back to their initial state. It sits AFTER
   TRAVEL, which splits the dark phase in two: the completed row holds for a
   beat, then goes dark for a beat, then the sweep replays. Not at the wrap:
   with the ends inset the first node is at path length 0, so step 1 would
   re-light on the same frame it was cleared and never appear to restart. */
const RESET_AT = 0.92;

export default function ProcessPath() {
  const svg = useRef<SVGSVGElement>(null);
  const base = useRef<SVGPathElement>(null);
  const live = useRef<SVGPathElement>(null);
  const tail = useRef<SVGPathElement>(null);
  const comet = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = svg.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let LEN = 0;
    let AT: number[] = [];
    let steps: HTMLElement[] = [];
    let raf = 0;
    /* Brightness per step. Monotonic WITHIN a cycle — the head only moves
       forward — and reset to zero at each wrap. See the replay note above. */
    let litVal: number[] = [];
    /* The cycle clock starts at the first intersection, not at page load. */
    let t0 = 0;
    /* Whether this cycle's reset has already fired. Guards the once-per-cycle
       write; without it resetLit would run on every frame of the dark phase. */
    let didReset = false;

    function build() {
      const el = svg.current, host = el?.parentElement;
      const path = live.current;
      if (!el || !host || !path) return;

      steps = Array.from(host.querySelectorAll<HTMLElement>("[data-step]"));
      const nodes = steps
        .map((s) => s.querySelector<HTMLElement>("[data-node]"))
        .filter(Boolean) as HTMLElement[];
      if (nodes.length < 2) return;

      /* Layout coordinates, not visual ones — see note 1. Walking
         offsetParent accumulates correctly because each offsetLeft is relative
         to the next positioned ancestor, and `host` is `relative`. */
      const centre = (node: HTMLElement): [number, number] => {
        let x = 0, y = 0;
        let cur: HTMLElement | null = node;
        while (cur && cur !== host) {
          x += cur.offsetLeft;
          y += cur.offsetTop;
          cur = cur.offsetParent as HTMLElement | null;
        }
        return [x + node.offsetWidth / 2, y + node.offsetHeight / 2];
      };

      const w = host.offsetWidth, h = host.offsetHeight;
      const pts = nodes.map(centre);

      el.setAttribute("viewBox", `0 0 ${w} ${h}`);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;

      const vert = window.innerWidth < LG;
      const bow = vert ? 34 : 42;

      /* ── THE ENDS ARE INSET ────────────────────────────────────────────────
         The route runs from the FIRST node's centre to the LAST one's and
         stops. Both ends hide under their opaque nodes, so the path reads as a
         connector between the steps rather than a rail escaping the
         sequence. */
      const [x0, y0] = pts[0];
      let d = `M ${x0} ${y0}`;

      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const s = bow * (i % 2 ? -1 : 1);
        /* Control points a third and two thirds along, pushed perpendicular —
           across the row when horizontal, sideways when stacked. */
        d += vert
          ? ` C ${ax + s} ${ay + (by - ay) * 0.32}, ${bx + s} ${ay + (by - ay) * 0.68}, ${bx} ${by}`
          : ` C ${ax + (bx - ax) * 0.32} ${ay + s}, ${ax + (bx - ax) * 0.68} ${by + s}, ${bx} ${by}`;
      }
      base.current?.setAttribute("d", d);
      path.setAttribute("d", d);
      tail.current?.setAttribute("d", d);
      LEN = path.getTotalLength();

      /* Where each node actually sits ALONG the path. A bowed curve overshoots,
         so waypoint i is not at i/(n-1) of the length — it has to be walked. */
      const N = 320;
      const acc = pts.map(() => ({ best: Infinity, len: 0 }));
      for (let i = 0; i <= N; i++) {
        const l = (i / N) * LEN;
        const q = path.getPointAtLength(l);
        pts.forEach(([px, py], k) => {
          const dist = (q.x - px) ** 2 + (q.y - py) ** 2;
          if (dist < acc[k].best) acc[k] = { best: dist, len: l };
        });
      }
      AT = acc.map((a) => a.len);
      if (litVal.length !== steps.length) litVal = steps.map(() => 0);

      tail.current?.style.setProperty("--len", String(LEN));
    }

    /* Light from a position ALONG THE PATH — normally the comet's. Values
       only ever go up here; resetLit is the only way back down. */
    function lightTo(at: number) {
      steps.forEach((st, i) => {
        /* Ramp over the 90px before the waypoint so it comes up as the head
           approaches rather than snapping on top of it. */
        const want = Math.max(0, Math.min(1, (at - AT[i] + 90) / 90));
        if (want <= litVal[i]) return;
        litVal[i] = want;
        st.style.setProperty("--lit", want.toFixed(3));
        if (want >= 1) st.dataset.lit = "1";
      });
    }

    /* Back to the server-rendered state: no --lit, no data-lit. Removing the
       properties rather than writing "0" matters — it is what makes a replayed
       cycle identical to first paint instead of merely similar. */
    function resetLit() {
      steps.forEach((st, i) => {
        litVal[i] = 0;
        st.style.removeProperty("--lit");
        delete st.dataset.lit;
      });
    }

    function lightAll() {
      steps.forEach((st, i) => {
        litVal[i] = 1;
        st.style.setProperty("--lit", "1");
        st.dataset.lit = "1";
      });
    }

    const easeInOutSine = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);

      const g = comet.current, t = tail.current;
      if (!g || !t || !LEN) return;

      /* Reduced motion: no tracker, and the steps are simply lit. The sequence
         is information, so it is delivered — only the animation is dropped. */
      if (reduced()) {
        lightAll();
        g.style.opacity = "0";
        t.style.opacity = "0";
        return;
      }

      if (!t0) t0 = now;
      const u = ((now - t0) % CYCLE) / CYCLE;
      const p = easeInOutSine(Math.min(1, u / TRAVEL));
      const at = LEN * p;

      /* Light while the head is running, then unlight once, late in the dark
         phase. The order matters: lightTo must not run in the same frame as
         the reset, or `at` (which is pinned at LEN once u passes TRAVEL) would
         immediately relight everything it just cleared. */
      if (u < RESET_AT) {
        didReset = false;
        lightTo(at);
      } else if (!didReset) {
        didReset = true;
        resetLit();
      }

      /* Fade in at the start and out before the wrap, so the head is invisible
         at the moment it jumps back to zero. This is the whole seam fix. */
      const fade =
        u < 0.06 ? u / 0.06 : u > TRAVEL - 0.1 ? Math.max(0, (TRAVEL - u) / 0.1) : 1;

      const q = live.current!.getPointAtLength(at);
      /* A 5.5px head against an 80px node reads fine on desktop; on a narrow
         column the same head next to the same node is proportionally louder,
         so it comes down a touch. */
      const k = window.innerWidth < LG ? 0.8 : 1;
      g.setAttribute(
        "transform",
        `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)}) scale(${k})`,
      );
      g.style.opacity = String(fade);

      /* The tail is one dash the length of the trail, offset to sit just behind
         the head — cheaper and steadier than a second animated path. */
      const T = 90;
      t.style.strokeDasharray = `${T} ${LEN}`;
      t.style.strokeDashoffset = String(-(at - T));
      t.style.opacity = String(fade * 0.55);
    }

    build();

    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf);
        if (!e.isIntersecting) return;
        /* Rebuild on the way in: fonts and the reveal may have settled since
           mount, and the path is only as good as its last measurement. */
        build();
        raf = requestAnimationFrame(frame);
      },
      { rootMargin: "120px" },
    );
    io.observe(host);

    /* ResizeObserver rather than a window listener: the section also changes
       height when the font loads, and that moves every node. */
    const ro = new ResizeObserver(() => build());
    ro.observe(host);

    const onResize = () => build();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <svg
      ref={svg}
      /* A stable hook. `#process svg` also matches the four step icons, so
         anything reaching for the connector from outside needs this. */
      data-process-path
      className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="processRail" x1="0" x2="1">
          <stop offset="0" stopColor="var(--brand)" />
          <stop offset=".55" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--brand-light)" />
        </linearGradient>
      </defs>

      {/* The faint route, always whole. */}
      <path ref={base} fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" />
      {/* The coloured route, also always whole, so the loop has no seam. */}
      <path
        ref={live}
        fill="none"
        stroke="url(#processRail)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        ref={tail}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ opacity: 0 }}
      />
      <g ref={comet} style={{ opacity: 0, willChange: "transform" }}>
        <circle r="13" fill="var(--accent)" opacity=".2" />
        <circle r="5.5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2.5" />
      </g>
    </svg>
  );
}
