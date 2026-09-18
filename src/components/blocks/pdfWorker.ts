// The pdf.js worker, as a module of our own so the bundler can resolve it from
// a relative URL. `new Worker(new URL("pdfjs-dist/…", import.meta.url))` with a
// bare package specifier 404s under Turbopack; a relative path to this file
// works, and this file pulls the real worker in.
import "pdfjs-dist/build/pdf.worker.min.mjs";
