import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { PlaygroundGallery } from "@/components/playground/PlaygroundGallery";

export default async function TutorPlaygroundPage() {
  await requireTutor();
  if (!(await isEnabled("playground"))) notFound();

  return (
    <PlaygroundGallery
      basePath="/tutor/playground"
      homeHref="/tutor"
      intro="The same interactive pieces your students can explore — handy for trying one out before you embed it in a lesson."
    />
  );
}
