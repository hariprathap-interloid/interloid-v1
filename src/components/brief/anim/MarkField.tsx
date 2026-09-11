"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   MarkField — the Interloid mark, assembling as the story is told.
   ==========================================================================
   The same 3898-point lattice HeroScatter draws (logo-points.json, generated
   from interloid-logo.svg), starting as a loose cloud. Each point has a GATE
   between 0 and 1 and flies home once `progress` passes it — so the mark
   fills in as a clockwise sweep, one arc per answered blank, and is whole
   when the story is sent.

   ── ORDER, NOT NOISE ─────────────────────────────────────────────────────
   Gates are ranked by each point's ANGLE around the mark (twelve o'clock,
   clockwise, lightly jittered), so a new answer lands as a coherent wedge
   rather than a random sprinkle that reads as nothing happening.

   ── THE FLAT-MARK RULE (HeroScatter §THE FLAT-MARK COLLAPSE) ─────────────
   The mark is flat (z = 0). Any rotation is multiplied by how SCATTERED the
   field still is and capped near ±30°, so the forming mark can never swing
   edge-on and collapse to a line, and the finished mark sits square.

   ── ui-ux-pro-max's THREE.JS RULES, AND WHERE ────────────────────────────
     one renderer, pixel ratio capped at 2 ........ setPixelRatio(min(dpr, 2))
     Points + BufferGeometry, well under 50k ...... 3898 points, one draw
     THREE.Clock, getDelta() once per frame ....... `frame`
     reduced motion as a LIVE listener ............ `mq`
     pause offscreen / hidden tab ................. IntersectionObserver +
                                                   visibilitychange
     dispose geometry, material, renderer ......... `cleanup`

   LOADING follows HeroScatter: `three` and the point data are fetched inside
   the effect, so they code-split out and load only where this is used.
   Without WebGL the still logo underneath shows; the stage marks itself
   `data-ready` on first paint to hide it. */

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/* Rate a point settles at, per second, and how much that varies between
   points — the variation is what makes a wedge land as a flock, not a slab. */
const SPEED = 3.2;
const STAGGER = 0.9;
/* Half-size of the mark in world units, against a camera at z = 7 — the
   mark fills ~70% of the panel's height. It was 1.55 (~64%); on the
   thank-you that left the 72-row lattice too few pixels per row to read as
   a dotted logo rather than moiré. */
const MARK = 1.85;

export default function MarkField({ progress, done }: { progress: number; done: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* Read every frame; written after render so the scene never restarts. */
  const target = useRef({ progress, done });
  useEffect(() => {
    target.current = { progress, done };
  }, [progress, done]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !webglOK()) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const THREE = await import("three");
      let logo: { count: number; pos: number[]; col: number[] } | null = null;
      try {
        logo = await (await fetch("/logo-points.json")).json();
      } catch {
        return; /* the still logo stays */
      }
      if (cancelled || !logo || !logo.count) return;
      const { count: N, pos: src, col: rgb } = logo;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 7;
      const group = new THREE.Group();
      scene.add(group);

      const home = new Float32Array(N * 3);
      const scat = new Float32Array(N * 3);
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const ink = new Float32Array(N * 3); /* the logo's own colour, 0..1 */
      const aK = new Float32Array(N); /* 0 scattered … 1 home */
      const gate = new Float32Array(N);
      const speed = new Float32Array(N);
      const phase = new Float32Array(N);
      const dim = new THREE.Color("#6f83a8");

      /* Clockwise from twelve o'clock, lightly jittered so the sweep's edge
         is soft rather than a ruled line. */
      Array.from({ length: N }, (_, i) => {
        let a = Math.atan2(src[i * 2], src[i * 2 + 1]);
        if (a < 0) a += Math.PI * 2;
        return { i, a: a / (Math.PI * 2) + (Math.random() - 0.5) * 0.06 };
      })
        .sort((p, q) => p.a - q.a)
        .forEach((o, rank) => {
          gate[o.i] = (rank + 1) / N;
        });

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        home[i3] = src[i * 2] * MARK;
        home[i3 + 1] = src[i * 2 + 1] * MARK;
        const r = 2.4 + Math.random() * 2.4;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        scat[i3] = r * Math.sin(ph) * Math.cos(th) * 1.2;
        scat[i3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.85;
        scat[i3 + 2] = r * Math.cos(ph) * 0.9 - 0.4;
        ink[i3] = rgb[i3] / 255;
        ink[i3 + 1] = rgb[i3 + 1] / 255;
        ink[i3 + 2] = rgb[i3 + 2] / 255;
        phase[i] = Math.random() * Math.PI * 2;
        speed[i] = SPEED * (1 - STAGGER / 2 + Math.random() * STAGGER);
      }
      pos.set(scat);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("aK", new THREE.BufferAttribute(aK, 1));
      const uni = { uScale: { value: 900 }, uScatter: { value: 0.07 }, uHome: { value: 0.045 } };
      /* Round, soft-edged points with ADDITIVE blending on the dark stage,
         which is what makes the finished mark glow. Size and opacity both
         follow aK, so a point visibly "arrives". */
      const mat = new THREE.ShaderMaterial({
        uniforms: uni,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float aK;
          varying vec3 vColor;
          varying float vK;
          uniform float uScale, uScatter, uHome;
          void main() {
            vColor = color;
            vK = aK;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = mix(uScatter, uHome, aK) * uScale / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          varying float vK;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            float soft = smoothstep(0.5, 0.12, r);
            gl_FragColor = vec4(vColor, soft * mix(0.42, 0.95, vK));
          }`,
      });
      const points = new THREE.Points(geo, mat);
      group.add(points);
      const attrPos = geo.getAttribute("position");
      const attrCol = geo.getAttribute("color");
      const attrK = geo.getAttribute("aK");

      const resize = () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        /* Point size tracks the canvas's real pixel height, so the grain is
           the same on a phone and a desktop. */
        uni.uScale.value = h * renderer.getPixelRatio() * 0.9;
        group.scale.setScalar(Math.min(1, camera.aspect));
      };
      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      resize();

      /* Reduced motion, LIVE: flipping the OS setting mid-visit takes effect
         on the next frame. Under it points jump home and nothing drifts. */
      const mq = matchMedia("(prefers-reduced-motion: reduce)");
      let still = mq.matches;
      const onMq = (e: MediaQueryListEvent) => {
        still = e.matches;
      };
      mq.addEventListener("change", onMq);

      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        const b = stage.getBoundingClientRect();
        pointer.x = ((e.clientX - b.left) / b.width - 0.5) * 2;
        pointer.y = ((e.clientY - b.top) / b.height - 0.5) * 2;
      };
      stage.addEventListener("pointermove", onPointer);

      const clock = new THREE.Clock();
      let visible = true;
      let raf = 0;
      let t = 0;

      const frame = () => {
        raf = 0;
        const dt = Math.min(clock.getDelta(), 0.05); /* once per frame */
        t += dt;
        const { progress: p0, done: sent } = target.current;
        const p = sent ? 1 : Math.max(0, Math.min(1, p0));

        let sum = 0;
        for (let i = 0; i < N; i++) {
          const goal = p >= gate[i] ? 1 : 0;
          const k = still ? goal : aK[i] + (goal - aK[i]) * (1 - Math.exp(-dt * speed[i]));
          aK[i] = k;
          sum += k;
          const e = k * k * (3 - 2 * k);
          const wob = still ? 0 : (1 - e) * 0.18;
          const i3 = i * 3;
          const sx = scat[i3] + Math.sin(t * 0.35 + phase[i]) * wob;
          const sy = scat[i3 + 1] + Math.cos(t * 0.3 + phase[i] * 1.3) * wob;
          const sz = scat[i3 + 2];
          pos[i3] = sx + (home[i3] - sx) * e;
          pos[i3 + 1] = sy + (home[i3 + 1] - sy) * e;
          pos[i3 + 2] = sz + (home[i3 + 2] - sz) * e;
          col[i3] = dim.r + (ink[i3] - dim.r) * e;
          col[i3 + 1] = dim.g + (ink[i3 + 1] - dim.g) * e;
          col[i3 + 2] = dim.b + (ink[i3 + 2] - dim.b) * e;
        }

        /* The flat-mark rule: rotation scales with how scattered the field
           still is, and is zero once the mark is whole. */
        const free = still ? 0 : 1 - sum / N;
        const ease = Math.min(1, dt * 2);
        group.rotation.y += ((pointer.x * 0.25 + Math.sin(t * 0.2) * 0.3) * free - group.rotation.y) * ease;
        group.rotation.x += (-pointer.y * 0.18 * free - group.rotation.x) * ease;

        attrPos.needsUpdate = true;
        attrCol.needsUpdate = true;
        attrK.needsUpdate = true;
        renderer.render(scene, camera);
        stage.dataset.ready = "1";
        if (visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const kick = () => {
        if (raf || !visible || document.hidden) return;
        clock.getDelta(); /* drop the time spent paused */
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

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        stage.removeEventListener("pointermove", onPointer);
        mq.removeEventListener("change", onMq);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        delete stage.dataset.ready;
      };
    };

    start();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={stageRef} className="group relative size-full">
      {/* The still mark: what shows without WebGL and before the first frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-[18%] bg-[url(/interloid-logo.svg)] bg-contain bg-center bg-no-repeat opacity-50 transition-opacity duration-700 group-data-[ready=1]:opacity-0"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
    </div>
  );
}
