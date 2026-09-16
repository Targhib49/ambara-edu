import { APP_TZ } from "@/lib/scheduling";
import { getLanguage, getT } from "@/lib/i18n/server";

const GREETINGS = [
  [11, "dash.greeting.morning"],
  [15, "dash.greeting.midday"],
  [19, "dash.greeting.afternoon"],
  [24, "dash.greeting.evening"],
] as const;

/**
 * Greets by the student's clock. Both the hour and the date are formatted in
 * the app's timezone rather than the server's (Vercel runs in UTC, which would
 * say "Selamat pagi" at 7 PM WIB), so this renders on the server with no
 * hydration dance.
 */
export async function DashboardHero({ name, chips }: { name: string; chips: string[] }) {
  const t = await getT();
  const language = await getLanguage();
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: APP_TZ }).format(now));
  const greeting = t(GREETINGS.find(([until]) => hour < until)?.[1] ?? "dash.greeting.evening");
  const dateLabel = new Intl.DateTimeFormat(language === "ID" ? "id-ID" : "en-GB", {
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
