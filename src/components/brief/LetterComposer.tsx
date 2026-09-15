"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FocusEvent } from "react";
import Icon from "@/components/Icon";
import Toast from "@/components/Toast";
import { BRIEF_SEND, BRIEF_UI } from "@/content/brief";
import Stage from "./anim/Stage";
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

/* The /contact composer: the story written as sentences with blanks on the
   left, and the finished letter those sentences make on the right, updated as
   the visitor types. On phones the letter opens from a bar pinned to the
   bottom into a native <dialog> sheet. Once sent, the Interloid mark gathers
   beside the thank-you. */

const WIDE = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => {
  const mq = matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getWide = () => matchMedia(WIDE).matches;
const getWideServer = () => true;

/** The letter, typeset from the answers. Empty blanks show their label in a
    dashed slot. With `fit`, the header stays put and the sentences scroll
    inside the card so the letter always fits beside the story at `lg:`. */
function Paper({
  brief,
  active,
  fit = false,
  bodyId,
}: {
  brief: Brief;
  active?: string;
  fit?: boolean;
  bodyId?: string;
}) {
  const { values, version, progress, who, company } = brief;
  const pct = progress.total
    ? Math.round((progress.filled / progress.total) * 100)
    : 0;
  return (
    <div
      className={`${CARD} flex flex-col overflow-hidden ${fit ? "lg:max-h-[calc(100dvh-8rem)]" : ""} pb-6 sm:pb-8 pr-2`}
    >
      <div className="h-1 shrink-0 bg-secondary" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="shrink-0 px-6 pt-7 sm:px-10 sm:pt-10 2xl:px-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-6 text-[15px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {BRIEF_UI.letterTo}
          </span>
          <span className="tabular-nums" aria-live="polite">
            {BRIEF_UI.answered(progress.filled, progress.total)}
          </span>
        </div>
      </div>
      {/* A scroll box only when fitted at `lg:`; an always-on overscroll
          container would trap the swipe inside the phone sheet. */}
      <div
        id={bodyId}
        className={
          fit
            ? "px-6 sm:px-10 2xl:px-12 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]"
            : "px-6 sm:px-10 sm:pb-8 2xl:px-12"
        }
      >
        <div className="mt-6 space-y-3">
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
                              ? "mt-1 block text-primary"
                              : "text-primary"
                          }
                        >
                          {v}
                        </span>
                      );
                    }
                    return (
                      <span
                        key={s.name}
                        className={`${s.kind === "long" ? "mt-1 block w-fit" : "mx-0.5"} border-b-2 border-dashed border-border px-1 text-hint`}
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
        <p className={`${PARA_MD} mt-8 [overflow-wrap:anywhere]`}>
          {BRIEF_SEND.signoff}{" "}
          <span className={who ? "text-primary" : "text-hint"}>
            {who || "your name"}
          </span>
          {company && <span className="text-primary">, {company}</span>}
        </p>
      </div>
    </div>
  );
}

export default function LetterComposer() {
  const brief = useStoryBrief();
  const wide = useSyncExternalStore(subscribeWide, getWide, getWideServer);
  const [active, setActive] = useState<string>();
  const sheetRef = useRef<HTMLDialogElement>(null);
  /* The phone bar shows only while the form is on screen, so it never covers
     the hero or the footer. A callback ref, so a remounted form is observed. */
  const [formEl, setFormEl] = useState<HTMLFormElement | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!formEl) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    io.observe(formEl);
    return () => io.disconnect();
  }, [formEl]);

  const { progress, state } = brief;
  const p = progress.total ? progress.filled / progress.total : 0;
  /* Keyed to the reply object, so every new "unavailable" reply reopens it. */
  const [dismissed, setDismissed] = useState<object | null>(null);
  const closeToast = useCallback(() => setDismissed(state), [state]);

  if (state.status === "sent") {
    return (
      <section id="story" className="bg-background py-16 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-5xl">
            <ThankYou brief={brief} className={CARD} stage={<Stage />} />
          </div>
        </div>
      </section>
    );
  }

  /* Focusing a blank tints its sentence and scrolls the letter's own box to
     it, never the page, so nothing moves under the visitor while they type. */
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

  return (
    /* id="story": every consult CTA on the site links to /contact#story. */
    <section id="story" className="bg-background pb-32 pt-14 lg:py-28 2xl:py-32">
      <form
        id={brief.formId}
        ref={setFormEl}
        noValidate
        onSubmit={brief.submit}
        className="shell grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-x-16 2xl:gap-x-24"
      >
        <Honeypot />

        <div
          onFocusCapture={follow}
          onBlurCapture={() => setActive(undefined)}
          className="min-w-0 lg:col-start-1 lg:row-start-1"
        >
          <div className={CARD}>
            <VersionToggle
              brief={brief}
              className="border-b border-border px-6 py-6 sm:px-10 sm:py-8 2xl:px-12"
            />
            <div className="px-6 sm:px-10 2xl:px-12">
              <Chapters brief={brief} />
            </div>
          </div>
        </div>

        <aside
          aria-label="Your letter, as it reads"
          className="hidden min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block"
        >
          <div className="grid gap-5 lg:sticky lg:top-24">
            {wide && <Paper brief={brief} active={active} fit bodyId={letterId} />}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <SendFoot brief={brief} className="px-1" />
        </div>
      </form>

      <div
        inert={!near}
        className={`fixed inset-x-3 bottom-3 z-40 transition-[opacity,translate] duration-300 motion-reduce:transition-none lg:hidden ${
          near
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => sheetRef.current?.showModal()}
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
          <Paper brief={brief} />
        </div>
      </dialog>

      <Toast
        open={state.status === "unavailable" && dismissed !== state}
        title="This feature is in development"
        onClose={closeToast}
      >
        Sending stories online isn&rsquo;t live yet. Your words are saved in
        this browser; until then, email{" "}
        <a href="mailto:connect@interloid.com" className="on-dark font-semibold text-white underline underline-offset-4">
          connect@interloid.com
        </a>{" "}
        or call{" "}
        <a href="tel:+919042032424" className="on-dark whitespace-nowrap font-semibold text-white underline underline-offset-4">
          +91 9042032424
        </a>
        .
      </Toast>
    </section>
  );
}
