import { z } from "zod";

/**
 * GUIDED_CODE: a short, step-by-step coding exercise inside a lesson — the
 * light cousin of the guided projects (src/lib/projects). One file, one
 * editor, a guide above it; each step is checked by running the program and
 * comparing what it prints, plus optional "your code must contain…" checks so
 * a step can't be passed by printing the expected text directly.
 *
 * Practice only: nothing is scored. Written by a script (see
 * scripts/content/cpp-guided.ts), never in the lesson editor, and the
 * reference solutions stay in that script — the block holds no answers.
 */

export const codeCheckSchema = z.object({
  /** A regular expression the code must match, comments removed. */
  pattern: z.string().min(1),
  /** Shown when it doesn't, e.g. "Declare the constructor inside the class". */
  message: z.string().min(1),
});

export const guidedStepSchema = z.object({
  title: z.string().min(1),
  /** Markdown: what to do in this step. */
  instructions: z.string().min(1),
  /** What the whole program prints once the step is done. */
  expectedOutput: z.string(),
  /** Fed to the program on the check (and pre-filled for Run). */
  stdin: z.string().default(""),
  /** Revealed one at a time. */
  hints: z.array(z.string().min(1)).default([]),
  codeChecks: z.array(codeCheckSchema).default([]),
});

export const guidedCodeSchema = z.object({
  language: z.literal("cpp"),
  title: z.string().min(1),
  /** Markdown shown above the steps. */
  intro: z.string().default(""),
  starterCode: z.string(),
  steps: z.array(guidedStepSchema).min(1),
});

export type GuidedCode = z.infer<typeof guidedCodeSchema>;
export type GuidedStep = z.infer<typeof guidedStepSchema>;

/** C++ source with // and /* *\/ comments blanked out, so a TODO comment can't satisfy a code check. String literals are kept. */
export function stripCppComments(code: string): string {
  let out = "";
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];
    if (c === '"' || c === "'") {
      const quote = c;
      out += c;
      i++;
      while (i < code.length && code[i] !== quote && code[i] !== "\n") {
        if (code[i] === "\\" && i + 1 < code.length) {
          out += code[i] + code[i + 1];
          i += 2;
        } else out += code[i++];
      }
      if (i < code.length) out += code[i++];
    } else if (c === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      i += 2;
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
        if (code[i] === "\n") out += "\n";
        i++;
      }
      i += 2;
      out += " ";
    } else out += code[i++];
  }
  return out;
}

/** The messages of the code checks this code fails, in order. */
export function failedCodeChecks(code: string, checks: GuidedStep["codeChecks"]): string[] {
  const source = stripCppComments(code);
  return checks.filter((check) => !new RegExp(check.pattern, "m").test(source)).map((check) => check.message);
}
