// The Painfully Honest Out-of-Office — one brutally honest but still polite
// out-of-office auto-reply, a single sentence under 200 characters, written
// verbatim to $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt),
// the file the judge reads. No trailing newline: the gate reads the file
// bytes exactly.
import { mkdirSync, writeFileSync } from "node:fs";

const REPLY =
  "Thank you for your email — I'm away until Monday, and I'll reply the moment I'm back, right after I delete the two hundred messages I already know I don't need to read.";

// The gate only accepts 1–200 characters, a single sentence, not only whitespace.
const REPLY_LENGTH = [...REPLY].length;
if (
  REPLY_LENGTH < 1 ||
  REPLY_LENGTH > 200 ||
  REPLY.trim().length === 0 ||
  REPLY.includes("\n") ||
  REPLY.includes("\r")
) {
  throw new Error(
    `Reply violates the gate: must be one line of 1-200 characters (got ${REPLY_LENGTH}).`,
  );
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, REPLY, "utf8");
console.log(REPLY);
