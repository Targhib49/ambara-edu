"use client";

import { AccountMenu } from "@/components/ui/AccountMenu";
import { mobileNav } from "@/lib/ui/mobileNavStore";
import { MenuIcon } from "@/components/ui/icons";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { StudentGroup } from "@/generated/prisma/enums";

const GROUP_KEYS = {
  JUNIOR_HIGH: "group.JUNIOR_HIGH",
  UNDERGRAD: "group.UNDERGRAD",
  GRAD: "group.GRAD",
} as const satisfies Record<StudentGroup, MessageKey>;

// Mirrors TutorTopBar; the account menu itself is shared, so the only
// differences left are where "Profile" points and what the subtitle says.
export function StudentTopBar({
  userName,
  email,
  studentGroup,
}: {
  userName: string;
  email: string;
  studentGroup: StudentGroup | null;
}) {
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
        <AccountMenu
          name={userName}
          email={email}
          subtitle={studentGroup ? t(GROUP_KEYS[studentGroup]) : t("account.roleStudent")}
          profileHref="/profile"
        />
      </div>
    </header>
  );
}
