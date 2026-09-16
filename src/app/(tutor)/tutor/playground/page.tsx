import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { CourseVizList, GamesGrid, ToolsGrid, VizLibraryGrid } from "@/components/playground/PlaygroundCards";
import { courseVisualizations } from "@/lib/playground/courseVisualizations";
import { GAMES } from "@/lib/games/registry";
import { VIZ_LIBRARY } from "@/lib/playground";
import { getT } from "@/lib/i18n/server";

const TABS = ["games", "courses", "library", "tools"] as const;
type TabKey = (typeof TABS)[number];

export default async function TutorPlaygroundPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireTutor();
  const t = await getT();
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
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("playground.title") }]}
        title={t("playground.title")}
        meta={t("playground.tutorMeta")}
      />
      <PageTabs
        active={tab}
        tabs={[
          { key: "games", label: t("playground.games"), href: "/tutor/playground", count: GAMES.length },
          { key: "courses", label: t("playground.courseAnimations"), href: "/tutor/playground?tab=courses", count: animationCount },
          { key: "library", label: t("playground.allVisualizations"), href: "/tutor/playground?tab=library", count: VIZ_LIBRARY.length },
          { key: "tools", label: t("playground.tools"), href: "/tutor/playground?tab=tools" },
        ]}
      />

      {tab === "games" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{t("playground.gamesHint")}</p>
          <GamesGrid basePath="/tutor/playground" />
        </div>
      )}
      {tab === "courses" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{t("playground.coursesHint")}</p>
          <CourseVizList courses={courses} basePath="/tutor/playground" emptyText={t("playground.noAnimationsYet")} />
        </div>
      )}
      {tab === "library" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{t("playground.libraryHint")}</p>
          <VizLibraryGrid basePath="/tutor/playground" usage={usage} />
        </div>
      )}
      {tab === "tools" && <ToolsGrid basePath="/tutor/playground" />}
    </div>
  );
}
