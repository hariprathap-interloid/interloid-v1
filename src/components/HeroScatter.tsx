"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   HERO MARK — a scattered field that gathers into the Interloid logo and
   disperses again, on a loop. Owns both states.

   The scattered state is a faithful port of hero-order.js at progress 0:
   particles sit on a HUGE shell (r = 8–16 world units against a camera at
   z = 15) so the cloud swallows the whole frame, and with sizeAttenuation the
   few particles near the camera draw as big squares while the far ones fall to
   single specks. That size spread across a full-bleed sparse field IS the look
   — it cannot be reached by resizing a compact cloud. The constants lifted
   from the reference (r, the .62 y-flatten, size .085, opacity .78, the .04
   drift, the .1 breathing) are a spec: changing one changes the match.

   ---------------------------------------------------------------------------
   THE FLAT-MARK COLLAPSE — the one thing that must never regress.

   The logo is FLAT: every home point sits at z = 0. Rotate a flat cloud and it
   collapses to a LINE every time it passes 90°, which is what "the cloud goes
   horizontal" was. This is HeroStage §5.15, and it survived review there three
   times because the first cycle looks fine.

   So rotation is multiplied by (1 - k) and reaches EXACTLY zero at k = 1. That
   single factor does three jobs: it kills the collapse, it makes the mark
   square-on and legible, and it makes the mark mouse-inert — pointer input is
   live only while the field is scattered, which is the required behaviour.

   Note this differs from hero-order.js on purpose. The reference damps its
   drift to 30% (`t*.04*(1-k*.7)`), never to zero. On its lattice that is fine;
   on a flat mark it is the bug.

   The drift is also accumulated INCREMENTALLY and frozen once the gather
   starts. Writing `rotation.y = t * .04 * (1 - k)` instead would wind the whole
   field back to zero from wherever elapsed time had taken it — a fast reverse
   spin that gets worse the longer the page has been open.
   ---------------------------------------------------------------------------

   CLEAN CONVERGE, NOT CHAOS. Crossing travel paths are the main reason an
   assembly reads as noise. Particles are matched to home points by ANGLE
   (both sets sorted, paired rank-to-rank) and then travel in POLAR space, so
   every path is a smooth arc and no two cross. Far particles leave first so
   the mark completes together instead of trickling in.

   POINTSMATERIAL, DELIBERATELY. It draws SQUARES, which is what the reference
   shows and what was asked for. HeroStage §5.16 avoids it for the mark alone;
   here the same material has to serve a noise field and a legible mark, which
   is why `size` is animated with k — one world-space size cannot do both.

   LOADING and TEARDOWN follow HeroStage: `three` and the point data are
   fetched inside the effect behind requestIdleCallback so they code-split out
   of the initial bundle and cannot touch first paint (HANDOFF §8, FCP 364ms),
   and every listener, observer and GPU resource is collected for cleanup
   because React StrictMode runs this effect twice in dev.
   ========================================================================== */

/* Seconds. Retuning the rhythm is one line each. */
const SCATTER_HOLD = 4.0; /* k = 0 — pointer live */
const CONDENSE = 3.0;
const LOGO_HOLD = 3.5; /* k = 1 — mark still, pointer inert */
const DISPERSE = 2.5;
const CYCLE = SCATTER_HOLD + CONDENSE + LOGO_HOLD + DISPERSE;

/* Fraction of the gather spent staggering departures. */
const SPREAD = 0.3;

/* Point size at each end of the cycle.

   SCATTER is an absolute world size, and correctly so: the field's shell is a
   fixed 8-16 world units at every breakpoint, so its grain does not vary.

   The MARK is different — it is sized from SCALE, which shrinks hard on narrow
   viewports. A fixed world size there made the points overlap into one solid
   filled shape on mobile, losing the particle character entirely. So the mark's
   size is a FRACTION of SCALE, which holds the same grain at every width. */
const SIZE_SCATTER = 0.085;

/* THE MARK IS AN EXACT GRID, GENERATED FROM THE ARTWORK.

   logo-points.json is built from interloid-logo.svg by
   scripts/build-logo-points.mjs (`npm run logo:points`; `:check` to verify) as a
   perfect lattice: the
   artwork is divided into `grid` x `grid` cells, and every cell it covers by at
   least half gets one point at that cell's exact centre, coloured by the ink
   inside it. Each point also carries its integer cell (gx, gy).

   Two earlier versions of that file were each wrong in a way that showed on
   screen: a JITTERED sampling (nearest-neighbour spacing wandering .023-.029)
   whose squares would never sit in true rows however it was re-quantised; and
   a fringe of ~4% of points lying just OUTSIDE the silhouette, which read as
   stray squares off the rim. Generating the grid from the artwork removes both
   by construction rather than by filtering.

   The field and the mark still need different POINT COUNTS: ~3900 points is a
   legible dotted logo across a 611px desktop mark, but only ~2px apart on a
   phone. So small marks keep every k-th row and column — an exact sub-grid,
   never a sample — and the surplus FADES OUT as the mark forms, which is what
   the per-particle alpha attribute is for. */
const MARK_SPACING_PX = 4.3; /* finest centre-to-centre gap worth drawing */
/* Square size as a fraction of the spacing, so its SQUARE is the ink coverage.
   0.88 leaves a hairline between neighbours: the grid still reads as squares,
   but the mark's edges and counters stay crisp rather than gappy. */
const MARK_DOT_RATIO = 0.88;

/* Vertical room on narrow screens. The nav is transparent at rest and owns the
   first ~70px; without accounting for it the mark rode up under the wordmark
   and left ~9px to the badge at 320px wide. */
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
         left drifting. Without the data, fall back to the reference count. */
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

         Positions are centre-relative and the object is MOVED, rather than an
         offset being baked into every vertex. That way rotation happens about
         the cloud's own axis; baking the offset in (as hero-order.js does)
         rotates it about the world origin instead, which swings the whole
         field sideways across the screen.

         The move is scaled by k, so the SCATTER sits centred on the viewport
         and covers the full page, and only the MARK travels to its home beside
         the copy. Parking the field at the mark's home instead left the left
         third of the page noticeably thin.
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

        /* NON-CROSSING ASSIGNMENT. Sort both sets by angle and pair them
           rank-to-rank. Rank matching is monotonic in angle, so it preserves
           cyclic order — which is precisely the condition for no two travel
           paths to cross. This is the difference between a converge that reads
           as deliberate and one that reads as noise. */
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

      /* A hand-written stand-in for PointsMaterial, because PointsMaterial has
         no per-particle alpha and the surplus particles must fade out as the
         mark forms. Everything else is deliberately identical to it: SQUARE
         points (no circular mask) and the same `size * (height/2) / -z`
         attenuation, so the approved scatter is pixel-for-pixel unchanged.

         The one correction is uDpr. gl_PointSize is in DEVICE pixels and
         PointsMaterial does not account for that (HeroStage §5.17), so on a
         retina phone it renders every point at half the intended CSS size.
         Folding dpr into uScale keeps the grain honest on real devices. */
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

      /* Theme is OBSERVED, never set — Nav owns `.dark` and the inline script
         in layout.tsx writes it first (HANDOFF §5.19). Additive blending only
         ever brightens, so it is useless on a pale ground but is what makes
         the cloud glow on the dark one. */
      /* THE MARK'S OWN COLOURS, taken from interloid-logo.svg rather than from
         the muted --brand/--accent pair the FIELD uses. Rasterising the logo
         and reading its histogram gives a vivid diagonal gradient — deep blue
         (#0033ff–#1166ff) into bright cyan (#11eeff–#22eeff), running
         top-left to bottom-right — and the old #1f5da0 -> #289dbe ramp across
         x alone was both far duller and running the wrong way.

         The cyan end is pulled back on LIGHT only. The logo's true #22eeff is
         near-white in value, so on the pale hero it disappears; globals.css
         already notes #289dbe is only 3.15:1 there. Dark keeps the full
         vividness, where additive blending makes it glow. */
      const markRamp = { a: new THREE.Color(), b: new THREE.Color() };
      const hsl = { h: 0, s: 0, l: 0 };
      const WHITE = new THREE.Color(1, 1, 1);
      const AZURE_H = 0.55; /* hue the dark palette is pulled toward */
      /* 0.45 (with a 0.30 floor) left the blue half at 0.69 of the cyan half's
         luminance; 0.6 with the 0.36 floor below reaches 0.83 while chroma
         stays 0.86 — simulated over the baked palette before choosing. 0.7
         balances about as well but squeezes the blue end to azure. */
      const AZURE_MIX = 0.6;
      const baked = logo?.col;

      /* ONE PALETTE FOR BOTH STATES.

         The field used to carry its own muted --brand mix, which read as a
         single flat blue next to the mark's vivid blue-to-cyan. Now every
         particle carries the colour of the home it is paired with, from the
         moment it appears: the logo's colours are present in the scatter and
         simply assemble, rather than appearing out of nowhere at the end.

         The field varies each particle's brightness by `tone` so it still has
         depth and does not read as a flat wash. */
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
          /* No mark: the field keeps the original --brand mix. */
          for (let i = 0; i < N; i++) {
            tmp
              .copy(C.brand)
              .lerp(i % 3 === 0 ? C.accent : C.light, (tone[i] - 0.72) / 0.5);
            writeColour(i);
          }
          return;
        }
        if (baked) {
          /* Sampled per point from the artwork, so the mark carries the logo's
             own gradient exactly — including which way it runs. Guessing the
             axis by hand got it backwards and never reached cyan at all.
             Dimmed on LIGHT: the artwork is drawn for a white ground, and its
             brightest cyan is near-white in value, so it needs taking down to
             hold against the pale hero. Multiplying keeps the hue. */
          /* HUE IS THE SIGNAL; lightness gets normalised.

             Sampling the artwork verbatim also samples its glossy bevel — a
             highlight running the rim that reaches luminance ~197 against a
             median of 74. As a smooth gradient in the logo that reads as
             shine; chopped into separate squares it reads as scattered pale
             grey chips along the mark's edge, which is what showed up on the
             left side.

             So each point keeps the hue it sampled (that is what carries the
             logo's blue-to-cyan run) while saturation gets a floor and
             lightness a band. Nothing can wash out, nothing can blow out. */
          /* Normalised by PERCEIVED LUMINANCE, not by HSL lightness.

             Lightness is the wrong yardstick here because blue carries only
             7% of luma against cyan's 78%: at a fixed HSL lightness the cyan
             end is bright and the blue end is nearly black. On the dark hero
             that made half the mark disappear — the cyan side read fine while
             the blue side sank into the background. The same flaw washed the
             cyan out on light.

             So each point keeps its hue and gets pushed to a luminance that
             actually reads against THIS theme's background: capped on light
             (bg luminance ~0.88), floored on dark (~0.005). Lifting is done by
             mixing toward white rather than by scaling, because scaling a blue
             just clips its one strong channel and shifts the hue. */
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
            /* On DARK, compress the hue range toward azure. Deep indigo simply
               cannot carry light — it is 7% of luma — so on a near-black ground
               the blue half sank while the cyan half shone. Lifting it by
               mixing toward white instead turns it pale lavender and loses the
               logo. Moving the hue a little toward cyan keeps it saturated and
               unmistakably blue while giving it something to shine with. The
               lerp is uniform, so the gradient's direction and order survive;
               the whole run just starts brighter. */
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
        /* Opacity, like size, cannot serve both states from one value: 0.78 is
           right for a sparse field but leaves the dense mark looking washed
           out against the pale ground. Cross-faded with k alongside size. */
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

         RELATIVE, NOT ABSOLUTE — this is what stops the lurching.

         Mapping the cursor's absolute position straight onto the target means
         any DISCONTINUITY in that position swings the whole field. Three ways
         that happened, all reported:
           · page loads with the cursor already parked off-centre, so the first
             1px nudge told the field to swing to a target it had never seen;
           · the cursor leaves the window and comes back somewhere else;
           · a second monitor — dragging across the seam teleports the cursor
             the full width of the screen in a single event.

         So the target accumulates MOVEMENT instead. The first event after the
         cursor appears only seeds the reference point and moves nothing, and
         each event can shift the target by at most STEP, so a teleport becomes
         one small nudge rather than a lurch. Real movement fires many events,
         so it accumulates normally and still feels direct. */
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
         Layout — HeroStage's solved sizing, unchanged.
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
         an INTEGER multiple of the source cell, the survivors still fall in
         perfect rows — the one thing thinning by distance could never promise,
         and why the phone mark used to look faintly jittered.

         Runs on resize only. The angle PAIRING is untouched: homes never move,
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
          /* WIDE: the mark takes the space to the RIGHT OF THE WORDS.

             It used to be placed by fixed fractions of the frustum, tuned at
             1440 and wrong everywhere else: at 1024 the lead ran 175px under
             the mark (247px at 1024x768), and even 1280 overlapped by 35px. So
             the copy's right edge is now read from the DOM — the same rule as
             the narrow branch below (§5.21): what the mark must avoid is
             measured, never assumed — and the mark is fitted into what is left.

             The same number is published as --copy-end so the scrim's left ramp
             ends exactly where the words do. Its old percentage stops landed on
             the mark's left half at every width, veiling it in both themes. */
          const pxPerWorld = h / FRAME.h;
          const end = copyEnd() ?? w * 0.52;
          hero.style.setProperty("--copy-end", `${Math.round(end)}px`);
          const edge = parseFloat(getComputedStyle(hero).paddingRight) || 64;
          const left = end + COPY_GAP_PX;
          const right = w - edge;
          /* VERTICALLY, keep the mark inside the FIRST SCREEN. The section is
             sized by its copy, and on a short window (1024x544, say) the
             narrower column wraps until the section is far taller than the
             viewport — centring on the SECTION then put the mark's lower half
             below the fold. So it centres in the band between the nav clearance
             (the section's own padding-top) and just above the fold, whichever
             sits higher; when the section fits the window that is simply its
             middle, exactly as before. `min` keeps the handover continuous as
             the window shrinks. */
          const bandTop = parseFloat(getComputedStyle(hero).paddingTop) || 96;
          const bandBottom = Math.min(h, window.innerHeight) - 24;
          const centreY = Math.min(h / 2, (bandTop + bandBottom) / 2);
          /* 0.68 of the section height is the size the mark had at 1440; cap
             there so very wide screens do not balloon it — and to the visible
             band, so the fold can never clip it. */
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

        /* NARROW. `h` is the SECTION height, not the screen — on mobile the
           copy overflows the viewport, so sizing off FRAME.h alone puts the
           mark edge to edge (§5.20). Everything below is therefore worked in
           PIXELS against the band the CSS actually reserves, read from the DOM
           so the reserved space and the mark cannot drift apart (§5.21).

           The mark is fitted BETWEEN the nav and the copy with real margins,
           rather than centred in the raw band. Centring on the band alone put
           its top at 55px at 320px wide — under a nav that owns the first
           ~70px — and left a 9px gap to the badge below. */
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

        /* EXACTLY zero at k = 1. See the flat-mark note at the top. */
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
        /* Resolved, still, honest — the mark is the meaningful state. */
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
        /* Render only while on screen — §8's performance budget. */
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
