import { db } from "@/lib/db";
import { VIZ_LABELS, visualizationDataSchema, type VisualizationData, type VizComponentName } from "@/lib/viz/schemas";

/**
 * Visualizations belong to courses through their lessons: an animation used in
 * a lesson is listed under that lesson's course and chapter, with the settings
 * the lesson gave it. Nothing is attached separately, so the playground can
 * never drift from what the courses actually contain.
 */

export type CourseVizItem = {
  blockId: string;
  component: VizComponentName;
  title: string;
  lessonId: string;
  lessonTitle: string;
};
export type CourseVizChapter = { id: string; title: string; items: CourseVizItem[] };
export type CourseVizGroup = { id: string; title: string; count: number; chapters: CourseVizChapter[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A student only sees published lessons in published courses they're enrolled in. */
function lessonScope(studentId?: string) {
  return studentId
    ? {
        lesson: {
          status: "PUBLISHED" as const,
          chapter: { course: { status: "PUBLISHED" as const, enrollments: { some: { studentId } } } },
        },
      }
    : {};
}

export async function courseVisualizations({ studentId }: { studentId?: string } = {}): Promise<CourseVizGroup[]> {
  const blocks = await db.contentBlock.findMany({
    where: { type: "VISUALIZATION", ...lessonScope(studentId) },
    select: {
      id: true,
      order: true,
      data: true,
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
          chapter: { select: { id: true, title: true, order: true, course: { select: { id: true, title: true } } } },
        },
      },
    },
  });

  const sorted = blocks
    .map((b) => ({ block: b, parsed: visualizationDataSchema.safeParse(b.data) }))
    .filter((x) => x.parsed.success)
    .sort(
      (x, y) =>
        x.block.lesson.chapter.course.title.localeCompare(y.block.lesson.chapter.course.title) ||
        x.block.lesson.chapter.order - y.block.lesson.chapter.order ||
        x.block.lesson.order - y.block.lesson.order ||
        x.block.order - y.block.order
    );

  const courses = new Map<string, CourseVizGroup>();
  for (const { block, parsed } of sorted) {
    if (!parsed.success) continue;
    const { chapter } = block.lesson;
    const course = courses.get(chapter.course.id) ?? { id: chapter.course.id, title: chapter.course.title, count: 0, chapters: [] };
    courses.set(course.id, course);
    let ch = course.chapters.find((c) => c.id === chapter.id);
    if (!ch) {
      ch = { id: chapter.id, title: chapter.title, items: [] };
      course.chapters.push(ch);
    }
    ch.items.push({
      blockId: block.id,
      component: parsed.data.component,
      title: VIZ_LABELS[parsed.data.component],
      lessonId: block.lesson.id,
      lessonTitle: block.lesson.title,
    });
    course.count += 1;
  }
  return [...courses.values()];
}

export type CourseVizDetail = {
  data: VisualizationData;
  title: string;
  course: { id: string; title: string };
  chapterTitle: string;
  lesson: { id: string; title: string };
};

/** One visualization as its lesson configured it, or null if it doesn't exist or isn't the student's to see. */
export async function findCourseVisualization(blockId: string, { studentId }: { studentId?: string } = {}): Promise<CourseVizDetail | null> {
  if (!UUID.test(blockId)) return null;
  const block = await db.contentBlock.findFirst({
    where: { id: blockId, type: "VISUALIZATION", ...lessonScope(studentId) },
    select: {
      data: true,
      lesson: { select: { id: true, title: true, chapter: { select: { title: true, course: { select: { id: true, title: true } } } } } },
    },
  });
  if (!block) return null;
  const parsed = visualizationDataSchema.safeParse(block.data);
  if (!parsed.success) return null;
  return {
    data: parsed.data,
    title: VIZ_LABELS[parsed.data.component],
    course: block.lesson.chapter.course,
    chapterTitle: block.lesson.chapter.title,
    lesson: { id: block.lesson.id, title: block.lesson.title },
  };
}
