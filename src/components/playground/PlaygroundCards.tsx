import Link from "next/link";
import { GAMES } from "@/lib/games/registry";
import { PYTHON_ITEM, VIZ_LIBRARY } from "@/lib/playground";
import type { CourseVizGroup } from "@/lib/playground/courseVisualizations";
import { CodeBracketGlyph } from "@/components/playground/glyphs";
import { cardCls } from "@/components/ui/styles";
import { getT } from "@/lib/i18n/server";

/** Game cards: live games open; coming-soon ones are shown but can't be clicked. */
export async function GamesGrid({ basePath }: { basePath: string }) {
  const t = await getT();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {GAMES.map((game) => {
        const body = (
          <>
            <div className={`relative flex h-28 items-end bg-gradient-to-br p-4 ${game.accent} ${game.status === "coming_soon" ? "opacity-60 grayscale-[35%]" : ""}`}>
              <span className="text-xl font-bold text-white drop-shadow-sm">{game.title}</span>
              {game.status === "coming_soon" && (
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-800">{t("game.comingSoon")}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="text-sm text-zinc-600">{t(game.blurbKey)}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                {game.tagKeys.map((key) => (
                  <span key={key} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600">
                    {t(key)}
                  </span>
                ))}
                {game.status === "live" && <span className="ml-auto text-xs font-semibold text-blue-700">{t("game.playCta")}</span>}
              </div>
            </div>
          </>
        );
        return (
          <li key={game.slug}>
            {game.status === "live" ? (
              <Link
                href={`${basePath}/games/${game.slug}`}
                className={`${cardCls} group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md`}
              >
                {body}
              </Link>
            ) : (
              <div aria-disabled="true" className={`${cardCls} flex h-full cursor-default flex-col overflow-hidden`}>
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A course's animations, grouped by chapter, each opening as its lesson set it up. */
export async function CourseVizList({
  courses,
  basePath,
  emptyText,
}: {
  courses: CourseVizGroup[];
  basePath: string;
  emptyText: string;
}) {
  const t = await getT();
  if (courses.length === 0) {
    return <p className={`${cardCls} px-5 py-8 text-center text-sm text-zinc-500`}>{emptyText}</p>;
  }
  return (
    <div className="space-y-5">
      {courses.map((course) => (
        <section key={course.id} className={`${cardCls} overflow-hidden`}>
          <header className="flex items-baseline justify-between gap-3 border-b border-zinc-100 bg-zinc-50/60 px-5 py-3">
            <h3 className="font-semibold text-zinc-900">{course.title}</h3>
            <span className="text-xs text-zinc-500">
              {t(course.count === 1 ? "playgroundCards.animation" : "playgroundCards.animations", { n: course.count })}
            </span>
          </header>
          <div className="divide-y divide-zinc-100">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="px-5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{chapter.title}</p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {chapter.items.map((item) => (
                    <li key={item.blockId}>
                      <Link
                        href={`${basePath}/viz/${item.blockId}`}
                        className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 transition hover:border-blue-300 hover:bg-blue-50/40"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-violet-100 text-violet-700">
                          <CodeBracketGlyph className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-zinc-900 group-hover:text-blue-700">{item.title}</span>
                          <span className="block truncate text-xs text-zinc-500">{t("playgroundCards.inLesson", { title: item.lessonTitle })}</span>
                        </span>
                        <span className="text-xs font-medium text-blue-700">{t("playgroundCards.open")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export async function ToolsGrid({ basePath }: { basePath: string }) {
  const t = await getT();
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      <li>
        <Link
          href={`${basePath}/${PYTHON_ITEM.slug}`}
          className={`${cardCls} group flex h-full items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-900 font-mono text-sm font-bold text-emerald-400">py</span>
          <span className="min-w-0">
            <span className="block font-medium text-zinc-900 group-hover:text-blue-700">{t(PYTHON_ITEM.titleKey)}</span>
            <span className="mt-0.5 block text-sm text-zinc-500">{t(PYTHON_ITEM.blurbKey)}</span>
          </span>
        </Link>
      </li>
    </ul>
  );
}

/** Tutor only: every registered visualization, whether or not a lesson uses it yet. */
export async function VizLibraryGrid({ basePath, usage }: { basePath: string; usage: Record<string, number> }) {
  const t = await getT();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {VIZ_LIBRARY.map((item) => {
        const used = item.kind === "viz" ? usage[item.data.component] ?? 0 : 0;
        return (
          <li key={item.slug}>
            <Link
              href={`${basePath}/${item.slug}`}
              className={`${cardCls} group flex h-full flex-col gap-1.5 p-4 transition hover:border-blue-300 hover:shadow`}
            >
              <span className="font-medium text-zinc-900 group-hover:text-blue-700">{item.title}</span>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  used ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {used ? t("playgroundCards.inLessons", { n: used }) : t("playgroundCards.notInLesson")}
              </span>
              {item.blurbKey && <span className="text-sm text-zinc-500">{t(item.blurbKey)}</span>}
              <span className="mt-auto pt-1 text-xs font-medium text-blue-700">{t("playgroundCards.preview")}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

