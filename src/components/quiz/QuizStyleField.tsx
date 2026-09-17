"use client";

import { labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import { QUIZ_STYLES, QUIZ_STYLE_CHIP, quizStyleHintKey, quizStyleKey } from "@/lib/quiz/styles";
import type { QuizStyle } from "@/generated/prisma/enums";

/**
 * The style picker, as radio cards that submit `style` with the surrounding
 * form. Pages can react to the choice in CSS alone — the quiz settings page
 * shows its try-out fields with `group-has-[input[value=TRYOUT]:checked]`.
 */
export function QuizStyleField({ defaultStyle = "CLASSIC" }: { defaultStyle?: QuizStyle }) {
  const t = useT();
  return (
    <fieldset>
      <legend className={labelCls}>{t("quizStyle.label")}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {QUIZ_STYLES.map((style) => (
          <label
            key={style}
            className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2.5 hover:border-zinc-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/60 has-[:checked]:ring-1 has-[:checked]:ring-blue-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500"
          >
            <input type="radio" name="style" value={style} defaultChecked={style === defaultStyle} className="sr-only" />
            <span className="block text-sm font-medium text-zinc-900">{t(quizStyleKey(style))}</span>
            <span className="mt-0.5 block text-xs text-zinc-500">{t(quizStyleHintKey(style))}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A small label for a quiz's style, for lists and syllabus rows. */
export function QuizStyleChip({ style }: { style: QuizStyle }) {
  const t = useT();
  return (
    <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${QUIZ_STYLE_CHIP[style]}`}>
      {t(quizStyleKey(style))}
    </span>
  );
}
