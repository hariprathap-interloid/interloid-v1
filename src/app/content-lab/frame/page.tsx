import type { Metadata } from "next";
import type { AnimKind } from "@/components/brief/anim/Stage";
import BriefHero from "@/components/brief/BriefHero";
import LetterComposer, { type MobileMode } from "@/components/brief/LetterComposer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Phone preview | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /content-lab/frame — /content, bare, for /content-lab's 390px phone frame.
   ==========================================================================
   Loaded in an <iframe> so the page is judged at a real phone width with
   the phone's own breakpoints — `lg:` genuinely off, the drawer's fixed bar
   pinned to the frame's bottom — which a desktop window squeezed narrow
   cannot show honestly. Options arrive as ?mobile=&anim=, checked against
   the known values so an unknown one falls back rather than breaking.

   `searchParams` is a Promise in this Next (page.md), which makes the route
   render per request — fine for an internal preview. Typed inline rather
   than with the generated PageProps helper, which does not exist for a new
   route until the dev server regenerates types. No Footer (it is a frame),
   no Reveal (BriefHero renders with reveal off). Not linked, noindex. */

const MOBILES = ["drawer", "tabs"] as const satisfies readonly MobileMode[];
const ANIMS = ["none", "mark", "team", "blueprint", "envelope"] as const satisfies readonly AnimKind[];

function pick<T extends string>(v: string | string[] | undefined, list: readonly T[], fallback: T): T {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

export default async function Frame({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const mobile = pick<MobileMode>(sp.mobile, MOBILES, "drawer");
  const anim = pick<AnimKind>(sp.anim, ANIMS, "none");

  return (
    <>
      <Nav />
      <main id="main">
        <BriefHero reveal={false} />
        <LetterComposer mobile={mobile} anim={anim} lab />
      </main>
    </>
  );
}
