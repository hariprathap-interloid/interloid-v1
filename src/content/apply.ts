import { ROLES, TERMS } from "./site";

/* ==========================================================================
   /careers/apply — copy and validation rules.
   ==========================================================================
   Reached from each role's Apply button (`?role=<id>` preselects it) and the
   careers CTA; intentionally not in the nav.

   `checkApplication` is shared by the form (instant feedback without a 5 MB
   upload) and the server action (the authoritative check), so the two
   cannot disagree. */

export const APPLY_HERO = {
  eyebrow: "Apply · trainee roles",
  head: "Tell us who you are,",
  accent: "then show us what you built.",
  lead: `Two minutes and no account. Pick a role, add your CV, and an engineer reads it. ${TERMS.mode}, in ${TERMS.location}.`,
} as const;

/* The three steps after sending. Same order and promises as HiringPath. */
export const APPLY_NEXT = [
  {
    title: "An engineer reads it",
    body: "Not a keyword filter. Everybody hears back, including a no.",
  },
  {
    title: "A 45-minute conversation",
    body: "About something you made, and anything you want to ask about the two years.",
  },
  {
    title: "A day with us, then an offer",
    body: "A small real task in the office, then the terms in writing.",
  },
] as const;

export const APPLY_TERMS = [
  { label: "Training", value: `${TERMS.training}, ${TERMS.trainingHours}` },
  { label: "Stipend", value: `${TERMS.stipend}, ${TERMS.stipendPeriod}` },
  { label: "Agreement", value: TERMS.agreement },
  { label: "Where", value: `${TERMS.mode}, ${TERMS.location}` },
] as const;

export const APPLY_LABELS = {
  role: "Which role are you applying for?",
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone number",
  linkedin: "LinkedIn profile",
  resume: "Resume / CV",
  message: "Cover letter / message",
} as const;

export type ApplyField = keyof typeof APPLY_LABELS;
export type ApplyErrors = Partial<Record<ApplyField, string>>;
export type ApplyValues = Record<Exclude<ApplyField, "resume">, string>;

export const APPLY_ERRORS = {
  role: "Pick the role you want to apply for.",
  firstName: "Add your first name.",
  lastName: "Add your last name.",
  phone: "Add a phone number we can call, with at least 10 digits.",
  linkedin: "That doesn't look like a LinkedIn link. Leave it empty if you don't have one.",
  resume: "Attach your CV so we can read it before we call.",
  resumeType: "Upload a PDF, DOC or DOCX file.",
  resumeSize: "That file is over 5 MB. Try exporting it as a PDF.",
} as const;

export const RESUME = {
  maxBytes: 5 * 1024 * 1024,
  exts: [".pdf", ".doc", ".docx"],
  accept:
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export const MESSAGE_MAX = 3000;

const CAPS: Record<keyof ApplyValues, number> = {
  role: 60,
  firstName: 80,
  lastName: 80,
  phone: 30,
  linkedin: 300,
  message: MESSAGE_MAX,
};

export function readValues(fd: FormData): ApplyValues {
  const out = {} as ApplyValues;
  for (const key of Object.keys(CAPS) as (keyof ApplyValues)[]) {
    const raw = fd.get(key);
    out[key] = typeof raw === "string" ? raw.trim().slice(0, CAPS[key]) : "";
  }
  return out;
}

/** The chosen CV, or null. An empty file input still posts a 0-byte File. */
export function fileOf(fd: FormData): File | null {
  const f = fd.get("resume");
  return typeof f === "object" && f !== null && f.size > 0 ? f : null;
}

export function extOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot).toLowerCase();
}

export function formatBytes(n: number) {
  return n < 1024 * 1024
    ? `${Math.max(1, Math.round(n / 1024))} KB`
    : `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPhone(v: string) {
  if (!/^\+?[\d\s().-]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
}

export function isLinkedIn(v: string) {
  return /^(https?:\/\/)?([\w-]+\.)?linkedin\.com\/\S+$/i.test(v);
}

export function checkResume(file: { name: string; size: number } | null) {
  if (!file) return APPLY_ERRORS.resume;
  if (!(RESUME.exts as readonly string[]).includes(extOf(file.name))) return APPLY_ERRORS.resumeType;
  if (file.size > RESUME.maxBytes) return APPLY_ERRORS.resumeSize;
  return undefined;
}

export function checkApplication(
  v: ApplyValues,
  file: { name: string; size: number } | null,
): ApplyErrors {
  const e: ApplyErrors = {};
  if (!ROLES.some((r) => r.id === v.role)) e.role = APPLY_ERRORS.role;
  if (!v.firstName) e.firstName = APPLY_ERRORS.firstName;
  if (!v.lastName) e.lastName = APPLY_ERRORS.lastName;
  if (!isPhone(v.phone)) e.phone = APPLY_ERRORS.phone;
  if (v.linkedin && !isLinkedIn(v.linkedin)) e.linkedin = APPLY_ERRORS.linkedin;
  const resume = checkResume(file);
  if (resume) e.resume = resume;
  return e;
}
