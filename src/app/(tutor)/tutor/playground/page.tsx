import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { CourseVizList, GamesGrid, ToolsGrid, VizLibraryGrid } from "@/components/playground/PlaygroundCards";
import { courseVisualizations } from "@/lib/playground/courseVisualizations";
import { GAMES } from "@/lib/games/registry";
import { VIZ_LIBRARY } from "@/lib/playground";

const TABS = ["games", "courses", "library", "tools"] as const;
type TabKey = (typeof TABS)[number];

export default async function TutorPlaygroundPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireTutor();
  if (!(await isEnabled("playground"))) notFound();
  const { tab: requested } = await searchParams;
  const tab: TabKey = (TABS as readonly string[]).includes(requested ?? "") ? (requested as TabKey) : "games";

  const courses = await courseVisualizations();
  const usage: Record<string, number> = {};
  for (const course of courses) for (const ch of course.chapters) for (const item of ch.items) usage[item.component] = (usage[item.component] ?? 0) + 1;
  const animationCount = courses.reduce((n, c) => n + c.count, 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: "Home", href: "/tutor" }, { label: "Playground" }]}
        title="Playground"
        meta="Games any student can play, and the animations each course uses. Add either in code."
      />
      <PageTabs
        active={tab}
        tabs={[
          { key: "games", label: "Games", href: "/tutor/playground", count: GAMES.length },
          { key: "courses", label: "Course animations", href: "/tutor/playground?tab=courses", count: animationCount },
          { key: "library", label: "All visualizations", href: "/tutor/playground?tab=library", count: VIZ_LIBRARY.length },
          { key: "tools", label: "Tools", href: "/tutor/playground?tab=tools" },
        ]}
      />

      {tab === "games" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">Open to every signed-in student, whatever courses they&rsquo;re on.</p>
          <GamesGrid basePath="/tutor/playground" />
        </div>
      )}
      {tab === "courses" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            An animation appears under a course as soon as one of its lessons uses it, with that lesson&rsquo;s settings. Students see
            the ones from courses they&rsquo;re enrolled in.
          </p>
          <CourseVizList courses={courses} basePath="/tutor/playground" emptyText="No lesson uses an animation yet." />
        </div>
      )}
      {tab === "library" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">Every visualization available to add to a lesson, previewed with its default settings.</p>
          <VizLibraryGrid basePath="/tutor/playground" usage={usage} />
        </div>
      )}
      {tab === "tools" && <ToolsGrid basePath="/tutor/playground" />}
    </div>
  );
}
