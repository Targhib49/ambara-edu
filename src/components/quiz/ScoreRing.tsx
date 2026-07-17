/** Small circular score indicator — green ≥80%, blue ≥50%, amber below. Pure SVG, server-safe. */
export function ScoreRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#2563eb" : "#d97706";
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`${Math.round(pct)}% score`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.28}
        fontWeight={600}
        fill="#27272a"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
