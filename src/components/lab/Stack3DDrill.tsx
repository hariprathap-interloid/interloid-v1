"use client";

import { useEffect, useRef, useState } from "react";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";

/* ==========================================================================
   /stack-3d — the drill-down. Sphere as the overview, a labelled arrangement
   as the detail. three.js, CSS3DRenderer.
   ==========================================================================
   /stack-lab's 3D variant proved the object is worth having and left one
   thing unanswered: focus dimmed the other services but the chosen one kept
   the sphere's arrangement, so "show me the web stack" gave you eleven lit
   marks in the same scattered positions they already had. You could see WHICH
   marks; you could not see how they were organised.

   This page is that second step. Three levels, one scene:

     LEVEL 1  the sphere. All 62 marks, no hierarchy, no labels. The
              question it answers is "how much is there".
     LEVEL 2  pick a service. Its marks grow and re-form into a labelled
              arrangement — one ring, turn or arc PER GROUP, with the group
              name floating beside it. The other fifty-odd fall back to a
              dim outer shell rather than disappearing, so the chosen stack
              stays in proportion to the whole.
     LEVEL 3  tap a mark. It grows again and names itself.

   Five arrangements are offered for level 2, because that is the choice this
   page exists to make. They differ in what they imply about the groups:

     Carousel  stacked rings. Groups as equal, parallel shelves.
     Helix     one spiral, groups as consecutive turns. Implies ORDER, which
               for "Frontend frameworks → Styling → Build tools" is arguably
               true and for most other services is not.
     Bands     stacked rings again, but flatter and wider, labels outboard.
               The most diagram-like, the least toy-like.
     Orbit     concentric tilted rings around the service tile. Groups as
               distance from a centre — reads as a system.
     Arc       a front-facing fan. The only one that does not require
               rotation to read, and so the only one that works on a still.

   ── WHY THE UNFOCUSED MARKS STAY ─────────────────────────────────────────
   They retreat to a large dim shell instead of being removed. "Eleven of
   sixty-two" is the fact this section exists to land, and a filter that hides
   the sixty-two throws away the denominator. It is also what stops the
   transition being a cut: the shell is visibly the sphere you just left.

   ── THE LABELS ARE A LEGEND, SO THEY DO NOT LIVE IN THE OBJECT ───────────
   They were first added to the rotating group and billboarded — each one
   cancelling the group's rotation so it stayed readable. That is the obvious
   build and it was wrong twice over. Bands put them at x=250, which is past
   the frustum's ~303 half-width once a pill is 130 units wide, so they were
   clipped by the stage; Arc put one above each of four columns 75 units
   apart, and the group names ("Node.js ecosystem", "Python ecosystem") are
   nearer 130 wide, so they overlapped into mush.

   Both problems come from the same mistake: treating a legend as part of the
   object. Labels now belong to the SCENE, not the group. They never rotate,
   they need no billboard maths at all (the camera has no rotation, so
   identity is correct), they cannot be carried out of frame by a spin, and
   they can be laid out against the viewport's real width instead of against
   whatever the arrangement happens to be doing.

   Plates are the opposite and stay in the group, unbillboarded: a plate that
   always faces you stops describing a surface, and the sphere collapses into
   a flat cloud.

   ── ARC STOPS THE SPIN, BECAUSE THAT IS ITS WHOLE CLAIM ──────────────────
   Arc exists to be the arrangement readable WITHOUT rotation. With the idle
   drift still running it swung away from the reader within a second, which
   made the claim false. Focusing a service in Arc eases the rotation to zero
   and holds it there; a drag still works, it just returns to front.

   ── EVERYTHING ELSE FOLLOWS StackSphere.tsx ──────────────────────────────
   Dynamic `three` import inside the effect, StrictMode-safe cancellation,
   CSS3DRenderer so the marks stay vector-crisp with no WebGL context, the
   accessible service list doubling as the control, and reduced motion landing
   changes instantly rather than travelling. The wrapper-per-plate rule is
   load-bearing there and here: CSS3DRenderer owns `style.transform` on the
   element it is given, so scale and opacity have to live on a child.
   ========================================================================== */

type Mark = {
  name: string;
  file?: string;
  service: number;
  group: number;
  groupName: string;
};

const ALL: Mark[] = CAPABILITIES.flatMap((c, ci) =>
  c.stack.flatMap((g, gi) =>
    g.items.map((t) => ({
      name: t.name,
      file: t.file,
      service: ci,
      group: gi,
      groupName: g.group,
    })),
  ),
);
const N = ALL.length;

export const MODES = [
  { key: "carousel", name: "Carousel" },
  { key: "helix", name: "Helix" },
  { key: "bands", name: "Bands" },
  { key: "orbit", name: "Orbit" },
  { key: "arc", name: "Arc" },
] as const;
export type Mode = (typeof MODES)[number]["key"];

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

export default function Stack3DDrill({ mode }: { mode: Mode }) {
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [service, setService] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  /* The rAF loop is built once, so it reads state through refs. Rebuilding it
     per selection is what would turn every morph into a cut. */
  const modeRef = useRef<Mode>(mode);
  const svcRef = useRef<number | null>(null);
  const pickRef = useRef<number | null>(null);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    svcRef.current = service;
  }, [service]);
  useEffect(() => {
    pickRef.current = picked;
  }, [picked]);

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
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        host.clientWidth / host.clientHeight,
        1,
        4000,
      );
      camera.position.z = 560;

      const renderer = new CSS3DRenderer();
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      /* ---- marks -------------------------------------------------------- */
      const objs: InstanceType<typeof CSS3DObject>[] = [];
      const plates: HTMLElement[] = [];

      ALL.forEach((t, i) => {
        const wrap = document.createElement("div");
        const el = document.createElement("div");
        el.className =
          "grid size-11 cursor-pointer place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/10";
        el.style.transition =
          "opacity .45s ease, transform .45s cubic-bezier(.16,1,.3,1)";
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
        /* Level 3. `pointerup` and not `click`: the stage swallows drags, and
           a click fired after a spin would select whatever ended up under the
           finger. A drag sets `moved` and this bails. */
        el.addEventListener("pointerup", (e) => {
          e.stopPropagation();
          if (movedRef.moved) return;
          setPicked((p) => (p === i ? null : i));
        });
        wrap.appendChild(el);
        const obj = new CSS3DObject(wrap);
        objs.push(obj);
        plates.push(el);
        group.add(obj);
      });

      /* ---- group labels, one per group of the focused service ----------- */
      const MAXG = Math.max(...CAPABILITIES.map((c) => c.stack.length));
      const labelObjs: InstanceType<typeof CSS3DObject>[] = [];
      const labelEls: HTMLElement[] = [];
      for (let i = 0; i < MAXG; i++) {
        const wrap = document.createElement("div");
        const el = document.createElement("div");
        el.className =
          "max-w-[150px] rounded-full bg-slate-900/90 px-2.5 py-1 text-center text-[9px] font-bold uppercase leading-[1.3] tracking-[0.1em] text-white shadow-lg";
        el.style.transition = "opacity .4s ease";
        el.style.opacity = "0";
        wrap.appendChild(el);
        const obj = new CSS3DObject(wrap);
        labelObjs.push(obj);
        labelEls.push(el);
        scene.add(obj);
      }

      /* ---- the name plate for level 3 ----------------------------------- */
      const nameWrap = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className =
        "whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl";
      nameEl.style.transition = "opacity .3s ease";
      nameEl.style.opacity = "0";
      nameWrap.appendChild(nameEl);
      const nameObj = new CSS3DObject(nameWrap);
      scene.add(nameObj);

      /* ---- layouts ------------------------------------------------------ */
      const aim = new THREE.Object3D();
      const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

      /* WHERE THE LABELS GO, AND WHY NOT IN A LEFT-HAND COLUMN.
         At z=0 with the camera at 560 and a 60° vertical field this stage
         (338x420) shows 520 x 647 world units, so the half-width is 260. The
         labels were measured rather than estimated, and they are far wider
         than they look: "Node.js ecosystem" renders 87 screen px, which at
         0.646 px per unit is 135 units, and the longest group name in the
         content — "Containers & orchestration" — is nearer 194.

         A left-hand column therefore cannot work. Fitting a 194-wide pill
         inside the left edge puts its centre at -163 and its right edge at
         -66, which leaves the rings a radius of about 44: smaller than a
         single plate. Two earlier passes failed on exactly this, first
         clipping the labels off the stage and then pushing the rings into
         them.

         So each label sits CENTRED ABOVE ITS OWN RING instead. Horizontally
         there is then a full 520 to play with, and vertically the gap between
         two rings is free of marks by construction — a ring is a horizontal
         circle, so nothing exists at ring_y + 34. It also associates label
         with ring far better than a column ever did.

         Orbit is the exception: its rings are concentric, not stacked, so
         there is no per-ring height to sit above. Its labels stack as a title
         block above the object, which is empty because a tilted ring's
         vertical extent is only R·sin(tilt). */
      const LABEL_DY = 34;

      /* A LABEL MUST SIT IN FRONT OF EVERY MARK, AND z IS THE ONLY THING
         THAT DECIDES THAT. CSS3DRenderer puts all objects in one
         `preserve-3d` container, so the browser sorts them by real depth —
         no z-index will save a label that is behind a plate. At z=0 the near
         half of a ring (z up to +R) renders over the text, which is exactly
         the mark-on-label collision the first pass measured.

         So labels are pushed forward past the deepest mark and scaled back by
         the same ratio, which cancels the perspective enlargement and leaves
         them looking the size they were: at distance (560 - z) instead of
         560, apparent size is multiplied by 560/(560-z), so a scale of
         (560-z)/560 puts it back. */
      const LABEL_Z: Record<Mode, number> = {
        carousel: 180,
        bands: 180,
        helix: 180,
        orbit: 250,
        arc: 0,
      };
      const labelScale = (m: Mode) => (560 - LABEL_Z[m]) / 560;

      /** Level 1 / the dim shell: the same Fibonacci sphere at two radii. */
      const sphereAt = (i: number, R: number) => {
        const y = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = Math.PI * (3 - Math.sqrt(5)) * i;
        return v(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
      };

      type Placed = { p: THREE.Vector3; q: THREE.Quaternion };
      const place = (p: THREE.Vector3, look: THREE.Vector3): Placed => {
        aim.position.copy(p);
        aim.lookAt(look);
        return { p, q: aim.quaternion.clone() };
      };
      const outward = (p: THREE.Vector3) =>
        place(p, v(p.x * 2, p.y, p.z * 2));

      /** Level 2. Returns a placement per member index within its group. */
      const focusPlace = (
        m: Mode,
        gi: number,
        gCount: number,
        k: number,
        kCount: number,
      ): Placed => {
        const spanY = m === "bands" ? 300 : 240;
        const yOf = (g: number) =>
          gCount === 1 ? 0 : spanY / 2 - (g / (gCount - 1)) * spanY;

        if (m === "carousel" || m === "bands") {
          const R = m === "bands" ? 150 : 122;
          const th = (k / kCount) * Math.PI * 2;
          const p = v(Math.cos(th) * R, yOf(gi), Math.sin(th) * R);
          return outward(p);
        }
        if (m === "helix") {
          /* Groups are consecutive turns, so the spiral reads as one path
             through the whole service rather than as separate rings. */
          const t = (gi + k / kCount) / gCount;
          const th = t * Math.PI * 2 * gCount;
          const R = 122;
          const p = v(Math.cos(th) * R, 150 - t * 300, Math.sin(th) * R);
          return outward(p);
        }
        if (m === "orbit") {
          const R = 58 + gi * 38;
          const th = (k / kCount) * Math.PI * 2;
          const tilt = 0.38 + gi * 0.1;
          const p = v(
            Math.cos(th) * R,
            Math.sin(th) * R * Math.sin(tilt),
            Math.sin(th) * R * Math.cos(tilt),
          );
          return outward(p);
        }
        /* arc — a front-facing fan; the only one readable without rotation.
           The span is 460 and not 300 so four group columns sit 115 apart,
           which with staggered labels is enough for a 130-wide pill. */
        const colW = 460 / Math.max(gCount, 1);
        const x = -230 + colW * (gi + 0.5);
        const perCol = Math.ceil(kCount / 3);
        const row = Math.floor(k / perCol);
        const col = k % perCol;
        const p = v(
          x + (col - (perCol - 1) / 2) * 52,
          90 - row * 66,
          -Math.abs(x) * 0.55,
        );
        return place(p, v(p.x, p.y, p.z + 100));
      };

      /* ---- target computation ------------------------------------------- */
      const targets: Placed[] = ALL.map((_, i) => outward(sphereAt(i, 205)));
      const labelTargets = labelObjs.map(() => new THREE.Vector3());
      const scales = new Float32Array(N).fill(1);
      const opac = new Float32Array(N).fill(1);

      const recompute = () => {
        const s = svcRef.current;
        const m = modeRef.current;
        const pick = pickRef.current;

        if (s === null) {
          ALL.forEach((_, i) => {
            targets[i] = outward(sphereAt(i, 205));
            scales[i] = pick === i ? 1.6 : 1;
            opac[i] = pick === null || pick === i ? 1 : 0.35;
          });
          labelEls.forEach((el) => (el.style.opacity = "0"));
        } else {
          const cap = CAPABILITIES[s];
          const gCount = cap.stack.length;
          const idx = ALL.map((t, i) => ({ t, i })).filter(
            (x) => x.t.service === s,
          );
          const perGroup = cap.stack.map((g) => g.items.length);
          const seen = new Array(gCount).fill(0);

          ALL.forEach((t, i) => {
            if (t.service !== s) {
              /* The shell: the same sphere, pushed out and dimmed. */
              targets[i] = outward(sphereAt(i, 330));
              scales[i] = 0.5;
              opac[i] = 0.12;
              return;
            }
            const k = seen[t.group]++;
            targets[i] = focusPlace(m, t.group, gCount, k, perGroup[t.group]);
            scales[i] = pick === i ? 1.7 : 1.22;
            opac[i] = 1;
          });
          void idx;

          /* LABELS ARE LAID OUT AGAINST THE VIEWPORT, not against the
             arrangement, because they live in the scene and never rotate.
             Everything except Arc gets the same left-hand legend column, so
             switching arrangement does not move the reading order. */
          labelObjs.forEach((_, gi) => {
            if (gi >= gCount) {
              labelEls[gi].style.opacity = "0";
              return;
            }
            labelEls[gi].textContent = cap.stack[gi].group;
            labelEls[gi].style.opacity = "1";
            labelObjs[gi].scale.setScalar(labelScale(m));
            if (m === "arc") {
              /* Above its own column, and staggered: adjacent pills are 115
                 apart horizontally but up to 194 wide, so alternating rows
                 are what actually stops them touching. */
              const colW = 460 / gCount;
              labelTargets[gi].set(
                -230 + colW * (gi + 0.5),
                gi % 2 ? 214 : 176,
                LABEL_Z.arc,
              );
              return;
            }
            if (m === "orbit") {
              /* A title block above the rings — concentric rings have no
                 per-ring height to label. */
              /* Bounded at the LABEL's depth, not at z=0: pushing these
                 forward to clear the rings also shrinks the frustum they
                 live in, from ±323 at z=0 to ±179 at z=250. y=288 was fine
                 at the origin and off the top of the stage once moved. */
              labelTargets[gi].set(0, 158 - gi * 28, LABEL_Z.orbit);
              return;
            }
            const spanY = m === "bands" ? 300 : 240;
            const y =
              gCount === 1 ? 0 : spanY / 2 - (gi / (gCount - 1)) * spanY;
            labelTargets[gi].set(0, y + LABEL_DY, LABEL_Z[m]);
          });
        }

        /* Level 3's name plate rides just above the picked mark. */
        if (pick === null) {
          nameEl.style.opacity = "0";
        } else {
          nameEl.textContent = ALL[pick].name;
          nameEl.style.opacity = "1";
        }

        for (let i = 0; i < N; i++) {
          plates[i].style.opacity = String(opac[i]);
          plates[i].style.transform = `scale(${scales[i]})`;
        }
      };
      recompute();
      objs.forEach((o, i) => {
        o.position.copy(targets[i].p);
        o.quaternion.copy(targets[i].q);
      });

      /* ---- drag ---------------------------------------------------------- */
      const movedRef = { moved: false };
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      const idle = reduced ? 0 : 0.0013;
      let velX = idle;
      let velY = 0;

      const down = (e: PointerEvent) => {
        dragging = true;
        movedRef.moved = false;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        if (Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 3) {
          movedRef.moved = true;
        }
        velX = (e.clientX - lastX) * 0.0002;
        velY = (e.clientY - lastY) * 0.0002;
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

      /* ---- loop ---------------------------------------------------------- */
      let lastSig = "";
      let raf = 0;
      const worldPos = new THREE.Vector3();
      const tick = () => {
        const sig = `${svcRef.current}|${modeRef.current}|${pickRef.current}`;
        if (sig !== lastSig) {
          lastSig = sig;
          recompute();
        }
        const ease = reduced ? 1 : 0.08;
        for (let i = 0; i < objs.length; i++) {
          objs[i].position.lerp(targets[i].p, ease);
          objs[i].quaternion.slerp(targets[i].q, ease);
        }
        /* Labels sit in the scene, so they need no orientation work at all —
           the camera is unrotated and identity is already correct. */
        for (let i = 0; i < labelObjs.length; i++) {
          labelObjs[i].position.lerp(labelTargets[i], ease);
        }
        /* The name plate tracks the picked mark in WORLD space, because the
           mark rotates with the group and the plate does not. */
        const pk = pickRef.current;
        if (pk !== null) {
          objs[pk].getWorldPosition(worldPos);
          worldPos.y += 38;
          /* Same rule as the labels: forward of every plate, scaled back so
             it does not balloon. 300 clears the outer shell at 330·cos, and
             a picked mark is never further forward than the object itself. */
          worldPos.z = 300;
          nameObj.position.lerp(worldPos, ease);
          nameObj.scale.setScalar((560 - 300) / 560);
        }

        /* THE SPIN SLOWS AS YOU GO DEEPER, AND THAT IS A USABILITY FIX
           rather than a flourish. Level 3 asks you to hit a 44px plate; on a
           freely rotating object that is a moving target, and it showed up
           the moment a test tried to click one — the automation refused,
           reporting the element was never "stable". A human fares better
           than a robot here, but not much, and not on a phone.

           So: level 1 drifts at full speed, level 2 drifts at a fifth (alive,
           but a plate stays under your thumb long enough to hit), level 3
           stops dead so the mark you just named holds still while you read
           it. Arc stops at level 2 already, because facing front is its whole
           claim. A drag always overrides, and the object returns to whatever
           the current level's idle is. */
        const level =
          pickRef.current !== null ? 3 : svcRef.current !== null ? 2 : 1;
        const levelIdle = level === 3 ? 0 : level === 2 ? idle * 0.2 : idle;
        const still =
          level === 3 || (modeRef.current === "arc" && svcRef.current !== null);
        if (!dragging) {
          velX += (levelIdle - velX) * 0.04;
          velY += (0 - velY) * 0.05;
        }
        if (still && !dragging) {
          group.rotation.y += (0 - group.rotation.y) * 0.08;
          group.rotation.x += (0 - group.rotation.x) * 0.08;
          velX = 0;
          velY = 0;
        } else {
          group.rotation.y += velX;
          group.rotation.x = Math.max(
            -0.55,
            Math.min(0.55, group.rotation.x + velY),
          );
        }
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

    start().catch(() => {});

    return () => {
      cancelled = true;
      cleanup?.();
    };
    /* `setPicked` and nothing else: a state setter's identity is stable for
       the life of the component, so this still builds the scene exactly once.
       It was a ref assigned during render until 2026-09-12, which is the
       "cannot access refs during render" rule and was never needed. */
  }, [setPicked]);

  const cap = service === null ? null : CAPABILITIES[service];

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card">
        <div
          ref={mount}
          aria-hidden="true"
          className="relative h-[420px] w-full touch-none [&_*]:will-change-transform"
        />
        {!ready && (
          <p className="absolute inset-0 grid place-items-center text-[12px] text-muted-foreground">
            loading three.js…
          </p>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {picked !== null ? (
          <>
            {ALL[picked].name} · {ALL[picked].groupName}
          </>
        ) : cap ? (
          <>
            {cap.name} · {cap.stack.length} groups ·{" "}
            {cap.stack.reduce((n, g) => n + g.items.length, 0)} of 62
          </>
        ) : (
          <>drag to spin · tap a mark to name it · pick a service below</>
        )}
      </p>

      {/* The control IS the accessible fallback — one set of elements, so a
          keyboard and a thumb operate the identical thing. */}
      <ul className="mt-4 flex flex-col gap-2">
        {CAPABILITIES.map((c, i) => {
          const on = service === i;
          return (
            <li key={c.k}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setService(on ? null : i);
                  setPicked(null);
                }}
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
                  {c.stack.length}g · {c.stack.reduce((n, g) => n + g.items.length, 0)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {service !== null && (
        <button
          type="button"
          onClick={() => {
            setService(null);
            setPicked(null);
          }}
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to all 62
        </button>
      )}
    </div>
  );
}
