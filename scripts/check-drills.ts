/** Samples every drill skill: answers fit the boxes, unsigned skills never go negative, and prints a few prompts. */
import { DRILL_SKILLS, DRILL_SKILL_KEYS } from "../src/lib/drills/registry";

let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const problems: string[] = [];
for (const key of DRILL_SKILL_KEYS) {
  const def = DRILL_SKILLS[key];
  const signedSkill = "signed" in def && def.signed;
  const samples: string[] = [];
  for (let round = 0; round < 400; round++) {
    const index = round % 20;
    const q = def.make(index, rand);
    for (const n of q.answer) {
      if (!Number.isInteger(n)) problems.push(`${key}: non-integer ${n} for ${q.prompt}`);
      if (!signedSkill && n < 0) problems.push(`${key}: negative ${n} for ${q.prompt}`);
      if (String(n).replace("-", "").length > (signedSkill ? 4 : 4)) problems.push(`${key}: ${n} too long for ${q.prompt}`);
    }
    if (round % 7 === 0 && samples.length < 6) samples.push(`${q.prompt}  →  ${q.answer.join(q.separator || ",")}`);
  }
  console.log(`\n${key}\n  ` + samples.join("\n  "));
}
console.log(problems.length ? `\n✗ ${problems.length} problem(s)\n  ${[...new Set(problems)].slice(0, 20).join("\n  ")}` : "\n✓ all drill samples fit");
