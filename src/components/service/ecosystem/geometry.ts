/* ==========================================================================
   ECOSYSTEM GEOMETRY
   ==========================================================================
     · concentric backdrop rings at radii 150/225/300 (plus an outer ring)
     · six services at exactly 60° intervals, on alternating radii — a single
       radius reads as a clock face; the alternation reads as a system
     · services are 56×56 icon tiles with a label pill beneath
     · connectors are 1.5px lines to the core, drawn on with a
       pathLength-normalised dash

   ── WHY PERCENTAGES, NOT PIXELS ──────────────────────────────────────────
   Everything here returns a position as a PERCENTAGE of a square stage. The
   stage is `aspect-square` and fluid, so one set of numbers serves every
   viewport above the mobile breakpoint without a resize observer or a
   transform: scale() that would blur text. STAGE is the logical unit the
   radii are expressed in; it never reaches the DOM.

   ── ANGLES ───────────────────────────────────────────────────────────────
   SVG/CSS screen coordinates: 0° points right, angles increase CLOCKWISE
   because y grows downward. -90° is straight up. Service 0 sits at the top
   and they run clockwise, which is the reading order a viewer expects.
   ========================================================================== */

/** The logical square the radii below are expressed in. */
export const STAGE = 1000;

/** Faint concentric rings: 150/225/300 plus one outer ring that contains the
    level-3 technology plates. */
export const RINGS = [150, 225, 300, 456] as const;

/** Six services, 60° apart, starting at the top. */
export const SERVICE_ANGLES = [-90, -30, 30, 90, 150, 210] as const;

/** The alternation. Even indices sit closer in, odd indices further out. */
export const SERVICE_RADII = [178, 240, 178, 240, 178, 240] as const;


/** How far the five closed services retreat, as a fraction of their own
    radius. 0.62 puts them at 110/149, well inside the group ring, which is
    what stops a dimmed neighbour colliding with the open branch. Raising it
    requires re-checking node overlap. */
export const CLOSED_SERVICE_FACTOR = 0.62;

export type Point = { x: number; y: number };

/** Polar → a percentage position on the square stage. */
export function polar(radius: number, degrees: number): Point {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: 50 + ((radius * Math.cos(rad)) / STAGE) * 100,
    y: 50 + ((radius * Math.sin(rad)) / STAGE) * 100,
  };
}

/** The same thing in raw stage units, for drawing inside an SVG whose
    viewBox is `0 0 STAGE STAGE`. */
export function polarUnits(radius: number, degrees: number): Point {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: STAGE / 2 + radius * Math.cos(rad),
    y: STAGE / 2 + radius * Math.sin(rad),
  };
}

/** `count` items spread symmetrically across `spread` degrees, centred on
    `centre`. One item lands exactly on the centre line rather than being
    offset by half a step — a single group must point straight out from its
    service or the branch looks broken. */
export function fan(centre: number, count: number, spread: number): number[] {
  if (count <= 1) return [centre];
  const step = spread / (count - 1);
  return Array.from({ length: count }, (_, i) => centre - spread / 2 + i * step);
}

/** Shorten a segment so it stops `r1` short of its start and `r2` short of
    its end, both in STAGE UNITS. Returns the segment unchanged if the two
    radii would consume it, which is the degenerate case worth failing safe on
    rather than drawing a line that points backwards.

    Node sizes are CSS px and the stage is a percentage box, so a caller has to
    convert: `pxToUnits(px, stagePx)` below. Passing raw pixels here silently
    over-trims on a small stage and under-trims on a large one. */
export function trim(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1 = 0,
  r2 = 0,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0 || r1 + r2 >= len) return { x1, y1, x2, y2 };
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * r1,
    y1: y1 + uy * r1,
    x2: x2 - ux * r2,
    y2: y2 - uy * r2,
  };
}

/** A CSS pixel measurement expressed in stage units. */
export function pxToUnits(px: number, stagePx: number): number {
  return (px / stagePx) * STAGE;
}
