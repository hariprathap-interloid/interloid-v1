"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/Icon";
import {
  BRIEF_DONE,
  BRIEF_SEND,
  BRIEF_UI,
  BRIEF_VERSIONS,
  type Blank,
  type Field,
  type Long,
  type Segment,
} from "@/content/brief";
import type { Brief, SetValue } from "./useStoryBrief";

/* ==========================================================================
   The shared pieces of the story letter: the paragraph-style blanks, the
   suggestions, the version toggle, the honeypot, the send foot and the
   thank-you. LetterComposer arranges them; useStoryBrief drives them.

   The inline-blank pieces (InlineBlank, OpenSpace, Line, Chapters) were cut
   once when plain labelled boxes replaced them, and RESTORED the same day
   (2026-09-11): the user found the boxes "look like a form" and asked for
   the paragraph style back as the input, with the live preview beside it.

   No `data-reveal` in here: every className is computed from state, and
   Reveal's `is-in` would be wiped by React's next write (see Faq's note).
   ========================================================================== */

export const PARA = "font-display text-xl leading-loose text-foreground md:text-[1.4rem]";
export const PARA_MD = "font-display text-lg leading-loose text-foreground md:text-xl";

/* The card. Lifted off a tinted ground by a long, soft shadow rather than
   the site's `shadow-sm` — on a tinted ground a 1px shadow reads as a
   border, and the letter is the one object that should come forward. */
export const CARD =
  "min-w-0 rounded-[2rem] border border-border bg-card shadow-[0_30px_60px_-30px_rgba(15,23,43,.28)]";

/* ── the two kinds of blank ───────────────────────────────────────────── */

export function InlineBlank({
  f,
  value,
  set,
  invalid,
}: {
  f: Blank;
  value: string;
  set: SetValue;
  invalid: boolean;
}) {
  return (
    <input
      name={f.name}
      type={f.type ?? "text"}
      value={value}
      onChange={(e) => set(f.name, e.target.value)}
      placeholder={f.hint}
      aria-label={f.label}
      aria-required={f.required || undefined}
      aria-invalid={invalid || undefined}
      autoComplete={f.autoComplete ?? "off"}
      /* `size` in characters grows the blank with what is typed, in every
         browser — `field-sizing: content` is still Chromium-only. */
      size={Math.max(f.hint.length, value.length, 6) + 1}
      maxLength={300}
      /* Capped short of 100% so the glued full stop beside it still fits. */
      /* `blank-in-text`: its focus style lives in globals.css — see there
         for why a utility class cannot override the global ring. */
      className={`blank-in-text mx-1 max-w-[calc(100%-0.75rem)] border-0 border-b-2 bg-transparent px-1 pb-0.5 font-display font-medium text-brand outline-none transition-colors placeholder:font-normal placeholder:text-faint focus:border-solid ${
        invalid ? "border-rose-500" : "border-dashed border-brand/35 focus:border-brand"
      }`}
    />
  );
}

export function OpenSpace({
  f,
  value,
  set,
  invalid,
}: {
  f: Long;
  value: string;
  set: SetValue;
  invalid: boolean;
}) {
  return (
    <textarea
      name={f.name}
      value={value}
      onChange={(e) => set(f.name, e.target.value)}
      placeholder={f.hint}
      aria-label={f.label}
      aria-required={f.required || undefined}
      aria-invalid={invalid || undefined}
      rows={3}
      maxLength={4000}
      className={`mt-4 block min-h-[6.5rem] w-full resize-y rounded-2xl border bg-secondary/60 p-4 font-display text-lg leading-relaxed text-brand outline-none transition-colors [field-sizing:content] placeholder:text-[15px] placeholder:leading-relaxed placeholder:text-faint focus:border-solid focus:bg-card ${
        invalid ? "border-rose-500" : "border-dashed border-brand/30 focus:border-brand"
      }`}
    />
  );
}

/* ── one line of the story, and the whole story ───────────────────────── */

/** A sentence with its blanks inline, then any long answer or suggestions
    under it. */
export function Line({
  line,
  brief,
  para = PARA,
}: {
  line: readonly Segment[];
  brief: Brief;
  para?: string;
}) {
  const { values, set, invalid } = brief;
  const below = line.filter((s): s is Field => typeof s !== "string");
  return (
    <div>
      <p className={para}>
        {line.map((s, si) => {
          /* Punctuation right after a blank is glued to it (nowrap), so a
             wrapping blank never leaves its full stop alone on a line. */
          const prev = line[si - 1];
          if (typeof s === "string") {
            const afterBlank = typeof prev !== "string" && prev?.kind === "blank";
            const text = afterBlank ? s.replace(/^[.,]/, "") : s;
            return text ? <span key={si}>{text}</span> : null;
          }
          if (s.kind !== "blank") return null; /* a `long` opens below */
          const next = line[si + 1];
          const glue = typeof next === "string" ? (next.match(/^[.,]/)?.[0] ?? "") : "";
          return (
            <span key={s.name} className="whitespace-nowrap">
              <InlineBlank f={s} value={values[s.name] ?? ""} set={set} invalid={invalid(s)} />
              {glue}
            </span>
          );
        })}
      </p>
      {below.map((s) =>
        s.kind === "long" ? (
          <OpenSpace key={s.name} f={s} value={values[s.name] ?? ""} set={set} invalid={invalid(s)} />
        ) : (
          <Suggestions key={s.name} f={s} value={values[s.name] ?? ""} set={set} />
        ),
      )}
    </div>
  );
}

/** Every chapter of the current version, numbers in their own gutter. */
export function Chapters({ brief, para = PARA }: { brief: Brief; para?: string }) {
  return (
    <>
      {brief.version.chapters.map((c) => (
        <section
          key={c.key}
          aria-labelledby={`ch-${c.key}-h`}
          /* Chapter number in its own gutter from `sm:` — the prose then
             starts on one clean edge down the whole story, and the numerals
             read as a margin index rather than as another label. */
          className="grid grid-cols-1 gap-x-5 border-t border-border py-8 first:border-t-0 sm:grid-cols-[2.25rem_minmax(0,1fr)]"
        >
          <span
            aria-hidden="true"
            className="hidden font-display text-2xl font-light leading-none text-brand/40 sm:block sm:pt-1"
          >
            {c.n}
          </span>
          <div className={c.n ? undefined : "sm:col-span-2"}>
            <header className="mb-4">
              {c.n && (
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong sm:hidden">
                  Chapter {c.n}
                </span>
              )}
              <h2
                id={`ch-${c.key}-h`}
                className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground md:text-2xl"
              >
                {c.title}
              </h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{c.voice}</p>
            </header>
            <div className="space-y-5">
              {c.lines.map((line, li) => (
                <Line key={li} line={line} brief={brief} para={para} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/** One-tap fills for a blank. Buttons, not radios: they write text into the
    blank and step aside, so nothing here constrains the answer. */
export function Suggestions({ f, value, set }: { f: Blank; value: string; set: SetValue }) {
  if (!f.suggestions) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={`Suggestions for ${f.label}`}>
      {f.suggestions.map((o) => {
        const on = value.trim().toLowerCase() === o.toLowerCase();
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => set(f.name, on ? "" : o)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium leading-snug transition-colors ${
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {o}
          </button>
        );
      })}
      <span className="text-xs text-muted-foreground">{BRIEF_UI.suggestionsOr}</span>
    </div>
  );
}

/** "We value your time" — the quick note or the full story.

    Stacked, not side by side: the promise on top in the story's own voice,
    a one-line hint under it, then two equal buttons that each say what
    they are AND how long they take ("Quick note · 30 sec"). Side by side,
    a sentence-length heading and two pills fought for one row in the
    narrower story column. */
export function VersionToggle({ brief, className = "" }: { brief: Brief; className?: string }) {
  const { version, set } = brief;
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div>
        <p className="font-display text-[17px] font-semibold text-foreground">{BRIEF_SEND.question}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{BRIEF_SEND.questionHint}</p>
      </div>
      {/* Name over time, on purpose: "Quick note · 30 sec" on one line is
          wider than half a 390px phone and broke as "30 / sec". Two lines
          fit at every width and read as a deliberate segmented control. */}
      <div
        role="group"
        aria-label={BRIEF_SEND.question}
        className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary p-1"
      >
        {(["quick", "full"] as const).map((k) => {
          const v = BRIEF_VERSIONS[k];
          const on = version.key === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => set("version", k)}
              className={`flex flex-col items-center rounded-xl px-3 py-2 leading-tight transition-colors ${
                on ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="text-sm font-semibold">{v.label}</span>
              <span className="mt-0.5 text-xs font-normal text-muted-foreground">{v.time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Hidden from people, present for bots — see the action. */
export function Honeypot() {
  return (
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
  );
}

/** Sign-off, the "we still need…" line, the send button and its promises. */
export function SendFoot({
  brief,
  className = "",
  signoff = true,
}: {
  brief: Brief;
  className?: string;
  /** Off where the layout already shows the sign-off (the live letter). */
  signoff?: boolean;
}) {
  const { who, company, notice, pending, quick } = brief;
  return (
    <div className={className}>
      {signoff && (
        <p className={PARA}>
          {BRIEF_SEND.signoff}{" "}
          <span className={who ? "text-brand" : "text-faint"}>{who || "your name"}</span>
          {company && <span className="text-brand">, {company}</span>}
        </p>
      )}

      <p
        aria-live="polite"
        className={`${signoff ? "mt-5" : ""} rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          notice ? "bg-rose-500/10 text-foreground" : "sr-only"
        }`}
      >
        {notice}
      </p>

      <div className={`${notice || signoff ? "mt-6" : ""} flex flex-wrap items-center gap-x-8 gap-y-5`}>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex h-14 items-center gap-2 rounded-full bg-primary px-9 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? BRIEF_SEND.pending : quick ? BRIEF_SEND.ctaQuick : BRIEF_SEND.cta}
          <Icon name="arrow" className="size-5" />
        </button>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {BRIEF_SEND.meta.map((m) => (
            <li key={m} className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="text-accent-strong" aria-hidden="true">
                <Icon name="check" className="size-3.5" />
              </span>
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** What replaces the letter once it is sent.

    With a `stage` (the logo gathering), the two are ONE CARD — the dark logo
    side ~40%, the words ~60%, and on a phone the logo on top — so the mark
    reads as the signature on this message, not a banner over it, and the
    whole thing fits one laptop screen. They were two stacked sections until
    2026-09-11: the panel alone was ~450px, which pushed "It's with us…" to
    mid-screen and the next steps below the fold on a laptop.

    Without a stage (the envelope and no-animation variants) it is the plain
    card, steps in three columns. `className` carries the card surface. */
export function ThankYou({
  brief,
  className = "",
  stage,
}: {
  brief: Brief;
  className?: string;
  stage?: ReactNode;
}) {
  const { state, formId } = brief;
  if (state.status !== "sent") return null;
  const beside = !!stage;

  const words = (
    <>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        <span className="text-muted-foreground">{BRIEF_DONE.eyebrow}</span>
      </div>
      <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
        {state.firstName ? (
          <>
            {BRIEF_DONE.head}{" "}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              {state.firstName}.
            </span>
          </>
        ) : (
          BRIEF_DONE.headNoName
        )}
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">{BRIEF_DONE.lead}</p>

      {/* Beside the logo the steps are a short list — three columns in the
          narrower words side wrapped every body to four lines. */}
      <ol className={beside ? "mt-7 grid gap-4" : "mt-10 grid gap-6 sm:grid-cols-3"}>
        {BRIEF_DONE.steps.map((s, i) => {
          const body = s.body.replace("{contact}", state.contact || BRIEF_DONE.contactFallback);
          return beside ? (
            <li key={s.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <Icon name={s.k} className="size-4" />
              </span>
              <span>
                <strong className="block font-display text-[17px] font-semibold text-foreground">{s.title}</strong>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{body}</span>
              </span>
            </li>
          ) : (
            <li key={s.title} className="border-t-2 border-brand pt-4">
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-brand">
                <Icon name={s.k} className="size-4" />0{i + 1}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          );
        })}
      </ol>

      <div
        className={`${beside ? "mt-8" : "mt-10"} flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground`}
      >
        {state.ref !== "—" && (
          <span>
            {BRIEF_DONE.refLabel} <strong className="font-mono text-foreground">{state.ref}</strong>
          </span>
        )}
        <Link href="/" className="inline-flex items-center gap-2 font-medium text-primary hover:text-brand-light">
          {BRIEF_DONE.back}
          <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </>
  );

  /* No scroll-margin here: <html> already has `scroll-padding-top: 7rem`
     for the fixed nav (globals.css), and a `scroll-mt-32` on top of it
     parked the card 240px down — measured on every viewport — which put the
     bottom of this card off a 720px laptop. The page-wide 7rem is enough. */
  if (!beside) {
    return (
      <div id={`${formId}-done`} className={`self-start ${className}`}>
        {words}
      </div>
    );
  }
  return (
    <div
      id={`${formId}-done`}
      className={`grid self-start overflow-hidden lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] ${className}`}
    >
      <div className="min-w-0">{stage}</div>
      {/* p-10, not lg:p-12: the extra 16px was what the card overran a
          1280×720 screen by once it sat at the right scroll position. */}
      <div className="min-w-0 p-7 sm:p-10">{words}</div>
    </div>
  );
}
