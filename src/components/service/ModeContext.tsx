"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Icon from "../Icon";
import { SERVICE_MODES, type ServiceMode } from "@/content/service";

/* ==========================================================================
   SERVICE MODE — which of the two buyers is reading ("build" or "extend").
   ==========================================================================
   The visitor picks once, in the hero, and the hero lead, approach notes,
   engagement panel and CTA answer that choice specifically.

   Context rather than props: several distant sections read the mode, and
   threading a prop from the route would make page.tsx a Client Component.

   Switching mode must never unmount revealed content. The reveal script
   observes [data-reveal] once, on mount, so an element created by a later
   state change stays at opacity 0 forever. Consumers swap text inside a
   stable element, or toggle `hidden` on an always-mounted node.

   Deliberately not persisted: a returning visitor should not be answered by
   a stale choice, and the switch costs one click.
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
  /* "build" is the broader audience, so the page defaults to it. */
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
   An ARIA tablist with a roving tabindex: only the selected option is in the
   tab order and Arrow keys move between them. Tabs rather than a radio group,
   because the choice has no submit value — it swaps page content.

   `panelId` wires aria-controls to the caller's panel. `idPrefix` keeps tab
   ids unique when more than one switch is on the page.
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
        /* Two pills in a row need ~414px without their labels wrapping, so
           below 420px they stack full-width. `rounded-3xl` on the stacked
           box because `rounded-full` on a two-row container bows its sides. */
        className="grid w-full grid-cols-1 gap-1 rounded-3xl border border-border bg-card p-1.5 shadow-sm min-[420px]:inline-flex min-[420px]:w-auto min-[420px]:rounded-full"
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
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${
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

  /* The large version: full cards, so each option shows its hint as well as
     its label. */
  return (
    <div
      role="tablist"
      aria-label="Which describes you"
      /* One column across `lg`–`xl`: the hero's 7/5 split narrows this card
         so two columns would be ~155px each, and the cards need ~200px. */
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
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
                {/* Check mark confirms selection; a border change alone is
                    easy to miss on a small screen. */}
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
