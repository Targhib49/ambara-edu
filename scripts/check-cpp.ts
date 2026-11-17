/**
 * Compiles and runs every program in scripts/content/cpp-oop.ts and compares
 * what it prints with the answer written beside it. Touches no database.
 *
 *   npx tsx scripts/check-cpp.ts
 *
 * - output / choice-with-program: the program must print exactly `prints`.
 * - mistake: the lines as given must FAIL to compile; with `fix` in place of
 *   the wrong line they must compile and print `prints`.
 * - write: the model solution must compile (all its .cpp files together) and
 *   print `prints`, its output lines joined by single spaces.
 *
 * Needs a C++ compiler; set CXX to choose one (default: g++).
 */
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { CPP_EXERCISES, PRELUDE } from "./content/cpp-oop";

const CXX = process.env.CXX ?? "g++";
const work = fs.mkdtempSync(path.join(os.tmpdir(), "check-cpp-"));
let counter = 0;

const withPrelude = (source: string) => (source.includes("#include") ? source : PRELUDE + source);

/** Compiles the given files and, if that works, runs the result. */
function build(files: Record<string, string>): { compiled: boolean; output: string; log: string } {
  const dir = path.join(work, String(counter++));
  fs.mkdirSync(dir);
  for (const [name, source] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), name.endsWith(".cpp") ? withPrelude(source) : source);
  }
  const sources = Object.keys(files).filter((n) => n.endsWith(".cpp"));
  const compile = spawnSync(CXX, ["-std=c++17", "-Wall", "-o", "prog", ...sources], { cwd: dir, encoding: "utf8" });
  if (compile.status !== 0) return { compiled: false, output: "", log: compile.stderr };
  const run = spawnSync(path.join(dir, "prog"), [], { cwd: dir, encoding: "utf8", timeout: 5000 });
  return { compiled: true, output: run.stdout, log: compile.stderr };
}

const oneLine = (stdout: string) =>
  stdout
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l !== "")
    .join(" ");

const problems: string[] = [];
let programs = 0;

for (const exercise of CPP_EXERCISES) {
  exercise.questions.forEach((q, i) => {
    const where = `${exercise.title} #${i + 1} (${q.kind})`;
    const expect = (files: Record<string, string>, prints: string, label = "") => {
      programs++;
      const result = build(files);
      if (!result.compiled) problems.push(`${where}${label}: does not compile\n${result.log}`);
      else if (oneLine(result.output) !== prints) problems.push(`${where}${label}: prints "${oneLine(result.output)}", key says "${prints}"`);
      else if (/warning:/.test(result.log) && !/unused|private field/.test(result.log)) problems.push(`${where}${label}: compiler warning\n${result.log}`);
    };

    if (q.kind === "output") {
      if (q.prints.includes("\n")) problems.push(`${where}: the answer must be a single line`);
      expect({ "main.cpp": q.program }, q.prints);
    } else if (q.kind === "choice") {
      if (q.program && q.prints !== undefined) {
        expect({ "main.cpp": q.program }, q.prints);
        const chosen = q.options["ABCD".indexOf(q.answer)];
        if (chosen !== q.prints) problems.push(`${where}: option ${q.answer} is "${chosen}" but the program prints "${q.prints}"`);
      }
      if ("ABCD".indexOf(q.answer) >= q.options.length) problems.push(`${where}: answer ${q.answer} is past the last option`);
      if (new Set(q.options).size !== q.options.length) problems.push(`${where}: duplicate options`);
    } else if (q.kind === "mistake") {
      const assemble = (lines: string[]) => ({ "main.cpp": lines.join("\n") + "\n" + (q.harness ?? "") });
      programs++;
      if (build(assemble(q.lines)).compiled) problems.push(`${where}: the lines as given compile — there is no mistake to find`);
      const fixed = q.lines.map((line, n) => (n === q.wrongIndex ? q.fix : line));
      expect(assemble(fixed), q.prints ?? "", " (fixed)");
      // Fixing any other single line must not be enough, or the answer isn't unique… but
      // that can't be searched exhaustively; the prompt has to pin it down in words.
    } else {
      expect(q.files, q.prints);
      if (!q.prompt.includes("```")) problems.push(`${where}: the prompt should show the main() to run`);
    }
  });
}

fs.rmSync(work, { recursive: true, force: true });

const count = CPP_EXERCISES.reduce((n, e) => n + e.questions.length, 0);
for (const e of CPP_EXERCISES) {
  const kinds = e.questions.reduce<Record<string, number>>((acc, q) => ({ ...acc, [q.kind]: (acc[q.kind] ?? 0) + 1 }), {});
  const points = e.questions.reduce((n, q) => n + q.points, 0);
  console.log(`  ${e.title.padEnd(62)} ${e.questions.length} questions · ${points} points · ${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(", ")}`);
}
if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n\n` + problems.join("\n\n"));
  process.exit(1);
}
console.log(`\n✓ ${count} questions, ${programs} programs compiled and run with ${CXX}; every answer key matches`);
