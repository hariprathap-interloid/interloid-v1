"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { sendStory, type BriefState } from "@/app/content/actions";
import {
  BRIEF_DONE,
  BRIEF_REACH,
  BRIEF_SEND,
  BRIEF_VERSIONS,
  fieldsOf,
  isReachable,
  missingMessage,
  type Blank,
  type Field,
  type Long,
} from "@/content/brief";

/* ==========================================================================
   StoryBrief — the letter card on /content.
   ==========================================================================
   Renders ONLY the card — the letter, or the thank-you that replaces it. The
   page owns the layout (the spread, the ground, the left-hand column); this
   is the right-hand column's content, so it carries no section or shell.

   Two letters from content/brief.ts — the short version (three blanks) and
   the full story (four chapters) — behind one toggle. They share field
   names, so a visitor who starts one and switches keeps what they typed.

   A string is prose, a `blank` is an input sitting in the sentence, and a
   `long` opens a space under the sentence. A blank with `suggestions` shows
   them as one-tap fills under the sentence; the blank stays typeable, so no
   answer is ever limited to our list.

   ── THE DRAFT, WITHOUT setState IN AN EFFECT ─────────────────────────────
   The draft (answers + which version) lives in localStorage. Reading it into
   state from an effect is the cascading render the react-hooks lint rejects
   (see Nav's theme note), and a lazy useState initialiser would mismatch the
   server HTML. So it is external state: useSyncExternalStore gives `null` on
   the server and the stored string on the client, and `edits` — null until
   the visitor types — overrides it. Writing back is a debounced effect that
   touches only storage, never React state.

   ── WHY onSubmit AND NOT <form action> ───────────────────────────────────
   React 19 resets a form after an action passed to `action` completes. On a
   "we still need your email" reply that would blank every controlled input's
   DOM value while state still held it. Dispatching from onSubmit inside a
   transition keeps useActionState's pending/state and skips the reset.

   No `data-reveal` in here: every className is computed from state, and
   Reveal's `is-in` would be wiped by React's next write (see Faq's note). */

const KEY = "interloid-story-draft";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const readDraft = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const noDraft = () => null;

const IDLE: BriefState = { status: "idle" };

type Set = (name: string, value: string) => void;

const PARA = "font-display text-xl leading-loose text-foreground md:text-[1.4rem]";

/* The card. Lifted off the secondary ground by a long, soft shadow rather
   than the site's `shadow-sm` — on a tinted ground a 1px shadow reads as a
   border, and this is the one object on the page that should come forward. */
const CARD =
  "min-w-0 rounded-[2rem] border border-border bg-card shadow-[0_30px_60px_-30px_rgba(15,23,43,.28)]";

/* ── the two kinds of blank, and the suggestions ──────────────────────── */

function InlineBlank({
  f,
  value,
  set,
  invalid,
}: {
  f: Blank;
  value: string;
  set: Set;
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
      className={`mx-1 max-w-[calc(100%-0.75rem)] border-0 border-b-2 bg-transparent px-1 pb-0.5 font-display font-medium text-brand outline-none transition-colors placeholder:font-normal placeholder:text-faint focus:border-solid ${
        invalid ? "border-rose-500" : "border-dashed border-brand/35 focus:border-brand"
      }`}
    />
  );
}

function OpenSpace({
  f,
  value,
  set,
  invalid,
}: {
  f: Long;
  value: string;
  set: Set;
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

/** One-tap fills for a blank. Buttons, not radios: they write text into the
    blank and step aside, so nothing here constrains the answer. */
function Suggestions({ f, value, set }: { f: Blank; value: string; set: Set }) {
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
      <span className="text-xs text-muted-foreground">or type your own</span>
    </div>
  );
}

/* ── the letter ───────────────────────────────────────────────────────── */

export default function StoryBrief() {
  const saved = useSyncExternalStore(subscribe, readDraft, noDraft);
  const restored = useMemo<Record<string, string>>(() => {
    if (!saved) return {};
    try {
      const o = JSON.parse(saved);
      return o && typeof o === "object" ? o : {};
    } catch {
      return {};
    }
  }, [saved]);

  const [edits, setEdits] = useState<Record<string, string> | null>(null);
  const values = edits ?? restored;
  const set: Set = (name, value) =>
    setEdits((prev) => ({ ...(prev ?? restored), [name]: value }));

  const version = values.version === "quick" ? BRIEF_VERSIONS.quick : BRIEF_VERSIONS.full;
  const quick = version.key === "quick";

  const [state, dispatch, pending] = useActionState(sendStory, IDLE);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  /* Save as they type. Skipped once sent, so the cleared draft stays clear. */
  useEffect(() => {
    if (!edits || state.status === "sent") return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(edits));
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [edits, state.status]);

  /* After a reply: clear the draft and bring the thank-you into view, or
     take the visitor to the first blank we still need. */
  useEffect(() => {
    if (state.status === "sent") {
      try {
        localStorage.removeItem(KEY);
      } catch {}
      doneRef.current?.scrollIntoView({ block: "start" });
    } else if (state.status === "error" && state.missing.length) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${state.missing[0]}"]`)
        ?.focus();
    }
  }, [state]);

  if (state.status === "sent") {
    return (
      <div ref={doneRef} className={`${CARD} scroll-mt-32 self-start p-8 sm:p-12`}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          <span className="text-muted-foreground">{BRIEF_DONE.eyebrow}</span>
        </div>
        <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
          {BRIEF_DONE.head}{" "}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            {state.firstName ? `${state.firstName}.` : "thank you."}
          </span>
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">{BRIEF_DONE.lead}</p>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {BRIEF_DONE.steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-brand pt-4">
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-brand">
                <Icon name={s.k} className="size-4" />0{i + 1}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {i === 1 && state.contact ? `At ${state.contact}. ${s.body}` : s.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
          {state.ref !== "—" && (
            <span>
              Your reference <strong className="font-mono text-foreground">{state.ref}</strong>
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
      </div>
    );
  }

  /* The reply lists what was missing WHEN IT WAS SENT. What the visitor sees
     is worked out live from that: only blanks still missing, and only in the
     version that was sent — so filling a blank, or switching versions,
     clears its part of the message instead of leaving a stale one. */
  const reachNames: readonly string[] = BRIEF_REACH.fields;
  const stillMissing = (name: string) =>
    reachNames.includes(name) ? !isReachable(values) : !values[name]?.trim();
  const open =
    state.status === "error" && state.version === version.key
      ? state.missing.filter(stillMissing)
      : [];
  const labels = new Map(fieldsOf(version.chapters).map((f) => [f.name, f.label]));
  const notice =
    state.status === "error" && !state.missing.length
      ? BRIEF_SEND.failed
      : open.length
        ? missingMessage(open.map((n) => (reachNames.includes(n) ? BRIEF_REACH.label : labels.get(n) ?? n)))
        : "";
  const invalid = (f: Field) =>
    reachNames.includes(f.name) ? open.includes(BRIEF_REACH.fields[0]) : open.includes(f.name);
  const who = values.name?.trim();
  const company = values.company?.trim();

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => dispatch(fd));
      }}
      className={CARD}
    >
      {/* Honeypot — see the action. Hidden from people, present for bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input type="hidden" name="version" value={version.key} />

      {/* The card's head: the toggle, on its own strip, so "how much time do
          you have?" is the first thing answered and reads as a setting of
          the letter rather than as another question in it. */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
          {BRIEF_SEND.question}
        </span>
        <div
          role="group"
          aria-label={BRIEF_SEND.question}
          className="inline-flex self-start rounded-full border border-border bg-secondary p-1 sm:self-auto"
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  on ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {v.time}
                <span className="hidden md:inline"> · {v.label.toLowerCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 sm:px-10 lg:px-12">
        {version.chapters.map((c) => (
          <section
            key={c.key}
            aria-labelledby={`ch-${c.key}-h`}
            /* Chapter number in its own gutter from `sm:` — the prose then
               starts on one clean edge down the whole letter, and the
               numerals read as a margin index rather than as another label. */
            className="grid grid-cols-1 gap-x-6 border-t border-border py-9 first:border-t-0 sm:grid-cols-[2.5rem_minmax(0,1fr)]"
          >
            <span
              aria-hidden="true"
              className="hidden font-display text-2xl font-light leading-none text-brand/40 sm:block sm:pt-1"
            >
              {c.n}
            </span>
            <div className={c.n ? undefined : "sm:col-span-2"}>
              <header className="mb-5">
                {c.n && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong sm:hidden">
                    Chapter {c.n}
                  </span>
                )}
                <h2
                  id={`ch-${c.key}-h`}
                  className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-[1.75rem]"
                >
                  {c.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{c.voice}</p>
              </header>

              <div className="space-y-6">
                {c.lines.map((line, li) => {
                  const below = line.filter((s): s is Field => typeof s !== "string");
                  return (
                    <div key={li}>
                      <p className={PARA}>
                        {line.map((s, si) => {
                          /* Punctuation right after a blank is glued to it
                             (nowrap), so a wrapping blank never leaves its
                             full stop alone on the next line. */
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
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* The card's foot: sign-off and send on the secondary tint, so the
          close of the letter reads as its own moment — and the send button
          sits on the same edge as the prose above it. */}
      <div className="rounded-b-[2rem] border-t border-border bg-secondary/50 px-6 py-8 sm:px-10 lg:px-12">
        <p className={PARA}>
          {BRIEF_SEND.signoff}{" "}
          <span className={who ? "text-brand" : "text-faint"}>{who || "your name"}</span>
          {company && <span className="text-brand">, {company}</span>}
        </p>

        <p
          aria-live="polite"
          className={`mt-5 rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            notice ? "bg-rose-500/10 text-foreground" : "sr-only"
          }`}
        >
          {notice}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5">
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
    </form>
  );
}
