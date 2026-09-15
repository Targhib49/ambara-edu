import { db } from "@/lib/db";

export type PlacementCourse = {
  id: string;
  title: string;
  archived: boolean;
  chapters: { id: string; title: string; lessons: { id: string; title: string }[] }[];
};

/** Every course's syllabus outline, for choosing where a quiz sits. */
export async function placementTree(): Promise<PlacementCourse[]> {
  const courses = await db.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      chapters: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
      },
    },
  });
  return courses.map((c) => ({ id: c.id, title: c.title, archived: c.status === "ARCHIVED", chapters: c.chapters }));
}
