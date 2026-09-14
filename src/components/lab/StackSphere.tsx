"use client";

import { useEffect, useRef, useState } from "react";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";

/* ==========================================================================
   /stack-lab · variant F — the marks in three dimensions. three.js.
   ==========================================================================
   The mobile echo of the desktop constellation: instead of a list, all 62
   marks become one object you can spin with a thumb. It is the only variant
   that makes this section a THING rather than a document, which is exactly
   what the phone version currently loses.

   ── FOUR ARRANGEMENTS, ONE SCENE, AND THAT IS DELIBERATE ─────────────────
   These are not separate variants in the lab's top-level list, because the
   thing that separates them is not measurable the way the flat layouts are:
   every arrangement holds the same 62 plates, costs the same library, and
   occupies the same 360px stage, so the height readout cannot tell them
   apart. What differs is how the set FEELS and what it implies:

     Sphere   a body of work, no beginning or end. The default.
     Bands    one ring per service, stacked. Grouping made explicit and even.
     Carousel four stacked rings, a rolodex. Reads as "browse me".
     Helix    a spiral you travel — implies sequence, which is a lie here:
              these technologies are not ordered.

   A correction to an earlier note in this file: Bands is NOT the only
   arrangement that shows the grouping. `ALL` is built in service order and
   the Fibonacci sphere walks y monotonically from pole to pole, so each
   service already lands on its own latitude band of the sphere — focus a
   service and you can see it. Carousel and Helix group too, by ring and by
   turn. What Bands actually does is make the grouping EVEN and LEGIBLE
   rather than incidental: six equal rings instead of six unequal patches
   whose boundaries you cannot see until something is focused.

   They share a scene and lerp rather than unmounting: a cut between two 3D
   layouts tells you nothing, a transition tells you how related they are.

   GRID AND SCATTER WERE CUT on 2026-09-12. Grid was the logo-grid variant
   with a z-axis added — every plate parallel to the screen, so the third
   dimension bought nothing the flat version did not already have, and it was
   the one arrangement that looked worse for spinning. Scatter existed as a
   control, to show how much the ordered arrangements were doing; it answered
   that (a great deal) and then had no further job. A lab keeps the options
   someone might choose, not the ones that only ever proved a point.

   ── SEPARATING BY SERVICE IS A CONTROL, NOT AN ARRANGEMENT ───────────────
   The question Bands raised — "so can I see just the web stack?" — is not
   answered by adding more layouts. It is answered by FOCUS, which works
   across all four: choose a service and its marks stay lit while the other
   fifty-odd recede. That keeps the whole set on screen, so you see the
   chosen stack IN PROPORTION to everything else, which a filter that removed
   the others would destroy — "eleven of sixty-two" is the interesting fact,
   and hiding the sixty-two throws it away.

   THE CONTROL IS THE ACCESSIBLE LIST ITSELF. The six service rows below the
   stage are the buttons. That is not a shortcut: it means the fallback
   markup and the control are the same elements, so a keyboard or screen
   reader user operates the identical thing a thumb does, and there is no
   second control to keep in sync.

   ── CSS3DRenderer, NOT WebGL, AND THAT IS THE WHOLE TRICK ────────────────
   The obvious build is textured planes, which means rasterising 62 SVGs into
   textures: a pile of loader code, blurry marks on a high-DPR screen, and a
   real memory cost on a phone. CSS3DRenderer instead uses three.js purely for
   the scene graph and the maths, and emits ordinary DOM nodes under CSS 3D
   transforms. The marks stay vector-crisp at any zoom, they are the SAME
   white plates TechLogo renders everywhere else on the site, and there is no
   WebGL context at all — so this also runs where WebGL is blocked or
   unavailable, which on mobile Safari is not a rare case.

   ── IT FOLLOWS CtaStage's CONTRACT ───────────────────────────────────────
   `three` is imported dynamically INSIDE the effect, so the library is not in
   the route's first-paint bundle. The boot is fully reversible because React
   StrictMode runs effects twice in development and a half-finished async boot
   that is not cancellable leaks a second scene. Reduced motion stops the
   auto-rotation and lands layout changes instantly, but keeps the object —
   the information is the marks, not the movement, so it must not be
   motion-gated.

   ── THE FALLBACK IS REAL MARKUP ──────────────────────────────────────────
   The six service names render as a plain list underneath, and that is what a
   screen reader gets, what you see with JS off, with the library still
   loading, or if the import fails outright. The 3D object is decoration over
   it and never a replacement: a spinning ball of logos is unreachable by
   keyboard and meaningless to AT, so it is `aria-hidden`.

   ⚠ COST. This is the heaviest variant in the lab by a wide margin — three.js
   is ~150KB gzipped even tree-shaken to the CSS3D path, against 0KB for every
   other option here. It buys character, not information. That trade is
   exactly what /stack-lab exists to put in front of someone.
   ========================================================================== */

const ALL = CAPABILITIES.flatMap((c, ci) =>
  c.stack.flatMap((g) =>
    g.items.map((t) => ({ ...t, hue: c.hue, of: c.name, service: ci })),
  ),
);
const N = ALL.length;

export const ARRANGEMENTS = [
  { key: "sphere", name: "Sphere" },
  { key: "bands", name: "Bands" },
  { key: "carousel", name: "Carousel" },
  { key: "helix", name: "Helix" },
] as const;
export type Arrangement = (typeof ARRANGEMENTS)[number]["key"];

function monogram(name: string) {
  const parts = name
    .replace(/[^A-Za-z]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/);
  return (
    parts.length > 1
      ? parts[0][0] + parts[1][0]
      : name.replace(/[^A-Za-z]/g, "").slice(0, 2)
  ).toUpperCase();
}

export default function StackSphere() {
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [arr, setArr] = useState<Arrangement>("sphere");
  /** Service index to light up, or null for all of them. */
  const [focus, setFocus] = useState<number | null>(null);
  /* The scene reads the arrangement through a ref, because the rAF loop is
     created once and must not be torn down and rebuilt to change layout —
     rebuilding is what would make this a cut instead of a morph. */
  const arrRef = useRef<Arrangement>("sphere");
  const focusRef = useRef<number | null>(null);

  useEffect(() => {
    arrRef.current = arr;
  }, [arr]);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const [THREE, { CSS3DRenderer, CSS3DObject }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/renderers/CSS3DRenderer.js"),
      ]);
      if (cancelled || !host.isConnected) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const W = host.clientWidth;
      const H = host.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, W / H, 1, 4000);
      /* 560, not 760: further back the object filled under half the 360px
         stage and the marks read as confetti. This puts it near 77% of the
         frame height, which is where it reads as one object. */
      camera.position.z = 560;

      const renderer = new CSS3DRenderer();
      renderer.setSize(W, H);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      host.appendChild(renderer.domElement);

      /* ---- the six arrangements ------------------------------------------
         EVERY EXTENT BELOW IS BOUNDED BY THE FRUSTUM, NOT CHOSEN BY EYE. The
         stage is 338x360 and the camera sits at z=560 with a 60° field, so a
         plate at depth z has only 2*(560-z)*tan(30°) of height to live in —
         at the front of a 200-unit-deep arrangement that is ~415, not the 646
         the centre plane gets. The first pass sized these at the centre plane
         and the outermost plates of Bands (498px tall) were permanently
         cropped by the stage. Measured spread is now inside 275x275 for all
         four. Re-measure if you change the camera.

         Each returns a position and an outward direction per index. The
         direction is turned into a quaternion by a throwaway Object3D so the
         loop can slerp: lerping Euler angles through a lookAt flips plates
         over as they cross the poles. */
      const aim = new THREE.Object3D();
      const layouts: Record<
        Arrangement,
        (i: number) => { p: THREE.Vector3; look: THREE.Vector3 }
      > = {
        sphere: (i) => {
          const R = 205;
          const y = 1 - (i / (N - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const th = Math.PI * (3 - Math.sqrt(5)) * i;
          const p = new THREE.Vector3(
            Math.cos(th) * r * R,
            y * R,
            Math.sin(th) * r * R,
          );
          return { p, look: p.clone().multiplyScalar(2) };
        },
        /* One ring per service, stacked — the only arrangement that shows the
           grouping, and so the only one that can answer "what do they use for
           the backend?". */
        bands: (i) => {
          const s = ALL[i].service;
          const inService = ALL.filter((m) => m.service === s);
          const k = inService.indexOf(ALL[i]);
          const th = (k / inService.length) * Math.PI * 2;
          const R = 165;
          const p = new THREE.Vector3(
            Math.cos(th) * R,
            175 - s * 70,
            Math.sin(th) * R,
          );
          return { p, look: new THREE.Vector3(p.x * 2, p.y, p.z * 2) };
        },
        carousel: (i) => {
          const perRing = Math.ceil(N / 4);
          const ring = Math.floor(i / perRing);
          const k = i % perRing;
          const th = (k / perRing) * Math.PI * 2;
          const R = 195;
          const p = new THREE.Vector3(
            Math.cos(th) * R,
            135 - ring * 90,
            Math.sin(th) * R,
          );
          return { p, look: new THREE.Vector3(p.x * 2, p.y, p.z * 2) };
        },
        helix: (i) => {
          const t = i / (N - 1);
          const th = t * Math.PI * 2 * 3.4;
          const R = 145;
          const p = new THREE.Vector3(
            Math.cos(th) * R,
            160 - t * 320,
            Math.sin(th) * R,
          );
          return { p, look: new THREE.Vector3(p.x * 2, p.y, p.z * 2) };
        },
      };

      const targets: Record<Arrangement, { p: THREE.Vector3; q: THREE.Quaternion }[]> =
        Object.fromEntries(
          ARRANGEMENTS.map((a) => [
            a.key,
            Array.from({ length: N }, (_, i) => {
              const { p, look } = layouts[a.key](i);
              aim.position.copy(p);
              aim.lookAt(look);
              return { p, q: aim.quaternion.clone() };
            }),
          ]),
        ) as typeof targets;

      const group = new THREE.Group();
      const objs: InstanceType<typeof CSS3DObject>[] = [];
      const plates: HTMLElement[] = [];

      ALL.forEach((t, i) => {
        const el = document.createElement("div");
        el.className =
          "grid size-11 place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/10";
        el.title = `${t.name} · ${t.of}`;
        if (t.file) {
          const img = document.createElement("img");
          img.src = `/tech/${t.file}`;
          img.alt = "";
          img.className = "size-6 object-contain";
          el.appendChild(img);
        } else {
          const span = document.createElement("span");
          span.textContent = monogram(t.name);
          span.className = "text-[11px] font-bold tracking-tight text-slate-500";
          el.appendChild(span);
        }

        /* THE PLATE IS WRAPPED, AND THE WRAPPER IS WHAT THREE.JS GETS.
           CSS3DRenderer writes the 3D matrix into `style.transform` of the
           element it owns, every frame. Setting a `scale()` on that same
           element for the focus state does not compose with it — one simply
           overwrites the other, and the marks either stop moving or stop
           scaling. So the wrapper carries the matrix and the plate inside it
           carries opacity and scale, which also lets the browser transition
           them off the main thread instead of us writing 62 styles a tick. */
        const wrap = document.createElement("div");
        wrap.appendChild(el);
        el.style.transition = "opacity .45s ease, transform .45s ease";
        const obj = new CSS3DObject(wrap);
        obj.position.copy(targets.sphere[i].p);
        obj.quaternion.copy(targets.sphere[i].q);
        objs.push(obj);
        plates.push(el);
        group.add(obj);
      });
      scene.add(group);

      /* Drag to spin. Pointer events cover mouse, touch and pen in one path,
         and `setPointerCapture` keeps the gesture alive if the finger leaves
         the stage mid-swipe. */
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      const idle = reduced ? 0 : 0.0016;
      let velX = idle;
      let velY = 0;

      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        (e.target as Element).setPointerCapture?.(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        velX = (e.clientX - lastX) * 0.00022;
        velY = (e.clientY - lastY) * 0.00022;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const up = () => {
        dragging = false;
      };
      host.addEventListener("pointerdown", down);
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerup", up);
      host.addEventListener("pointercancel", up);

      /* Focus is applied on change rather than every frame, for the reason in
         the note on the plate above. `inner` is the logo, dimmed harder than
         the plate itself so an unfocused mark reads as present-but-quiet
         rather than as a smudge. */
      let appliedFocus: number | null | undefined;
      const applyFocus = () => {
        const f = focusRef.current;
        if (f === appliedFocus) return;
        appliedFocus = f;
        for (let i = 0; i < plates.length; i++) {
          const on = f === null || ALL[i].service === f;
          plates[i].style.opacity = on ? "1" : "0.16";
          plates[i].style.transform = on ? "scale(1)" : "scale(0.62)";
        }
      };

      let raf = 0;
      const tick = () => {
        applyFocus();
        const t = targets[arrRef.current];
        /* 1 = land instantly, which is what reduced motion asks for: the
           arrangement still changes, it just does not travel. */
        const ease = reduced ? 1 : 0.075;
        for (let i = 0; i < objs.length; i++) {
          objs[i].position.lerp(t[i].p, ease);
          objs[i].quaternion.slerp(t[i].q, ease);
        }
        if (!dragging) {
          velX += (idle - velX) * 0.02;
          velY += (0 - velY) * 0.05;
        }
        group.rotation.y += velX;
        group.rotation.x = Math.max(
          -0.6,
          Math.min(0.6, group.rotation.x + velY),
        );
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();
      setReady(true);

      const onResize = () => {
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(host);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        host.removeEventListener("pointerdown", down);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerup", up);
        host.removeEventListener("pointercancel", up);
        renderer.domElement.remove();
        setReady(false);
      };
    };

    start().catch(() => {
      /* Import failure: the list below is already in the DOM, so there is
         nothing to repair — just never claim ready. */
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div>
      <div
        role="tablist"
        aria-label="3D arrangements"
        className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ARRANGEMENTS.map((a) => {
          const on = a.key === arr;
          return (
            <button
              key={a.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setArr(a.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                on
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {a.name}
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card">
        <div
          ref={mount}
          aria-hidden="true"
          className="relative h-[360px] w-full touch-none [&_*]:will-change-transform"
        />
        {!ready && (
          <p className="absolute inset-0 grid place-items-center text-[12px] text-muted-foreground">
            loading three.js…
          </p>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {focus === null ? (
          <>drag to spin · 62 marks · pick a service below</>
        ) : (
          <>
            {CAPABILITIES[focus].name} ·{" "}
            {CAPABILITIES[focus].stack.reduce((n, g) => n + g.items.length, 0)}{" "}
            of 62
          </>
        )}
      </p>

      {/* THE FALLBACK AND THE CONTROL ARE THE SAME ELEMENTS. This list is what
          a screen reader gets and what you see with JS off — and it is also
          how a service is chosen, so there is no second control to keep in
          step and no thumb-only affordance. */}
      <ul className="mt-4 flex flex-col gap-2">
        {CAPABILITIES.map((c, i) => {
          const on = focus === i;
          return (
            <li key={c.k}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setFocus(on ? null : i)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  on
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <span
                  className={`size-2.5 shrink-0 rounded-full ${HUE[c.hue].tile}`}
                  aria-hidden="true"
                />
                <span className="flex-1 text-[13px] font-semibold text-foreground">
                  {c.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {c.stack.reduce((n, g) => n + g.items.length, 0)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {focus !== null && (
        <button
          type="button"
          onClick={() => setFocus(null)}
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Show all six
        </button>
      )}
    </div>
  );
}
