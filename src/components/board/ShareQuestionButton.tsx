"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionForForm } from "@/components/quiz/QuestionAnswerInput";
import { PART_LETTERS } from "@/lib/quiz/format";
import { newId, type BoardDoc, type QuestionBackground } from "@/lib/board/doc";
import { useT } from "@/lib/i18n/client";
import type { Translate } from "@/lib/i18n/translate";

const LETTERS = ["A", "B", "C", "D"] as const;

/** The question as the student sees it, plus their answer so far — answer-free by construction. */
export function questionSnapshot(question: QuestionForForm, response: unknown, title: string, t: Translate): QuestionBackground {
  const order = question.optionOrder ?? question.options.map((_, i) => i);
  // Shown letters follow the student's order; the answer records authored letters.
  const shownLetter = (authored: string) => {
    const original = LETTERS.indexOf(authored as (typeof LETTERS)[number]);
    const position = order.indexOf(original);
    return position >= 0 ? LETTERS[position] : authored;
  };
  const choices =
    question.type === "MULTIPLE_CHOICE" || question.type === "MULTI_SELECT"
      ? order.map((original, position) => `${LETTERS[position]}. ${question.options[original]}`)
      : [];

  const s = question.structure;
  const items =
    s?.kind === "steps"
      ? s.steps.map((step, i) => `${t("board.qStep", { n: i + 1 })}: ${step}`)
      : s?.kind === "parts"
        ? s.parts.map((part, i) => `(${PART_LETTERS[i]}) ${part.prompt}`)
        : s?.kind === "lines"
          ? s.lines.map((line, i) => `${i + 1}. ${line}`)
          : [];

  const r = (response ?? {}) as Record<string, unknown>;
  const answer: string[] = [];
  switch (question.type) {
    case "MULTIPLE_CHOICE":
    case "MULTI_SELECT": {
      const picked = question.type === "MULTIPLE_CHOICE" ? (typeof r.letter === "string" ? [r.letter] : []) : ((r.letters as string[]) ?? []);
      // As the student saw it: their letter, then the option's own text.
      const lines = picked.map((authored) => {
        const original = LETTERS.indexOf(authored as (typeof LETTERS)[number]);
        return `${shownLetter(authored)}. ${question.options[original] ?? ""}`;
      });
      answer.push(...lines.sort());
      break;
    }
    case "NUMERIC":
      if (typeof r.value === "number" && Number.isFinite(r.value)) answer.push(String(r.value));
      break;
    case "SHORT_TEXT":
      if (typeof r.value === "string" && r.value.trim()) answer.push(r.value);
      break;
    case "CODE":
      if (typeof r.code === "string" && r.code.trim()) answer.push(r.code);
      break;
    case "STEPS":
    case "MULTI_PART": {
      const given = (question.type === "STEPS" ? r.steps : r.parts) as string[] | undefined;
      (given ?? []).forEach((v, i) => {
        if (v?.trim()) answer.push(question.type === "STEPS" ? `${t("board.qStep", { n: i + 1 })}: ${v}` : `(${PART_LETTERS[i]}) ${v}`);
      });
      break;
    }
    case "FIND_MISTAKE":
      if (typeof r.lineIndex === "number") answer.push(t("board.qMistakeLine", { n: r.lineIndex + 1 }));
      if (typeof r.correction === "string" && r.correction.trim()) answer.push(t("board.qCorrection", { text: r.correction }));
      break;
    case "WORKED":
      if (typeof r.working === "string" && r.working.trim()) answer.push(r.working);
      if (typeof r.finalAnswer === "string" && r.finalAnswer.trim()) answer.push(t("board.qFinal", { text: r.finalAnswer }));
      break;
  }

  return { kind: "question", title, prompt: question.prompt, choices, items, answer, code: question.type === "CODE" };
}

/**
 * "Ask tutor": during a live session, puts this practice question — and the
 * answer so far — on the session's whiteboard as a new page, then opens the
 * board there. The tutor's open board picks the page up when the student's
 * board joins (the sync on join reloads from the database).
 */
export function ShareQuestionButton({
  sessionId,
  question,
  response,
  title,
}: {
  sessionId: string;
  question: QuestionForForm;
  response: unknown;
  title: string;
}) {
  const t = useT();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sharing" | "error">("idle");

  const share = async () => {
    // Opened before the request so the browser treats it as the click's own
    // window, not a popup; named so a board already open in a tab is reused.
    const win = window.open("about:blank", `board-${sessionId}`);
    setState("sharing");
    const pageId = newId();
    const doc: BoardDoc = {
      pages: [pageId],
      strokes: {},
      deleted: [],
      backgrounds: { [pageId]: questionSnapshot(question, response, title, t) },
      removedPages: [],
    };
    try {
      // Saving a one-page doc merges it in: the page lands at the end of the board.
      const res = await fetch(`/api/board/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (!res.ok) throw new Error(String(res.status));
      const url = `/board/${sessionId}?page=${pageId}`;
      if (win) win.location.href = url;
      else router.push(url);
      setState("idle");
    } catch {
      win?.close();
      setState("error");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void share()}
        disabled={state === "sharing"}
        className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-800 hover:bg-violet-100 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20l1.2-4.6L16.5 4.1a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8 4 20Z" />
        </svg>
        {state === "sharing" ? t("board.sharing") : t("board.askTutor")}
      </button>
      {state === "error" && <span className="text-xs text-red-600">{t("board.shareFailed")}</span>}
    </div>
  );
}
