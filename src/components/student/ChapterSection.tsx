import Link from "next/link";
import { CompletionMark } from "@/components/ui/CompletionMark";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";
import type { CourseItem } from "@/lib/courseItems";

/**
 * One chapter of the course outline: a collapsible section whose rows are the
 * chapter's lessons and quizzes in order.
 *
 * Uses <details>/<summary> rather than React state so collapsing needs no
 * client JavaScript and keeps working before hydration.
 */
export function ChapterSection({
  title,
  items,
  status,
  nextItemKey,
}: {
  title: string;
  items: CourseItem[];
  status: { complete: boolean; label: string };
  nextItemKey: string | null;
}) {
  return (
    <details open className="group border-b border-zinc-200 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
        <h2 className="min-w-0 flex-1 font-medium text-zinc-900">{title}</h2>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status.complete ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {status.label}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
          aria-hidden
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <ul className="pb-2">
        {items.map((item) => (
          <ItemRow key={item.key} item={item} isNext={item.key === nextItemKey} />
        ))}
      </ul>
    </details>
  );
}

function ItemRow({ item, isNext }: { item: CourseItem; isNext: boolean }) {
  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-5 py-3 transition ${
          isNext ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-zinc-50"
        }`}
      >
        <CompletionMark done={item.complete} />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-900">{item.title}</span>
          <span className="block truncate text-xs text-zinc-500">
            {item.label}
            {item.status && ` · ${SUBMISSION_STATUS_LABEL[item.status]}`}
            {item.scorePct !== null && ` · Grade: ${item.scorePct.toFixed(item.scorePct % 1 === 0 ? 0 : 2)}%`}
          </span>
        </span>

        {isNext ? (
          <span className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white">
            Get started
          </span>
        ) : (
          item.scorePct !== null && <ScoreRing pct={item.scorePct} size={34} />
        )}
      </Link>
    </li>
  );
}
