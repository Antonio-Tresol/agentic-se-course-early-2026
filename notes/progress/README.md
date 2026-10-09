# Course progress tracking

Browser-side progress for the Agentic SE course, plus the tools the course owner uses to analyse the files learners send back. The logic is framework-free so it can move into the Vite/React app unchanged.

| File | Purpose |
|---|---|
| `../mockups/progress.js` | Classic script defining `window.AgenticProgress` (storage, export, import) |
| `progress.schema.json` | JSON Schema (draft 2020-12) for the export file |
| `analyse.py` | Owner's analysis script (Python 3, standard library only) |
| `test_progress.cjs` | Node tests for `progress.js`; `--samples` regenerates `sample/` |
| `calendar.schema.json` | JSON Schema (draft 2020-12) for a cohort calendar |
| `../mockups/data/calendar.sample.json` | Sample calendar (cohort `sample-cohort`, invented dates) |
| `sample/` | Five **synthetic** exports. The aliases read `SYNTHETIC-01` to `SYNTHETIC-05` and the learner ids start `L-synthetic-`. They are not real learners |

## What is stored, and where

Everything lives in the learner's own browser, in `localStorage` under the key `agentic-se:v2:progress`. The key is namespaced because `antonio-tresol.github.io` is shared with other repositories. If storage is blocked (private window, sandboxed iframe), the page keeps the state in memory and nothing persists after it closes.

The record holds:

- **learner**: a random id made on first use, an optional alias the learner types themselves, cohort, track (`claude` or `codex`), creation time.
- **items**: status (`todo`, `done`, `skipped`), completion time, optional self-reported minutes, and the page's own estimate for that item.
- **quizzes**: every self-check attempt, with each answer, the confidence given before the reveal, MCQ correctness, short-answer self-score, and totals.
- **estimates**: the Week 0 benchmark estimates, with complexity and specification quality ratings and the reason given.
- **deliverables**: link, note and rubric self-assessment for each week.
- **outcomes** (optional): the learner's "I can do this" ticks on each week's outcomes checklist, `{ "w1": { "o1": { checked, at } } }`. An unticked box is kept as `checked: false` so a merge can tell which side is newer.
- **stageLogs** (optional): the Week 3 hand-run loop and the Week 5 per-change report, `{ "w3": [ { id, change, stage, humanMinutes, tokens, costUsd, contextGiven, intervention, cause, judgement, at } ] }`. `failed` is an optional boolean marking a failed run (absent means false); `updateStage` takes `null` to clear `tokens` and `costUsd`. `stage` is `triage`, `spec`, `implement`, `review`, `pr` or `other`; `cause` is `missing-context`, `wrong-design`, `taste`, `none` or null. Written with `logStage`, `updateStage` and `removeStage`.
- **events**: the latest 500 actions with timestamps, used for timing analysis.

There is no name, email, IP address or full user agent. The export carries only a coarse browser family (`chrome`, `firefox`, `safari`, `edge`, `other`).

## What leaves the browser

Nothing is sent automatically. The page makes no network requests for progress. Data leaves only when the learner downloads the file (or copies the text) and chooses to send it to the owner.

## Learner workflow

1. Work through the course; the pages record progress as you tick items and complete self-checks.
2. At the end (or at any checkpoint), use the export control to **download** the JSON file. Where downloads are blocked, such as a sandboxed preview, **copy** it to the clipboard and paste it into a text file.
3. Send the file to the course owner.
4. To move to another browser or device, export in the first and **import** in the second. *Merge* combines the file with what is already there (the later completion wins, quiz attempts and estimates are united, outcomes merge by week and outcome id and stage log entries by id, in both cases the later `at` winning; a stage entry deleted on one device returns if the other file still holds it, the existing learner id is kept). *Replace* discards the local record and adopts the file, id included.

The alias is optional. Files are named `agentic-se-progress-{alias-or-id}-{date}.json`; a learner who wants to stay pseudonymous should leave the alias empty.

## Owner workflow

```
python3 analyse.py path/to/folder_or_files... --out results/
python3 analyse.py inbox/ --out results/ --truth ../mockups/data/benchmarks.json
```

- Invalid files are skipped with a warning. Learners are de-duplicated by `learner.id`; the latest `exportedAt` wins.
- Outputs in `results/`: `learners.csv`, `items.csv` (completion, median and mean minutes against the page estimate, and their ratio, for calibrating time budgets), `questions.csv` (difficulty, self-scores, confidence and the confidence gap between right and wrong answers), `estimates.csv` (n, median, IQR, complexity and specification medians), `stages.csv` (per week and stage: n, median and mean human minutes, median tokens, median cost and counts per cause), `outcomes.csv` (per week and outcome: the proportion of learners who ticked it, among those whose file holds any outcome for that week), and `summary.md`. The last three sections of `summary.md` cover stage logs and outcomes when present.
- `--truth` takes the benchmark ground-truth file and adds the log10 ratio of estimate to truth. Tasks are matched on `id`. The numeric field defaults to `truthMinutes` (`--truth-field` to change it). If a task has only a bucket (`--bucket-field`, default `bucket`), the midpoint is used: `"90-150"` gives 120, `"<=30"` gives 15, `"240+"` gives 360, or supply `--bucket-midpoints '{"S": 30}'`. A missing file only produces a warning.
- `--totals totals.json` (`{"w1": {"claude": 9, "codex": 10}}`) adds `completion_wN` columns to `learners.csv`; without it the file reports counts of done items.
- Aliases are never printed or written unless `--show-aliases` is given.

Quiz notes: confidence is recorded before the answer is revealed. Calibration is computed for MCQ only, as the mean confidence when right minus the mean when wrong.

## Cohort calendar

There is no backend, so session dates come from a file the owner publishes, one per cohort. Format and rules are in `calendar.schema.json`; `../mockups/data/calendar.sample.json` is a sample.

```
{ "schema": "agentic-se-calendar", "schemaVersion": 1, "cohort": "early-2026", "timezone": "Europe/London",
  "sessions": [ { "week": 0, "date": "2026-09-24", "time": "18:00", "place": "Room 2.14 or a URL" } ] }
```

**What the owner edits.** `cohort` (non-empty), one entry per week in `sessions` (week 0 to 5, no duplicates, `date` as `YYYY-MM-DD`). `timezone`, `time` and `place` are optional. Times are shown as written with the timezone label and never converted. A week without an entry shows no date. Publish the file anywhere learners can download it.

**How learners load it.** On My progress (Cohort calendar section, or "Add your cohort calendar" on the overview) they drop the file, choose it, or paste its text. It is validated with messages such as "Session 3: date must look like 2026-10-15". It is stored in `localStorage` under `agentic-se:v2:calendar`, apart from the progress record, and setting it also sets `learner.cohort`, so exports name the cohort. The calendar itself is never exported. Replace and Remove sit on the status line; Remove asks in the page. API: `AgenticProgress.setCalendar(obj)` returns `{ok, errors}`, `getCalendar()`, `clearCalendar()`.

**Without a calendar.** No next-session card content and no session dates or "Sample calendar" tags appear. "You are here" falls back to the first week with unticked core items. With a calendar it follows the next session on or after today (`?today=YYYY-MM-DD` overrides today for testing).

## Schema versioning

- `schemaVersion` is an integer, currently `1`.
- Adding an optional field is not a version change. Readers must ignore unknown fields, and files that lack the field stay valid. `outcomes` and `stageLogs` were added this way, so `schemaVersion` is still `1`; an older file imports cleanly and leaves both empty.
- Renaming, removing or retyping a field, or changing what a value means, bumps the version.
- `progress.js` and `analyse.py` refuse files of any other version with a clear message rather than guessing. When version 2 exists, the importer should migrate version 1 files explicitly, and `analyse.py` should keep reading both.
- `appVersion` records which build of the site wrote the file, which helps when interpreting items whose ids changed.

## Tests

```
node test_progress.cjs            # 23 tests: items, quiz grading, estimates, outcomes, stage logs (null clearing, failed), calendar, export, merge, replace, version mismatch
node test_progress.cjs --samples  # also regenerates sample/ (deterministic)
python3 analyse.py sample --out /tmp/results
```

The file has a `.cjs` extension because the repository's `package.json` sets `"type": "module"`.
