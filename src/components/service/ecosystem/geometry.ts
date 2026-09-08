/* ==========================================================================
   ECOSYSTEM GEOMETRY — shared by all three layout variants.
   ==========================================================================
   Measured from the reference diagram (conversedatasolutions.com/about, the
   "Connecting Seamlessly" section) with Playwright on 2026-09-08. These are
   computed values off the live DOM, not estimates:

     · three concentric rings at diameters 300 / 450 / 600 → radii 150/225/300
     · six satellites at EXACTLY 60° intervals
     · but at ALTERNATING radii — measured 180, 240, 169, 218, 162, 237, i.e.
       ~170 and ~235 alternating around the circle. This is the whole trick:
       a single radius reads as a clock face, the alternation reads as a
       system. Copy it.
     · satellites are 56×56 tinted icon tiles with a label pill BENEATH
     · connectors are 1.5px lines from satellite to core at 15% opacity,
       drawn on with a pathLength-normalised dash

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

/** Faint concentric rings, in the reference's 150/225/300 ratio plus one
    outer ring that contains the level-3 technology plates. */
export const RINGS = [150, 225, 300, 456] as const;

/** Six services, 60° apart, starting at the top. */
export const SERVICE_ANGLES = [-90, -30, 30, 90, 150, 210] as const;

/** The alternation. Even indices sit closer in, odd indices further out. */
export const SERVICE_RADII = [178, 240, 178, 240, 178, 240] as const;

/** Where each level lives when a service is expanded.

    Group pills ALTERNATE radius, for the same reason the services do: four
    pills fanned across one sector are 40° apart, and the longest label
    ("Containers & orchestration") is ~175px wide — at a single radius they
    collided, measured. Alternating them buys 211px of centre-to-centre
    separation instead of 129px. */
/* 270/306, not 258/300. A dimmed service cannot retreat any further than
   0.62 of its radius without touching the core, so the clearance between a
   retreated neighbour and the open branch has to be bought at the group ring
   instead: "Mobile App Development" and "Node.js ecosystem" overlapped by one
   pixel of box at 258. */
/* 292/326, out from 270/306. The circular group node is 100px across, so its
   inner edge reaches 50px further in than a pill ever did, and in the bloom
   layout that put it into the open service label sitting just below its tile.
   Checked the other way too: 424 - 326 = 98 units of gap to the marks, and a
   circle half (58 units) plus a mark half (23) is 81. */
export const LEVEL_2_RADII = [292, 326] as const;
/* 424, not 392. A group pill is ~140px wide and its own marks sit directly
   outward of it, so the boxes are near-concentric: at an 80px radial gap the
   pill's corner clipped the plate beside its centre mark ("ML frameworks"
   over "PyTorch", measured). The gap is now 118px at the outer pill radius
   and 154px at the inner one, which clears the widest pill. */
/* 456, out from 424. Pushing the group ring out for the 100px circular node
   simply moved the collision outward - the disc then met its own first mark.
   Level 3 has to move with it. 456 + a 23-unit mark half is 479, inside the
   500-unit half-stage with 21 units to spare, so this is the last move the
   stage can absorb: a bigger group node than this needs a bigger stage. */
export const LEVEL_3_RADIUS = 456; // the technology plates

/** Where the OPEN service sits. All six converge on this radius when opened,
    so the branch always starts the same distance from the core and the group
    ring is always clear of the service's own label. The alternation below is
    a resting-state pleasure, not a layout the branch can depend on. */
export const OPEN_SERVICE_RADIUS = 178;

/** How far the five closed services retreat, as a fraction of their own
    radius. 0.62 puts them at 110/149 — inside the group ring at 280 by a
    131px margin, which is what stops a dimmed neighbour colliding with the
    open branch. Measured; do not raise it without re-running the overlap
    assertion. */
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

/* ── THE ANGULAR BUDGET ────────────────────────────────────────────────────
   Six services at 60° each. When one opens, the other five are dimmed, shrunk
   to their icon alone and pulled to 0.62 of their radius — so the open branch
   may BORROW their angle and gets 150°, not 60°.

   The first build used 116° and it was not enough: measured on the running
   page, the four group pills of Cloud Infrastructure collided with each other
   and CircleCI collided with Prometheus across the group gutter. 150° plus
   the alternating pill radii above clears both.

   The worst case is Cloud Infrastructure & DevOps — 4 groups, and one of them
   (CI/CD & automation) holds 4 marks. At LEVEL_3_RADIUS = 424 a 150° sector
   is an arc of 2π · 424 · (150/360) ≈ 1110px; each group owns 277px and its
   marks use 84% of it, so four 32px plates sit ~54px apart. The inter-group
   gutter is the remaining 16% ≈ 41px, which is what makes the grouping
   legible without drawing a divider. Verified by the overlap assertion in
   `.services.mjs` — it counts intersecting boxes and fails on one. */
export const SECTOR = 150;

/** The centre angle of each group's slice.

    THIS MUST AGREE WITH `techAngles` AND ORIGINALLY DID NOT. The first build
    fanned the pills across 80% of the sector while their technologies were
    centred on equal slices - so for a two-group service the pills sat at
    plus/minus 60 degrees while their own marks sat at plus/minus 37.5, and a
    pill ended up leaning over a neighbouring group's plates ("Development
    tools" collided with "VS Code", measured). A pill now sits exactly inward
    of the marks it labels, which is also the only arrangement a reader can
    interpret. */
export function groupAngles(serviceAngle: number, groupCount: number): number[] {
  const slice = SECTOR / groupCount;
  return Array.from(
    { length: groupCount },
    (_, i) => serviceAngle - SECTOR / 2 + slice * (i + 0.5),
  );
}

/** Group pills alternate between the two radii — see LEVEL_2_RADII. */
export function groupRadius(groupIndex: number): number {
  return LEVEL_2_RADII[groupIndex % 2];
}

/** The angles of one group's technology plates. Each group owns an equal
    slice of the sector; its items fill 84% of that slice, which leaves a
    visible gutter between adjacent groups so the grouping is readable
    without drawing a divider. */
export function techAngles(
  serviceAngle: number,
  groupIndex: number,
  groupCount: number,
  itemCount: number,
): number[] {
  const slice = SECTOR / groupCount;
  const centre = serviceAngle - SECTOR / 2 + slice * (groupIndex + 0.5);
  /* 0.78, not 0.84. The marks grew from a 36px square to a 40px circle when
     level 3 stopped being a badge, and the extra 4px was spent exactly at the
     group boundaries: the last mark of one group met the first of the next.
     Measured - Google Cloud on Docker, CircleCI on Prometheus, Rails on
     Python. The items now fill 78% of their slice, which puts 53px of arc in
     the gutter against a 40px mark, and still leaves 62px between marks
     inside a group. Re-run the overlap assertion if the mark size changes
     again; this number is a function of it. */
  return fan(centre, itemCount, slice * 0.78);
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

/** True when a node sits on the left half of the stage, so its label can be
    right-aligned and its leader line drawn the other way. */
export function isLeft(degrees: number): boolean {
  const c = Math.cos((degrees * Math.PI) / 180);
  return c < -0.15;
}

/** Nodes near the top or bottom need their label placed above/below rather
    than beside, or it collides with the node itself. */
export function isVertical(degrees: number): boolean {
  return Math.abs(Math.cos((degrees * Math.PI) / 180)) < 0.35;
}
