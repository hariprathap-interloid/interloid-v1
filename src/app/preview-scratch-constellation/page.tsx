import type { Metadata } from "next";
import EcosystemConstellation from "@/components/service/ecosystem/EcosystemConstellation";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Constellation scratch",
  robots: { index: false, follow: false },
};

/* Scratch harness for variant D only. Mirrors EcosystemSection's container
   exactly (`max-w-7xl px-6` + a [data-reveal] wrapper) so the stage measures
   the same width here as it will on /services. Not linked, not indexed. */
export default function PreviewScratchConstellation() {
  return (
    <>
      <Reveal />
      <main id="main" className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div data-reveal>
            <EcosystemConstellation idPrefix="constellation" />
          </div>
        </div>
      </main>
    </>
  );
}
