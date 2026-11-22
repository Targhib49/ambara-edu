"use client";

import { MathText } from "@/components/quiz/MathText";
import { QUESTION_CARD, type QuestionBackground } from "@/lib/board/doc";
import { useT } from "@/lib/i18n/client";

/**
 * A shared question, laid out at page-unit size (860 × 1000) and scaled to the
 * canvas, so text wraps the same on every screen and ink drawn over a line
 * stays on that line for the other person too. Sits under the see-through
 * canvas; pointer events pass straight to the ink.
 */
export function QuestionCard({ bg, scale, viewerIsTutor }: { bg: QuestionBackground; scale: number; viewerIsTutor: boolean }) {
  const t = useT();
  return (
    <div
      className="pointer-events-none select-none overflow-hidden text-zinc-900"
      style={{
        width: QUESTION_CARD.w,
        height: QUESTION_CARD.h,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        padding: 48,
        fontSize: 26,
        lineHeight: 1.45,
      }}
    >
      <p style={{ fontSize: 18 }} className="font-semibold uppercase tracking-wide text-violet-700">
        {bg.title}
      </p>
      <div className="mt-4 font-medium">
        <MathText text={bg.prompt} />
      </div>

      {bg.choices.length > 0 && (
        <ul className="mt-6 space-y-3">
          {bg.choices.map((c, i) => (
            <li key={i} className="rounded-lg border border-zinc-200 px-4 py-2">
              <MathText text={c} />
            </li>
          ))}
        </ul>
      )}

      {bg.items.length > 0 && (
        <ul className="mt-6 space-y-2" style={{ fontSize: 24 }}>
          {bg.items.map((item, i) => (
            <li key={i}>
              <MathText text={item} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-lg border-2 border-dashed border-violet-200 bg-violet-50/60 px-5 py-4">
        <p style={{ fontSize: 18 }} className="font-semibold text-violet-800">
          {viewerIsTutor ? t("board.qStudentAnswer") : t("board.qYourAnswer")}
        </p>
        {bg.answer.length === 0 ? (
          <p className="mt-1 italic text-zinc-500">{t("board.qNoAnswer")}</p>
        ) : bg.code ? (
          <pre className="mt-2 overflow-hidden whitespace-pre-wrap font-mono" style={{ fontSize: 20 }}>
            {bg.answer.join("\n")}
          </pre>
        ) : (
          <div className="mt-1 space-y-1">
            {bg.answer.map((line, i) => (
              <p key={i} className="whitespace-pre-line">
                <MathText text={line} />
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * For the PNG download, which can't capture HTML: the question as plain text,
 * wrapped into the card's box. Maths stays as its $…$ source.
 */
export function drawQuestionFallback(ctx: CanvasRenderingContext2D, bg: QuestionBackground) {
  const r = QUESTION_CARD;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(r.x, r.y, r.w, r.h);
  const maxW = r.w - 96;
  let y = r.y + 72;
  const write = (text: string, font: string, color: string, gap: number) => {
    ctx.font = font;
    ctx.fillStyle = color;
    for (const para of text.split("\n")) {
      let line = "";
      for (const word of para.split(" ")) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxW && line) {
          ctx.fillText(line, r.x + 48, y);
          y += gap;
          line = word;
        } else line = next;
      }
      ctx.fillText(line, r.x + 48, y);
      y += gap;
    }
    y += gap / 2;
  };
  write(bg.title, "600 18px system-ui, sans-serif", "#6d28d9", 26);
  write(bg.prompt, "500 26px system-ui, sans-serif", "#18181b", 36);
  for (const c of [...bg.choices, ...bg.items]) write(c, "400 24px system-ui, sans-serif", "#27272a", 32);
  if (bg.answer.length) write(bg.answer.join("\n"), "400 24px system-ui, sans-serif", "#5b21b6", 32);
  ctx.strokeStyle = "#d4d4d8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(r.x + r.w, 0);
  ctx.lineTo(r.x + r.w, r.h);
  ctx.stroke();
}
