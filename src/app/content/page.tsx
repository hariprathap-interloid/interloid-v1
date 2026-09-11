import type { Metadata } from "next";
import StoryBrief from "@/components/brief/StoryBrief";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import { BRIEF_DIRECT, BRIEF_FACTS, BRIEF_HERO } from "@/content/brief";

export const metadata: Metadata = {
  title: "Tell us your story — start a project | Interloid",
  description:
    "Skip the form. Tell us about your project in your own words — three blanks if you're in a rush, the full story if you have a few minutes. An engineer reads every word. A free 30-minute call, then a written scope and price within 48 hours.",
};

/* ==========================================================================
   /content — "Tell us your story". Added 2026-09-11, RE-LAID OUT 2026-09-11.
   ==========================================================================
   The project enquiry as a letter with blanks. Copy and the field list live
   in content/brief.ts; the letter card is StoryBrief (client — blanks, draft,
   send); the send is app/content/actions.ts. Every "Let's talk" and "Book a
   free 30-min consult" button on the site leads here.

   ── ONE SPREAD, NOT A HERO ABOVE A CENTRED CARD ─────────────────────────
   The first layout was a left-aligned hero, then the letter as a narrow card
   centred in its own band below. The user read it as centre-aligned and
   disconnected — the card sat in the middle of a 1600px shell with empty
   gutters either side, lined up with nothing above it.

   Now it is one spread on the shell's own left edge: the promise on the left
   (5fr) and the letter on the right (7fr), on one ground. The left column is
   the context a visitor reads once — who reads it, how long, what happens
   next, and the way round the letter if they would rather just call — so it
   holds still (`sticky`) while the letter scrolls past it. Sticky only on
   viewports at least 52rem tall: on a short laptop the column is taller than
   the screen, and a sticky element taller than the viewport hides its own
   bottom until the section ends. Below `lg` the two stack.

   No CtaAnchor slab: this page IS the conversion, and a second "book a call"
   button under the letter would compete with its own send button. */
export default function Content() {
  return (
    <>
      <Reveal />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-200 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        {/* `overflow-clip`, NOT `overflow-hidden`: `hidden` makes the section
            a scroll container, and a sticky child sticks to its scroll
            container — so the left column scrolled away with the page while
            reporting `position: sticky`. Measured 2026-09-11; layout.tsx
            records the same trap on <body>. `clip` still clips the glows. */}
        <section className="relative overflow-clip bg-secondary pb-28 pt-32 lg:pt-40">
          <div
            className="pointer-events-none absolute left-0 top-0 size-[560px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-brand/15 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 size-[520px] translate-x-1/3 translate-y-1/4 rounded-full bg-accent/15 blur-[120px]"
            aria-hidden="true"
          />

          <div className="relative z-10 shell grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-24">
            {/* STICKY, SIZED TO FIT. The column is ~50rem tall (803px
                measured at 1440). Pinned at a flat 8rem it overran a 900px
                laptop by 31px and hid the direct-contact block. So the pin is
                `min(8rem, 100vh − 51rem)` — 128px on tall screens, rising to
                84px at 900px, which still clears the scrolled nav pill — and
                it only pins at all from 56rem tall, below which the column
                simply scrolls. If this column gains copy, raise 51rem to its
                new height + ~1rem, and the 56rem gate with it.

                The `top` is an inline style, not `top-[min(…calc(…))]`: that
                arbitrary class stalled the dev stylesheet — neither it nor the
                sticky class beside it was ever emitted, and the column went
                static everywhere. `top` does nothing unless the element is
                sticky, so it can sit on the element at every size. */}
            <aside
              style={{ top: "min(8rem, calc(100vh - 51rem))" }}
              className="lg:self-start [@media(min-height:56rem)]:lg:sticky"
            >
              <div
                data-reveal
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] shadow-sm"
              >
                <span className="text-accent-strong">
                  <Icon name="doc" className="size-4" />
                </span>
                <span className="text-muted-foreground">{BRIEF_HERO.eyebrow}</span>
              </div>
              <h1
                data-reveal
                style={{ "--delay": "100ms" } as React.CSSProperties}
                className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl xl:text-[3.5rem]"
              >
                {BRIEF_HERO.head}
                <br />
                <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
                  {BRIEF_HERO.accent}
                </span>
              </h1>
              <p
                data-reveal
                style={{ "--delay": "200ms" } as React.CSSProperties}
                className="mt-6 max-w-xl text-lg leading-[1.6] text-muted-foreground"
              >
                {BRIEF_HERO.lead}
              </p>

              {/* Three facts, stacked beside the letter rather than banded
                  above it — they answer "is this safe to fill in?", which is a
                  question asked while looking at the blanks. */}
              <ul
                data-reveal
                style={{ "--delay": "300ms" } as React.CSSProperties}
                className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1"
              >
                {BRIEF_FACTS.map((f) => (
                  <li key={f.label} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-brand shadow-sm ring-1 ring-border">
                      <Icon name={f.k} className="size-5" />
                    </span>
                    <span>
                      <strong className="block font-display text-[17px] font-semibold text-foreground">
                        {f.label}
                      </strong>
                      <span className="mt-0.5 block max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {f.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* The way round the letter. Somebody in a real hurry should
                  not have to fill in even three blanks. */}
              <div
                data-reveal
                style={{ "--delay": "400ms" } as React.CSSProperties}
                className="mt-10 max-w-xl border-t border-border pt-8"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-strong">
                  {BRIEF_DIRECT.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{BRIEF_DIRECT.body}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${BRIEF_DIRECT.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon name="doc" className="size-4 text-accent-strong" />
                    {BRIEF_DIRECT.email}
                  </a>
                  <a
                    href={`tel:${BRIEF_DIRECT.tel}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon name="phone" className="size-4 text-accent-strong" />
                    {BRIEF_DIRECT.phone}
                  </a>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{BRIEF_DIRECT.hours}</p>
              </div>
            </aside>

            <StoryBrief />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
