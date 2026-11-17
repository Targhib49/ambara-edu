import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

/**
 * Compiles and runs a student's C++ program.
 *
 * There is no C++ compiler that runs sensibly in a browser (a full clang in
 * WebAssembly is a ~60 MB download), so this hands the source to Wandbox, a
 * public compile-and-run service, and returns what it printed. Only the code
 * and the typed input leave the server — no name, email or any identifier.
 *
 * Signed-in users only, with a size cap and a short per-user cooldown, so
 * this can't be used as an open relay to someone else's service.
 */
export const maxDuration = 40;

const WANDBOX_URL = "https://wandbox.org/api/compile.json";
const COMPILER = "gcc-13.2.0";
const COOLDOWN_MS = 2000;
const MAX_OUTPUT = 20_000;

const requestSchema = z.object({
  code: z.string().min(1).max(20_000),
  stdin: z.string().max(4_000).default(""),
});

// Best effort: per server instance, which is enough to stop a stuck Run button.
const lastRun = new Map<string, number>();

export type CppRunResult = {
  /** False when the program did not compile; `compileOutput` then says why. */
  compiled: boolean;
  compileOutput: string;
  stdout: string;
  stderr: string;
  /** Null when the program was killed by a signal (a crash or the time limit). */
  exitCode: number | null;
  signal: string;
};

const clip = (text: unknown) => (typeof text === "string" ? text.slice(0, MAX_OUTPUT) : "");

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const now = Date.now();
  if (now - (lastRun.get(user.id) ?? 0) < COOLDOWN_MS) return NextResponse.json({ error: "cooldown" }, { status: 429 });
  lastRun.set(user.id, now);

  let upstream: Response;
  try {
    upstream = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler: COMPILER, code: parsed.data.code, stdin: parsed.data.stdin, options: "warning,c++17" }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
  if (!upstream.ok) return NextResponse.json({ error: "unavailable" }, { status: 502 });

  const body = (await upstream.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "unavailable" }, { status: 502 });

  const stdout = clip(body.program_output);
  const stderr = clip(body.program_error);
  const compileOutput = clip(body.compiler_error) || clip(body.compiler_output);
  const signal = clip(body.signal);
  const status = typeof body.status === "string" && body.status !== "" ? Number(body.status) : null;
  // A program that never started has no output of its own and a compiler complaint.
  const compiled = !(status !== 0 && !signal && stdout === "" && stderr === "" && /error/i.test(compileOutput));

  const result: CppRunResult = { compiled, compileOutput, stdout, stderr, exitCode: signal ? null : status, signal };
  return NextResponse.json(result);
}
