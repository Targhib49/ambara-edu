# Authoring quiz questions by script

For anyone (person or agent) writing questions straight into the database
rather than through the tutor's question editor. The editor enforces all of
this for you; a script has to do it itself.

**The source of truth is code, not this page.** Shapes live in
`src/lib/quiz/schema.ts` (`correctAnswerSchemas`), grading in
`src/lib/quiz/grading.ts`. If this page and the code disagree, the code wins —
and please fix this page.

## Ground rules

- **The database is shared with production.** Real students see anything
  PUBLISHED in a course they're enrolled in. Write new quizzes as `DRAFT`;
  the tutor publishes after reviewing.
- **Validate before you insert.** Run every answer through
  `parseCorrectAnswer(type, correctAnswer)` from `src/lib/quiz/schema.ts`. It
  throws on a bad shape. Nothing else stops a malformed row, and a malformed
  row breaks the quiz page for students.
- **Prompts are plain text.** No Markdown, no LaTeX. Write maths with Unicode:
  `−`, `×`, `÷`, `²`, `½`, `≤`.
- Every question has `prompt`, `points` (> 0), `explanation` (shown after
  grading; `""` is allowed) and `options` (only MC and multi-select use it;
  `[]` for everything else).

## The question types

### MULTIPLE_CHOICE
`options`: 2–4 strings, in order A, B, C, D.
```json
{ "letter": "B" }
```
Right or wrong. A try-out or exam with shuffling on reorders the options per
attempt, so an option must never refer to another by letter ("both A and C").

### MULTI_SELECT
```json
{ "letters": ["A", "C"] }
```
Right only if exactly those letters are picked.

### NUMERIC
```json
{ "value": 12.5, "tolerance": 0 }
```
**Use this for any plain number** — a count, an amount of money, a length.
The student types into a number field, so there's no ambiguity about `.` and
`,` (see the matching rules below).

### SHORT_TEXT
```json
{ "kind": "exact", "value": "4:3" }
```
or, for several accepted spellings:
```json
{ "kind": "regex", "pattern": "^4\\s*:\\s*3$", "flags": "i" }
```
For answers that are not a plain number: a ratio, a scale, a word. **Say the
format in the prompt** ("tulis dalam format a:b tanpa spasi"). A clean match
is right; anything else goes to the tutor's review queue, not straight to
wrong.

### STEPS — step-by-step
```json
{
  "steps": [
    { "prompt": "Cari FPB dari 48 dan 36", "answer": "12" },
    { "prompt": "Bagi kedua bilangan dengan FPB", "answer": "4:3" }
  ]
}
```
1–10 steps. Each step is one short written answer (matching rules below).
**Every step is worth the same share** of the question's points: 2 of 4
steps right on a 4-point question earns 2.

### MULTI_PART — (a), (b), (c)
```json
{
  "parts": [
    { "prompt": "Berapa km diwakili 1 cm?", "marks": 2, "answer": "5" },
    { "prompt": "Jarak peta 4 cm = ... km", "marks": 4, "answer": "20" }
  ]
}
```
1–8 parts; letters are added on screen. `marks` (> 0) weighs the parts
against each other, and the question's `points` are split by them: here (a)
is 2/6 of the points and (b) is 4/6. Each part is one short written answer.

### FIND_MISTAKE — find the mistake
```json
{ "lines": ["4x = 20", "x = 20 − 4", "x = 16"], "wrongIndex": 1, "correction": "x = 20 ÷ 4" }
```
2–12 lines of a worked solution with **exactly one** wrong line.
`wrongIndex` counts from 0 and must point at one of the lines. With a
`correction`, finding the line is worth half and writing the fix the other
half; with `"correction": ""`, finding the line is the whole task.

### CODE
```json
{ "testCases": [{ "input": "3\n4", "expectedOutput": "7" }] }
```
Up to 20 cases; `input` is stdin, `expectedOutput` is compared with stdout.
Always goes to the tutor's review queue as well.

## How written answers are matched

This applies to every STEPS step, MULTI_PART part and FIND_MISTAKE
correction. After trimming the ends:

1. **If both sides are numbers, they're compared as numbers.** `0.5`, `1/2`
   and `2/4` all match each other, and so does `0,5` — a lone comma between
   digits is read as a decimal point.
2. **Otherwise it's an exact comparison, ignoring upper/lower case.** Spaces
   inside count: `4 : 3` does **not** match `4:3`, and `20 km` does not match
   `20`.
3. **A near miss is wrong**, not sent to review. These types are graded
   entirely automatically.

What that means when writing one:

- Keep each answer to one short token: a number, a fraction, a ratio, a
  word. If the step asks for a unit, put the unit in the step's prompt
  ("... km"), not in the answer.
- Whenever the answer isn't a plain number, say the format in the prompt, as
  you would for SHORT_TEXT.
- A dot is always a decimal point, so `1.000` is one, not a thousand. Avoid
  answers of 1000 or more in written parts, or say the format.
- Negative numbers are fine: `-3` matches `-3`. Write a real minus sign in
  the prompt (`−`); the student types a hyphen.

## Quiz styles

A quiz's `style` decides how it's played. Only three are graded:

| style | graded | questions | extra fields |
|---|---|---|---|
| `CLASSIC` | yes | yes | — |
| `TRYOUT` | yes | yes | `timeLimitMinutes`, `maxAttempts`, `randomizeQuestionOrder` |
| `EXAM` | yes | yes | as TRYOUT, with `maxAttempts: 1` |
| `MASTERY` | practice | yes | — |
| `DRILL` | practice | **none** — generated | `drillSkill`, `drillSeconds`, `drillTarget` |
| `REVIEW` | practice | **none** — drawn from earlier chapters | `reviewCount` |

Don't write questions for `DRILL` or `REVIEW` quizzes; they're never shown.
Practice styles ignore `points` in the student's view, but it still has to
be positive. A `REVIEW` quiz draws from published quizzes in **earlier
chapters of the same course**, so published questions there feed it.
