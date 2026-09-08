import Icon from "./Icon";
import { PULL_QUOTE } from "@/content/site";

/* The pull-quote, ported from prototype2-archive's `.pullquote` — every value
   below is that rule set, not an approximation:

     max-width 44rem, centred
     mark      the quotation glyph at 2rem, mb 1.25rem
     quote     display font, 500, clamp(1.25rem, 2.2vw, 1.5rem)/1.5
     caption   .875rem, name bold and dark, role muted

   ⚠ PLACEHOLDER — MUST NOT SHIP AS-IS. Same HANDOFF §7 P0 bucket as the
   Testimonials grid and the case studies: a visibly fake quote reads as a
   company that fabricates proof.

   ── WHY THIS IS ITS OWN SECTION ───────────────────────────────────────────
   Split out of Testimonials 2026-09-07 at the user's call, and it is a content
   distinction before it is a visual one. The grid under "Client feedback" is
   EVIDENCE — three attributed voices you are meant to read as a set and weigh.
   This is a SLOGAN: one sentence you are meant to remember. Sitting it at the
   foot of the grid on a bare `mt-20`, inside the same section and under the
   same heading, filed it as a fourth testimonial that had lost its card.

   The band is `border-y border-border bg-card`, which is StackMarquee's shell,
   not a new invention — it is the page's existing vocabulary for "a different
   kind of moment, full width". `bg-card` is pure white against the tinted
   `--background` in light and one step LIGHTER than it in dark, so the band
   lifts either way. It also has to be `bg-card` rather than `bg-secondary`:
   Faq is `bg-secondary` and follows immediately, so the two would have merged
   into one undifferentiated slab.

   THE MARK IS A DRAWN GLYPH, NOT A TYPED CHARACTER. It was `&ldquo;` at
   text-6xl, which renders as whatever Satoshi's opening double quote happens
   to be — a solid wedge that reads as a stray character, sits on a text
   baseline nothing else shares, and cannot be sized independently of its own
   line-height. The reference uses two stroked marks at a fixed 32px, which is
   why the screenshot's "99" has weight and air. See `quote-mark` in Icon.tsx.

   No heading. That is deliberate: a slogan that has to be introduced is not
   doing its job, and the band itself is now the separation the label was
   standing in for. */
/* Parameterised 2026-09-07 so /why-choose-us's proof section is this band with
   a different quote, not a second implementation. Defaults are home's, so
   `<PullQuote />` is unchanged. `link` is the one addition — the archive ends
   its proof section by sending the reader to the work, which is the right move
   on a page that has just spent 1700px making promises. */
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
          {/* text-faint is the app's token for faint DISPLAY text (globals.css
              — it exists because a border colour and a text colour are not the
              same thing, and it stays legible in dark). It is slate-200 where
              the reference used slate-300; one step lighter, and the only
              deviation in this block. */}
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
