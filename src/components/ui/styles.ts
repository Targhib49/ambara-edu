// One set of control styles for the tutor screens, so a button or field looks
// and behaves the same on every page instead of each file re-declaring its own.

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSmall =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40";

/** A field with no width of its own — for controls sitting side by side in a filter bar. */
export const controlCls =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-zinc-50";

/** A full-width form field. */
export const inputCls = `w-full ${controlCls}`;

export const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

export const hintCls = "mt-1 text-xs text-zinc-500";

export const cardCls = "rounded-xl border border-zinc-200 bg-white shadow-sm";
