"use client";

// Client for the Pyodide Web Worker (public/pyodide-worker.js). All Python
// execution happens off the main thread, so the UI never freezes; runaway
// code (infinite loops) is killed by terminating the worker on timeout and
// respawning it on the next run.

export type OutputLine = { stream: "stdout" | "stderr"; text: string };
export type RunOutcome = { lines: OutputLine[]; resultRepr: string | null; error: string | null };
type TestOutcome = { lines: OutputLine[]; error: string | null };

type WorkerResponse =
  | { id: number; ok: true; run?: RunOutcome; tests?: TestOutcome[] }
  | { id: number; ok: false; error: string };
type WorkerReply = { kind: "ready" } | WorkerResponse;

const RUN_TIMEOUT_MS = 30_000;

let worker: Worker | null = null;
let workerReady: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (r: WorkerResponse) => void; reject: (e: Error) => void }>();
// Runs are serialized: the worker executes one message at a time anyway, and
// a timeout-terminate must not take unrelated in-flight runs down with it.
let queue: Promise<unknown> = Promise.resolve();

function killWorker(reason: string) {
  worker?.terminate();
  worker = null;
  workerReady = null;
  for (const { reject } of pending.values()) reject(new Error(reason));
  pending.clear();
}

function ensureWorker(): Promise<void> {
  if (worker && workerReady) return workerReady;
  const w = new Worker("/pyodide-worker.js");
  worker = w;
  workerReady = new Promise<void>((resolveReady, rejectReady) => {
    w.onmessage = (event: MessageEvent<WorkerReply>) => {
      const msg = event.data;
      if ("kind" in msg && msg.kind === "ready") {
        resolveReady();
        return;
      }
      if ("id" in msg) {
        const entry = pending.get(msg.id);
        if (entry) {
          pending.delete(msg.id);
          entry.resolve(msg);
        }
      }
    };
    w.onerror = (event) => {
      const err = new Error(event.message || "Python worker crashed");
      rejectReady(err);
      killWorker(err.message);
    };
  });
  return workerReady;
}

function request(payload: { kind: "run" | "test"; code: string; testCases?: { input: string }[] }) {
  const result = queue.then(async () => {
    await ensureWorker();
    const id = nextId++;
    return await new Promise<WorkerResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        killWorker("timeout");
        reject(
          new Error(
            `Kode berjalan lebih dari ${RUN_TIMEOUT_MS / 1000} detik dan dihentikan — mungkin ada infinite loop? Perbaiki lalu coba lagi.`
          )
        );
      }, RUN_TIMEOUT_MS);
      pending.set(id, {
        resolve: (reply) => {
          clearTimeout(timer);
          resolve(reply);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      worker!.postMessage({ id, ...payload });
    });
  });
  queue = result.catch(() => {});
  return result;
}

/** True once the runtime has booted (first call triggers the download). */
export function isPythonReady(): boolean {
  return worker !== null;
}

/** Scratchpad run: stdout/stderr lines plus a REPL-style echo of the last expression. */
export async function runPythonCode(code: string): Promise<RunOutcome> {
  const reply = await request({ kind: "run", code });
  if (!reply.ok) return { lines: [], resultRepr: null, error: reply.error };
  return reply.run!;
}

/**
 * Whitespace-tolerant output comparison (classic judge rules): trailing
 * whitespace per line and trailing newlines are ignored.
 */
function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export type TestCaseInput = { input: string; expectedOutput: string };
export type TestCaseResult = { passed: boolean; actualOutput: string };

/** Quiz test runner: executes the code once per case in the worker. */
export async function runTestCases(code: string, testCases: TestCaseInput[]): Promise<TestCaseResult[]> {
  const reply = await request({ kind: "test", code, testCases: testCases.map((t) => ({ input: t.input })) });
  if (!reply.ok) {
    return testCases.map(() => ({ passed: false, actualOutput: reply.error }));
  }
  return reply.tests!.map((t, i) => {
    const actualOutput = (t.lines.map((l) => l.text).join("") + (t.error ? t.error : "")).slice(0, 4000);
    return {
      passed: !t.error && normalizeOutput(actualOutput) === normalizeOutput(testCases[i].expectedOutput),
      actualOutput,
    };
  });
}
