# Week 3 reading check: working in complex codebases

A questionnaire to confirm people actually read the Week 3 material. It covers all nine prework items:

1. No Vibes Allowed (Dex Horthy, talk) with its companion write-up, ACE-FCA (HumanLayer)
2. Advanced Context Engineering for Coding Agents / ACE-FCA (HumanLayer)
3. No More Slop: What We Got Wrong About RPI (Dex Horthy, talk)
4. From RPI to QRSPI (Alex Lavaee), the summary of the revised framework
5. Conductor: Context-Driven Development for Gemini CLI (Google)
6. Effective Context Engineering for AI Agents (Anthropic)
7. Set up Claude Code in a monorepo or large codebase (Anthropic)
8. Orchestrate subagents at scale with dynamic workflows (Anthropic)
9. Keep Claude working toward a goal (Anthropic)

Twenty-four questions across eight sections, roughly twenty-five minutes. The multiple-choice questions catch a skim; the short-answer ones are the real signal, since they cannot be answered from general knowledge of coding agents. The two Dex Horthy talks are checked through the concepts in their paired write-ups (ACE-FCA and the QRSPI summary), so the talk questions are fair to anyone who watched. The answer key is at the bottom; cut it before handing this out. The instructor can also select a subset of sections.

---

## Part 1: Effective Context Engineering (Anthropic)

**1.** How does the article distinguish context engineering from prompt engineering?

- a) They are the same thing with different names
- b) Prompt engineering is for chatbots; context engineering is for code
- c) Prompt engineering is about writing the prompt, especially the system prompt; context engineering manages the whole context state (system instructions, tools, MCP, external data, history) across many inference turns
- d) Context engineering only concerns the size of the context window

**2.** What does the article mean by "context rot"?

- a) Stale documentation that misleads the agent
- b) As the number of tokens in the window grows, the model's ability to accurately recall information from it decreases, reflecting a finite attention budget
- c) Tokens decaying in the cache over time
- d) The model forgetting its system prompt after a compaction

**3.** (Short answer) The article names four strategies for long-horizon work. List three of them.

---

## Part 2: No Vibes Allowed and ACE-FCA (Dex Horthy / HumanLayer)

**4.** What do the three phases of the RPI workflow stand for?

- a) Read, Process, Iterate
- b) Research, Plan, Implement
- c) Reason, Probe, Inspect
- d) Refactor, Patch, Integrate

**5.** "Frequent intentional compaction" aims to keep context-window utilisation in roughly what range?

- a) 5 to 15 percent
- b) 40 to 60 percent
- c) 80 to 90 percent
- d) As close to 100 percent as possible

**6.** (Short answer) The write-up argues review effort should move upstream. Explain the leverage asymmetry it uses to justify this: why is a bad line of research or plan worse than a bad line of code?

**7.** What is "intentional compaction"?

- a) The model's automatic summarisation when the window is nearly full
- b) Deleting old messages to save tokens
- c) Pausing when context fills up to distil the work so far into structured artefacts such as progress files, plans, and research summaries
- d) Compressing the prompt with abbreviations

---

## Part 3: No More Slop and From RPI to QRSPI

**8.** What core problem does the RPI to QRSPI revision set out to fix?

- a) The model was too slow
- b) Frontier LLMs lose consistency after roughly 150 to 200 instructions in one prompt and silently skip constraints rather than failing visibly
- c) Research took too long
- d) Plans were too short

**9.** How does QRSPI change the shape of the workflow relative to RPI?

- a) It removes the planning phase
- b) It merges research and implementation into one step
- c) It front-loads alignment phases (Questions, Research, Design discussion, Structure) before Plan and Implementation, rather than relying on one big instruction-heavy prompt
- d) It replaces human review with a second model

**10.** (Short answer) What is the "magic words" criticism of the original framework, and what principle does the author draw from it?

---

## Part 4: Conductor (Google)

**11.** What is the central idea of "context-driven development" as Conductor implements it?

- a) Loading the entire codebase into context on every turn
- b) Moving work from ephemeral chat logs into formal specs and plans that live alongside the code in persistent Markdown files
- c) Letting the model choose which context to keep
- d) Driving development from test coverage metrics

**12.** Conductor structures work into three stages. Which option lists them in order with the right artefacts?

- a) Implement, then test, then document
- b) Establish context (/conductor:setup), specify and plan (/conductor:newTrack), implement (/conductor:implement), where a plan is an actionable list of Phases, Tasks, and Sub-tasks
- c) Plan, branch, merge
- d) Setup, chat, commit

---

## Part 5: Set up Claude Code in a large codebase (Anthropic)

**13.** You start Claude Code from the repository root of a monorepo. Which CLAUDE.md files load at launch?

- a) Every CLAUDE.md in the repository, recursively
- b) Only the root CLAUDE.md; each subdirectory's file loads on demand when Claude reads a file there
- c) None, until you list them in settings
- d) Only the files not listed in `claudeMdExcludes`

**14.** You grant access to a sibling package using the `additionalDirectories` setting (not the `--add-dir` flag). What loads from that directory?

- a) Its files, its CLAUDE.md, and its skills
- b) Its files and skills, but not its CLAUDE.md
- c) Its files only; never its CLAUDE.md, rules, or skills
- d) Nothing until you restart Claude Code

**15.** (Short answer) Content searches already skip `node_modules/`, `dist/`, and `build/` with no configuration. Why? And which setting stops Claude opening checked-in generated or vendored code that is not gitignored?

---

## Part 6: Dynamic workflows (Anthropic)

**16.** Mechanically, what is a dynamic workflow?

- a) A YAML file listing the subagents to run
- b) A JavaScript script that orchestrates subagents, which Claude writes and a runtime executes in the background
- c) A markdown skill that sets `context: fork`
- d) A saved agent-team definition

**17.** Comparing subagents, skills, agent teams, and workflows by "who holds the plan", what is distinctive about a workflow?

- a) The model decides turn by turn what to run next
- b) A shared task list holds the plan and the intermediate results
- c) The script holds the loop, the branching, and the intermediate results, so Claude's context holds only the final answer
- d) A human approves every step before it runs

**18.** What are the runtime caps on a single workflow run?

- a) No caps
- b) Up to 16 concurrent agents (fewer on limited CPU) and 1,000 agents total per run
- c) 5 concurrent and 100 total
- d) 16 agents total

---

## Part 7: Keep Claude working toward a goal (Anthropic)

**19.** While a `/goal` is active, what decides whether Claude takes another turn after the current one finishes?

- a) Claude re-reads the goal and judges for itself
- b) A small fast model (Haiku by default) checks whether the condition holds and returns a yes or no with a short reason
- c) A script you provide runs the tests
- d) A fixed turn limit you set when creating the goal

**20.** What is the key limitation of the goal evaluator?

- a) It can only be set once per session
- b) It does not call tools, so it can only judge what Claude has already surfaced in the conversation
- c) It always runs on the main session model
- d) It edits files in order to verify the condition

**21.** (Short answer) Why does "all tests in `test/auth` pass" work as a goal condition, while "the code is well architected" does not?

---

## Part 8: Tying it together

**22.** (Short answer) The deck calls RPI, QRSPI, and Conductor "the same shape, different dress". Name one principle all three share.

**23.** When a dynamic workflow spawns subagents, what permission mode do those subagents run in?

- a) Whatever mode the session is in
- b) Always `acceptEdits`, with file edits auto-approved, regardless of the session's mode
- c) Always plan mode (read-only)
- d) `bypassPermissions`

**24.** (Short answer) In the Week 3 activity you implement lanorme issue #1 (CI that runs the gates on pull requests). Map each of the three Claude Code readings (large codebases, workflows, goal) to one concrete thing you would do in that task.

---

<!-- ============================================================ -->
<!-- ANSWER KEY: cut everything below before handing this out.    -->
<!-- ============================================================ -->

## Answer key

**1. c.** Prompt engineering is about writing the prompt; context engineering manages the full context state across turns. (Effective Context Engineering, prompt vs context engineering.)

**2. b.** Context rot: recall degrades as tokens grow, reflecting a finite attention budget (rooted in the transformer's n-squared pairwise relationships). (Effective Context Engineering.)

**3.** Any three of: compaction; structured note-taking; sub-agent architectures; just-in-time retrieval. (Effective Context Engineering, long-horizon strategies.)

**4. b.** Research, Plan, Implement. (ACE-FCA.)

**5. b.** 40 to 60 percent utilisation, depending on complexity. (ACE-FCA, frequent intentional compaction.)

**6.** A bad line of code is a single bad line, but a bad line in a plan can produce hundreds of bad lines, and a bad line in research can produce thousands. Errors made upstream are amplified downstream, so review pays off most on research and plans. (ACE-FCA, leverage asymmetry.)

**7. c.** Intentional compaction is pausing when context fills up to distil the work into structured artefacts (progress files, plans, research summaries) that compress understanding. Option a describes the model's automatic compaction, which is different. (ACE-FCA.)

**8. b.** Frontier LLMs lose consistency after roughly 150 to 200 instructions in a single prompt and silently skip constraints. The original RPI system prompt carried 85-plus instructions and pushed against this. (From RPI to QRSPI, instruction budget overflow.)

**9. c.** QRSPI front-loads alignment phases (Questions, Research, Design discussion, Structure) before Plan and Implementation, instead of leaning on one instruction-heavy prompt. (From RPI to QRSPI.)

**10.** The original framework only worked if you used exact phrasing such as "work back and forth with me". The principle: if a tool needs magic words for basic functionality, the tool itself is broken. (From RPI to QRSPI, magic-words dependency.)

**11. b.** Context-driven development moves work out of impermanent chat logs into formal specs and plans that live alongside the code as persistent Markdown. (Conductor announcement.)

**12. b.** Establish context (`/conductor:setup`), specify and plan (`/conductor:newTrack`), implement (`/conductor:implement`); a plan is an actionable list of Phases, Tasks, and Sub-tasks. (Conductor announcement.)

**13. b.** Root loads at launch; subdirectory CLAUDE.md files load on demand when Claude reads files there. (Large codebases, layer CLAUDE.md by directory.)

**14. c.** The `additionalDirectories` setting grants file access only: it never loads CLAUDE.md, rules, or skills. Only `--add-dir` loads skills, and it loads CLAUDE.md solely when `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` is set. (Large codebases, grant access across packages.)

**15.** Searches respect `.gitignore` by default, so gitignored build output stays out with no configuration. For checked-in generated or vendored code, add `Read` deny rules under `permissions.deny`. (Large codebases, block reads of generated and vendored code.)

**16. b.** A JavaScript script that orchestrates subagents at scale, written by Claude and executed by a runtime in the background. (Workflows, intro.)

**17. c.** The script holds the plan and the intermediate results live in script variables, so only the final answer reaches Claude's context. (Workflows, when to use a workflow.)

**18. b.** Up to 16 concurrent agents (fewer on limited CPU) and a hard cap of 1,000 agents total per run. (Workflows, "Behavior and limits".)

**19. b.** A small fast model (Haiku by default) evaluates the condition after each turn and returns yes or no with a reason; a "no" feeds the reason back as guidance. (Goal, how evaluation works.)

**20. b.** The evaluator does not call tools; it judges only what Claude has already surfaced in the conversation. (Goal, write an effective condition.)

**21.** The evaluator reads only the conversation. "All tests in `test/auth` pass" works because Claude runs the tests and the result lands in the transcript: a measurable end state with a stated check. "Well architected" has no measurable end state Claude's output can demonstrate. (Goal, write an effective condition.)

**22.** Any one of: specification or plan precedes implementation; persistent artefacts over ephemeral chat; front-load understanding before writing code; place human review at high-leverage upstream points. (Deck synthesis; supported by ACE-FCA, From RPI to QRSPI, and Conductor.)

**23. b.** Workflow subagents always run in `acceptEdits` mode with file edits auto-approved, regardless of the session's mode; only out-of-allowlist shell, web, or MCP calls can still prompt. (Workflows, approve the plan before it runs.)

**24.** A reasonable mapping (any concrete, correct version counts):
- Large codebases: scope the agent to the CI surface (the existing `release.yml`, `pyproject.toml`, `.pre-commit-config.yaml`); use a sparse worktree or `Read` deny rules to keep `tests/fixtures/` and `benchmarks/` out of context.
- Dynamic workflows: fan out an audit of how each gate is invoked (pytest, the 23 checks, the `lanorme check .` dogfood), then have the script draft the `ci.yml` that runs them on `pull_request`.
- Keep working toward a goal: set `/goal` to "`uv run pytest tests/unit` passes and `uv run lanorme check .` is clean" and let it run to that end state.
