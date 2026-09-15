/** A small "animation" mark for visualization rows. */
export function CodeBracketGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-none stroke-current ${className ?? ""}`} strokeWidth={1.8} aria-hidden>
      <path d="M4 18V6m0 12h16M8 14l3-3 3 2 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
