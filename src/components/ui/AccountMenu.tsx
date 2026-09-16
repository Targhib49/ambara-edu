"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ChevronDownIcon, SignOutIcon, UserIcon } from "@/components/ui/icons";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { useT } from "@/lib/i18n/client";

/**
 * The account chip in the top bar: initials, name, and a menu holding the
 * things you only need occasionally — who you are signed in as, your profile,
 * and the way out. Both shells use it, so the two roles stay identical apart
 * from where "Profile" points.
 */
export function AccountMenu({
  name,
  email,
  subtitle,
  profileHref,
}: {
  name: string;
  email: string;
  /** Role or group, the line that says which kind of account this is. */
  subtitle: string;
  profileHref: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on a click anywhere else, or on Escape — and hand focus back to the
  // chip when Escape closes it, so the keyboard isn't left in limbo.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("account.menuLabel")}
        className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 transition-colors ${
          open ? "border-zinc-300 bg-zinc-50" : "border-transparent hover:border-zinc-200 hover:bg-zinc-50"
        }`}
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${badgeColorForKey(name)}`}
        >
          {initialsFor(name)}
        </span>
        <span className="hidden max-w-[11rem] truncate text-sm font-medium text-zinc-800 sm:block">{name}</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg shadow-zinc-900/5"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-zinc-900">{name}</p>
            <p className="truncate text-xs text-zinc-500">{email}</p>
            <p className="mt-1 truncate text-xs text-zinc-400">{subtitle}</p>
          </div>
          <div className="my-1 border-t border-zinc-100" />
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <UserIcon className="h-4 w-4 shrink-0 text-zinc-400" />
            {t("nav.profile")}
          </Link>
          <form action={signOut}>
            <SubmitButton
              pendingLabel={t("nav.signingOut")}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <SignOutIcon className="h-4 w-4 shrink-0" />
              {t("nav.signOut")}
            </SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
