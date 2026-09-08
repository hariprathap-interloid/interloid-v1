import SectionHeading from "../SectionHeading";
import { ORIGIN } from "@/content/about";

/* "Why we exist" — the narrative.

   ── THE ONE PROSE SECTION ON THE SITE ────────────────────────────────────
   Every other section anywhere on this site is tiles, cards or a list. This
   one is three paragraphs, because it is the only thing here that is
   genuinely a STORY and tiles would chop it into slogans. It is DS §3.4's
   long-form typography, which the site has never used, and that is the point:
   an About page should sound like a person, and a person does not speak in a
   three-column grid.

   The first paragraph opens with the reader's experience rather than the
   company's history, which is also how it avoids inventing one — see the
   content banner, which is emphatic about this. Nothing here is a historical
   claim.

   ── LAYOUT: 7/5, AND THE ASIDE IS STICKY ─────────────────────────────────
   `lg:grid-cols-12` with the prose on 7 and the facts on 5, so the measure
   stays near 65–75 characters at every width — a full-width paragraph at
   1280px is unreadable and is the usual way "long-form" goes wrong.

   The aside is `lg:sticky lg:top-32`, which is the ONE thing on this page
   that would have silently done nothing a week ago: `<body>` carried
   `overflow-x-hidden`, making it a scroll container, which makes every
   `position: sticky` on the site inert. That was found and fixed during the
   /services build (`overflow-x-clip` now) — see TAILWIND-MAP §4c before
   touching any sticky layout.

   HOVER: the aside rows only, and only a colour — this section is reading
   material, and a card that reacts under the cursor while you are reading a
   paragraph is a distraction rather than an affordance. */
export default function Origin() {
  return (
    <section
      id="origin"
      className="relative overflow-hidden border-t border-border bg-background py-28"
    >
      <div
        className="pointer-events-none absolute right-0 top-1/4 size-[520px] translate-x-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow={ORIGIN.eyebrow}
          icon="split"
          accent={ORIGIN.accent}
          className="mb-16 max-w-3xl"
        >
          {ORIGIN.head}
        </SectionHeading>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {/* `text-[17px]/[1.8]` and `space-y-6`, not the site's usual
                15px/1.7 body: this is the one block a visitor reads
                continuously rather than scans, and DS §3.4 sets long-form
                looser than card copy for exactly that reason. */}
            <div className="space-y-6">
              {ORIGIN.body.map((para, i) => (
                <p
                  key={para.slice(0, 24)}
                  data-reveal
                  style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
                  className={`text-[17px] leading-[1.8] ${
                    /* The opening paragraph carries slightly more weight —
                       a lede, so the eye has somewhere to land. */
                    i === 0
                      ? "text-foreground md:text-[19px] md:leading-[1.7]"
                      : "text-muted-strong"
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div
              data-reveal
              style={{ "--delay": "120ms" } as React.CSSProperties}
              className="lg:sticky lg:top-32"
            >
              <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
                <h3 className="border-b border-border bg-secondary px-7 py-5 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  {ORIGIN.glance.title}
                </h3>
                {/* A description list, because that is what this is: six
                    label/value pairs. `dt` and `dd` also give a screen reader
                    the pairing that a two-column div would throw away. */}
                <dl className="divide-y divide-hairline">
                  {ORIGIN.glance.rows.map((r) => (
                    <div
                      key={r.label}
                      className="group flex flex-col gap-1 px-7 py-4 transition-colors duration-300 hover:bg-secondary sm:flex-row sm:items-baseline sm:gap-6"
                    >
                      <dt className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-colors duration-300 group-hover:text-accent-strong sm:w-28">
                        {r.label}
                      </dt>
                      <dd className="text-[15px] leading-[1.6] text-foreground">
                        {r.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
