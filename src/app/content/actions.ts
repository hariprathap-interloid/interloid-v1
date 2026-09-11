"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BRIEF_REACH,
  BRIEF_VERSIONS,
  fieldsOf,
  isEmail,
  isPhone,
  isReachable,
  missingMessage,
  tellStory,
} from "@/content/brief";

/* ==========================================================================
   sendStory — the /content enquiry.
   ==========================================================================
   Public and unauthenticated by design: it is a contact page. That makes it
   an untrusted entry point (Next's server-actions guide), so values are
   re-read against the fields of the version that was sent — unknown keys are
   dropped and every string is length-capped. Every field is free text
   (suggestions only fill a blank), so there is no option list to check.

   The required rules — name, what you need, and one well-formed way to reach
   them — come from content/brief.ts, the same helpers the letter uses to
   show "we still need…" live, so the two cannot disagree.

   ── WHERE SUBMISSIONS GO ─────────────────────────────────────────────────
   One JSON file per story in `content-submissions/` at the project root
   (git-ignored). That works for `next dev` and a self-hosted `next start`.
   On a serverless host (Vercel) the filesystem is read-only and per-request,
   so this write will fail there and the visitor sees BRIEF_SEND.failed —
   swap `save()` for an email or database call before deploying to one. It
   is the only function that needs to change. */

export type BriefState =
  | { status: "idle" }
  /** `missing` empty = the save failed, not the visitor. `version` lets the
      letter ignore this reply once they switch to the other version. */
  | { status: "error"; version: "quick" | "full"; message: string; missing: string[] }
  | { status: "sent"; ref: string; firstName: string; contact: string };

async function save(record: object, ref: string, receivedAt: string) {
  const dir = path.join(process.cwd(), "content-submissions");
  await mkdir(dir, { recursive: true });
  const file = `${receivedAt.replace(/[:.]/g, "-")}-${ref}.json`;
  await writeFile(path.join(dir, file), JSON.stringify(record, null, 2), "utf8");
}

export async function sendStory(
  _prev: BriefState,
  formData: FormData,
): Promise<BriefState> {
  /* Honeypot. A person never sees `website`; a bot fills every input. Report
     success so the bot has nothing to retry against. */
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "sent", ref: "—", firstName: "", contact: "" };
  }

  const version = formData.get("version") === "quick" ? BRIEF_VERSIONS.quick : BRIEF_VERSIONS.full;
  const fields = fieldsOf(version.chapters);

  const values: Record<string, string> = {};
  for (const f of fields) {
    const raw = formData.get(f.name);
    const v = typeof raw === "string" ? raw.trim().slice(0, f.kind === "long" ? 4000 : 300) : "";
    if (v) values[f.name] = v;
  }

  const missing = fields
    .filter((f) => f.required && !values[f.name])
    .map((f) => ({ name: f.name, label: f.label }));
  if (!isReachable(values)) {
    missing.push({ name: BRIEF_REACH.fields[0], label: BRIEF_REACH.label });
  }
  if (missing.length) {
    return {
      status: "error",
      version: version.key,
      message: missingMessage(missing.map((m) => m.label)),
      missing: missing.map((m) => m.name),
    };
  }

  /* Keep only a well-formed way back; the other may be a half-typed guess. */
  if (values.email && !isEmail(values.email)) delete values.email;
  if (values.phone && !isPhone(values.phone)) delete values.phone;

  const ref = randomUUID().slice(0, 8).toUpperCase();
  const receivedAt = new Date().toISOString();

  try {
    await save(
      { ref, receivedAt, version: version.key, story: tellStory(version, values), values },
      ref,
      receivedAt,
    );
  } catch (err) {
    console.error("[content] could not save story", err);
    return { status: "error", version: version.key, message: "", missing: [] };
  }

  return {
    status: "sent",
    ref,
    firstName: values.name.split(/\s+/)[0],
    contact: values.email ?? values.phone,
  };
}
