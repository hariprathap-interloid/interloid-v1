"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import { EcosystemList } from "../service/ecosystem/parts";
import TechLogo from "../service/TechLogo";
import { CAPABILITIES } from "@/content/service";
import { HUE } from "@/content/site";
import type { Capability } from "@/content/service";

/* The sphere pulls three.js in. `ssr: false` and a dynamic import keep the
   library out of this route's server render AND out of its first-paint bundle
   — a lab that costs 150KB to open the page on is not a fair comparison of
   five layouts that cost nothing. */
const StackSphere = dynamic(() => import("./StackSphere"), {
  ssr: false,
  loading: () => (
    <p className="grid h-[360px] place-items-center rounded-[1.25rem] border border-border bg-card text-[12px] text-muted-foreground">
      loading three.js…
    </p>
  ),
});

/* ==========================================================================
   "PROVEN TECHNOLOGY STACKS" ON A PHONE — the specimen set for /stack-lab.
   ==========================================================================
   Below `lg` the ecosystem map is replaced by `EcosystemList` in
   ecosystem/parts.tsx: six cards, every group open, everything on screen at
   once. It is honest and it is accessible, and it is also the dullest thing
   on the page in the one place the section has the least room. Measured on a
   390x844 phone:

     4031px tall  ·  4.8 screens  ·  19% of the whole /services page
     6 services  ·  20 group headings  ·  62 technology chips

   Four fifths of a page-height of flat list, with nothing to do and no
   hierarchy past the service name. The desktop version of this section is
   the most striking object on the site; the phone version is a directory.

   ── WHAT IS ACTUALLY BEING CHOSEN ────────────────────────────────────────
   Not "which looks nicest" — every variant here shows the SAME 62 marks. The
   question is what a phone reader is doing in this section. If they are
   scanning for one stack they already use ("do they do Django?"), the full
   list wins and interaction is in the way. If they are forming an impression
   of range, the compact ones win and the list is four screens of scrolling
   past the answer. The height readout under the frame is the honest
   comparator; pick against a reader, not against a screenshot.

   ── THE FRAME IS 390px AND THAT IS THE POINT ─────────────────────────────
   These are judged at the width they ship at. A mobile composition reviewed
   on a 1440px desktop is reviewed as a narrow column, which is a different
   thing — the fingers, the reach and the scroll cost are all missing. Open
   this page on a real handset as well before deciding.

   ── DECIDED 2026-09-12: THE ACCORDION ────────────────────────────────────
   1041px against the list's 3294px in this frame, and live on /services it
   takes the whole section from 4031px to 1754px — 4.8 phone screens down to
   2.1, 19% of the page down to 9%. It is the only compact option that still
   shows all six service names at once without a swipe.

   The other ten stay for the phase-2 review. Note their heights are measured
   in the frame and exclude the section's own heading and padding, which is
   why the live figure is larger than the number shown here.

   Not linked, noindex.
   ========================================================================== */

export const STACK_VARIANTS = [
  {
    key: "list",
    name: "Full list",
    note: "What ships today. Every service, every group, every mark, all open. Nothing to learn and nothing to tap, and 4.8 screens of scrolling, during which the six service names are the only structure.",
  },
  {
    key: "accordion",
    name: "Accordion",
    note: "CHOSEN 2026-09-12, and live. Six rows with a mark count each; one opens at a time. The count is what makes it work closed: “Backend Development & APIs · 13 technologies” answers the section's question before anything is opened. This specimen renders the SHIPPING component, not a copy: EcosystemList from ecosystem/parts.tsx.",
  },
  {
    key: "carousel",
    name: "Swipe carousel",
    note: "One service per card, swiped horizontally. Uses the axis a phone has spare, so the section stops competing with the page for vertical room. Swipe is undiscoverable to some readers, so the chips double as the control.",
  },
  {
    key: "tabs",
    name: "Tabs",
    note: "A scrollable chip row picks the service; the panel below shows its groups. The same grammar as the desktop capability index, so the two viewports teach the same interaction.",
  },
  {
    key: "grid",
    name: "Logo grid",
    note: "Marks only, four to a row, group names folded into one line beneath each service. The most compact, and the most “proof” rather than “directory”, but a mark you do not recognise has no name attached.",
  },
  {
    key: "sphere",
    name: "3D (three.js)",
    note: "All 62 marks as one object you spin with a thumb, the mobile echo of the desktop constellation, and the only variant that makes this section a THING rather than a document. FOUR ARRANGEMENTS inside it (sphere, bands, carousel, helix) switched with the chips above the stage; they morph into each other rather than cutting, because a cut between two 3D layouts tells you nothing about how related they are. SEPARATING BY SERVICE is a control rather than a layout: tap a service in the list below and its marks stay lit while the rest recede, so you see that stack in proportion to the whole (“eleven of sixty-two”) instead of losing the denominator to a filter. The list is both the control and the accessible fallback, so keyboard and thumb operate the same elements. Built on CSS3DRenderer, so the marks stay vector-crisp and no WebGL context is needed. Also by far the heaviest: ~150KB of library against 0KB for everything else here, buying character rather than information.",
  },
  {
    key: "marquee",
    name: "Marquee rails",
    note: "Three rows of marks drifting past at different speeds, no interaction at all. The logo-wall move every agency site makes, and it is honest about what this section is: proof of range, read in two seconds. Pure CSS. Nothing is tappable and no mark is findable, so it cannot answer “do they do Django?”.",
  },
  {
    key: "filmstrip",
    name: "Filmstrips",
    note: "One horizontal rail per service, names kept. Every service visible at once vertically, the depth of each one explored sideways. Shorter than the list without hiding anything behind a tap, but six independent scroll rails on one screen is a lot of gesture surface.",
  },
  {
    key: "deck",
    name: "Card deck",
    note: "The six services stacked with depth; tap the pile to bring the next one forward. Compact and tactile, and the stack itself shows there are six. The cards behind are inert, so this is the accordion's trade made worse: five sixths hidden, and no labels on what is hidden.",
  },
  {
    key: "sheet",
    name: "Bottom sheet",
    note: "A six-up grid of services, tapping one slides its stack up from the bottom over the page. The native phone idiom, and the grid overview is the most scannable of any variant. The sheet is a modal, so it needs focus handling and an escape route that none of the others do.",
  },
  {
    key: "sticky",
    name: "Sticky headers",
    note: "The full list, unchanged, except each service header sticks to the top while its own marks scroll past. Nothing is hidden and nothing needs a tap; you always know which service you are inside. Still the tallest option by a distance; it fixes the list's orientation problem, not its length.",
  },
] as const;

/* ── shared bits ─────────────────────────────────────────────────────────── */

function marks(c: Capability) {
  return c.stack.reduce((n, g) => n + g.items.length, 0);
}

/** Every mark on the page, flattened — the marquee and the sphere both want
    the set rather than the grouping. */
const ALL_MARKS = CAPABILITIES.flatMap((c) => c.stack.flatMap((g) => g.items));

function ServiceHead({ c, right }: { c: Capability; right?: React.ReactNode }) {
  const h = HUE[c.hue];
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm ${h.tile}`}
      >
        <Icon name={c.icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] font-bold leading-[1.3] tracking-[-0.015em] text-foreground">
          {c.name}
        </span>
        <span className="block text-[11px] font-semibold text-muted-foreground">
          {marks(c)} technologies
        </span>
      </span>
      {right}
    </div>
  );
}

function Groups({ c, compact }: { c: Capability; compact?: boolean }) {
  return (
    <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-4"}>
      {c.stack.map((g) => (
        <div key={g.group}>
          <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {g.group}
          </h4>
          <ul className="flex flex-wrap items-center gap-2">
            {g.items.map((t) => (
              <li
                key={t.name}
                className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3"
              >
                <TechLogo tech={t} size="sm" />
                <span className="text-[12px] font-medium text-muted-strong">
                  {t.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── A · full list (the control) ─────────────────────────────────────────── */
function VariantList() {
  return (
    <ul className="flex flex-col gap-4">
      {CAPABILITIES.map((c) => (
        <li
          key={c.k}
          className="rounded-[1.25rem] border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-4">
            <ServiceHead c={c} />
          </div>
          <Groups c={c} />
        </li>
      ))}
    </ul>
  );
}

/* ── B · accordion ─ THE CHOSEN ONE, AND THE SHIPPING COMPONENT ─────────
   `EcosystemList` itself, with its `lg:hidden` default overridden so it shows
   inside the desktop-width frame. Not a copy of it — a specimen that
   re-implements what it is testing drifts from it, and then the thing
   approved is not the thing that ships. */
function VariantAccordion() {
  return (
    <EcosystemList
      capabilities={CAPABILITIES}
      idPrefix="lab"
      className=""
    />
  );
}

/* ── C · swipe carousel ──────────────────────────────────────────────────── */
function VariantCarousel() {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* The scroll position is the source of truth, not the chip click: a swipe
     has to move the chips too, or the two controls disagree. */
  const onScroll = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const go = (i: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CAPABILITIES.map((c, i) => (
          <button
            key={c.k}
            type="button"
            onClick={() => go(i)}
            aria-current={i === active ? "true" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              i === active
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div
        ref={rail}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CAPABILITIES.map((c) => (
          <div key={c.k} className="w-full shrink-0 snap-center pr-3 last:pr-0">
            <div className="rounded-[1.25rem] border border-border bg-card p-5 shadow-sm">
              <div className="mb-4">
                <ServiceHead c={c} />
              </div>
              <Groups c={c} compact />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {active + 1} / {CAPABILITIES.length} · swipe
      </p>
    </div>
  );
}

/* ── D · tabs ────────────────────────────────────────────────────────────── */
function VariantTabs() {
  const [active, setActive] = useState(0);
  const c = CAPABILITIES[active];
  return (
    <div>
      <div
        role="tablist"
        aria-label="Services"
        className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CAPABILITIES.map((t, i) => (
          <button
            key={t.k}
            role="tab"
            type="button"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-semibold transition-colors ${
              i === active
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <Icon name={t.icon} className="size-3.5" />
            {t.name}
          </button>
        ))}
      </div>
      <div className="rounded-[1.25rem] border border-border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <ServiceHead c={c} />
        </div>
        <Groups c={c} compact />
      </div>
    </div>
  );
}

/* ── E · logo grid ───────────────────────────────────────────────────────── */
function VariantGrid() {
  return (
    <ul className="flex flex-col gap-4">
      {CAPABILITIES.map((c) => (
        <li
          key={c.k}
          className="rounded-[1.25rem] border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-1">
            <ServiceHead c={c} />
          </div>
          <p className="mb-4 text-[11px] leading-[1.5] text-muted-foreground">
            {c.stack.map((g) => g.group).join(" · ")}
          </p>
          <ul className="grid grid-cols-4 gap-2">
            {c.stack.flatMap((g) =>
              g.items.map((t) => (
                <li
                  key={g.group + t.name}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-1 py-2.5"
                >
                  <TechLogo tech={t} size="sm" />
                  <span className="w-full truncate text-center text-[9px] font-medium text-muted-foreground">
                    {t.name}
                  </span>
                </li>
              )),
            )}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/* ── G · marquee rails ─────────────────────────────────────────
   Each rail holds its marks TWICE and translates by exactly -50%, which is
   what makes the loop seamless: the second copy is under the thumb at the
   moment the first has finished passing, so there is no jump to hide. */
function VariantMarquee() {
  const rails = [0, 1, 2].map((r) =>
    ALL_MARKS.filter((_, i) => i % 3 === r),
  );
  return (
    <div className="flex flex-col gap-3">
      {rails.map((row, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-card py-3"
        >
          <div
            className="flex w-max gap-3 pl-3 motion-safe:animate-[stack-marquee_linear_infinite] motion-reduce:animate-none"
            style={{
              animationDuration: `${28 + i * 9}s`,
              animationDirection: i === 1 ? "reverse" : "normal",
            }}
          >
            {[...row, ...row].map((t, j) => (
              <span key={t.name + j} className="shrink-0">
                <TechLogo tech={t} size="sm" />
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-center text-[11px] text-muted-foreground">
        62 technologies, six services
      </p>
    </div>
  );
}

/* ── H · per-service filmstrips ───────────────────────────────────
   `-mx-4 px-4` so the rail bleeds to the card's edges: a strip that stops
   short of the edge reads as finished, and nobody scrolls it. */
function VariantFilmstrip() {
  return (
    <ul className="flex flex-col gap-3">
      {CAPABILITIES.map((c) => (
        <li
          key={c.k}
          className="rounded-[1.25rem] border border-border bg-card p-4 shadow-sm"
        >
          <div className="mb-3">
            <ServiceHead c={c} />
          </div>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {c.stack.flatMap((g) =>
              g.items.map((t) => (
                <li
                  key={g.group + t.name}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3"
                >
                  <TechLogo tech={t} size="sm" />
                  <span className="whitespace-nowrap text-[12px] font-medium text-muted-strong">
                    {t.name}
                  </span>
                </li>
              )),
            )}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/* ── I · card deck ──────────────────────────────────────────── */
function VariantDeck() {
  const [top, setTop] = useState(0);
  const n = CAPABILITIES.length;
  return (
    <div>
      <div className="relative h-[420px]">
        {CAPABILITIES.map((c, i) => {
          /* Depth is position in the cycle, not index, so the pile reorders
             itself as you tap instead of the cards teleporting. */
          const d = (i - top + n) % n;
          const shown = d < 4;
          return (
            <button
              key={c.k}
              type="button"
              onClick={() => setTop((t) => (t + 1) % n)}
              aria-label={`${c.name}. Show next service.`}
              className="absolute inset-x-0 top-0 rounded-[1.25rem] border border-border bg-card p-5 text-left shadow-lg transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{
                transform: `translateY(${d * 14}px) scale(${1 - d * 0.04})`,
                zIndex: n - d,
                opacity: shown ? 1 : 0,
                pointerEvents: d === 0 ? "auto" : "none",
              }}
            >
              <div className="mb-4">
                <ServiceHead c={c} />
              </div>
              <div className={d === 0 ? "" : "invisible"}>
                <Groups c={c} compact />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {top + 1} / {n} · tap the card
      </p>
    </div>
  );
}

/* ── J · bottom sheet ────────────────────────────────────────
   `absolute`, not `fixed`: inside the lab's phone frame a fixed sheet would
   escape to the real viewport. Shipped for real it would be fixed, and it
   would need focus trapping and an Escape route — which is precisely the
   cost this variant's note is about. */
function VariantSheet() {
  const [openK, setOpenK] = useState<string | null>(null);
  const c = CAPABILITIES.find((x) => x.k === openK);
  return (
    <div className="relative">
      <ul className="grid grid-cols-2 gap-3">
        {CAPABILITIES.map((cap) => {
          const h = HUE[cap.hue];
          return (
            <li key={cap.k}>
              <button
                type="button"
                onClick={() => setOpenK(cap.k)}
                className="flex h-full w-full flex-col items-start gap-2 rounded-[1.25rem] border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-accent/40"
              >
                <span
                  className={`grid size-10 place-items-center rounded-xl text-white shadow-sm ${h.tile}`}
                >
                  <Icon name={cap.icon} className="size-5" />
                </span>
                <span className="text-[13px] font-bold leading-[1.25] text-foreground">
                  {cap.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {marks(cap)} technologies
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {c && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenK(null)}
            className="absolute inset-0 z-10 bg-foreground/30 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-label={c.name}
            className="absolute inset-x-0 bottom-0 z-20 max-h-[78%] overflow-y-auto rounded-t-[1.5rem] border border-border bg-card p-5 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="mb-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <ServiceHead c={c} />
              </div>
              <button
                type="button"
                onClick={() => setOpenK(null)}
                aria-label="Close"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
              >
                {/* There is no `close` glyph in Icon.tsx and this lab is not
                    the place to add one to the shared set — the chevron
                    pointing down is the sheet's own dismiss direction. */}
                <Icon name="chevron" className="size-4" />
              </button>
            </div>
            <Groups c={c} compact />
          </div>
        </>
      )}
    </div>
  );
}

/* ── K · sticky service headers ────────────────────────────────
   The header sticks INSIDE its own <li>, so it releases when that service
   ends rather than stacking six headers at the top. The scroll container is
   the phone frame, which is why this only behaves correctly in a frame that
   actually scrolls. */
function VariantSticky() {
  return (
    <ul className="flex flex-col gap-5">
      {CAPABILITIES.map((c) => (
        <li key={c.k}>
          <div className="sticky top-0 z-10 -mx-1 mb-3 rounded-xl bg-secondary/95 px-1 py-2 backdrop-blur">
            <ServiceHead c={c} />
          </div>
          <div className="rounded-[1.25rem] border border-border bg-card p-4">
            <Groups c={c} compact />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── the lab ─────────────────────────────────────────────────────────────── */
export default function StackMobileVariants() {
  const [active, setActive] = useState<string>(STACK_VARIANTS[0].key);
  const [h, setH] = useState<number | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const current = STACK_VARIANTS.find((v) => v.key === active)!;

  /* Height is the comparator that matters on a phone, so it is measured and
     shown rather than eyeballed. ResizeObserver and not a one-shot read: the
     accordion and the tabs change height as you use them, and a stale number
     is worse than none. */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(Math.round(el.scrollHeight)));
    ro.observe(el);
    setH(Math.round(el.scrollHeight));
    return () => ro.disconnect();
  }, [active]);

  const screens = h ? (h / 844).toFixed(1) : null;

  return (
    <div className="shell py-14">
      <div role="tablist" aria-label="Mobile layouts" className="flex flex-wrap gap-2">
        {STACK_VARIANTS.map((v) => {
          const on = v.key === active;
          return (
            <button
              key={v.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setActive(v.key)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
                on
                  ? "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {v.name}
            </button>
          );
        })}
      </div>

      {/* `min-w-0` ON BOTH COLUMNS IS LOAD-BEARING. A grid item defaults to
          `min-width: auto`, i.e. it refuses to shrink below its content's
          min-content width — and the phone frame's content is a wall of
          technology chips. Without it the grid grew to 350px inside a 312px
          shell on a 360px screen and the whole page scrolled sideways by
          14px, which is a mobile-layout lab that does not survive mobile. */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[390px_1fr] lg:items-start">
        {/* ---- the phone ------------------------------------------------- */}
        <div className="min-w-0">
          <div className="mx-auto w-full max-w-[390px] rounded-[2rem] border-[10px] border-foreground/85 bg-secondary shadow-2xl">
            <div
              ref={frame}
              className="max-h-[760px] min-w-0 overflow-y-auto rounded-[1.25rem] p-4 [scrollbar-width:thin]"
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                Proven technology stacks
              </p>
              <h2 className="mb-4 font-display text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground">
                We don&rsquo;t chase trends, we build on what works.
              </h2>
              {active === "list" && <VariantList />}
              {active === "accordion" && <VariantAccordion />}
              {active === "carousel" && <VariantCarousel />}
              {active === "tabs" && <VariantTabs />}
              {active === "grid" && <VariantGrid />}
              {active === "sphere" && <StackSphere />}
              {active === "marquee" && <VariantMarquee />}
              {active === "filmstrip" && <VariantFilmstrip />}
              {active === "deck" && <VariantDeck />}
              {active === "sheet" && <VariantSheet />}
              {active === "sticky" && <VariantSticky />}
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">
            Up to 390 × 844, scrolls inside the frame. On a screen narrower
            than 390 the frame is the screen, and the height below is measured
            at that width rather than at 390.
          </p>
        </div>

        {/* ---- the readout ----------------------------------------------- */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-6 rounded-3xl border border-border bg-card p-6">
            <div>
              <p className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
                {h ? `${h}px` : "—"}
              </p>
              <p className="text-[12px] text-muted-foreground">
                section height at 390px
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
                {screens ?? "—"}
              </p>
              <p className="text-[12px] text-muted-foreground">
                phone screens of scrolling
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
                62
              </p>
              <p className="text-[12px] text-muted-foreground">
                marks shown, the same in every variant
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-muted-strong">
            <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
              {current.name}
            </span>
            {current.note}
          </p>

          <p className="mt-6 max-w-xl rounded-2xl border border-border bg-secondary p-5 text-[14px] leading-[1.7] text-muted-foreground">
            <strong className="font-semibold text-foreground">
              What is being chosen.
            </strong>{" "}
            Every variant shows the same 62 marks, so this is not a question of
            which looks nicest. A reader scanning for a stack they already run
            (&ldquo;do they do Django?&rdquo;) is best served by the full list,
            where interaction is only in the way. A reader forming an
            impression of range is best served by the compact ones, where the
            list is four screens of scrolling past the answer. Decide which
            reader this section is for, then read the heights.
          </p>
        </div>
      </div>
    </div>
  );
}
