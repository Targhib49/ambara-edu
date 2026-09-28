import katex from "katex";

/**
 * Text with inline maths between dollars: `luas $\pi r^2$ cm²`.
 *
 * Deliberately **not** Markdown. Prompts across the courses are plain prose
 * that happens to contain underscores (`data_nilai`), asterisks and
 * backticks; running them through Markdown would italicise half a Python
 * identifier. So only `$…$` spans are touched, and everything outside them is
 * rendered as the text it is.
 *
 * A span KaTeX can't parse is left as written, dollars and all, rather than
 * throwing — a mistyped formula should look wrong, not take down the page.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = splitMath(text);
  if (parts.length === 1 && parts[0].kind === "text") {
    return className ? <span className={className}>{text}</span> : <>{text}</>;
  }
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.kind === "math" ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part.value) }} />
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </span>
  );
}

type Part = { kind: "text" | "math"; value: string };

/** Splits on single dollars, honouring `\$` as a literal dollar sign. */
export function splitMath(text: string): Part[] {
  const parts: Part[] = [];
  let buffer = "";
  let mathStart = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\" && text[i + 1] === "$") {
      // An escaped dollar is content, wherever it appears.
      buffer += "$";
      i++;
      continue;
    }
    if (ch !== "$") {
      buffer += ch;
      continue;
    }
    if (mathStart < 0) {
      if (buffer) parts.push({ kind: "text", value: buffer });
      buffer = "";
      mathStart = i;
    } else {
      parts.push({ kind: "math", value: buffer });
      buffer = "";
      mathStart = -1;
    }
  }
  // An unclosed dollar means the author meant a dollar sign, not maths.
  if (buffer) parts.push({ kind: "text", value: mathStart >= 0 ? `$${buffer}` : buffer });
  return parts.length ? parts : [{ kind: "text", value: "" }];
}

function renderMath(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: true, displayMode: false });
  } catch {
    return escapeHtml(`$${latex}$`);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
