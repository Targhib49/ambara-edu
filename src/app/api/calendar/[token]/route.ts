import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Personal calendar subscription. The token in the URL is the only credential —
 * calendar apps can't send headers — so it is long, random, and revocable by
 * regenerating it from the sessions page. Anyone holding the link can read this
 * person's schedule, which is why it is never guessable and never logged.
 *
 * One-way: the app publishes, the calendar reads. Nothing here writes.
 */
function icsEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function icsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 caps lines at 75 octets; continuations start with a single space. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const feed = await db.calendarFeedToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, role: true } } },
  });
  if (!feed) return new NextResponse("Not found", { status: 404 });

  const sessions = await db.session.findMany({
    where: {
      status: { not: "CANCELLED" },
      ...(feed.user.role === "TUTOR" ? { tutorId: feed.user.id } : { studentId: feed.user.id }),
    },
    include: { student: { select: { name: true } }, tutor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AmbaraEdu//Sessions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:AmbaraEdu sessions",
    // Hint for how often subscribers should re-poll; most clients ignore it.
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
  ];

  for (const session of sessions) {
    const other = feed.user.role === "TUTOR" ? session.student.name : session.tutor.name;
    const end = new Date(session.startTime.getTime() + session.durationMinutes * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${session.id}@ambaraedu`,
      `DTSTAMP:${icsStamp(session.updatedAt)}`,
      `DTSTART:${icsStamp(session.startTime)}`,
      `DTEND:${icsStamp(end)}`,
      fold(`SUMMARY:${icsEscape(`AmbaraEdu session with ${other}`)}`),
      ...(session.notes ? [fold(`DESCRIPTION:${icsEscape(session.notes)}`)] : []),
      `STATUS:${session.status === "CONFIRMED" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
