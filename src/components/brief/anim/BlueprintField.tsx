"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   BlueprintField — an app wireframe that draws itself as the story is told.
   ==========================================================================
   A blueprint grid, and on it the outline of a product screen: window, top
   bar, sidebar, hero, three cards, a chart, a button. Each part has a point
   in the story (`at`) where its pen starts, and its stroke is drawn along
   its own length as progress passes that point — the sketch gets more
   detailed with every answer. On send the drawing "inks in": blocks fill
   and the button turns solid. "We turn a story into software."

   CANVAS 2D, NOT THREE.JS — the lightest of the three stage animations: no
   library, no data file, a few hundred line segments a frame. Same rules as
   the others: device pixel ratio capped at 2, reduced motion followed live
   (strokes jump to their target, the pen dot goes), paused offscreen and in
   a hidden tab.

   The sketch is a generic product screen, not the visitor's project — it
   illustrates "your story becomes a design", it does not claim to be one. */

type Pt = readonly [number, number];
type Part = { at: number; pts: readonly Pt[]; fill?: boolean; accent?: boolean };

const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
  [x, y],
];

/* In a 1 × 1 box, fitted to the panel at 16:10. Ordered as a designer would
   rough it out: frame, chrome, content, detail, the call to action last. */
const PARTS: readonly Part[] = [
  { at: 0.0, pts: rect(0, 0, 1, 1) },
  { at: 0.06, pts: [[0, 0.1], [1, 0.1]] },
  { at: 0.12, pts: rect(0, 0.1, 0.2, 0.9) },
  { at: 0.2, pts: [[0.04, 0.2], [0.16, 0.2]] },
  { at: 0.23, pts: [[0.04, 0.27], [0.13, 0.27]] },
  { at: 0.26, pts: [[0.04, 0.34], [0.15, 0.34]] },
  { at: 0.32, pts: rect(0.26, 0.17, 0.68, 0.22), fill: true },
  { at: 0.38, pts: [[0.3, 0.24], [0.62, 0.24]] },
  { at: 0.42, pts: [[0.3, 0.31], [0.52, 0.31]] },
  { at: 0.5, pts: rect(0.26, 0.46, 0.2, 0.19), fill: true },
  { at: 0.56, pts: rect(0.5, 0.46, 0.2, 0.19), fill: true },
  { at: 0.62, pts: rect(0.74, 0.46, 0.2, 0.19), fill: true },
  { at: 0.7, pts: rect(0.26, 0.71, 0.68, 0.23) },
  { at: 0.78, pts: [[0.29, 0.9], [0.4, 0.8], [0.52, 0.84], [0.64, 0.76], [0.76, 0.79], [0.91, 0.74]] },
  { at: 0.86, pts: rect(0.74, 0.26, 0.16, 0.08), accent: true },
];
/* How much progress one part takes to draw fully. */
const SPAN = 0.14;

export default function BlueprintField({ progress, done }: { progress: number; done: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ progress, done });
  useEffect(() => {
    target.current = { progress, done };
  }, [progress, done]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      w = stage.clientWidth;
      h = stage.clientHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let still = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      still = e.matches;
    };
    mq.addEventListener("change", onMq);

    const k = new Float32Array(PARTS.length);
    let ink = 0; /* 0 sketched … 1 inked, on send */
    let last = performance.now();
    let t = 0;
    let visible = true;
    let raf = 0;

    /* Draw the first `f` of a polyline, by length. Returns the pen's tip. */
    const stroke = (pts: readonly Pt[], f: number, map: (p: Pt) => [number, number]) => {
      const P = pts.map(map);
      let total = 0;
      for (let i = 1; i < P.length; i++) total += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      let left = total * f;
      ctx.beginPath();
      ctx.moveTo(P[0][0], P[0][1]);
      let tip: [number, number] = P[0];
      for (let i = 1; i < P.length && left > 0; i++) {
        const seg = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        const u = Math.min(1, left / seg);
        tip = [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u];
        ctx.lineTo(tip[0], tip[1]);
        left -= seg;
      }
      ctx.stroke();
      return tip;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      const { progress: p0, done: sent } = target.current;
      const p = sent ? 1 : Math.max(0, Math.min(1, p0));

      ctx.clearRect(0, 0, w, h);

      /* The blueprint grid — every fifth line a little stronger. */
      const g = 18;
      for (let x = 0, n = 0; x <= w; x += g, n++) {
        ctx.strokeStyle = n % 5 ? "rgba(92,200,230,.06)" : "rgba(92,200,230,.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0, n = 0; y <= h; y += g, n++) {
        ctx.strokeStyle = n % 5 ? "rgba(92,200,230,.06)" : "rgba(92,200,230,.12)";
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }

      /* Fit the 16:10 sketch inside the panel. */
      const bw = Math.min(w * 0.82, h * 0.8 * 1.6);
      const bh = bw / 1.6;
      const bx = (w - bw) / 2;
      const by = (h - bh) / 2;
      const map = (q: Pt): [number, number] => [bx + q[0] * bw, by + q[1] * bh];

      ink = still ? (sent ? 1 : 0) : ink + ((sent ? 1 : 0) - ink) * (1 - Math.exp(-dt * 3));

      /* A plain loop, not forEach: TypeScript does not follow assignments
         made inside a callback, so `pen` read after a forEach narrows to
         `never` (TS2488). A loop body it can follow. */
      let pen: [number, number] | null = null;
      for (let i = 0; i < PARTS.length; i++) {
        const part = PARTS[i];
        const goal = Math.max(0, Math.min(1, (p - part.at) / SPAN));
        k[i] = still ? goal : k[i] + (goal - k[i]) * (1 - Math.exp(-dt * 4));
        if (k[i] < 0.002) continue;

        /* On send: blocks fill, the button goes solid. */
        if (ink > 0.01 && (part.fill || part.accent) && k[i] > 0.99) {
          const [x0, y0] = map(part.pts[0]);
          const [x1, y1] = map(part.pts[2]);
          ctx.fillStyle = part.accent ? `rgba(40,157,190,${0.9 * ink})` : `rgba(40,157,190,${0.14 * ink})`;
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        }

        ctx.strokeStyle = part.accent ? `rgba(127,224,201,${0.35 + 0.6 * k[i]})` : `rgba(92,200,230,${0.3 + 0.6 * k[i]})`;
        ctx.lineWidth = i === 0 ? 1.75 : 1.25;
        ctx.lineJoin = "round";
        const tip = stroke(part.pts, k[i], map);
        if (k[i] > 0.02 && k[i] < 0.98) pen = tip;
      }

      /* The pen: a bright dot where the drawing is being made. */
      if (pen && !still) {
        const [px, py] = pen;
        ctx.fillStyle = `rgba(255,255,255,${0.7 + 0.3 * Math.sin(t * 12)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      stage.dataset.ready = "1";
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        kick();
      },
      { threshold: 0 },
    );
    io.observe(stage);
    const onVis = () => kick();
    document.addEventListener("visibilitychange", onVis);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener("change", onMq);
      delete stage.dataset.ready;
    };
  }, []);

  return (
    <div ref={stageRef} className="relative size-full">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
    </div>
  );
}
