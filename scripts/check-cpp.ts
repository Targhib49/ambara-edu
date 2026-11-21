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
import { CPP_EXERCISES, CPP_PRACTICE, PRELUDE } from "./content/cpp-oop";
import { LIFETIME_SCENARIOS, type LifetimeScenario } from "../src/lib/viz/objectLifetime";
import { CPP_GUIDED, blockSteps } from "./content/cpp-guided";
import { failedCodeChecks, guidedCodeSchema } from "../src/lib/blocks/guided";

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

// Hands-on tasks: the hidden solution must print the expected output, line for
// line, and the starter must not already do so — or there is nothing to do.
const lines = (stdout: string) => stdout.replace(/\s+$/, "").split("\n").map((l) => l.trimEnd()).join("\n");
let tasks = 0;
for (const practice of CPP_PRACTICE) {
  practice.tasks.forEach((task, i) => {
    const where = `${practice.moduleFile} task ${i + 1} "${task.title}"`;
    tasks++;
    programs += 2;
    const solved = build({ "main.cpp": task.solution });
    if (!solved.compiled) problems.push(`${where}: the solution does not compile\n${solved.log}`);
    else if (lines(solved.output) !== task.prints) problems.push(`${where}: the solution prints\n${lines(solved.output)}\nbut the task expects\n${task.prints}`);
    const start = build({ "main.cpp": task.starter });
    if (start.compiled && lines(start.output) === task.prints) problems.push(`${where}: the starter already prints the expected output`);
    if (task.starter.includes(task.solution)) problems.push(`${where}: the starter contains the solution`);
  });
}

// Guided exercises: every step's reference program compiles cleanly, prints
// the step's expected output and passes its code checks — and the program
// from the step before does not already pass, so each step asks for something.
let guidedSteps = 0;
for (const exercise of CPP_GUIDED) {
  const { steps, ...rest } = exercise;
  try {
    guidedCodeSchema.parse({ ...rest, language: "cpp", steps: blockSteps(exercise) });
  } catch (e) {
    problems.push(`guided "${exercise.title}": invalid block data: ${(e as Error).message}`);
  }
  const passes = (source: string, step: (typeof steps)[number]) => {
    const run = build({ "main.cpp": source });
    const ok = run.compiled && lines(run.output) === step.expectedOutput && failedCodeChecks(source, step.codeChecks ?? []).length === 0;
    return { run, ok };
  };
  let previous = exercise.starterCode;
  steps.forEach((step, i) => {
    const where = `guided "${exercise.title}" step ${i + 1} "${step.title}"`;
    guidedSteps++;
    programs += 2;
    if (step.solution === previous) problems.push(`${where}: the solution is the same as the step before — a .replace() probably missed`);
    const { run } = passes(step.solution, step);
    if (!run.compiled) problems.push(`${where}: the solution does not compile\n${run.log}`);
    else {
      if (lines(run.output) !== step.expectedOutput) problems.push(`${where}: the solution prints\n${lines(run.output)}\nbut the step expects\n${step.expectedOutput}`);
      if (/warning:/.test(run.log)) problems.push(`${where}: compiler warning\n${run.log}`);
    }
    const failed = failedCodeChecks(step.solution, step.codeChecks ?? []);
    if (failed.length) problems.push(`${where}: the solution fails its own code checks: ${failed.join(" | ")}`);
    if (passes(previous, step).ok) problems.push(`${where}: the program from the step before already passes`);
    previous = step.solution;
  });
}

// Object-lifetime visualizations: the trace's output, step by step, must add up
// to exactly what the program prints, and the objects must come and go sanely.
let scenarios = 0;
for (const [name, scenario] of Object.entries(LIFETIME_SCENARIOS) as [string, LifetimeScenario][]) {
  const where = `visualization "${name}"`;
  scenarios++;
  programs++;
  const run = build({ "main.cpp": scenario.program });
  const traced = scenario.steps.map((s) => s.out ?? "").join("");
  if (!run.compiled) problems.push(`${where}: does not compile\n${run.log}`);
  else if (run.output !== traced) problems.push(`${where}: the program prints ${JSON.stringify(run.output)} but the trace adds up to ${JSON.stringify(traced)}`);
  const lineCount = scenario.program.split("\n").length;
  const status = new Map<string, string>();
  scenario.steps.forEach((step, i) => {
    const at = `${where} step ${i + 1}`;
    const line = scenario.program.split("\n")[step.line - 1];
    if (step.line < 1 || step.line > lineCount) problems.push(`${at}: line ${step.line} is outside the program`);
    else if (step.out && !line.includes("cout")) problems.push(`${at}: prints ${JSON.stringify(step.out)} but line ${step.line} has no cout: ${line.trim()}`);
    for (const op of step.ops ?? []) {
      const object = scenario.objects.find((o) => o.id === op.id);
      if (!object) problems.push(`${at}: unknown object "${op.id}"`);
      if (op.do === "destroy") {
        if (!status.has(op.id)) problems.push(`${at}: destroys "${op.id}", which does not exist`);
        if (scenario.objects.some((o) => o.parent === op.id && status.has(o.id))) problems.push(`${at}: destroys "${op.id}" while its parts still exist`);
        status.delete(op.id);
      } else {
        if (object?.parent && !status.has(object.parent)) problems.push(`${at}: "${op.id}" exists before its parent "${object.parent}"`);
        status.set(op.id, op.do);
      }
    }
  });
  if (status.size) problems.push(`${where}: still alive when the program ends: ${[...status.keys()].join(", ")}`);
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
console.log(`  hands-on practice: ${tasks} tasks`);
console.log(`  object-lifetime visualizations: ${scenarios} scenarios`);
console.log(`  guided exercises: ${CPP_GUIDED.length} (${guidedSteps} steps)`);
console.log(`\n✓ ${count} questions and ${tasks} tasks, ${programs} programs compiled and run with ${CXX}; every answer key matches`);
