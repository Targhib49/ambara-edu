import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export function StudentTopNav({
  links,
  userName,
}: {
  links: { href: string; label: string }[];
  userName: string;
}) {
  return (
    <header className="sticky top-0 z-20 bg-blue-950">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/tracks" className="text-sm font-bold tracking-tight text-white">
          Tutor LMS
        </Link>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm font-medium uppercase tracking-wide text-blue-200 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-blue-200">{userName}</span>
          <form action={signOut}>
            <button className="text-sm text-blue-200 underline-offset-2 hover:text-white hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
