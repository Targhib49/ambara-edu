// Pyodide execution worker: keeps the ~10 MB WASM boot and all Python runs
// off the main thread (they froze the tab / triggered "page unresponsive"
// warnings when run inline), and makes runaway code killable — the client
// terminates this worker on timeout and spawns a fresh one.
//
// Protocol (client -> worker):
//   { id, kind: "run",  code }                    -> scratchpad run, no stdin
//   { id, kind: "test", code, testCases: [{input}] } -> one run per case
// Worker -> client:
//   { kind: "ready" }                once Pyodide is booted
//   { id, ok: true, run }            run:   { lines, resultRepr, error }
//   { id, ok: true, tests }          tests: [{ lines, error }]
//   { id, ok: false, error }

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/";

importScripts(PYODIDE_BASE + "pyodide.js");

const pyodideReady = loadPyodide({ indexURL: PYODIDE_BASE }).then((pyodide) => {
  self.postMessage({ kind: "ready" });
  return pyodide;
});

async function runOnce(pyodide, code, stdinText) {
  const lines = [];
  pyodide.setStdout({ batched: (text) => lines.push({ stream: "stdout", text }) });
  pyodide.setStderr({ batched: (text) => lines.push({ stream: "stderr", text }) });

  // Whole input handed to the first read; afterwards EOF — matches real
  // Python behavior when input() runs past the provided lines.
  let remaining = stdinText;
  pyodide.setStdin({
    stdin: () => {
      const chunk = remaining;
      remaining = null;
      return chunk;
    },
  });

  const globals = pyodide.runPython("dict()"); // fresh namespace per run
  try {
    const result = await pyodide.runPythonAsync(code, { globals });
    let resultRepr = null;
    if (result !== undefined && result !== null) {
      resultRepr = String(result);
      if (typeof result.destroy === "function") result.destroy();
    }
    return { lines, resultRepr, error: null };
  } catch (err) {
    return { lines, resultRepr: null, error: String((err && err.message) || err) };
  } finally {
    if (typeof globals.destroy === "function") globals.destroy();
  }
}

self.onmessage = async (event) => {
  const { id, kind, code, testCases } = event.data;
  try {
    const pyodide = await pyodideReady;
    await pyodide.loadPackagesFromImports(code);
    if (kind === "run") {
      self.postMessage({ id, ok: true, run: await runOnce(pyodide, code, "") });
    } else if (kind === "test") {
      const tests = [];
      for (const testCase of testCases) {
        const { lines, error } = await runOnce(pyodide, code, testCase.input);
        tests.push({ lines, error });
      }
      self.postMessage({ id, ok: true, tests });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
