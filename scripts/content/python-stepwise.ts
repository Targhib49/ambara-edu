/**
 * The shared vocabulary of the step-by-step Python units (python-if.ts,
 * python-loop.ts, …). scripts/setup-python-stepwise.ts turns each block into
 * lesson blocks, running every program with Python 3.12 (the version Pyodide
 * 0.26 ships) so nothing on the page is typed by hand:
 *   - `example`  → a code block plus its real output
 *   - `mistake`  → the broken code, its real error (or wrong output), the fix
 *   - `trace`    → a code_tracer visualization recorded by trace.py; the
 *                  predict answer is whichever option equals the real output
 *   - `guided`   → a GUIDED_CODE block; each step's expectedOutput is its
 *                  solution's real output, and the step before must not pass
 *   - `try`      → a task, a scratchpad, and the target output of a solution
 *
 * Every lesson follows the same shape:
 *   why → see it (examples) → trace it (predict, then step through) →
 *   guided exercise (step by step, checked) → common mistakes → try alone → summary
 */

export type PredictSource = { question: string; options: string[]; explanation: string };

export type GuidedStepSource = {
  title: string;
  instructions: string;
  stdin?: string;
  hints?: string[];
  codeChecks?: { pattern: string; message: string }[];
  /** The whole program once this step is done. Never reaches the page. */
  solution: string;
};

export type BlockSource =
  | { kind: "md"; text: string }
  | { kind: "example"; code: string; stdin?: string; lead?: string }
  | { kind: "mistake"; title: string; code: string; explain: string; fix: string; stdin?: string }
  | { kind: "trace"; title: string; code: string; stdin?: string; notes?: Record<number, string>; predict?: PredictSource }
  | { kind: "guided"; title: string; intro: string; starterCode: string; steps: GuidedStepSource[] }
  | { kind: "try"; title: string; task: string; starterCode: string; solution: string };

export type LessonSource = { title: string; blocks: BlockSource[] };

export type Unit = { chapterTitle: string; lessons: LessonSource[] };

export const md = (...lines: string[]): BlockSource => ({ kind: "md", text: lines.join("\n") });
export const py = (source: string) => source.replace(/^\n/, "").replace(/\s+$/, "");

/** A code check that `word` appears exactly once (e.g. a print written once, inside the loop). */
export const once = (word: string, message: string) => ({
  pattern: `(?<![\\s\\S])(?![\\s\\S]*${word}[\\s\\S]*${word})[\\s\\S]*${word}`,
  message,
});

export const GUIDED_TAIL =
  "Kerjakan satu langkah dulu, lalu tekan **✓ Cek langkah**. Programmu dijalankan dan output-nya dibandingkan dengan *Output yang diharapkan*. Kalau sudah benar, langkah berikutnya terbuka — dan kodenya terus kamu kembangkan. Kodemu tersimpan otomatis.";

export const INPUT_NOTE =
  "Di latihan terpandu, `input()` ditulis **tanpa teks pertanyaan** di dalam kurungnya, karena nilai input-nya sudah disiapkan oleh tiap langkah (lihat *Input langkah ini*).";
