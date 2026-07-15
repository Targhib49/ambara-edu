"use client";

import { useEffect, useState } from "react";

// Client component: the greeting must follow the student's clock — the
// server (Vercel) runs in UTC and would say "Good morning" at 7 PM WIB.
export function DashboardHero({
  name,
  chips,
}: {
  name: string;
  chips: string[];
}) {
  // Rendered after mount to avoid a server/client hydration mismatch on time.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const hour = now?.getHours() ?? 12;
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
  const dateLabel = now
    ? now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-950 to-blue-800 p-6 text-white">
      <p className="min-h-4 text-sm text-blue-200">{dateLabel}</p>
      <h1 className="mt-1 text-2xl font-semibold">
        {greeting}, {name.split(" ")[0]}! 👋
      </h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip} className="rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
