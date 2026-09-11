import type { Metadata } from "next";
import type { AnimKind } from "@/components/brief/anim/Stage";
import type { MobileMode } from "@/components/brief/LetterComposer";
import ContentLab, { type LabOption } from "@/components/brief/lab/ContentLab";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Story letter — decide the details | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /content-lab — the open decisions for /content, as live controls.
   ==========================================================================
   Round one (2026-09-11) compared four layouts and the live preview won.
   Round two settled its three dials, and /content now ships them: the story
   on the LEFT, the DRAWER on phones, and the mark on the thank-you only
   ("mark-send"). The controls open on that choice.

   KEPT FOR PHASE 2, NOT DEAD CODE. The user plans a preview of every variant
   — the service ecosystem designs and these content-form samples — for a
   senior review once development is done. So the other sides, the tabs
   design and the team / blueprint / envelope animations stay here on
   purpose. Do not delete them as unused.

   CHANGING THE CHOICE: /content renders <LetterComposer side mobile anim />;
   each control here is one of those props.

   No <Reveal />: the composer mounts after load when the view changes, and
   Reveal only observes what is on the page at mount (see BriefHero).
   Not linked, noindex. */

/* First entry is what the lab opens on — the choice live on /content. */
const ANIMS: LabOption<AnimKind>[] = [
  {
    v: "mark-send",
    name: "Logo on send · chosen",
    best: "Live on /content. Nothing animates while the story is written, since the letter filling in is the movement. After Send, your logo gathers from particles above the thank-you, so the last thing a client sees is Interloid.",
    cost: "three.js plus 128 KB of point data, but loaded only after sending, so writing the story stays as light as with no animation.",
  },
  {
    v: "none",
    name: "None",
    best: "The fastest and calmest option. The live letter is already the thing that moves: every answer visibly lands in its sentence.",
    cost: "Nothing memorable happens at the moment of sending.",
  },
  {
    v: "mark",
    name: "Mark assembles · Three.js",
    best: "Your own logo builds itself from particles in a clockwise sweep as the story fills in, and is whole when it's sent. Unmistakably Interloid.",
    cost: "The heaviest: three.js plus 128 KB of point data, and a dark panel above the letter.",
  },
  {
    v: "team",
    name: "Team network · Three.js",
    best: "The visitor's node drifts in and gains one line to the team with every answer; on send it docks and every line lights. It shows “you talk to the engineers” without saying it.",
    cost: "three.js, but tiny (15 points, no data file). More abstract than the mark, and it must never be read as a headcount.",
  },
  {
    v: "blueprint",
    name: "Blueprint · canvas",
    best: "A product wireframe draws itself stroke by stroke as they describe the project, then inks in on send: “we turn your story into software”. No library at all, the lightest of the three.",
    cost: "The sketch is a generic screen, not their project, so it illustrates rather than promises.",
  },
  {
    v: "envelope",
    name: "Envelope on send · CSS",
    best: "One well-made second: the letter sinks into an envelope stamped “48 h” and flies off, and the thank-you appears. Nothing runs while typing and there's no panel.",
    cost: "Nothing to see until the very end, and it's the one most at risk of feeling like a gimmick.",
  },
];

/* "Inline echo" (each boxed answer read back as a sentence) went with the
   boxes: the story half is written as sentences now, so it had nothing left
   to echo. */
const MOBILES: LabOption<MobileMode>[] = [
  {
    v: "drawer",
    name: "Drawer",
    best: "The story gets the whole screen. A bar pinned to the bottom counts “4 of 9 written”, and one tap opens the finished letter in a sheet.",
    cost: "The finished letter stays hidden until they open it, though the story they are writing is already in sentences.",
  },
  {
    v: "tabs",
    name: "Tabs",
    best: "A clear, sticky switch between writing the story and reading the letter, with the count on the tab. Everyone understands tabs.",
    cost: "They can never see both at once, and it takes an extra tap each way.",
  },
];

export default function ContentLabPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-32">
        <header className="shell pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-strong">
            Internal — not linked, not indexed
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
            The live letter, and every variant of it.
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-muted-strong">
            Live on /content: the story written as sentences on the <b>left</b>, the finished letter on
            the right, the <b>drawer</b> on phones, and the <b>logo on send</b>. The controls open on that
            choice; every other option stays here for the phase-2 review. Switch <b>View</b> to see the
            real page inside a phone.
            What you type carries across everything, and sends here are checked but never saved.
          </p>
        </header>

        <ContentLab anims={ANIMS} mobiles={MOBILES} />
      </main>
      <Footer />
    </>
  );
}
