import CtaStage from "./CtaStage";
import Icon from "./Icon";

/* DS §11.1 — a light section wrapping a dark rounded slab.

   ── MEASURED AGAINST PROTOTYPE 1, 2026-09-07 ──────────────────────────────
   The user supplied a reference screenshot and named prototype/index.html as
   the source. `.cta` was then diffed against this component property by
   property; the differences were all colour and type, and every one of them
   came from reaching for --accent where prototype 1 reaches for something
   brighter. The slab is #0f172b, and the brand cyan goes muddy on it.

   The BUTTON is the one to remember: it is `.btn--glow`, whose background is
   var(--brand) — the blue in the reference — not var(--accent). It had been
   built teal. Its glow is `rgba(40,157,190,.6)`, i.e. accent at 60%, which is
   the accent appearing as LIGHT around a blue button rather than as its fill.

   The trailing "Or email hello@interloid.com" paragraph was removed here:
   neither the reference screenshot nor prototype 1 has it, and the user asked
   for the screenshot's content. It also carried `data-placeholder="confirm
   real address"`, so this is one fewer unverified claim on the page, not a
   lost one. The button's mailto still points at that address — if the address
   should be visible, put the paragraph back rather than trusting the href.

   The 24 drifting particles use a seeded LCG so the layout is identical on
   every load and screenshot diffs stay meaningful. Because it is deterministic
   it runs at BUILD time in this Server Component rather than in the browser:
   same output, zero client JS. The prototype skipped them under
   prefers-reduced-motion; here globals.css's reduced-motion block already
   kills the animation, so the markup can render unconditionally. */
function particles() {
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  return Array.from({ length: 24 }, () => {
    const size = 1 + rnd() * 3;
    const dur = 8 + rnd() * 10;
    return {
      width: `${size.toFixed(1)}px`,
      height: `${size.toFixed(1)}px`,
      left: `${(rnd() * 100).toFixed(1)}%`,
      top: `${(rnd() * 100).toFixed(1)}%`,
      opacity: Number((0.1 + rnd() * 0.2).toFixed(2)),
      animation: `orb ${dur.toFixed(1)}s ease-in-out ${(rnd() * 5).toFixed(1)}s infinite`,
    };
  });
}

/* Parameterised 2026-09-07 so /why-choose-us can close on the same slab
   instead of a second copy of it. EVERY prop defaults to the home version, so
   `<CtaAnchor />` renders exactly what it rendered before — that was the point
   of doing it this way rather than extracting a shared shell: home's slab was
   measured identical to prototype 1 property by property, and a refactor that
   cannot change it is worth more than a tidier one that might. */
export default function CtaAnchor({
  id = "contact",
  eyebrow = "Let’s start",
  headline = "Still comparing",
  accent = "development partners?",
  lead = "Book 30 minutes. We’ll tell you honestly whether we’re the right fit — and if we’re not, who is.",
  cta = "Book a free 30-min consult",
  href = "mailto:hello@interloid.com",
  meta = ["No obligation", "No sales pressure", "Proposal in 48 hours"],
}: {
  id?: string;
  eyebrow?: string;
  headline?: string;
  accent?: string;
  lead?: string;
  cta?: string;
  href?: string;
  meta?: readonly string[];
} = {}) {
  return (
    <section
      id={id}
      /* The LIGHT BAND, not the slab. Deepened on request 2026-09-07:
         pt-8/pb-24 (32/96px, which was prototype 1's `.cta-wrap` padding to
         the pixel) -> pt-24/pb-40 (96/160px). The slab's own padding is
         untouched, so the card is the same size and only the ground around it
         grew — that was the ask, and it is the one knob that does it. */
      className="relative bg-background px-4 pb-40 pt-24 sm:px-6"
    >
      {/* Not `.shell`: the section already owns the gutter (`px-4 sm:px-6`
          above), so the shell's clamped padding would double it. Only the cap
          moves, to match the new page width. */}
      <div className="mx-auto w-full max-w-[1600px]">
        <div /* `.cta`: 4rem/1.5rem, then 5rem/4rem at sm. Radius is a flat 3rem,
              not the token scale's rounded-4xl (2.55rem). */
          data-cta-slab
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-[3rem] bg-ink px-6 py-16 text-center shadow-[0_25px_50px_-12px_rgba(15,23,43,.35)] sm:px-16 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand/40 via-ink to-ink"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-t-full bg-accent/14 blur-[120px]"
            aria-hidden="true"
          />
          {/* The no-JS / no-WebGL field. CtaStage fades this out once its
              canvas has drawn — see its note on the handshake. */}
          <div
            data-cta-fallback
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            {particles().map((p, i) => (
              <span key={i} className="absolute rounded-full bg-white" style={p} />
            ))}
          </div>
          <CtaStage />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
            {/* prototype 1's `.badge--dark`: uppercase, tracking-[.2em],
                accent-coloured icon and label — a different object from the
                light-section badge, not the same one recoloured. */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 shadow-[0_1px_2px_0_rgba(15,23,43,.06)] backdrop-blur-sm">
              <span className="text-spark" aria-hidden="true">
                <Icon name="star" className="size-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-spark">
                {eyebrow}
              </span>
            </div>

            <h2 className="mb-5 font-display text-4xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
              {headline}
              <br />
              {/* `/srgb`: Tailwind v4 interpolates gradients in oklab by default,
                    which bends the midpoint of a blue->green ramp visibly. The
                    prototype's `linear-gradient(90deg, ...)` is plain sRGB. */}
                <span className="bg-linear-to-r/srgb from-spark to-spark-end bg-clip-text text-transparent">
                {accent}
              </span>
            </h2>

            {/* This paragraph is the reason to take prototype 1's version:
                offering to name someone else is the most disarming thing on
                the page, and it costs nothing to say. */}
            <p className="mb-10 max-w-xl text-[17px] leading-[1.7] text-ink-foreground">
              {lead}
            </p>

            {/* `on-dark` swaps the focus ring for the dark-ground variant.
                HANDOFF §5.2: a component's own box-shadow out-cascades the
                global ring, so the ring is COMPOSED into the shadow, never
                replacing it. */}
            <a
              href={href}
              className="on-dark group inline-flex h-14 items-center gap-2 rounded-full border border-white/12 bg-ink-cta px-10 text-[17px] font-bold text-white shadow-[0_0_36px_-14px_rgba(40,157,190,.34)] transition-[background-color,box-shadow] duration-300 ease-out hover:bg-ink-cta-hover hover:shadow-[0_0_46px_-14px_rgba(40,157,190,.52)] active:scale-95"
            >
              {cta}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>

            {/* prototype 1's `.cta__meta` — three objection-removers under
                the button, where the hesitation actually happens. */}
            <ul className="mt-10 flex flex-wrap justify-center gap-6">
              {meta.map(
                (m) => (
                  <li
                    key={m}
                    className="flex items-center gap-2 text-[13px] text-ink-muted"
                  >
                    <span className="text-spark" aria-hidden="true">
                      <Icon name="check" className="size-3.5" />
                    </span>
                    {m}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
