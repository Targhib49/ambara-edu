"use client";

import { AccountMenu } from "@/components/ui/AccountMenu";
import { mobileNav } from "@/lib/ui/mobileNavStore";
import { MenuIcon } from "@/components/ui/icons";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useT } from "@/lib/i18n/client";

export function TutorTopBar({ userName, email }: { userName: string; email: string }) {
  const t = useT();
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 sm:px-6">
      <button
        onClick={() => mobileNav.setOpen(true)}
        aria-label={t("nav.openMenu")}
        className="text-zinc-500 hover:text-zinc-800 lg:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      {/* ml-auto, not justify-between: the hamburger is hidden from lg up, and
          with one child left justify-between parks it against the left edge. */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <LanguageToggle />
        <AccountMenu name={userName} email={email} subtitle={t("account.roleTutor")} profileHref="/tutor/profile" />
      </div>
    </header>
  );
}
