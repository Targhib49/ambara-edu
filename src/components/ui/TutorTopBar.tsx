"use client";

import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { mobileNav } from "@/lib/ui/mobileNavStore";
import { MenuIcon } from "@/components/ui/icons";

export function TutorTopBar({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 sm:px-6">
      <button
        onClick={() => mobileNav.setOpen(true)}
        aria-label="Open menu"
        className="text-zinc-500 hover:text-zinc-800 lg:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-4">
        <Link
          href="/tutor/profile"
          className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
        >
          {userName}
        </Link>
        <form action={signOut}>
          <button className="text-sm text-zinc-600 underline-offset-2 hover:underline">Sign out</button>
        </form>
      </div>
    </header>
  );
}
