"use client";

import { useState } from "react";

/* HANDOFF §8 convention: every prototype ships a "Show placeholders" toggle,
   and it outlines every unproven claim on the page. Keep it until §7's content
   gates are closed — it is the fastest way to see what still cannot be
   defended in a sales call. */
export default function PlaceholderToggle() {
  const [on, setOn] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        document.body.classList.toggle("show-ph");
        setOn((v) => !v);
      }}
      className="fixed bottom-5 right-5 z-100 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-xl transition-colors hover:bg-primary"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {on ? "Hide placeholders" : "Show placeholders"}
    </button>
  );
}
