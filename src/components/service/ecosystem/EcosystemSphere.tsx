"use client";

import { useEffect, useRef, useState } from "react";
import { CAPABILITIES } from "@/content/service";

/* ==========================================================================
   THE PHONE SPHERE — all 62 technology marks on a sphere you can spin, shown
   above the accordion below `lg`.
   ==========================================================================
   Chosen on /stack-lab (the "3D" variant, sphere arrangement). The accordion
   stays exactly as it is and carries the content; this is the object that
   gives the phone version of the section what the desktop map already has —
   a sense of how much there is, before anyone reads a list.

   ── IT IS DECORATION OVER REAL CONTENT, NEVER A REPLACEMENT ──────────────
   `aria-hidden`, no focusable nodes. Every mark here is also a named chip in
   the accordion directly below, which is what a screen reader, a keyboard,
   and a browser with JS off all get.

   ── IT COSTS ALMOST NOTHING, AND NOTHING UNTIL IT IS NEARLY ON SCREEN ────
   Measured on /services, 2026-09-14: the core `three` module is ALREADY on
   the page at load, brought in by HeroStage and CtaStage. So this component
   does not add three.js — its marginal cost is the CSS3DRenderer module
   alone (~10KB in dev), and even that is imported dynamically, only when
   BOTH:
     · the viewport is below `lg` — on desktop this block is display:none and
       the constellation is shown instead, so loading three there would be
       pure waste; and
     · the stage is within 300px of the viewport — this section is near the
       bottom of /services, and most visits never scroll that far.
   Once running, the loop pauses whenever the stage leaves the viewport, so
   it does not spin in the background draining a phone battery.

   ── IT MUST NOT TRAP THE PAGE SCROLL ─────────────────────────────────────
   A 360px band that swallows touch is a real phone bug: start a scroll with
   a thumb on the sphere and the page would not move. So the stage is
   `touch-action: pan-y` — the browser keeps vertical scrolling — and only
   HORIZONTAL drags spin it. A vertical gesture fires `pointercancel` as the
   page takes it, and the sphere simply lets go.

   ── IT IS THE /stack-lab GLOBE, NUMBER FOR NUMBER ───────────────────────
   Two earlier passes each copied the wrong reference. The first sized itself
   from the stage and came out small and flat; the second copied /stack-arc,
   whose plates face outward HORIZONTALLY only, so the ones near the poles
   turn edge-on and the silhouette reads as a barrel. The approved look is
   the /stack-lab 3D variant, where every plate faces straight out from the
   centre (`lookAt(p·2)`): plates wrap over the top and bottom as well as the
   sides, and the set reads as a rounded globe. These are that sphere's own
   values: 360px stage, 60° lens, camera at 560, radius 205, 44px plates with
   24px marks, idle drift 0.0016 rad/frame, drag 0.00022 per px easing back
   at 0.02.

   The one deliberate difference is the drag axis: only sideways drags spin
   it here, for the scroll reason above. The lab also tilts on a vertical
   drag because it lives inside a frame that does not need to scroll the page.

   CSS3DRenderer, not WebGL: the marks stay vector-crisp, no GPU context is
   created, and it runs where WebGL is blocked. Each plate is wrapped because
   CSS3DRenderer owns `style.transform` on the element it is given.
   Reduced motion stops the idle spin; dragging still works.
   ========================================================================== */

const MARKS = CAPABILITIES.flatMap((c) => c.stack.flatMap((g) => g.items));

function monogram(name: string) {
  const parts = name
    .replace(/[^A-Za-z]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/);
  return (
    parts.length > 1
      ? parts[0][0] + parts[1][0]
      : name.replace(/[^A-Za-z]/g, "").slice(0, 2)
  ).toUpperCase();
}

export default function EcosystemSphere() {
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    /* Desktop shows the constellation; never pay for three.js there. */
    if (matchMedia("(min-width: 1024px)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;
    let visible = false;
    let started = false;
    /* Restarts the paused loop; replaced with the real one once booted. */
    let resume = () => {};

    const start = async () => {
      started = true;
      const [THREE, { CSS3DRenderer, CSS3DObject }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/renderers/CSS3DRenderer.js"),
      ]);
      if (cancelled || !host.isConnected) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const FOV = 60;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 4000);
      const renderer = new CSS3DRenderer();
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const plates: InstanceType<typeof CSS3DObject>[] = [];
      MARKS.forEach((t) => {
        const wrap = document.createElement("div");
        const el = document.createElement("div");
        el.className =
          "grid size-11 place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/10";
        if (t.file) {
          const img = document.createElement("img");
          img.src = `/tech/${t.file}`;
          img.alt = "";
          img.decoding = "async";
          img.className = "size-6 object-contain";
          el.appendChild(img);
        } else {
          const span = document.createElement("span");
          span.textContent = monogram(t.name);
          span.className = "text-[11px] font-bold tracking-tight text-slate-500";
          el.appendChild(span);
        }
        wrap.appendChild(el);
        const obj = new CSS3DObject(wrap);
        plates.push(obj);
        group.add(obj);
      });

      /* The lab's camera and radius. Only the aspect and the renderer size
         follow the stage; the sphere itself is fixed so it matches
         /stack-arc exactly. Re-run on resize, including a phone rotating. */
      const layout = () => {
        const W = host.clientWidth;
        const H = host.clientHeight;
        if (!W || !H) return;
        camera.aspect = W / H;
        camera.position.z = 560;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);

        /* Fibonacci sphere: even spacing, no bunching at the poles. */
        const R = 205;
        const N = plates.length;
        const golden = Math.PI * (3 - Math.sqrt(5));
        plates.forEach((obj, i) => {
          const y = 1 - (i / (N - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const th = golden * i;
          obj.position.set(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
          /* Face straight out from the centre, like /stack-lab. This is
             what makes it a globe: plates at the poles tilt over the top and
             bottom instead of standing upright and going edge-on. */
          obj.lookAt(obj.position.clone().multiplyScalar(2));
        });
      };
      layout();

      /* Horizontal drag spins; vertical movement belongs to the page. */
      let dragging = false;
      let lastX = 0;
      const idle = reduced ? 0 : 0.0016;
      let vel = idle;
      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        vel = (e.clientX - lastX) * 0.00022;
        lastX = e.clientX;
      };
      const up = () => {
        dragging = false;
      };
      host.addEventListener("pointerdown", down);
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerup", up);
      host.addEventListener("pointercancel", up);

      let raf = 0;
      const tick = () => {
        raf = 0;
        if (!visible) return; /* paused; the observer restarts it */
        if (!dragging) vel += (idle - vel) * 0.02;
        group.rotation.y += vel;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      resume = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };
      resume();
      setReady(true);

      const ro = new ResizeObserver(layout);
      ro.observe(host);

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        host.removeEventListener("pointerdown", down);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerup", up);
        host.removeEventListener("pointercancel", up);
        renderer.domElement.remove();
      };
    };

    /* Load when nearly on screen; pause the loop whenever it is off it.
       `threshold: 0` with a rootMargin, per the site's reveal rule — a
       fractional threshold can never be met at high zoom. */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) {
          start().catch(() => {
            /* Import failed: the placeholder stays and the accordion below
               carries the content. Nothing to repair. */
          });
        } else if (visible) {
          resume();
        }
      },
      { threshold: 0, rootMargin: "300px 0px" },
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div aria-hidden="true" className="mb-5 lg:hidden">
      <div
        ref={stage}
        className="relative h-[360px] w-full touch-pan-y overflow-hidden rounded-[1.25rem] border border-border bg-card"
      >
        {/* A soft disc where the sphere will be, so the stage is never an
            empty box while three.js loads — or at all, if it cannot. */}
        <div
          /* One opacity class at a time: `opacity-0` and `opacity-[0.08]`
             are the same utility, and Tailwind cannot order two of them. */
          className={`pointer-events-none absolute left-1/2 top-1/2 size-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] transition-opacity duration-700 ${
            ready ? "opacity-0" : "opacity-[0.08]"
          }`}
        />
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {MARKS.length} technologies · drag sideways to spin
      </p>
    </div>
  );
}
