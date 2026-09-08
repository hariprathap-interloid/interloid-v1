"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAPABILITIES } from "@/content/service";

/* ==========================================================================
   ONE SELECTION MODEL FOR MOUSE, KEYBOARD AND TOUCH.
   ==========================================================================
   The brief says "when I hover the services I need to separate their
   children". Hover alone is not a usable interaction: it is unavailable on
   touch and invisible to a keyboard, and this diagram is the only route to
   the technology list, so a hover-only version would simply hide that content
   from a large share of visitors.

   So hover is one of three ways into the SAME state:

     hover      onMouseEnter activates; leaving returns to whatever is pinned
     keyboard   onFocus activates; Arrow keys move; the tablist is one tab stop
     touch/click  activates AND PINS. Tapping the pinned service unpins it.

   `pinned` is what makes touch work without a second mental model: a tap is
   just a hover that persists. A mouse user who clicks gets the same — the
   branch stays open while they read it, which is what they wanted when they
   clicked. Escape unpins.

   ── ROVING TABINDEX ──────────────────────────────────────────────────────
   The six services are one composite widget, so they are ONE tab stop, not
   six: only the active service has tabIndex 0 and Arrow keys move between
   them. That is what a tablist owes a keyboard user, and it matches the other
   tablists on this site (Roles, TechStacks, the mode switch).

   ── WHY THE PANEL IS ALWAYS RENDERED ─────────────────────────────────────
   Reveal.tsx observes [data-reveal] once on mount. Anything created later by
   a state change is never observed and stays at opacity 0 forever. So every
   variant renders all six subtrees and hides the inactive ones with `hidden`
   or opacity — never a conditional render around revealed content. Same rule
   as Roles.tsx's filter.
   ========================================================================== */

export type EcosystemSelection = {
  /** The service whose subtree is shown. Always a valid index — the diagram
      is never in a state with nothing to read. */
  active: number;
  /** False until the visitor has hovered, focused or tapped anything.

      THE RESTING STATE IS ITS OWN DESIGN. Before any interaction the map is
      the reference picture: six labelled services on their alternating radii,
      the emphasis cycling slowly, no branch open. `engaged` is what lets the
      variants draw that, instead of forcing a branch open on load and
      making the first impression the busiest one. */
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
    onMouseLeave: () => void;
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
  /** Set for a variant whose nodes MOVE when a selection is made.

      ONLY VARIANT C NEEDS THIS, AND IT NEEDS IT BADLY. That variant turns the
      whole wheel so the open service points right, which means every node
      moves under a stationary cursor - and whichever node lands beneath the
      pointer fires its own mouseenter and steals the selection, which moves
      the wheel again. Playwright caught the cascade as three of six services
      failing to stay selected, plus the arrow keys appearing not to work
      because a stolen hover overrode the focus.

      With this set, a mouseenter only counts if the pointer has actually moved
      since the last selection. Focus and click are never gated: those are
      deliberate acts. */
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
     arriving anywhere else is the user. See `onMouseEnter`. */
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
      /* While the wheel turns, the OTHER nodes stop accepting the pointer.

         The pointer-move gate alone was not enough: a node sliding to a stop
         under a cursor that had legitimately moved a moment earlier still
         claimed the selection, and two of the six services could never be
         opened by hovering them. Taking the losers out of the pointer's reach
         for the length of the transition is deterministic where a heuristic
         about movement is not. 640ms covers the 620ms transition. */
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
        /* Escape returns the map to its resting picture, which is the only
           way back to it once a branch has been opened. */
        setEngaged(false);
      }
    },
    [active, activate, pinned],
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
        /* THE MOUSEENTER THE LAYOUT CAUSED, NOT THE ONE THE USER DID.

           A first attempt ignored every hover for 700ms after a selection,
           which also ignored a user genuinely moving to the next node inside
           that window. A second compared event ORDER - had a pointermove been
           seen since the selection - which rejected a pointer that arrived in
           a single jump. This compares POSITION, which is the thing actually
           being asked about: if the cursor is where it was when the selection
           was made, the node came to it; otherwise it went to the node. */
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
        /* PINNING IS FOR TOUCH ONLY.

           It used to happen on every click, and a pinned selection ignores
           every later hover - so one stray click on a mouse made the whole
           diagram stop responding to the pointer, which read as broken rather
           than as locked. On a device with hover there is nothing to preserve
           between pointer movements, so a click simply selects. On a coarse
           pointer there is no hover at all, so the tap has to persist, and
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
    [active, activate, idPrefix, onKeyDown, pinned, register],
  );

  /* NO REVERT ON MOUSE-LEAVE, and that is deliberate.

     The obvious behaviour — close the branch when the pointer leaves — was
     built first and measured badly. Opening a branch moves the service node
     (all six converge on one radius so the branch always starts the same
     distance from the core), which can move it out from under the very
     pointer that opened it; the branch then closes, the node slides back, and
     the whole map flickers under a stationary cursor. Playwright caught it as
     "selects on hover" failing on three of the six services in variant C.

     So the last opened service simply stays open. That is also the kinder
     behaviour: a reader who opened Backend to read twelve marks does not want
     it to vanish because their pointer drifted two pixels off the node. */
  const stageProps = {
    onMouseLeave: () => {},
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
