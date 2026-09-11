"use client";

import { useState } from "react";
import { Choice } from "@/components/service/EcosystemSwitcher";
import type { AnimKind } from "../anim/Stage";
import BriefHero from "../BriefHero";
import LetterComposer, { type MobileMode, type Side } from "../LetterComposer";

/* ==========================================================================
   The /content-lab switcher — the chosen layout (questions + live preview),
   with its three open decisions as controls.
   ==========================================================================
     View       the desktop page, or the REAL page in a 390px phone frame —
                an <iframe> of /content-lab/frame, so what is judged is the
                page at phone width with the phone's own breakpoints, not a
                squeezed desktop
     Side       questions on the left or the right (desktop)
     Phone      drawer · tabs · echo — how the preview reaches a phone
     Animation  none · mark · team · blueprint · envelope

   Every combination runs the real letter (useStoryBrief) with dry-run sends,
   and all of them — the phone frame included, same origin — share one draft,
   so words typed in one carry into the next.

   The animation control is repeated in a dock pinned to the bottom, because
   it is the one flipped most and the page is long. Sticky to the BOTTOM, so
   it can never cover the preview column that pins to the top. Nothing here
   uses `data-reveal` (see BriefHero). */

export type LabOption<T extends string> = { v: T; name: string; best: string; cost: string };

function Notes<T extends string>({ title, o }: { title: string; o: LabOption<T> }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-accent/40 pl-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-foreground">{o.name}</h2>
      <p className="text-[15px] leading-[1.7] text-muted-strong">
        <span className="font-semibold text-foreground">Good at — </span>
        {o.best}
      </p>
      <p className="text-[15px] leading-[1.7] text-muted-foreground">
        <span className="font-semibold text-foreground">Costs — </span>
        {o.cost}
      </p>
    </div>
  );
}

export default function ContentLab({
  anims,
  mobiles,
}: {
  anims: LabOption<AnimKind>[];
  mobiles: LabOption<MobileMode>[];
}) {
  const [view, setView] = useState<"desktop" | "phone">("desktop");
  const [side, setSide] = useState<Side>("input-left");
  const [mobile, setMobile] = useState<MobileMode>("drawer");
  /* Opens on the first option — the page lists the choice live on /content first. */
  const [anim, setAnim] = useState<AnimKind>(anims[0].v);

  const a = anims.find((o) => o.v === anim) ?? anims[0];
  const m = mobiles.find((o) => o.v === mobile) ?? mobiles[0];
  const animOptions = anims.map((o) => ({ v: o.v, name: o.name }));
  const src = `/content-lab/frame?mobile=${mobile}&anim=${anim}`;

  return (
    <div>
      <div className="border-y border-border bg-card py-4">
        <div className="shell flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            <Choice
              name="view"
              label="View"
              value={view}
              onChange={setView}
              options={[
                { v: "desktop" as const, name: "Desktop page" },
                { v: "phone" as const, name: "Phone · 390px" },
              ]}
            />
            <Choice
              name="side"
              label="Story"
              value={side}
              onChange={setSide}
              options={[
                { v: "input-left" as const, name: "Left" },
                { v: "input-right" as const, name: "Right" },
              ]}
            />
          </div>
          <Choice
            name="mobile"
            label="Phone"
            value={mobile}
            onChange={setMobile}
            options={mobiles.map((o) => ({ v: o.v, name: o.name }))}
          />
          <Choice name="anim" label="Animation" value={anim} onChange={setAnim} options={animOptions} />
        </div>
      </div>

      <div className="shell grid gap-8 py-10 lg:grid-cols-2">
        <Notes title="Animation" o={a} />
        <Notes title="Phone design" o={m} />
      </div>

      {view === "desktop" ? (
        <>
          <BriefHero reveal={false} />
          <LetterComposer side={side} mobile={mobile} anim={anim} lab />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 bg-secondary py-14">
          <div className="rounded-[3rem] border-[10px] border-ink bg-ink shadow-2xl">
            {/* `key` reloads the frame when a control changes — the draft
                survives in localStorage, so nothing typed is lost. */}
            <iframe
              key={src}
              src={src}
              title="The page at phone width, 390 by 780"
              className="block h-[780px] w-[390px] max-w-[calc(100vw-3rem)] rounded-[2.4rem] bg-background"
            />
          </div>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            The real page at 390px — scroll, type, tap and send inside it.{" "}
            <a href={src} target="_blank" rel="noopener" className="font-medium text-primary">
              Open it on its own ↗
            </a>
          </p>
        </div>
      )}

      <div className="pointer-events-none sticky bottom-4 z-40 mt-6 flex justify-center px-4">
        <div className="pointer-events-auto max-w-full rounded-3xl border border-border bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur-md">
          <Choice name="dock" label="Animation" value={anim} onChange={setAnim} options={animOptions} />
        </div>
      </div>
    </div>
  );
}
