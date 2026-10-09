# Agentic SE Course

Coding agents are already exceeding human throughput for many SE tasks. As model capabilities continue to improve, agents will increasingly be the primary producers of code. The engineering challenge shifts: the bottleneck moves from writing code to ensuring that agent-produced code is correct, tested, coherent, and merge-ready, with as little human steering as possible.

The course is an inverted classroom over six weeks. Each week pairs pre-work done alone (courses, readings, videos) with a one-hour live session:

- **Week 0**: Getting Started, prerequisites and installing a coding agent
- **Week 1**: One Coding Agent, two structured courses, then estimating real benchmark tasks in pairs
- **Week 2**: Adapting a Coding Agent, skills, MCP, subagents and context engineering
- **Week 3**: One change through the whole loop, a lanorme issue taken from triage to pull request by hand and timed
- **Week 4**: From harness to factory, designing the automated loop and weighing the claims made for software factories
- **Week 5**: A minimal factory, measured (optional capstone)

Every week has a Claude Code track and a Codex track. The site is published at https://antonio-tresol.github.io/agentic-se-course-early-2026/.

## Site structure

Version 2 is a static site in `site/`: plain HTML, CSS and classic JavaScript, with no build step, bundler or backend. Every page uses relative links, so it works from any directory or sub-path. The GitHub Pages workflow publishes `site/` as the root.

To preview it locally:

```bash
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000/`.

## Previous version

Version 1 is archived in git at the tag `v1.0` and served under `/v1/`; the deploy workflow rebuilds it from the tag. Old links to v1's `#/sessions` and `#/further-reading` routes open the matching v2 pages.

## Progress tracking and export

Learners' progress (ticked pre-work, minutes logged, self-check answers and confidence, benchmark estimates and stage logs) is stored in their browser's `localStorage` and never sent anywhere. From My progress, learners export it as a JSON file to send to the course owner, and can import it on another device. `notes/progress/README.md` documents the schema and the analysis script, `notes/progress/analyse.py`, which turns a folder of exports into CSV tables and a summary.

## Cohort calendar

Session dates come from a `calendar.json` the course owner shares with each cohort. Learners load it once on the overview or My progress; without it, pages show no dates and "You are here" follows each learner's progress. `site/calendar.example.json` shows the format, and `notes/progress/calendar.schema.json` defines it.

## Design documents

The rationale for version 2 lives in `notes/`:

- `site-review-2026-10.md`: the review of the v1 site against design, accessibility and learning-science sources.
- `design.md`: information architecture, week-page anatomy and accessibility requirements.
- `visual-design.md`: the visual system, tokens, colour, charts and components.
- `curriculum-v2-second-half.md`: the currency audit and redesign of Weeks 3 to 5.
- `benchmark-activity.md`: the Week 1 benchmark estimation activity.
- `references.bib` and `readings.bib`: BibTeX for the design and learning-science sources and for every course reading.
- `mockups/`: the approved mockups and their review gallery.

## Currency disclaimer

This curriculum was developed in March and April 2026 and rebuilt as version 2 in October 2026. Tools, models and benchmarks in agentic software engineering change quickly; figures and citations reflect their state in October 2026.
