import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Stack3DLab from "@/components/lab/Stack3DLab";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "The stack in 3D: drill-down variants | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /stack-3d — 3D only. The sphere as an overview, and five ways to open it.
   ==========================================================================
   /stack-lab compares eleven mobile layouts and the accordion won that
   comparison; this page is a separate question and deliberately not mixed
   into it. Every variant here is three.js, so the height and library-cost
   columns that decide /stack-lab cannot separate them — what separates them
   is what the arrangement IMPLIES about the groups inside a service.

   The interaction is three levels deep:

     1  the sphere, all 62 marks, no hierarchy
     2  pick a service — its marks grow and re-form into a LABELLED
        arrangement, one ring/turn/column per group; the rest fall back to a
        dim outer shell rather than vanishing
     3  tap a mark — it grows again and names itself

   The five arrangements for level 2, and the reason each exists, are in
   components/lab/Stack3DDrill.tsx.

   ⚠ THIS IS NOT A CANDIDATE FOR /services YET. It is ~150KB of library for a
   proof section, the object is `aria-hidden` with the real content in the
   list beneath it, and nothing here has been measured on a mid-range Android.
   It is a design question with a working prototype attached, which is the
   only honest way to ask it.

   Not linked, noindex.
   ========================================================================== */
export default function Stack3DPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-32">
        <div className="shell">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
            Internal · not linked · noindex
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
            The stack, opened
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
            The sphere answers <em>how much is there</em>. It cannot answer{" "}
            <em>how is it organised</em>: focusing a service in the first lab
            lit eleven marks but left them scattered where they already were.
            Here, picking a service re-forms its marks into a labelled shape,
            one per group.
          </p>
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.7] text-muted-foreground">
            Pick a service from the list, then tap a single mark to name it.
            The other fifty-odd retreat to a dim shell instead of disappearing,
            because &ldquo;eleven of sixty-two&rdquo; is the fact worth
            keeping.
          </p>
        </div>
        <Stack3DLab />
      </main>
      <Footer />
    </>
  );
}
