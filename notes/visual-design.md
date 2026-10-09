---
title: "Agentic SE Course: v2 visual and interaction design"
date: 2026-10-09
bibliography: [references.bib, readings.bib]
link-citations: true
---

The owner's review found the v2 mockups strong on learning science and weak on visual design. This document sets the visual layer over `notes/design.md`: the picture each page leads with, the components that draw them, light and dark tokens, and the accessibility rules they pass. It also adds per-learner progress, saved in the browser and exported as JSON at the end of the course. That replaces the `design.md` non-goal "no accounts, server or stored progress": the site keeps no accounts and no server, and each learner's progress lives in their own browser.

## 1. Diagnosis: the mockups read as documents

We rendered the learner mockups in headless Chrome at 1,280 px and counted words (excluding `<head>` and scripts), figures and tables in the HTML.

| Page | Words | Figures | Tables | Rendered height |
|---|---|---|---|---|
| `overview.html` | 545 | 0 | 0 | about 2,000 px |
| `week-1.html` | 974 | 0 | 0 | about 3,100 px |
| `week-1-check.html` | 763 | 0 | 0 | about 2,000 px |
| `week-3.html` | 1,891 | 0 | 2 | about 5,200 px |
| `week-4.html` | 2,003 | 1 | 1 | about 6,600 px |
| `week-5.html` | 1,464 | 0 | 3 | about 4,600 px |

The only figure on any learner page is the Week 4 factory loop, the element the owner singled out.

**Overview.** The course is six text rows. Workload is a mono string in mixed units ("Pre-work ~172 min", "140.5 min, activity included", "6 to 8 h build"), so comparing weeks means reading and holding numbers. Week 0 shows "~N min", and nothing shows where the learner is.

**Week 1.** The time budget is one sentence. Each item's minutes sit in a 12 px mono aside, and its kind shows only as the verb "Complete" or "Read". The plan for the hour lists five durations that sum to 60 without showing it.

**Week 1 self-check.** The page holds five white cards with text areas and radio buttons, states "Nothing you type is saved or sent anywhere", and ends with no score.

**Week 3.** The page's most telling numbers, human minutes per stage in the example log (4, 16, 12, 10, 5), are cells in a six-column table inside a closed accordion. The budget line packs four figures into one sentence, and every pre-work row leads with italic guiding questions.

**Week 4.** The loop shows the stages, the two human checkpoints and the return path before the reader meets a word of text. At 1,280 px, row 07's "not measured" label overlaps its note, because the label is wider than the 76 px aside column.

**Week 5.** The per-change report sets factory and Week 3 figures in a seven-column table, so the reader has to subtract to see how much human time the factory saved.

## 2. Principles

**1. The course appears as a picture before any text.** Each page opens with a figure of its structure. People learn better from words and pictures than from words alone [@mayer2020], and an overview of 29 reviews found significant effects for 11 multimedia principles, with contiguity and signalling among the largest [@noetel2021]. Design mattered less in self-paced settings such as websites, so gains here are likely smaller. Irrelevant but interesting additions can hinder learning [@sundararajan2020], so every picture carries course data.

**2. Every number that matters is drawn as position or length on a shared baseline.** Minutes, scores, costs and completion each get a bar or dot on a common axis, labelled with the number. Cleveland and McGill ordered elementary perceptual tasks by accuracy and advised using tasks high in that order [@cleveland1984]. A crowdsourced replication found position on a common scale more accurate than angle or area, with angle no worse than length [@heer2010], and NN/g's dashboard guidance favours length and position [@laubheimer2017dashboards].

**3. Progress is a bar on a common scale, counted honestly.** Weeks share one axis so a learner can compare them. A single measure against a target uses Few's bullet graph, designed to replace dashboard meters and gauges [@few2013bullet]. People speed up as a goal nears [@kivetz2006], and an artificial head start raises completion, moderated by the reason given for it [@nunes2006]. The site uses both with real data only: each week's headline is minutes left, the denominator is the measured workload, and the only head start is work the learner has done. In web surveys, constant-speed progress indicators did not reduce drop-off, fast-to-slow ones reduced it and slow-to-fast ones increased it [@villar2013]. A front-loaded bar would misstate the work left, so the bar moves in proportion to measured minutes.

**4. The factory loop recurs as the course's figure.** Week 3 opens with a strip of five manual stages, Week 4 with the full loop and its checkpoints, Week 5 with the loop annotated by measured minutes. Apple asks for one chart type, consistent colours and consistent layout when several charts show one dataset from different angles [@applehigchartingdata].

**5. Colour names an item's kind, from a colour-blind-safe set, always with a second channel.** The kinds take three hues and near-black from Okabe and Ito's colour-blind barrier-free palette, whose authors advise against conveying information by colour alone [@okabe2008]. Series carry direct labels where they fit [@moran2022clutter; @applehigcharts]. The clay accent keeps one job, "you are here".

**6. Hierarchy comes from scale, contrast and grouping, three sizes per component.** NN/g recommends at most three sizes and three contrast levels in a complex design [@gordon2021hierarchy]. Marks that encode no data are removed, following Tufte's data-ink ratio [@tufte2001; @moran2022clutter].

**7. Motion confirms a change of state within 300 ms.** Google reports 46 studies with more than 18,000 participants behind Material 3 Expressive; in one, eye-tracking participants found key elements "up to four times faster" in expressive versions of ten apps [@bentley2025expressive]. The write-up is Google's own and not peer reviewed. It warns that expressive design does not suit every product, that clarity outranks emotion, and that removing text labels reduced usability. The site takes the emphasis, larger filled primary actions, and keeps every label.

**8. Practice gives immediate feedback, calibrated by confidence.** Each quiz question asks for confidence before revealing the answer. Errors made with high confidence are the most likely to be corrected after feedback [@butterfield2001], and errorful learning helps when corrective feedback follows, especially feedback that analyses the reasoning behind the error [@metcalfe2017]. Testing beats restudying for retention [@roediger2006].

## 3. Component inventory

Sketches use the mockups' sample figures. `█` is done, `░` is still to do.

### 3.1 Course map (overview)

Six stations sit on a horizontal rail under the hero, each with a column of that week's pre-work minutes on one shared axis. The sketch rounds heights to 60 minutes per row.

```
 TRACK [Claude Code|Codex]                         NEXT SESSION Thu 15 Oct
 min
 480 ┤                                                 ┌┄┐
     │                                                 ┆ ┆  6 to 8 h build,
 360 ┤                                                 └┄┘  optional
     │
 240 ┤
     │          ┌─┐  ┌─┐
 120 ┤          │█│  │█│  ┌─┐  ┌─┐
     │          │█│  │█│  │█│  │░│
   0 ┼──────────┴─┴──┴─┴──┴─┴──┴─┴─────────────────────────
     ●──────────●────●────◉────○──────────────────○
     Week 0     1    2    3    4                  5
     not        172  189  141  147
     measured             ◆    ◆                  ◆ Deliverable
                          YOU ARE HERE
```

- **Columns** show planned minutes for the selected track. The filled part is minutes ticked off; the rest is a 1.5 px outline.
- **Week 0** reads "not measured" in place of a column until its minutes exist. **Week 5** is a dashed range bar from 360 to 480 minutes.
- **Stations**: `●` core items done, `◉` current week with a 2 px clay ring, `○` not started. The current week follows the cohort calendar, or else the first week with core items left. Deliverables get `◆` and the word.
- **Track switch** re-renders the columns and announces the new totals. **Below 640 px** the rail turns vertical, one row per week with a horizontal bar on the same scale.
- **Markup**: an `<ol>` of week links whose accessible names carry the data ("Week 3, One change through the whole loop, 141 minutes planned, 47 done, deliverable, current week"). The bars are `aria-hidden`, and a "Show as table" disclosure gives the same data as a table.

### 3.2 Week hero

The hero takes over from the facts row, the budget sentence and the outcomes list.

```
WEEK 3
One change through the whole loop                     [Claude Code|Codex]

 94 MIN LEFT · 47 of 141 done                         Session Thu 15 Oct
┌────────┬───────────┬────────┬────┬──┬─────────────────────────┐
│████████│███████████│░░░░░░░░│░░░░│░░│░░░░░░░░░░░░░░░░░░░░░░░░░│
└────────┴───────────┴────────┴────┴──┴─────────────────────────┘
 ▶ 20.5   ▶ 26.8      ¶ 19.0  ¶ 9.2 ¶5  ✎ 60 Ship one issue by hand
 ▶ Video   ¶ Reading   ✎ Practice

BY THE END OF THIS WEEK YOU CAN                                 1 of 4
[x] Take one lanorme issue through triage … logging minutes
[ ] Justify the context given at each stage …
[ ] Write a /goal condition that matches CI …
[ ] Point to the stages that needed human judgement …
```

- **Time-budget bar**: one segment per core item in page order, width proportional to minutes, 16 px tall. Done segments fill with their kind colour; remaining ones show a 1.5 px outline in that colour. Segments are separated by a 2 px surface gap, which is mandatory: the kind colours do not reach 3:1 against each other, and SC 1.4.11 needs each segment's edge to meet a colour that does [@w3c2024wcag22].
- **Headline**: minutes left in Inter 600 at 28 px. Optional items get a thinner bar below, labelled "Optional".
- **Labels** under the segments carry a glyph and minutes; those that do not fit move into the key, which lists only the kinds present.
- **Outcomes** are checkboxes labelled "I can do this", ticked by the learner after the self-check or the deliverable. Each links to the rubric row that assesses it.

### 3.3 Pre-work rows

```
┌──────────────────────────────────────────────────────────────────────┐
│ [x]  ▶ VIDEO   20.5 min                                  took [ 25 ] │
│      Watch No Vibes Allowed: Solving Hard Problems ↗                 │
│      Dex Horthy · AI Engineer Code · Dec 2025                        │
│      ┌ Guiding questions ─────────────────────────────────────────── │
│      │ What does intentional compaction produce …                    │
│      Chapters 2:52  6:34  11:54                                      │
│      est ├────────────────┼─────┤ took   (bullet graph, 0 to 40 min) │
└──────────────────────────────────────────────────────────────────────┘
```

- **Done checkbox** first, 24 × 24 px, labelled with the item title; ticking it fills the item's hero segment.
- **Kind badge**: a 10 px square in the kind colour, a glyph and the word. Each item gains `kind: "video" | "reading" | "course" | "practice"`.
- **"Took" input** appears once the item is ticked (`type="number"`, `min="0"`, label "Minutes it actually took (optional)"), followed by a bullet graph of estimate against actual.
- **Title and link** move above the guiding questions, and the aside widens for "not measured", which fixes the Week 4 overlap.

### 3.4 Quiz card

The self-check moves onto the week page, where the owner liked it; `#/week/N/check` stays as a focused view of the same cards.

```
SELF-CHECK                          ████████▓▓▓▓░░░░░░░░  2.5 of 5 · try 2
┌──────────────────────────────────────────────────────────────────────┐
│ QUESTION 2 OF 5                                                      │
│ When does the guide suggest skipping plan mode?                      │
│ ( ) A  When the change touches several files                         │
│ ( ) B  When you are unfamiliar with the code being changed           │
│ (•) C  When you could describe the diff in one sentence              │
│ ( ) D  Never: every change should start in plan mode                 │
│                                                                      │
│ HOW SURE ARE YOU?  [ Guess ] [ Unsure ] [ Fairly sure ] [■ Certain ] │
│                                                    [ Check answer ]  │
├──────────────────────────────────────────────────────────────────────┤
│ ✓ Correct. Planning adds overhead; a one-sentence diff skips it.     │
│ Source: Best Practices for Claude Code ↗                             │
└──────────────────────────────────────────────────────────────────────┘
```

- **Sequence**: answer, then confidence (a required radio group, stored as 1 to 4), then "Check answer", enabled once both are set. The answer locks on reveal.
- **Choice questions** grade themselves: `✓ Correct` or `✕ Not this one`, icon and word in `--text`, with the right option outlined.
- **Short answers** reveal the model answer, then ask "How did your answer compare?": "Matched" (2), "Partly" (1), "Missed" (0), stored as `selfScore` and counted as 1, 0.5 and 0 in the score. Every question produces a grade for the export.
- **High-confidence errors**: a wrong or "Missed" answer marked Certain adds one line, "You were certain of this one. Read the source now: confident errors are the ones feedback fixes best", with the source link.
- **Score bar**: one cell per question, full fill for 1, diagonal hatch for 0.5, outline for 0. "Try again" starts a new attempt; the bar shows the latest and the text names the best.

### 3.5 My progress page (`#/progress`)

The data layer already exists: `notes/mockups/progress.js` (`window.AgenticProgress`) stores the record, and `notes/progress/progress.schema.json` defines the export. This page is its visual front end.

```
MY PROGRESS                                     Saved in this browser only

Pre-work by week        0 ──────── 120 ──────── 240 min
  Week 1   █████████████████████████░░░░   150 of 172
  Week 3   ███████████░░░░░░░░░░░░░░░░     47 of 141   ◉
Self-checks             0 ─── 1 ─── 2 ─── 3 ─── 4 ─── 5
  Week 1   latest ●  best ○                              4 of 5
Calibration             0% ──────── 50% ──────── 100% correct
  Guess     ████████                        2 of 5
  Certain   █████████████████████████       7 of 8
Your time against the estimate    estimate ┼  actual █
  Claude Code 101   ███████████████████████┼██           95 vs 90
EXPORT   Alias (optional) [__________]
  [ Download JSON ]  [ Copy JSON ]  [ Select all ]
  ┌ read-only textarea holding the full JSON ─────────────────┐
  └────────────────────────────────────────────────────────────┘
IMPORT   [ Choose file ]  or paste [________]   ( ) Merge  ( ) Replace   [ Import ]
```

- **Charts**: completion as aligned bars of minutes done over planned; self-check scores as dots on a 0 to 5 axis; calibration as the share of choice questions correct at each confidence level, with counts; time as bullet graphs of `minutesSpent` against `estimateMinutes`, with totals at the top.
- **Export**: on GitHub Pages, "Download JSON" saves `agentic-se-progress-{alias-or-id}-{date}.json` from a `Blob`. Inside a claude.ai artifact downloads are blocked, so "Copy JSON" and the visible textarea are always present, and "Select all" supports a manual copy when the clipboard is refused.
- **Import** reports what the file holds ("2 weeks, 9 items, 3 attempts") before the learner picks Merge or Replace, as `progress.js` implements them. "Clear my progress" sits apart, with its own confirmation.
- **Storage** follows `progress.js` (key `agentic-se:v2:progress`, in-memory when storage is blocked); when blocked, the page says "Progress cannot be saved in this browser. Export before you leave." The check page's "Nothing you type is saved or sent anywhere" becomes "Your answers are saved in this browser only, and leave it only when you export them."
- **Schema additions**: two optional fields, which the versioning rule allows without a version change: `outcomes` (week, outcome id, boolean) and `stageLogs` (week, then rows of stage, human minutes, tokens, cost, intervention and judgement).

### 3.6 Week 1 benchmark activity (live session)

`notes/benchmark-activity.md` defines the activity, in which pairs scope two tasks with an agent, submit estimates and then see the reveal. `notes/mockups/data/benchmarks.json` holds the top scores per board, a frontier time series, six tasks with ground truth, and the estimate fields.

```
SWE-BENCH VERIFIED · % of 500 tasks resolved · board ↗ · read 9 Oct 2026
                         0%        25%        50%        75%      100%
  1  <system>  ████████████████████████████████████████▕  <score>
  1  <system>  ████████████████████████████████████████▕  <score>
  3  <system>  ███████████████████████████████████████▕   <score>
  Newest entry dated <date>; the board stopped receiving frontier submissions.

┌ TASK <taskId> · <benchmark> ───┐   PAIR ESTIMATE
│ <repo> · <title>               │   Minutes, no AI help   [    ]
│ Setup: <openLocally>           │   Complexity      ( )1 ( )2 (•)3 ( )4 ( )5
│ Statement ↗                    │   Specification   ( )1 ( )2 ( )3 (•)4 ( )5
└────────────────────────────────┘   Reason (200 characters)  [__________]
                                                         [ Submit ]

REVEAL  Task 3   log scale: 10 ─── 30 ─── 100 ─── 300 ─── 1,000 min
        ground truth                │      90 min, the task author's estimate
        your pair                  ●
        all pairs (session)   ·  · ·│·   ·     │ = median
        agents   0 of 10 runs passed
```

- **Top-scores panels**: one small multiple per board on a shared 0 to 100 percent axis, ink bars in `rank` order with ties shown, direct labels, `metric` as subtitle and each `caveats` entry as a note.
- **Frontier over time**: the METR series as dots with interval whiskers on a log minutes axis against release date, its caveats underneath.
- **Task cards** show the task's id, benchmark, repository, title, statement link and setup command, and hold back `groundTruth` until the reveal.
- **Estimate form** writes the `logSchema.estimate` fields, with the anchors for the two 1 to 5 scales beside their controls. The second round's submission locks both estimates.
- **Reveal** uses a log axis, since ground truth runs from under 15 minutes to 960: the ground truth as a band where the data gives a range and a tick where it gives a point, the pair's estimate as a filled dot, and the agents' passes as text. The facilitator's session view adds every pair's estimate as an unlabelled dot, with the median as a tick.

### 3.7 Weeks 3 to 5

**Week 3 stage log as a timeline.** The worked example opens with two aligned small multiples in stage order, human minutes and then cost, each on its own axis, with `▲` marking each intervention. The table stays underneath as the data view.

```
HUMAN MINUTES BY STAGE (sample, 47 min)
Triage Spec               Implement      Review      PR
├────┼──────────────────┼──────────────┼───────────┼─────┤
  4        16 ▲1               12 ▲2         10 ▲3     5 ▲4
COST BY STAGE (sample, $2.90)
├┼──────┼─────────────┼────┼┤
```

The pre-work activity adds "Your stage log": a row of inputs per stage (minutes, tokens, cost, intervention, judgement), stored in `stageLogs` and drawn with the same timeline. Week 5 compares against it.

**Loop strip.** Weeks 3 and 5 open with the Week 4 loop at strip size. In Week 3 every stage is ink, since a person runs each one. In Week 5 the agent stages are outlined, the two checkpoints stay ink, and each stage carries the learner's logged minutes.

**Session plan as a 60-minute bar.** Each block is a neutral segment labelled with its minutes and its ICAP mode in text.

**Week 5 per-change report.** Two small multiples share the change order: human minutes per change and cost per change. The replayed issue has a factory bar and a Week 3 bar; the others have one bar and the text "no baseline". Setup hours, setup cost and failed runs while wiring are stat tiles beside the charts, since 7.5 hours on the per-change axis would flatten every bar.

## 4. Tokens

The additions keep Source Serif 4, Inter, JetBrains Mono, the clay accent `#C86E50` and the neutral greys. Ratios come from the WCAG relative-luminance function in `design.md`, section 4.

### Data-viz palette

The light set keeps Okabe and Ito's blue and bluish green and darkens their reddish purple to oklch L 0.46, which separates it from the blue for red-green colour-blind readers [@okabe2008]. Practice items use a neutral ink, far in lightness from all three hues. We checked all pairs, since any kind can sit beside any other, under Machado, Oliveira and Fernandes's colour-vision-deficiency simulation at full severity. The worst light pair is blue and purple under deuteranopia, ΔE 12.2 (OKLab ×100, target 8); the worst under normal vision is 18.7 (floor 15). Dark mode scores 13.6 and 19.0, with low tritan separation of green and purple (3.5), which the glyphs and words cover.

| Token | Light | on `#FFFFFF` | on `#F4F4F4` | Dark | on `#1C1C1C` | on `#141414` |
|---|---|---|---|---|---|---|
| `--viz-course` | `#0072B2` | 5.19 | 4.71 | `#3D94E0` | 5.28 | 5.71 |
| `--viz-reading` | `#009E73` | 3.42 | 3.11 | `#39AD79` | 6.03 | 6.52 |
| `--viz-video` | `#853866` | 7.62 | 6.93 | `#9B5686` | 3.30 | 3.57 |
| `--viz-practice` | `#262626` | 15.13 | 13.76 | `#E0E0E0` | 12.91 | 13.96 |

Every data colour clears 3:1 on every background in its theme, hover colours included; the closest are `#009E73` at 3.00 on `#F0F0F0` and `#9B5686` at 3.01 on `#242424`. Charts never sit on hover backgrounds, data colours never colour text, and tracks and gridlines use `--border`.

### Dark theme

The dark values apply under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`.

| Token | Light | Dark | Dark ratio on page / surface / hover-card |
|---|---|---|---|
| `--page` | `#F4F4F4` | `#141414` | |
| `--surface` | `#FFFFFF` | `#1C1C1C` | |
| `--border` | `#E5E5E5` | `#333333` | decorative |
| `--hover-card` | `#F0F0F0` | `#242424` | |
| `--hover-row` | `#FAFAFA` | `#202020` | |
| `--text` | `#0A0A0A` | `#F2F2F2` | 16.46 / 15.22 / 13.87 |
| `--body` | `#262626` | `#D4D4D4` | 12.43 / 11.50 / 10.47 |
| `--step` | `#525252` | `#B0B0B0` | 8.49 / 7.86 / 7.16 |
| `--muted` | `#6B6B6B` | `#A0A0A0` | 7.04 / 6.52 / 5.94 |
| `--orange` | `#C86E50` | `#D28064` | 6.15 / 5.69 / 5.18 |
| `--control` (new) | `#8A8A8A` | `#757575` | 4.00 / 3.70 / 3.37 |
| `--tag-border` (new) | `#CFCFCF` | `#4A4A4A` | decorative |
| `--on-ink` (new) | `#FFFFFF` | `#141414` | 16.46 on dark `--text`, 12.43 on dark `--body` |
| `--selection` (new) | `#E5E5E5` | `#3A3A3A` | |

`#D28064` keeps the accent's hue (oklch 39°) at a higher lightness.

Text on ink fills is hard-coded `#FFFFFF` in `mockup.css`, and every instance becomes `var(--on-ink)`: `.skip-link`, `.tag--deliverable`, `.btn:hover` and its arrow, `.btn[aria-pressed="true"]`, `.btn[aria-expanded="true"]` (the self-check's "Show answer" toggle), the checked track-switch label, the `.fac-band` text including its `#E5E5E5` note, and the `.fac-band :focus-visible` outline. Because `.fac-band` fills with `var(--body)`, it inverts in dark to a light band with dark text and stays distinct from the page. The other hard-coded values are `#CFCFCF` in `.tag` and `.week-nav__link` (to `--tag-border`), `#8A8A8A` in the disabled week link and `.q textarea` (to `--control`), the `::selection` pair, and the gallery's annotation markers.

### Type, numbers and spacing

- Stat numbers (minutes left, scores): Inter 600, 28 px. All chart labels and minutes use `font-variant-numeric: tabular-nums`.
- Chart text: 12 px minimum, JetBrains Mono for ticks and values, Inter 500 for series and stage names.
- Sizes per component: 12, 16 and 28 px in the hero; 12, 15 and 17 px in cards.
- Spacing: `--space-1` to `--space-8` = 4, 8, 12, 16, 24, 32, 48, 64 px. Section gaps stay at 40 to 44 px.
- Marks: budget bar 16 px, other bars 12 px, 2 px surface gaps, 2 px radius on the data end, at most four gridlines per axis.

### Motion

| Token | Value | Use | Material token |
|---|---|---|---|
| `--motion-fast` | 100 ms | colour and border on hover | short2 |
| `--motion-base` | 200 ms | check mark, disclosure, answer reveal | short4 |
| `--motion-slow` | 300 ms | bar segment and score cell fill | medium2 |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | default | standard |
| `--ease-enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | fills and reveals | emphasized decelerate |

Values come from the baseline Material 3 token file [@materialwebmotion]. One moment gets some expression: ticking a week's last core item fills its station on the course map over 300 ms. Under `prefers-reduced-motion: reduce`, fills and reveals appear at once and only colour changes animate [@w3cc39].

## 5. Accessibility guardrails

- **WCAG 2.2 AA** throughout [@w3c2024wcag22], with the `design.md` rules on reflow at 320 px, 24 px targets and APG disclosures.
- **Text alternative and data table for every chart.** The figure has `role="img"` and an accessible name stating its main message ("Week 3: 94 of 141 minutes left"), as Apple's guidance asks [@applehigcharts]. A "Show as table" disclosure, or the existing table, gives every value, following the W3C pattern for complex images [@w3cwaicomplex]; comparing exact values is one of the main tasks tables serve [@laubheimer2022tables].
- **Values visible without hover.** Tooltips may repeat a value and never hold its only copy [@applehigcharts].
- **A second channel beside colour** (SC 1.4.1): kind has a glyph and a word, done has fill, a check and a count, quiz results have an icon and a word, and the current week has a ring and "You are here".
- **Non-text contrast** (SC 1.4.11): data colours clear 3:1 in their theme and inputs use `--control`.
- **Status messages** (SC 4.1.3): saves, scores and imports are announced in a polite live region.
- **Forms**: every input has a visible label, confidence is a radio group in a `fieldset`, and a disabled "Check answer" has adjacent text saying what is missing.
- **Forced colours**: under `@media (forced-colors: active)`, segments get `CanvasText` borders and done segments a `Highlight` fill.

## 6. Gamification and dashboard traps

A systematic review found learning dashboards rarely grounded in learning theory, with no evidence that they support metacognition and no information on effective learning tactics [@matcha2020]. A review of dashboards for learners found designs that foster competition between learners over knowledge mastery and offer misguided frames of reference for comparison [@jivet2017]. The progress page therefore shows each learner only their own data, and each number in it maps to the learning design: minutes against workload, retrieval scores, calibration, and time against estimate.

The site leaves out:

- streaks, daily goals and "days in a row" counters;
- points, XP, levels and site badges (the Claude Academy and OpenAI Academy course badges are external and stay);
- leaderboards, percentiles and "N% of the cohort has finished" between learners. The Week 1 activity panels rank AI systems on published benchmarks, which is course content, and the reveal shows other pairs' estimates as unnamed, unranked dots against the ground truth;
- artificial head starts and front-loaded bars, which raised effort or completion in the studies cited in principle 3 [@kivetz2006; @nunes2006; @villar2013] by misstating the work left;
- pie charts, donuts, completion rings and radial gauges [@heer2010; @few2013bullet];
- confetti, celebratory animation and decorative illustration [@sundararajan2020];
- outcome ticks set on the learner's behalf;
- time-on-page and visit counts.

## References
