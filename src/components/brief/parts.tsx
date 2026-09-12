"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/Icon";
import {
  BRIEF_DONE,
  BRIEF_REACH,
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

/* The /contact scale — raised 2026-09-11 ("the contact form is very small").
   PARA is the STORY (the sentences you write into); PARA_MD is the LETTER,
   one step smaller so the story leads and the letter follows. Each grows
   once more on wide screens (2xl, ≥1536px), where 20px sentences in a
   1600px shell read as fine print. */
export const PARA =
  "font-display text-xl leading-loose text-foreground md:text-2xl 2xl:text-[1.75rem]";
export const PARA_MD =
  "font-display text-lg leading-loose text-foreground md:text-xl 2xl:text-2xl";

/* The card. Lifted off a tinted ground by a long, soft shadow rather than
   the site's `shadow-sm` — on a tinted ground a 1px shadow reads as a
   border, and the letter is the one object that should come forward. */
export const CARD =
  "min-w-0 rounded-[1.5rem] border border-border bg-card shadow-[0_30px_60px_-30px_rgba(15,23,43,.28)]";

/* ── the two kinds of blank ───────────────────────────────────────────── */

export function InlineBlank({
  f,
  value,
  set,
  invalid,
  describedBy,
}: {
  f: Blank;
  value: string;
  set: SetValue;
  invalid: boolean;
  /** The id of this blank's error message, while it has one. */
  describedBy?: string;
}) {
  /* ── SIZED BY ITS OWN TEXT, AND WRAPPING (rebuilt 2026-09-11) ─────────
     The blank was an <input> sized with `size` — a count of AVERAGE
     characters, which in a proportional face is badly wrong: the box ran
     far wider than the words, so the full stop after it floated mid-line
     and "I'm Asha" sat a thumb's width from "from". And an <input> is one
     line: a long answer scrolled sideways inside it instead of wrapping.

     Now an invisible copy of the text (or the hint while empty) sits in
     the flow and alone sets the size; the real field is laid ABSOLUTELY
     over it. The box is exactly as wide as the words, up to the line; past
     that the copy wraps — long unspaced words included
     (overflow-wrap:anywhere) — and the box grows DOWN, the textarea filling
     it. Email and phone stay one-line <input>s so a phone still shows the
     right keyboard; they are short by nature. Enter never adds a line: a
     blank is part of a sentence, not a paragraph.

     Absolute, not a shared grid cell: a first version put both in one
     inline-grid cell, and the field's own INTRINSIC width (a textarea's
     default ~20 columns) still sized the track — "Asha" measured 212px. An
     absolutely-positioned field contributes nothing to its parent's size. */
  const wraps = f.type !== "email" && f.type !== "tel";
  /* `blank-in-text`: its focus style lives in globals.css — see there for
     why a utility class cannot override the global ring. */
  const skin = `blank-in-text absolute inset-0 size-full border-0 border-b-2 bg-transparent px-1 pb-0.5 font-display font-medium text-primary outline-none transition-colors placeholder:font-normal placeholder:text-hint focus:border-solid ${
    invalid
      ? "border-rose-500"
      : "border-dashed border-brand/35 focus:border-brand"
  }`;
  const common = {
    name: f.name,
    value,
    placeholder: f.hint,
    "aria-label": f.label,
    "aria-required": f.required || undefined,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
    autoComplete: f.autoComplete ?? "off",
    maxLength: 300,
  };

  return (
    /* Capped short of 100% so the glued full stop beside it still fits. */
    <span className="relative mx-1 inline-block min-w-[3ch] max-w-[calc(100%-0.75rem)] leading-snug">
      <span
        aria-hidden="true"
        className={
          wraps
            ? "invisible block whitespace-pre-wrap border-b-2 border-transparent px-1 pb-0.5 font-display font-medium [overflow-wrap:anywhere]"
            : "invisible block whitespace-pre border-b-2 border-transparent px-1 pb-0.5 font-display font-medium"
        }
      >
        {/* The trailing space is room for the caret at the end. */}
        {`${value || f.hint} `}
      </span>
      {wraps ? (
        <textarea
          {...common}
          rows={1}
          onChange={(e) =>
            set(f.name, e.target.value.replace(/\s*\n\s*/g, " "))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className={`${skin} resize-none overflow-hidden [overflow-wrap:anywhere]`}
        />
      ) : (
        <input
          {...common}
          type={f.type ?? "text"}
          onChange={(e) => set(f.name, e.target.value)}
          className={skin}
        />
      )}
    </span>
  );
}

export function OpenSpace({
  f,
  value,
  set,
  invalid,
  describedBy,
}: {
  f: Long;
  value: string;
  set: SetValue;
  invalid: boolean;
  describedBy?: string;
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
      aria-describedby={describedBy}
      rows={3}
      maxLength={4000}
      className={`mt-4 block min-h-[6.5rem] w-full resize-y rounded-2xl border bg-secondary/30 p-4 font-display text-lg leading-relaxed text-primary outline-none transition-colors field-sizing-content placeholder:text-[15px] placeholder:leading-relaxed placeholder:text-hint focus:border-solid focus:bg-card ${
        invalid
          ? "border-rose-500"
          : "border-dashed border-brand/30 focus:border-brand"
      }`}
    />
  );
}

/* ── the `*` and the error icon (2026-09-11) ─────────────────────────────
   Every blank we need to reply carries a small `*` (the key sits under the
   version toggle). After a send that came back without it, the `*` turns
   into an alert icon. Hovering the icon shows why — and so does focusing
   any blank in that sentence, which is how a phone, with no hover, gets the
   message (the send moves focus to the first missing blank for them). The
   field is `aria-describedby` the message too, so a screen reader hears it.

   The bubble is anchored to the whole LINE (the icon itself is not
   positioned), left-aligned above the sentence: a bubble centred on the
   icon ran off the card whenever the blank sat near either edge. */
const REACH_NAMES: readonly string[] = BRIEF_REACH.fields;
const isNeeded = (f: Field) => !!f.required || REACH_NAMES.includes(f.name);
const errorOf = (f: Field) =>
  f.error ?? (REACH_NAMES.includes(f.name) ? BRIEF_REACH.error : undefined);

function Needed({ id, bad, error }: { id: string; bad: boolean; error?: string }) {
  if (!bad) {
    return (
      <span
        aria-hidden="true"
        className="align-super text-[0.6em] font-bold leading-none text-accent-strong"
      >
        *
      </span>
    );
  }
  return (
    <span className="group/err ml-0.5 inline-flex cursor-help align-[-0.1em] text-rose-500">
      <Icon name="alert" className="size-[0.85em]" />
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-20 mb-1 w-max max-w-full translate-y-1 whitespace-normal rounded-lg bg-foreground px-3 py-2 font-sans text-sm font-medium leading-snug text-background opacity-0 shadow-lg transition duration-150 group-hover/err:translate-y-0 group-hover/err:opacity-100 group-focus-within/line:translate-y-0 group-focus-within/line:opacity-100 motion-reduce:transition-none"
      >
        {error}
      </span>
    </span>
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
  const { values, set, invalid, formId } = brief;
  const below = line.filter((s): s is Field => typeof s !== "string");
  /* A long answer opens under the sentence; its `*` ends the sentence. */
  const longs = below.filter((s): s is Long => s.kind === "long" && isNeeded(s));
  const errId = (f: Field) => `${formId}-${f.name}-err`;
  return (
    <div className="group/line relative">
      <p className={para}>
        {line.map((s, si) => {
          /* Punctuation right after a blank is glued to it (nowrap), so a
             wrapping blank never leaves its full stop alone on a line. */
          const prev = line[si - 1];
          if (typeof s === "string") {
            const afterBlank =
              typeof prev !== "string" && prev?.kind === "blank";
            const text = afterBlank ? s.replace(/^[.,]/, "") : s;
            return text ? <span key={si}>{text}</span> : null;
          }
          if (s.kind !== "blank") return null; /* a `long` opens below */
          const next = line[si + 1];
          const glue =
            typeof next === "string" ? (next.match(/^[.,]/)?.[0] ?? "") : "";
          const bad = invalid(s);
          return (
            <span key={s.name} className="whitespace-nowrap">
              <InlineBlank
                f={s}
                value={values[s.name] ?? ""}
                set={set}
                invalid={bad}
                describedBy={bad ? errId(s) : undefined}
              />
              {isNeeded(s) && <Needed id={errId(s)} bad={bad} error={errorOf(s)} />}
              {glue}
            </span>
          );
        })}
        {longs.map((s) => (
          <Needed key={s.name} id={errId(s)} bad={invalid(s)} error={errorOf(s)} />
        ))}
      </p>
      {below.map((s) =>
        s.kind === "long" ? (
          <OpenSpace
            key={s.name}
            f={s}
            value={values[s.name] ?? ""}
            set={set}
            invalid={invalid(s)}
            describedBy={invalid(s) ? errId(s) : undefined}
          />
        ) : (
          <Suggestions
            key={s.name}
            f={s}
            value={values[s.name] ?? ""}
            set={set}
          />
        ),
      )}
    </div>
  );
}

/** Every chapter of the current version, numbers in their own gutter. */
export function Chapters({
  brief,
  para = PARA,
}: {
  brief: Brief;
  para?: string;
}) {
  return (
    <>
      {brief.version.chapters.map((c) => (
        <section
          key={c.key}
          aria-labelledby={`ch-${c.key}-h`}
          /* NO NUMBER GUTTER (removed 2026-09-11, user request). The 2.25rem
             numeral column plus its gap pushed every sentence ~56px in from
             the card's edge, so the story read one-sided and the blanks lost
             that width. The number now rides above the title as a small
             label — what phones already showed — and the prose starts on the
             card's own edge. */
          className="border-t border-border py-10 first:border-t-0 2xl:py-12"
        >
          <header className="mb-6">
            {c.n && (
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent-strong">
                Chapter {c.n}
              </span>
            )}
            <h2
              id={`ch-${c.key}-h`}
              className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-[1.75rem] 2xl:text-[2rem]"
            >
              {c.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground 2xl:text-[17px]">
              {c.voice}
            </p>
          </header>
          <div className="space-y-6">
            {c.lines.map((line, li) => (
              <Line key={li} line={line} brief={brief} para={para} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

/** One-tap fills for a blank. Buttons, not radios: they write text into the
    blank and step aside, so nothing here constrains the answer. */
export function Suggestions({
  f,
  value,
  set,
}: {
  f: Blank;
  value: string;
  set: SetValue;
}) {
  if (!f.suggestions) return null;
  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-2.5"
      aria-label={`Suggestions for ${f.label}`}
    >
      {f.suggestions.map((o) => {
        const on = value.trim().toLowerCase() === o.toLowerCase();
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => set(f.name, on ? "" : o)}
            className={`rounded-full border px-4 py-2 text-[15px] font-medium leading-snug transition-colors ${
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {o}
          </button>
        );
      })}
      <span className="text-sm text-muted-foreground">
        {BRIEF_UI.suggestionsOr}
      </span>
    </div>
  );
}

/** "We value your time" — the quick note or the full story.

    Stacked, not side by side: the promise on top in the story's own voice,
    a one-line hint under it, then two equal buttons that each say what
    they are AND how long they take ("Quick note · 30 sec"). Side by side,
    a sentence-length heading and two pills fought for one row in the
    narrower story column. */
export function VersionToggle({
  brief,
  className = "",
}: {
  brief: Brief;
  className?: string;
}) {
  const { version, set } = brief;
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div>
        <p className="font-display text-xl font-semibold text-foreground 2xl:text-[1.35rem]">
          {BRIEF_SEND.question}
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {BRIEF_SEND.questionHint}
        </p>
      </div>
      {/* Name over time, on purpose: "Quick note · 30 sec" on one line is
          wider than half a 390px phone and broke as "30 / sec". Two lines
          fit at every width and read as a deliberate segmented control. */}
      <div
        role="group"
        aria-label={BRIEF_SEND.question}
        className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary p-2"
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
              className={`flex flex-col items-center rounded-xl px-4 py-3 leading-tight transition-colors ${
                on
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="text-base font-semibold">{v.label}</span>
              <span className="mt-1 text-sm font-normal text-muted-foreground">
                {v.time}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        <span aria-hidden="true" className="font-bold text-accent-strong">
          *
        </span>{" "}
        {BRIEF_UI.requiredNote}
      </p>
    </div>
  );
}

/** Hidden from people, present for bots — see the action. */
export function Honeypot() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="hidden"
    />
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
          <span className={who ? "text-primary" : "text-hint"}>
            {who || "your name"}
          </span>
          {company && <span className="text-primary">, {company}</span>}
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

      <div
        className={`${notice || signoff ? "mt-6" : ""} flex flex-wrap items-center gap-x-8 gap-y-5`}
      >
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex h-16 items-center gap-2 rounded-full bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          {pending
            ? BRIEF_SEND.pending
            : quick
              ? BRIEF_SEND.ctaQuick
              : BRIEF_SEND.cta}
          <Icon name="arrow" className="size-5" />
        </button>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {BRIEF_SEND.meta.map((m) => (
            <li
              key={m}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
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
      <ol
        className={
          beside ? "mt-7 grid gap-4" : "mt-10 grid gap-6 sm:grid-cols-3"
        }
      >
        {BRIEF_DONE.steps.map((s, i) => {
          const body = s.body.replace(
            "{contact}",
            state.contact || BRIEF_DONE.contactFallback,
          );
          return beside ? (
            <li
              key={s.title}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <Icon name={s.k} className="size-4" />
              </span>
              <span>
                <strong className="block font-display text-[17px] font-semibold text-foreground">
                  {s.title}
                </strong>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                  {body}
                </span>
              </span>
            </li>
          ) : (
            <li key={s.title} className="border-t-2 border-brand pt-4">
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-primary">
                <Icon name={s.k} className="size-4" />0{i + 1}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          );
        })}
      </ol>

      <div
        className={`${beside ? "mt-8" : "mt-10"} flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground`}
      >
        {state.ref !== "—" && (
          <span>
            {BRIEF_DONE.refLabel}{" "}
            <strong className="font-mono text-foreground">{state.ref}</strong>
          </span>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-medium text-primary hover:text-brand-light"
        >
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
