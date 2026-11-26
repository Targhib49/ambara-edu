// One set of control styles, so a button or field looks and behaves the same
// on every page instead of each file re-declaring its own. Built on the design
// tokens in globals.css; the components in Button.tsx, Field.tsx, Card.tsx,
// Badge.tsx and Alert.tsx wrap these strings, and new code should prefer them.

const btnBase =
  "inline-flex items-center justify-center transition-colors active:translate-y-px whitespace-nowrap rounded-control font-medium disabled:cursor-not-allowed";

export const btnPrimary = `${btnBase} gap-1.5 bg-brand px-3.5 py-2 text-sm text-white shadow-sm hover:bg-brand-hover disabled:opacity-50`;

export const btnSecondary = `${btnBase} gap-1.5 border border-line-strong bg-surface px-3.5 py-2 text-sm text-ink-soft shadow-sm hover:bg-surface-muted disabled:opacity-50`;

export const btnDanger = `${btnBase} gap-1.5 border border-danger-line bg-surface px-3.5 py-2 text-sm text-danger hover:bg-danger-wash disabled:opacity-50`;

export const btnSmall = `${btnBase} gap-1 border border-line-strong bg-surface px-2.5 py-1 text-xs text-ink-soft hover:bg-surface-muted disabled:opacity-40`;

/** A field with no width of its own — for controls sitting side by side in a filter bar. */
export const controlCls =
  "rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:bg-surface-muted";

/** A full-width form field. */
export const inputCls = `w-full ${controlCls}`;

export const labelCls = "mb-1 block text-xs font-medium text-ink-muted";

export const hintCls = "mt-1 text-xs text-ink-subtle";

export const cardCls = "rounded-card border border-line bg-surface shadow-sm";
