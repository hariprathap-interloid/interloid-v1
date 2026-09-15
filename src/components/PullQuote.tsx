import Icon from "./Icon";
import { PULL_QUOTE } from "@/content/site";

/* A full-width pull-quote band. It is its own section, not part of the
   Testimonials grid: the grid is evidence to weigh, this is one sentence to
   remember.

   `bg-card` lifts the band against --background in both themes and keeps it
   distinct from an adjacent bg-secondary section.

   The mark is a drawn SVG glyph (`quote-mark` in Icon.tsx), not a typed
   character: a font's quote sits on a text baseline and cannot be sized
   independently of its line-height.

   No heading: a slogan that needs introducing is not doing its job.

   Props default to the home page's quote; `link` optionally sends the reader
   on to the work.

   Copy marked data-placeholder is unverified; confirm before public launch. */
export default function PullQuote({
  quote = PULL_QUOTE.q,
  name = PULL_QUOTE.name,
  role = PULL_QUOTE.role,
  link,
}: {
  quote?: string;
  name?: string;
  role?: string;
  link?: { label: string; href: string };
} = {}) {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card py-24">
      <div className="relative z-10 shell">
        <figure
          data-reveal
          data-placeholder="P0 TRUST: replace with a real, permissioned quote"
          className="mx-auto max-w-[44rem] text-center"
        >
          {/* text-faint is the token for faint DISPLAY text: a border colour
              and a text colour are not the same thing, and it stays legible
              in dark. */}
          <span
            className="mb-5 flex justify-center text-faint"
            aria-hidden="true"
          >
            <Icon name="quote-mark" className="size-8" />
          </span>
          <blockquote className="font-display text-[clamp(1.25rem,2.2vw,1.5rem)] font-medium leading-[1.5] text-foreground">
            {quote}
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {name}
            </strong>{" "}
            &middot; {role}
          </figcaption>
        </figure>

        {link ? (
          <p
            data-reveal
            style={{ "--delay": "120ms" } as React.CSSProperties}
            className="mt-10 text-center"
          >
            <a
              href={link.href}
              className="group inline-flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary"
            >
              {link.label}
              <span className="transition-transform group-hover:translate-x-1">
                <Icon name="arrow" className="size-4" />
              </span>
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
