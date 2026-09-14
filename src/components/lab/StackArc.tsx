"use client";

import { useEffect, useRef, useState } from "react";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";

/* ==========================================================================
   /stack-arc — the arc, done properly, with five ways of labelling it.
   ==========================================================================
   Arc won the comparison on /stack-3d for one reason: it is the only
   arrangement readable WITHOUT rotation, so it survives a screenshot, a
   reduced-motion setting, and a reader who never thinks to drag. This page
   takes that and fixes the two things wrong with it.

   ── IT WAS NOT AN ARC ────────────────────────────────────────────────────
   The first version placed each group in a column and pushed it back by
   `z = -|x| * 0.55`. That is a V in plan view: two straight lines meeting at
   a point, with a visible crease in the middle and columns that get no closer
   to facing you as they move outward. A real arc is a circular sweep — every
   plate the same distance from one centre of curvature, every plate turned to
   face it. Here that centre sits at (0, y, -R) with R = 430 and a span of
   1.25 radians, which puts the outer plates 251 units out and 81 units back:
   wide enough to feel like a fan, shallow enough that the edge plates are
   still legible rather than edge-on.

   ── LABELS ARE PROJECTED, NOT GUESSED ────────────────────────────────────
   A label must sit exactly above the group it names, and on a curved arc the
   group's screen position is NOT its x — a plate 81 units further away
   projects inward. So each label is placed by casting the ray from the camera
   through the group's anchor point and intersecting it with the label plane:

     t = (560 - LABEL_Z) / (560 - P.z)
     label = (t·P.x, t·P.y, LABEL_Z)

   which lands it dead over its group whatever the depth. Guessing an x from
   the group's world position is what made the first version's labels drift
   off their columns towards the edges of the fan.

   ── FIVE DETAIL TREATMENTS ───────────────────────────────────────────────
     Plain    the label, and nothing else. The control.
     Leader   one line from the label down to its group. Cheapest way to make
              the association explicit rather than positional.
     Spokes   a line from the label to EVERY mark in the group. Unambiguous —
              no reader has to infer which marks belong to which label — and
              the busiest.
     Bracket  a rule spanning the group's projected width with end ticks, the
              label centred on it. The typographic answer; reads as a caption
              for a range rather than a pointer at a thing.
     Named    every mark carries its own name beneath it, plus the group
              label. Maximum detail, no tapping required — and the only one
              that answers "what is that mark?" without an interaction.

   Lines and ticks live in the LABEL PLANE at z = 120, in front of every
   plate (the arc's marks never come forward of z = 0), so nothing is ever
   drawn behind a mark it is pointing at. They are unscaled while the labels
   are scaled by (560-z)/560: a line's length is a world measurement and has
   to stay one, where a label's size is an appearance and must not grow as it
   comes forward.

   Everything else follows Stack3DDrill: dynamic `three`, StrictMode-safe
   cancellation, CSS3DRenderer, the accessible list doubling as the control,
   wrapper-per-plate because CSS3DRenderer owns `style.transform`, and the
   spin damping by level.
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

export const STYLES = [
  { key: "plain", name: "Plain" },
  { key: "leader", name: "Leader" },
  { key: "spokes", name: "Spokes" },
  { key: "bracket", name: "Bracket" },
  { key: "named", name: "Named" },
] as const;
export type ArcStyle = (typeof STYLES)[number]["key"];

export const AXES = [
  { key: "column", name: "Vertical columns" },
  { key: "row", name: "Horizontal rows" },
] as const;
export type ArcAxis = (typeof AXES)[number]["key"];

const ARC_R = 430;
const ARC_SPAN = 1.25;
const LABEL_Z = 120;
const CAM_Z = 560;
const MAX_LINES = 20;

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

export default function StackArc({
  style,
  axis,
}: {
  style: ArcStyle;
  axis: ArcAxis;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [service, setService] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const styleRef = useRef<ArcStyle>(style);
  const axisRef = useRef<ArcAxis>(axis);
  const svcRef = useRef<number | null>(null);
  const pickRef = useRef<number | null>(null);
  useEffect(() => {
    styleRef.current = style;
  }, [style]);
  useEffect(() => {
    axisRef.current = axis;
  }, [axis]);
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
      camera.position.z = CAM_Z;

      const renderer = new CSS3DRenderer();
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      /* ---- marks --------------------------------------------------------- */
      const objs: InstanceType<typeof CSS3DObject>[] = [];
      const plates: HTMLElement[] = [];
      const nameTags: HTMLElement[] = [];

      ALL.forEach((t, i) => {
        const wrap = document.createElement("div");
        const stack = document.createElement("div");
        stack.className = "flex flex-col items-center gap-1";
        stack.style.transition =
          "opacity .45s ease, transform .45s cubic-bezier(.16,1,.3,1)";

        const el = document.createElement("div");
        el.className =
          "grid size-11 cursor-pointer place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/10";
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
        el.addEventListener("pointerup", (e) => {
          e.stopPropagation();
          if (moved.v) return;
          setPicked((p) => (p === i ? null : i));
        });

        /* The per-mark name for the `named` treatment. It lives inside the
           plate's own stack so it travels with it and needs no second
           projection — the only label on this page that does not. */
        const tag = document.createElement("div");
        tag.className =
          /* 58px, because that is the column: eight columns across the 520
             world units the label plane offers is 65 each, and a tag wider
             than its column collides with its neighbour however the arc is
             arranged. Long names truncate — a lab trade, and the reason
             `named` carries the caveat it does. */
          "max-w-[58px] truncate rounded bg-slate-900/85 px-1.5 py-0.5 text-[8px] font-semibold text-white";
        tag.style.transition = "opacity .3s ease";
        tag.style.opacity = "0";
        tag.textContent = t.name;

        stack.appendChild(el);
        stack.appendChild(tag);
        wrap.appendChild(stack);
        const obj = new CSS3DObject(wrap);
        objs.push(obj);
        plates.push(stack);
        nameTags.push(tag);
        group.add(obj);
      });

      /* ---- group labels, in the scene so they never rotate --------------- */
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
        obj.scale.setScalar((CAM_Z - LABEL_Z) / CAM_Z);
        labelObjs.push(obj);
        labelEls.push(el);
        scene.add(obj);
      }

      /* ---- a pool of lines, reused by leader / spokes / bracket ---------- */
      const lineObjs: InstanceType<typeof CSS3DObject>[] = [];
      const lineEls: HTMLElement[] = [];
      for (let i = 0; i < MAX_LINES; i++) {
        const wrap = document.createElement("div");
        const el = document.createElement("div");
        el.className = "bg-slate-900/45";
        el.style.height = "1px";
        el.style.transition = "opacity .3s ease";
        el.style.opacity = "0";
        wrap.appendChild(el);
        const obj = new CSS3DObject(wrap);
        lineObjs.push(obj);
        lineEls.push(el);
        scene.add(obj);
      }

      /* ---- geometry ------------------------------------------------------ */
      const aim = new THREE.Object3D();
      const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

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
      const outward = (p: THREE.Vector3) => place(p, v(p.x * 2, p.y, p.z * 2));

      /** A point on the arc, turned to face the centre of curvature. */
      const onArc = (theta: number, y: number): Placed => {
        const p = v(
          Math.sin(theta) * ARC_R,
          y,
          Math.cos(theta) * ARC_R - ARC_R,
        );
        /* The centre sits at (0, y, -R); facing away from it is what makes
           every plate square to the viewer at its own angle. */
        const centre = v(0, y, -ARC_R);
        return place(p, p.clone().add(p.clone().sub(centre)));
      };

      /* THE SPAN FITS THE STAGE, NOT THE OTHER WAY ROUND. 1.25 radians is
         right for a 336px-wide stage and too wide for a 258px one: on a
         360px phone Web Development's outer sub-column hung 5–7px off the
         left edge, and it was the last clip on the page. The outermost plate
         sits at R·sin(span/2) at most, so the span is capped at whatever
         keeps that inside the visible half-width at z=0. On desktop that cap
         lands at ~1.23 — effectively unchanged — and on a 360 phone at ~0.9. */
      const fitSpan = () => {
        const halfW =
          CAM_Z * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
        const usable = halfW - 10;
        if (usable >= ARC_R * Math.sin(ARC_SPAN / 2)) return ARC_SPAN;
        return 2 * Math.asin(Math.max(0.2, usable / ARC_R));
      };

      /** Cast camera→P onto the label plane. See the banner. */
      const project = (p: THREE.Vector3) => {
        const t = (CAM_Z - LABEL_Z) / (CAM_Z - p.z);
        return v(t * p.x, t * p.y, LABEL_Z);
      };

      const targets: Placed[] = ALL.map((_, i) => outward(sphereAt(i, 205)));
      const labelTargets = labelObjs.map(() => new THREE.Vector3());
      const scales = new Float32Array(N).fill(1);
      const opac = new Float32Array(N).fill(1);

      const tmpA = new THREE.Vector3();
      const tmpB = new THREE.Vector3();

      /** Lay one line between two points already in the label plane. */
      let lineCursor = 0;
      const drawLine = (a: THREE.Vector3, b: THREE.Vector3) => {
        if (lineCursor >= MAX_LINES) return;
        const o = lineObjs[lineCursor];
        const el = lineEls[lineCursor];
        lineCursor++;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        el.style.width = `${Math.max(len, 1)}px`;
        el.style.opacity = "1";
        o.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, LABEL_Z);
        o.rotation.set(0, 0, Math.atan2(dy, dx));
      };

      const recompute = () => {
        const s = svcRef.current;
        const st = styleRef.current;
        const ax = axisRef.current;
        const pick = pickRef.current;
        lineCursor = 0;
        lineEls.forEach((el) => (el.style.opacity = "0"));

        if (s === null) {
          ALL.forEach((_, i) => {
            targets[i] = outward(sphereAt(i, 205));
            scales[i] = pick === i ? 1.6 : 1;
            opac[i] = pick === null || pick === i ? 1 : 0.35;
          });
          labelEls.forEach((el) => (el.style.opacity = "0"));
          nameTags.forEach((t) => (t.style.opacity = "0"));
        } else {
          const cap = CAPABILITIES[s];
          const gCount = cap.stack.length;
          const counts = cap.stack.map((g) => g.items.length);
          const span = fitSpan();

          const seen = new Array(gCount).fill(0);
          /* Highest plate per group, for the label and the leader to aim at. */
          const anchors: THREE.Vector3[] = new Array(gCount);
          /* Every placed mark of the focused service, kept per group — the
             bracket and the spokes both need the whole set, not just the
             anchor. */
          const members: number[][] = Array.from({ length: gCount }, () => []);

          if (ax === "column") {
            /* ── ONE GROUP, ONE COLUMN ──────────────────────────────────────
               Each group takes a single angular slot and stacks its marks
               vertically inside it. This is the better of the two axes and
               the reason is structural rather than aesthetic: with marks laid
               out ALONG the arc, the boundary between one group and the next
               is a gap the reader has to judge, and a label has to be tied to
               a run of marks. Stacked, a group IS a column — the boundary is
               the whitespace between columns, and each label sits over
               exactly one thing.

               It also removes the constraint that made `named` hard. Tags
               collided because they were side by side in a run; in a column
               they sit one above another and the only limit is height, of
               which there is far more (±323 world units) than width. */
            const slot = span / gCount;
            /* 78 for `named`, and it is arithmetic rather than taste: a
               plate is 44 at scale 1.1 = 48, the flex gap under it is 4, and
               a tag is 14 — a 66-unit stack, which a 64 pitch overlaps into
               the plate below. The first pass measured tag-vs-TAG collisions
               and reported none, because the collision was tag-vs-plate. */
            const vGap = st === "named" ? 78 : 54;
            /* COLUMNS HANG FROM A SHARED TOP, they are not each centred on
               zero. Centred was the first version and it put a two-mark
               column's first plate far below a four-mark column's, so the
               labels — which share one baseline, deliberately, to stay in a
               tidy row — ended up a long way above the short columns with
               nothing but air between. Aligning the tops means every label
               sits the same fixed distance above its own column, and the
               tallest column stays centred in the stage. */
            /* A COLUMN HAS A HEIGHT LIMIT, AND TALL GROUPS SPLIT. Web
               Development's "Frontend frameworks" is six marks; at the named
               pitch that is a 390-unit column, which pushed its neighbour's
               label 11px off the TOP of the stage — the only clip left once
               everything else was fixed. So a column holds at most `cap`
               marks, and a larger group becomes two sub-columns side by side
               inside its own slot. The slot is 134+ units wide at four groups,
               comfortably enough for two 58-unit tags. */
            const cap = st === "named" ? 4 : 6;
            const subCols = (n: number) => (n > cap ? 2 : 1);
            const perCol = (n: number) => Math.ceil(n / subCols(n));
            const tallest = Math.max(...counts.map(perCol));
            const topY = ((tallest - 1) * vGap) / 2;

            ALL.forEach((t, i) => {
              if (t.service !== s) {
                targets[i] = outward(sphereAt(i, 330));
                scales[i] = 0.5;
                opac[i] = 0.1;
                return;
              }
              const g = t.group;
              const n = counts[g];
              const k = seen[g]++;
              const sc = subCols(n);
              const pc = perCol(n);
              const sub = Math.floor(k / pc);
              const row = k % pc;
              /* ±22% of the slot for the pair — wide enough to part two tags,
                 narrow enough that the pair still reads as ONE group. */
              const offset = sc === 1 ? 0 : (sub === 0 ? -1 : 1) * slot * 0.22;
              const theta = -span / 2 + slot * (g + 0.5) + offset;
              /* LEVEL ON SCREEN, NOT IN THE WORLD. Every column shares the
                 same world top, but the outer columns sit further back on the
                 arc (z = R·cos θ − R), and perspective draws a deeper point
                 lower: screen y ∝ y / (CAM_Z − z). So equal world tops read
                 as a shallow curve, the outer columns sagging, and the leader
                 lines inherited it. Scaling each column's y by
                 (CAM_Z − z) / CAM_Z cancels the perspective exactly, so every
                 column projects to the same top and the same height. The arc
                 stays an arc in depth; only its silhouette is straightened. */
              const zCol = ARC_R * Math.cos(theta) - ARC_R;
              const level = (CAM_Z - zCol) / CAM_Z;
              const y = (topY - row * vGap) * level;

              targets[i] = onArc(theta, y);
              scales[i] = pick === i ? 1.5 : 1.1;
              opac[i] = 1;
              members[g].push(i);
              if (k === 0) anchors[g] = targets[i].p.clone();
            });
          } else {
            /* ── MARKS ALONG THE ARC ────────────────────────────────────────
               The original. `named` caps a row at two marks and takes the
               extra row, because a tag is wider than its plate and a
               four-mark run turns into one dark bar otherwise.

               ANGULAR WIDTH IS ALLOCATED BY COLUMN, NOT BY MARK. Proportional
               to mark count starves any group that wraps: a two-mark and a
               four-mark group both occupy one column of width once `named`
               puts two per row, but the four-mark group was handed twice the
               arc for it. Columns are what sit side by side, so columns are
               what the arc is divided between. */
            const rowsOf = (n: number) =>
              st === "named" ? (n > 2 ? Math.ceil(n / 2) : 1) : n > 4 ? 2 : 1;
            const rowGap = st === "named" ? 82 : 68;
            const cols = counts.map((n) => Math.ceil(n / rowsOf(n)));
            const totalCols = cols.reduce((a, b) => a + b, 0);
            const bounds: [number, number][] = [];
            let acc = -span / 2;
            cols.forEach((c) => {
              const w = (c / totalCols) * span;
              bounds.push([acc, acc + w]);
              acc += w;
            });

            ALL.forEach((t, i) => {
              if (t.service !== s) {
                targets[i] = outward(sphereAt(i, 330));
                scales[i] = 0.5;
                opac[i] = 0.1;
                return;
              }
              const g = t.group;
              const n = counts[g];
              const rows = rowsOf(n);
              const perRow = Math.ceil(n / rows);
              const k = seen[g]++;
              const row = Math.floor(k / perRow);
              const col = k % perRow;
              const inRow = Math.min(perRow, n - row * perRow);

              const [t0, t1] = bounds[g];
              const step = (t1 - t0) / perRow;
              const runW = step * inRow;
              const start = t0 + (t1 - t0 - runW) / 2;
              const theta = start + step * (col + 0.5);
              const y =
                (rows === 1 ? 0 : ((rows - 1) * rowGap) / 2) - row * rowGap;

              targets[i] = onArc(theta, y);
              scales[i] = pick === i ? 1.6 : 1.18;
              opac[i] = 1;
              members[g].push(i);
              if (col === Math.floor((inRow - 1) / 2) && row === 0) {
                anchors[g] = targets[i].p.clone();
              } else if (!anchors[g]) {
                anchors[g] = targets[i].p.clone();
              }
            });
          }

          /* LABELS ARE PROJECTED OVER THEIR GROUP, THEN SEPARATED.
             Projection alone is not enough. Four group labels on this arc
             want roughly 150 world units each — 600 in total — against the
             408 the label plane actually offers, so some pair always
             collides and the outermost one hangs off the stage. A fixed
             two-level stagger was the first attempt and it still overlapped
             "Ruby ecosystem" with "Python ecosystem", because staggering
             fixes the count, not the widths.

             So: alternate rows, then run a real separation pass along each
             row — sort by x, push any touching pair apart, clamp to the
             frustum, then sweep back the other way so the clamp cannot
             re-introduce an overlap it just fixed. It is the same nudge that
             chart libraries use on axis labels, and it is why the leader
             lines matter: a label that has been pushed off its group is
             still unambiguous as long as something points back. */
          const halfH =
            (CAM_Z - LABEL_Z) *
            Math.tan(((camera.fov / 2) * Math.PI) / 180);
          const halfW = halfH * camera.aspect;
          const lScale = (CAM_Z - LABEL_Z) / CAM_Z;
          const GAP = 10;

          /* ONE BASELINE FOR ALL LABELS, taken from the tallest group. Using
             each group's own anchor height put a one-row group's label lower
             than a two-row group's, so the two stagger levels stopped being
             two levels and a short group's upper label could sit at the same
             height as a tall group's lower one — which is exactly the overlap
             the separation pass cannot see, because it works within a row. */
          /* ONE STRAIGHT ROW, LEVEL LEADERS, AND EVERY NUMBER MEASURED.

             PLATE TOP IS READ FROM THE DOM. Each mark is a stack — plate, a
             4px gap, and the name tag, which is invisible outside `named` but
             still takes its height — and CSS3DObject centres the whole stack
             on the anchor. So the plate's top edge is half the STACK above
             the anchor, not half the plate: the first pass assumed 24 and the
             truth was ~34, which is why the leader's "gap" measured 2px.

             LABELS WRAP TO THEIR COLUMN before anything is nudged. A label's
             max-width is set to the room it actually has — the distance to
             the neighbouring column, or twice the distance to the stage edge
             — so "Containers & orchestration" breaks onto two lines instead
             of colliding with its neighbour. That is what keeps every label
             over its own column and every leader vertical; the old behaviour
             either staggered a second row (the arch you saw) or pushed a
             label sideways and tilted its leader by up to 25px.

             LABELS ARE BOTTOM-ALIGNED, because the leader starts at the
             bottom edge. Centre-aligned, a two-line label's bottom sat lower
             than a one-line label's, so the leader starts were ragged even
             when the centres agreed.

             A second row survives only as the last resort: if the wrapped
             labels still cannot fit side by side at all. */
          const tOf = (a: THREE.Vector3) => (CAM_Z - LABEL_Z) / (CAM_Z - a.z);
          const plateTops = anchors.map((a, gi) => {
            const mi = members[gi][0];
            const stackH = plates[mi].offsetHeight;
            return project(a).y + (stackH / 2) * scales[mi] * tOf(a);
          });
          const baseline = Math.max(...plateTops) + 58;

          const colX = anchors.map((a) => project(a).x);
          for (let gi = 0; gi < gCount; gi++) {
            labelEls[gi].textContent = cap.stack[gi].group;
            labelEls[gi].style.opacity = "1";
            const left = gi > 0 ? colX[gi] - colX[gi - 1] : Infinity;
            const right = gi < gCount - 1 ? colX[gi + 1] - colX[gi] : Infinity;
            const edge = 2 * (halfW - Math.abs(colX[gi])) - 4;
            const roomUnits = Math.min(left - GAP, right - GAP, edge);
            const roomPx = roomUnits / lScale;
            labelEls[gi].style.maxWidth = `${Math.max(72, Math.min(150, roomPx))}px`;
          }
          const widths = Array.from(
            { length: gCount },
            (_, gi) => labelEls[gi].offsetWidth * lScale,
          );
          const heights = Array.from(
            { length: gCount },
            (_, gi) => labelEls[gi].offsetHeight * lScale,
          );
          const needed =
            widths.reduce((a, b) => a + b, 0) + GAP * (gCount - 1) + 8;
          const oneRow = needed <= halfW * 2;
          const rowStep = Math.max(...heights) + 8;

          const rows: { gi: number; x: number; w: number }[][] = [[], []];
          for (let gi = 0; gi < gCount; gi++) {
            const rowIdx = oneRow ? 0 : gi % 2;
            labelTargets[gi].set(
              colX[gi],
              baseline + rowIdx * rowStep + heights[gi] / 2,
              LABEL_Z,
            );
            rows[rowIdx].push({ gi, x: colX[gi], w: widths[gi] });
          }
          for (const row of rows) {
            row.sort((a, b) => a.x - b.x);
            for (let i = 1; i < row.length; i++) {
              const min = row[i - 1].x + (row[i - 1].w + row[i].w) / 2 + GAP;
              if (row[i].x < min) row[i].x = min;
            }
            /* Clamp the right-most, then sweep left so the clamp does not
               shove it back onto its neighbour. */
            for (let i = row.length - 1; i >= 0; i--) {
              const lim = halfW - row[i].w / 2 - 2;
              if (row[i].x > lim) row[i].x = lim;
              if (i > 0) {
                const max = row[i].x - (row[i].w + row[i - 1].w) / 2 - GAP;
                if (row[i - 1].x > max) row[i - 1].x = max;
              }
              if (row[i].x < -halfW + row[i].w / 2 + 2) {
                row[i].x = -halfW + row[i].w / 2 + 2;
              }
            }
            for (const it of row) labelTargets[it.gi].x = it.x;
          }
          for (let gi = gCount; gi < labelEls.length; gi++) {
            labelEls[gi].style.opacity = "0";
          }

          /* Per-mark names, only where the treatment asks for them. */
          nameTags.forEach((tag, i) => {
            tag.style.opacity = st === "named" && ALL[i].service === s ? "1" : "0";
          });

          /* ---- the connecting marks -------------------------------------- */
          if (st === "leader" || st === "spokes" || st === "bracket") {
            for (let gi = 0; gi < gCount; gi++) {
              /* Origin is the SEPARATED label position, not the projected
                 one — the whole point of the lines is to reconnect a label
                 the separation pass moved. */
              const from = labelTargets[gi].clone();
              /* GAPS AT BOTH ENDS, FROM MEASURED EDGES. The line starts
                 GAP_START below the label's real bottom (bottom-aligned, so
                 identical for every label in the row) and stops GAP_END above
                 the plate's real top. In this plane one unit is ~0.83px on the
                 420px stage, so the icon gap is ~12px and the label gap ~7px:
                 enough that label, line and icon read as three things. */
              const GAP_START = 8;
              const GAP_END = 14;
              from.y = labelTargets[gi].y - heights[gi] / 2 - GAP_START;
              if (st === "leader") {
                const to = project(anchors[gi].clone());
                to.y = plateTops[gi] + GAP_END;
                /* The end is always the column's own x. When the label sits
                   over its column this is a vertical stroke; when the
                   separation pass had to nudge a label sideways, the line
                   leans back to the column it names instead of missing it. */
                to.x = project(anchors[gi]).x;
                drawLine(from, to);
              } else if (st === "spokes") {
                for (const i of members[gi]) {
                  const to = project(targets[i].p.clone());
                  /* In a column the spokes arrive at the plate's SIDE, not
                     its top — aiming every one at the top of a stacked mark
                     means the lower spokes run straight through the plates
                     above them. */
                  if (ax === "column") to.x += 26;
                  else to.y += 24;
                  drawLine(from, to);
                }
              } else {
                /* BRACKET, AND IT TURNS WITH THE AXIS. A group laid along the
                   arc is a horizontal range, so its bracket is a rule across
                   the top with downward ticks. A group stacked in a column is
                   a VERTICAL range, and a horizontal rule over a one-plate
                   width is not a bracket, it is a dash. So the column form is
                   a rule down the side with inward ticks at each end. */
                const pts = members[gi].map((i) => project(targets[i].p));
                if (!pts.length) continue;
                if (ax === "column") {
                  const x = Math.min(...pts.map((p) => p.x)) - 30;
                  const lo = Math.min(...pts.map((p) => p.y)) - 16;
                  const hi = Math.max(...pts.map((p) => p.y)) + 16;
                  drawLine(tmpA.set(x, lo, 0), tmpB.set(x, hi, 0));
                  drawLine(tmpA.set(x, hi, 0), tmpB.set(x + 12, hi, 0));
                  drawLine(tmpA.set(x, lo, 0), tmpB.set(x + 12, lo, 0));
                } else {
                  const lo = Math.min(...pts.map((p) => p.x)) - 16;
                  const hi = Math.max(...pts.map((p) => p.x)) + 16;
                  const y = from.y - 8;
                  drawLine(tmpA.set(lo, y, 0), tmpB.set(hi, y, 0));
                  drawLine(tmpA.set(lo, y, 0), tmpB.set(lo, y - 12, 0));
                  drawLine(tmpA.set(hi, y, 0), tmpB.set(hi, y - 12, 0));
                }
              }
            }
          }
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
      const moved = { v: false };
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      const idle = reduced ? 0 : 0.0013;
      let velX = idle;
      let velY = 0;

      const down = (e: PointerEvent) => {
        dragging = true;
        moved.v = false;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        if (Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 3) {
          moved.v = true;
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
      const tick = () => {
        const sig = `${svcRef.current}|${styleRef.current}|${axisRef.current}|${pickRef.current}`;
        if (sig !== lastSig) {
          lastSig = sig;
          recompute();
        }
        const ease = reduced ? 1 : 0.09;
        for (let i = 0; i < objs.length; i++) {
          objs[i].position.lerp(targets[i].p, ease);
          objs[i].quaternion.slerp(targets[i].q, ease);
        }
        for (let i = 0; i < labelObjs.length; i++) {
          labelObjs[i].position.lerp(labelTargets[i], ease);
        }

        /* An open arc holds still — that is its whole claim, and a fan that
           drifts away is no longer readable without rotation. */
        const open = svcRef.current !== null;
        if (open && !dragging) {
          group.rotation.y += (0 - group.rotation.y) * 0.1;
          group.rotation.x += (0 - group.rotation.x) * 0.1;
          velX = 0;
          velY = 0;
        } else {
          if (!dragging) {
            velX += (idle - velX) * 0.03;
            velY += (0 - velY) * 0.05;
          }
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
          <>drag to spin · pick a service to open the arc</>
        )}
      </p>

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
                  {c.stack.length}g ·{" "}
                  {c.stack.reduce((n, g) => n + g.items.length, 0)}
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
