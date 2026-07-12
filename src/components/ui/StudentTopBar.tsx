import { signOut } from "@/lib/actions/auth";

// Mirrors TutorTopBar — kept as a separate component (rather than shared)
// since the two roles' top bars are already this simple; a shared version
// would just be an extra indirection for two identical lines.
export function StudentTopBar({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-4 border-b border-zinc-200 bg-white px-6">
      <span className="text-sm text-zinc-500">{userName}</span>
      <form action={signOut}>
        <button className="text-sm text-zinc-600 underline-offset-2 hover:underline">Sign out</button>
      </form>
    </header>
  );
}
