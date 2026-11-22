import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { boardSessionFor } from "@/lib/board/access";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BoardPdfOption = {
  blockId: string;
  fileName: string;
  lesson: string;
  chapter: string;
  course: string;
  /** This session's subject: listed first. */
  thisCourse: boolean;
};

/** Every lesson PDF, for the tutor's "Insert PDF" picker on the board. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!UUID.test(sessionId)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "signed out" }, { status: 401 });
  const session = await boardSessionFor(sessionId, user.id);
  if (!session || session.tutorId !== user.id) return NextResponse.json({ error: "not found" }, { status: 404 });

  const blocks = await db.contentBlock.findMany({
    where: { type: "FILE_ATTACHMENT", data: { path: ["mimeType"], equals: "application/pdf" } },
    select: {
      id: true,
      data: true,
      order: true,
      lesson: {
        select: {
          title: true,
          order: true,
          chapter: { select: { title: true, order: true, course: { select: { id: true, title: true } } } },
        },
      },
    },
  });

  const options: (BoardPdfOption & { sort: [number, string, number, number, number] })[] = blocks.map((b) => {
    const course = b.lesson.chapter.course;
    const thisCourse = course.id === session.courseId;
    return {
      blockId: b.id,
      fileName: String((b.data as { fileName?: unknown }).fileName ?? "PDF"),
      lesson: b.lesson.title,
      chapter: b.lesson.chapter.title,
      course: course.title,
      thisCourse,
      sort: [thisCourse ? 0 : 1, course.title, b.lesson.chapter.order, b.lesson.order, b.order],
    };
  });
  options.sort((a, b) => {
    for (let i = 0; i < a.sort.length; i++) {
      const x = a.sort[i];
      const y = b.sort[i];
      if (x === y) continue;
      return typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
    }
    return 0;
  });
  return NextResponse.json({ options: options.map((o) => ({ blockId: o.blockId, fileName: o.fileName, lesson: o.lesson, chapter: o.chapter, course: o.course, thisCourse: o.thisCourse })) });
}
