import type { Metadata } from "next";
import EcosystemTree from "@/components/service/ecosystem/EcosystemTree";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Variant F — tech tree (scratch)",
  robots: { index: false, follow: false },
};

/* Scratch harness for EcosystemTree only. Mirrors the wrapper EcosystemSection
   puts around a variant — a [data-reveal] div inside a max-w-7xl px-6 column —
   because the reveal observer and the stage's own width both depend on it. */
export default function PreviewScratchTree() {
  return (
    <>
      <Reveal />
      <main id="main" className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-8 font-display text-2xl font-bold text-foreground">
            F · Tech tree
          </h1>
          <div data-reveal>
            <EcosystemTree idPrefix="tree" />
          </div>
        </div>
      </main>
    </>
  );
}
