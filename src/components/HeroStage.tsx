"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   The hero mark — particles disperse into a cloud and re-condense, 14s loop.
   Ported from prototype3/hero-logo.js. The physics is unchanged; what changed
   is how it loads and how it cleans up.

   LOADING. `three` is imported dynamically inside the effect, behind
   requestIdleCallback, so it is code-split out of the initial bundle entirely
   and cannot touch first paint. The live site measures FCP 364ms and the
   review says do not regress it (HANDOFF §8) — this component is the single
   most likely thing to.

   THEME. It OBSERVES `.dark` on <html>; it never sets it. Nav owns that class
   and the inline script in layout.tsx writes it first. Two owners is a race
   (HANDOFF §5.19). All the observer does is retune blending, because additive
   blending only brightens and is useless on a pale ground (§5.17).

   NO ROTATION, EVER. §5.15: `rotation.y = t * k` is cumulative in elapsed
   time, and the cloud is flat, so every pass through 90° collapses it to a
   line and reads as a card flipping. It survived review three times because
   the first cycle looks fine.
   ========================================================================== */

const CYCLE = 14;

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

export default function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !webglOK()) return;

    const hero = stage.closest<HTMLElement>("[data-hero]");
    if (!hero) return;

    /* Everything that must be torn down, collected as we go. React 18+ runs
       effects twice in dev StrictMode, so a half-initialised async boot must
       still be fully reversible. */
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      let data: { count: number; pos: number[] };
      try {
        data = await (await fetch("/logo-points.json")).json();
      } catch (e) {
        console.error("logo points unavailable; CSS fallback stands", e);
        return;
      }
      if (cancelled) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

      /* sRGB equivalents of --brand / --accent. Deliberately hard-coded: the
         mark keeps one ramp in both themes, and the headline gradient (when
         enabled) is cut to match it. */
      const C = {
        brand: new THREE.Color("#1f5da0"),
        accent: new THREE.Color("#289dbe"),
      };

      const N = data.count;
      const src = data.pos;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      const DPR = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(DPR);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 15;

      const home = new Float32Array(N * 3);
      const smoke = new Float32Array(N * 3);
      const phase = new Float32Array(N * 2);
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);

      let SCALE = 4;
      let HOME_X = 4.6;
      let HOME_Y = 0;
      const FRAME = { w: 14, h: 14 };
      const tmp = new THREE.Color();

      for (let i = 0; i < N; i++) {
        const x = src[i * 2];
        const y = src[i * 2 + 1];

        home[i * 3] = x;
        home[i * 3 + 1] = y;
        home[i * 3 + 2] = 0; /* flat, and nothing rotates it */

        /* Every point travels to a common flattened shell around the mark's
           centre, so the cloud gathers INTO the logo rather than the logo
           merely loosening in place. */
        const r = 1.5 + Math.random() * 1.6;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        smoke[i * 3] = r * Math.sin(ph) * Math.cos(th);
        smoke[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.66;
        smoke[i * 3 + 2] = r * Math.cos(ph) * 0.35;

        phase[i * 2] = Math.random() * Math.PI * 2;
        phase[i * 2 + 1] = 0.5 + Math.random() * 0.9;

        tmp.copy(C.brand).lerp(C.accent, clamp((x + 1) / 2));
        col[i * 3] = tmp.r;
        col[i * 3 + 1] = tmp.g;
        col[i * 3 + 2] = tmp.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

      /* ShaderMaterial, not PointsMaterial: PointsMaterial draws SQUARES,
         which was most of why earlier builds read as noise (§5.16).
         gl_PointSize is in device pixels (§5.17). */
      const uni = {
        uSize: { value: 1.9 },
        uOpacity: { value: 0.95 },
        uDpr: { value: DPR },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms: uni,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        vertexShader: `
          varying vec3 vColor;
          uniform float uSize, uDpr;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * uDpr * (60.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          uniform float uOpacity;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.32, d);
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor, a * uOpacity);
          }`,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);
      const aPos = geo.getAttribute("position");

      let isLight = !document.documentElement.classList.contains("dark");
      const applyTheme = () => {
        mat.blending = isLight
          ? THREE.NormalBlending
          : THREE.AdditiveBlending;
        uni.uOpacity.value = isLight ? 1 : 0.95;
        uni.uSize.value = isLight ? 2.2 : 1.9;
      };
      applyTheme();

      const themeObs = new MutationObserver(() => {
        const now = !document.documentElement.classList.contains("dark");
        if (now === isLight) return;
        isLight = now;
        applyTheme();
      });
      themeObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        ptr.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
      };
      const onLeave = () => {
        ptr.tx = 0;
        ptr.ty = 0;
      };
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);

      const resize = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        FRAME.h =
          2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          camera.position.z;
        FRAME.w = FRAME.h * camera.aspect;

        if (w >= 900) {
          SCALE = FRAME.h * 0.34;
          HOME_X = Math.min(FRAME.w * 0.26, FRAME.w / 2 - SCALE * 1.05);
          HOME_Y = 0;
          return;
        }

        /* NARROW. Two traps, both hit in the prototype (§5.20, §5.21):
           1. `h` here is the SECTION height, not the screen — on mobile the
              copy overflows the viewport, so FRAME.w collapses and sizing off
              FRAME.h alone put the mark edge to edge. Cap on WIDTH; the logo
              is square in unit space (x ±1, y ±0.98).
           2. Position and size both key off the section's own padding-top —
              the band the CSS reserves — read from the DOM so the two cannot
              drift apart. Centred at 62%, because the nav is transparent at
              rest and owns the first ~70px. */
        const band =
          parseFloat(getComputedStyle(hero).paddingTop) || h * 0.36;
        const bandWorld = (band / h) * FRAME.h;
        SCALE = Math.min(FRAME.w * 0.26, FRAME.h * 0.19, bandWorld * 0.34);
        HOME_X = 0;
        HOME_Y = ((h / 2 - band * 0.62) / h) * FRAME.h;
      };
      resize();
      window.addEventListener("resize", resize);

      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      let raf: number | null = null;
      let t0 = performance.now();
      let shown = 0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const t = (now - t0) / 1000;

        /* condense (0-40%) → hold (40-80%) → disperse (80-100%) */
        const c = (t % CYCLE) / CYCLE;
        const target = c < 0.4 ? c / 0.4 : c < 0.8 ? 1 : 1 - (c - 0.8) / 0.2;
        shown += (target - shown) * 0.075;
        const k = ease(clamp(shown));
        const away = 1 - k;

        ptr.x += (ptr.tx - ptr.x) * 0.07;
        ptr.y += (ptr.ty - ptr.y) * 0.07;

        for (let n = 0; n < N; n++) {
          const j = n * 3;
          const u = n * 2;
          const ph = phase[u];
          const sp = phase[u + 1];

          /* Turbulence and breathing both fade out with k, so a resolved mark
             is perfectly still. */
          const tx = Math.sin(t * sp + ph) * 0.26;
          const ty = Math.cos(t * sp * 0.8 + ph * 1.7) * 0.22;
          const b = 1 + Math.sin(t * 0.7 + n * 0.013) * 0.09 * away;

          pos[j] = ((smoke[j] + tx) * away + home[j] * k) * SCALE * b;
          pos[j + 1] =
            ((smoke[j + 1] + ty) * away + home[j + 1] * k) * SCALE * b;
          pos[j + 2] = (smoke[j + 2] * away + home[j + 2] * k) * SCALE;
        }
        aPos.needsUpdate = true;

        /* A whisper of parallax only. The mark stays square-on, which is the
           only way it stays legible as a logo. */
        points.position.x = HOME_X + ptr.x * 0.2;
        points.position.y = HOME_Y + ptr.y * 0.12;

        renderer.render(scene, camera);
      };

      renderer.render(scene, camera);
      requestAnimationFrame(() => stage.classList.add("ready"));

      let io: IntersectionObserver | null = null;
      if (reduced) {
        for (let n = 0; n < N; n++) {
          pos[n * 3] = home[n * 3] * SCALE;
          pos[n * 3 + 1] = home[n * 3 + 1] * SCALE;
          pos[n * 3 + 2] = 0;
        }
        aPos.needsUpdate = true;
        points.position.set(HOME_X, HOME_Y, 0);
        renderer.render(scene, camera);
      } else {
        /* Render only while on screen — §8's performance budget. */
        io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting && raf === null) {
              t0 = performance.now();
              raf = requestAnimationFrame(frame);
            } else if (!e.isIntersecting && raf !== null) {
              cancelAnimationFrame(raf);
              raf = null;
            }
          },
          { threshold: 0 },
        );
        io.observe(hero);
      }

      cleanup = () => {
        if (raf !== null) cancelAnimationFrame(raf);
        io?.disconnect();
        themeObs.disconnect();
        window.removeEventListener("resize", resize);
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
      };
    };

    /* After idle, so it lands behind first paint. */
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      idle = requestIdleCallback(() => void start(), { timeout: 1200 });
    } else {
      timer = setTimeout(() => void start(), 200);
    }

    return () => {
      cancelled = true;
      if (idle !== undefined) cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={stageRef} className="stage" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
