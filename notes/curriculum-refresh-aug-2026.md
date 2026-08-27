# Week 3 and 4 refresh, August 2026

A currency check on the Week 3 and Week 4 pre-work, run on 20 August 2026. The
last content commit was 10 June 2026, so the window under review is 10 June to
20 August. Dates below come from the publisher's own page. Where a page carries
no date, it appears under "Unverified" at the end.

Nothing under `src/` or `public/` has been changed. This is a proposal.

## Summary

Weeks 3 and 4 have aged better than expected. Every link resolves, both Claude
Code docs are current and have grown since they were cited, and Anthropic's
engineering blog has published nothing usable since April.

What needs work is smaller and more specific:

- The Agent Teams doc describes a feature that is disabled by default. Students
  following the current note will find that nothing happens.
- Two publication dates on the site are wrong, and a third is disputed.
- Week 3 spends four of its nine items on one thread, and Week 4 spends three of
  its eight on another.
- One Week 4 source is a pseudonymous gist.
- Anthropic's parallel-Claudes C compiler post covers Week 4's own subject
  matter and has been available since February.

## Link health

Fifteen of the seventeen links return 200 and land where they claim. The two
`openai.com/index/` links return 403 to automated fetchers, matching the
bot-blocking already recorded in `session4-sources.md`. A browser reaches both.

## Date errors

All three are now settled. Resolved 27 August 2026.

| Where | Was | Correct | Status |
|---|---|---|---|
| Week 3, Effective Context Engineering | Anthropic · May 2025 | 29 September 2025 | Applied in 82efbbc |
| Further reading, Scaling Managed Agents | Anthropic · Feb 2026 | 8 April 2026 | Applied in 82efbbc |
| Week 4, OpenAI Harness Engineering | Feb 2026 | 11 February 2026 | Already correct |

The first two corrections come from Anthropic's engineering index. The full
title of the second is "Scaling Managed Agents: Decoupling the brain from the
hands".

The OpenAI conflict was a mix-up between two different OpenAI posts. Harness
Engineering is 11 February 2026 by Ryan Lopopolo; the 27 April 2026 date with
named authors belongs to Symphony (Alex Kotliarskyi, Victor Zhu and Zach
Brock), which the site already dates to April 2026. Four independent sources
put the harness post on 11 February 2026: the user paste recorded in
`session4-sources.md`, Jay Taylor's saved copy at
`jaytaylor.com/notes/node/1770842156000.html` whose node ID is a Unix
millisecond timestamp decoding to 11 February 2026 20:35 UTC, the
AkihikoWatanabe paper-notes entry titled "Ryan Lopopolo, 2026.02", and InfoQ's
coverage published 21 February 2026 under `/news/2026/02/`.

The page itself stayed unreadable. `openai.com` returns 403 to command-line
fetchers, the pre-installed Chromium cannot tunnel through this session's
egress proxy, and `web.archive.org` is blocked by egress policy, so the
confirmation is from secondary sources rather than the publisher's own page.

## Week 3, item by item

Week 3 carries nine pre-work items. Week 4 carries eight, Week 2 five, Week 1
two, and Week 5 lists thirty as capstone resources.

| Item | Verdict |
|---|---|
| No Vibes Allowed (Horthy, Dec 2025) | Keep. The anchor talk. |
| ACE-FCA write-up (HumanLayer, Dec 2025) | Keep. Companion to the above. |
| No More Slop (Horthy, 2026) | Keep. Horthy revising his own framework is what the three-item arc builds to. |
| From RPI to QRSPI (Lavaee) | Prune candidate. A third-party summary of the talk directly above it, on a personal blog, and the only Week 3 item whose content is contained in another item. Costs more than a delete: see fallout below. |
| Conductor (Google, Dec 2025) | Keep. Released 17 December 2025 in preview and not superseded. A Google codelab walking a full greenfield project went up in April 2026 and would work better as a hands-on companion than more reading. |
| Effective Context Engineering (Anthropic) | Keep, fix the date. |
| Large codebases doc (Anthropic) | Keep. |
| Dynamic workflows doc (Anthropic) | Keep. |
| Keep Claude working toward a goal (Anthropic) | Keep. `/goal` still exists and the page has grown to cover the evaluator model, check-in intervals, and `CLAUDE_CODE_GOAL_CHECKIN_MINUTES`. |

The three Claude Code docs are reference material. Grouping them as one line
with three links would take the apparent load from nine items to seven while
removing nothing.

**Fallout if QRSPI goes.** `session3-reading-check.md` names it as item 4 in the
opening list, devotes Part 3 to it (questions 8, 9 and 10), cites it in the
cross-source question 22, and keys four answer-key entries to it. Line 15
explains that the Horthy talks are checked *through* their paired write-ups, so
removing the summary removes the mechanism the reading check uses to test the
talk. The session 3 deck also calls RPI, QRSPI and Conductor "the same shape,
different dress". Pruning this item means rewriting a reading-check section and
a deck claim.

## Week 4, item by item

| Item | Verdict |
|---|---|
| Bender, Tipping Point | Keep. The strategic frame, and the most recent addition. |
| Effective Harnesses (Anthropic, 26 Nov 2025) | Keep. |
| OpenAI Harness Engineering | Keep, settle the date. |
| Symphony (OpenAI, Apr 2026) | Keep. |
| Lopopolo talk | Prune candidate. The site's own note describes it as a synthesis of the OpenAI post, making three items on one thread out of eight. |
| Hassan et al. research roadmap (Sep 2025) | Keep. At eleven months it is the oldest framing in the week. |
| Verified Spec-Driven Development (Doll, Mar 2026) | Prune candidate on provenance: a pseudonymous GitHub gist, the only source in the course with neither institutional nor named-practitioner backing. |
| Agent Teams doc (Anthropic) | Keep, annotate. |

**The Agent Teams annotation.** The feature is experimental and disabled by
default, requiring `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings or the
environment. The page documents behaviour as of v2.1.178 and lists limitations
around session resumption and shutdown. One clause in the note saves a cohort
from a dead end.

**Fallout if the Lopopolo talk goes.** `session4-reading-check.md` names it as
item 5, pairs it with the OpenAI post in Part 3, and draws questions 11, 12 and
13 from the talk alone. Question 12 quotes it verbatim and question 13 depends
on the fuzzy-compiler analogy, which the post leaves implicit. Three questions
and three answer-key entries would need replacing.

**Fallout if the Doll gist goes.** It is section 6 of `session4-sources.md` and
appears as a named item on slide s16 of the session 4 deck. It also supplies one
pole of the open-debate slide at line 535, where its rigid phase pipeline is set
against Symphony's argument that "models can solve bigger problems than the box
we try to fit them in." Removing it leaves that debate with one side. Keeping it
and marking the provenance in the note is the cheaper option.

## Published in the review window

**Lilian Weng, "Harness Engineering for Self-Improvement"**, Lil'Log, 4 July
2026. <https://lilianweng.github.io/posts/2026-07-04-harness/>
A synthesis of roughly 35 papers, about 31 minutes. It locates recursive
self-improvement in the harness and treats the weights as one layer among
several, organising the field into design patterns, harness optimisation, and
joint optimisation with weight updates. The control argument is what earns it a
place in Week 4: the evaluator and permission layer must sit outside the loop
that evolves the harness, because a system able to modify its own evaluator learns to fool it.
It also subsumes the Meta-Harness and Hyperagents entries currently sitting in
further reading, which would let two items collapse into one.

**LangChain, "Evaluating code review agents with ReviewBench"**, 31 July 2026.
Agent-to-agent code review is load-bearing in the OpenAI harness reading, and
the course has no way to measure it.

**LangChain, "Why managed agents are the next big thing in agent building"**
(Harrison Chase), 12 August 2026. A practitioner counterpart to Anthropic's
Scaling Managed Agents, which already sits in further reading.

**LangChain, "Building monday.com Sidekick"**, 11 August 2026, 14 minutes. A
deployment report in the same genre as the Stripe Minions pieces.

Anthropic's engineering index shows 23 April 2026 as its most recent dated post,
so the Anthropic readings in both weeks are as current as the blog allows. One
featured post on that index carries no date; see Unverified.

## Material that predates the last update

These were all available when the weeks were written.

**Anthropic, "Building a C compiler with a team of parallel Claudes"**,
5 February 2026. Sixteen parallel Claude instances over roughly 2,000 sessions
and two weeks, producing a 100,000-line Rust C compiler that builds Linux 6.9 on
x86, ARM and RISC-V, with coordination through file locks in a `current_tasks/`
directory. Its three lessons track the Week 4 activity closely: write extremely
high-quality tests, because agents solve whatever the verifier defines; write
feedback for the agent to read; introduce external oracles to decompose
bottlenecked work. This is the most concrete account of multi-agent
coordination available, and Week 4 is the week about multi-agent coordination.

**Birgitta Böckeler, "Harness engineering for coding agent users"**,
martinfowler.com, 2 April 2026, Thoughtworks. Splits the harness into
feedforward controls that prevent problems and feedback controls that catch
them, across deterministic and inferential tooling. The most practitioner-facing
treatment of Week 4's material, and the one most likely to survive contact with
a student's actual job.

**Galster et al., "Harness Engineering for Agentic AI Coding Tools: An
Exploratory Study"**, arXiv 2602.14690, submitted 16 February 2026, revised
30 June 2026. Eight configuration mechanisms measured across 2,853 GitHub
repositories. Context files dominate and are often the only mechanism used;
AGENTS.md is emerging as the interoperable standard; skills and subagents are
rare, and the skills that exist are mostly static instructions. The Week 4
activity asks students what belongs in CLAUDE.md/AGENTS.md, and this measures
what practitioners actually do. It also gives the week a data point to argue
with.

**Lin et al., "Agentic Harness Engineering"**, arXiv 2604.25850, submitted
28 April 2026, revised 18 May 2026. Terminal-Bench 2 from 69.7% to 77.0% over
ten iterations, with evolved components transferring across model families.

## Promotions available from further reading

These items already sit in `furtherReading` and would strengthen the weeks with
no new sourcing:

- Stripe Minions parts 1 and 2 into Week 4 as the deployment report. Lenny's
  Newsletter interviewed Steve Kaliski on 25 March 2026, updating the figure to
  roughly 1,300 PRs per week and adding that Stripe runs Goose as the harness
  and that non-engineers now ship code through it.
- Harness Design for Long-Running Application Development (24 March 2026) into
  Week 4, beside Effective Harnesses.
- Scaling Managed Agents into Week 4 if the LangChain managed-agents post goes
  in, so the two read together.

## On the harness engineering term

The research turned up wider usage of the term than the single OpenAI post.
Böckeler builds an April 2026 article around it, Weng titles a July 2026 post
with it, and Galster et al. use it as the name of a research object in a paper
revised in June 2026. Böckeler attributes the underlying "Agent = Model +
Harness" framing to LangChain.

If the term is worth keeping somewhere in the site, attribution to a named
source would hold up.

## Unverified

- **OpenAI harness engineering publication date.** February and April 2026 both
  claimed. The page is 403-blocked to automated fetchers.
- **"How we contain Claude across products."** Featured without a date on
  Anthropic's engineering index. The guessed URL returned 404, so it could fall
  inside the review window.
- **"Codex as a platform"** on developers.openai.com carries no date and
  references a changelog entry dated 7 July 2026.
- **"Unlocking the Codex harness: how we built the App Server"**, OpenAI. Exists
  and is relevant to Week 4. Date unconfirmed.
- **Meta Muse Code (August 2026), Block Goose in Buzz (July 2026), Amazon
  CloudWatch Coding Agent Insights (July 2026).** Each appeared only in
  aggregator blogs.
- **Claude Opus 5.** A system card dated 24 July 2026 appears in search results.
  Worth confirming before the course refers to current models.
- **The four YouTube items.** All return 200, which does not establish that the
  videos still play.

---

## Skilljar catalogue, checked 20 August 2026

Read from the public course pages at anthropic.skilljar.com. Lecture counts and
prerequisites are quoted from those pages.

### Claude Code in Action has been rewritten

Week 1 cites this as its intro course, noted "Anthropic · Mar 2026 · includes
exercises". The current course is a different thing:

- Nine lectures, certificate of completion.
- Stated prerequisite: "You already use Claude Code for single prompts."
- Stated audience: "Developers who already use Claude Code for single prompts
  and want to move to longer, less supervised, team-wide workflows."
- Subtitle: "Run long, hands-off Claude Code sessions you can trust: steer,
  configure, automate, and verify".

Its four sections are Steer the Work (plan mode, directed compaction, rewind,
`/goal` and `/loop`), Configure Claude (lean CLAUDE.md, skills, permission
modes, hooks), Automate Repeat Work (scheduled routines, headless with
structured output, managed code review and the GitHub action), and Verify and
Share (verification proportional to supervision, hooks gating on test results,
packaging a setup as a plugin).

A course that requires prior Claude Code use no longer works as the Week 1
entry point.

### Claude Code 101 fits Week 1

Twelve lectures, 1.5 hours of video, one quiz, certificate. Prerequisites are
basic editor and command-line familiarity plus a Claude account, and the page
states "No prior experience with AI tools is assumed." The audience is new
developers and "experienced engineers curious about coding agents but who
haven't taken the plunge yet."

Sections: What is Claude Code? (the agentic loop, tools, permissions); Your
first prompt (installing across terminal, VS Code, JetBrains, Desktop and web;
approval mode, auto-accept, Plan Mode); Daily workflows (Explore, Plan, Code,
Commit; `/compact`, `/clear`, `/context`; code review); Customizing Claude Code
(CLAUDE.md, subagents, skills, MCP servers, hooks).

This matches what Week 1 says it does.

### Proposed placement

- Week 1: Claude Code 101 replaces Claude Code in Action.
- Claude Code in Action moves to Week 3, where long-session steering,
  compaction and `/goal` are already the subject. Its Configure section overlaps
  Week 2 and its Automate section overlaps Week 4, so Week 3 is the closest
  single home.
- Week 2 keeps the three Intro courses. Claude Code 101's fourth section
  introduces CLAUDE.md, subagents, skills, MCP and hooks, so the Intro courses
  become the depth pass over material Week 1 has already introduced.

### Hooks are uncovered

No item in the course teaches hooks. Both Claude Code 101 and Claude Code in
Action cover them, so either placement closes the gap.

### Two stale lines follow from the swap

- The Week 1 pre-work note reads "Mar 2026 · includes exercises". Claude Code
  101 advertises one quiz, and Claude Code in Action advertises nine lectures.
  Neither lists exercises.
- The Week 1 session line reads "We share what we tried during the course
  exercises."

### Considered and not proposed

- **Model Context Protocol: Advanced Topics.** Fifteen lectures, 1.1 hours, two
  quizzes, covering sampling, notifications, transports and production
  deployment. Aimed at people implementing MCP servers rather than wiring them
  up.
- **Introduction to Claude Cowork.** Covers the Cowork task loop and file and
  research workflows, outside this course's scope.
- Claude 101, Claude Platform 101, Building with the Claude API, and the AI
  Fluency family are all in the catalogue and out of scope.
