"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="bg-secondary">
      <div className="shell flex min-h-[80vh] flex-col justify-center py-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
          Something went wrong
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl">
          This page failed to load.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-[1.6] text-muted-foreground">
          Try again, or head back to the home page.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-brand-light"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:border-brand/40"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
