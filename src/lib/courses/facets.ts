import { db } from "@/lib/db";
import type { FacetSuggestions } from "@/components/courses/NewCourseForm";

/** Distinct subject / curriculum / level values already in use, for suggestions and filters. */
export async function facetSuggestions(): Promise<FacetSuggestions> {
  const courses = await db.course.findMany({ select: { subject: true, curriculum: true, level: true } });
  const distinct = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b));
  return {
    subjects: distinct(courses.map((c) => c.subject)),
    curricula: distinct(courses.map((c) => c.curriculum)),
    levels: distinct(courses.map((c) => c.level)),
  };
}
