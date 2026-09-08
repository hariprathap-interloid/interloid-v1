"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Icon from "../Icon";
import { SERVICE_MODES, type ServiceMode } from "@/content/service";

/* ==========================================================================
   THE PAGE'S SPINE — which of the two buyers is reading.
   ==========================================================================
   SERVICE-PAGE-RESEARCH.md §3.1: the reference pages speak to exactly one
   customer ("we will build this for you"), so a visitor who wants engineers
   INSIDE THEIR OWN TEAM has nowhere to land. Interloid has two audiences of
   roughly equal weight, and the page's answer is to let the visitor say which
   they are — once, in the hero — and then answer them specifically in the
   hero lead, the approach notes, the engagement panel and the CTA.

   It is a genuine qualifying question, not a gimmick: the two paths differ in
   price shape, timeline, staffing and exit, and a page that averages them
   serves neither. It is also the one interaction on this page that has no
   counterpart in the reference.

   ── WHY CONTEXT AND NOT PROPS ────────────────────────────────────────────
   Four sections read the mode and two of them are far apart in the tree.
   Threading a prop from the route would make page.tsx a Client Component and
   pull every section into the client bundle with it; the provider keeps that
   boundary at the sections that actually need it.

   ── WHAT THIS MUST NOT DO ────────────────────────────────────────────────
   Switching mode must never UNMOUNT revealed content. Reveal.tsx observes
   [data-reveal] once, on mount (see its note), so an element created by a
   later state change is never observed and stays at opacity 0 forever. Every
   consumer therefore swaps TEXT inside a stable element, or toggles `hidden`
   on a node that is always mounted — never a conditional render around a
   [data-reveal] node. The same rule that Roles.tsx's filter obeys.

   No persistence. localStorage was considered and rejected: a returning
   visitor whose situation changed would be answered by last month's choice
   with no visible reason, and the switch costs one click.
   ========================================================================== */

type Ctx = {
  mode: ServiceMode;
  setMode: (m: ServiceMode) => void;
  detail: (typeof SERVICE_MODES)[number];
};

const ModeCtx = createContext<Ctx | null>(null);

export function useServiceMode() {
  const ctx = useContext(ModeCtx);
  if (!ctx) throw new Error("useServiceMode must be used inside <ModeProvider>");
  return ctx;
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  /* "build" first because it is the broader audience and the page has to make
     sense before anybody touches the switch. */
  const [mode, setMode] = useState<ServiceMode>("build");
  const value = useMemo<Ctx>(
    () => ({
      mode,
      setMode,
      detail: SERVICE_MODES.find((m) => m.key === mode) ?? SERVICE_MODES[0],
    }),
    [mode],
  );
  return <ModeCtx.Provider value={value}>{children}</ModeCtx.Provider>;
}

/* ==========================================================================
   THE SWITCH.
   ==========================================================================
   A real ARIA tablist with a roving tabindex — only the selected option is in
   the tab order and Arrow keys move between them, which is what a two-option
   selector owes a keyboard user. It is NOT a radio group: the choice has no
   value on submit, it re-renders the page's content, which is what tabs are.

   `panelId` wires aria-controls to whichever region the caller considers the
   panel (the hero copy, or the engagement card lower down). Two switches on
   one page is deliberate — the second one is where a visitor who scrolled
   past the first finally realises which they are.
   ========================================================================== */
export function ModeSwitch({
  panelId,
  size = "lg",
  idPrefix = "mode",
}: {
  panelId: string;
  size?: "lg" | "sm";
  idPrefix?: string;
}) {
  const { mode, setMode } = useServiceMode();

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const i = SERVICE_MODES.findIndex((m) => m.key === mode);
      const next = (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + SERVICE_MODES.length) % SERVICE_MODES.length;
      setMode(SERVICE_MODES[next].key);
      document.getElementById(`${idPrefix}-tab-${next}`)?.focus();
    },
    [mode, setMode, idPrefix],
  );

  if (size === "sm") {
    return (
      <div
        role="tablist"
        aria-label="Engagement model"
        className="inline-flex gap-1 rounded-full border border-border bg-card p-1.5 shadow-sm"
        onKeyDown={onKeyDown}
      >
        {SERVICE_MODES.map((m, i) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              id={`${idPrefix}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              onClick={() => setMode(m.key)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                on
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={m.icon} className="size-4" />
              {m.label}
            </button>
          );
        })}
      </div>
    );
  }

  /* The hero version: two full cards, because at that point in the page the
     visitor needs the HINT to recognise themselves, not just the label. */
  return (
    <div
      role="tablist"
      aria-label="Which describes you"
      className="grid gap-3 sm:grid-cols-2"
      onKeyDown={onKeyDown}
    >
      {SERVICE_MODES.map((m, i) => {
        const on = m.key === mode;
        return (
          <button
            key={m.key}
            id={`${idPrefix}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls={panelId}
            tabIndex={on ? 0 : -1}
            onClick={() => setMode(m.key)}
            className={`group flex flex-col items-start gap-3.5 rounded-[1.25rem] border p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ${
              on
                ? "border-accent/40 bg-card shadow-[0_18px_44px_-18px_rgba(31,93,160,.35)] ring-1 ring-accent/10"
                : "border-border bg-card/60 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-card hover:shadow-md"
            }`}
          >
            <span
              className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${
                on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon name={m.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-display text-[15px] font-bold tracking-[-0.015em] text-foreground">
                  {m.label}
                </span>
                {/* The check is the confirmation that a choice registered —
                    a border change alone is easy to miss on a small screen. */}
                <span
                  className={`grid size-4 place-items-center rounded-full transition-opacity duration-200 ${
                    on ? "bg-accent text-white opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                >
                  <Icon name="check" className="size-3" />
                </span>
              </span>
              <span className="mt-1 block text-[13px] leading-[1.6] text-muted-foreground">
                {m.hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
