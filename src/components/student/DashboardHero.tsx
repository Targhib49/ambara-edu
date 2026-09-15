import { APP_TZ } from "@/lib/scheduling";

const GREETINGS: [hour: number, text: string][] = [
  [11, "Selamat pagi"],
  [15, "Selamat siang"],
  [19, "Selamat sore"],
  [24, "Selamat malam"],
];

/**
 * Greets by the student's clock. Both the hour and the date are formatted in
 * the app's timezone rather than the server's (Vercel runs in UTC, which would
 * say "Selamat pagi" at 7 PM WIB), so this renders on the server with no
 * hydration dance.
 */
export function DashboardHero({ name, chips }: { name: string; chips: string[] }) {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: APP_TZ }).format(now));
  const greeting = GREETINGS.find(([until]) => hour < until)?.[1] ?? "Selamat malam";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: APP_TZ,
  }).format(now);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-950 to-blue-800 p-6 text-white">
      <p className="text-sm text-blue-200">{dateLabel}</p>
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
