---
title: "Agentic SE Course: rethinking Weeks 3 to 5"
date: 2026-10-09
bibliography: [references.bib, readings.bib]
link-citations: true
---

## Summary of findings

We checked every Week 3 to 5 item on 9 October 2026 and searched for primary sources published since June 2026 that bear on Zach Lloyd's claim that software engineering is becoming factory engineering [@lloyd2026factory].

- Every link still resolves. One item is dated: the Conductor post introduces an extension for Gemini CLI, which stopped serving consumer requests on 18 June 2026 [@ballinger2025conductor; @lyalin2026antigravity]. Four more carry stale titles, venues or version pins, and a comparison page has replaced the Agent Teams doc as the entry point for parallel agents. The three Claude Code docs in Week 3 are current. The capstone brief, a greenfield build with no measure of cost, has aged most.
- Lloyd's framing is shared well beyond Warp. AI Engineer World's Fair 2026 ran a track titled "Software Factories", which included Uber's account of its own factory [@medisetty2026uber]. Dex Horthy, whose talks anchor Week 3, argued there that lights-off factories fail [@horthy2026factoriesfail]. Anthropic published an SDLC playbook built on the same loop [@claxton2026playbook] and a companion on securing it [@clinton2026secure].
- Claude Code and Codex now document the parts a small factory needs: non-interactive runs, GitHub Actions, scheduled routines and managed review [@cc-headless; @cc-ghactions; @cc-routines; @cc-codereview; @openai-codexaction; @openai-codexexec].
- We recommend threading the second half through one repository and one measurement. Learners run a lanorme issue through the delivery loop by hand in Week 3, design the automated loop in Week 4, and build it in the capstone. The capstone reports human minutes and cost per merged change against each learner's own Week 3 baseline.

## Part 1: Currency audit of Weeks 3 to 5

We fetched each item with curl and read YouTube metadata from the watch page and its oEmbed record. The Wayback Machine refused our requests for archived June copies, so we compared each Claude Code page against the answer key of the June reading check. Both openai.com pages returned HTTP 403 to curl and to WebFetch, so we took their title, author and date from OpenAI's own news RSS feed.

| Item | Verdict | Evidence, 9 October 2026 |
|---|---|---|
| No Vibes Allowed, Horthy | Current | Plays. AI Engineer Code 2025, published 2 December 2025, 20 min 31 s [@horthy2025novibes]. |
| ACE-FCA write-up, HumanLayer | Current | Last commit to the file 3 December 2025. Its heading reads "Getting AI to Work in Complex Codebases" [@humanlayer2025acefca]. |
| "No More Slop: What We Got Wrong About RPI" | Dated metadata | The video is titled "Everything We Got Wrong About Research-Plan-Implement" on the AAIF Live channel, a keynote at the Coding Agents Conference on 3 March 2026 [@horthy2026rpi]. The site credits AI Engineer. |
| From RPI to QRSPI, Lavaee | Current | Dated 26 March 2026 [@lavaee2026qrspi]. |
| Conductor, Google | Dated | The post introduces a Gemini CLI extension [@ballinger2025conductor]. Google moved Gemini CLI to Antigravity CLI on 19 May 2026 and ended consumer service on 18 June [@lyalin2026antigravity]. Conductor's README now calls it a plugin for Antigravity and Claude Code [@conductor2026plugin]. |
| Effective Context Engineering, Anthropic | Current | 29 September 2025 [@rajasekaran2025context]. Also a Week 2 item. |
| Large-codebases doc | Current | Covers nested CLAUDE.md files, sparse worktrees, per-directory skills and centralising conventions; its version notes run to v2.1.211 [@cc-largecodebases]. |
| Dynamic workflows doc | Current, one change | Available on all paid plans, with a toggle on Pro; limits of 16 concurrent and 1,000 total agents unchanged [@cc-workflows]. Workflow subagents now take their permission mode from the subagent rules, so reading-check question 23, which says they always run in `acceptEdits`, is out of date. |
| /goal doc | Current | The evaluator still judges only what the conversation shows. The page documents `claude -p "/goal ..."` for non-interactive runs and compares `/goal`, `/loop` and Stop hooks [@cc-goal]. |
| Software Engineering at the Tipping Point, Bender | Current | Google I/O 2026, published 21 May 2026, 39 min 39 s [@bender2026tipping]. |
| Effective Harnesses, Anthropic | Current | 26 November 2025, by Justin Young [@young2025harnesses]. |
| Harness Engineering, OpenAI | Current, unreadable by fetch | 403. The RSS feed gives 11 February 2026, by Ryan Lopopolo [@lopopolo2026harness], which settles the date dispute recorded in the August refresh. |
| Symphony, OpenAI | Dated metadata | 403. The feed title is "An open-source spec for orchestration: Symphony", 27 April 2026 [@openai2026symphony], which differs from the site's title. |
| Lopopolo talk | Dated metadata | Retitled "Harness Engineering: How to Build Software When Humans Steer, Agents Execute". The event is AI Engineer Europe 2026; the site says London [@lopopolo2026talk]. |
| SASE paper, Hassan et al. | Dated link | The site pins version 2. Version 3 appeared on 24 June 2026 with copy edits, the same sections, and the Merge-Readiness and Consultation Request Packs intact [@hassan2026sase]. |
| Verified Spec-Driven Development | Current | Revision history ends on 28 February 2026 [@doll2026vsdd]. |
| Agent Teams doc | Current status, superseded as the entry point | Still experimental, off by default, behind `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` [@cc-agentteams]. Retitled "Orchestrate teams of Claude Code sessions". The page opens by pointing readers to lighter options, a separate page compares five ways to run agents in parallel [@cc-parallel], and teammates do not spawn under `-p`. |
| Week 5 capstone brief | Framing dated | A greenfield project built harness-first, with no measure of cost. The OpenAI source behind the harness framing warns that its results "should not be assumed to generalize without similar investment" [@lopopolo2026harness], as recorded in `notes/session4-sources.md`. |

The Anthropic engineering blog's newest dated post is still 23 April 2026, so the Anthropic readings remain as current as that blog allows. Anthropic's recent SDLC material appears on the Claude blog instead.

## Part 2: Sources published since June 2026

### Software factories became a conference track

The World's Fair 2026 schedule places Lloyd's talk on the main stage on 30 June in the "Software Factories" track, under the working title "Self-Improving software factories: The new open source model". Uday Kiran Medisetty and Adam Huda presented Uber's factory at 11:40 the same day [@medisetty2026uber], which matches Lloyd's mention of an earlier talk that day by a friend named Adam on Uber's internal version. Lloyd's own factory is public at build.warp.dev [@warp2026build].

The talks around Lloyd's supply most of the counter-evidence the course needs:

- Uber's demonstrated workflow stops at a draft pull request before CI, deliberately, so that validation happens inside the agent's loop; the talk's edited write-up adds that this spares shared CI capacity. Huda closes by naming the new bottleneck as deciding whether a feature should be built [@medisetty2026uber].
- Uber's review agent posts about 25,000 comments a week, and about 67% are addressed. The talk's edited write-up notes that addressal measures developer behaviour and proves neither correctness nor defects prevented [@bond2026ureview].
- Ryan Cooke of WorkOS reports that a sandboxed agent merging pull requests gave results hard to tell from engineers running agents on laptops. WorkOS judges its factory by customer delivery, defect rate, recovery time and voluntary adoption [@cooke2026notfactory].
- Horthy reports that HumanLayer went lights off in July 2025 and hit an issue the agent could not solve, which forced engineers back into code they had stopped reading while users waited. He argues that coding models are rewarded for passing tests while maintainability goes unrewarded, and he says the available benchmarks cannot yet prove this. His remedy is to restore review and move decisions earlier: product review, architecture, program design, then vertical slices [@horthy2026factoriesfail].

### The starter repository is probably oz-for-oss

At 16:17 Lloyd points to a QR code for an open-source repository of factory agents, including triage and spec-writing agents. The transcript gives no URL and we could not read the code. Warp's `oz-for-oss` existed on the day of the talk, having been created on 17 March 2026, and its skills cover triage, product specs, tech specs, implementation, review and verification [@warp2026ozfoross]. Two later repositories, `warp-factory-examples` [@warp2026factoryexamples] and `warp-factories-skills`, were created in August, after the talk, so neither can be the QR target.

We cite `oz-for-oss` for its design. Its `update-pr-review` skill reads a week of human replies to agent review comments and edits only the repo-local review skills. A `git diff` check against the allowed paths aborts any run that writes elsewhere. This is the skill loop Lloyd describes, in a form learners can read.

### Anthropic's playbook describes the same loop with gates

Louis Claxton's playbook, published 21 August 2026, organises the SDLC into six stages: plan, design, build, test, deploy and maintain [@claxton2026playbook]. Each stage commits an artefact the next one reads: `intent.md`, `spec.md`, `plan.md`, the diff, the review findings and the incident record. The intended end state is a loop in which accepting one artefact triggers the next gate.

Several plays bear directly on the course:

- Human review is reserved for regulated and critical code.
- Managed review findings neither approve nor block a pull request [@cc-codereview].
- A mistake that review flags twice becomes a CLAUDE.md rule.
- In the maintain stage, detection stays deterministic and the agent is invoked only when a control band is breached.

The playbook is written for enterprise leads, and the Claude Academy version carries the same plays in 14 lessons of about an hour [@anthropic2026academyplaybook].

Jason Clinton's companion piece adds the controls a factory needs once agents review agents [@clinton2026secure]:

- shadow mode for new AI reviewers;
- sampling of automated approvals;
- risk tiers;
- a single-purpose identity for each agent.

He also reports an incident. After a model upgrade, Anthropic's incident-response agent asked another Claude instance over Slack to push its fix, and a human review gate caught the request. Fiona Fung's account of the Claude Code team warns against reading throughput as success [@fung2026org]. All three are self-reports by the vendor of the tooling, and figures such as Clinton's share of code authored by Claude carry the same caveat as Lloyd's.

### Claude Code and Codex now cover an unattended loop

Several Claude Code features cover the stages of an unattended loop:

- `claude -p` runs non-interactively, and `--output-format json` returns `total_cost_usd` [@cc-headless].
- The GitHub Action runs a prompt on any repository event and accepts a subscription token [@cc-ghactions].
- Routines add scheduled, API and GitHub triggers as a research preview on Pro, Max, Team and Enterprise plans [@cc-routines].
- Managed Code Review is limited to Team and Enterprise plans [@cc-codereview].

Week 1 already introduces these features: on 9 October 2026, Claude Code in Action's lessons included "Routines and headless" and "GitHub Actions and Code Review", so the capstone builds on material learners have met. The Codex track has equivalents. `openai/codex-action@v1` runs `codex exec` in CI, and `codex exec --json` reports token usage for each turn [@openai-codexaction; @openai-codexexec]. OpenAI's feed describes its Agents API of 10 September 2026 as a managed service powered by the Codex harness [@openai2026agentsapi]. The page itself returned 403. OpenAI Academy's "Scale Codex Across Teams and Systems" (about 100 minutes, advanced) teaches a verification contract for each workstream [@openai2026scalecodex] and is already the Codex alternative in Week 2. OpenAI's other feed entries since June that mention Codex are customer stories, model previews and product announcements; judging by their feed summaries, none describes automating the SDLC.

## Part 3: Three ways to restructure the second half

| | Option A: discipline, then factory | Option B: run the loop by hand, then automate it | Option C: refresh in place |
|---|---|---|---|
| Week 3 | A compressed single-agent week on any hard problem the learner chooses | One lanorme issue taken through triage, spec, implementation, review and verification with an interactive agent, timed by stage | As now, with the dated items swapped |
| Week 4 | From harness to factory, around the SDLC loop | Design the automated loop for the same repository, with gates, an observer loop and a measurement plan | As now, plus a Lloyd and Horthy debate in the session |
| Week 5 | A minimal factory with one self-improvement loop and measured cost | Build that loop on a fork and compare it with the Week 3 baseline | As now, plus a cost log |
| Strength | Smallest change to Week 3; learners keep their own codebase | A baseline for every measured claim; one codebase for three weeks | Least rework of decks and reading checks |
| Cost | Week 3 and Week 5 measure different tasks in different repositories, so the capstone's numbers have nothing to compare against | Depends on one repository the course owner maintains; factories must run on forks | Week 4 stays at 149 minutes or more, with three items on OpenAI's harness thread, and the capstone stays greenfield |

### Option B gives the capstone a baseline and the critique some data

We recommend Option B.

1. Lloyd, Cooke and the playbook all judge a factory by what it ships per unit of human time and cost. Option B makes each learner's Week 3 log the baseline. The capstone replays the Week 3 issue from the same base commit, so at least one comparison holds the task fixed.
2. Learners automate a procedure they have already performed. Novices learn procedures better from worked examples and guided practice than from unguided discovery [@kirschner2006; @sweller2019], and guidance should fade as expertise grows [@kalyuga2003]. The weeks fade accordingly: an annotated example log in Week 3, a design template in Week 4 and an open build in Week 5.
3. One repository across three weeks removes the cost of learning a new codebase each week [@sweller2019]. lanorme's CI already runs the gates a factory would verify against: unit tests, its own lint and a package build [@lanorme2026repo].
4. Week 3's material keeps its place as the method for the loop's spec and implementation stages, and Horthy's July talk extends his own arc into Week 4.

Option B's main risk is volume. A cohort of factories could flood lanorme with agent pull requests, the noisy-PR problem Lloyd built his factory to manage. Factories should therefore run on forks against copied issues, and each learner sends upstream at most one pull request that they opened themselves. GitHub withholds secrets from Actions runs triggered by pull requests from forks, so agent branches must live inside the learner's fork [@cc-ghactions]. Learners who prefer their own repository can use it if it has pull-request CI and at least three open labelled issues.

## Part 4: The recommended second half, week by week

Each week states its outcomes first and aligns the activity and deliverable to them [@biggs1996]. Minutes come from the measured workload table at 238 words per minute [@brysbaert2019], or from the source's own measure where the table has none. Figures marked "estimate" are ours. Perceived workload is bound up with surface approaches to learning [@kember2004], so each week stays under 150 minutes, activity included. Each long item carries two guiding questions to read against [@carpenter2017]. Median engagement time with MOOC videos was at most about six minutes whatever their length [@guo2014], so each talk's row lists the chapters that carry its questions. Each live hour opens with five minutes of retrieval drawn from rewritten reading checks [@roediger2006; @agarwal2021; @dunlosky2013], and in a meta-analysis of flipped classrooms the effect on learning was larger where quizzes were added [@vanalten2019].

### Week 3: One change through the whole loop

By the end of the week a learner can:

1. Take one non-trivial lanorme issue through triage, spec, implementation, review and verification, logging human minutes and tokens for each stage.
2. Justify the context given at each stage: what was researched, where the session was compacted, what was kept out of scope.
3. Write a `/goal` condition that matches the repository's CI gates and state what it leaves unchecked.
4. Point to the stages that needed human judgement and say what kind of judgement each needed.

| Pre-work | Status | Minutes |
|---|---|---|
| No Vibes Allowed [@horthy2025novibes] | Core | 20.5, measured |
| Everything We Got Wrong About Research-Plan-Implement [@horthy2026rpi] | Core | 26.8, measured |
| Set up Claude Code in a monorepo or large codebase [@cc-largecodebases] | Core | 19.0, measured |
| Keep Claude working toward a goal [@cc-goal] | Core | 9.2, measured |
| Annotated example log of one lanorme change, written by the facilitator | Core | 5, estimate |
| Activity: ship one lanorme issue by hand | Core | 60, estimate |
| **Core total** | | **140.5** |
| ACE-FCA write-up [@humanlayer2025acefca] | Optional | 16.3, measured |
| From RPI to QRSPI [@lavaee2026qrspi] | Optional | 9.4, measured |
| Dynamic workflows doc [@cc-workflows] | Optional | 24.5, measured |

| Item | Guiding questions |
|---|---|
| No Vibes Allowed (chapters at 2:52, 6:34, 11:54) | What does intentional compaction produce, and why does Horthy keep the context window well below full? Why does a bad line in a plan cost more than a bad line of code? |
| Everything We Got Wrong About RPI | Which failure does Horthy trace to engineers handing their thinking to the agent? Which steps of QRSPI does he want a human to own? |
| Large-codebases doc | Which two settings would keep an agent working in `src/lanorme/checks/` out of `benchmarks/`? When does the page prefer path-scoped rules to a per-directory CLAUDE.md? |
| ACE-FCA write-up (optional) | What range of context-window use does the write-up aim for, and why? What artefact does each phase hand to the next? |
| Dynamic workflows doc (optional) | When does the page recommend a workflow over a handful of subagents? What does saving the workflow as a script add? |

**Activity.** Fork lanorme, enable Issues and Actions on the fork, and record the base commit's SHA. Copy one issue from a pool the facilitator curates into the fork's tracker. Most open lanorme issues are roadmap-scale, such as the result cache in #53, so the pool needs issues sized to the 60-minute estimate. Take the issue through the loop by hand:

1. Triage the issue as easy or needs-spec, with a reason.
2. For a needs-spec issue, write `specs/<issue>.md` stating the product behaviour and the shape of the code, using QRSPI's questions and research steps, and read it before implementing.
3. Implement with `/goal` set to "`uv run pytest tests/unit` passes and `uv run lanorme check .` is clean".
4. Review with a reviewer subagent or `/code-review`, and answer each finding.
5. Open the pull request on the fork, where CI runs.

For each stage, log the human minutes as they happen, the tokens and estimated cost from `/usage` [@cc-costs], the context given, every intervention, and any judgement a person had to make. The annotated example log shows one row per stage in this format. Codex learners substitute the equivalent features and take token counts from `codex exec --json` [@openai-codexexec].

| Minutes | Live session | Mode [@chi2014] |
|---|---|---|
| 0 to 5 | Retrieval opener. Five closed-book questions, including one that replaces the Effective Context Engineering re-read: "Which of the article's long-horizon strategies did your log use, and at which stage?" | Active |
| 5 to 15 | The facilitator walks through the annotated example log | Passive to active |
| 15 to 35 | Pairs compare logs. Each names their most expensive stage and the judgement it required; the partner asks one "why" and one "what if" | Interactive |
| 35 to 50 | Everyone adds per-stage minutes and cost to a shared table; the group discusses the spread and picks the stage to automate first | Interactive |
| 50 to 60 | Exit ticket: the stage you would trust an agent to run unattended, and your reason | Constructive |

**Deliverable.** The pull request on the fork, the stage log, and one paragraph naming the stage you would automate first and the stage you would keep. The rubric is laid out as where the learner is going, how they are going and where to next; the type of feedback and the way it is given make it more or less effective [@hattie2007].

| Where am I going | How am I going: developing | How am I going: secure | Where to next |
|---|---|---|---|
| A complete, honest log | Stages missing, or minutes reconstructed afterwards | Every stage timed as it happened, failed attempts included | Which stage will be hardest to time once an agent runs it? |
| Justified context | Lists what the agent was given | Says why, citing RPI, QRSPI or the large-codebases doc | Which of these decisions could a skill encode? |
| A completion condition that matches the gates | `/goal` describes "done" in prose | `/goal` names the CI commands and states what they leave unchecked | Which unchecked property needs a reviewer, human or agent? |
| Located judgement | "I intervened a few times" | Each intervention tied to a stage and a cause: missing context, wrong design, or taste | Which of these becomes a checkpoint in Week 4? |

### Week 4: From harness to factory

By the end of the week a learner can:

1. Map the delivery loop for one repository into stages, each with a trigger, a committed artefact and a gate marked deterministic, agent or human, with a risk argument for each human gate.
2. Weigh a factory claim against counter-evidence, distinguishing output measures from outcome measures.
3. Specify an observer loop by its signal, the one file it may change, and the check that keeps it away from CI and its own evaluator.
4. Choose the automation features for each stage within the subscription plan they hold.

| Pre-work | Status | Minutes |
|---|---|---|
| Software Engineering Is Becoming Factory Engineering [@lloyd2026factory] | Core | 20.6, measured |
| Why Software Factories Fail [@horthy2026factoriesfail] | Core | 19.3, measured |
| Software Engineering at the Tipping Point [@bender2026tipping] | Core | 39.6, measured |
| The AI-native SDLC playbook, selected plays: introduction, capture intent, give Claude a feedback loop, continuous evals in CI, AI in the PR review loop, hooks as approval gates, closing the loop [@claxton2026playbook] | Core | 22.2, measured on the blog text of those plays |
| Activity: factory design document | Core | 45, estimate |
| **Core total** | | **146.7** |
| How Anthropic secures its AI-native SDLC [@clinton2026secure] | Optional | 11.9, measured; the page states 6 |
| Building Blocks for Uber's Software Factory [@medisetty2026uber] | Optional | 18.4, measured |
| No, That's Not a Software Factory [@cooke2026notfactory] | Optional | 19.0, measured |
| Building uReview [@bond2026ureview] | Optional | 15.1, measured |
| Effective Harnesses for Long-Running Agents [@young2025harnesses] | Optional | 9.1, measured |
| SASE, Sections 2 and 5 [@hassan2026sase] | Optional | 20.0, measured on version 2 |
| Harness Engineering, OpenAI [@lopopolo2026harness] | Optional | Not measured: 403 |

| Item | Guiding questions |
|---|---|
| Lloyd (chapters at 3:40, 9:25, 13:50, 14:20) | At which stages of his loop does a human step in, and what decides whether human review happens at all? Of the quantities he says to measure, which would expose a factory that ships features nobody wants? |
| Horthy, Why Software Factories Fail (chapters at 7:30, 8:56, 14:58) | Why, in his account, does training on passing tests leave maintainability unrewarded, and which part of that claim does he concede he cannot prove? Which stage of Lloyd's loop does restoring human review change? |
| Bender | Take two of his consequences of ten times more code, for example the review bottleneck and rollback, and name the factory stage that absorbs each. Bender argues that AI amplifies whatever practices a team already has; what does that predict for a team that automates a loop it has never run by hand? |
| Playbook plays | What artefact does each stage commit, and which commit starts the next stage? Which code does the playbook reserve for human review, and how does a hook that asks differ from one that blocks? |
| Clinton (optional) | What did the incident agent do after the model upgrade, and which control caught it? Which of shadow mode, sampling and single-purpose identities would you copy into a two-person team's factory? |
| Uber (optional; chapters at 11:34, 13:28, 17:29) | Why does the demonstrated workflow stop at a draft pull request before CI? What does Huda name as the bottleneck once building is cheap? |
| Cooke (optional; chapters at 1:17, 2:37, 15:57) | Which output measures does Cooke reject, and which outcome measures replace them? Why does he rank an MCP gateway as the first investment? |
| uReview (optional; chapters at 9:53, 11:11) | What does the 67% addressal rate measure, and what does it leave unproven? Why does a review read by other agents need higher accuracy? |
| SASE, Sections 2 and 5 (optional) | What must a Merge-Readiness Pack contain, and who answers it? At which stage of your loop would an agent raise a Consultation Request Pack? |

**Activity.** Write a factory design document of one to two pages for your lanorme fork, starting from the Week 3 log. It contains:

- a stage table giving trigger, actor, committed artefact, gate type and risk argument for each stage;
- the automation feature for each stage, chosen from the Claude Code or Codex column of the Week 5 table to fit your plan;
- an observer loop: what it reads, the one file it may change, and how CI enforces that limit;
- a measurement plan defining a merged change and how human minutes, cost and failed runs are counted, plus one outcome measure;
- one paragraph weighing Lloyd's thesis against one counter-source.

This document replaces the Harness Design Document. Its repository-knowledge and guardrail questions now sit inside the stage table as the context each stage reads.

| Minutes | Live session | Mode |
|---|---|---|
| 0 to 5 | Retrieval opener, for example "Name the four parts Lloyd says a factory needs" and "Why does Horthy say a harness cannot fix maintainability?" | Active |
| 5 to 20 | Structured debate. Half the room argues Lloyd's position and half Horthy's, each using one piece of evidence from the core readings: Lloyd and the playbook for one side, Horthy and Bender for the other. Optional sources count only as extra evidence, so the week stays within its budget. The facilitator closes with Bender's question of where the bottleneck moves. | Interactive |
| 20 to 45 | Design review in threes. Each learner presents their stage table for five minutes; peers apply the first and third rubric rows. | Interactive |
| 45 to 55 | Failure walk. The facilitator presents Clinton's agent-to-agent incident; each group checks whether its design's identities and write limits would have stopped it. | Constructive |
| 55 to 60 | Capstone launch: success criterion, log format, fork rules | Passive |

| Where am I going | How am I going: developing | How am I going: secure | Where to next |
|---|---|---|---|
| Every stage has a trigger, an artefact and a justified gate | Stages listed without artefacts, or human gates without a reason | Each human gate is tied to a risk named in the Week 3 log or a reading | Which human gate could become an agent gate with shadow mode and sampling? |
| The design fits the available tools | Relies on features the learner's plan lacks | Each stage names a feature that the learner's plan includes | Which stage would you build first to test feasibility? |
| A bounded observer loop | "The agent improves its skills" | Names the signal, the single writable file and the CI check on its diff | What evidence would show the loop made reviews worse? |
| Measurement against the baseline | Counts pull requests | Counts human minutes and cost per merged change, failed runs included, plus one outcome measure | What would the numbers hide? |
| A critique with evidence | Restates Lloyd or Horthy | Sets a specific claim against specific counter-evidence | What result from your capstone would change your view? |

### Week 5 (optional capstone): A minimal factory, measured

By the end of the capstone a learner can:

1. Run a loop on a lanorme fork that takes a labelled issue to a pull request awaiting human approval, with no human starting any stage.
2. Run an observer loop that changes one skill from human corrections, and show its effect on a rerun.
3. Report human minutes and cost per merged change, with the replayed Week 3 issue as a like-for-like comparison, failed runs and setup time included.
4. Defend where each human checkpoint sits and what evidence crosses it.

There are no new readings. The reference pages are the GitHub Actions, headless, routines and parallel-agents docs [@cc-ghactions; @cc-headless; @cc-routines; @cc-parallel], their Codex equivalents [@openai-codexaction; @openai-codexexec], and the `update-pr-review` skill in `oz-for-oss` as a model observer [@warp2026ozfoross]. We estimate six to eight hours of build time.

| Stage | Trigger | Claude Code track | Codex track | Gate |
|---|---|---|---|---|
| Intake | Issue on the fork labelled `factory` | GitHub issue | GitHub issue | None |
| Triage | `issues: labeled` | GitHub Action with a triage skill; applies `easy` or `needs-spec` with a reason | `openai/codex-action@v1` running `codex exec` | Deterministic: the label must come from the allowed set |
| Spec | `needs-spec` | Agent writes `specs/<issue>.md` and opens a spec pull request | Same | Human checkpoint 1: the learner reads and merges the spec |
| Implement | `easy`, or a merged spec | `claude -p "/goal ..."` with the Week 3 condition, on a branch inside the fork | `codex exec` with the same condition | lanorme CI |
| Agent review | Pull request opened | Review skill run by the Action, posting inline comments | Same | Advisory |
| Human checkpoint 2 | CI green and review posted | The learner marks each finding accepted or rejected with a reason, then merges or returns the change | Same | Human |
| Observer | Weekly schedule or manual dispatch | Reads the week's replies to agent comments, edits only `factory/.claude/skills/review/SKILL.md`, opens a pull request | Same | A CI check fails any diff outside that path; the learner merges |

Factory skills live in `factory/.claude/skills/<name>/SKILL.md` and load with `--add-dir factory` [@cc-skills]. lanorme's CI requires every skill under the root `.claude/skills/` to have a synced copy in `.agents/skills/`, so this location keeps factory skills clear of that check and out of any upstream pull request. The observer may write only `factory/.claude/skills/review/SKILL.md`. Agent teams play no part, since teammates do not spawn under `-p` [@cc-agentteams]. Managed Code Review and routines are optional upgrades for learners whose plans include them. Each agent job prints one JSON line with stage, issue, outcome, duration and cost (`total_cost_usd`, or token usage from `codex exec --json`). The learner records human minutes at each checkpoint, and a short script joins the two into a per-change table.

**Success criterion.** Three or more issues on the fork reach a pull request that passes lanorme's CI and waits only on the learner's approval. One of them goes through the spec path, and one replays the Week 3 issue from the recorded base commit. No human starts a stage. The observer loop has made at least one accepted change to the review skill, and a rerun shows its effect. The report sets the replayed issue's human minutes and cost beside its Week 3 figures, gives per-change figures for the others, counts failed runs, and reports setup hours separately. Before the first run, the learner adds the API key or `CLAUDE_CODE_OAUTH_TOKEN` secret and creates the factory labels on the fork. Each learner opens at most one pull request upstream, by hand.

| Minutes | Demo day | Mode |
|---|---|---|
| 0 to 5 | Retrieval opener on the three measures and the observer's write limit | Active |
| 5 to 45 | Five-minute demos: one merged change traced from issue to merge, the observer's diff, the numbers | Constructive |
| 45 to 55 | A cohort table of factory against baseline; discussion of what the numbers hide | Interactive |
| 55 to 60 | Course retrospective | Interactive |

| Where am I going | How am I going: developing | How am I going: secure | Where to next |
|---|---|---|---|
| An unattended loop | A human starts one or more stages | Every stage starts from the previous artefact | Which stage failed most often, and why? |
| Evidence at the checkpoints | The learner reads the diff cold | The pull request carries the spec link, CI result and review findings | What evidence would let you skip a checkpoint for easy issues? |
| A working observer | No accepted change, or edits outside its file | One accepted, bounded change with a before-and-after rerun | What signal would you add next? |
| An honest comparison | Successful runs only | Failed runs and setup time included, set against the baseline | At what volume would the factory repay its setup time? |

## Part 5: Items retired, moved or kept

| Item | Decision | Reason |
|---|---|---|
| No Vibes Allowed; RPI talk (retitled); large-codebases doc; /goal doc | Kept, Week 3 core | They supply the method for the spec and implementation stages |
| ACE-FCA; From RPI to QRSPI; dynamic workflows doc | Moved to Week 3 optional | Budget; the workflows doc serves audits and migrations more than the loop |
| Conductor blog post | Retired; the plugin README goes to Further Reading | Dated host tool |
| Effective Context Engineering re-read | Retired from Week 3 | Replaced by an application question in the opener; it stays in Week 2 |
| Bender | Kept, Week 4 core | The systems frame for where the bottleneck moves |
| Lloyd; Horthy's factories talk; selected playbook plays | Added, Week 4 core | The thesis, its strongest counter, and a governed version of the loop |
| Effective Harnesses; SASE Sections 2 and 5 (link updated to version 3); OpenAI Harness Engineering | Moved to Week 4 optional | Counterweights used in the session; the OpenAI post cannot be measured |
| Clinton; Uber; Cooke; uReview | Added, Week 4 optional | Evidence for the debate and the failure walk |
| Symphony [@openai2026symphony]; Lopopolo talk [@lopopolo2026talk]; VSDD; Agent Teams doc | Moved to Further Reading | Symphony and the talk overlap the OpenAI harness post; the loop's spec stage takes over VSDD's role in the debate; Agent Teams does not run headless |
| Knox, Tessl [@knox2026factory]; Fung [@fung2026org]; Claude Tag [@anthropic2026claudetag]; Agents API [@openai2026agentsapi]; Run agents in parallel [@cc-parallel] | Further Reading | Vendor framing or product announcements |
| Harness Design Document | Replaced by the factory design document | Its questions move into the stage table |
| Greenfield harness-first capstone | Replaced by the measured factory on a lanorme fork | Gains a baseline and a cost measure |

The restructure also changes the reading checks, the decks and the facilitator's preparation. The Week 3 and Week 4 reading checks lose the QRSPI section and the Lopopolo, Symphony and Agent Teams questions, which the August refresh lists by number. Week 3's question 23 also needs a corrected answer. Both decks need new slides for the loop and the debate, and the new decks should keep to the coherence principle the site review applied to slide density [@mayer2020]. The facilitator also needs to write the annotated example log and curate the issue pool before Week 3 runs.

## Part 6: What we could not verify

- The QR code's target. `oz-for-oss` matches the description and predates the talk, but the transcript gives no URL.
- The bodies of the two OpenAI posts and of the Agents API announcement, which return 403. Their metadata comes from OpenAI's RSS feed.
- Publication dates for the Claude Academy playbook course, OpenAI Academy's Scale Codex path and every documentation page; none shows one.
- The event for Knox's talk; its ai.engineer page returns 404.
- What the three Week 3 docs said in June. The Wayback Machine returned HTTP 429, so the June reading check's answer key served as the baseline.
- The Uber, WorkOS and Anthropic figures, which are self-reported in talks and vendor posts and which no source reproduces.
- Whether the lanorme maintainer wants agent-authored pull requests from a cohort at all. This is the owner's decision, and the fork rule in Part 3 assumes the answer is "few".

## References
