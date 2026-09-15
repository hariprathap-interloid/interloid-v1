import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="relative overflow-clip bg-secondary">
        <div
          className="pointer-events-none absolute right-0 top-0 size-[520px] translate-x-1/3 -translate-y-1/4 rounded-full bg-accent/15 blur-[120px]"
          aria-hidden="true"
        />
        <div className="shell relative z-10 flex min-h-[80vh] flex-col justify-center pb-24 pt-40">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
            Error 404
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem]">
            This page doesn&rsquo;t exist.{" "}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              The rest of the site does.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
            The link may be old, or the address mistyped. Start from one of these instead.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-brand-light"
            >
              Back to home
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:border-brand/40"
            >
              See our services
            </Link>
            <Link
              href="/contact#story"
              className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:border-brand/40"
            >
              Contact us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
