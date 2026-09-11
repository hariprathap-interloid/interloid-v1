"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Icon from "@/components/Icon";
import { BRIEF_SEND } from "@/content/brief";
import EnvelopeSend from "./anim/EnvelopeSend";
import Stage, { hasStage, type AnimKind } from "./anim/Stage";
import { CARD, Chapters, Honeypot, PARA_MD, SendFoot, ThankYou, VersionToggle } from "./parts";
import { useStoryBrief, type Brief } from "./useStoryBrief";

/* ==========================================================================
   LetterComposer — the story in PARAGRAPHS on one half, the FINISHED LETTER
   on the other.
   ==========================================================================
   How it got here, all 2026-09-11:
     · the letter with blanks, alone              — "not good enough"
     · plain labelled boxes + a live preview      — preview liked, but the
                                                    boxes "look like a form"
     · THIS: the paragraphs with blanks as the input, the live preview kept
   So the left half is written like the story itself — sentences with blanks
   you type into, suggestions under them — and the right half is the clean
   letter those sentences make, every answer landing in place as it is
   typed, empty ones shown as dashed slots.

   THREE DIALS, still decided in /content-lab:
     side    which half the story sits on at `lg:` and up
     mobile  how the preview reaches a phone, where there is no room beside
             the story:
               drawer  a bar pinned to the bottom ("Your letter · 4 of 9")
                       that opens the letter in a sheet
               tabs    a sticky Write | Your letter switch
             ("echo" — each boxed answer read back as a sentence — went with
             the boxes: the story half is the sentence now.)
     anim    none · mark · team · blueprint (a panel above the letter) or
             envelope (a moment on send) — see anim/Stage

   ── ONE GRID, SO THE SEND CAN MOVE ──────────────────────────────────────
   The <form> is the grid. Story, preview and send are three items; `lg:`
   stacks story and send in one column and lets the preview span both rows
   of the other. Every placement class is a whole literal string on both
   arms of its conditional (HANDOFF §5.1).

   ── ONE RENDERER ─────────────────────────────────────────────────────────
   A canvas animation mounted in a `hidden` column still creates its WebGL
   context, so on a phone in drawer mode the column's Stage is not rendered
   at all and the sheet's exists only while the sheet is open. `wide` is the
   `lg:` media query as external state — `true` on the server, corrected on
   the client without a mismatch warning (the shape of Nav's theme). */

/** Which half the STORY sits on. (Names kept from the boxes round.) */
export type Side = "input-left" | "input-right";
export type MobileMode = "drawer" | "tabs";

const WIDE = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => {
  const mq = matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getWide = () => matchMedia(WIDE).matches;
const getWideServer = () => true;

/* ── the finished letter ──────────────────────────────────────────────── */

/** The letter, typeset from the answers. An empty blank shows its own label
    in a dashed slot, so the reader sees the shape of the story before any of
    it is written. */
function Paper({ brief }: { brief: Brief }) {
  const { values, version, progress, who, company } = brief;
  const pct = progress.total ? Math.round((progress.filled / progress.total) * 100) : 0;
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="h-1 bg-secondary" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="p-6 sm:p-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-5 text-sm text-muted-foreground">
          <span>
            To <strong className="font-semibold text-foreground">Interloid</strong>
          </span>
          <span className="tabular-nums" aria-live="polite">
            {progress.filled} of {progress.total} written
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {version.chapters.map((c) =>
            c.lines.map((line, li) => (
              <p key={`${c.key}-${li}`} className={PARA_MD}>
                {line.map((s, si) => {
                  if (typeof s === "string") return <span key={si}>{s}</span>;
                  const v = values[s.name]?.trim();
                  if (v) {
                    return (
                      <span key={s.name} className={s.kind === "long" ? "mt-1 block text-brand" : "text-brand"}>
                        {v}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={s.name}
                      className={`${s.kind === "long" ? "mt-1 block w-fit" : "mx-0.5"} border-b-2 border-dashed border-border px-1 text-faint`}
                    >
                      {s.label}
                    </span>
                  );
                })}
              </p>
            )),
          )}
        </div>
        <p className={`${PARA_MD} mt-8`}>
          {BRIEF_SEND.signoff} <span className={who ? "text-brand" : "text-faint"}>{who || "your name"}</span>
          {company && <span className="text-brand">, {company}</span>}
        </p>
      </div>
    </div>
  );
}

/* ── the composer ─────────────────────────────────────────────────────── */

export default function LetterComposer({
  side = "input-left",
  mobile = "drawer",
  anim = "none",
  lab = false,
}: {
  side?: Side;
  mobile?: MobileMode;
  anim?: AnimKind;
  /** Dry-run sends (validated, never saved) — see the action. */
  lab?: boolean;
}) {
  const brief = useStoryBrief({ lab });
  const wide = useSyncExternalStore(subscribeWide, getWide, getWideServer);
  const [tab, setTab] = useState<"write" | "letter">("write");
  const [sheet, setSheet] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);

  const { progress, state } = brief;
  const p = progress.total ? progress.filled / progress.total : 0;
  const left = side === "input-left";

  /* ── sent: the thank-you, with the chosen animation's finish ────────── */
  if (state.status === "sent") {
    const thanks = <ThankYou brief={brief} className={`${CARD} p-8 sm:p-12`} />;
    return (
      <section className="bg-background py-16 lg:py-24">
        <div className="shell">
          <div className="mx-auto grid max-w-5xl gap-6">
            {hasStage(anim) && <Stage kind={anim} progress={1} done />}
            {anim === "envelope" ? <EnvelopeSend name={brief.who}>{thanks}</EnvelopeSend> : thanks}
          </div>
        </div>
      </section>
    );
  }

  const show = (t: "write" | "letter") => {
    setTab(t);
    document.getElementById(brief.formId)?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const openSheet = () => {
    setSheet(true);
    sheetRef.current?.showModal();
  };

  /* Placement — whole strings on every arm. Two equal halves: blanks set in
     running sentences need the width that plain boxes did not. */
  const GRID =
    "shell grid scroll-mt-24 grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-x-16";
  const COL_STORY = left ? "lg:col-start-1" : "lg:col-start-2";
  const COL_PREVIEW = left ? "lg:col-start-2" : "lg:col-start-1";
  const HIDE_WRITE = mobile === "tabs" && tab === "letter" ? "hidden lg:block" : "";
  const HIDE_PREVIEW = mobile === "drawer" || tab === "write" ? "hidden lg:block" : "";
  /* Only one live animation at a time — see the banner. */
  const columnStage = hasStage(anim) && (wide || mobile === "tabs");

  return (
    <section className={mobile === "drawer" ? "bg-background pb-32 pt-12 lg:py-24" : "bg-background py-12 lg:py-24"}>
      <form id={brief.formId} noValidate onSubmit={brief.submit} className={GRID}>
        <Honeypot />

        {mobile === "tabs" && (
          <div className="sticky top-20 z-30 lg:hidden">
            <div
              role="tablist"
              aria-label="Write your story, or read your letter"
              className="grid grid-cols-2 rounded-full border border-border bg-card/95 p-1 shadow-sm backdrop-blur-md"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "write"}
                onClick={() => show("write")}
                className={
                  tab === "write"
                    ? "rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                    : "rounded-full py-2.5 text-sm font-medium text-muted-foreground"
                }
              >
                Write
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "letter"}
                onClick={() => show("letter")}
                className={
                  tab === "letter"
                    ? "rounded-full bg-primary py-2.5 text-sm font-semibold tabular-nums text-primary-foreground"
                    : "rounded-full py-2.5 text-sm font-medium tabular-nums text-muted-foreground"
                }
              >
                Your letter · {progress.filled}/{progress.total}
              </button>
            </div>
          </div>
        )}

        {/* THE STORY — sentences with blanks, written in place. */}
        <div className={`${HIDE_WRITE} ${COL_STORY} min-w-0 lg:row-start-1`}>
          <div className={CARD}>
            <VersionToggle brief={brief} className="border-b border-border px-6 py-5 sm:px-8" />
            <div className="px-6 sm:px-8">
              <Chapters brief={brief} para={PARA_MD} />
            </div>
          </div>
        </div>

        {/* THE LETTER — sticky only on screens tall enough to hold it (a
            pinned column taller than the viewport hides its own bottom). */}
        <aside
          aria-label="Your letter, as it reads"
          className={`${HIDE_PREVIEW} ${COL_PREVIEW} min-w-0 lg:row-span-2 lg:row-start-1`}
        >
          <div className="grid gap-5 lg:top-28 [@media(min-height:56rem)]:lg:sticky">
            {columnStage && <Stage kind={anim} progress={p} done={false} />}
            <Paper brief={brief} />
            {mobile === "tabs" && (
              <button
                type="button"
                onClick={() => show("write")}
                className="justify-self-start rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground lg:hidden"
              >
                ← Back to writing
              </button>
            )}
          </div>
        </aside>

        {/* SEND */}
        <div className={`${HIDE_WRITE} ${COL_STORY} min-w-0 lg:row-start-2`}>
          <SendFoot brief={brief} signoff={false} className="px-1" />
        </div>
      </form>

      {/* DRAWER (phones): a bar pinned to the bottom, and the letter in a
          native <dialog> sheet — focus trap, Escape and the backdrop come
          with the element rather than being rebuilt. */}
      {mobile === "drawer" && (
        <>
          <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
            <button
              type="button"
              onClick={openSheet}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 text-left shadow-[0_18px_40px_-18px_rgba(15,23,43,.45)] backdrop-blur-md"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon name="doc" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-foreground">Your letter</span>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500"
                    style={{ width: `${Math.round(p * 100)}%` }}
                  />
                </span>
                <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                  {progress.filled} of {progress.total} written
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-primary">Read ↑</span>
            </button>
          </div>

          <dialog
            ref={sheetRef}
            aria-label="Your letter"
            onClose={() => setSheet(false)}
            onClick={(e) => {
              if (e.target === e.currentTarget) e.currentTarget.close();
            }}
            className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88vh] w-full max-w-full overflow-y-auto rounded-t-[2rem] border-0 bg-background p-0 text-muted-foreground backdrop:bg-ink/60 backdrop:backdrop-blur-sm lg:hidden"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <span className="font-display text-lg font-semibold text-foreground">Your letter</span>
              <button
                type="button"
                onClick={() => sheetRef.current?.close()}
                className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary"
              >
                Done
              </button>
            </div>
            <div className="grid gap-5 p-4">
              {sheet && !wide && hasStage(anim) && <Stage kind={anim} progress={p} done={false} />}
              <Paper brief={brief} />
            </div>
          </dialog>
        </>
      )}
    </section>
  );
}
