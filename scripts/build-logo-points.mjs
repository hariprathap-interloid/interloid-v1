/* ==========================================================================
   build-logo-points — generates public/logo-points.json from the logo art.

   The hero mark (src/components/HeroScatter.tsx) is drawn as a grid of square
   particles. This script decides where those squares go and what colour each
   one is, by rasterising public/interloid-logo.svg.

     npm run logo:points          rewrite public/logo-points.json
     npm run logo:points:check    exit 1 if the file is out of date

   Rerun it whenever the logo artwork changes, or to change GRID. Each rule
   below fixes a defect that was visible on screen before it existed:

   1. EXACT GRID. One point per cell, at the cell's exact centre, carrying its
      integer cell (gx, gy). An earlier jittered sampling could never line up
      in rows, and the component's phone thinning keeps every k-th row and
      column by gx/gy.
   2. MOSTLY-INK CELLS ONLY. A cell is kept when at least MIN_COVER of its
      probes are logo ink. Anything laxer leaves a fringe of stray squares
      just outside the silhouette.
   3. COLOUR FROM INK ONLY. Averaging only saturated probes stops the
      anti-aliased rim — half logo, half white background — from producing
      pale grey squares along the edge.
   4. FILL ENCLOSED POCKETS. Where the cyan ring crosses the blue one the art
      has a near-white glossy highlight; rule 2 drops those cells and leaves
      a white notch. Empty regions that are fully enclosed and no bigger than
      MAX_POCKET are filled from their neighbours. The three counters (the
      smallest is 50 cells) and the outline notches (part of the outside,
      which reaches the grid edge) are left alone.

   Rasterises with Playwright's Chromium (already a devDependency), serving the
   SVG from an intercepted origin so no dev server is needed and the canvas is
   never tainted. Deterministic: the same art always produces the same bytes,
   which is what makes --check meaningful.

   Deliberately a build step and not runtime code: sampling in the browser
   would mean every visitor downloading the 568KB SVG just to colour squares.
   ========================================================================== */
import { chromium } from "playwright";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SVG_PATH = path.join(ROOT, "public", "interloid-logo.svg");
const OUT_PATH = path.join(ROOT, "public", "logo-points.json");

const GRID = 72; /* cells across the mark */
const RASTER = 720; /* canvas size — 10px of artwork per cell */
const PROBES = 5; /* PROBES x PROBES samples per cell */
const INK_SPREAD = 70; /* max-min channel spread that counts as logo ink */
const MIN_COVER = 0.5; /* rule 2 */
const MAX_POCKET = 20; /* rule 4 — well under the smallest counter (50) */

/* Rules 1-3: one [gx, gy, r, g, b] per kept cell, in row-major order. */
async function rasterise() {
  const svg = readFileSync(SVG_PATH);
  const origin = "http://logo.local";
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route(`${origin}/**`, (route) =>
      new URL(route.request().url()).pathname === "/logo.svg"
        ? route.fulfill({ body: svg, contentType: "image/svg+xml" })
        : route.fulfill({
            body: "<!doctype html><title>logo</title>",
            contentType: "text/html",
          }),
    );
    await page.goto(`${origin}/`);
    return await page.evaluate(
      async ({ GRID, RASTER, PROBES, INK_SPREAD, MIN_COVER }) => {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("logo SVG failed to load"));
          img.src = "/logo.svg";
        });
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = RASTER;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, RASTER, RASTER);
        const px = ctx.getImageData(0, 0, RASTER, RASTER).data;
        const cell = RASTER / GRID;
        const kept = [];
        for (let gy = 0; gy < GRID; gy++) {
          for (let gx = 0; gx < GRID; gx++) {
            let ink = 0;
            let r = 0;
            let g = 0;
            let b = 0;
            for (let sy = 0; sy < PROBES; sy++) {
              for (let sx = 0; sx < PROBES; sx++) {
                const u = Math.min(
                  RASTER - 1,
                  Math.floor(gx * cell + ((sx + 0.5) * cell) / PROBES),
                );
                const v = Math.min(
                  RASTER - 1,
                  Math.floor(gy * cell + ((sy + 0.5) * cell) / PROBES),
                );
                const k = (v * RASTER + u) * 4;
                const spread =
                  Math.max(px[k], px[k + 1], px[k + 2]) -
                  Math.min(px[k], px[k + 1], px[k + 2]);
                if (spread >= INK_SPREAD) {
                  ink++;
                  r += px[k];
                  g += px[k + 1];
                  b += px[k + 2];
                }
              }
            }
            if (ink / (PROBES * PROBES) < MIN_COVER) continue;
            kept.push([
              gx,
              gy,
              Math.round(r / ink),
              Math.round(g / ink),
              Math.round(b / ink),
            ]);
          }
        }
        return kept;
      },
      { GRID, RASTER, PROBES, INK_SPREAD, MIN_COVER },
    );
  } finally {
    await browser.close();
  }
}

/* Rule 4: [gx, gy, r, g, b] for each filled pocket cell. */
function fillPockets(kept) {
  const ink = new Uint8Array(GRID * GRID);
  const colour = new Array(GRID * GRID);
  for (const [gx, gy, r, g, b] of kept) {
    ink[gy * GRID + gx] = 1;
    colour[gy * GRID + gx] = [r, g, b];
  }

  /* 4-connected empty regions. A pocket never reaches the grid edge and is
     small; the outside always reaches the edge, and the counters are large. */
  const label = new Int32Array(GRID * GRID).fill(-1);
  const pockets = [];
  let regions = 0;
  for (let s = 0; s < GRID * GRID; s++) {
    if (ink[s] || label[s] >= 0) continue;
    const id = regions++;
    const stack = [s];
    const members = [];
    let reachesEdge = false;
    label[s] = id;
    while (stack.length) {
      const k = stack.pop();
      members.push(k);
      const x = k % GRID;
      const y = (k - x) / GRID;
      if (x === 0 || y === 0 || x === GRID - 1 || y === GRID - 1) {
        reachesEdge = true;
      }
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
        const nk = ny * GRID + nx;
        if (!ink[nk] && label[nk] < 0) {
          label[nk] = id;
          stack.push(nk);
        }
      }
    }
    if (!reachesEdge && members.length <= MAX_POCKET) pockets.push(...members);
  }

  /* Colour each cell from its inked neighbours. Most-surrounded first, so a
     cell with no direct ink neighbour can borrow from one already filled. */
  const neighbours = (k) => {
    const x = k % GRID;
    const y = (k - x) / GRID;
    const out = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
        const nk = ny * GRID + nx;
        if (ink[nk]) out.push(colour[nk]);
      }
    }
    return out;
  };
  const filled = [];
  const pending = [...pockets];
  while (pending.length) {
    pending.sort((a, b) => neighbours(b).length - neighbours(a).length);
    const k = pending.shift();
    const n = neighbours(k);
    if (!n.length) throw new Error(`pocket cell ${k} has no inked neighbour`);
    const avg = [0, 1, 2].map((c) =>
      Math.round(n.reduce((sum, v) => sum + v[c], 0) / n.length),
    );
    ink[k] = 1;
    colour[k] = avg;
    filled.push([k % GRID, (k - (k % GRID)) / GRID, ...avg]);
  }
  return filled;
}

function serialise(points) {
  const centre = (i) => -1 + ((i + 0.5) * 2) / GRID;
  const data = {
    count: points.length,
    grid: GRID,
    pos: [],
    col: [],
    gx: [],
    gy: [],
  };
  for (const [gx, gy, r, g, b] of points) {
    /* x runs left to right, y bottom to top, both in [-1, 1] */
    data.pos.push(+centre(gx).toFixed(5), +(-centre(gy)).toFixed(5));
    data.col.push(r, g, b);
    data.gx.push(gx);
    data.gy.push(gy);
  }
  return JSON.stringify(data);
}

/* A readable account of how an existing file differs, for --check. */
function describeDrift(current, next) {
  let old;
  try {
    old = JSON.parse(current);
  } catch {
    return "  the current file is missing or not valid JSON";
  }
  if (!old.gx || !old.gy || old.grid !== next.grid) {
    return "  the current file was not generated by this script (no grid indices, or a different GRID)";
  }
  const index = (d) => {
    const m = new Map();
    for (let i = 0; i < d.count; i++) {
      m.set(`${d.gx[i]},${d.gy[i]}`, d.col.slice(i * 3, i * 3 + 3).join(","));
    }
    return m;
  };
  const a = index(old);
  const b = index(next);
  const onlyOld = [...a.keys()].filter((k) => !b.has(k));
  const onlyNew = [...b.keys()].filter((k) => !a.has(k));
  const recoloured = [...a.keys()].filter(
    (k) => b.has(k) && a.get(k) !== b.get(k),
  );
  const list = (cells) =>
    cells.length
      ? `  (${cells.slice(0, 12).join("  ")}${cells.length > 12 ? " ..." : ""})`
      : "";
  const lines = [
    `  points: ${old.count} in the file, ${next.count} generated`,
    `  cells only in the file:        ${onlyOld.length}${list(onlyOld)}`,
    `  cells only when generated:     ${onlyNew.length}${list(onlyNew)}`,
    `  cells with a different colour: ${recoloured.length}`,
  ];
  if (!onlyOld.length && !onlyNew.length && !recoloured.length) {
    lines.push("  same cells and colours — only point order or formatting differs");
  }
  return lines.join("\n");
}

const kept = await rasterise();
const filled = fillPockets(kept);
const json = serialise([...kept, ...filled]);
const summary = `${kept.length} grid cells + ${filled.length} filled pocket cells = ${kept.length + filled.length} points`;

if (process.argv.includes("--check")) {
  const current = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, "utf8") : "";
  if (current === json) {
    console.log(`logo-points.json is up to date (${summary}).`);
  } else {
    console.error(
      `logo-points.json is OUT OF DATE — run \`npm run logo:points\`.\n${describeDrift(current, JSON.parse(json))}`,
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(OUT_PATH, json);
  console.log(`wrote public/logo-points.json: ${summary}.`);
}
