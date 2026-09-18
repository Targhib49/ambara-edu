// Pyodide execution worker: keeps the ~10 MB WASM boot and all Python runs
// off the main thread (they froze the tab / triggered "page unresponsive"
// warnings when run inline), and makes runaway code killable — the client
// terminates this worker on timeout and spawns a fresh one.
//
// Protocol (client -> worker):
//   { id, kind: "run",  code }                    -> scratchpad run, no stdin
//   { id, kind: "test", code, testCases: [{input}] } -> one run per case
//   { id, kind: "project", files, entry, inputs }  -> a multi-file project,
//                                                      run once per input
// Worker -> client:
//   { kind: "ready" }                once Pyodide is booted
//   { id, ok: true, run }            run:   { lines, resultRepr, error }
//   { id, ok: true, tests }          tests: [{ lines, error }]
//   { id, ok: true, runs }           runs:  [{ lines, error }] (project)
//   { id, ok: false, error }

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/";

importScripts(PYODIDE_BASE + "pyodide.js");

const pyodideReady = loadPyodide({ indexURL: PYODIDE_BASE }).then((pyodide) => {
  self.postMessage({ kind: "ready" });
  return pyodide;
});

async function runOnce(pyodide, code, stdinText, extraGlobals) {
  const lines = [];
  pyodide.setStdout({ batched: (text) => lines.push({ stream: "stdout", text }) });
  pyodide.setStderr({ batched: (text) => lines.push({ stream: "stderr", text }) });

  // Each run gets its own fresh stdin. Handing the text to Pyodide's stdin
  // device isn't enough: Python buffers what it reads, so lines one run left
  // unread (a program that stopped early, or crashed) leaked into the next —
  // a test case would read the previous case's input and fail. A StringIO per
  // run holds exactly this run's input, and input() past its end raises
  // EOFError, as real Python does.
  pyodide.setStdin({ stdin: () => null });
  const sys = pyodide.pyimport("sys");
  const io = pyodide.pyimport("io");
  sys.stdin = io.StringIO(stdinText || "");
  sys.destroy();
  io.destroy();

  const globals = pyodide.runPython("dict()"); // fresh namespace per run
  if (extraGlobals) for (const [key, value] of Object.entries(extraGlobals)) globals.set(key, value);
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

// A project's files live here while it runs. Rebuilt from scratch every run,
// so a file the student deleted or renamed can't linger and still import.
const PROJECT_DIR = "/home/pyodide/project";

// Only plain relative names: never absolute, never "..", so a file can't be
// written outside the project folder. The app validates the same rule.
function isSafeProjectPath(path) {
  return /^(?!\/)(?!.*\.\.)[A-Za-z0-9_\-./]+$/.test(path);
}

function writeProject(pyodide, files) {
  // Clear the old files and forget modules imported from them: Python caches
  // imports, so without this an edited data.py would keep its old contents.
  pyodide.runPython(`
import sys, shutil, os
d = ${JSON.stringify(PROJECT_DIR)}
for name, mod in list(sys.modules.items()):
    f = getattr(mod, "__file__", None) or ""
    if f.startswith(d + "/"):
        del sys.modules[name]
shutil.rmtree(d, ignore_errors=True)
os.makedirs(d, exist_ok=True)
if d not in sys.path:
    sys.path.insert(0, d)
os.chdir(d)
`);
  for (const [path, text] of Object.entries(files)) {
    if (!isSafeProjectPath(path)) throw new Error("Unsafe file name: " + path);
    const full = PROJECT_DIR + "/" + path;
    const dir = full.slice(0, full.lastIndexOf("/"));
    pyodide.FS.mkdirTree(dir);
    pyodide.FS.writeFile(full, text);
  }
}

self.onmessage = async (event) => {
  const { id, kind, code, testCases, files, entry, inputs } = event.data;
  try {
    const pyodide = await pyodideReady;
    if (kind === "project") {
      // Every file's imports, not just the entry's, so data.py can use packages too.
      await pyodide.loadPackagesFromImports(Object.values(files).join("\n"));
      const entryCode = files[entry];
      if (typeof entryCode !== "string") throw new Error("Missing " + entry);
      const runs = [];
      for (const input of inputs) {
        // Rewritten per run: a previous run may have changed or created files.
        writeProject(pyodide, files);
        const { lines, error } = await runOnce(pyodide, entryCode, input, {
          __name__: "__main__",
          __file__: PROJECT_DIR + "/" + entry,
        });
        runs.push({ lines, error });
      }
      self.postMessage({ id, ok: true, runs });
      return;
    }
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
