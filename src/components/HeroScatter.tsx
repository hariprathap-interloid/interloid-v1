"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   HERO MARK — a scattered particle field that gathers into the Interloid logo
   and disperses again, on a loop.

   Scattered state: particles sit on a large shell (r = 8–16 world units, camera
   at z = 15) so the cloud fills the frame, and size attenuation turns near
   particles into big squares and far ones into specks.

   Flat-mark collapse (must never regress): the logo is flat (z = 0), and a
   rotated flat cloud collapses to a line at 90°. Rotation is therefore
   multiplied by (1 - k) and is exactly zero at k = 1, which also makes the
   held mark square-on and pointer-inert. Drift is accumulated incrementally
   and frozen during the gather; deriving it from elapsed time would unwind
   the field in a fast reverse spin.

   Clean converge: particles are paired with home points by angle (both sets
   sorted, matched rank-to-rank) and travel in polar space, so paths never
   cross. Far particles leave first so the mark completes together.

   Loading and teardown: `three` and the point data load inside the effect
   after idle, so they stay out of the initial bundle and first paint. Every
   listener, observer and GPU resource is released in cleanup (StrictMode runs
   the effect twice in dev).
   ========================================================================== */

/* Seconds. Retuning the rhythm is one line each. */
const SCATTER_HOLD = 4.0; /* k = 0 — pointer live */
const CONDENSE = 3.0;
const LOGO_HOLD = 3.5; /* k = 1 — mark still, pointer inert */
const DISPERSE = 2.5;
const CYCLE = SCATTER_HOLD + CONDENSE + LOGO_HOLD + DISPERSE;

/* Fraction of the gather spent staggering departures. */
const SPREAD = 0.3;

/* Scatter point size, in world units: the shell is a fixed size at every
   breakpoint. The mark's point size is derived from its on-screen lattice
   spacing instead (see buildLattice), so its grain holds at every width. */
const SIZE_SCATTER = 0.085;

/* The mark is an exact grid generated from the artwork. logo-points.json is
   built from interloid-logo.svg by scripts/build-logo-points.mjs
   (`npm run logo:points`; `:check` to verify): the artwork is divided into
   `grid` x `grid` cells, and each cell it covers by at least half gets one
   point at the cell centre, coloured by its ink, with its integer cell
   (gx, gy).

   Small marks keep every k-th row and column (an exact sub-grid, so rows stay
   true) and the surplus particles fade out as the mark forms. */
const MARK_SPACING_PX = 4.3; /* finest centre-to-centre gap worth drawing */
/* Square size as a fraction of the spacing, so its SQUARE is the ink coverage.
   0.88 leaves a hairline between neighbours: the grid still reads as squares,
   but the mark's edges and counters stay crisp rather than gappy. */
const MARK_DOT_RATIO = 0.88;

/* Vertical room on narrow screens: the transparent nav owns the first ~70px. */
const NAV_PX = 70;
const MARK_MARGIN_PX = 16;

/* Clear space between the end of the hero copy and the mark, on wide screens.
   Must exceed the scrim's fade-out past --copy-end (3rem in globals.css), or
   the mark's left edge sits under the tail of the veil. */
const COPY_GAP_PX = 56;

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

      /* The mark is optional: if the points cannot be fetched the field still
         renders and simply never gathers, rather than losing the hero. */
      let logo: {
        count: number;
        pos: number[];
        col?: number[];
        grid?: number;
        gx?: number[];
        gy?: number[];
      } | null = null;
      try {
        logo = await (await fetch("/logo-points.json")).json();
      } catch (e) {
        console.error("logo points unavailable; scatter runs alone", e);
      }
      if (cancelled) return;

      const hasLogo = !!logo && logo.count > 0;
      /* One particle per home point, so the mark lands complete with nothing
         left drifting. Without the data, use a fixed count. */
      const N = hasLogo ? logo!.count : 4200;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      /* Shortest signed angular delta, so nothing takes the long way round. */
      const sweep = (d: number) => {
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return d;
      };

      /* sRGB equivalents of --brand / --accent / --brand-light. */
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

      /* ------------------------------------------------------------------
         Geometry, in POLAR around the cloud's own centre.

         Positions are centre-relative and the object is moved, so rotation
         happens about the cloud's own axis; baking the offset into vertices
         would rotate about the world origin and swing the field sideways.

         The move is scaled by k: the scatter stays centred and full-bleed, and
         only the mark travels to its home beside the copy.
         ------------------------------------------------------------------ */
      const r0 = new Float32Array(N); /* scatter radius, world units */
      const th0 = new Float32Array(N); /* scatter angle */
      const z0 = new Float32Array(N); /* scatter depth */
      const homeXu = new Float32Array(N); /* paired home, UNIT space */
      const homeYu = new Float32Array(N);
      /* Which home each particle was paired with, so the mark's baked colour
         can be looked up by home index. */
      const homeIdx = new Uint32Array(N);
      const homeR = new Float32Array(N); /* snapped mark radius, UNIT space */
      const dTh = new Float32Array(N); /* shortest sweep to the home angle */
      /* 1 = this particle is one of the mark's lattice points. */
      const member = new Uint8Array(N);
      const delay = new Float32Array(N); /* departure stagger, 0..SPREAD */
      const phase = new Float32Array(N);
      const tone = new Float32Array(N); /* per-particle brightness in the field */

      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const colScatter = new Float32Array(N * 3);
      const colLogo = new Float32Array(N * 3);
      /* 1 = drawn. Surplus particles ride this to 0 as the mark forms. */
      const fade = new Float32Array(N).fill(1);

      const tmp = new THREE.Color();
      let rMin = Infinity;
      let rMax = 0;

      for (let i = 0; i < N; i++) {
        /* r far exceeds the camera distance, so the shell encloses the viewer
           — this is what makes the field full-bleed rather than an object
           sitting in frame. y flattened to .62 so it reads wide in a 16:9
           band. */
        const r = 8 + Math.random() * 8;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(ph) * Math.cos(th);
        const y = r * Math.sin(ph) * Math.sin(th) * 0.62;

        r0[i] = Math.hypot(x, y);
        th0[i] = Math.atan2(y, x);
        z0[i] = r * Math.cos(ph);
        phase[i] = Math.random() * Math.PI * 2;

        if (r0[i] < rMin) rMin = r0[i];
        if (r0[i] > rMax) rMax = r0[i];

        /* Colour is not decided here — see paintPalette. This is only the
           per-particle tone that keeps the field from looking flat. */
        tone[i] = 0.72 + Math.random() * 0.5;
      }

      /* Far particles depart first, so every path lands together instead of
         the mark trickling in from the outside. */
      const rSpan = rMax - rMin || 1;
      for (let i = 0; i < N; i++) {
        delay[i] = SPREAD * (1 - (r0[i] - rMin) / rSpan);
      }

      if (hasLogo) {
        const src = logo!.pos;
        const lth = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          lth[i] = Math.atan2(src[i * 2 + 1], src[i * 2]);
        }

        /* Non-crossing assignment: sort both sets by angle and pair them
           rank-to-rank. This preserves cyclic order, so no two travel paths
           cross. */
        const byScatter = Array.from({ length: N }, (_, i) => i).sort(
          (a, b) => th0[a] - th0[b],
        );
        const byLogo = Array.from({ length: N }, (_, i) => i).sort(
          (a, b) => lth[a] - lth[b],
        );

        for (let rank = 0; rank < N; rank++) {
          const p = byScatter[rank];
          const q = byLogo[rank];
          homeXu[p] = src[q * 2];
          homeYu[p] = src[q * 2 + 1];
          homeIdx[p] = q;
        }

        /* Fixed for the life of the page — home positions never move, and
           SCALE is applied at draw time. */
        for (let i = 0; i < N; i++) {
          homeR[i] = Math.hypot(homeXu[i], homeYu[i]);
          dTh[i] = sweep(Math.atan2(homeYu[i], homeXu[i]) - th0[i]);
        }

      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("aFade", new THREE.BufferAttribute(fade, 1));

      /* A minimal PointsMaterial equivalent with per-particle alpha, so
         surplus particles can fade out as the mark forms. Square points and
         the same `size * (height/2) / -z` attenuation.

         gl_PointSize is in device pixels, so devicePixelRatio is folded into
         uScale; otherwise points render at half size on high-DPI screens. */
      const uni = {
        uSize: { value: SIZE_SCATTER },
        uScale: { value: 450 },
        uOpacity: { value: 0.78 },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms: uni,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.NormalBlending,
        vertexShader: `
          attribute float aFade;
          varying vec3 vColor;
          varying float vFade;
          uniform float uSize, uScale;
          void main() {
            vColor = color;
            vFade = aFade;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * uScale / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          varying float vFade;
          uniform float uOpacity;
          void main() {
            if (vFade < 0.01) discard;
            gl_FragColor = vec4(vColor, uOpacity * vFade);
          }`,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      const aPos = geo.getAttribute("position");
      const aCol = geo.getAttribute("color");
      const aFade = geo.getAttribute("aFade");

      /* Theme is observed, never set: Nav and the inline script in layout.tsx
         own `.dark`. Additive blending only brightens, so it is used on the
         dark ground only. */
      const markRamp = { a: new THREE.Color(), b: new THREE.Color() };
      const hsl = { h: 0, s: 0, l: 0 };
      const WHITE = new THREE.Color(1, 1, 1);
      const AZURE_H = 0.55; /* hue the dark palette is pulled toward */
      /* Balances blue/cyan luminance on dark without squeezing the blue end
         to azure. Tuned together with the 0.36 luminance floor below. */
      const AZURE_MIX = 0.6;
      const baked = logo?.col;

      /* One palette for both states: each particle carries the colour of its
         paired home point, so the logo's colours assemble rather than appear.
         In the field, `tone` varies brightness so it does not read flat. */
      const writeColour = (i: number) => {
        colLogo[i * 3] = tmp.r;
        colLogo[i * 3 + 1] = tmp.g;
        colLogo[i * 3 + 2] = tmp.b;
        const t = tone[i];
        colScatter[i * 3] = Math.min(1, tmp.r * t);
        colScatter[i * 3 + 1] = Math.min(1, tmp.g * t);
        colScatter[i * 3 + 2] = Math.min(1, tmp.b * t);
      };

      const paintPalette = () => {
        if (!hasLogo) {
          /* No mark: a --brand/--accent mix. */
          for (let i = 0; i < N; i++) {
            tmp
              .copy(C.brand)
              .lerp(i % 3 === 0 ? C.accent : C.light, (tone[i] - 0.72) / 0.5);
            writeColour(i);
          }
          return;
        }
        if (baked) {
          /* Colour sampled per point from the artwork. Hue is kept (it carries
             the logo's blue-to-cyan gradient); saturation gets a floor so the
             artwork's glossy bevel does not read as grey chips.

             Brightness is normalised by perceived luminance, not HSL
             lightness, because blue carries ~7% of luma against cyan's ~78%:
             capped on light, floored on dark. Lifting mixes toward white;
             scaling would clip a blue's one strong channel and shift its hue. */
          const lumMax = isLight ? 0.42 : 1;
          const lumMin = isLight ? 0 : 0.36;
          for (let i = 0; i < N; i++) {
            const q = homeIdx[i] * 3;
            tmp.setRGB(
              baked[q] / 255,
              baked[q + 1] / 255,
              baked[q + 2] / 255,
              THREE.SRGBColorSpace,
            );
            tmp.getHSL(hsl, THREE.SRGBColorSpace);
            /* On dark, pull hues toward azure: deep indigo cannot carry light,
               and lifting it toward white turns it lavender. The lerp is
               uniform, so the gradient's order survives. */
            const h = isLight ? hsl.h : hsl.h + (AZURE_H - hsl.h) * AZURE_MIX;
            tmp.setHSL(h, Math.max(hsl.s, 0.72), hsl.l, THREE.SRGBColorSpace);
            /* tmp is linear here, which is the space luma is defined in. */
            const lum = 0.2126 * tmp.r + 0.7152 * tmp.g + 0.0722 * tmp.b;
            if (lum > lumMax) tmp.multiplyScalar(lumMax / lum);
            else if (lum < lumMin) tmp.lerp(WHITE, (lumMin - lum) / (1 - lum));
            writeColour(i);
          }
          return;
        }
        /* Fallback if the artwork colours are missing from the points file. */
        markRamp.a.set(isLight ? "#1b3ee8" : "#3060ff");
        markRamp.b.set(isLight ? "#1cabd8" : "#35e4ff");
        for (let i = 0; i < N; i++) {
          const t = clamp((homeXu[i] - homeYu[i] + 2) / 4);
          tmp.copy(markRamp.a).lerp(markRamp.b, t);
          writeColour(i);
        }
      };

      let isLight = !document.documentElement.classList.contains("dark");
      /* Declared before applyTheme because applyTheme runs immediately and
         writes them; leaving them below would be a temporal dead zone. */
      let opScatter = 0.78;
      let opLogo = 0.95;
      let lastK = -1;
      const applyTheme = () => {
        mat.blending = isLight
          ? THREE.NormalBlending
          : THREE.AdditiveBlending;
        mat.needsUpdate = true;
        /* Opacity, like size, differs between the sparse field and the dense
           mark; it is cross-faded with k. */
        opScatter = isLight ? 0.78 : 0.62;
        opLogo = isLight ? 1 : 0.95;
        paintPalette(); /* both palettes are theme-dependent */
        col.set(colScatter);
        aCol.needsUpdate = true;
        lastK = -1; /* force the frame loop to re-derive colour, size, opacity */
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

      /* Pointer parallax. Its whole contribution is scaled by (1 - k) in the
         frame loop, so it fades out as the mark forms and is exactly zero
         while the mark is held.

         Relative, not absolute: mapping the cursor position directly makes any
         discontinuity (cursor parked off-centre on load, re-entering elsewhere,
         jumping across monitors) swing the whole field. The target instead
         accumulates movement: the first event only seeds the reference point,
         and each event moves the target by at most STEP. */
      const STEP = 0.12;
      const ptr = { x: 0, y: 0, tx: 0, ty: 0, lx: 0, ly: 0, seen: false };
      const step = (d: number) => (d > STEP ? STEP : d < -STEP ? -STEP : d);
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        if (ptr.seen) {
          ptr.tx = clamp(ptr.tx + step(nx - ptr.lx), -1, 1);
          ptr.ty = clamp(ptr.ty + step(ny - ptr.ly), -1, 1);
        } else {
          ptr.seen = true; /* seed only — the cursor's arrival moves nothing */
        }
        ptr.lx = nx;
        ptr.ly = ny;
      };
      const onLeave = () => {
        ptr.tx = 0;
        ptr.ty = 0;
        ptr.seen = false; /* re-seed on return, wherever it comes back */
      };
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);

      /* ------------------------------------------------------------------
         Layout
         ------------------------------------------------------------------ */
      let SCALE = 4;
      let HOME_X = 4.6;
      let HOME_Y = 0;
      let sizeLogo = 0.17;
      let markCount = N;
      const FRAME = { w: 14, h: 14 };

      /* Inverse of three's point sizing (`gl_PointSize = size * (height/2) / -z`)
         at the mark plane, so a floor can be expressed in pixels instead of
         hardcoding a magic world constant. */
      const pxToWorld = (px: number, h: number) =>
        (px * 2 * camera.position.z) / h;

      /* The source is an exact grid, so choosing what to draw is choosing
         every k-th row and column. k = 1 draws every point (desktop); on small
         marks k grows until neighbours sit MARK_SPACING_PX apart. Because k is
         an integer multiple of the source cell, the survivors still fall in
         perfect rows.

         Runs on resize only. The angle pairing is untouched: homes never move,
         only which of them are drawn. */
      const GRID = logo?.grid ?? 72;
      const gridX = logo?.gx;
      const gridY = logo?.gy;
      const onSubGrid = (g: number, k: number, off: number) =>
        (((g - off) % k) + k) % k === 0;
      const buildLattice = (h: number) => {
        if (!hasLogo) return;
        const markWidthPx = 2 * SCALE * (h / FRAME.h);
        const stepPx = markWidthPx / GRID; /* one source cell, on screen */
        const k = Math.max(1, Math.ceil(MARK_SPACING_PX / stepPx));
        /* Centre the sub-grid on the mark so thinning trims evenly, instead of
           always shaving the same edge. */
        const off = Math.floor(GRID / 2) % k;
        markCount = 0;
        for (let i = 0; i < N; i++) {
          const q = homeIdx[i];
          const keep =
            k === 1 || !gridX || !gridY
              ? 1
              : onSubGrid(gridX[q], k, off) && onSubGrid(gridY[q], k, off)
                ? 1
                : 0;
          member[i] = keep;
          markCount += keep;
        }
        sizeLogo = pxToWorld(stepPx * k * MARK_DOT_RATIO, h);
        lastK = -1; /* size and fades depend on this, so re-derive next frame */
      };

      /* Where the hero's words actually END, in hero-local px. Measured from
         the TEXT, not the boxes: the h1 and paragraphs are block boxes as wide
         as their column, so their boxes run well past the last glyph. A Range
         over each one's contents gives the tight extent of the rendered lines;
         the badge and CTA row are shrink-wrapped, so their children's boxes are
         already tight. */
      const copyRange = document.createRange();
      const copyEnd = (): number | null => {
        const col = hero.querySelector("h1")?.parentElement;
        if (!col) return null;
        let right = 0;
        for (const el of Array.from(col.children)) {
          if (el.matches("h1, p")) {
            copyRange.selectNodeContents(el);
            right = Math.max(right, copyRange.getBoundingClientRect().right);
          } else {
            for (const c of Array.from(el.children)) {
              right = Math.max(right, c.getBoundingClientRect().right);
            }
          }
        }
        return right > 0 ? right - hero.getBoundingClientRect().left : null;
      };

      const resize = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        FRAME.h =
          2 *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          camera.position.z;
        FRAME.w = FRAME.h * camera.aspect;

        uni.uScale.value = h * 0.5 * Math.min(devicePixelRatio, 2);

        if (w >= 900) {
          /* Wide: the mark fills the space right of the words. The copy's
             right edge is measured from the DOM, never assumed, and published
             as --copy-end so the scrim's ramp ends exactly where the words do. */
          const pxPerWorld = h / FRAME.h;
          const end = copyEnd() ?? w * 0.52;
          hero.style.setProperty("--copy-end", `${Math.round(end)}px`);
          const edge = parseFloat(getComputedStyle(hero).paddingRight) || 64;
          const left = end + COPY_GAP_PX;
          const right = w - edge;
          /* Vertically, keep the mark inside the first screen. On short windows
             the section can be taller than the viewport, so centre in the band
             between the nav clearance and just above the fold, or the section
             middle, whichever is higher. `min` keeps the handover continuous. */
          const bandTop = parseFloat(getComputedStyle(hero).paddingTop) || 96;
          const bandBottom = Math.min(h, window.innerHeight) - 24;
          const centreY = Math.min(h / 2, (bandTop + bandBottom) / 2);
          /* Capped at 0.68 of the section height so wide screens do not balloon
             it, and to the visible band so the fold never clips it. */
          const diameterPx = Math.max(
            0,
            Math.min(right - left, h * 0.68, bandBottom - bandTop),
          );
          SCALE = diameterPx / 2 / pxPerWorld;
          HOME_X = ((left + right) / 2 - w / 2) / pxPerWorld;
          HOME_Y = (h / 2 - centreY) / pxPerWorld;
          buildLattice(h);
          return;
        }

        /* Narrow: `h` is the section height, not the screen, since the copy
           overflows the viewport on mobile. Work in pixels against the band
           the CSS reserves (read from the DOM so they cannot drift apart), and
           fit the mark between the nav and the copy with margins. */
        const band = parseFloat(getComputedStyle(hero).paddingTop) || h * 0.36;
        const pxPerWorld = h / FRAME.h;
        const room = band - NAV_PX - MARK_MARGIN_PX * 2;
        const diameterPx = Math.max(64, Math.min(room, w * 0.62));
        SCALE = diameterPx / 2 / pxPerWorld;
        HOME_X = 0;
        const centrePx = NAV_PX + MARK_MARGIN_PX + diameterPx / 2;
        HOME_Y = ((h / 2 - centrePx) / h) * FRAME.h;
        buildLattice(h);
      };
      resize();
      window.addEventListener("resize", resize);
      /* The copy's width depends on the webfont. Re-measure once it has swapped
         in, or the mark and the scrim are placed off the fallback face. */
      document.fonts.ready.then(() => {
        if (!cancelled) resize();
      });

      /* Linear 0..1 across the cycle: 0 scattered, 1 mark held. */
      const cyclePos = (t: number) => {
        if (!hasLogo) return 0;
        const c = t % CYCLE;
        if (c < SCATTER_HOLD) return 0;
        if (c < SCATTER_HOLD + CONDENSE) return (c - SCATTER_HOLD) / CONDENSE;
        if (c < SCATTER_HOLD + CONDENSE + LOGO_HOLD) return 1;
        return 1 - (c - SCATTER_HOLD - CONDENSE - LOGO_HOLD) / DISPERSE;
      };

      /* Writes one frame of geometry. `prog` is the linear cycle position;
         `t` drives breathing only. */
      const writeFrame = (prog: number, t: number) => {
        const k = ease(clamp(prog));
        const settle = 1 - k;
        const stagger = 1 - SPREAD;

        for (let i = 0; i < N; i++) {
          const kp = ease(clamp((prog - delay[i]) / stagger));
          const th = th0[i] + dTh[i] * kp;
          /* Breathing decays to nothing as the mark forms — a resolved mark is
             perfectly still. Applied radially so it reads as the field
             pulsing, not as a scale wobble. */
          const b = 1 + Math.sin(t * 0.65 + phase[i]) * 0.1 * settle;
          const r = (r0[i] + (homeR[i] * SCALE - r0[i]) * kp) * b;

          const j = i * 3;
          pos[j] = Math.cos(th) * r;
          pos[j + 1] = Math.sin(th) * r;
          pos[j + 2] = z0[i] * (1 - kp);
        }
        aPos.needsUpdate = true;
        return k;
      };

      let raf: number | null = null;
      let t0 = performance.now();
      let last = t0;
      let spin = 0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const t = (now - t0) / 1000;
        const dt = Math.min((now - last) / 1000, 0.05); /* tab-switch guard */
        last = now;

        const k = writeFrame(cyclePos(t), t);
        const settle = 1 - k;

        /* Colours cross-fade with k; skipped entirely during the two holds,
           where k does not move. */
        if (k !== lastK) {
          for (let n = 0; n < N * 3; n++) {
            col[n] = colScatter[n] + (colLogo[n] - colScatter[n]) * k;
          }
          aCol.needsUpdate = true;
          uni.uSize.value = SIZE_SCATTER + (sizeLogo - SIZE_SCATTER) * k;
          uni.uOpacity.value = opScatter + (opLogo - opScatter) * k;
          /* Surplus particles ride out to nothing exactly as the mark lands,
             so the field keeps its density and the mark keeps its grain. */
          if (markCount < N) {
            for (let i = 0; i < N; i++) fade[i] = member[i] ? 1 : 1 - k;
            aFade.needsUpdate = true;
          }
          lastK = k;
        }

        ptr.x += (ptr.tx - ptr.x) * 0.05;
        ptr.y += (ptr.ty - ptr.y) * 0.05;

        /* Drift accrues only while fully scattered, and wraps there — at k = 0
           rotation.y IS spin, so a wrap from +π to -π is the same orientation
           and invisible. Freezing it through the gather keeps the unwind to at
           most half a turn however long the page has been open. */
        if (k < 1e-4) {
          spin += dt * 0.04;
          if (spin > Math.PI) spin -= Math.PI * 2;
          else if (spin < -Math.PI) spin += Math.PI * 2;
        }

        /* Exactly zero at k = 1. See the flat-mark note at the top. */
        points.rotation.y = (spin + ptr.x * 0.3) * settle;
        points.rotation.x = ptr.y * 0.18 * settle;
        /* Centred while scattered (full-bleed), at the mark's home once
           gathered. */
        points.position.set(HOME_X * k, HOME_Y * k, 0);

        renderer.render(scene, camera);
      };

      /* Paint one frame immediately so the fade-in has something to reveal. */
      points.position.set(0, 0, 0); /* k = 0: the field is centred */
      writeFrame(0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(() => stage.classList.add("ready"));

      let io: IntersectionObserver | null = null;
      if (reduced) {
        /* Reduced motion: render the resolved, still mark once. */
        writeFrame(hasLogo ? 1 : 0, 0);
        if (hasLogo) {
          col.set(colLogo);
          aCol.needsUpdate = true;
          uni.uSize.value = sizeLogo;
          uni.uOpacity.value = opLogo;
          if (markCount < N) {
            for (let i = 0; i < N; i++) fade[i] = member[i] ? 1 : 0;
            aFade.needsUpdate = true;
          }
        }
        points.rotation.set(0, 0, 0);
        points.position.set(hasLogo ? HOME_X : 0, hasLogo ? HOME_Y : 0, 0);
        renderer.render(scene, camera);
      } else {
        /* Render only while on screen. */
        io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting && raf === null) {
              t0 = performance.now();
              last = t0;
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
        hero.style.removeProperty("--copy-end");
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
