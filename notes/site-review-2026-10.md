---
title: "Agentic SE Course site: design and learning-science review"
date: 2026-10-09
bibliography: references.bib
link-citations: true
---

## Summary of findings

We reviewed the published site (`src/agentic-swe-course.jsx`), the five slide decks in `public/slides/` and the reading checks in `notes/`, measuring where a standard gives a number and reading against the instructional-design literature where it does not. The course design itself is sound: an inverted classroom with an interactive live hour, a progression from guided exercises to an unguided capstone, and readings framed for critical comparison. The problems sit in how the site presents that design.

1. The page fails WCAG 2.2 at AA in three areas: reflow on phones, text contrast for all metadata, and accordion semantics [@w3c2024wcag22]. These are bugs and can ship to v1 now.
2. The Week 3 and Week 4 pre-work activities appear only in the Sessions view, which describes itself as material for running the course. A learner reading the Curriculum view sees the readings for those weeks and none of the work.
3. No week states what a learner should be able to do by the end of it, and no week states how long its pre-work takes. We measured two and a half to three hours per week, before the applied tasks in Weeks 3 and 4.
4. Retrieval practice, the best-supported technique in the review literature [@dunlosky2013], exists in `notes/` as two reading checks that the site never links and the sessions never use.
5. The deliverables in Weeks 3 to 5 have no rubric, so learners get no shared statement of what good work looks like.
6. Slide text density rises through the course, from a median of 45 words per slide in Session 0 to 118 in Session 4.

Findings 1 and 6 are presentation fixes. Findings 2 to 5 change the shape of a week, and they are the case for a v2.

## Part 1: The page fails WCAG 2.2 in three areas

### The layout overflows on phones

We loaded the site in a 375 px viewport. The document measured 414 px wide, so the page scrolls sideways. SC 1.4.10 requires content to reflow at 320 CSS px without two-dimensional scrolling [@w3c2024wcag22]. The cause is the two-column grid holding the Prerequisites and Our Tool cards (`gridTemplateColumns: "1fr 1fr"`), which never collapses; the Bibliography grid has the same rule. The week bodies also carry a fixed `paddingLeft: 76px`, which leaves a text column of roughly 250 px on a phone, and the "Curriculum" heading runs into the Expand all and Collapse all buttons. The hero text occupies about a screen and a half before the navigation appears.

### Metadata text falls below the contrast minimum

The muted grey `#737373` reaches 4.74:1 on the white cards but 4.31:1 on the page background `#F4F4F4` and 4.16:1 on the hover background `#F0F0F0`. SC 1.4.3 requires 4.5:1 for text at these sizes [@w3c2024wcag22]. The colour carries the duration and source notes on every pre-work row, the section labels, the inactive navigation links and the currency disclaimer, all set at 10 to 11 px in a monospace face. The text a learner needs for planning is the hardest text on the page to read.

The clay-orange link arrow `#CC785C` measures 2.98:1 on the page background, just under the 3:1 that SC 1.4.11 sets for non-text contrast. Whether the arrow counts as required to identify the link is a judgement call, since the row layout also signals a link. Links carry no underline until hovered.

### The accordions expose no state to assistive technology

The curriculum view contains one `h1` and two `h2` headings. Week titles are text inside `<button>` elements, cards use `h5` with no `h3` or `h4` above them, and no button carries `aria-expanded`. The WAI-ARIA accordion pattern places each header button inside a heading of the right level and gives it `aria-expanded` and `aria-controls` [@w3capgaccordion]. Without them, a screen-reader user cannot navigate by week or hear whether a week is open, which bears on SC 1.3.1 and SC 4.1.2 [@w3c2024wcag22].

## Part 2: A learner has to assemble each week from two views

The site splits content across a Curriculum view (intro and pre-work list) and a Sessions view (live-session plan, activities, slides). For Weeks 0 to 2 the split follows the audience: learners read Curriculum, facilitators read Sessions. Weeks 3 and 4 break it. Their pre-work activities ("Pick an Approach, Try It on a Hard Problem" and "Harness Design Document") are tasks learners must complete before the session, with deliverables they must bring, yet `CurriculumWeekCard` never renders `week.activity`. Only `SessionWeekCard` does.

Information a learner needs at the same moment should sit in the same place: integrating material split across locations costs working memory that would otherwise go to the material itself [@sweller2019]. The split also hides the activity from discovery entirely, which is the more serious failure in Norman's terms: the learner gets no signifier that the work exists [@norman2013].

Every accordion starts closed, so the landing view shows six week titles and no content. Accordions suit pages where people need only a few sections; they add interaction cost when people need most of the content [@wang2023accordions]. A learner in Week 3 needs one week in full. The site has no notion of a current week, and its three hash routes (`#/`, `#/sessions`, `#/further-reading`) give no way to link to a single week. Nielsen's first heuristic, visibility of system status, applies directly: the page never tells the learner where the cohort is [@nielsen1994].

## Part 3: The learning design is sound and under-specified on the page

### Strengths the site already has

The live hour is built around discussion and pair work, which puts learners in the interactive mode that ICAP associates with the deepest learning [@chi2014]. The arc from a demonstrated install in Week 0, through pair exercises on nanobot, to the unguided capstone matches the guidance-fading that cognitive load research recommends as expertise grows [@kalyuga2003; @kirschner2006]. The Week 3 activity ends with a reflection paragraph, and the Further Reading page tells readers to read the annotations critically.

### No week states its outcomes

Each week opens with a paragraph of motivation. None says what a learner will be able to do afterwards, and only the capstone has a success criterion. Constructive alignment starts from intended outcomes and then chooses activities and assessment tasks that exercise those outcomes [@biggs1996]. Stated outcomes would also give each deliverable something to be judged against (see below). The intros already imply the outcomes; Week 2's paragraph, for example, names skills, MCP and context engineering, which translate directly into "write a SKILL.md that triggers on the right tasks" and "connect an MCP server and explain what it adds to the agent's context".

### No week states its workload

The site gives no time per item and no total per week. We measured the pre-work at an average silent reading rate of 238 words per minute [@brysbaert2019], with video lengths taken from the players and course lengths from their catalogue pages.

| Week | Items | Claude track (min) | Codex track (min) | Not measured |
|---|---|---|---|---|
| 1 | 3 | 172 | 192 | none |
| 2 | 5 | 189 | 189 | none |
| 3 | 9 | 143 | 143 | the pre-work activity |
| 4 | 8 | 149 or more | 149 or more | two openai.com posts, which block automated fetches; the pre-work activity |

Each week asks for two and a half to three hours of pre-work against a one-hour live session. Weeks 1 and 2 are the heaviest by time because the courses dominate them. Weeks 3 and 4 carry the most items and add an applied task on top, so they are likely the heaviest in practice. For the Week 4 paper we counted the SASE framework sections (about 20 minutes); the full paper runs to about 64.

In five case studies, perceived workload was only weakly related to hours of study; content, difficulty, the type of assessment and relationships in the course shaped it, and it was bound up with surface approaches to learning in a reciprocal relationship [@kember2004]. Weeks 3 and 4 are also the weeks without a core and optional split; ordering cues such as "watch first" and "start here" live in the grey metadata that fails contrast.

### Retrieval practice exists and goes unused

`notes/session3-reading-check.md` and `notes/session4-reading-check.md` hold 24 questions each, roughly 25 minutes, with answer keys. Neither is linked from the site, and the session plans do not open with them. Practice testing is one of two techniques rated high utility across ten reviewed techniques [@dunlosky2013], taking a test produces better long-term retention than restudying [@roediger2006], and the benefit holds in real classrooms across ages and subjects [@agarwal2021]. In flipped classrooms specifically, a meta-analysis found a small positive effect on learning outcomes, larger where face-to-face time stayed the same or quizzes were added [@vanalten2019]. The reading checks, cut to five or six questions, would give each live hour a retrieval opening and give the facilitator a reading on who did the pre-work.

Week 3 asks learners to "Re-read" Effective Context Engineering with RPI in mind. Rereading is one of the low-utility techniques in the same review [@dunlosky2013]; three questions that make the learner apply the article to RPI would do the same job as retrieval.

### Guiding questions would focus the long videos

Weeks 3 and 4 include four conference talks. Learners who answered prequestions before a video scored higher on a later test, for both the prequestioned content and the rest of the video [@carpenter2017], and median engagement time with MOOC videos was at most about six minutes whatever the video's length [@guo2014]. A line under each talk naming two questions to answer, plus timestamps for the sections that matter, would cost little.

### Week 3 asks for a log without showing one

The Week 3 activity asks learners to run an approach on a hard problem and keep a log of context given, compactions, verification and interventions. It shows no example of such a log. Strongly guided instruction outperforms minimal guidance until learners have enough prior knowledge to guide themselves [@kirschner2006], and studying a worked example reduces the cognitive load that conventional problem solving imposes [@sweller2019]. A one-page annotated log from a real run, ideally on the lanorme repository the slides already use, would serve as that example.

### Deliverables have no rubric

Week 3's log and reflection, Week 4's harness design document and the capstone repository each carry a deliverable statement and no criteria. Feedback is among the strongest influences on learning, and the type of feedback and the way it is given make it more or less effective [@hattie2007]. A short rubric per deliverable, written against the week's outcomes, tells learners what good work looks like before they start and gives peers a shared basis for feedback in the live session.

## Part 4: Slide density rises through the course

We counted the words on each slide. The median rises from 45 words per slide in Session 0 to 76, 89, 102 and 118 in Sessions 1 to 4. In Session 4, 20 of 24 slides carry more than 100 words. When a presenter speaks over slides, extraneous on-screen text competes with the narration, and the coherence and redundancy principles recommend cutting it [@mayer2020]. The trade-off is real here: the decks are published on the site and plausibly serve as self-study material for anyone who misses a session. Splitting each deck into a sparse presenter version and a handout preserves both uses.

## Part 5: Version 1 and version 2

The accessibility fixes in Part 1 change no content and benefit every current reader, so they belong in v1 now. The changes in Parts 2 and 3 alter the shape of a week: one page per week, outcomes, time budgets, rubrics and a separated facilitator layer. That is the case for a v2.

We recommend tagging the current state as `v1` in git and keeping a frozen copy reachable at `/v1/`, built with its own Vite `base`, so links held by a running cohort keep working. A tag alone preserves the source but gives readers nothing to open; a new repository splits the history for little gain. The `/v1/` copy needs a second build step in the Pages workflow, which only builds `main` today.

One decision sits with the owner. The Codex pairing and the Claude Academy link move are uncommitted, so the v1 tag can point either at `685820f` (before them) or at a new commit that includes them.

## Recommendations, ranked

| # | Change | Evidence | Effort | Ships in |
|---|---|---|---|---|
| 1 | Collapse both grids below 640 px, drop the 76 px indent on mobile, stack the Curriculum heading | SC 1.4.10 [@w3c2024wcag22] | 1 h | v1 |
| 2 | Darken muted text to pass 4.5:1 on `#F4F4F4` and `#F0F0F0`; set metadata at 12 px minimum | SC 1.4.3 [@w3c2024wcag22] | 1 h | v1 |
| 3 | Week titles as headings, `aria-expanded` and `aria-controls` on accordion buttons, fix the `h5` hierarchy | SC 1.3.1, 4.1.2 [@w3c2024wcag22; @w3capgaccordion] | 2 h | v1 |
| 4 | Render `week.activity` in the Curriculum view | split attention, discoverability [@sweller2019; @norman2013] | 30 min | v1 |
| 5 | One page per week with a deep link, current week open by default | [@nielsen1994; @wang2023accordions] | 1 to 2 days | v2 |
| 6 | Three or four outcomes per week, aligned to activity and deliverable | [@biggs1996] | half a day of writing | v2 |
| 7 | Minutes per item and per week; core and optional split for Weeks 3 and 4 | [@kember2004; @brysbaert2019] | half a day | v2 |
| 8 | Five-question retrieval opener per session, drawn from the reading checks; replace "Re-read" with application questions | [@dunlosky2013; @roediger2006; @agarwal2021; @vanalten2019] | 1 day | v2 |
| 9 | Two guiding questions and timestamps per talk | [@carpenter2017; @guo2014] | 2 h | v2 |
| 10 | Annotated example log for Week 3 | [@kirschner2006; @sweller2019] | half a day | v2 |
| 11 | Rubric per deliverable, written against the week's outcomes | [@hattie2007; @biggs1996] | half a day | v2 |
| 12 | Presenter deck and handout split for Sessions 3 and 4 | [@mayer2020] | 1 to 2 days | v2 |

The v2 information architecture, tokens and week-page anatomy are specified in `notes/design.md`. A currency audit and a proposed restructure of Weeks 3 to 5, built around the software-factory framing from AI Engineer World's Fair 2026, are in `notes/curriculum-v2-second-half.md`.

## References
