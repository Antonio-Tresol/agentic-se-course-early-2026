import { useState } from "react";

const weeks = [
  {
    id: 0,
    label: "Week 0",
    title: "Getting Started",
    intro: "No pre-work required. We meet to introduce ourselves, see a live demo, and get Claude Code installed on everyone's machine.",
    detail: "Come prepared with a working terminal and the prerequisites above.",
    prework: [],
    activity: null,
    session: "Introductions, live demo, installation, and overview of the course arc.",
  },
  {
    id: 1,
    label: "Week 1",
    title: "One Coding Agent",
    intro: "This week is about getting your hands dirty. You install a coding agent, work through structured exercises, and learn the established best practices for steering it effectively.",
    prework: [
      { text: "Claude Code in Action", url: "https://anthropic.skilljar.com/claude-code-in-action", verb: "Complete", note: "includes exercises" },
      { text: "Best Practices for Claude Code", url: "https://code.claude.com/docs/en/best-practices", verb: "Read" },
    ],
    activity: null,
    session: "We share what we tried during the course exercises and discuss what worked and what did not. Then we break into pairs for the nanobot exercise.",
    liveActivity: {
      title: "Hands-On with nanobot",
      description: "We work on a shared codebase: nanobot, an ultra-lightweight AI agent written in Python (~4,000 lines of core code). In pairs, each person picks a small task and uses Claude Code to solve it. You have never seen this codebase before, and that is the point: notice what context the agent needs and does not have.",
      repo: { url: "https://github.com/HKUDS/nanobot", label: "github.com/HKUDS/nanobot" },
      steps: [
        "Clone the repo and explore it with Claude Code.",
        "Pick a small task: a bug, a missing feature, a refactor.",
        "Use Claude Code to solve it. Pay attention to what context the agent asks for and what it misses.",
      ],
    },
  },
  {
    id: 2,
    label: "Week 2",
    title: "Adapting A Coding Agent",
    intro: "A generic agent is useful. An agent that knows your team's PR checklist, can query your database, and applies your coding standards automatically is transformative. This week you learn skills (how to encode knowledge), MCP (how to connect tools), and the deeper principles of context engineering.",
    prework: [
      { text: "Introduction to Agent Skills", url: "https://anthropic.skilljar.com/introduction-to-agent-skills", verb: "Complete", note: "includes exercises and reflections" },
      { text: "Introduction to Model Context Protocol", url: "https://anthropic.skilljar.com/introduction-to-model-context-protocol", verb: "Complete" },
      { text: "How Claude Code Works", url: "https://code.claude.com/docs/en/how-claude-code-works", verb: "Read" },
      { text: "Effective Context Engineering for AI Agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", verb: "Read" },
    ],
    activity: null,
    session: "We discuss questions from the courses and the context engineering article. Then we do a skill-building sprint.",
    liveActivity: {
      title: "Skill-Building Sprint",
      description: "Pick either the nanobot codebase from Week 1 or something from your own workflow, and write a SKILL.md for it. Swap with a partner and test whether it triggers correctly.",
      repo: { url: "https://github.com/HKUDS/nanobot", label: "github.com/HKUDS/nanobot" },
      steps: [
        "Choose a codebase: nanobot or your own project.",
        "Write a SKILL.md that encodes a repeating pattern or workflow.",
        "Swap with a partner and test whether the skill triggers correctly.",
      ],
    },
  },
  {
    id: 3,
    label: "Week 3",
    title: "Solving Hard Problems",
    intro: "Agents struggle with large, real-world codebases. This week you learn the Research-Plan-Implement (RPI) workflow and the broader pattern of treating context as a managed, persistent artifact rather than an ephemeral chat.",
    prework: [
      { text: "No Vibes Allowed: Solving Hard Problems in Complex Codebases", url: "https://www.youtube.com/watch?v=rmvDxxNubIg", verb: "Watch", note: "Dex Horthy · AI Engineer 2025" },
      { text: "Conductor: Introducing Context-Driven Development for Gemini CLI", url: "https://developers.googleblog.com/conductor-introducing-context-driven-development-for-gemini-cli/", verb: "Read" },
      { text: "Advanced Context Engineering for Coding Agents", url: "https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md", verb: "Browse", note: "optional" },
      { text: "Effective Context Engineering for AI Agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", verb: "Re-read", note: "with RPI in mind" },
    ],
    activity: {
      title: "RPI on OpenCode",
      description: "We all work on the same codebase for this exercise: OpenCode, an open source coding agent written in Go. Yes, you are using a coding agent to work on a coding agent's codebase.",
      repo: { url: "https://github.com/opencode-ai/opencode", label: "github.com/opencode-ai/opencode" },
      detail: "Clone the repo, explore it, and pick a non-trivial task: an open issue, a missing feature, a refactor that touches multiple packages, a bug. Then apply the RPI workflow deliberately:",
      steps: [
        "Research — Have Claude Code investigate the OpenCode codebase. Do not let it write code. Produce a research summary: how is the project structured? Where does the relevant logic live? What are the dependencies?",
        "Plan — From the research, produce a detailed plan (specific files, specific changes, testing strategy). Review the plan yourself before proceeding.",
        "Implement — Execute the plan. Compact context between phases.",
      ],
      deliverable: "Bring the research doc and the plan to the live session. Write one paragraph of reflection: did separating research from implementation change the outcome compared to how you would have done it in Week 1?",
    },
    session: "We review each other's research docs and plans in small groups and discuss what worked, what broke, and when the RPI discipline felt worth it vs. when you wanted to skip ahead.",
  },
  {
    id: 4,
    label: "Week 4",
    title: "Towards Agent-First SE",
    intro: "Everything so far has been about making a single agent useful to you on individual tasks. This week shifts the ambition: what does it take to build a repository where teams of agents can autonomously produce features that are correct, coherent, elegant, and merge-ready, with as little human input as possible? The readings approach this from different angles: how to sustain agent work across many sessions, how a team shipped an entire product with zero manually written code, how the SE discipline itself needs to change, and how multiple agents can coordinate on a shared codebase.",
    prework: [
      { text: "Effective Harnesses for Long-Running Agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", verb: "Read", note: "Anthropic · start here" },
      { text: "Harness Engineering: Leveraging Codex in an Agent-First World", url: "https://openai.com/index/harness-engineering/", verb: "Read", note: "OpenAI · Feb 2026" },
      { text: "Agentic Software Engineering: Foundational Pillars and a Research Roadmap", url: "https://arxiv.org/html/2509.06216v2", verb: "Read", note: "Hassan et al. · focus on SASE framework" },
      { text: "Verified Spec-Driven Development", url: "https://gist.github.com/dollspace-gay/d8d3bc3ecf4188df049d7a4726bb2a00", verb: "Read", note: "VSDD" },
      { text: "Agent Teams", url: "https://code.claude.com/docs/en/agent-teams", verb: "Read", note: "Claude Code documentation" },
    ],
    activity: {
      title: "Harness Design Document",
      description: "Choose a real project (your current work, a side project, an open source project you contribute to). Write a one-page harness design document describing how you would set up an agent-first workflow for it. Cover at least:",
      steps: [
        "Repository knowledge structure — What goes in CLAUDE.md/AGENTS.md? What goes in docs/? How do you apply progressive disclosure?",
        "Architectural guardrails — What invariants would you enforce mechanically (linters, CI, structural tests)? What do you leave flexible?",
        "Agent legibility — What is currently invisible to an agent (Slack discussions, tacit knowledge, undocumented conventions)? How would you make it legible?",
        "Feedback loops — How does the agent validate its own work? Where does human review add the most leverage?",
        "Honest risks — What would be the hardest part of this transition for your team?",
      ],
      deliverable: "A markdown document (roughly one page, more is fine). If you are doing the Week 5 capstone, this document becomes the blueprint for your project.",
    },
    session: "Each participant presents their harness design. We discuss what is most creative, what is most practical, and close with a course retrospective.",
  },
  {
    id: 5,
    label: "Week 5",
    title: "Capstone",
    optional: true,
    intro: "No new readings. This is where everything comes together. You build a real project from scratch, but instead of writing the code yourself, you design the harness and let the agent be the primary code producer.",
    prework: [],
    activity: {
      title: "Build a Project, Harness-First",
      description: "Choose your own project idea. It can be anything: a CLI tool, a web app, an API, a library, a game. The scope should be ambitious enough that you cannot finish it in one sitting, but realistic enough to have something working by demo day.",
      detail: "You are not just building a project. You are building the engineering system around the project. Use the agent to build the harness itself. Skills, hooks, subagent definitions, MCP configurations, documentation structure: all of it can and should be agent-produced.",
      steps: [
        "CLAUDE.md / AGENTS.md — project standards, architecture decisions, and constraints",
        "docs/ directory — progressive disclosure: high-level map at the top, detailed references linked from it",
        "Skills — repeating patterns (your testing approach, your commit format, your code style)",
        "Hooks — automated operations (linting on save, validation before commits)",
        "Subagents — delegated work (review, testing, documentation)",
        "MCP servers — external tools and data access if needed",
        "Architectural guardrails — linters, structural tests, CI",
        "Progress tracking — so the agent always knows what has been done and what is next",
      ],
    },
    successCriterion: "A fresh agent session, dropped into your repo with no prior context, can pick up a new feature and produce a result that is working, tested, validated, correct, coherent with the principles of the codebase, and merge-ready. No slop. Minimal human steering. As models get more capable and agent throughput continues to exceed what a single human can review, the quality of your harness determines the quality of the output. You are building the system that scales.",
    deliverableNote: "The repository itself, including the harness. The code matters, but the scaffolding matters more. Ask yourself: if someone else cloned this repo and ran a team of agents on it, would the output be good?",
    session: "Demo day. Each participant demos their project and walks through their harness: what did you set up, what worked, what would you change? Show both the running project and the engineering system behind it.",
  },
];

const resources = {
  courses: [
    { text: "AI Fluency: Framework & Foundations", url: "https://anthropic.skilljar.com/ai-fluency-framework-foundations", note: "optional prerequisite" },
    { text: "Claude Code in Action", url: "https://anthropic.skilljar.com/claude-code-in-action" },
    { text: "Introduction to Agent Skills", url: "https://anthropic.skilljar.com/introduction-to-agent-skills" },
    { text: "Introduction to Model Context Protocol", url: "https://anthropic.skilljar.com/introduction-to-model-context-protocol" },
  ],
  docs: [
    { text: "Claude Code Product Page", url: "https://claude.com/product/claude-code" },
    { text: "How Claude Code Works", url: "https://code.claude.com/docs/en/how-claude-code-works" },
    { text: "Best Practices for Claude Code", url: "https://code.claude.com/docs/en/best-practices" },
    { text: "Agent Teams", url: "https://code.claude.com/docs/en/agent-teams" },
  ],
  articles: [
    { text: "Effective Context Engineering for AI Agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", note: "Anthropic" },
    { text: "Effective Harnesses for Long-Running Agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", note: "Anthropic" },
    { text: "No Vibes Allowed: Solving Hard Problems in Complex Codebases", url: "https://www.youtube.com/watch?v=rmvDxxNubIg", note: "HumanLayer" },
    { text: "Advanced Context Engineering for Coding Agents", url: "https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md", note: "HumanLayer" },
    { text: "Conductor: Context-Driven Development for Gemini CLI", url: "https://developers.googleblog.com/conductor-introducing-context-driven-development-for-gemini-cli/", note: "Google" },
    { text: "Harness Engineering: Leveraging Codex in an Agent-First World", url: "https://openai.com/index/harness-engineering/", note: "OpenAI" },
    { text: "Agentic SE: Foundational Pillars and a Research Roadmap", url: "https://arxiv.org/html/2509.06216v2", note: "Hassan et al." },
    { text: "Verified Spec-Driven Development", url: "https://gist.github.com/dollspace-gay/d8d3bc3ecf4188df049d7a4726bb2a00", note: "VSDD" },
  ],
  agents: [
    { text: "Codex by OpenAI", url: "https://openai.com/codex/" },
    { text: "GitHub Copilot CLI", url: "https://github.com/features/copilot/cli" },
    { text: "OpenCode", url: "https://opencode.ai/" },
    { text: "nanobot", url: "https://github.com/HKUDS/nanobot" },
    { text: "OpenClaw", url: "https://docs.openclaw.ai/start/getting-started" },
  ],
};

const palette = {
  bg: "#FDFBF7",
  surface: "#F7F4EF",
  border: "#E4DDD4",
  text: "#1C1917",
  body: "#44403C",
  muted: "#93877A",
  accent: "#A16937",
  accentLight: "#C4935A",
  resource: "#7C5E3C",
};

function Arrow({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 11L11 1M11 1H4M11 1V8" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PreworkItem({ item, index }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
        textDecoration: "none",
        padding: "6px 0",
        lineHeight: 1.55,
      }}
    >
      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: palette.muted, minWidth: "20px" }}>
        {index + 1}.
      </span>
      <span style={{ color: palette.body, fontFamily: "var(--body)", fontSize: "15px" }}>
        {item.verb}{" "}
        <em style={{ color: palette.resource, fontStyle: "italic", fontWeight: 400 }}>{item.text}</em>
      </span>
      {item.note && (
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: palette.muted, whiteSpace: "nowrap" }}>
          {item.note}
        </span>
      )}
      <Arrow color={palette.accentLight} />
    </a>
  );
}

function WeekCard({ week, isOpen, onToggle }) {
  return (
    <div style={{ borderTop: `1px solid ${palette.border}` }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "baseline",
          gap: "20px",
          padding: "26px 0",
          textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.06em", color: palette.accent, minWidth: "56px", fontWeight: 500 }}>
          {week.label}
        </span>
        <span style={{ fontFamily: "var(--display)", fontSize: "21px", fontWeight: 400, color: palette.text, flex: 1, lineHeight: 1.35 }}>
          {week.title}
          {week.optional && (
            <span style={{
              display: "inline-block", marginLeft: "12px", fontSize: "9px", fontFamily: "var(--mono)",
              letterSpacing: "0.1em", textTransform: "uppercase", color: palette.muted,
              border: `1px solid ${palette.border}`, borderRadius: "3px", padding: "2px 7px", verticalAlign: "middle",
            }}>
              Optional
            </span>
          )}
        </span>
        <span style={{
          fontFamily: "var(--display)", fontSize: "22px", color: palette.muted, fontWeight: 300,
          transition: "transform 0.25s ease", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
        }}>
          +
        </span>
      </button>

      {isOpen && (
        <div style={{ paddingLeft: "76px", paddingBottom: "36px", paddingRight: "16px", animation: "fadeIn 0.25s ease" }}>
          <p style={{ fontFamily: "var(--body)", fontSize: "15.5px", lineHeight: 1.72, color: palette.body, marginBottom: "24px", maxWidth: "620px" }}>
            {week.intro}
          </p>
          {week.detail && (
            <p style={{ fontFamily: "var(--body)", fontSize: "14.5px", lineHeight: 1.7, color: palette.muted, marginBottom: "24px", maxWidth: "620px" }}>
              {week.detail}
            </p>
          )}

          {week.prework.length > 0 && (
            <div style={{ marginBottom: "26px" }}>
              <Label>Pre-work</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {week.prework.map((item, i) => <PreworkItem key={i} item={item} index={i} />)}
              </div>
            </div>
          )}

          {week.activity && (
            <div style={{
              background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: "8px",
              padding: "24px 26px", marginBottom: "26px", maxWidth: "660px",
            }}>
              <Label color={palette.accent}>Pre-work Activity</Label>
              <h5 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: 400, color: palette.text, marginBottom: "8px" }}>
                {week.activity.title}
              </h5>
              <p style={{ fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.72, color: palette.body, marginBottom: "14px" }}>
                {week.activity.description}
              </p>
              {week.activity.repo && (
                <a href={week.activity.repo.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontFamily: "var(--mono)", fontSize: "12px", color: palette.accent,
                    textDecoration: "none", marginBottom: "14px",
                  }}>
                  {week.activity.repo.label} <Arrow size={10} color={palette.accent} />
                </a>
              )}
              {week.activity.detail && (
                <p style={{ fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.72, color: palette.body, marginBottom: "14px" }}>
                  {week.activity.detail}
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {week.activity.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.6, color: palette.body }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: palette.accentLight, minWidth: "16px", paddingTop: "2px" }}>{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              {week.activity.deliverable && (
                <p style={{
                  fontFamily: "var(--mono)", fontSize: "11.5px", color: palette.muted, marginTop: "16px",
                  padding: "10px 14px", background: palette.bg, borderRadius: "4px", lineHeight: 1.6,
                }}>
                  Deliverable: {week.activity.deliverable}
                </p>
              )}
            </div>
          )}

          {week.successCriterion && (
            <div style={{ borderLeft: `3px solid ${palette.accent}`, paddingLeft: "20px", marginBottom: "26px", maxWidth: "620px" }}>
              <Label color={palette.accent}>The Success Criterion</Label>
              <p style={{ fontFamily: "var(--body)", fontSize: "15px", lineHeight: 1.72, color: palette.body }}>
                {week.successCriterion}
              </p>
            </div>
          )}

          {week.deliverableNote && (
            <p style={{
              fontFamily: "var(--mono)", fontSize: "11.5px", color: palette.muted, marginBottom: "26px",
              padding: "10px 14px", background: palette.surface, borderRadius: "4px", lineHeight: 1.6, maxWidth: "620px",
              border: `1px solid ${palette.border}`,
            }}>
              Deliverable: {week.deliverableNote}
            </p>
          )}

          <div style={{ marginBottom: week.liveActivity ? "26px" : "0" }}>
            <Label>Live Session</Label>
            <p style={{ fontFamily: "var(--body)", fontSize: "14.5px", lineHeight: 1.72, color: palette.body, maxWidth: "620px" }}>
              {week.session}
            </p>
          </div>

          {week.liveActivity && (
            <div style={{
              background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: "8px",
              padding: "24px 26px", maxWidth: "660px",
            }}>
              <Label color={palette.accent}>Live Session Activity</Label>
              <h5 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: 400, color: palette.text, marginBottom: "8px" }}>
                {week.liveActivity.title}
              </h5>
              <p style={{ fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.72, color: palette.body, marginBottom: "14px" }}>
                {week.liveActivity.description}
              </p>
              {week.liveActivity.repo && (
                <a href={week.liveActivity.repo.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontFamily: "var(--mono)", fontSize: "12px", color: palette.accent,
                    textDecoration: "none", marginBottom: "14px",
                  }}>
                  {week.liveActivity.repo.label} <Arrow size={10} color={palette.accent} />
                </a>
              )}
              {week.liveActivity.detail && (
                <p style={{ fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.72, color: palette.body, marginBottom: "14px" }}>
                  {week.liveActivity.detail}
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {week.liveActivity.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.6, color: palette.body }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: palette.accentLight, minWidth: "16px", paddingTop: "2px" }}>{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              {week.liveActivity.deliverable && (
                <p style={{
                  fontFamily: "var(--mono)", fontSize: "11.5px", color: palette.muted, marginTop: "16px",
                  padding: "10px 14px", background: palette.bg, borderRadius: "4px", lineHeight: 1.6,
                }}>
                  Deliverable: {week.liveActivity.deliverable}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ children, color }) {
  return (
    <div style={{
      fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
      color: color || palette.muted, marginBottom: "12px", fontWeight: 500,
    }}>
      {children}
    </div>
  );
}

function ResourceLink({ item }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "baseline", gap: "8px", textDecoration: "none", padding: "4px 0" }}>
      <em style={{ fontFamily: "var(--body)", fontSize: "14px", color: palette.resource, fontStyle: "italic", fontWeight: 400 }}>
        {item.text}
      </em>
      {item.note && (
        <span style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: palette.muted }}>{item.note}</span>
      )}
      <Arrow size={10} color={palette.accentLight} />
    </a>
  );
}

function ResourceSection({ title, items }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <Label>{title}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {items.map((item, i) => <ResourceLink key={i} item={item} />)}
      </div>
    </div>
  );
}

export default function AgenticSECourse() {
  const [openWeeks, setOpenWeeks] = useState(new Set());
  const toggle = (id) => setOpenWeeks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const expandAll = () => setOpenWeeks(new Set(weeks.map(w => w.id)));
  const collapseAll = () => setOpenWeeks(new Set());

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, color: palette.text,
      "--body": "'Source Serif 4', 'Source Serif Pro', Georgia, serif",
      "--display": "'Source Serif 4', 'Source Serif Pro', Georgia, serif",
      "--mono": "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        * { margin:0; padding:0; box-sizing:border-box; }
        ::selection { background: #D4C4A8; }
      `}</style>

      <header style={{ maxWidth: "820px", margin: "0 auto", padding: "72px 28px 0" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: palette.muted, marginBottom: "22px", fontWeight: 500 }}>
          Inverse Classroom · 5 Sessions + Capstone
        </div>
        <h1 style={{
          fontFamily: "var(--display)", fontSize: "clamp(34px, 5vw, 50px)", fontWeight: 300,
          lineHeight: 1.12, color: palette.text, marginBottom: "24px", letterSpacing: "-0.015em",
        }}>
          Agentic SE Course
        </h1>
        <p style={{ fontFamily: "var(--body)", fontSize: "17.5px", lineHeight: 1.75, color: palette.body, maxWidth: "580px", marginBottom: "16px" }}>
          Coding agents are already exceeding human throughput for many software engineering tasks. As model capabilities continue to improve, agents will increasingly be the primary producers of code. The engineering challenge shifts: the bottleneck is no longer writing code but ensuring that agent-produced code is correct, tested, coherent, and merge-ready, with as little human steering as possible.
        </p>
        <p style={{ fontFamily: "var(--body)", fontSize: "17.5px", lineHeight: 1.75, color: palette.body, maxWidth: "580px", marginBottom: "16px" }}>
          This course prepares you for that shift. You start by using a coding agent. Then you customise it. Then you learn disciplined workflows for complex codebases. And finally, you learn to design repositories built for agents: environments where teams of agents can do real work and do it right. The industry calls this <strong style={{ fontWeight: 600, color: palette.text }}>harness engineering</strong>.
        </p>
        <p style={{ fontFamily: "var(--body)", fontSize: "15px", lineHeight: 1.75, color: palette.body, maxWidth: "580px", marginBottom: "16px" }}>
          Each week you complete pre-work on your own (courses, readings, videos) and then we meet for one hour to discuss, ask questions, and work on something together.
        </p>
        <p style={{ fontFamily: "var(--mono)", fontSize: "12px", color: palette.accent, lineHeight: 1.6 }}>
          The Anthropic Skilljar courses used in Weeks 1 and 2 award certificates on completion.
        </p>
      </header>

      {/* Prerequisites */}
      <section style={{ maxWidth: "820px", margin: "0 auto", padding: "52px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: "8px", padding: "22px 24px" }}>
            <Label>Prerequisites</Label>
            <div style={{ fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.75, color: palette.body }}>
              <div style={{ marginBottom: "6px" }}>A working terminal (macOS, Linux, or WSL)</div>
              <div style={{ marginBottom: "6px" }}>A GitHub account with a repo to experiment on</div>
              <a href="https://anthropic.skilljar.com/ai-fluency-framework-foundations" target="_blank" rel="noopener noreferrer"
                style={{ color: palette.resource, textDecoration: "none", fontStyle: "italic" }}>
                AI Fluency: Framework & Foundations
              </a>
              <span style={{ color: palette.muted, fontSize: "12px" }}> — optional, if new to GenAI</span>
            </div>
          </div>
          <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: "8px", padding: "22px 24px" }}>
            <Label>Our Tool</Label>
            <div style={{ fontFamily: "var(--body)", fontSize: "14px", lineHeight: 1.75, color: palette.body }}>
              We use{" "}
              <a href="https://claude.com/product/claude-code" target="_blank" rel="noopener noreferrer"
                style={{ color: palette.text, textDecoration: "none", fontWeight: 600 }}>
                Claude Code
              </a>
              {" "}as our primary coding agent. The principles transfer directly to other agents (Codex, Copilot CLI, OpenCode), but having everyone on the same tool keeps things simple.
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={{ maxWidth: "820px", margin: "0 auto", padding: "56px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", fontWeight: 300, color: palette.text }}>
            Curriculum
          </h2>
          <div style={{ display: "flex", gap: "14px" }}>
            {[["Expand all", expandAll], ["Collapse all", collapseAll]].map(([label, fn]) => (
              <button key={label} onClick={fn} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--mono)", fontSize: "11px", color: palette.muted, letterSpacing: "0.04em",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {weeks.map(w => <WeekCard key={w.id} week={w} isOpen={openWeeks.has(w.id)} onToggle={() => toggle(w.id)} />)}
        <div style={{ borderTop: `1px solid ${palette.border}` }} />
      </section>

      {/* Resources */}
      <section style={{ maxWidth: "820px", margin: "0 auto", padding: "60px 28px 72px" }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", fontWeight: 300, color: palette.text, marginBottom: "28px" }}>
          All Resources
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px 52px" }}>
          <ResourceSection title="Courses" items={resources.courses} />
          <ResourceSection title="Documentation" items={resources.docs} />
          <ResourceSection title="Articles & Talks" items={resources.articles} />
          <ResourceSection title="Other Agents" items={resources.agents} />
        </div>
      </section>
    </div>
  );
}
