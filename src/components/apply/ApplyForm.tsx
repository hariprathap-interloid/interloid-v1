"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { applyForRole, type ApplyState } from "@/app/careers/apply/actions";
import Icon from "@/components/Icon";
import {
  APPLY_ERRORS,
  APPLY_LABELS,
  type ApplyErrors,
  type ApplyField,
  MESSAGE_MAX,
  RESUME,
  checkApplication,
  checkResume,
  fileOf,
  formatBytes,
  readValues,
} from "@/content/apply";
import { ROLES } from "@/content/site";

/* ApplyForm — the trainee application.

   Sent from `onSubmit` through `startTransition`, not `<form action>`: React
   resets a form after an action runs, and a reset after a server-side error
   would throw away everything typed and the chosen CV with it.

   Errors come from two places: `local` (checked in the browser on submit,
   so an empty field never costs a 5 MB upload) and the server's reply. A
   field the applicant has touched since stops showing the server's error.

   No `data-reveal` in here: several classNames are computed from state, and
   React's next write would wipe Reveal's `is-in`. The page reveals the
   wrapper instead. */

const IDLE: ApplyState = { status: "idle" };
const ORDER: ApplyField[] = ["role", "firstName", "lastName", "phone", "linkedin", "resume", "message"];

const INPUT =
  "w-full rounded-2xl border bg-background px-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/55 hover:border-brand/40 focus:border-brand";

function Field({
  id,
  label,
  required,
  error,
  aside,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
          {required ? (
            <span className="text-rose-500" aria-hidden="true">
              {" "}*
            </span>
          ) : (
            <span className="ml-2 text-xs font-medium text-muted-foreground">Optional</span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-rose-700 dark:text-rose-400">
          <span className="mt-0.5 shrink-0">
            <Icon name="alert" className="size-3.5" />
          </span>
          {error}
        </p>
      )}
    </div>
  );
}

export default function ApplyForm({ initialRole }: { initialRole: string | null }) {
  const [state, dispatch, pending] = useActionState(applyForRole, IDLE);
  const [local, setLocal] = useState<ApplyErrors>({});
  const [edited, setEdited] = useState<ReadonlySet<ApplyField>>(new Set());
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "sent") doneRef.current?.scrollIntoView({ block: "center" });
  }, [state.status]);

  const server = state.status === "error" ? state.errors : {};
  const errorOf = (f: ApplyField) => local[f] ?? (edited.has(f) ? undefined : server[f]);
  const a11y = (f: ApplyField) => ({
    "aria-invalid": errorOf(f) ? true : undefined,
    "aria-describedby": errorOf(f) ? `apply-${f}-error` : undefined,
  });

  function touch(f: ApplyField) {
    setEdited((prev) => (prev.has(f) ? prev : new Set(prev).add(f)));
    setLocal((prev) => {
      if (!(f in prev)) return prev;
      const next = { ...prev };
      delete next[f];
      return next;
    });
  }

  function pick(f: File) {
    touch("resume");
    setFile({ name: f.name, size: f.size });
    const err = checkResume(f);
    if (err) setLocal((prev) => ({ ...prev, resume: err }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs = checkApplication(readValues(fd), fileOf(fd));
    setEdited(new Set());
    setLocal(errs);
    const first = ORDER.find((f) => errs[f]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    startTransition(() => dispatch(fd));
  }

  const card =
    "rounded-[2rem] border border-border bg-card p-6 shadow-[0_30px_80px_-15px_rgba(15,23,43,.12)] ring-1 ring-foreground/5 sm:p-10";

  if (state.status === "sent") {
    return (
      <div ref={doneRef} className={`${card} text-center`} role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-teal-600/10 text-teal-600 ring-1 ring-teal-600/20">
          <Icon name="check-circle" className="size-8" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Thanks{state.firstName ? `, ${state.firstName}` : ""}.
          <br />
          <span className="bg-linear-to-r from-brand to-accent bg-clip-text text-transparent">
            Your application is in.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[17px] leading-[1.7] text-muted-foreground">
          {state.role ? `We have your application for ${state.role}. ` : ""}An engineer reads every
          one, and you will hear back either way.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Reference <strong className="font-mono font-semibold text-foreground">{state.ref}</strong>
        </p>
        <Link
          href="/careers"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-[15px] font-semibold text-foreground shadow-sm transition-colors hover:border-brand/40 active:scale-95"
        >
          Back to careers
          <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    );
  }

  const roleErr = errorOf("role");
  const resumeErr = errorOf("resume");

  return (
    <div className={card}>
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        {/* ── role ─────────────────────────────────────────────────────── */}
        <fieldset aria-describedby={roleErr ? "apply-role-error" : undefined}>
          <legend className="mb-3 text-sm font-semibold text-foreground">
            {APPLY_LABELS.role}
            <span className="text-rose-500" aria-hidden="true">
              {" "}*
            </span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((r, i) => (
              <label key={r.id} className="relative block cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r.id}
                  defaultChecked={r.id === initialRole}
                  data-field={i === 0 ? "role" : undefined}
                  onChange={() => touch("role")}
                  className="peer sr-only"
                />
                <span
                  className={`flex min-h-16 flex-col justify-center rounded-2xl border bg-background py-3 pl-4 pr-12 transition-[border-color,background-color,box-shadow] duration-200 hover:border-brand/40 peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:shadow-[inset_0_0_0_1px_var(--color-brand)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card ${
                    roleErr ? "border-rose-500" : "border-input"
                  }`}
                >
                  <span className="font-display text-[15px] font-semibold text-foreground">
                    {r.title.replace(" (Trainee)", "")}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{r.track}</span>
                </span>
                <span
                  className="pointer-events-none absolute right-4 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full border border-input bg-background text-transparent transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white"
                  aria-hidden="true"
                >
                  <Icon name="check" className="size-3" />
                </span>
              </label>
            ))}
          </div>
          {roleErr && (
            <p id="apply-role-error" className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-rose-700 dark:text-rose-400">
              <span className="mt-0.5 shrink-0">
                <Icon name="alert" className="size-3.5" />
              </span>
              {roleErr}
            </p>
          )}
        </fieldset>

        {/* ── about you ────────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Field id="apply-firstName" label={APPLY_LABELS.firstName} required error={errorOf("firstName")}>
            <input
              id="apply-firstName"
              name="firstName"
              data-field="firstName"
              autoComplete="given-name"
              maxLength={80}
              onChange={() => touch("firstName")}
              className={`${INPUT} h-12 ${errorOf("firstName") ? "border-rose-500" : "border-input"}`}
              {...a11y("firstName")}
            />
          </Field>
          <Field id="apply-lastName" label={APPLY_LABELS.lastName} required error={errorOf("lastName")}>
            <input
              id="apply-lastName"
              name="lastName"
              data-field="lastName"
              autoComplete="family-name"
              maxLength={80}
              onChange={() => touch("lastName")}
              className={`${INPUT} h-12 ${errorOf("lastName") ? "border-rose-500" : "border-input"}`}
              {...a11y("lastName")}
            />
          </Field>
          <Field id="apply-phone" label={APPLY_LABELS.phone} required error={errorOf("phone")}>
            <input
              id="apply-phone"
              name="phone"
              data-field="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              placeholder="e.g. +91 98765 43210"
              onChange={() => touch("phone")}
              className={`${INPUT} h-12 ${errorOf("phone") ? "border-rose-500" : "border-input"}`}
              {...a11y("phone")}
            />
          </Field>
          <Field id="apply-linkedin" label={APPLY_LABELS.linkedin} error={errorOf("linkedin")}>
            <input
              id="apply-linkedin"
              name="linkedin"
              data-field="linkedin"
              type="url"
              inputMode="url"
              autoComplete="url"
              maxLength={300}
              placeholder="e.g. linkedin.com/in/your-name"
              onChange={() => touch("linkedin")}
              className={`${INPUT} h-12 ${errorOf("linkedin") ? "border-rose-500" : "border-input"}`}
              {...a11y("linkedin")}
            />
          </Field>
        </div>

        {/* ── CV ───────────────────────────────────────────────────────── */}
        <Field id="apply-resume" label={APPLY_LABELS.resume} required error={resumeErr} className="mt-8">
          <label
            htmlFor="apply-resume"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const dropped = e.dataTransfer.files[0];
              if (!dropped || !fileRef.current) return;
              const dt = new DataTransfer();
              dt.items.add(dropped);
              fileRef.current.files = dt.files;
              pick(dropped);
            }}
            className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-7 text-center transition-colors has-[input:focus-visible]:border-brand has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40 sm:flex-row sm:text-left ${
              resumeErr
                ? "border-rose-500 bg-rose-500/5"
                : dragging
                  ? "border-brand bg-brand/5"
                  : file
                    ? "border-brand/40 bg-brand/5"
                    : "border-input bg-secondary/60 hover:border-brand/50 hover:bg-brand/5"
            }`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
              <Icon name={file && !resumeErr ? "check-circle" : "doc"} className="size-6" />
            </span>
            <span className="min-w-0 max-w-full flex-1">
              {file ? (
                <>
                  <span className="block truncate font-semibold text-foreground">{file.name}</span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    {formatBytes(file.size)} · choose another file
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-semibold text-foreground">
                    Drop your CV here, or{" "}
                    <span className="text-primary underline underline-offset-4">browse</span>
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    PDF, DOC or DOCX, up to 5 MB
                  </span>
                </>
              )}
            </span>
            <input
              ref={fileRef}
              id="apply-resume"
              name="resume"
              data-field="resume"
              type="file"
              accept={RESUME.accept}
              onChange={(e) => {
                const chosen = e.target.files?.[0];
                if (chosen) pick(chosen);
                else {
                  touch("resume");
                  setFile(null);
                }
              }}
              className="sr-only"
              {...a11y("resume")}
            />
          </label>
        </Field>

        {/* ── message ──────────────────────────────────────────────────── */}
        <Field
          id="apply-message"
          label={APPLY_LABELS.message}
          error={errorOf("message")}
          className="mt-8"
          aside={
            <span className="text-xs tabular-nums text-muted-foreground">
              {messageLength} / {MESSAGE_MAX}
            </span>
          }
        >
          <textarea
            id="apply-message"
            name="message"
            data-field="message"
            rows={6}
            maxLength={MESSAGE_MAX}
            placeholder="Something you built, why this stack, or anything you want us to know before we call."
            onChange={(e) => setMessageLength(e.target.value.length)}
            className={`${INPUT} min-h-40 resize-y border-input py-3 leading-[1.6]`}
          />
        </Field>

        {/* Honeypot. Hidden from people and from assistive tech. */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {state.status === "error" && state.failed && (
          <p role="alert" className="mt-8 rounded-2xl bg-rose-500/10 px-4 py-3 text-[15px] leading-relaxed text-foreground">
            {APPLY_ERRORS.failed}
          </p>
        )}

        <div className="mt-10 flex flex-col-reverse gap-5 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 text-accent-strong">
              <Icon name="lock" className="size-4" />
            </span>
            Read by the engineers doing the hiring.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-[background-color,box-shadow] duration-300 hover:bg-brand-light hover:shadow-primary/40 active:scale-95 disabled:cursor-wait disabled:opacity-70 sm:text-[17px]"
          >
            {pending ? "Sending…" : "Send application"}
            <span className="transition-transform group-hover:translate-x-1">
              <Icon name="arrow" className="size-5" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
