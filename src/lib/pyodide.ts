"use client";

// Lazy singleton loader for the Pyodide runtime (Python-in-WASM).
//
// Loaded from the official CDN via a script tag rather than the npm package:
// the runtime is ~10 MB of WASM + stdlib assets that must come from a URL at
// runtime anyway, and the npm package's node-oriented entry points fight the
// bundler. The script is only injected on the first run request, so lessons
// without a scratchpad (or readers who never press Run) pay nothing.

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** The minimal slice of the Pyodide API this app uses. */
export interface Pyodide {
  runPythonAsync(code: string, options?: { globals?: unknown }): Promise<unknown>;
  loadPackagesFromImports(code: string): Promise<unknown>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
  setStdin(options: { stdin: () => string | null }): void;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<Pyodide>;
  }
}

let pyodidePromise: Promise<Pyodide> | null = null;

function injectScript(): Promise<void> {
  if (window.loadPyodide) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PYODIDE_BASE}pyodide.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not download the Python runtime — check your connection."));
    document.head.appendChild(script);
  });
}

export function getPyodide(): Promise<Pyodide> {
  pyodidePromise ??= injectScript()
    .then(() => window.loadPyodide!({ indexURL: PYODIDE_BASE }))
    .catch((err) => {
      pyodidePromise = null; // allow retry after a failed download
      throw err;
    });
  return pyodidePromise;
}
