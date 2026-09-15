"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  APPLY_ERRORS,
  type ApplyErrors,
  checkApplication,
  extOf,
  fileOf,
  readValues,
} from "@/content/apply";
import { ROLES } from "@/content/site";

/* ==========================================================================
   applyForRole — the /careers/apply submission.
   ==========================================================================
   Public and unauthenticated, so an untrusted entry point: every value is
   re-read, capped and checked here with the same rules the form shows
   (content/apply.ts). The CV is checked twice: by extension and size, and
   then by its first bytes, so a renamed executable is refused even though
   it ends in ".pdf". The visitor's filename is never used as a path.

   ── WHERE APPLICATIONS GO ────────────────────────────────────────────────
   One folder per application in `content-submissions/applications/`
   (git-ignored with the rest of content-submissions): `application.json`
   plus `resume.<ext>`. Like /contact, this needs a writable filesystem: on a
   serverless host it reports `unavailable` until storage + email replace it.

   The request body limit is raised to 6 MB in next.config.ts; the default
   1 MB would reject most CVs before this function runs. */

export type ApplyState =
  | { status: "idle" }
  | { status: "error"; errors: ApplyErrors }
  | { status: "sent"; ref: string; firstName: string; role: string }
  /** Applications cannot be stored on this deployment yet. */
  | { status: "unavailable" };

const SIGNATURES: Record<string, readonly number[]> = {
  ".pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
  ".docx": [0x50, 0x4b, 0x03, 0x04], // zip
  ".doc": [0xd0, 0xcf, 0x11, 0xe0], // OLE2
};

export async function applyForRole(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  /* Honeypot: a person never sees `website`. Report success so a bot has
     nothing to retry against. */
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "sent", ref: "OK", firstName: "", role: "" };
  }

  const values = readValues(formData);
  const file = fileOf(formData);
  const errors = checkApplication(values, file);

  let bytes: Buffer | null = null;
  if (file && !errors.resume) {
    bytes = Buffer.from(await file.arrayBuffer());
    const sig = SIGNATURES[extOf(file.name)];
    if (!sig || !sig.every((b, i) => bytes![i] === b)) {
      errors.resume = APPLY_ERRORS.resumeType;
    }
  }

  const role = ROLES.find((r) => r.id === values.role);
  if (Object.keys(errors).length || !file || !bytes || !role) {
    return { status: "error", errors };
  }

  if (process.env.VERCEL) return { status: "unavailable" };

  const ref = randomUUID().slice(0, 8).toUpperCase();
  const receivedAt = new Date().toISOString();
  const resumeFile = `resume${extOf(file.name)}`;

  try {
    const dir = path.join(
      process.cwd(),
      "content-submissions",
      "applications",
      `${receivedAt.replace(/[:.]/g, "-")}-${ref}`,
    );
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, resumeFile), bytes);
    await writeFile(
      path.join(dir, "application.json"),
      JSON.stringify(
        {
          ref,
          receivedAt,
          role: { id: role.id, title: role.title },
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          linkedin: values.linkedin || null,
          message: values.message || null,
          resume: {
            file: resumeFile,
            originalName: file.name.slice(0, 200),
            bytes: file.size,
          },
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch (err) {
    console.error("[careers] could not save application", err);
    return { status: "unavailable" };
  }

  return { status: "sent", ref, firstName: values.firstName, role: role.title };
}
