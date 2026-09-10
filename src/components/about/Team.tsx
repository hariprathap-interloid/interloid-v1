"use client";

import { useRef } from "react";
import SectionHeading from "../SectionHeading";
import { HUE } from "@/content/site";
import { TEAM, TEAM_HEADING } from "@/content/about";

export default function Team() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section
      id="team"
      className="relative overflow-hidden border-t border-border bg-secondary py-28"
    >
      <div
        className="pointer-events-none absolute right-0 top-1/4 size-[520px] translate-x-1/3 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[420px] -translate-x-1/3 translate-y-1/4 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 shell">
        <div className="mb-14 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={TEAM_HEADING.eyebrow}
            icon="users"
            accent={TEAM_HEADING.accent}
            lead={TEAM_HEADING.lead}
            className="max-w-2xl text-center md:text-left"
          >
            {TEAM_HEADING.head}
          </SectionHeading>

          {/* Carousel navigation controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll team left"
              className="grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:bg-card hover:text-primary hover:shadow-md active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll team right"
              className="grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:bg-card hover:text-primary hover:shadow-md active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Squad carousel container */}
        <div className="relative group/carousel">
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TEAM.map((m, i) => {
              const h = HUE[m.hue];
              return (
                <div
                  key={m.name}
                  data-reveal
                  style={
                    { "--delay": `${(i % 4) * 60}ms` } as React.CSSProperties
                  }
                  className="w-[280px] shrink-0 snap-center sm:w-[300px]"
                >
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-xl">
                    {/* Visual Avatar Plate */}
                    <div className="relative flex h-52 flex-col items-center justify-center  bg-secondary/50 p-6 sm:h-56 z-50!">
                      {/* Ambient radial glow using hue */}
                      <div
                        className={`pointer-events-none absolute inset-0 ${h.glow} opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-75`}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-60"
                        aria-hidden="true"
                      />

                      {/* Discipline chip */}
                      <span className="relative z-10 mb-4 inline-flex items-center rounded-full border border-border bg-card/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-xs backdrop-blur-sm">
                        {m.discipline}
                      </span>

                      {/* Avatar badge with initials */}
                      <div className="relative z-10 flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-md ring-4 ring-secondary transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/40">
                        <span
                          className={`font-display text-2xl font-black tracking-tight ${h.text}`}
                        >
                          {m.initials}
                        </span>
                        {/* Senior status indicator */}
                        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center">
                          <span className="absolute inline-flex size-3 animate-ping rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                        </span>
                      </div>

                      {/* LinkedIn badge straddling bottom edge */}
                      <a
                        href={m.linkedin || "#"}
                        target={
                          m.linkedin && m.linkedin !== "#"
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          m.linkedin && m.linkedin !== "#"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        aria-label={`${m.name} profile`}
                        className="absolute bottom-0 right-5  z-50! translate-y-1/2 grid size-9 place-items-center rounded-full border border-border bg-card text-[#0A66C2] shadow-md ring-2 ring-card transition-all duration-300 hover:scale-110 hover:bg-[#0A66C2] hover:text-white"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-3.5"
                          aria-hidden="true"
                        >
                          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05a4.2 4.2 0 0 1 3.75-2c4 0 4.75 2.6 4.75 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2.05 1.4-2.05 2.8V21h-4z" />
                        </svg>
                      </a>
                    </div>

                    {/* Caption */}
                    <div className="flex flex-1 flex-col px-5 pb-6 pt-7 text-center">
                      <h3 className="font-display text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {m.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        {m.role}
                      </p>
                      <div className="mt-4 flex items-center justify-center border-t border-hairline pt-3">
                        <span className="text-xs font-semibold text-muted-strong">
                          {m.experience}
                        </span>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note beneath the squad */}
        <p
          data-reveal
          className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground"
        >
          {TEAM_HEADING.note}
        </p>
      </div>
    </section>
  );
}
