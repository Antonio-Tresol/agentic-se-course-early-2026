# Week 3 reading check: the three Claude Code guides

A short questionnaire to confirm people actually read the three June 2026 Claude Code docs added to Week 3:

- Set up Claude Code in a monorepo or large codebase (`/large-codebases`)
- Orchestrate subagents at scale with dynamic workflows (`/workflows`)
- Keep Claude working toward a goal (`/goal`)

Fourteen questions, roughly ten to fifteen minutes. The multiple-choice questions catch a skim; the short-answer ones are the real signal, since they cannot be answered from general knowledge of coding agents. Distractors are deliberately plausible, so guessing from priors does not pay off. The answer key is at the bottom; cut it before handing this out.

---

## Part A: Large codebases

**1.** You start Claude Code from the repository root of a monorepo. Which CLAUDE.md files load at launch?

- a) Every CLAUDE.md in the repository, loaded recursively
- b) Only the root CLAUDE.md; each subdirectory's file loads on demand when Claude reads a file there
- c) None, until you list them in settings
- d) Only the files not listed in `claudeMdExcludes`

**2.** What does the `worktree.sparsePaths` setting do?

- a) Removes paths from content-search results
- b) Denies reads of generated and vendored code
- c) Checks out only the listed directories plus root-level files when Claude creates a worktree
- d) Symlinks `node_modules` so it is not duplicated across worktrees

**3.** You grant access to a sibling package using the `additionalDirectories` setting (not the `--add-dir` flag). What loads from that directory?

- a) Its files, its CLAUDE.md, and its skills
- b) Its files and skills, but not its CLAUDE.md
- c) Its files only; never its CLAUDE.md, rules, or skills
- d) Nothing until you restart Claude Code

**4.** (Short answer) Content searches already skip `node_modules/`, `dist/`, and `build/` with no extra configuration. Why? And which setting do you reach for to stop Claude opening checked-in generated or vendored code that is **not** gitignored?

---

## Part B: Dynamic workflows

**5.** Mechanically, what is a dynamic workflow?

- a) A YAML file listing the subagents to run
- b) A JavaScript script that orchestrates subagents, which Claude writes and a runtime executes in the background
- c) A markdown skill that sets `context: fork`
- d) A saved agent-team definition

**6.** The doc compares subagents, skills, agent teams, and workflows by "who holds the plan". What is distinctive about a workflow?

- a) The model decides turn by turn what to run next
- b) A shared task list holds the plan and the intermediate results
- c) The script holds the loop, the branching, and the intermediate results, so Claude's context holds only the final answer
- d) A human approves every step before it runs

**7.** What are the runtime caps on a single workflow run?

- a) No caps; a workflow can spawn any number of agents
- b) Up to 16 concurrent agents (fewer on limited CPU) and 1,000 agents total per run
- c) 5 concurrent and 100 total
- d) 16 agents total

**8.** (Short answer) Name the bundled workflow Claude Code ships with, and give one other way to start a workflow for your own task without saving a command first.

---

## Part C: Keep Claude working toward a goal

**9.** While a `/goal` is active, what decides whether Claude takes another turn after the current one finishes?

- a) Claude re-reads the goal and judges for itself
- b) A small fast model (Haiku by default) checks whether the condition holds and returns a yes or no with a short reason
- c) A script you provide runs the tests
- d) A fixed turn limit you set when creating the goal

**10.** What is the key limitation of the goal evaluator?

- a) It can only be set once per session and never changed
- b) It does not call tools, so it can only judge what Claude has already surfaced in the conversation
- c) It always runs on the main session model
- d) It edits files in order to verify the condition

**11.** `/goal` is implemented as:

- a) A scheduled cloud routine
- b) A wrapper around a session-scoped prompt-based Stop hook
- c) A dedicated subagent
- d) An MCP server

**12.** (Short answer) Why does "all tests in `test/auth` pass" work as a goal condition, while "the code is well architected" does not?

---

## Part D: Tying it together

**13.** (Short answer) In the Week 3 activity you implement lanorme issue #1 (CI that runs the gates on pull requests). Map each of the three readings to one concrete thing you would do in that task.

**14.** When a dynamic workflow spawns subagents, what permission mode do those subagents run in?

- a) Whatever mode the session is in
- b) Always `acceptEdits`, with file edits auto-approved, regardless of the session's mode
- c) Always plan mode (read-only)
- d) `bypassPermissions`

---

<!-- ============================================================ -->
<!-- ANSWER KEY: cut everything below before handing this out.    -->
<!-- ============================================================ -->

## Answer key

**1. b.** Root loads at launch; subdirectory CLAUDE.md files load on demand when Claude reads files there. (Layer CLAUDE.md files by directory.)

**2. c.** `sparsePaths` writes only the listed directories plus root-level files to disk. Option d describes the separate `symlinkDirectories` setting. (Check out only the directories you need.)

**3. c.** The `additionalDirectories` setting grants file access only: it never loads CLAUDE.md, rules, or skills. Only `--add-dir` loads skills, and it loads CLAUDE.md solely when `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` is set. (Grant access across packages or repositories.)

**4.** Searches respect `.gitignore` by default, so gitignored build output stays out of results with no configuration. For checked-in generated or vendored code, add `Read` deny rules under `permissions.deny`. (Block reads of generated and vendored code.)

**5. b.** A dynamic workflow is a JavaScript script that orchestrates subagents at scale; Claude writes it and the runtime executes it in the background. (Intro.)

**6. c.** The script holds the plan and the intermediate results live in script variables, so only the final answer reaches Claude's context. (When to use a workflow.)

**7. b.** Up to 16 concurrent agents (fewer on machines with limited CPU) and a hard cap of 1,000 agents total per run. (Behavior and limits.)

**8.** `/deep-research` is the bundled workflow. To start one for your own task without saving a command: either include the word `workflow` in your prompt, or turn on `/effort ultracode` and let Claude decide. (Run a bundled workflow; Have Claude write a workflow.)

**9. b.** After each turn a small fast model (Haiku by default) evaluates the condition and returns yes or no plus a short reason; a "no" feeds the reason back as guidance for the next turn. (How evaluation works.)

**10. b.** The evaluator does not call tools. It judges only what Claude has already put in the conversation, which is why conditions must be things Claude's own output can demonstrate. (Write an effective condition.)

**11. b.** `/goal` is a wrapper around a session-scoped prompt-based Stop hook. (How evaluation works.)

**12.** The evaluator reads only the conversation. "All tests in `test/auth` pass" works because Claude runs the tests and the result lands in the transcript for the evaluator to read: a measurable end state with a stated check. "Well architected" has no measurable end state Claude's output can demonstrate, so the evaluator cannot judge it reliably. (Write an effective condition.)

**13.** A reasonable mapping (any concrete, correct version counts):
- Large codebases: scope the agent to the CI surface (the existing `release.yml`, `pyproject.toml`, `.pre-commit-config.yaml`); use a sparse worktree or `Read` deny rules to keep `tests/fixtures/` and `benchmarks/` out of context.
- Dynamic workflows: fan out an audit of how each gate is invoked (pytest, the 23 checks, the `lanorme check .` dogfood), then have the script draft the `ci.yml` that runs them on `pull_request`.
- Keep working toward a goal: set `/goal` to "`uv run pytest tests/unit` passes and `uv run lanorme check .` is clean" and let it run to that end state.

**14. b.** Workflow subagents always run in `acceptEdits` mode with file edits auto-approved, regardless of the session's permission mode; only out-of-allowlist shell, web, or MCP calls can still prompt mid-run. (Approve the plan before it runs.)
