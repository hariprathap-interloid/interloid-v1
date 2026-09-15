import Icon from "./Icon";

/* The eyebrow badge + two-tone H2 + optional lead shared by section headers.

   Neutral clause + ONE gradient clause, always. The gradient is applied to a
   single inline span, never split across word spans: background-clip paints
   on the parent, so inline-block children fall outside the clip and render as
   nothing.

   The H2 is font-medium (500), not bold: at this size the scale carries the
   weight, not the stroke. */
export default function SectionHeading({
  eyebrow,
  icon,
  lead,
  accent,
  children,
  className = "max-w-2xl",
}: {
  eyebrow: string;
  /** Badge form with a Lucide icon + sentence-case label at text-sm, instead
   *  of the dot + uppercase micro-label. Pass an icon name to opt in. */
  icon?: string;
  /** The neutral clause. */
  children: React.ReactNode;
  /** The single gradient clause. */
  accent: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={`mb-16 ${className}`}>
      <div
        data-reveal
        /* Type styles live on the badge itself, not an inner span. */
        className={`mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium leading-[1.5] ${
          icon ? "shadow-sm" : ""
        }`}
      >
        {icon ? (
          <span className="text-accent-strong">
            <Icon name={icon} className="size-4" />
          </span>
        ) : (
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        )}
        <span
          className={
            icon
              ? "text-sm font-medium text-muted-foreground"
              : "text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          }
        >
          {eyebrow}
        </span>
      </div>
      <h2
        data-reveal
        style={{ "--delay": "100ms" } as React.CSSProperties}
        /* Tops out at 3.5rem (56px); line-height 1.1, not Tailwind's
           leading-tight (1.25). */
        className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.025em] text-foreground md:text-5xl lg:text-[3.5rem]"
      >
        {children}{" "}
        <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
          {accent}
        </span>
      </h2>
      {lead && (
        <p
          data-reveal
          style={{ "--delay": "200ms" } as React.CSSProperties}
          /* 1.125rem at the body's 1.5 line-height — Tailwind's text-lg alone
             would force 1.75. */
          className="mt-6 text-lg leading-[1.5] text-muted-foreground"
        >
          {lead}
        </p>
      )}
    </div>
  );
}
