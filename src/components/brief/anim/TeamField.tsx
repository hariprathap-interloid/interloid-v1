"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   TeamField — "your node joins the team". Three.js.
   ==========================================================================
   A small ring of team nodes, faintly meshed together, sits on the right.
   The visitor is the bright node that starts adrift on the left. As the
   story fills in it drifts toward the middle of the ring, and each answered
   step draws one more line from it to a team node, with a bead travelling
   along each live line. On send it docks at the centre and every line
   lights — "you work directly with the engineers", said without a word.

   Deliberately light: 15 points and 21 lines, no data file. The nodes are
   abstract — they are NOT a headcount (see Stage's note), which is also why
   they carry no faces or labels.

   Same rules as MarkField: pixel ratio capped at 2, clock delta once per
   frame, reduced motion followed live (everything settles, nothing drifts),
   paused offscreen and in a hidden tab, and everything disposed on teardown.
   Without WebGL a still SVG of the same shape shows. */

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

const TEAM = 7;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (x: number) => x * x * (3 - 2 * x);

export default function TeamField({ progress, done }: { progress: number; done: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ progress, done });
  useEffect(() => {
    target.current = { progress, done };
  }, [progress, done]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !webglOK()) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 8;
      const group = new THREE.Group();
      scene.add(group);

      /* The ring, the dock at its centre, and where "you" start. */
      const team = Array.from({ length: TEAM }, (_, i) => {
        const a = (i / TEAM) * Math.PI * 2 + 0.35;
        return new THREE.Vector3(Math.cos(a) * 1.7 + 1.1, Math.sin(a) * 1.2, Math.sin(i * 2.1) * 0.6);
      });
      const hub = new THREE.Vector3(1.1, 0, 0.35);
      const from = new THREE.Vector3(-3.4, -0.8, 0.9);
      const you = from.clone();
      const live = team.map((v) => v.clone()); /* team + breathing, per frame */
      const bead = new THREE.Vector3();

      /* Mesh among the team: ring neighbours plus a chord to i+3. */
      const pairs: [number, number][] = [];
      for (let i = 0; i < TEAM; i++) {
        pairs.push([i, (i + 1) % TEAM], [i, (i + 3) % TEAM]);
      }

      /* Points: TEAM nodes, you, then TEAM beads. */
      const NP = TEAM * 2 + 1;
      const pPos = new Float32Array(NP * 3);
      const pCol = new Float32Array(NP * 3);
      const pSize = new Float32Array(NP);
      for (let i = 0; i < TEAM; i++) {
        pSize[i] = 0.3;
        pSize[TEAM + 1 + i] = 0.13;
      }
      pSize[TEAM] = 0.42;
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
      pGeo.setAttribute("aSize", new THREE.BufferAttribute(pSize, 1));
      const uni = { uScale: { value: 900 } };
      const pMat = new THREE.ShaderMaterial({
        uniforms: uni,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float aSize;
          varying vec3 vColor;
          uniform float uScale;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        /* A hot core with a soft halo — reads as a lit node, not a dot. */
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            float halo = smoothstep(0.5, 0.0, r);
            float core = smoothstep(0.22, 0.0, r);
            gl_FragColor = vec4(vColor * (halo * 0.6 + core), halo);
          }`,
      });
      group.add(new THREE.Points(pGeo, pMat));

      /* Lines: the team mesh, then one line from you to each team node.
         Additive blending: a line's COLOUR is its brightness, so black is
         invisible and there is no per-line alpha to manage. */
      const LN = pairs.length + TEAM;
      const lPos = new Float32Array(LN * 6);
      const lCol = new Float32Array(LN * 6);
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
      lGeo.setAttribute("color", new THREE.BufferAttribute(lCol, 3));
      const lMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.LineSegments(lGeo, lMat));

      const C_TEAM = new THREE.Color("#5cc8e6");
      const C_YOU = new THREE.Color("#ffffff");
      const C_MESH = new THREE.Color("#3a7bc8");
      const C_BEAD = new THREE.Color("#7fe0c9");

      const putV = (arr: Float32Array, i: number, v: { x: number; y: number; z: number }) => {
        arr[i * 3] = v.x;
        arr[i * 3 + 1] = v.y;
        arr[i * 3 + 2] = v.z;
      };
      const putC = (arr: Float32Array, i: number, c: { r: number; g: number; b: number }, s: number) => {
        arr[i * 3] = c.r * s;
        arr[i * 3 + 1] = c.g * s;
        arr[i * 3 + 2] = c.b * s;
      };

      const resize = () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        uni.uScale.value = h * renderer.getPixelRatio() * 0.9;
        /* Fit the whole scene, drift path included, on narrow panels. */
        const s = Math.min(1, camera.aspect / 1.7);
        group.scale.setScalar(s);
        group.position.x = -0.35 * s;
      };
      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      resize();

      const mq = matchMedia("(prefers-reduced-motion: reduce)");
      let still = mq.matches;
      const onMq = (e: MediaQueryListEvent) => {
        still = e.matches;
      };
      mq.addEventListener("change", onMq);

      const k = new Float32Array(TEAM); /* each you→team line, 0..1 */
      let youK = 0;
      const clock = new THREE.Clock();
      let visible = true;
      let raf = 0;
      let t = 0;

      const frame = () => {
        raf = 0;
        const dt = Math.min(clock.getDelta(), 0.05); /* once per frame */
        t += dt;
        const { progress: p0, done: sent } = target.current;
        const p = sent ? 1 : clamp(p0);

        youK = still ? p : youK + (p - youK) * (1 - Math.exp(-dt * 2.2));
        you.lerpVectors(from, hub, smooth(youK));
        if (!still) you.y += Math.sin(t * 1.3) * 0.06 * (1 - youK);

        for (let i = 0; i < TEAM; i++) {
          /* One more line per step of progress; all of them once sent. */
          const goal = sent || p >= (i + 1) / (TEAM + 1) ? 1 : 0;
          k[i] = still ? goal : k[i] + (goal - k[i]) * (1 - Math.exp(-dt * 3));
          live[i].copy(team[i]);
          if (!still) live[i].y += Math.sin(t * 0.8 + i) * 0.05;
        }

        /* nodes, you, beads */
        for (let i = 0; i < TEAM; i++) {
          putV(pPos, i, live[i]);
          const glow = sent && !still ? 1 + 0.25 * Math.sin(t * 3 + i) : 1;
          putC(pCol, i, C_TEAM, (0.4 + 0.6 * k[i]) * glow);
        }
        putV(pPos, TEAM, you);
        putC(pCol, TEAM, C_YOU, 0.6 + 0.4 * youK);
        for (let i = 0; i < TEAM; i++) {
          const f = (t * 0.45 + i / TEAM) % 1;
          bead.lerpVectors(you, live[i], f);
          putV(pPos, TEAM + 1 + i, bead);
          putC(pCol, TEAM + 1 + i, C_BEAD, still ? 0 : k[i] * (1 - Math.abs(f - 0.5)));
        }

        /* lines */
        let li = 0;
        for (const [a, b] of pairs) {
          putV(lPos, li * 2, live[a]);
          putV(lPos, li * 2 + 1, live[b]);
          const s = 0.14 + (sent ? 0.3 : 0) + 0.12 * ((k[a] + k[b]) / 2);
          putC(lCol, li * 2, C_MESH, s);
          putC(lCol, li * 2 + 1, C_MESH, s);
          li++;
        }
        for (let i = 0; i < TEAM; i++) {
          putV(lPos, li * 2, you);
          putV(lPos, li * 2 + 1, live[i]);
          putC(lCol, li * 2, C_YOU, 0.55 * k[i]);
          putC(lCol, li * 2 + 1, C_TEAM, 0.85 * k[i]);
          li++;
        }

        group.rotation.y = still ? 0 : Math.sin(t * 0.12) * 0.3;
        group.rotation.x = still ? 0 : Math.sin(t * 0.09) * 0.08;

        pGeo.getAttribute("position").needsUpdate = true;
        pGeo.getAttribute("color").needsUpdate = true;
        lGeo.getAttribute("position").needsUpdate = true;
        lGeo.getAttribute("color").needsUpdate = true;
        renderer.render(scene, camera);
        stage.dataset.ready = "1";
        if (visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const kick = () => {
        if (raf || !visible || document.hidden) return;
        clock.getDelta();
        raf = requestAnimationFrame(frame);
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          kick();
        },
        { threshold: 0 },
      );
      io.observe(stage);
      const onVis = () => kick();
      document.addEventListener("visibilitychange", onVis);
      kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        mq.removeEventListener("change", onMq);
        pGeo.dispose();
        pMat.dispose();
        lGeo.dispose();
        lMat.dispose();
        renderer.dispose();
        delete stage.dataset.ready;
      };
    };

    start();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={stageRef} className="group relative size-full">
      {/* Still fallback: the ring and a docked node, same shape as the scene. */}
      <svg
        viewBox="0 0 200 100"
        aria-hidden="true"
        className="absolute inset-0 m-auto h-3/4 opacity-60 transition-opacity duration-700 group-data-[ready=1]:opacity-0"
      >
        {Array.from({ length: TEAM }, (_, i) => {
          const a = (i / TEAM) * Math.PI * 2 + 0.35;
          const x = 118 + Math.cos(a) * 38;
          const y = 50 + Math.sin(a) * 30;
          return (
            <g key={i}>
              <line x1="118" y1="50" x2={x} y2={y} stroke="#5cc8e6" strokeOpacity=".5" />
              <circle cx={x} cy={y} r="4" fill="#5cc8e6" />
            </g>
          );
        })}
        <circle cx="118" cy="50" r="5.5" fill="#fff" />
      </svg>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
    </div>
  );
}
