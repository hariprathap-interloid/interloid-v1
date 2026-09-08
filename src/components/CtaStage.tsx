"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   The CTA slab's drifting field — a three.js replacement for the 24 CSS
   particles that were here. It follows HeroStage's contract exactly, because
   every rule that component learned the hard way applies again:

   LOADING. `three` is imported dynamically inside the effect, behind
   requestIdleCallback. This section is below the fold and must not touch first
   paint — the budget is 364ms and the build measures 236ms (HANDOFF §8). The
   library is already code-split for the hero, so the marginal cost here is the
   component, not the dependency.

   FALLBACK. The server-rendered CSS particles stay in the markup and are what
   you see with no JS, no WebGL, or before this boots. They fade out only once
   the canvas has actually drawn a frame — `data-webgl="ready"` on the slab,
   the same handshake HeroStage does with `.ready`. Nothing pops.

   ADDITIVE BLENDING IS SAFE HERE, and it is worth saying why, because §5.17
   says the opposite for the hero: additive only ever brightens, so it is
   useless on a pale ground, which is why HeroStage has to watch the theme and
   retune. This slab is #0f172b in BOTH themes — it is the one surface on the
   page that does not change — so the field can blend additively and never
   needs a theme observer at all.

   NO ROTATION. §5.15. The field is flat, and rotating it would sweep the
   points through a line exactly as it does for the hero mark. It drifts and
   sways in the plane; nothing rotates.
   ========================================================================== */

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function CtaStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !webglOK()) return;

    const slab = canvas.closest<HTMLElement>("[data-cta-slab]");
    if (!slab) return;

    /* React 18 StrictMode runs effects twice in dev, so a half-finished async
       boot has to be fully reversible. */
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false /* the points are soft-edged in the shader already */,
        alpha: true,
        powerPreference: "low-power" /* decoration, not the hero mark */,
      });
      const DPR = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(DPR);

      const scene = new THREE.Scene();
      /* Orthographic, not perspective: the field is a flat plane of drifting
         points, and an ortho box makes the wrap-around exact — a point leaving
         the top is at y = 1 whatever the viewport happens to be. */
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 5;

      /* Density scales with area, so a phone does not get a desktop's worth of
         points crammed into a third of the space. */
      const area = slab.clientWidth * slab.clientHeight;
      const N = Math.max(45, Math.min(190, Math.round(area / 5200)));

      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const siz = new Float32Array(N);
      const alp = new Float32Array(N);
      /* per point: home x, drift speed, sway amplitude, phase */
      const seed = new Float32Array(N * 4);

      const white = new THREE.Color("#ffffff");
      const accent = new THREE.Color("#289dbe");
      const spark = new THREE.Color("#38bdf8");
      const tmp = new THREE.Color();

      for (let i = 0; i < N; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;

        seed[i * 4] = x;
        seed[i * 4 + 1] = 0.012 + Math.random() * 0.03; /* drift */
        seed[i * 4 + 2] = 0.004 + Math.random() * 0.016; /* sway  */
        seed[i * 4 + 3] = Math.random() * Math.PI * 2; /* phase */

        /* Mostly white dust with a tinted minority — the same restraint the
           CSS particles had, with a colour range they could not do. */
        const r = Math.random();
        tmp.copy(white);
        if (r > 0.82) tmp.copy(spark);
        else if (r > 0.62) tmp.copy(accent);
        col[i * 3] = tmp.r;
        col[i * 3 + 1] = tmp.g;
        col[i * 3 + 2] = tmp.b;

        siz[i] = 1 + Math.random() * 2.6;
        alp[i] = 0.14 + Math.random() * 0.3;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));
      geo.setAttribute("aAlpha", new THREE.BufferAttribute(alp, 1));

      /* ShaderMaterial, not PointsMaterial — §5.16: PointsMaterial draws
         SQUARES, and a field of tiny squares reads as compression noise. */
      const uni = { uDpr: { value: DPR }, uFade: { value: 0 } };
      const mat = new THREE.ShaderMaterial({
        uniforms: uni,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: [
          "attribute float aSize;",
          "attribute float aAlpha;",
          "uniform float uDpr;",
          "varying vec3 vCol;",
          "varying float vAlpha;",
          "void main() {",
          "  vCol = color;",
          "  vAlpha = aAlpha;",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
          "  gl_PointSize = aSize * uDpr;",
          "}",
        ].join("\n"),
        fragmentShader: [
          "uniform float uFade;",
          "varying vec3 vCol;",
          "varying float vAlpha;",
          "void main() {",
          "  /* Soft round sprite. Without this they are squares. */",
          "  float d = length(gl_PointCoord - vec2(0.5));",
          "  float a = smoothstep(0.5, 0.12, d) * vAlpha * uFade;",
          "  if (a <= 0.001) discard;",
          "  gl_FragColor = vec4(vCol, a);",
          "}",
        ].join("\n"),
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const aPos = geo.getAttribute("position") as THREE.BufferAttribute;

      const resize = () => {
        const w = slab.clientWidth;
        const h = slab.clientHeight;
        if (!w || !h) return;
        const a = w / h;
        camera.left = -a;
        camera.right = a;
        camera.top = 1;
        camera.bottom = -1;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        /* Re-spread x across the new aspect, or the field bunches into the
           middle of a wide slab. */
        for (let i = 0; i < N; i++) pos[i * 3] = seed[i * 4] * a;
        aPos.needsUpdate = true;
      };
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(slab);

      let raf: number | null = null;
      const t0 = performance.now();
      let last = t0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const t = (now - t0) / 1000;
        /* Clamped: a backgrounded tab returns a huge delta and every point
           would jump a screen. */
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        /* One second of fade-in, so the field arrives rather than appears. */
        uni.uFade.value = Math.min(1, t);

        const a = camera.right;
        for (let i = 0; i < N; i++) {
          const j = i * 3;
          const s = i * 4;
          let y = pos[j + 1] + seed[s + 1] * dt;
          if (y > 1.05) y = -1.05; /* wrap, with margin so nothing blinks */
          pos[j + 1] = y;
          pos[j] =
            seed[s] * a + Math.sin(t * 0.35 + seed[s + 3]) * seed[s + 2] * a;
        }
        aPos.needsUpdate = true;
        renderer.render(scene, camera);
      };

      let io: IntersectionObserver | null = null;
      if (reduced) {
        /* Decoration, so under reduced motion it simply sits still. Handled
           here in JS because globals.css kills CSS transitions wholesale and
           never reaches a rAF loop — same note as usePointerLight. */
        uni.uFade.value = 1;
        renderer.render(scene, camera);
      } else {
        /* Render only while on screen — §8's performance budget. */
        io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting && raf === null) {
              last = performance.now();
              raf = requestAnimationFrame(frame);
            } else if (!e.isIntersecting && raf !== null) {
              cancelAnimationFrame(raf);
              raf = null;
            }
          },
          { threshold: 0 },
        );
        io.observe(slab);
      }

      /* Hand over from the CSS particles only once a frame really exists. */
      renderer.render(scene, camera);
      requestAnimationFrame(() => slab.setAttribute("data-webgl", "ready"));

      cleanup = () => {
        if (raf !== null) cancelAnimationFrame(raf);
        io?.disconnect();
        ro.disconnect();
        slab.removeAttribute("data-webgl");
        geo.dispose();
        mat.dispose();
        renderer.dispose();
      };
    };

    /* After idle, so it lands behind first paint. */
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      idle = requestIdleCallback(() => void start(), { timeout: 1500 });
    } else {
      timer = setTimeout(() => void start(), 250);
    }

    return () => {
      cancelled = true;
      if (idle !== undefined) cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
    />
  );
}
