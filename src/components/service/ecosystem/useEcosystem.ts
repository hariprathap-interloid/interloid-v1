"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAPABILITIES } from "@/content/service";

/* ==========================================================================
   ONE SELECTION MODEL FOR MOUSE, KEYBOARD AND TOUCH.
   ==========================================================================
   Hover alone is unavailable on touch and invisible to a keyboard, so it is
   one of three ways into the same state:

     hover        onMouseEnter activates (fine pointers only)
     keyboard     onFocus activates; Arrow/Home/End move; Escape resets
     touch        a tap activates and pins; tapping the pinned service unpins

   ── ROVING TABINDEX ──────────────────────────────────────────────────────
   The services are one composite widget and one tab stop: only the active
   service has tabIndex 0, and Arrow keys move focus between them.

   ── PANELS ARE ALWAYS RENDERED ───────────────────────────────────────────
   The reveal script observes [data-reveal] once on mount; anything created
   later by a state change stays at opacity 0 forever. Callers render every
   subtree and hide inactive ones — never a conditional render around
   revealed content.
   ========================================================================== */

export type EcosystemSelection = {
  /** The service whose subtree is shown. Always a valid index — the diagram
      is never in a state with nothing to read. */
  active: number;
  /** False until the visitor has hovered, focused or tapped anything.

      Lets the map draw a distinct resting state — all services labelled, no
      branch open — rather than forcing a branch open on load. */
  engaged: boolean;
  /** True when the selection was made by click/tap and should survive
      the pointer leaving. */
  pinned: boolean;
  /** Registers the button for a service so Arrow keys can move focus. */
  register: (i: number) => (el: HTMLButtonElement | null) => void;
  /** Spread onto each service button. */
  nodeProps: (i: number) => {
    ref: (el: HTMLButtonElement | null) => void;
    id: string;
    role: "tab";
    "aria-selected": boolean;
    "aria-controls": string;
    tabIndex: 0 | -1;
    onMouseEnter: (e: React.MouseEvent) => void;
    onFocus: () => void;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** Spread onto the stage wrapper. */
  stageProps: {
    onPointerMove: (e: React.PointerEvent) => void;
    "data-pinned": "true" | undefined;
    "data-settling": "true" | undefined;
  };
  /** Spread onto each subtree panel. */
  panelProps: (i: number) => {
    id: string;
    role: "tabpanel";
    "aria-labelledby": string;
    "aria-hidden": boolean;
  };
};

export function useEcosystem(
  idPrefix: string,
  /** Set when the layout moves nodes on selection. A node sliding under a
      stationary cursor fires mouseenter and would steal the selection
      (including one just made by keyboard). With this set, a mouseenter only
      counts if the pointer has moved since the last selection, and other
      nodes ignore the pointer while the layout settles. Focus and click are
      never gated. */
  guardMovingLayout = false,
): EcosystemSelection {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [settling, setSettling] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  /* The live pointer position, updated by the stage's pointermove. */
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  /* Where the pointer was when the current selection was made. A mouseenter
     arriving at the SAME point is the layout moving under a still cursor; one
     arriving anywhere else is a real pointer move. See `onMouseEnter`. */
  const pointerAt = useRef<{ x: number; y: number } | null>(null);

  const register = useCallback(
    (i: number) => (el: HTMLButtonElement | null) => {
      buttons.current[i] = el;
    },
    [],
  );

  const activate = useCallback(
    (i: number) => {
      setActive(i);
      setEngaged(true);
      if (!guardMovingLayout) return;
      pointerAt.current = lastPointer.current;
      /* While nodes move, `data-settling` takes the other nodes out of the
         pointer's reach. The position check alone misses a node that stops
         under a cursor which moved a moment earlier. The timeout must outlast
         the CSS layout transition. */
      setSettling(true);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => setSettling(false), 640);
    },
    [guardMovingLayout],
  );

  /* The timer outlives the component if a visitor navigates mid-transition. */
  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const n = CAPABILITIES.length;
      const move: Record<string, number> = {
        ArrowRight: 1,
        ArrowDown: 1,
        ArrowLeft: -1,
        ArrowUp: -1,
      };
      if (e.key in move) {
        e.preventDefault();
        const next = (active + move[e.key] + n) % n;
        activate(next);
        buttons.current[next]?.focus();
        return;
      }
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        const next = e.key === "Home" ? 0 : n - 1;
        activate(next);
        buttons.current[next]?.focus();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setPinned(false);
        /* Escape returns the map to its resting state. */
        setEngaged(false);
      }
    },
    [active, activate],
  );

  const nodeProps = useCallback(
    (i: number) => ({
      ref: register(i),
      id: `${idPrefix}-svc-${i}`,
      role: "tab" as const,
      "aria-selected": i === active,
      "aria-controls": `${idPrefix}-panel-${i}`,
      tabIndex: (i === active ? 0 : -1) as 0 | -1,
      onMouseEnter: (e: React.MouseEvent) => {
        if (pinned) return;
        /* A touchscreen synthesises a mouseenter immediately before the click
           it is really delivering. Acting on it makes the first tap open a
           branch and the second one close it again, which reads as the tap
           having failed. Coarse pointers go through onClick only. */
        if (
          typeof window !== "undefined" &&
          window.matchMedia?.("(hover: none)").matches
        ) {
          return;
        }
        /* Ignore a mouseenter caused by the layout moving. Compare pointer
           position rather than timing or event order: if the cursor is where
           it was when the selection was made, the node came to it. */
        if (guardMovingLayout) {
          const at = pointerAt.current;
          const moved =
            !at || Math.hypot(e.clientX - at.x, e.clientY - at.y) > 2;
          if (!moved) return;
        }
        activate(i);
      },
      onFocus: () => activate(i),
      onClick: () => {
        /* Pinning is for touch only. A pinned selection ignores later hovers,
           so pinning on a mouse click would make the diagram stop responding
           to the pointer. On a hover-less device the tap must persist, and
           tapping the open service again releases it. */
        const coarse =
          typeof window !== "undefined" &&
          window.matchMedia?.("(hover: none)").matches;
        if (!coarse) {
          activate(i);
          return;
        }
        if (pinned && i === active) setPinned(false);
        else {
          activate(i);
          setPinned(true);
        }
      },
      onKeyDown,
    }),
    [active, activate, guardMovingLayout, idPrefix, onKeyDown, pinned, register],
  );

  /* No revert on mouse-leave. Opening a branch moves the service node, which
     can move it out from under the pointer that opened it; closing on leave
     would then flicker the map under a stationary cursor. The last opened
     service stays open. */
  const stageProps = {
    onPointerMove: (e: React.PointerEvent) => {
      lastPointer.current = { x: e.clientX, y: e.clientY };
    },
    "data-pinned": (pinned ? "true" : undefined) as "true" | undefined,
    "data-settling": (settling ? "true" : undefined) as "true" | undefined,
  };

  const panelProps = useCallback(
    (i: number) => ({
      id: `${idPrefix}-panel-${i}`,
      role: "tabpanel" as const,
      "aria-labelledby": `${idPrefix}-svc-${i}`,
      "aria-hidden": i !== active,
    }),
    [active, idPrefix],
  );

  return { active, engaged, pinned, register, nodeProps, stageProps, panelProps };
}
