"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* ==========================================================================
   EnvelopeSend — the send moment: the letter goes into an envelope.
   ==========================================================================
   Played once, when the story is sent. The letter sinks into an envelope,
   the flap closes, a "48 h" stamp shows the promise that comes next, and
   the envelope flies off up-right while the thank-you fades in where it
   was. About 1.7 seconds from press to thank-you.

   The only one of the five options with no cost while typing — nothing runs
   until Send — and no library: the Web Animations API on five elements.

   Reduced motion: the scene never shows and the thank-you is simply there.
   The thank-you is never hidden by markup, only by the animation's
   `fill: "backwards"` during its delay, so if this effect never runs the
   visitor still sees it. Every animation is cancelled on teardown, which
   also keeps React StrictMode's double effect in dev from stacking two. */
export default function EnvelopeSend({ name, children }: { name: string; children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  const flight = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const after = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = scene.current;
    const f = flight.current;
    const l = letter.current;
    const fl = flap.current;
    const a = after.current;
    if (!s || !f || !l || !fl || !a) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      s.hidden = true;
      return;
    }
    s.hidden = false;
    const ease = "cubic-bezier(.2,.8,.2,1)";
    const runs = [
      l.animate([{ transform: "translateY(-42%)" }, { transform: "translateY(6%)" }], {
        duration: 560,
        easing: ease,
        fill: "both",
      }),
      fl.animate([{ transform: "rotateX(180deg)" }, { transform: "rotateX(0deg)" }], {
        duration: 320,
        delay: 520,
        easing: ease,
        fill: "both",
      }),
      f.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: "translate(34vw, -26vh) rotate(-14deg) scale(.55)", opacity: 0 },
        ],
        { duration: 640, delay: 960, easing: "cubic-bezier(.5,0,.75,0)", fill: "both" },
      ),
      a.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 480, delay: 1300, easing: "ease-out", fill: "backwards" },
      ),
    ];
    runs[2].onfinish = () => {
      s.hidden = true;
    };
    return () => runs.forEach((r) => r.cancel());
  }, []);

  return (
    <div className="relative">
      <div
        ref={scene}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center [perspective:1200px]"
      >
        <div ref={flight} className="relative aspect-[16/10] w-[min(24rem,80%)]">
          {/* back of the envelope */}
          <div className="absolute inset-0 rounded-2xl bg-[#c9dcf2] shadow-[0_30px_60px_-30px_rgba(15,23,43,.6)]" />
          {/* the letter */}
          <div ref={letter} className="absolute inset-x-[7%] bottom-[10%] h-[118%] rounded-xl border border-[#e2e8f0] bg-white p-5">
            <p className="font-display text-sm text-[#0f172b]">Hi Interloid,</p>
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-11/12 rounded-full bg-[#e2e8f0]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#e2e8f0]" />
              <div className="h-1.5 w-3/5 rounded-full bg-[#e2e8f0]" />
            </div>
            <p className="mt-4 font-display text-sm text-[#1f5da0]">Thanks — {name || "you"}</p>
          </div>
          {/* the pocket, in front of the letter */}
          <div className="absolute inset-0 rounded-2xl bg-[#a9c6ea] [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]" />
          {/* the flap — starts folded open, closes over the letter */}
          <div
            ref={flap}
            className="absolute inset-x-0 top-0 h-[58%] origin-top bg-[#8fb3e3] [clip-path:polygon(0_0,100%_0,50%_100%)]"
            style={{ transform: "rotateX(180deg)" }}
          />
          <span className="absolute bottom-4 right-5 rotate-6 rounded-md border-2 border-[#289dbe] px-1.5 py-0.5 font-display text-xs font-bold text-[#1b7c99]">
            48 h
          </span>
        </div>
      </div>
      <div ref={after}>{children}</div>
    </div>
  );
}
