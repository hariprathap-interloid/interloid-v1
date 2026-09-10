"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   HERO SCATTER — a faithful port of hero-order.js's SCATTERED state.

   This is the reference prototype at progress = 0 and nothing else: no scroll
   track, no timed cycle, no lattice, no condense-into-the-logo. Grouping comes
   later and will reuse HeroStage's timed approach, which is why HeroStage.tsx
   is left untouched rather than edited into this.

   WHY THIS IS A REWRITE, NOT A TUNING. The first attempt built a small dense
   ball parked to the right of the copy. The reference is a different object:
   particles sit on a HUGE shell (r = 8–16 world units against a camera at
   z = 15), so the cloud swallows the whole frame, and with sizeAttenuation the
   handful of particles near the camera draw as big squares while the far ones
   fall to single specks. That size spread across a full-bleed sparse field IS
   the look — it cannot be reached by resizing a compact cloud.

   The numbers below (N, r, OFFSET_X, the .62 y-flatten, size .085, opacity
   .78, the .04 drift, the .1 breathing) are lifted verbatim from
   hero-order.js. Treat them as a spec: changing one changes the match.

   POINTSMATERIAL, DELIBERATELY. It draws SQUARES, which is what was asked for
   and what the reference shows. HeroStage §5.16 avoids it for the logo mark —
   squares read as noise when they have to resolve into a legible shape — but
   noise is precisely the point of a scattered field. sizeAttenuation also
   carries the depth read on its own, so no custom shader is needed here.

   ROTATION IS CUMULATIVE HERE, and that is correct. HeroStage §5.15 bans
   `rotation.y = t * k` because that cloud is FLAT, so every pass through 90°
   collapses it to a line. This cloud is a true 3D shell, so it presents the
   same silhouette at every angle and the slow drift just keeps it alive.

   LOADING and TEARDOWN follow HeroStage: `three` is imported inside the effect
   behind requestIdleCallback so it code-splits out of the initial bundle and
   cannot touch first paint (HANDOFF §8, FCP 364ms), and every listener,
   observer and GPU resource is collected for cleanup because React StrictMode
   runs this effect twice in dev.
   ========================================================================== */

const N = 4200;
const OFFSET_X = 4.2;

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

export default function HeroScatter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !webglOK()) return;

    const hero = stage.closest<HTMLElement>("[data-hero]");
    if (!hero) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* sRGB equivalents of theme.css --brand / --accent / --brand-light,
         same three the reference mixes between. */
      const C = {
        brand: new THREE.Color("#1f5da0"),
        accent: new THREE.Color("#289dbe"),
        light: new THREE.Color("#3a7bc8"),
      };

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
      camera.position.z = 15;

      /* `chaos` is the resting scatter; `pos` is what the GPU reads. */
      const chaos = new Float32Array(N * 3);
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);

      const tmp = new THREE.Color();
      for (let k = 0; k < N; k++) {
        /* r far exceeds the camera distance, so the shell encloses the
           viewer — this is what makes the field full-bleed rather than an
           object sitting in frame. y is flattened to .62 so the cloud reads
           wide in a 16:9 band. */
        const r = 8 + Math.random() * 8;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        chaos[k * 3] = r * Math.sin(ph) * Math.cos(th) + OFFSET_X;
        chaos[k * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.62;
        chaos[k * 3 + 2] = r * Math.cos(ph);

        /* Biased toward brand so the cloud stays legible on a pale ground;
           accent shows up as highlights rather than half the cloud. */
        tmp
          .copy(C.brand)
          .lerp(Math.random() < 0.3 ? C.accent : C.light, Math.random() * 0.85);
        col[k * 3] = tmp.r;
        col[k * 3 + 1] = tmp.g;
        col[k * 3 + 2] = tmp.b;
      }
      pos.set(chaos);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.085,
        vertexColors: true,
        transparent: true,
        opacity: 0.78,
        blending: THREE.NormalBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      const attr = geo.getAttribute("position");

      /* Theme is OBSERVED, never set — Nav owns `.dark` and the inline script
         in layout.tsx writes it first (HANDOFF §5.19). The reference is
         light-only; additive blending only ever brightens, so it is useless on
         a pale ground but is what makes the cloud glow on the dark one. */
      let isLight = !document.documentElement.classList.contains("dark");
      const applyTheme = () => {
        mat.blending = isLight
          ? THREE.NormalBlending
          : THREE.AdditiveBlending;
        mat.opacity = isLight ? 0.78 : 0.62;
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

      /* Pointer parallax, exactly the reference's interaction: the cloud tilts
         toward the cursor. Note the reference has NO cursor repulsion in this
         mode — an earlier pass here added one, and it is dropped to keep this
         a true duplicate. */
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

      /* The reference sizes to the track width and window height. Here the
         canvas fills the hero section, so it takes the hero's own box —
         `false` keeps three from writing inline CSS over the stylesheet. */
      const resize = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      let raf: number | null = null;
      let t0 = performance.now();

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const t = (now - t0) / 1000;

        ptr.x += (ptr.tx - ptr.x) * 0.05;
        ptr.y += (ptr.ty - ptr.y) * 0.05;

        for (let n = 0; n < N; n++) {
          const j = n * 3;
          /* Breathing. In the reference this decays as the lattice resolves;
             at progress 0 it runs at full amplitude. z is deliberately NOT
             scaled by it — that is the reference's behaviour, and it keeps the
             depth spread (and so the size spread) steady while xy pulses. */
          const b = 1 + Math.sin(t * 0.65 + n * 0.017) * 0.1;
          pos[j] = chaos[j] * b;
          pos[j + 1] = chaos[j + 1] * b;
          pos[j + 2] = chaos[j + 2];
        }
        attr.needsUpdate = true;

        points.rotation.y = t * 0.04 + ptr.x * 0.3;
        points.rotation.x = ptr.y * 0.18;

        renderer.render(scene, camera);
      };

      /* Paint one frame immediately so the fade-in has something to reveal. */
      renderer.render(scene, camera);
      requestAnimationFrame(() => stage.classList.add("ready"));

      let io: IntersectionObserver | null = null;
      if (!reduced) {
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
