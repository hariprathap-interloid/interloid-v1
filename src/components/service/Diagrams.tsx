/* ==========================================================================
   MECHANISM DIAGRAMS — one per capability.
   ==========================================================================
   SERVICE-PAGE-RESEARCH.md §2 P1: the reference pages' strongest move is that
   every capability block is paired with a drawing of HOW THE THING WORKS —
   an orchestrator with models on an orbit, a Bronze→Silver→Gold refinery —
   rather than a stock illustration. That is the principle taken here; none of
   their drawings is reproduced. These five are ours, drawn from our own
   mechanisms:

     slice      one vertical slice crossing every layer, in production first
     stores     one codebase, one release train, two app stores
     api        one typed contract, many clients, with the data behind it
     deploy     push → plan → deploy → observe, with the rollback arc
     retrieval  a model call wrapped in retrieval, guardrails and evaluation
     merge      two lanes of engineers converging on one repository

   Rebuilt 2026-09-08 for the live site's SIX services: `stores` and `api`
   are new (Mobile and Backend were one service before), and `lineage` was
   retired with the Data & analytics capability, which interloid.com does not
   sell as a separate service.

   ── THREE CONSTRAINTS, ALL LOAD-BEARING ─────────────────────────────────
   1. NO `id`s, no `<defs>`, no gradients. Every diagram renders TWICE on the
      page — once in the desktop sticky panel and once inline for mobile — so
      any id would be duplicated in the document, and a duplicated gradient id
      resolves to whichever came first. Flat fills and strokes only.
   2. TOKENS, NEVER LITERALS. Colour arrives through Tailwind classes
      (`stroke-border`, `fill-card`, `text-brand` + `fill="currentColor"`), so
      both themes work with no `.dark` branch here. A hex in this file is a
      bug in dark mode.
   3. Text inside SVG must stay ≥ 10px at the rendered size and is set with
      `fill="currentColor"` under a colour class, so it obeys the same
      contrast tokens as body copy.

   The whole SVG is `role="img"` with a written label: a screen-reader user
   gets the mechanism as a sentence, and the capability's own prose repeats
   the same claim, so nothing is only available as a picture.
   ========================================================================== */

function Frame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 560 400"
      role="img"
      aria-label={label}
      className="h-full w-full"
      fill="none"
    >
      {children}
    </svg>
  );
}

/* Shared micro-label. SVG has no `text-transform` shorthand in Tailwind that
   survives into the shadow-free SVG box, so the casing is in the string. */
function Micro({
  x,
  y,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="currentColor"
      className="fill-muted-foreground text-[10px] font-bold tracking-[0.14em]"
      style={{ fontSize: 10, letterSpacing: "0.14em" }}
    >
      {children}
    </text>
  );
}

function Label({
  x,
  y,
  children,
  anchor = "start",
  strong,
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  strong?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="currentColor"
      className={strong ? "fill-foreground" : "fill-muted-strong"}
      style={{ fontSize: strong ? 14 : 12, fontWeight: strong ? 700 : 500 }}
    >
      {children}
    </text>
  );
}

/* ── 01 · PRODUCT ENGINEERING ──────────────────────────────────────────────
   A four-by-four grid: four product layers down the side, four slices across.
   Slice 01 is built and live; 02-04 are the same shape, waiting. The argument
   is that integration risk is paid in week two rather than in the final
   month, and it only reads if the queue is visible — see the note above the
   rewrite for why the first version did not. */
function Slice() {
  const lanes = ["INTERFACE", "SERVICE", "DATA", "DEPLOY"];
  /* Four columns on one pitch, so the built slice and the queued ones are
     unmistakably the same object at different stages. */
  const COL_X = [138, 238, 338, 438];
  const COL_W = 84;
  const ROW_H = 58;
  const ROW_GAP = 14;
  const TOP = 62;
  const rowY = (i: number) => TOP + i * (ROW_H + ROW_GAP);
  const gridBottom = rowY(3) + ROW_H;

  return (
    <Frame label="A grid of four product layers — interface, service, data and deploy — by four delivery slices. The first slice is filled and in production, crossing all four layers; slices two, three and four are drawn empty behind it, waiting.">
      {/* lane names, and a hairline per layer so the rows read as layers */}
      {lanes.map((l, i) => (
        <g key={l}>
          <Micro x={122} y={rowY(i) + ROW_H / 2 + 4} anchor="end">
            {l}
          </Micro>
          <line
            x1={132}
            y1={rowY(i) + ROW_H / 2}
            x2={COL_X[3] + COL_W + 10}
            y2={rowY(i) + ROW_H / 2}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        </g>
      ))}

      {/* THE QUEUE — drawn first, so the built slice paints over it. Real
          cells, not dashed outlines: the point is that they are the same
          shape as the one that shipped, only empty. */}
      {COL_X.slice(1).map((x, c) =>
        lanes.map((l, i) => (
          <rect
            key={`${l}${x}`}
            x={x}
            y={rowY(i)}
            width={COL_W}
            height={ROW_H}
            rx={12}
            className="fill-muted stroke-border"
            strokeWidth={1}
            opacity={0.9 - c * 0.22}
          />
        )),
      )}
      {COL_X.slice(1).map((x, c) => (
        <g key={`n${x}`} opacity={0.9 - c * 0.22}>
          <Micro x={x + COL_W / 2} y={44} anchor="middle">
            {`0${c + 2}`}
          </Micro>
        </g>
      ))}

      {/* THE SLICE THAT SHIPPED — filled cells, and a ring around the whole
          column so the four of them read as one delivery rather than four
          unrelated blocks. */}
      <rect
        x={COL_X[0] - 10}
        y={TOP - 12}
        width={COL_W + 20}
        height={gridBottom - TOP + 24}
        rx={18}
        className="fill-brand/5 stroke-brand"
        strokeWidth={1.5}
      />
      {lanes.map((l, i) => (
        <rect
          key={`f${l}`}
          x={COL_X[0]}
          y={rowY(i)}
          width={COL_W}
          height={ROW_H}
          rx={12}
          className="fill-brand"
        />
      ))}
      <Micro x={COL_X[0] + COL_W / 2} y={44} anchor="middle">
        SLICE 01
      </Micro>

      {/* live marker under the built column */}
      <circle cx={COL_X[0] + COL_W / 2} cy={gridBottom + 32} r={5} className="fill-accent" />
      <Label x={COL_X[0] + COL_W / 2 + 15} y={gridBottom + 36}>
        in production
      </Label>

      {/* and the direction of travel, so the queue reads as a queue */}
      <Label x={COL_X[3] + COL_W} y={gridBottom + 36} anchor="end">
        next, and the next
      </Label>
    </Frame>
  );
}

/* ── 02 · MOBILE ───────────────────────────────────────────────────────────
   One codebase, one release train, two stores. The claim being drawn is the
   one the live site makes as "one team, two platforms": the shared trunk is
   wide and the platform-specific work is the two short branches at the end,
   not two parallel builds. The store-review gate is drawn because it is the
   part every client forgets exists until it rejects them. */
function Stores() {
  return (
    <Frame label="A single shared codebase feeding one release pipeline, which branches at the end into iOS and Android store submissions, each passing a review gate. Native modules attach to the shared trunk where the bridge is the wrong answer.">
      {/* shared codebase */}
      <rect
        x={32}
        y={158}
        width={150}
        height={84}
        rx={18}
        className="fill-indigo-600/10 stroke-indigo-600"
        strokeWidth={1.5}
      />
      <Micro x={50} y={186}>
        ONE CODEBASE
      </Micro>
      <Label x={50} y={210} strong>
        React Native
      </Label>
      <Label x={50} y={230}>
        TypeScript
      </Label>

      {/* native modules attaching to the trunk */}
      <rect
        x={214}
        y={62}
        width={132}
        height={44}
        rx={12}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <Label x={280} y={89} anchor="middle">
        native modules
      </Label>
      <path
        d="M280 106 v46"
        className="stroke-border"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {/* the release train */}
      <path d="M182 200 h44" className="stroke-indigo-600" strokeWidth={2} />
      <rect
        x={226}
        y={168}
        width={108}
        height={64}
        rx={16}
        className="fill-card stroke-indigo-600"
        strokeWidth={1.5}
      />
      <Micro x={242} y={192}>
        ONE PIPELINE
      </Micro>
      <Label x={242} y={214} strong>
        Release
      </Label>

      {/* split to the two stores */}
      <path
        d="M334 200 C 372 200, 372 132, 410 132"
        className="stroke-indigo-600"
        strokeWidth={2}
      />
      <path
        d="M334 200 C 372 200, 372 268, 410 268"
        className="stroke-indigo-600"
        strokeWidth={2}
      />

      {[
        { y: 104, micro: "REVIEW GATE", label: "App Store" },
        { y: 240, micro: "REVIEW GATE", label: "Play Store" },
      ].map((s) => (
        <g key={s.label}>
          <rect
            x={410}
            y={s.y}
            width={122}
            height={56}
            rx={16}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <Micro x={426} y={s.y + 22}>
            {s.micro}
          </Micro>
          <Label x={426} y={s.y + 42} strong>
            {s.label}
          </Label>
        </g>
      ))}

      {/* signed once */}
      <rect
        x={226}
        y={286}
        width={108}
        height={38}
        rx={12}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <Label x={280} y={310} anchor="middle">
        signing, in CI
      </Label>
      <path
        d="M280 286 v-54"
        className="stroke-border"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      <Micro x={280} y={356} anchor="middle">
        ONE TEAM, BOTH PLATFORMS
      </Micro>
    </Frame>
  );
}

/* ── 03 · BACKEND & APIs ───────────────────────────────────────────────────
   One typed contract in the middle, several clients on the left, the data and
   the operational surface behind it. The section's claim is that growth does
   not require a rewrite, so what is drawn is the seam: clients depend on the
   contract, never on the store behind it. */
function Api() {
  return (
    <Frame label="Web, mobile and third-party clients all calling one typed, versioned API contract, which fronts a primary database, a cache and background jobs, with traces and alerts on the side.">
      {/* clients */}
      {[
        { y: 66, label: "Web app" },
        { y: 150, label: "Mobile app" },
        { y: 234, label: "Partners" },
      ].map((c) => (
        <g key={c.label}>
          <rect
            x={28}
            y={c.y}
            width={116}
            height={54}
            rx={14}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <Label x={44} y={c.y + 33}>
            {c.label}
          </Label>
          <path
            d={`M144 ${c.y + 27} H196`}
            className="stroke-teal-600"
            strokeWidth={1.5}
          />
        </g>
      ))}

      {/* the contract */}
      <rect
        x={196}
        y={54}
        width={140}
        height={226}
        rx={20}
        className="fill-teal-600/10 stroke-teal-600"
        strokeWidth={1.5}
      />
      <Micro x={266} y={84} anchor="middle">
        TYPED · VERSIONED
      </Micro>
      <Label x={266} y={112} anchor="middle" strong>
        API contract
      </Label>
      {["GET /orders", "POST /orders", "GET /orders/:id"].map((r, i) => (
        <g key={r}>
          <rect
            x={212}
            y={132 + i * 40}
            width={108}
            height={30}
            rx={9}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <text
            x={224}
            y={152 + i * 40}
            fill="currentColor"
            className="fill-muted-strong"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {r}
          </text>
        </g>
      ))}
      <Micro x={266} y={302} anchor="middle">
        THE SEAM THAT SURVIVES GROWTH
      </Micro>

      {/* behind it */}
      {[
        { y: 54, micro: "PRIMARY", label: "PostgreSQL" },
        { y: 138, micro: "HOT PATH", label: "Redis cache" },
        { y: 222, micro: "IDEMPOTENT", label: "Background jobs" },
      ].map((n) => (
        <g key={n.label}>
          <path
            d={`M336 ${n.y + 29} H388`}
            className="stroke-teal-600"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <rect
            x={388}
            y={n.y}
            width={144}
            height={58}
            rx={14}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <Micro x={404} y={n.y + 24}>
            {n.micro}
          </Micro>
          <Label x={404} y={n.y + 44} strong>
            {n.label}
          </Label>
        </g>
      ))}

      {/* operations */}
      <rect
        x={388}
        y={306}
        width={144}
        height={40}
        rx={12}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <Label x={460} y={331} anchor="middle">
        traces & alerts
      </Label>
      <path
        d="M460 306 v-26"
        className="stroke-border"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
    </Frame>
  );
}

/* ── 04 · CLOUD & DEVOPS ───────────────────────────────────────────────────
   The loop, with the rollback drawn as a first-class arc rather than an
   afterthought — the section's claim is that the client's own team can run
   both directions of it. */
function Deploy() {
  const nodes = [
    { x: 90, y: 96, micro: "ANY ENGINEER", label: "Push" },
    { x: 330, y: 96, micro: "PLANNED", label: "CI checks" },
    { x: 330, y: 258, micro: "YOUR ACCOUNT", label: "Deploy" },
    { x: 90, y: 258, micro: "PAGES A HUMAN", label: "Observe" },
  ];
  return (
    <Frame label="A four-step loop — push, CI checks, deploy into your own cloud account, observe — with a rollback arc labelled one documented command returning from deploy to the previous state.">
      {/* the rail */}
      <rect
        x={130}
        y={78}
        width={300}
        height={220}
        rx={40}
        className="stroke-border"
        strokeWidth={1.5}
        strokeDasharray="6 7"
      />

      {nodes.map((n) => (
        <g key={n.label}>
          <rect
            x={n.x}
            y={n.y}
            width={140}
            height={62}
            rx={16}
            className="fill-card stroke-border"
            strokeWidth={1}
          />
          <Micro x={n.x + 16} y={n.y + 24}>
            {n.micro}
          </Micro>
          <Label x={n.x + 16} y={n.y + 46} strong>
            {n.label}
          </Label>
        </g>
      ))}

      {/* direction arrows on the rail */}
      <path d="M272 90 l10 -6 v12 z" className="fill-brand-light" />
      <path d="M436 196 l-6 -10 h12 z" className="fill-brand-light" />
      <path d="M288 320 l-10 6 v-12 z" className="fill-brand-light" />
      <path d="M124 196 l6 10 h-12 z" className="fill-brand-light" />

      {/* rollback */}
      <path
        d="M330 289 C 250 240, 250 160, 330 138"
        className="stroke-brand-light"
        strokeWidth={1.5}
      />
      <path d="M330 138 l-12 2 6 8 z" className="fill-brand-light" />
      <rect
        x={196}
        y={186}
        width={168}
        height={38}
        rx={12}
        className="fill-brand-light/10 stroke-brand-light"
        strokeWidth={1}
      />
      <Label x={280} y={210} anchor="middle">
        rollback: one command
      </Label>
    </Frame>
  );
}

/* ── 05 · AI INTEGRATION ───────────────────────────────────────────────────
   The demo-versus-shipped distinction, drawn: the model call is the small
   box in the middle, and everything around it — retrieval, guardrails,
   evaluation, cost ceiling — is what makes it survive review. */
function Retrieval() {
  return (
    <Frame label="A workflow step feeding a retrieval index and a model call wrapped in guardrails, with an evaluation harness scoring the output and a cost ceiling applied per call.">
      {/* workflow in */}
      <rect
        x={28}
        y={150}
        width={112}
        height={64}
        rx={16}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <Micro x={44} y={176}>
        WORKFLOW
      </Micro>
      <Label x={44} y={198} strong>
        The step
      </Label>
      <path d="M140 182 h34" className="stroke-indigo-600" strokeWidth={1.5} />

      {/* retrieval */}
      <rect
        x={174}
        y={92}
        width={128}
        height={58}
        rx={14}
        className="fill-indigo-600/10 stroke-indigo-600"
        strokeWidth={1}
      />
      <Micro x={190} y={116}>
        YOUR DATA
      </Micro>
      <Label x={190} y={136}>
        retrieval index
      </Label>
      <path
        d="M238 150 v18"
        className="stroke-indigo-600"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {/* the model call */}
      <rect
        x={174}
        y={168}
        width={128}
        height={64}
        rx={16}
        className="fill-card stroke-indigo-600"
        strokeWidth={1.5}
      />
      <Micro x={190} y={192}>
        GUARDED
      </Micro>
      <Label x={190} y={214} strong>
        model call
      </Label>

      {/* guardrails, drawn as the frame around it */}
      <rect
        x={162}
        y={80}
        width={152}
        height={224}
        rx={22}
        className="stroke-indigo-600"
        strokeWidth={1}
        strokeDasharray="5 6"
      />
      <Micro x={238} y={324} anchor="middle">
        GUARDRAILS BOTH ENDS
      </Micro>

      {/* cost ceiling */}
      <rect
        x={174}
        y={248}
        width={128}
        height={40}
        rx={12}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <Label x={238} y={273} anchor="middle">
        cost ceiling / call
      </Label>

      <path d="M314 182 h34" className="stroke-indigo-600" strokeWidth={1.5} />

      {/* evaluation harness */}
      <rect
        x={348}
        y={110}
        width={184}
        height={144}
        rx={18}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <Micro x={368} y={138}>
        EVALUATION HARNESS
      </Micro>
      {[
        ["accuracy", 0.86],
        ["refusals", 0.42],
        ["latency", 0.68],
      ].map(([name, v], i) => (
        <g key={name as string}>
          <Label x={368} y={168 + i * 30}>
            {name as string}
          </Label>
          <rect
            x={438}
            y={158 + i * 30}
            width={74}
            height={6}
            rx={3}
            className="fill-muted"
          />
          <rect
            x={438}
            y={158 + i * 30}
            width={74 * (v as number)}
            height={6}
            rx={3}
            className="fill-indigo-600"
          />
        </g>
      ))}
      {/* the measured verdict feeding back */}
      <path
        d="M440 254 v34 H238 v-0"
        className="stroke-indigo-600"
        strokeWidth={1.5}
        strokeDasharray="5 5"
      />
      <Micro x={340} y={306} anchor="middle">
        A PROMPT CHANGE VS A REGRESSION
      </Micro>
    </Frame>
  );
}

/* ── 06 · STAFF AUGMENTATION ────────────────────────────────────────────────
   Two lanes converging into one branch — the claim being that there is one
   repository and one review process, not a vendor track reporting in. The
   exit arrow at the right is the 30-day notice, drawn because it is the
   objection everyone has and nobody asks about on the first call. */
function Merge() {
  return (
    <Frame label="Two lanes of engineers, yours and ours, converging into a single repository and review process, with a marked exit thirty days after notice.">
      <Micro x={40} y={96}>
        YOUR ENGINEERS
      </Micro>
      <Micro x={40} y={306}>
        INTERLOID, NAMED IN THE PROPOSAL
      </Micro>

      {/* your lane */}
      <path d="M40 130 H180 C 250 130, 250 200, 320 200" className="stroke-brand" strokeWidth={2} />
      {[60, 110, 160].map((x) => (
        <circle key={x} cx={x} cy={130} r={6} className="fill-card stroke-brand" strokeWidth={2} />
      ))}

      {/* our lane */}
      <path d="M40 270 H180 C 250 270, 250 200, 320 200" className="stroke-accent" strokeWidth={2} />
      {[60, 110, 160].map((x) => (
        <circle key={x} cx={x} cy={270} r={6} className="fill-card stroke-accent" strokeWidth={2} />
      ))}

      {/* the shared trunk */}
      <path d="M320 200 H520" className="stroke-foreground" strokeWidth={2} />
      {[360, 400, 440].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={200}
          r={6}
          className={i % 2 === 0 ? "fill-brand" : "fill-accent"}
        />
      ))}

      <rect
        x={286}
        y={140}
        width={148}
        height={40}
        rx={12}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      <Label x={360} y={165} anchor="middle">
        one review process
      </Label>
      <path d="M360 180 v14" className="stroke-border" strokeWidth={1.5} strokeDasharray="4 4" />

      {/* the exit */}
      <path d="M480 200 C 500 200, 505 250, 520 262" className="stroke-accent" strokeWidth={2} strokeDasharray="5 5" />
      <circle cx={522} cy={264} r={6} className="fill-card stroke-accent" strokeWidth={2} />
      <Micro x={520} y={296} anchor="end">
        30-DAY NOTICE, EITHER WAY
      </Micro>

      <rect
        x={286}
        y={226}
        width={148}
        height={40}
        rx={12}
        className="fill-muted stroke-border"
        strokeWidth={1}
      />
      <Label x={360} y={251} anchor="middle">
        your repository
      </Label>
    </Frame>
  );
}

const DIAGRAMS: Record<string, () => React.ReactElement> = {
  slice: Slice,
  stores: Stores,
  api: Api,
  deploy: Deploy,
  retrieval: Retrieval,
  merge: Merge,
};

export default function Diagram({ name }: { name: string }) {
  const D = DIAGRAMS[name];
  return D ? <D /> : null;
}
