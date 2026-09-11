"use client";

import { useRef, useState, useSyncExternalStore, type FocusEvent } from "react";
import Icon from "@/components/Icon";
import { BRIEF_SEND, BRIEF_UI } from "@/content/brief";
import EnvelopeSend from "./anim/EnvelopeSend";
import Stage, { finaleOf, hasStage, type AnimKind } from "./anim/Stage";
import {
  CARD,
  Chapters,
  Honeypot,
  PARA_MD,
  SendFoot,
  ThankYou,
  VersionToggle,
} from "./parts";
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

/* How tall the letter may be beside the story at `lg:` — the screen, less
   the pinned nav above it and a margin below. With an animation panel over
   it (lab variants) the panel's height comes off too. Whole strings. */
const FIT = {
  none: "",
  screen: "lg:max-h-[calc(100dvh-8rem)]",
  "screen-stage": "lg:max-h-[calc(100dvh-24rem)]",
} as const;

/** The letter, typeset from the answers. An empty blank shows its own label
    in a dashed slot, so the reader sees the shape of the story before any of
    it is written.

    FITTED TO THE SCREEN beside the story (`fit`): the header ("To Interloid
    · 3 of 9 written") stays put and the sentences scroll inside the card —
    so on a 720px laptop the letter is always on screen instead of scrolling
    away and leaving half the page empty (measured 2026-09-11 at 1280×720,
    1366×768 and 1024×768). `active` tints the sentence being written, and
    `bodyId` lets the composer scroll THIS box — never the page — to it. */
function Paper({
  brief,
  active,
  fit = "none",
  bodyId,
}: {
  brief: Brief;
  active?: string;
  fit?: keyof typeof FIT;
  bodyId?: string;
}) {
  const { values, version, progress, who, company } = brief;
  const pct = progress.total
    ? Math.round((progress.filled / progress.total) * 100)
    : 0;
  return (
    <div
      className={`${CARD} flex flex-col overflow-hidden ${FIT[fit]} pb-6 sm:pb-8 pr-2`}
    >
      <div className="h-1 shrink-0 bg-secondary" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="shrink-0 px-6 pt-6 sm:px-10 sm:pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {BRIEF_UI.letterTo}
          </span>
          <span className="tabular-nums" aria-live="polite">
            {BRIEF_UI.answered(progress.filled, progress.total)}
          </span>
        </div>
      </div>
      {/* A scroll box ONLY when fitted beside the story at `lg:`. As an
          always-on `overflow-y-auto overscroll-contain` box it trapped the
          swipe in the phone sheet: with nothing of its own to scroll, it
          still refused to chain the gesture to the sheet around it, so the
          sheet could not scroll at all. */}
      <div
        id={bodyId}
        className={
          fit === "none"
            ? "px-6  sm:px-10 sm:pb-8"
            : "px-6  sm:px-10  lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin] "
        }
      >
        <div>
          <div className="mt-5 space-y-2">
            {version.chapters.map((c) =>
              c.lines.map((line, li) => {
                const names = line.flatMap((s) =>
                  typeof s === "string" ? [] : [s.name],
                );
                const on = !!active && names.includes(active);
                return (
                  <p
                    key={`${c.key}-${li}`}
                    data-fields={names.join(" ")}
                    /* overflow-wrap:anywhere — an answer typed with no spaces
                     ("wwwww…") ran straight past the card's edge. */
                    className={`${PARA_MD} -mx-3 rounded-xl px-3 py-0.5 transition-colors duration-300 [overflow-wrap:anywhere] ${on ? "bg-brand/[0.07]" : ""}`}
                  >
                    {line.map((s, si) => {
                      if (typeof s === "string")
                        return <span key={si}>{s}</span>;
                      const v = values[s.name]?.trim();
                      if (v) {
                        return (
                          <span
                            key={s.name}
                            className={
                              s.kind === "long"
                                ? "mt-1 block text-brand"
                                : "text-brand"
                            }
                          >
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
                );
              }),
            )}
          </div>
          <p className={`${PARA_MD} mt-6 [overflow-wrap:anywhere]`}>
            {BRIEF_SEND.signoff}{" "}
            <span className={who ? "text-brand" : "text-faint"}>
              {who || "your name"}
            </span>
            {company && <span className="text-brand">, {company}</span>}
          </p>
        </div>
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
  /** The blank being written — its sentence is tinted in the letter. */
  const [active, setActive] = useState<string>();
  const sheetRef = useRef<HTMLDialogElement>(null);

  const { progress, state } = brief;
  const p = progress.total ? progress.filled / progress.total : 0;
  const left = side === "input-left";

  /* ── sent: the thank-you, with the chosen animation's finish ────────── */
  if (state.status === "sent") {
    /* One card: the logo side and the words side together (ThankYou's
       `stage`). The Stage mounts fresh here, so the mark starts scattered
       and gathers into the logo as the thank-you arrives — the moment
       "mark-send" exists for. No animation or the envelope: the plain card. */
    const finale = finaleOf(anim);
    const thanks = finale ? (
      <ThankYou
        brief={brief}
        className={CARD}
        stage={<Stage kind={finale} progress={1} done fill />}
      />
    ) : (
      <ThankYou brief={brief} className={`${CARD} p-8 sm:p-12`} />
    );
    return (
      <section className="bg-background py-16 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-5xl">
            {anim === "envelope" ? (
              <EnvelopeSend name={brief.who}>{thanks}</EnvelopeSend>
            ) : (
              thanks
            )}
          </div>
        </div>
      </section>
    );
  }

  const show = (t: "write" | "letter") => {
    setTab(t);
    document
      .getElementById(brief.formId)
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const openSheet = () => {
    setSheet(true);
    sheetRef.current?.showModal();
  };
  /* The letter follows the story: focusing a blank tints its sentence and
     scrolls the LETTER'S OWN BOX to it — a third of the way down, so the
     lines before it stay in view. Deliberately not scrollIntoView, which
     would also move the page under the visitor's cursor while they type. */
  const letterId = `${brief.formId}-letter`;
  const follow = (e: FocusEvent<HTMLDivElement>) => {
    const name = e.target.getAttribute("name");
    if (!name) return;
    setActive(name);
    const box = document.getElementById(letterId);
    const line = box?.querySelector<HTMLElement>(`[data-fields~="${name}"]`);
    if (!box || !line || box.scrollHeight <= box.clientHeight) return;
    const d =
      line.getBoundingClientRect().top - box.getBoundingClientRect().top;
    box.scrollBy({
      top: d - box.clientHeight / 3,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  /* Placement — whole strings on every arm. Two equal halves: blanks set in
     running sentences need the width that plain boxes did not. */
  /* No scroll-margin: <html> already has `scroll-padding-top: 7rem` for the
     fixed nav, and a margin here doubled it (see ThankYou). */
  const GRID =
    "shell grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-x-16";
  const COL_STORY = left ? "lg:col-start-1" : "lg:col-start-2";
  const COL_PREVIEW = left ? "lg:col-start-2" : "lg:col-start-1";
  const HIDE_WRITE =
    mobile === "tabs" && tab === "letter" ? "hidden lg:block" : "";
  const HIDE_PREVIEW =
    mobile === "drawer" || tab === "write" ? "hidden lg:block" : "";
  /* Only one live animation at a time — see the banner. */
  const columnStage = hasStage(anim) && (wide || mobile === "tabs");

  return (
    <section
      className={
        mobile === "drawer"
          ? "bg-background pb-32 pt-12 lg:py-24"
          : "bg-background py-12 lg:py-24"
      }
    >
      <form
        id={brief.formId}
        noValidate
        onSubmit={brief.submit}
        className={GRID}
      >
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
                {BRIEF_UI.writeTab}
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
                {BRIEF_UI.letterTab} · {progress.filled}/{progress.total}
              </button>
            </div>
          </div>
        )}

        {/* THE STORY — sentences with blanks, written in place. */}
        <div
          onFocusCapture={follow}
          onBlurCapture={() => setActive(undefined)}
          className={`${HIDE_WRITE} ${COL_STORY} min-w-0 lg:row-start-1`}
        >
          <div className={CARD}>
            <VersionToggle
              brief={brief}
              className="border-b border-border px-6 py-5 sm:px-8"
            />
            <div className="px-6 sm:px-8">
              <Chapters brief={brief} para={PARA_MD} />
            </div>
          </div>
        </div>

        {/* THE LETTER — pinned under the nav at every `lg:` height, and
            FITTED to the screen (Paper's `fit`), so it never outgrows the
            viewport. It used to pin only on screens ≥ 56rem tall — on a
            720–768px laptop it scrolled away and left the right half of the
            page empty while the story was being written. */}
        <aside
          aria-label="Your letter, as it reads"
          className={`${HIDE_PREVIEW} ${COL_PREVIEW} min-w-0 lg:row-span-2 lg:row-start-1`}
        >
          <div className="grid gap-5 lg:sticky lg:top-24">
            {columnStage && <Stage kind={anim} progress={p} done={false} />}
            <Paper
              brief={brief}
              active={active}
              fit={columnStage ? "screen-stage" : "screen"}
              bodyId={letterId}
            />
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
                <span className="block text-[15px] font-semibold text-foreground">
                  {BRIEF_UI.preview}
                </span>
                <span
                  className="mt-1 block h-1 overflow-hidden rounded-full bg-secondary"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500"
                    style={{ width: `${Math.round(p * 100)}%` }}
                  />
                </span>
                <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                  {BRIEF_UI.answered(progress.filled, progress.total)}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-primary">
                {BRIEF_UI.previewAction} ↑
              </span>
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
              <span className="font-display text-lg font-semibold text-foreground">
                {BRIEF_UI.sheetTitle}
              </span>
              <button
                type="button"
                onClick={() => sheetRef.current?.close()}
                className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary"
              >
                {BRIEF_UI.sheetClose}
              </button>
            </div>
            <div className="grid gap-5 p-4">
              {sheet && !wide && hasStage(anim) && (
                <Stage kind={anim} progress={p} done={false} />
              )}
              <Paper brief={brief} />
            </div>
          </dialog>
        </>
      )}
    </section>
  );
}
