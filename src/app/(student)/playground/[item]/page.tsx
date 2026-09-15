import { notFound, redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { PYTHON_ITEM } from "@/lib/playground";
import { PlaygroundItemView } from "@/components/playground/PlaygroundItemView";

export default async function PlaygroundItemPage({ params }: { params: Promise<{ item: string }> }) {
  await requireStudent();
  if (!(await isEnabled("playground"))) notFound();

  const { item: slug } = await params;
  // Animations now open from the course they belong to; older links to a bare
  // animation land on the playground instead of a dead end.
  if (slug !== PYTHON_ITEM.slug) redirect("/playground");

  return <PlaygroundItemView item={PYTHON_ITEM} basePath="/playground" homeHref="/dashboard" />;
}
