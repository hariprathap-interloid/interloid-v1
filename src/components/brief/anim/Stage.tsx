"use client";

import BlueprintField from "./BlueprintField";
import MarkField from "./MarkField";
import TeamField from "./TeamField";

/* ==========================================================================
   Stage — the panel above the live letter where a progress animation runs.
   ==========================================================================
   Five candidates are compared in /contact-lab. Three live in this panel and
   report progress while the story is written; `envelope` is a moment on
   send instead (EnvelopeSend) and `none` is none.

     mark       the Interloid logo assembles from particles (Three.js)
     team       your node drifts in and joins the team, a line per answer
                (Three.js)
     blueprint  an app wireframe draws itself, stroke by stroke (canvas 2D,
                no Three.js — the lightest of the three)

   The panel is always the dark ink slab: two of the three blend additively,
   which only reads on a dark ground, and one ground for all three keeps the
   comparison about the animation. The caption carries the same progress as
   words, so nothing is said by motion alone.

   The team caption deliberately does NOT count engineers: a node count is a
   headcount claim in disguise (about.ts's TEAM note), and nobody has
   confirmed one. */

/* "mark-send" — CHOSEN for /contact, 2026-09-11: no panel while typing (the
   live letter is already the moving part), and the mark gathers above the
   thank-you once the story is sent. The other kinds are kept, unrendered on
   /contact, for the phase-2 variant review in /contact-lab. */
export type AnimKind =
  | "none"
  | "mark"
  | "mark-send"
  | "team"
  | "blueprint"
  | "envelope";

type StageKind = "mark" | "team" | "blueprint";
/** A panel beside the letter WHILE the story is being written. */
export const hasStage = (k: AnimKind): k is StageKind =>
  k === "mark" || k === "team" || k === "blueprint";
/** The panel above the thank-you once sent: a typing stage's own finish, or
    the mark alone for "mark-send", which appears only then. */
export const finaleOf = (k: AnimKind): StageKind | null =>
  k === "mark-send" ? "mark" : hasStage(k) ? k : null;

const WORKING: Record<StageKind, string> = {
  mark: "The mark comes together as your story does",
  team: "Connecting you to the team",
  blueprint: "Your project, sketched",
};
const DONE: Record<StageKind, string> = {
  mark: "Delivered safely to the Interloid team.",
  team: "Connected — your story is with the engineers.",
  blueprint: "Sketched — next comes a written price.",
};

export default function Stage({
  kind,
  progress,
  done,
  fill = false,
  className = "",
}: {
  kind: AnimKind;
  progress: number;
  done: boolean;
  /** The thank-you's logo side: fills its half of the combined card (no
      corners of its own — the card clips it) instead of being a separate
      panel. Never shorter than 18rem: at the typing panel's 224px the mark
      drew ~2px per lattice row and aliased into a moiré of bright blobs,
      and HeroScatter treats ~4.3px as the finest spacing worth drawing. */
  fill?: boolean;
  className?: string;
}) {
  if (!hasStage(kind)) return null;
  const pct = Math.round((done ? 1 : Math.max(0, Math.min(1, progress))) * 100);
  return (
    <figure
      className={
        fill
          ? `m-0 flex h-full flex-col bg-ink ${className}`
          : `m-0 overflow-hidden rounded-[1rem] bg-ink ${className}`
      }
    >
      <div
        className={
          fill
            ? "relative min-h-72 flex-1 lg:min-h-[26rem]"
            : "relative h-48 sm:h-56"
        }
      >
        {kind === "mark" ? (
          <MarkField progress={progress} done={done} />
        ) : kind === "team" ? (
          <TeamField progress={progress} done={done} />
        ) : (
          <BlueprintField progress={progress} done={done} />
        )}
      </div>
      <figcaption
        className="border-t border-white/10 px-5 py-3.5"
        aria-live="polite"
      >
        <span className="flex items-baseline justify-between gap-3 text-[13px] text-ink-foreground">
          <span>{done ? DONE[kind] : WORKING[kind]}</span>
          <span className="shrink-0 tabular-nums">{pct}%</span>
        </span>
        <span
          className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10"
          aria-hidden="true"
        >
          <span
            className="block h-full rounded-full bg-gradient-to-r from-brand-light to-accent transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </span>
      </figcaption>
    </figure>
  );
}
