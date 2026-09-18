"use client";

import { diffLines, type CheckResult, type CheckRun } from "@/lib/projects/check";
import { useT } from "@/lib/i18n/client";

/** Python's traceback ends with the line that matters, e.g. "NameError: name 'x' is not defined". */
export function lastLine(error: string): string {
  const lines = error.trim().split("\n").filter(Boolean);
  return lines[lines.length - 1] ?? error;
}

/** Up to this many failed function checks are listed; more would bury the first. */
const MAX_SCRIPT_FAILURES = 5;

/**
 * Why a check failed, most useful first:
 * - the example: expected and actual output side by side, the first differing
 *   line marked, since that's where to look;
 * - function checks: each one's name, what it gave and what it should give,
 *   like the old lessons' "alat cek";
 * - other input: the input and what the program printed, never the answer.
 */
export function CheckFeedback({ result }: { result: CheckResult }) {
  const t = useT();
  const example = result.runs[0];
  const scriptFailures = result.runs.filter((r) => r.kind === "script" && !r.passed);
  const inputFailure = result.runs.find((r) => r.kind === "input" && !r.passed);

  return (
    <div className="space-y-3 rounded-md bg-red-50 p-2.5 text-xs text-red-800">
      <p className="font-semibold">{t("project.checkFailed")}</p>

      {!example.passed && <ExampleDiff run={example} />}

      {example.passed && scriptFailures.length > 0 && (
        <div>
          <p>{t("project.functionChecksFailed", { n: scriptFailures.length })}</p>
          <ul className="mt-1 space-y-1">
            {scriptFailures.slice(0, MAX_SCRIPT_FAILURES).map((run, i) => (
              <li key={i} className="rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
                <span className="text-red-700">✗ {run.label || t("project.functionCheck")}</span>
                {run.error ? (
                  <span className="block text-red-700">{lastLine(run.error)}</span>
                ) : (
                  <span className="block">
                    {t("project.gotButExpected", {
                      got: oneLine(run.output) || t("project.noOutput"),
                      expected: oneLine(run.expectedOutput),
                    })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {example.passed && scriptFailures.length === 0 && inputFailure && (
        <div>
          <p>{t("project.hiddenFailed", { n: result.runs.filter((r) => r.kind === "input" && !r.passed).length })}</p>
          <p className="mt-1 text-red-700">{t("project.hiddenInput")}</p>
          <pre className="mt-0.5 whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
            {inputFailure.input || t("project.noInput")}
          </pre>
          <p className="mt-1 text-red-700">{t("project.hiddenGot")}</p>
          <pre className="mt-0.5 whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
            {inputFailure.error ? lastLine(inputFailure.error) : inputFailure.output || t("project.noOutput")}
          </pre>
        </div>
      )}
    </div>
  );
}

/** A function check's output fits on a line; a multi-line one is joined so the row stays readable. */
function oneLine(text: string): string {
  return text.trim().split("\n").join(" ⏎ ");
}

/**
 * The example's expected and actual output, line by line. Spaces are drawn as
 * dots on the first differing line, since a missing space is the usual cause
 * and is otherwise invisible.
 */
function ExampleDiff({ run }: { run: CheckRun }) {
  const t = useT();
  if (run.error) {
    return (
      <div>
        <p>{t("project.exampleError")}</p>
        <pre className="mt-1 whitespace-pre-wrap rounded bg-white px-2 py-1 font-mono text-[11px] text-zinc-800 ring-1 ring-red-100">
          {lastLine(run.error)}
        </pre>
      </div>
    );
  }
  const { lines, firstDifference } = diffLines(run.expectedOutput, run.output);
  return (
    <div>
      <p>{firstDifference >= 0 ? t("project.firstDifference", { line: firstDifference + 1 }) : t("project.exampleMismatch")}</p>
      <div className="mt-1 overflow-x-auto rounded bg-white ring-1 ring-red-100">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-zinc-400">
              <th className="w-6 px-1.5 py-1 font-medium" />
              <th className="px-1.5 py-1 font-medium">{t("project.expectedOutput")}</th>
              <th className="px-1.5 py-1 font-medium">{t("project.yourOutput")}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => {
              const first = i === firstDifference;
              return (
                <tr key={i} className={first ? "bg-amber-100" : line.same ? "" : "bg-red-50/60"}>
                  <td className="px-1.5 py-0.5 text-right text-zinc-400">{i + 1}</td>
                  <td className="whitespace-pre px-1.5 py-0.5 text-zinc-800">{show(line.expected, first)}</td>
                  <td className="whitespace-pre px-1.5 py-0.5 text-zinc-800">{show(line.actual, first)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** A missing line reads as a dash; on the marked line, spaces show as middle dots. */
function show(text: string | null, visibleSpaces: boolean): string {
  if (text === null) return "—";
  return visibleSpaces ? text.replace(/ /g, "·") : text;
}
