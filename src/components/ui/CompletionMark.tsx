/**
 * Filled tick when done, hollow ring when not. No hooks, so it renders in both
 * server and client components — the course outline needs it in each.
 */
export function CompletionMark({ done, className = "" }: { done: boolean; className?: string }) {
  if (!done) {
    return (
      <span
        className={`inline-block h-4 w-4 shrink-0 rounded-full border border-zinc-300 ${className}`}
        aria-hidden
      />
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 shrink-0 text-green-600 ${className}`}
      role="img"
      aria-label="Completed"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
