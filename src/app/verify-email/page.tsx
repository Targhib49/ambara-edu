import Link from "next/link";
import { db } from "@/lib/db";
import { confirmEmail } from "@/lib/actions/verification";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, cardCls } from "@/components/ui/styles";

type State = "confirmed" | "expired" | "invalid";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; state?: string }>;
}) {
  const { token, state } = await searchParams;
  const settled = (["confirmed", "expired", "invalid"] as const).find((s) => s === state) ?? null;

  // Only looked up, never spent, until the student presses the button.
  const record = !settled && token ? await db.emailVerificationToken.findUnique({ where: { token } }) : null;
  const status: State | null = settled ?? (!token || !record ? "invalid" : record.expiresAt < new Date() ? "expired" : null);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className={`${cardCls} w-full max-w-sm space-y-4 p-8 text-center`}>
        {status === null && token && (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">Confirm your email</h1>
            <p className="text-sm text-zinc-600">
              One tap and we know this address reaches you. It doesn&rsquo;t change how you sign in.
            </p>
            <form action={confirmEmail.bind(null, token)}>
              <SubmitButton pendingLabel="Confirming…" className={btnPrimary}>
                Confirm my email
              </SubmitButton>
            </form>
          </>
        )}
        {status === "confirmed" && (
          <>
            <h1 className="text-lg font-semibold text-green-700">Email confirmed</h1>
            <p className="text-sm text-zinc-600">Thanks — nothing else to do.</p>
          </>
        )}
        {status === "expired" && (
          <>
            <h1 className="text-lg font-semibold text-amber-700">This link has expired</h1>
            <p className="text-sm text-zinc-600">Ask your tutor to send a new one, or request it from your profile.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <h1 className="text-lg font-semibold text-red-600">This link isn&rsquo;t valid</h1>
            <p className="text-sm text-zinc-600">It may already have been used. You can request a new one from your profile.</p>
          </>
        )}
        <Link href="/login" className="inline-block text-sm text-blue-700 hover:underline">
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
