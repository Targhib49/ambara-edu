import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export function TutorTopBar({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-4 border-b border-zinc-200 bg-white px-6">
      <Link
        href="/tutor/profile"
        className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
      >
        {userName}
      </Link>
      <form action={signOut}>
        <button className="text-sm text-zinc-600 underline-offset-2 hover:underline">Sign out</button>
      </form>
    </header>
  );
}
