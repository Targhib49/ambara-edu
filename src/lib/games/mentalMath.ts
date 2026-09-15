/**
 * Question generation and marking for Mental Math Sprint. Pure functions: the
 * random source is passed in, so the game calls these from event handlers only.
 */

export type Level = "warmup" | "integers" | "tables" | "fractions";

export const LEVELS: { key: Level; title: string; blurb: string }[] = [
  { key: "warmup", title: "Warm-up", blurb: "Add and subtract up to 100" },
  { key: "integers", title: "Integers", blurb: "Negative numbers with + − × ÷" },
  { key: "tables", title: "Times tables", blurb: "× and ÷ up to 12 × 12" },
  { key: "fractions", title: "Fractions", blurb: "Add, subtract and multiply fractions" },
];

export type Question = {
  prompt: string;
  /** Canonical answer: an integer ("-12") or a reduced fraction ("3/4"). */
  answer: string;
  /** Present for levels answered by picking rather than typing. */
  choices?: string[];
};

type Rand = () => number;

const int = (rand: Rand, min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(rand: Rand, items: readonly T[]) => items[Math.floor(rand() * items.length)];
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Shown with a true minus sign, and in brackets after an operator so "5 − (−3)" reads right. */
const show = (n: number, bracket: boolean) => {
  const text = n < 0 ? `−${Math.abs(n)}` : String(n);
  return bracket && n < 0 ? `(${text})` : text;
};

function arithmetic(rand: Rand, a: number, op: "+" | "−" | "×" | "÷", b: number): Question {
  const answer = op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : a / b;
  return { prompt: `${show(a, true)} ${op} ${show(b, true)}`, answer: String(answer) };
}

function fraction(n: number, d: number) {
  const g = gcd(n, d) || 1;
  let num = n / g;
  let den = d / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return den === 1 ? String(num) : `${num}/${den}`;
}

const fractionValue = (text: string) => {
  const [n, d = "1"] = text.split("/");
  return Number(n) / Number(d);
};

export function makeQuestion(level: Level, rand: Rand): Question {
  switch (level) {
    case "warmup": {
      const op = pick(rand, ["+", "−"] as const);
      let a = int(rand, 2, 99);
      let b = int(rand, 2, 99);
      if (op === "−" && b > a) [a, b] = [b, a];
      return arithmetic(rand, a, op, b);
    }
    case "integers": {
      const op = pick(rand, ["+", "−", "×", "÷"] as const);
      const signed = (max: number) => (rand() < 0.5 ? -1 : 1) * int(rand, 1, max);
      if (op === "÷") {
        const divisor = signed(9);
        return arithmetic(rand, signed(12) * divisor, "÷", divisor);
      }
      return op === "×" ? arithmetic(rand, signed(12), "×", signed(9)) : arithmetic(rand, signed(30), op, signed(30));
    }
    case "tables": {
      const a = int(rand, 2, 12);
      const b = int(rand, 2, 12);
      return rand() < 0.5 ? arithmetic(rand, a, "×", b) : arithmetic(rand, a * b, "÷", b);
    }
    case "fractions": {
      const op = pick(rand, ["+", "−", "×"] as const);
      const d1 = int(rand, 2, 9);
      const d2 = int(rand, 2, 9);
      const n1 = int(rand, 1, d1 - 1);
      const n2 = int(rand, 1, d2 - 1);
      const answer =
        op === "×" ? fraction(n1 * n2, d1 * d2) : fraction(op === "+" ? n1 * d2 + n2 * d1 : n1 * d2 - n2 * d1, d1 * d2);
      // Distractors are the usual slips, kept only if they differ in value.
      const slips = [
        fraction(op === "×" ? n1 * d2 : op === "+" ? n1 + n2 : n1 - n2, op === "×" ? d1 * n2 : d1 + d2),
        fraction(op === "+" ? n1 * d2 - n2 * d1 : n1 * d2 + n2 * d1, d1 * d2),
        fraction(op === "×" ? n1 + n2 : n1 * n2, d1 * d2),
        fraction(op === "×" ? n1 * n2 : (op === "+" ? n1 * d2 + n2 * d1 : n1 * d2 - n2 * d1) + d1, d1 * d2),
        fraction(n1 + n2 + 1, Math.max(d1, d2)),
      ];
      const choices = [answer];
      for (const slip of slips) {
        if (choices.length === 4) break;
        if (!choices.some((c) => Math.abs(fractionValue(c) - fractionValue(slip)) < 1e-9)) choices.push(slip);
      }
      for (let k = 2; choices.length < 4; k++) {
        const filler = fraction(Math.round(fractionValue(answer) * 12) + k, 12);
        if (!choices.some((c) => Math.abs(fractionValue(c) - fractionValue(filler)) < 1e-9)) choices.push(filler);
      }
      // Shuffle so the right answer isn't always first.
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      return { prompt: `${n1}/${d1} ${op} ${n2}/${d2}`, answer, choices };
    }
  }
}

/** Typed answers accept a true minus sign, a hyphen, or spaces around it. */
export function isCorrect(question: Question, given: string): boolean {
  const normalised = given.replace(/[−–]/g, "-").replace(/\s+/g, "");
  if (question.choices) return normalised === question.answer;
  if (!/^-?\d+$/.test(normalised)) return false;
  return Number(normalised) === Number(question.answer);
}

/** Displays a canonical answer with a true minus sign. */
export const displayAnswer = (answer: string) => answer.replace(/^-/, "−").replace("/-", "/−");
