"use client";

import { useState } from "react";
import { regenerateCalendarToken } from "@/lib/actions/booking";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * `url` is built on the server from the request's own host, so there is no env
 * var to keep in sync and — unlike reading window.location during render —
 * the server and client markup agree.
 */
export function CalendarFeedCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="font-medium text-zinc-900">Calendar subscription</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Add this to Google, Apple or Outlook Calendar and your sessions appear there, updating
        themselves as things change. Treat it like a password — anyone with the link can read your
        schedule.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600">
          {url}
        </code>
        <button
          onClick={() => {
            void navigator.clipboard.writeText(url).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              },
              () => setCopied(false)
            );
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <form action={regenerateCalendarToken}>
          <SubmitButton
            pendingLabel="Replacing…"
            className="rounded-md px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 hover:underline disabled:opacity-50"
          >
            Replace link
          </SubmitButton>
        </form>
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        Replacing the link stops any calendar already subscribed to the old one.
      </p>
    </section>
  );
}
