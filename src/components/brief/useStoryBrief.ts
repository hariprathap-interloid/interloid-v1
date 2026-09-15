import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { sendStory, type BriefState } from "@/app/contact/actions";
import {
  BRIEF_REACH,
  BRIEF_VERSIONS,
  fieldsOf,
  isReachable,
  missingMessage,
  type Field,
} from "@/content/brief";

/* useStoryBrief — everything about the story letter that is not layout: the
   answers, the draft, which version, the send, and what is still missing.

   ── THE DRAFT, WITHOUT setState IN AN EFFECT ─────────────────────────────
   The draft (answers + which version) lives in localStorage. Reading it into
   state from an effect is a cascading render the react-hooks lint rejects,
   and a lazy useState initialiser would mismatch the server HTML. So it is
   external state: useSyncExternalStore gives `null` on the server and the
   stored string on the client, and `edits` (null until the visitor types)
   overrides it. Writing back is a debounced effect that touches only
   storage, never React state.

   ── THE SEND IS BUILT FROM STATE, NOT FROM THE PAGE ──────────────────────
   `submit` assembles the FormData from `values`, not from the <form>'s
   inputs, so a blank that is not currently mounted is still sent. Only the
   honeypot is read from the page, because a person never sets it.

   ── WHY onSubmit AND NOT <form action> ───────────────────────────────────
   React 19 resets a form after an action passed to `action` completes, which
   would blank every controlled input's DOM value on a "we still need…"
   reply. Dispatching inside a transition keeps pending/state and skips it. */

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

export type SetValue = (name: string, value: string) => void;

export function useStoryBrief() {
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
  const set: SetValue = (name, value) =>
    setEdits((prev) => ({ ...(prev ?? restored), [name]: value }));

  const version = values.version === "quick" ? BRIEF_VERSIONS.quick : BRIEF_VERSIONS.full;
  const fields = useMemo(() => fieldsOf(version.chapters), [version]);

  const [state, dispatch, pending] = useActionState(sendStory, IDLE);
  /* The letter's <form> and its thank-you are found by ID, not by ref: refs
     inside the returned object trip react-hooks/refs ("cannot access refs
     during render") wherever that object is passed down as a prop. The
     layout puts `id={formId}` on its form; ThankYou puts `${formId}-done`
     on itself. */
  const formId = useId();

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
     focus the first blank we still need, if it is on the page. */
  useEffect(() => {
    if (state.status === "sent") {
      try {
        localStorage.removeItem(KEY);
      } catch {}
      document.getElementById(`${formId}-done`)?.scrollIntoView({ block: "start" });
    } else if (state.status === "error" && state.missing.length) {
      document
        .getElementById(formId)
        ?.querySelector<HTMLElement>(`[name="${state.missing[0]}"]`)
        ?.focus();
    }
  }, [state, formId]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    for (const f of fields) fd.set(f.name, values[f.name] ?? "");
    fd.set("version", version.key);
    const trap = e.currentTarget.elements.namedItem("website");
    fd.set("website", trap instanceof HTMLInputElement ? trap.value : "");
    startTransition(() => dispatch(fd));
  };

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
  const labels = new Map(fields.map((f) => [f.name, f.label]));
  const notice = open.length
    ? missingMessage(
        open.map((n) => (reachNames.includes(n) ? BRIEF_REACH.label : labels.get(n) ?? n)),
      )
    : "";
  const invalid = (f: Field) =>
    reachNames.includes(f.name) ? open.includes(BRIEF_REACH.fields[0]) : open.includes(f.name);

  return {
    values,
    set,
    version,
    quick: version.key === "quick",
    state,
    pending,
    submit,
    /** Put on the layout's <form>; `${formId}-done` marks the thank-you. */
    formId,
    notice,
    invalid,
    /** Answered blanks out of all blanks in the current version. */
    progress: { filled: fields.filter((f) => values[f.name]?.trim()).length, total: fields.length },
    who: values.name?.trim() ?? "",
    company: values.company?.trim() ?? "",
  };
}

export type Brief = ReturnType<typeof useStoryBrief>;
