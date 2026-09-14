import type { Metadata } from "next";
import Footer from "@/components/Footer";
import StackArcLab from "@/components/lab/StackArcLab";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "The arc: detail treatments | Interloid",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   /stack-arc — the winning arrangement, rebuilt properly, five ways labelled.
   ==========================================================================
   /stack-3d compared five level-2 arrangements and arc came out ahead for one
   reason: it is the only one readable WITHOUT rotation, so it survives a
   screenshot, a reduced-motion setting, and a reader who never thinks to
   drag. This page takes that result and does two things with it — makes the
   arc an actual arc, and settles how the groups get labelled.

   The geometry, the projection maths and the five treatments are documented
   in components/lab/StackArc.tsx.

   Not linked, noindex. /stack-3d stays for the arrangement comparison; delete
   both together, with the losing treatments, once this is decided.
   ========================================================================== */
export default function StackArcPage() {
  return (
    <>
      <Nav />
      <main id="main" className="pt-32">
        <div className="shell">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
            Internal · not linked · noindex
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
            The arc, properly
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
            The first arc was not an arc; it was two straight columns of marks
            meeting at a crease. This one is a real circular sweep, and it
            carries five ways of tying a group&rsquo;s name to the marks
            inside it.
          </p>
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.7] text-muted-foreground">
            Open <strong>Backend Development &amp; APIs</strong> first. Four
            groups and thirteen marks is the hardest case in the content, and
            it is where the treatments separate.
          </p>
        </div>
        <StackArcLab />
      </main>
      <Footer />
    </>
  );
}
