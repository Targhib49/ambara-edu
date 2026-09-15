import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { findPlaygroundItem } from "@/lib/playground";
import { PlaygroundItemView } from "@/components/playground/PlaygroundItemView";

/** The Python tool, or a library visualization previewed with its default settings. */
export default async function TutorPlaygroundItemPage({ params }: { params: Promise<{ item: string }> }) {
  await requireTutor();
  if (!(await isEnabled("playground"))) notFound();

  const { item: slug } = await params;
  const item = findPlaygroundItem(slug);
  if (!item) notFound();

  return <PlaygroundItemView item={item} basePath="/tutor/playground" homeHref="/tutor" />;
}
