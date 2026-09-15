import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { PlaygroundGallery } from "@/components/playground/PlaygroundGallery";

export default async function PlaygroundPage() {
  await requireStudent();
  // Off means the route doesn't exist, not that it renders empty — otherwise a
  // guessed URL would still show the feature.
  if (!(await isEnabled("playground"))) notFound();

  return (
    <PlaygroundGallery
      basePath="/playground"
      homeHref="/dashboard"
      intro="Every interactive piece from the courses, free to poke at on its own. Nothing here is marked or saved — change things, break things, start over."
    />
  );
}
