import { parseCorrectAnswer, parseResponse } from "@/lib/quiz/schema";

/**
 * Read-only rendering of a submitted CODE answer: the student's code plus the
 * stored per-test-case results. Server component — used on both the student
 * results page and the tutor review page.
 */
export function CodeSubmissionView({
  correctAnswer,
  response,
}: {
  correctAnswer: unknown;
  response: unknown;
}) {
  let parsed: { code: string; testResults: { passed: boolean; actualOutput: string }[] };
  try {
    parsed = parseResponse("CODE", response);
  } catch {
    return <p className="text-sm text-zinc-500">(no answer)</p>;
  }
  const testCases = (() => {
    try {
      return parseCorrectAnswer("CODE", correctAnswer).testCases;
    } catch {
      return [];
    }
  })();

  const passedCount = parsed.testResults.filter((r) => r.passed).length;

  return (
    <div className="space-y-2">
      <pre className="overflow-x-auto rounded-md bg-zinc-900 px-4 py-3 text-xs leading-relaxed text-zinc-100">
        {parsed.code || "(no code submitted)"}
      </pre>
      {testCases.length > 0 && (
        <div className="rounded-md border border-zinc-200">
          <p className="border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
            Tests: {passedCount} / {testCases.length} passed
            {parsed.testResults.length === 0 && " (submitted before the test runner existed)"}
          </p>
          {parsed.testResults.slice(0, testCases.length).map((r, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-zinc-100 px-3 py-2 text-xs last:border-b-0">
              <span
                className={`mt-0.5 rounded-full px-2 py-0.5 font-medium ${
                  r.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {r.passed ? "✓" : "✗"}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5 font-mono">
                {testCases[i].input && <p className="truncate text-zinc-500">input: {testCases[i].input}</p>}
                <p className="truncate text-zinc-500">expected: {testCases[i].expectedOutput}</p>
                <p className={`truncate ${r.passed ? "text-zinc-700" : "text-red-600"}`}>
                  got: {r.actualOutput.trim() || "(no output)"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
