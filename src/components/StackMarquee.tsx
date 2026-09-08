import Icon from "./Icon";
import { STACK } from "@/content/site";

/* DS §8.10. The list is tripled and the keyframe wraps at exactly one third,
   so the loop is seamless. Server Component — no JS at all; the animation is
   pure CSS and `prefers-reduced-motion` in globals.css stops it, which is why
   the prototype's `if (REDUCED) remove('animate-marquee')` is not needed here.

   `text-faint`, NOT `text-border` — HANDOFF §5.18: in dark, --border is white
   at 10% alpha and the whole marquee disappeared. A border token is not a text
   token. */
export default function StackMarquee() {
  const items = [...STACK, ...STACK, ...STACK];
  return (
    <section
      id="stack"
      className="overflow-hidden border-y border-border bg-card py-20"
    >
      <div className="shell mb-10 text-center">
        <h3 className="font-display text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Technologies we work in
        </h3>
      </div>
      <div className="relative flex w-full">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-card to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-card to-transparent"
          aria-hidden="true"
        />
        <div className="flex animate-marquee items-center gap-16 whitespace-nowrap px-8">
          {items.map((n, i) => (
            <div
              key={`${n}-${i}`}
              className="flex shrink-0 cursor-default items-center gap-3 font-display text-2xl font-bold text-faint transition-colors hover:text-primary"
              /* The second and third copies are duplicates for the loop only;
                 hide them from assistive tech so the list is announced once. */
              aria-hidden={i >= STACK.length ? "true" : undefined}
            >
              <Icon name="layers" className="size-6" />
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
