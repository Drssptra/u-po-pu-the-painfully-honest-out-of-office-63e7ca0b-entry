// The Painfully Honest Out-of-Office.
//
// One brutally honest but still polite out-of-office auto-reply, a single
// sentence under 200 characters. This program assembles the reply from its
// parts, checks it against the competition gate, and writes it verbatim to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt) — the file the
// judge reads. The gate reads the file bytes exactly, so the write carries
// no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// The reply, assembled from its beats
// ---------------------------------------------------------------------------

// The beats of the reply, in order. Kept separate so the sentence's shape
// is visible: a polite thank-you, the absence, the promise, and the honest
// punchline about the inbox.
const REPLY_BEATS = [
  "Thank you for your email",
  "I'm away until Monday",
  "and I'll reply the moment I'm back",
  "right after I delete the two hundred messages I already know I don't need to read.",
] as const;

// Joining rules: the first beat ends with an em dash, the middle beats are
// separated by commas, and the last beat already carries the final period.
function assembleReply(beats: readonly string[]): string {
  const [opening, absence, promise, punchline] = beats;
  return `${opening} — ${absence}, ${promise}, ${punchline}`;
}

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

// The sealed scorer only accepts UTF-8 text of 1 to 200 characters that is
// not only whitespace. A single sentence means no line breaks either.
const GATE = { minChars: 1, maxChars: 200 } as const;

function gateViolations(text: string): string[] {
  const problems: string[] = [];
  const chars = [...text].length;
  if (chars < GATE.minChars || chars > GATE.maxChars) {
    problems.push(`length ${chars} is outside ${GATE.minChars}-${GATE.maxChars} characters`);
  }
  if (text.trim().length === 0) {
    problems.push("text is only whitespace");
  }
  if (/[\r\n]/.test(text)) {
    problems.push("text spans more than one line");
  }
  // The brief asks for a single sentence: exactly one sentence-ending mark,
  // sitting at the very end.
  const terminators = text.match(/[.!?]/g) ?? [];
  if (terminators.length !== 1 || !/[.!?]$/.test(text)) {
    problems.push("text is not exactly one sentence");
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function writeEntry(text: string): void {
  const problems = gateViolations(text);
  if (problems.length > 0) {
    throw new Error(`Reply violates the gate: ${problems.join("; ")}.`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // No trailing newline: writeFileSync writes exactly these bytes.
  const outPath = `${outDir}/entry.txt`;
  writeFileSync(outPath, text, "utf8");
  // Read the bytes back: the gate reads the file, so confirm what landed on
  // disk is exactly the reply, nothing more.
  if (readFileSync(outPath, "utf8") !== text) {
    throw new Error("entry.txt on disk does not match the reply");
  }
}

const reply = assembleReply(REPLY_BEATS);
writeEntry(reply);
console.log(reply);
