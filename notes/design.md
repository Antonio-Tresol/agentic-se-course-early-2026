---
title: "Agentic SE Course: v2 design proposal"
date: 2026-10-09
bibliography: [references.bib, readings.bib]
link-citations: true
---

Version 2 reorganises the course site around the learner's week. Each week gets one page holding everything a learner does in it, in the order they do it, and the material for running the sessions moves to a labelled facilitator layer. The audit evidence behind each change is in `notes/site-review-2026-10.md`. This proposal specifies the structure, the week page, the visual tokens, the versioning plan and the build order.

## 1. Goals and non-goals

Goals:

- One URL per week, holding its outcomes, time budget, pre-work, activity, live session and deliverable.
- Every week states its outcomes, its workload, which items are core, and how its deliverable is judged.
- Retrieval practice in every week: a self-check before the session and a five-minute opener in it.
- Facilitator material in its own labelled layer.
- WCAG 2.2 AA throughout, including reflow at 320 CSS px.
- The current look carries over: typefaces, reading column, greys and accent.

Non-goals:

- The readings, courses and talks for Weeks 0 to 2 stay as they are; v2 changes how they are presented and labelled. Weeks 3 to 5 are reconsidered separately in `notes/curriculum-v2-second-half.md`.
- The site stays a static Vite build on GitHub Pages, with no accounts and no server. Progress is stored in the learner's browser and leaves it only as a JSON file the learner downloads and sends; `notes/progress/README.md` specifies the layer, its schema and the owner's analysis script.
- Visual and interaction design follow `notes/visual-design.md`, and the Week 1 live activity (estimating benchmark tasks, which replaces the nanobot exercise) follows `notes/benchmark-activity.md`.

The accessibility fixes (Phase 0) ship to v1 now, independent of v2.

## 2. Information architecture

### One page per week

v1 splits each week across Curriculum (intro and pre-work) and Sessions (session plan, activities, slides), and Sessions describes itself as "proposed supporting material and activities to run the course". The Week 3 and Week 4 pre-work activities, "Pick an Approach, Try It on a Hard Problem" and "Harness Design Document", are learner tasks that render only there. Assembling one week from two views costs working memory [@sweller2019], and a learner who never opens Sessions gets no signifier that the task exists [@norman2013]. A second Week 3 task, "Ship a Real PR to lanorme", lives only on slide 13 of `session3.html`.

v2 gives each week one page at `#/week/N`. The page holds, in order, the outcomes, time budget, core pre-work, optional pre-work, pre-work activity, self-check, live session, and the deliverable with its rubric. Its sections render open: a learner preparing a week needs all of it, and accordions suit pages where people need only a few sections [@wang2023accordions]. Accordions remain for the bibliography, the Further Reading categories and the Week 3 worked example.

### The overview

The overview at `#/` replaces the Curriculum view and lists all six weeks, one row each: label, title, a one-line summary, the pre-work total, and a marker on weeks with a deliverable. When a cohort calendar is configured, the week whose session comes next carries a "Next session" marker with its date, following Nielsen's first heuristic, visibility of system status [@nielsen1994]. With no calendar, no marker appears. The Prerequisites card becomes Week 0's pre-work, which resolves v1's "No pre-work required" sitting beside two courses marked "required".

### The facilitator layer

Session plans, slide decks, the Session 3 appendix and the full reading checks with answer keys move to `#/facilitator`, one run-sheet per session. Every facilitator page carries a "Facilitator notes" band in the label style, and learner pages link to the layer from the footer only. The layer labels content and controls no access: the repository is public, and `notes/` already publishes both answer keys (open question 3).

### Sitemap and routes

```
#/                         Overview: next session, weeks at a glance, track switch
├── #/week/0 … #/week/5    Week pages
│   └── #/week/N/check     Self-check for week N
├── #/resources            Bibliography (v1: collapsed block in Curriculum)
├── #/further-reading      Further Reading (v1 route, unchanged)
└── #/facilitator          Index of run-sheets
    └── #/facilitator/week/N   Plan, slides, appendix, reading check with key
```

| Route | Audience | Relation to v1 |
|---|---|---|
| `#/` | learners | same route, new content |
| `#/week/N`, `#/week/N/check` | learners | new |
| `#/resources` | learners | moved out of Curriculum |
| `#/further-reading` | learners | unchanged |
| `#/facilitator`, `#/facilitator/week/N` | facilitators | `#/sessions` redirects to `#/facilitator` |
| `?track=codex` on any learner route | learners | new |

The site keeps hash routing: GitHub Pages has no rewrite rules, so hash routes need no 404 fallback and every v1 link keeps resolving. Deep links also let the "Before Week N" slides link to `#/week/N` and drop their copy of the pre-work list. That copy has already drifted: slide 25 of `session1.html` omits "How Claude Code Works" from Week 2.

## 3. Week page anatomy

| # | Section | Content | Basis |
|---|---|---|---|
| 1 | Header | label, title, track switch, pre-work total, next-session date | [@nielsen1994] |
| 2 | Outcomes | three or four "you can" statements | [@biggs1996] |
| 3 | Time budget | minutes per item and a total | [@kember2004; @brysbaert2019] |
| 4 | Core pre-work | rows with one or two guiding questions each | [@carpenter2017; @guo2014] |
| 5 | Optional pre-work | same rows, under their own heading | [@kember2004] |
| 6 | Pre-work activity | task, steps, worked example (Week 3) | [@kirschner2006; @sweller2019; @kalyuga2003] |
| 7 | Self-check | five or six retrieval questions before the session | [@roediger2006; @agarwal2021; @dunlosky2013] |
| 8 | Live session | retrieval opener, plan, live activity, handout | [@vanalten2019; @chi2014] |
| 9 | Deliverable and rubric | criteria shown before the work, self-assessment, link to next week | [@hattie2007; @biggs1996] |
| 10 | Footer | previous and next week | |

A section renders only when the week has data for it: Week 0 has no deliverable, Weeks 1 and 2 have no pre-work activity, and Week 5 has no pre-work.

### Outcomes

Each page opens with "By the end of this week you can…" and three or four outcomes built on verbs an observer could check. Constructive alignment starts from intended outcomes and chooses activities and assessment that exercise them [@biggs1996], so each outcome maps to the activity, the session or the deliverable. Copy for the mockups:

**Week 1, One Coding Agent.** By the end of this week you can:

1. Take a small change in an unfamiliar repository from prompt to verified diff, giving the agent a check to run: a test, a linter or a build.
2. Choose a permission mode for a task and say what the agent may do in that mode without asking.
3. Write a short CLAUDE.md (or AGENTS.md) holding the commands and conventions the agent cannot infer from the code.
4. Scope a real task from a hard software-engineering benchmark with your agent, estimate its human time, complexity and specification quality, and compare your estimate with the published figure.

Outcomes 1 and 3 draw on "Best Practices for Claude Code" and the two courses, outcome 2 on Session 1's permission modes, and outcome 4 on the live activity, which replaces v1's nanobot exercise (`notes/benchmark-activity.md`).

Outcomes for Weeks 3 to 5 follow the restructure proposed in `notes/curriculum-v2-second-half.md`, Part 4, which the Week 3, 4 and 5 mockups use. Week 3 there becomes "One change through the whole loop", with outcomes built around taking one lanorme issue through triage, spec, implementation, review and verification while logging human minutes and tokens per stage.

### Time budget

Under the outcomes, one line gives the totals for the selected track: "Pre-work: ~N min core, ~N min optional. Activity: ~N min." Every pre-work row shows its own "~N min". Perceived workload is only weakly related to hours of study and is bound up with surface approaches to learning in a reciprocal relationship [@kember2004]. Reading times use 238 words per minute, the average silent rate for non-fiction [@brysbaert2019], as a floor for technical prose; video and course times come from the player and the catalogue. The mockups use the measured figures from the review. The review reports two and a half to three hours per week before the applied tasks.

### Core and optional pre-work

Core items are the ones the self-check and the session assume. v1 signals order through notes such as "watch first" and "start here", set in the grey that fails contrast. v2 splits each week's list under two headings, each row carrying its own minutes. The split for Weeks 3 and 4 is given item by item in `notes/curriculum-v2-second-half.md`, Part 4, which also retires Week 3's "Re-read Effective Context Engineering": rereading rates as low utility and practice testing as high [@dunlosky2013], so the article returns as an application question in the Week 3 retrieval opener.

### Guiding questions

Each core item carries one or two questions above its link, since prequestions posed before a video improve what learners take from it [@carpenter2017]. We propose drawing them from the reading checks' short-answer items, so the self-check rewards the attention they directed. Examples:

- "No Vibes Allowed" and ACE-FCA: "Why is a bad line of research worse than a bad line of code?"
- "Keep Claude working toward a goal": "Why does 'all tests in `test/auth` pass' work as a goal condition, while 'the code is well architected' does not?"
- "Software Engineering at the Tipping Point": "What does 'amplification is a magnitude and not a direction' imply about a team's fundamentals?"
- "Effective Harnesses for Long-Running Agents": "Which artefacts let a fresh session recover the state of earlier work?"

The talks in Weeks 3 and 4 also get timestamps for their key segments. Median engagement time with MOOC videos was at most about six minutes whatever the video's length [@guo2014], and segmenting a long presentation into learner-paced parts improves learning [@mayer2020].

### Pre-work activity and worked example

The activity card moves from Sessions to the week page unchanged, and its deliverable line links to the rubric so the criteria are visible before the work starts.

Week 3 adds a worked example of the log. Strongly guided instruction outperforms minimal guidance until learners have enough prior knowledge to guide themselves [@kirschner2006], and studying a worked example reduces the cognitive load that conventional problem solving imposes [@sweller2019]. The example is one page from a recorded run on lanorme, one row per stage (triage, spec, implement, review, pull request) with human minutes, tokens and cost, context given, interventions and the judgement each stage needed. Learners who have already run a similar loop gain less from it and can be slowed by it [@kalyuga2003], so it sits in a disclosure, "Show the worked example log", closed by default. Guidance then fades: Week 4 gets a design template for the factory document, and the capstone gets none. `week-3.html` in the mockups shows the format with sample values.

### Self-check

A link under the pre-work opens `#/week/N/check`: five or six questions from the week's reading check, answered from memory, with the answer and its source shown after each attempt. Taking a test produces better long-term retention than restudying [@roediger2006], and retrieval practice holds up in real classrooms [@agarwal2021]. Checks exist for Weeks 3 and 4; Weeks 1 and 2 need short ones. The checks move from Markdown into one data file that the self-check and the run-sheet both read.

### Live session

The section states the plan for the hour and opens with five minutes of retrieval: two or three short-answer questions answered on paper without notes, then discussed. One question each week comes from an earlier week, since distributed practice is the review's other high-utility technique [@dunlosky2013]. A meta-analysis of flipped classrooms found a small positive effect on learning, larger where face-to-face time stayed the same or quizzes were added [@vanalten2019]. The rest of the hour keeps v1's discussion and pair work, which put learners in the interactive mode that ICAP links to the deepest learning [@chi2014]. The section links the session handout (section 5).


### Deliverable and rubric

Each rubric works at three points: the criteria table, shown before the work; a self-assessment against the same criteria before the session, which also frames peer comments; and a link from the work to the following week. The type of feedback and the way it is given make it more or less effective [@hattie2007].

Draft rubrics for the Week 3 stage log, the Week 4 factory design document and the capstone are in `notes/curriculum-v2-second-half.md`, Part 4, each with a developing and a secure level and a "where to next" question per row. The mockups render them under each week's deliverable.

### Track switch

v1 nests a Codex alternative under four rows: "Claude Code 101" and "Claude Code in Action" in Week 1, "Introduction to Agent Skills" and "Introduction to Subagents" in Week 2. v2 replaces the nested "or, with Codex, …" rows with a "Claude Code | Codex" switch in every week header that rewrites those rows and the week's total. The choice persists in `localStorage` and a `?track=codex` parameter, so a facilitator can send a link that opens on the Codex track. A polite live region announces the change.

The switch gives each learner one list and a total that matches their track. In exchange, it hides the other track, so the switch stays in every week header with both tool names visible. Parity holds for nearly every row. "Introduction to Model Context Protocol" is shared by both tracks, and on 9 October 2026 every Claude Code reading had an OpenAI counterpart: "Best practices" and "Custom instructions with AGENTS.md" for Week 1 [@openai-codexbestpractices; @openai-codexagentsmd], "Sandbox" and "Agent approvals & security" for How Claude Code Works [@openai-codexsandbox; @openai-codexapprovals], and the AGENTS.md chain and "Long-running work", which documents Codex's own `/goal`, for the Week 3 guides [@openai-codexlongrunning]. Two matches are partial: Codex's subagents page stands in for both dynamic workflows and Agent Teams [@openai-codexsubagents]. Week 2's "Build skills" is a docs page standing in for a course [@openai-codexskills]. The benchmark estimation activity and the lanorme tasks are written for either agent. A mixed cohort still loses the side-by-side view a facilitator wants when pairing learners across tools, so the run-sheet keeps a table of equivalent features. We recommend the switch with these mitigations.

## 4. Visual and interaction design

### Tokens that carry over

| Token | Value |
|---|---|
| Body | Source Serif 4 |
| Display | Inter, 500 to 700 |
| Metadata | JetBrains Mono, 12 px minimum (v1: 9 to 11.5 px) |
| Column | 820 px maximum; side padding 28 px, 16 px below 640 px |
| Page, surface, border | `#F4F4F4`, `#FFFFFF`, `#E5E5E5` |
| Text, body, step number | `#0A0A0A`, `#262626`, `#525252` |
| Accent | clay orange, for link arrows and the active-navigation bar |

### Contrast

We computed every ratio with the WCAG relative-luminance formula:

```python
def channel(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_):
    r, g, b = (int(hex_[i:i + 2], 16) for i in (1, 3, 5))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)

backgrounds = ("#F4F4F4", "#F0F0F0", "#FAFAFA", "#FFFFFF")
for fg in ("#737373", "#6D6D6D", "#6B6B6B", "#CC785C", "#C86E50"):
    print(fg, *(f"{ratio(fg, bg):.2f}" for bg in backgrounds))
```

| Colour | Role | on `#F4F4F4` page | on `#F0F0F0` card hover | on `#FAFAFA` row hover | on `#FFFFFF` card | Needs |
|---|---|---|---|---|---|---|
| `#737373` | v1 muted | 4.31 | 4.16 | 4.54 | 4.74 | 4.5:1, SC 1.4.3 |
| `#6D6D6D` | lightest passing grey | 4.70 | 4.54 | 4.96 | 5.17 | 4.5:1 |
| **`#6B6B6B`** | **v2 muted** | **4.85** | **4.68** | **5.11** | **5.33** | 4.5:1 |
| `#CC785C` | v1 orange | 2.98 | 2.88 | 3.14 | 3.28 | 3:1, SC 1.4.11 |
| **`#C86E50`** | **v2 orange** | **3.29** | **3.18** | **3.47** | **3.62** | 3:1 |

`#6D6D6D` is the lightest neutral grey that clears 4.5:1 on `#F0F0F0`, by 0.04; `#6B6B6B` leaves a margin of 0.18. `#C86E50` keeps the accent's 15° hue and 52% saturation and lowers HSL lightness from 58% to 55%, so it passes on both hover backgrounds as well as the page [@w3c2024wcag22]. Whether SC 1.4.11 covers an arrow beside link text is a judgement call. The darker orange is barely distinguishable from the old one and also covers the active-navigation underline, a state indicator. The values change in three places: the `palette` object in `src/agentic-swe-course.jsx`, the hard-coded `#737373` in that file's inline `.nav-link` rule, and `--muted` and `--orange` in the `:root` block of `public/slides/slides.css`.

### Type, links and headings

- Metadata rises to 12 px: `OptionalBadge` (9 px), `Label` (10 px), `LinkRow` meta and Further Reading sources (10.5 px), and index numbers, navigation and the Expand all and Collapse all buttons (11 px).
- Links carry a 1 px underline at a 3 px offset by default. The underline is the link's signifier [@norman2013], and v1 shows it only on hover, so a touch user sees it only after tapping.
- Heading levels follow the page: `h1` week title, `h2` sections, `h3` cards. The overview uses `h1` course, `h2` "Weeks", `h3` each week (SC 1.3.1).
- Remaining accordions follow the APG pattern: a `button` inside a heading, with `aria-expanded` and `aria-controls`, and the "+" glyph hidden from assistive technology [@w3capgaccordion] (SC 4.1.2).

### Responsive rules

- Below 640 px, every grid becomes one column, the 76 px indent drops to zero, and the week label moves above the title.
- Section headings and their toggle buttons wrap onto separate lines when space runs out.
- On phones the overview hero holds the `h1`, one sentence and the next-session card; the longer pitch, badge note and disclaimer move below the week list. At 375 × 667 the week list starts within the first screen, and at 320 px nothing scrolls sideways (SC 1.4.10).
- Week pages carry no hero: a one-line header linking home and a row of links to Weeks 0 to 5.

### Motion and targets

Under `prefers-reduced-motion: reduce`, the site drops the `fadeIn` animation, the card lift, the arrow nudge and the "+" rotation, and keeps colour transitions. Every control is at least 24 × 24 CSS px or spaced so a 24 px circle around it touches no other target (SC 2.5.8). By their CSS, the Expand all and Collapse all buttons and the navigation links are under 24 px tall; v2 pads them to 24 px so they pass on size alone, and the track switch segments get a 32 px height.

## 5. Slides

The decks grow denser through the course: the median slide carries 45 words in Session 0 and 118 in Session 4, where 20 of 24 slides exceed 100 words. When a presenter speaks over a slide, on-screen text that duplicates the narration adds load; the coherence and redundancy principles recommend cutting it, and signalling and segmenting help with what remains [@mayer2020]. We recommend a presenter deck per session holding diagrams, quotes and discussion prompts, paired with a self-study handout that holds the prose. Session 3 already leans this way: `session3-appendix.html` holds the invariants and approaches "in full, one slide each", skipped in the twenty-minute run.

As a house rule, a deck's median stays at or below Session 0's 45 words, and any slide over 80 words moves its prose to the handout. The handout is a scrolling page per session in the `slides.css` tokens. The trade-off is that the decks currently double as self-study material, and a sparse deck read alone loses that use, so each deck ships with its handout. Two artefacts per session can drift, so the handout owns the prose and the deck quotes from it.

## 6. Versioning plan

| Option | Preserves | Cost |
|---|---|---|
| (a) Git tag only | the v1 source at a fixed commit | none; cohort links open v2, and slide URLs change content under them |
| (b) Tag plus a frozen `/v1/` snapshot | the source and a working v1 site at `/agentic-se-course-early-2026/v1/` | a second build step in `deploy.yml`, about an hour |
| (c) New repository | v1 untouched at its current URL | a new Pages URL for v2; history and issues split; the README and the decks' closing slides point at the old site |

We recommend (b). The repository name dates the edition, "early 2026", and v2 keeps the readings, so it is the same edition with a new site, at the same URL. v2 honours the v1 hash routes, so a cohort's links into `#/` and `#/further-reading` keep working and `#/sessions` redirects. The snapshot covers what redirects cannot: the old layout for a cohort mid-run, and slide URLs such as `slides/session4.html`, whose content Phase 3 changes. Between the main build and the upload, the workflow builds the tag with its own base:

```yaml
      - uses: actions/checkout@v4
        with:
          ref: v1
          path: v1-src
      - run: npm ci && npx vite build --base=/agentic-se-course-early-2026/v1/ --outDir ../dist/v1
        working-directory: v1-src
```

The `--base` flag overrides the `base` in `vite.config.js`, and the slide links follow it through `import.meta.env.BASE_URL`.

The tag point is the owner's call, because the Codex pairing and the move to `academy.claude.com` URLs are uncommitted. One sequence: the owner commits them to v1 or moves them to the v2 branch; Phase 0 lands on `main` and deploys; `v1` is tagged at that commit; v2 develops on a branch and merges after Phase 2, when the workflow starts building `/v1/`. The alternative tag point, `685820f`, predates both the Codex changes and the accessibility fixes.

## 7. Implementation phases

| Phase | Scope | Effort | Ships to |
|---|---|---|---|
| 0 | Contrast tokens in all three places; 12 px floor; default underlines; one-column grids and no indent below 640 px; heading and toggle wrap; compact mobile hero; heading levels and APG accordions; 24 px targets; reduced motion. Stopgap: render `week.activity` in the Curriculum view | 1 day | v1, now |
| 1 | Additive data model (below); outcomes for six weeks; minutes from the measurement; core and optional; guiding questions; three rubrics; self-checks for Weeks 1 and 2 | 1 day of code, 2 to 3 days of writing | v2 branch |
| 2 | Router with v1 redirects; overview; week page; track switch; self-check page; previous and next links; `/v1/` build step | 3 to 4 days | v2 launch |
| 3 | Facilitator run-sheets; presenter decks and handouts for Sessions 4 and 3, then 1 and 2; "Before Week N" slides replaced by deep links | 1 day, plus 1 to 2 days per deck | after launch |

The schema adds fields to the v1 `weeks` array, so the v1 components keep rendering during the migration. A missing `codex` key means the item is shared by both tracks.

```js
// Optional. ISO dates; a null date hides the "Next session" marker.
const cohort = { name: "Early 2026", sessions: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null } };

const weeks = [
  // Uses v1's Week 3 content to show how existing fields map onto the new schema.
  // The proposed v2 Week 3 content is in notes/curriculum-v2-second-half.md, Part 4.
  {
    id: 3,
    label: "Week 3",                                   // v1
    title: "Working in Complex Codebases",             // v1
    summary: "Six invariants, four approaches and the open debates, tried on a hard task.",
    intro: "Coding agents handle small tasks fluently …",  // v1
    outcomes: [
      "Explain the six invariants and point to where each one held or broke in your own run.",
      "Compare RPI, QRSPI and Conductor by how each gathers truth, shapes intent and executes.",
      // …
    ],
    prework: [
      {
        id: "ace-fca",
        verb: "Read", text: "Advanced Context Engineering for Coding Agents",    // v1
        url: "https://github.com/humanlayer/…/ace-fca.md", note: "HumanLayer · Dec 2025",
        minutes: null,                // number once measured; null renders "~N min"
        tier: "core",                 // "core" | "optional"
        either: "no-vibes",           // paired item; either one fills the slot
        guidingQuestions: ["Why is a bad line of research worse than a bad line of code?"],
      },
      {
        id: "goal",
        verb: "Read", text: "Keep Claude working toward a goal",
        url: "https://code.claude.com/docs/en/goal", note: "Anthropic · Jun 2026",
        minutes: null, tier: "core",
        guidingQuestions: ["Why does 'all tests in test/auth pass' work as a goal condition?"],
        codex: "claude-only",         // shown on the Codex track with a tag
      },
      // Week 1 example: v1 `alt` becomes
      // codex: { verb: "Complete", text: "Get Started with Codex", url: "…", note: "OpenAI", minutes: null }
    ],
    activity: {                       // v1 fields: title, description, detail, steps, deliverable
      title: "Pick an Approach, Try It on a Hard Problem",
      minutes: null,
      workedExample: { title: "An annotated RPI log", src: "examples/week3-log.html" },
      rubric: "week3-log",
    },
    selfCheck: "week3",
    session: {
      summary: "We compare what people did across different approaches …",   // v1 `session`
      retrieval: ["week3.q6", "week3.q21", "week2.q1"],   // two from this week, one from earlier
      liveActivity: null,             // v1
      handout: "session3-notes.html",
    },
    facilitator: {
      slides: "session3.html",        // v1 `slidesPath`
      appendix: "session3-appendix.html",
      check: "week3",
      plan: [
        { minutes: 5, item: "Retrieval opener" },
        { minutes: 20, item: "Review deck" },
        { minutes: 35, item: "Compare logs across approaches" },
      ],
    },
  },
  // Week 5: v1 `successCriterion` and `deliverableNote` map to activity.deliverable and rubrics.capstone.
];

const rubrics = {
  "week3-log": {
    whereAmIGoing: [{ criterion: "Task framing", meets: "…", strong: "…" } /* … */],
    howAmIGoing: "Before the session, mark each criterion and cite the log entry that shows it.",
    whereToNext: "Which of these steps would you hand to a harness?",
  },
};

const checks = {
  week3: [
    { id: "q4", part: 2, kind: "choice", prompt: "What do the three phases of RPI stand for?",
      options: ["Read, Process, Iterate", "Research, Plan, Implement", "…"], answer: 1, source: "ACE-FCA" },
    { id: "q6", part: 2, kind: "short", prompt: "…", answer: "…", source: "ACE-FCA, leverage asymmetry" },
  ],
};
```

## 8. Open questions for the owner

1. Week 3 has two applied tasks. "Pick an Approach, Try It on a Hard Problem" (site) delivers a log and a reflection. "Ship a Real PR to lanorme" (slide 13) delivers a PR link, the workflow script and a paragraph, and reading-check question 24 assumes it. Which is the deliverable, and does the other become an after-session task?
2. Does the v1 tag include the uncommitted Codex pairing and Claude Academy links, or sit at `685820f`?
3. The reading checks were written "to confirm people actually read"; this design uses them as low-stakes retrieval practice with answers shown. Should full answer keys appear in the facilitator layer, given that the site and `notes/` are public?
4. Will the site serve one dated cohort at a time? If so, who maintains `cohort.sessions`, and what does the overview show between cohorts?
5. Do the core and optional drafts for Weeks 3 and 4 stand, including the talk-or-write-up pairs?
6. Should Codex learners get guidance for the nanobot and lanorme tasks, which name Claude Code?
7. Does the Session 3 handout replace `session3-appendix.html` or sit beside it?

## References
