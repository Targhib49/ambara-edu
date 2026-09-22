// Minimal inline line-icon set for the app shell nav. Kept as one small
// module (no icon library dependency) — each icon is a plain <svg>, sized by
// the caller via className.
type IconProps = { className?: string };

const base = "stroke-current fill-none";

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 11h7M8.5 15h7" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <circle cx="9" cy="8" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 6.1M17.5 20c0-2.7-1.6-4.7-3.8-5.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={2}>
      <path d="M15 5.5 8.5 12l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BeakerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M9.5 3v6.2L4.7 17.4A2 2 0 0 0 6.4 20.5h11.2a2 2 0 0 0 1.7-3.1L14.5 9.2V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 3h7" strokeLinecap="round" />
      <path d="M7.2 14h9.6" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReceiptIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 3.5v17l2.5-1.5 2.5 1.5 2-1.5 2 1.5 2.5-1.5 2.5 1.5v-17l-2.5 1.5-2.5-1.5-2 1.5-2-1.5L7.5 5 5 3.5Z" />
      <path d="M9 9.5h6M9 13.5h6" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={2}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} strokeWidth={1.8}>
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19.5a7.5 7.5 0 0115 0" strokeLinecap="round" />
    </svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className} aria-hidden>
      <path d="M15 4.5h3a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-3" strokeLinecap="round" />
      <path d="M10 8.5L6.5 12l3.5 3.5M6.5 12H15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
