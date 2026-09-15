"use client";

import { useEffect } from "react";

/* A dismissible notice pinned to the bottom of the screen. It announces
   politely to screen readers, closes on Escape or after `duration`, and never
   takes focus away from the form the visitor is filling in. */
export default function Toast({
  open,
  title,
  children,
  onClose,
  duration = 8000,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[300] flex justify-center sm:bottom-6"
    >
      {open && (
        <div className="toast-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-ink p-4 text-ink-foreground shadow-[0_24px_60px_-20px_rgba(2,6,24,.7)] sm:p-5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-semibold text-white">{title}</p>
            <div className="mt-1 text-sm leading-relaxed text-ink-foreground/80">{children}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notice"
            className="on-dark -m-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-foreground/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
