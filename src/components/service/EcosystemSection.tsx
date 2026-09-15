import Icon from "../Icon";
import SectionHeading from "../SectionHeading";
import EcosystemConstellation from "./ecosystem/EcosystemConstellation";
import { STACK_HEADING } from "@/content/service";

/* The stack as a three-level map: the six services around an Interloid core,
   the stack groups of the open service, and that service's technologies. */
export default function EcosystemSection({ id = "technologies" }: { id?: string }) {
  return (
    /* No `overflow-hidden` on the section: it would create a scroll container
       and break `position: sticky` inside. The orbs clip on their own wrapper. */
    <section id={id} className="relative border-t border-border bg-background py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute right-0 top-1/4 size-[560px] translate-x-1/3 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-[420px] -translate-x-1/3 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 shell">
        <SectionHeading
          eyebrow={STACK_HEADING.eyebrow}
          icon="layers"
          accent={STACK_HEADING.accent}
          lead="One core, six services, and the stack behind each of them. Open a service to see the groups it is built from and the technologies inside them."
          className="max-w-3xl"
        >
          {STACK_HEADING.head}
        </SectionHeading>

        <p data-reveal className="mb-6 flex items-center gap-2 text-[13px] text-muted-foreground lg:mb-2">
          <span className="text-accent-strong">
            <Icon name="search" className="size-4" />
          </span>
          <span className="hidden lg:inline">
            Hover, tap, or focus a service with the keyboard and use the arrow
            keys. Its groups and technologies open around it.
          </span>
          <span className="lg:hidden">
            Every service, with the groups and technologies behind it.
          </span>
        </p>

        {/* Two elements on purpose: the reveal script adds `is-in` to the
            [data-reveal] node imperatively, so React must not own its className. */}
        <div data-reveal style={{ "--delay": "80ms" } as React.CSSProperties}>
          <div className="eco-circles">
            <EcosystemConstellation />
          </div>
        </div>

        <p
          data-reveal
          style={{ "--delay": "160ms" } as React.CSSProperties}
          className="mt-8 flex items-start gap-2.5 text-[15px] leading-[1.7] text-muted-foreground"
        >
          <span className="mt-0.5 shrink-0 text-accent-strong">
            <Icon name="check-circle" className="size-5" />
          </span>
          <span>
            Every technology shown is one we run in production today. Where your
            team already has a stack, we work in it; this is what we reach for,
            not what we insist on.
          </span>
        </p>
      </div>
    </section>
  );
}
