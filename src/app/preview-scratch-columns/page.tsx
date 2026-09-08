import type { Metadata } from "next";
import EcosystemColumns from "@/components/service/ecosystem/EcosystemColumns";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Variant H · flow columns — scratch",
  robots: { index: false, follow: false },
};

/* Scratch harness for variant H only. Mirrors the wrapper EcosystemSection
   gives the real thing — a [data-reveal] ancestor that is displayed at every
   width, which is what releases the .eco-line dashes. */
export default function PreviewScratchColumns() {
  return (
    <>
      <Reveal />
      <main id="main" className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-8 font-display text-3xl font-bold text-foreground">
            H · Flow columns
          </h1>
          <div data-reveal>
            <EcosystemColumns idPrefix="cols" />
          </div>

          <h2 className="mb-8 mt-24 font-display text-3xl font-bold text-foreground">
            H · Flow columns (dense)
          </h2>
          <div data-reveal>
            <EcosystemColumns idPrefix="colsd" dense />
          </div>
        </div>
      </main>
    </>
  );
}
