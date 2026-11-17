import katex from "katex";

/**
 * Text with inline maths between dollars: `luas $\pi r^2$ cm²`.
 *
 * Deliberately **not** Markdown. Prompts across the courses are plain prose
 * that happens to contain underscores (`data_nilai`), asterisks and
 * backticks; running them through Markdown would italicise half a Python
 * identifier. So only `$…$` spans are touched, and everything outside them is
 * rendered as the text it is. The one exception is a fenced code block (see
 * `splitCode`), which is shown as a block of code.
 *
 * A span KaTeX can't parse is left as written, dollars and all, rather than
 * throwing — a mistyped formula should look wrong, not take down the page.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const segments = splitCode(text);
  if (segments.length === 1 && segments[0].kind === "text") return <InlineMath text={text} className={className} />;
  return (
    <span className={className}>
      {segments.map((segment, i) =>
        segment.kind === "code" ? (
          // A <code> laid out as a block, not a <pre>: prompts are rendered inside <p>.
          <code
            key={i}
            className="my-2 block overflow-x-auto whitespace-pre rounded-md bg-zinc-900 px-3 py-2.5 font-mono text-[13px] font-normal leading-relaxed text-zinc-100"
          >
            {segment.value}
          </code>
        ) : (
          // A prompt long enough to carry code is usually laid out in lines — a list of
          // requirements, say — so its line breaks are kept. Other prompts are untouched.
          <InlineMath key={i} text={segment.value} className="block whitespace-pre-line" />
        )
      )}
    </span>
  );
}

type Segment = { kind: "text" | "code"; value: string };

/**
 * Pulls out fenced code blocks — three backticks on their own line, an
 * optional language after the opening ones. It is the one piece of Markdown
 * a prompt understands, because a program cannot be read with its line breaks
 * and indentation collapsed. Single backticks stay literal, as before.
 */
export function splitCode(text: string): Segment[] {
  const segments: Segment[] = [];
  const fence = /(^|\n)```[^\n`]*\n([\s\S]*?)\n```(?=\n|$)/g;
  let last = 0;
  for (const match of text.matchAll(fence)) {
    const before = text.slice(last, match.index).trim();
    if (before) segments.push({ kind: "text", value: before });
    segments.push({ kind: "code", value: match[2] });
    last = match.index + match[0].length;
  }
  const rest = text.slice(last).trim();
  if (rest || segments.length === 0) segments.push({ kind: "text", value: segments.length ? rest : text });
  return segments;
}

function InlineMath({ text, className }: { text: string; className?: string }) {
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
