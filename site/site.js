/* ==========================================================================
   site.js: shared behaviour for the Agentic SE course site.
   Classic script, no modules, no network. Needs progress.js first
   (window.AgenticProgress); without it the page still switches tracks and
   toggles disclosures, and the progress features stay inert.

   LOAD ORDER
     <head>  the pre-paint snippet from week-1.html (sets html.track-codex,
             data-theme from ?theme= or localStorage "agentic-se-theme").
     <body>  ...page... <script src="progress.js"></script>
             <script src="site.js"></script>, then any page script, which
             can use window.AgenticSite once this file has run.

   ON EVERY PAGE
     - Track switch: input[type=radio][name=track]. Precedence on load:
       ?track= > localStorage "agentic-se-track" > learner.track in the
       progress record > "claude". A change writes the key, rewrites
       ?track= with replaceState, toggles html.track-codex, calls
       AgenticProgress.setTrack (on load only if it differs) and writes the
       live region [data-track-live].
     - Theme control: input[type=radio][name=theme] in header.topbar .topbar__inner.
       Three-way toggle (System, Light, Dark). Precedence on load:
       ?theme= > localStorage "agentic-se-theme" > "system". "System" removes
       data-theme on html; "Light" and "Dark" set data-theme="light" or "dark".
       A change saves the choice to localStorage "agentic-se-theme", announces
       the new theme to a polite live region, and syncs tabs via storage events.
     - Registers every week in COURSE (core items, outcome ids) with
       AgenticProgress.registerWeek, so summary() is complete everywhere.
     - Re-renders on AgenticProgress.on("change"), from this tab or another.
     - If localStorage is blocked, adds a .msg at the top of <main>.
     - Status messages go to a polite live region it creates.

   DATA-ATTRIBUTE CONTRACT (reuse on Weeks 3 to 5)
     Item ids are "w{week}:{itemId}" and should match COURSE below; an id
     missing from COURSE still works (taken from the DOM) and logs a
     console warning so the manifest can be updated.

     input[type=checkbox][data-progress-item="w3:pw-no-vibes"]
         Done checkbox. Tick: markItem(3, id, {status: "done",
         estimateMinutes: planned minutes}). Untick: {status: "todo"}.
         For ids not in COURSE add data-minutes, data-kind
         (video|reading|course|practice), data-tier="optional" and
         data-title; the track comes from the nearest [data-track]
         ancestor, else "both". The nearest .pw-row gets .is-done.
     input[type=number][data-progress-minutes="w3:pw-no-vibes"]
         "Took" minutes. Saved on change (not per keystroke); an empty
         field clears the value.
     [data-progress-took="w3:pw-no-vibes"]    shown only while done
     [data-progress-bullet="w3:pw-no-vibes"]  estimate tick against the
         minutes taken, drawn once minutes are logged
     [data-progress-budget="3"]  week hero: minutes left (28 px), the
         segmented time-budget bar coloured by kind (fill = done, outline =
         to do; widths are planned minutes), labels, key, the optional bar
         and a "Show as table" disclosure. Attributes on the same element:
         data-note="text under the bar". The "Session" date, time and
         timezone on the right come from the cohort calendar for that week
         and are left out when there is none.
     input[type=checkbox][data-progress-outcome="w3:o1"]  setOutcome
         (feature-detected). The nearest .oc__item gets .is-checked.
     [data-progress-outcome-count="3"]    "1 of 4 ticked"
     [data-course-map]           overview course map (3.1)
     [data-next-session]         next-session card body, from the cohort
         calendar. With no calendar it offers "Add your cohort calendar":
         a disclosure for the panel named by data-calendar-panel (the
         [data-calendar-drop] element with that id), else a link to
         progress.html#calendar-h.
     [data-calendar-tag]         shown only while the sample calendar is loaded
     [data-session-fact="3"]     <div> inside a dl.facts, filled with
         <dt>/<dd> for that week's session and hidden when there is none.
         data-label (default "When"), data-format="short" for "Thu 15 Oct 2026"
         (default is the long form, with the place).
     [data-session-aside="5"]    span.tb__aside, "Prefix <date time>", hidden
         when there is no session. data-prefix (default "Session").
     [data-calendar-drop]        cohort-calendar import panel: drop zone, a
         Choose file input, a "Paste calendar JSON" disclosure, inline errors
         (role=alert), then a one-line status with Replace and Remove (in-page
         confirmation). Add data-calendar-hide-when-loaded to hide the whole
         panel once a calendar is stored.
     [data-stage-log="3"]        stage-log form and entry list for that week
         (Weeks 3 and 5). Optional: data-stage-chart="id" (element that gets
         the timeline), data-stage-label (default "your log"),
         data-stage-intro, data-stage-empty. The form has a "This run failed"
         checkbox that sets `failed` on the entry.
     [data-stage-report="5"]     "Your report": per-change bars from that
         week's log against the baseline week (data-baseline-week, default 3),
         counting failed runs per change.
     [data-week-progress="3"]    "47 of 140.5 min done" for week lists
     form[data-quiz="3"]         self-check (3.4). Inside, each
         li.q[data-qid="q2"][data-answer="2"|"short"] holds the choices
         (radios name="q2", values 0..n) or a textarea, an empty
         [data-quiz-controls] and a .q__answer[id][hidden] panel with
         .q__verdict[data-verdict], the explanation and .q__source.
         site.js adds the confidence group, Check answer, self-score and
         the confident-error line, and persists with startAttempt (on
         first interaction), answer and submitAttempt (when every
         question has a grade). Copy the markup from week-1-check.html.
     [data-quiz-score="3"]       live score bar for the current attempt
     [data-quiz-end="3"]         end card: latest and best, Try again
     [data-quiz-summary="3"]     latest submitted score bar and best, for
                                 the week page
     fieldset.track-switch[data-announce-week="3"]  announces that week's
         totals; [data-announce-course] announces every week's total;
         otherwise data-announce-claude / data-announce-codex text.
     button[data-disclosure][aria-controls]  APG disclosure: toggles
         aria-expanded and the panel's hidden attribute; optional
         data-label-open / data-label-closed swap the text. Do not also
         bind the same button in a page script.

   COHORT CALENDAR  Comes from AgenticProgress.getCalendar() (see
     progress.js). No calendar means no next-session card content, no session
     dates, and "You are here" follows the learner's own progress.
     ?today=YYYY-MM-DD overrides today's date for testing.

   API  window.AgenticSite = {weeks, week(n), calendar(), session(n), kinds,
        track(), stageLog, weekStats(n, track?, state?), currentWeek(),
        nextSession(),
        attemptScore(a), attemptCells(a), quizSummary(week, state?),
        fmt(n), esc(s), glyph(kind), storageOK, announce(msg),
        onRender(fn), render()}
   ========================================================================== */
(function () {
  "use strict";

  var P = window.AgenticProgress || null;
  var root = document.documentElement;
  var TRACK_KEY = "agentic-se-track";
  var SCALE_MAX = 480;              // course-map axis, minutes
  var SCALE_TICKS = [0, 120, 240, 360, 480];

  /* ---------- course manifest ---------- */
  function it(id, track, minutes, kind, title, tier) {
    return { id: id, track: track, minutes: minutes, kind: kind, title: title, tier: tier || "core" };
  }
  function opt(id, track, minutes, kind, title) { return it(id, track, minutes, kind, title, "optional"); }

  // Minutes are the measured figures shown on each week page. Totals are
  // always sums of these, so the bar, the map and the copy agree.
  var WEEKS = [
    { n: 0, title: "Getting Started", href: "week-0.html", outcomes: ["o1", "o2", "o3", "o4"], items: [
      it("pw-ai-fluency", "both", null, "course", "AI Fluency: Framework & Foundations"),
      it("pw-ai-capabilities", "both", null, "course", "AI Capabilities and Limitations"),
      it("pw-install-claude", "claude", null, "practice", "Install Claude Code"),
      it("pw-install-codex", "codex", null, "practice", "Install Codex"),
      opt("pw-ai-foundations-openai", "both", 70, "course", "AI Foundations (OpenAI)")
    ] },
    { n: 1, title: "One Coding Agent", href: "week-1.html", outcomes: ["o1", "o2", "o3", "o4"], items: [
      it("pw-claude-101", "claude", 90, "course", "Claude Code 101"),
      it("pw-cc-in-action", "claude", 60, "course", "Claude Code in Action"),
      it("pw-best-practices", "claude", 22, "reading", "Best Practices for Claude Code"),
      it("pw-codex-get-started", "codex", 80, "course", "Get Started with Codex"),
      it("pw-codex-extend", "codex", 90, "course", "Extend Codex Workflows"),
      it("pw-codex-best-practices", "codex", 10, "reading", "Best practices (Codex docs)"),
      it("pw-codex-agents-md", "codex", 5, "reading", "Custom instructions with AGENTS.md")
    ] },
    { n: 2, title: "Adapting a Coding Agent", href: "week-2.html", outcomes: ["o1", "o2", "o3", "o4"], items: [
      it("pw-agent-skills", "claude", 60, "course", "Introduction to Agent Skills"),
      it("pw-codex-skills", "codex", 5.5, "reading", "Build skills"),
      it("pw-mcp", "both", 60, "course", "Introduction to Model Context Protocol"),
      it("pw-subagents", "claude", 45, "course", "Introduction to Subagents"),
      it("pw-scale-codex", "codex", 100, "course", "Scale Codex Across Teams and Systems"),
      it("pw-how-claude-works", "claude", 10.3, "reading", "How Claude Code Works"),
      it("pw-codex-sandbox", "codex", 6.8, "reading", "Sandbox"),
      it("pw-codex-approvals", "codex", 18.7, "reading", "Agent approvals & security"),
      it("pw-context-eng", "both", 13.3, "reading", "Effective Context Engineering for AI Agents"),
      opt("opt-codex-mcp", "codex", 11.1, "reading", "Model Context Protocol")
    ] },
    { n: 3, title: "One change through the whole loop", href: "week-3.html", deliverable: true,
      outcomes: ["o1", "o2", "o3", "o4"], items: [
      it("pw-no-vibes", "both", 20.5, "video", "No Vibes Allowed"),
      it("pw-rpi-wrong", "both", 26.8, "video", "Everything We Got Wrong About Research-Plan-Implement"),
      it("pw-monorepo", "claude", 19.0, "reading", "Set up Claude Code in a monorepo or large codebase"),
      it("pw-codex-agents-md", "codex", 4.9, "reading", "Custom instructions with AGENTS.md"),
      it("pw-goal", "claude", 9.2, "reading", "Keep Claude working toward a goal"),
      it("pw-codex-long-running", "codex", 3.2, "reading", "Long-running work"),
      it("pw-example-log", "both", 5, "reading", "Worked example log"),
      it("act-ship-one-issue", "both", 60, "practice", "Ship one lanorme issue by hand"),
      opt("opt-ace-fca", "both", 16.3, "reading", "Getting AI to Work in Complex Codebases"),
      opt("opt-qrspi", "both", 9.4, "reading", "From RPI to QRSPI"),
      opt("opt-dynamic-workflows", "claude", 24.5, "reading", "Orchestrate subagents at scale with dynamic workflows"),
      opt("opt-codex-subagents", "codex", 12.2, "reading", "Subagents")
    ] },
    { n: 4, title: "From harness to factory", href: "week-4.html", deliverable: true,
      outcomes: ["o1", "o2", "o3", "o4"], items: [
      it("pw-lloyd", "both", 20.6, "video", "Software Engineering Is Becoming Factory Engineering"),
      it("pw-horthy-fail", "both", 19.3, "video", "Why Software Factories Fail"),
      it("pw-bender", "both", 39.6, "video", "Software engineering at the tipping point"),
      it("pw-playbook", "both", 22.2, "reading", "The AI-native SDLC playbook"),
      it("act-factory-design", "both", 45, "practice", "Factory design document"),
      opt("opt-clinton", "both", 11.9, "reading", "How Anthropic secures its AI-native SDLC"),
      opt("opt-uber", "both", 18.4, "video", "Building Blocks for Uber's Software Factory"),
      opt("opt-cooke", "both", 19.0, "video", "No, That's Not a Software Factory"),
      opt("opt-ureview", "both", 15.1, "video", "Building uReview"),
      opt("opt-harnesses", "both", 9.1, "reading", "Effective harnesses for long-running agents"),
      opt("opt-sase", "both", 20.0, "reading", "Agentic Software Engineering, sections 2 and 5"),
      opt("opt-harness-engineering", "both", null, "reading", "Harness engineering")
    ] },
    { n: 5, title: "A minimal factory, measured", href: "week-5.html", deliverable: true, optional: true,
      range: [360, 480], outcomes: ["o1", "o2", "o3", "o4"], items: [] }
  ];
  var KINDS = { video: "Video", reading: "Reading", course: "Course", practice: "Practice" };
  var KIND_ORDER = ["video", "reading", "course", "practice"];
  var CONF = [[1, "Guess"], [2, "Unsure"], [3, "Fairly sure"], [4, "Certain"]];
  var SELF = [[2, "Matched"], [1, "Partly"], [0, "Missed"]];
  var LETTERS = "ABCDEFGH";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function fmt(n) { return n === null || n === undefined || !isFinite(n) ? "" : String(r1(n)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function param(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  function todayISO() {
    var o = param("today");
    if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function longDate(iso) {
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function glyph(kind) { return '<span class="glyph glyph--' + kind + '" aria-hidden="true"></span>'; }
  function week(n) { for (var i = 0; i < WEEKS.length; i++) if (WEEKS[i].n === n) return WEEKS[i]; return null; }
  function findItem(n, id) {
    var w = week(n);
    if (!w) return null;
    for (var i = 0; i < w.items.length; i++) if (w.items[i].id === id) return w.items[i];
    return null;
  }
  function parseRef(ref) {
    var m = /^w(\d+):(.+)$/.exec(ref || "");
    return m ? { week: parseInt(m[1], 10), id: m[2], key: ref } : null;
  }
  function byQid(a, b) {
    var x = parseInt(String(a.qid).replace(/\D+/g, ""), 10) || 0, y = parseInt(String(b.qid).replace(/\D+/g, ""), 10) || 0;
    return x - y;
  }
  function blankState() { return { learner: { track: "claude" }, items: {}, quizzes: {}, estimates: [], outcomes: {}, stageLogs: {} }; }
  function snap() { try { return P ? P.get() : blankState(); } catch (e) { return blankState(); } }

  var storageOK = (function () {
    try {
      var k = "agentic-se:probe";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  /* ---------- live region ---------- */
  var live = null;
  function announce(msg) {
    if (!live) return;
    live.textContent = "";
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* ---------- track ---------- */
  function validTrack(t) { return t === "claude" || t === "codex" ? t : null; }
  function initialTrack() {
    var t = validTrack(param("track"));
    if (t) { try { window.localStorage.setItem(TRACK_KEY, t); } catch (e) { /* blocked */ } return t; }
    try { t = validTrack(window.localStorage.getItem(TRACK_KEY)); } catch (e) { t = null; }
    if (t) return t;
    if (P) { try { t = validTrack(P.get().learner.track); } catch (e) { t = null; } }
    return t || "claude";
  }
  var track = initialTrack();
  function trackName(t) { return t === "codex" ? "Codex" : "Claude Code"; }
  function setRadios(t) {
    $$('input[type="radio"][name="track"]').forEach(function (r) { r.checked = r.value === t; });
  }
  function applyTrack(t, announceIt) {
    track = t;
    root.classList.toggle("track-codex", t === "codex");
    setRadios(t);
    render();
    if (announceIt) announceTrack(t);
  }
  function syncUrl(t) {
    try {
      var url = new URL(location.href);
      url.searchParams.set("track", t);
      history.replaceState(null, "", url.toString());
    } catch (e) { /* file:// in some browsers */ }
  }
  function announceTrack(t) {
    var region = $("[data-track-live]"), sw = $(".track-switch"), msg = "";
    if (!sw) return;
    if (sw.hasAttribute("data-announce-week")) {
      var n = parseInt(sw.getAttribute("data-announce-week"), 10), s = weekStats(n, t);
      msg = "Showing the " + trackName(t) + " track. Week " + n + " pre-work is " + fmt(s.planned) + " minutes, " + fmt(s.left) + " left.";
    } else if (sw.hasAttribute("data-announce-course")) {
      var parts = [];
      WEEKS.forEach(function (w) {
        var s = weekStats(w.n, t);
        if (s.planned !== null && !w.range) parts.push("Week " + w.n + ", " + fmt(s.planned) + " minutes");
      });
      msg = "Showing the " + trackName(t) + " track. Pre-work: " + parts.join("; ") + ".";
    } else {
      msg = sw.getAttribute("data-announce-" + t) || "";
    }
    if (region) { region.textContent = ""; setTimeout(function () { region.textContent = msg; }, 30); }
  }

  /* ---------- theme ---------- */
  var THEME_KEY = "agentic-se-theme";
  function validTheme(m) { return m === "light" || m === "dark" || m === "system" ? m : null; }
  function initialTheme() {
    var m = validTheme(param("theme"));
    if (m) return m;
    try { m = validTheme(window.localStorage.getItem(THEME_KEY)); } catch (e) { m = null; }
    return m || "system";
  }
  var currentTheme = initialTheme();
  function setThemeRadios(m) {
    $$('input[type="radio"][name="theme"]').forEach(function (r) { r.checked = r.value === m; });
  }
  function applyTheme(m, store) {
    m = validTheme(m) || "system";
    currentTheme = m;
    if (m === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", m);
    }
    if (store) {
      try { window.localStorage.setItem(THEME_KEY, m); } catch (e) { /* blocked */ }
      announceTheme(m);
    }
    setThemeRadios(m);
    if (started) render();
  }
  function announceTheme(m) {
    var label = m === "dark" ? "Dark" : (m === "light" ? "Light" : "System");
    var msg = "Theme: " + label;
    var region = document.querySelector('[aria-live="polite"]');
    if (!region) {
      region = document.createElement("div");
      region.className = "sr-only";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    region.textContent = "";
    setTimeout(function () { region.textContent = msg; }, 30);
  }
  function renderThemeSwitch() {
    var inner = document.querySelector("header.topbar .topbar__inner");
    if (!inner || inner.querySelector(".theme-switch")) return;
    var host = inner.querySelector(".topbar__right") || inner;

    var fieldset = document.createElement("fieldset");
    fieldset.className = "theme-switch";

    var legend = document.createElement("legend");
    legend.className = "sr-only";
    legend.textContent = "Theme";
    fieldset.appendChild(legend);

    var opts = document.createElement("div");
    opts.className = "theme-switch__opts";

    var iconSystem = '<svg class="theme-switch__icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 1 A7 7 0 0 1 8 15 Z" fill="currentColor"/></svg>';
    var iconLight = '<svg class="theme-switch__icon" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="3" fill="currentColor"/><line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/><line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/><line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/><line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/><line x1="3.05" y1="12.95" x2="4.1" y2="11.9"/><line x1="11.9" y1="4.1" x2="12.95" y2="3.05"/></svg>';
    var iconDark = '<svg class="theme-switch__icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14 9.5a5.5 5.5 0 0 1-7.5-7.5A6 6 0 1 0 14 9.5z"/></svg>';

    var items = [
      { value: "system", label: "System", icon: iconSystem },
      { value: "light", label: "Light", icon: iconLight },
      { value: "dark", label: "Dark", icon: iconDark }
    ];

    items.forEach(function (it) {
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "theme";
      radio.value = it.value;
      radio.id = "theme-" + it.value;
      if (it.value === currentTheme) radio.checked = true;

      var lbl = document.createElement("label");
      lbl.htmlFor = radio.id;
      lbl.innerHTML = it.icon + " " + it.label;

      opts.appendChild(radio);
      opts.appendChild(lbl);
    });

    fieldset.appendChild(opts);
    host.appendChild(fieldset);
  }

  /* ---------- stats ---------- */
  // Minutes done are the planned minutes of ticked items (not self-reported
  // time), so a 5 min reading moves the bar 5 min and a 90 min course 90.
  function weekStats(n, t, st) {
    t = t || track; st = st || snap();
    var w = typeof n === "object" ? n : week(n);
    var r = { n: w ? w.n : n, week: w, planned: null, done: 0, left: null, items: [], optional: [], doneCount: 0,
              total: 0, complete: false, hasItems: false, range: w && w.range ? w.range : null,
              notMeasured: [], optPlanned: 0, optDone: 0 };
    if (!w) return r;
    if (w.items && w.items.length) {
      r.hasItems = true;
      w.items.forEach(function (item) {
        if (item.track !== "both" && item.track !== t) return;
        var rec = st.items["w" + w.n + ":" + item.id] || null;
        var o = { item: item, rec: rec, done: !!rec && rec.status === "done" };
        if (item.tier === "optional") {
          r.optional.push(o);
          if (item.minutes !== null) { r.optPlanned += item.minutes; if (o.done) r.optDone += item.minutes; }
          return;
        }
        r.items.push(o);
        if (item.minutes === null) { r.notMeasured.push(item); return; }
        r.planned = (r.planned || 0) + item.minutes;
        if (o.done) r.done += item.minutes;
      });
      r.total = r.items.length;
      r.doneCount = r.items.filter(function (o) { return o.done; }).length;
      r.planned = r.planned === null ? null : r1(r.planned);
      r.done = r1(r.done);
      r.left = r.planned === null ? null : r1(r.planned - r.done);
      r.complete = r.total > 0 && r.doneCount === r.total;
      r.optPlanned = r1(r.optPlanned); r.optDone = r1(r.optDone);
    } else if (w.planned) {
      r.planned = w.planned[t];
      r.left = r.planned;
    }
    return r;
  }
  // The current week follows the cohort calendar, or else the first week
  // with core items left (3.1).
  function currentWeek(st) {
    var ns = nextSession();
    if (ns) return ns.week;
    st = st || snap();
    for (var i = 0; i < WEEKS.length; i++) {
      var s = weekStats(WEEKS[i].n, track, st);
      if (s.hasItems && !s.complete) return WEEKS[i].n;
    }
    return null;
  }

  /* ---------- quiz scoring (shared with progress.html) ---------- */
  function attemptScore(a) {
    var sc = (a && a.score) || {};
    return { value: (sc.auto || 0) + (sc.self || 0) / 2, max: (sc.autoMax || 0) + (sc.selfMax || 0) / 2 };
  }
  function attemptCells(a) {
    return (a && a.answers ? a.answers.slice() : []).sort(byQid).map(function (x) {
      if (x.type === "short") return typeof x.selfScore === "number" ? x.selfScore / 2 : null;
      return x.correct === true ? 1 : x.correct === false ? 0 : null;
    });
  }
  function quizSummary(n, st) {
    st = st || snap();
    var list = (st.quizzes && st.quizzes["w" + n]) || [];
    var done = list.filter(function (a) { return a.submittedAt; });
    var best = null;
    done.forEach(function (a, i) {
      var s = attemptScore(a);
      if (!best || s.value > best.value) best = { value: s.value, max: s.max, attempt: a, index: i + 1 };
    });
    return { all: list, submitted: done, latest: done.length ? done[done.length - 1] : null, best: best };
  }
  function scorebarHTML(cells, max) {
    var html = "";
    for (var i = 0; i < Math.max(max, cells.length); i++) {
      var v = cells[i], cls = v === 1 ? " is-full" : v === 0.5 ? " is-half" : v === 0 ? " is-zero" : "";
      html += '<span class="scorebar__cell' + cls + '"></span>';
    }
    return html;
  }

  /* ---------- manifest and DOM items ---------- */
  function adoptDomItems() {
    $$("[data-progress-item]").forEach(function (el) {
      var ref = parseRef(el.getAttribute("data-progress-item"));
      if (!ref) { if (window.console) console.warn("site.js: bad data-progress-item", el); return; }
      var w = week(ref.week);
      if (!w) { w = { n: ref.week, title: "Week " + ref.week, href: null, items: [] }; WEEKS.push(w); WEEKS.sort(function (a, b) { return a.n - b.n; }); }
      if (findItem(ref.week, ref.id)) return;
      var tr = el.closest("[data-track]"), row = el.closest(".pw-row");
      var title = el.getAttribute("data-title") || (row && $(".link-row__title", row) ? $(".link-row__title", row).textContent : ref.id);
      var mins = el.hasAttribute("data-minutes") ? parseFloat(el.getAttribute("data-minutes")) : null;
      w.items.push(it(ref.id, tr ? tr.getAttribute("data-track") : "both", isFinite(mins) ? mins : null,
        KINDS[el.getAttribute("data-kind")] ? el.getAttribute("data-kind") : "reading", title.trim(), el.getAttribute("data-tier") || "core"));
      if (window.console) console.warn("site.js: " + ref.key + " is not in the COURSE manifest; add it so the overview and progress pages count it.");
    });
  }
  function registerAll() {
    if (!P) return;
    WEEKS.forEach(function (w) {
      var core = (w.items || []).filter(function (i) { return i.tier !== "optional"; })
        .map(function (i) { return { id: i.id, track: i.track, minutes: i.minutes }; });
      try { P.registerWeek(w.n, core, w.outcomes); } catch (e) { /* older progress.js */ }
    });
  }

  /* ---------- items, minutes, outcomes ---------- */
  function onChange(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    if (el.name === "track" && el.type === "radio") {
      var t = validTrack(el.value);
      if (!t) return;
      try { window.localStorage.setItem(TRACK_KEY, t); } catch (err) { /* blocked */ }
      syncUrl(t);
      applyTrack(t, true);
      if (P && P.get().learner.track !== t) P.setTrack(t);
      return;
    }
    if (el.name === "theme" && el.type === "radio") {
      var m = validTheme(el.value);
      if (!m) return;
      applyTheme(m, true);
      return;
    }
    if (!P) return;
    var ref;
    if (el.hasAttribute("data-progress-item")) {
      ref = parseRef(el.getAttribute("data-progress-item"));
      if (!ref) return;
      var item = findItem(ref.week, ref.id);
      if (el.checked) {
        P.markItem(ref.week, ref.id, { status: "done", estimateMinutes: item && item.minutes !== null ? item.minutes : undefined });
      } else {
        P.markItem(ref.week, ref.id, { status: "todo" });
      }
      var s = weekStats(ref.week);
      var name = item ? item.title : ref.id;
      announce(name + (el.checked ? " marked done. " : " marked not done. ") +
        (s.left !== null ? fmt(s.left) + " of " + fmt(s.planned) + " minutes left this week." : ""));
    } else if (el.hasAttribute("data-progress-minutes")) {
      ref = parseRef(el.getAttribute("data-progress-minutes"));
      if (!ref) return;
      var v = String(el.value).trim(), n = v === "" ? NaN : Number(v);
      if (v !== "" && (!isFinite(n) || n < 0)) {
        el.setAttribute("aria-invalid", "true");
        announce("Enter the minutes as a number, 0 or more.");
        return;
      }
      el.removeAttribute("aria-invalid");
      P.markItem(ref.week, ref.id, { minutesSpent: n });   // NaN clears the value
      announce(v === "" ? "Minutes cleared." : "Saved: " + fmt(n) + " minutes.");
    } else if (el.hasAttribute("data-progress-outcome")) {
      ref = parseRef(el.getAttribute("data-progress-outcome"));
      if (!ref || !P.setOutcome) return;
      P.setOutcome(ref.week, ref.id, el.checked);
      var c = outcomeCount(ref.week, snap());
      announce("Outcome " + (el.checked ? "ticked" : "unticked") + ". " + c.checked + " of " + c.total + " ticked.");
    }
  }
  function outcomeCount(n, st) {
    var w = week(n), ids = (w && w.outcomes) || [];
    var dom = $$('[data-progress-outcome^="w' + n + ':"]').map(function (el) { return parseRef(el.getAttribute("data-progress-outcome")).id; });
    if (dom.length) ids = dom;
    var rec = (st.outcomes && st.outcomes["w" + n]) || {}, c = 0;
    ids.forEach(function (id) { if (rec[id] && rec[id].checked) c++; });
    return { checked: c, total: ids.length };
  }
  function bulletHTML(est, took, kind) {
    var hi = Math.max(est || 0, took || 0);
    var max = Math.max(10, Math.ceil(hi * 1.25 / 10) * 10);
    var v = took / max, e = est === null ? null : est / max;
    var label = (est === null ? "No estimate" : "Estimate " + fmt(est) + " min") + ", took " + fmt(took) + " min";
    return '<div class="bullet__track k-' + kind + '" role="img" aria-label="' + esc(label) + ', on a 0 to ' + max + ' minute scale">' +
      '<span class="bullet__bar" style="--v:' + v.toFixed(4) + '"></span>' +
      (e === null ? "" : '<span class="bullet__tick" style="--e:' + e.toFixed(4) + '"></span>') + "</div>" +
      '<span class="bullet__text" aria-hidden="true"><span class="muted">est</span> ' + (est === null ? "n/a" : fmt(est)) +
      ' <span class="muted">· took</span> ' + fmt(took) + ' <span class="muted">min</span></span>';
  }
  function renderItems(st) {
    $$("[data-progress-item]").forEach(function (el) {
      var key = el.getAttribute("data-progress-item"), rec = st.items[key];
      el.checked = !!rec && rec.status === "done";
      var row = el.closest(".pw-row");
      if (row) row.classList.toggle("is-done", el.checked);
    });
    $$("[data-progress-took]").forEach(function (el) {
      var rec = st.items[el.getAttribute("data-progress-took")];
      el.hidden = !(rec && rec.status === "done");
    });
    $$("[data-progress-minutes]").forEach(function (el) {
      if (document.activeElement === el) return;
      var rec = st.items[el.getAttribute("data-progress-minutes")];
      el.value = rec && typeof rec.minutesSpent === "number" ? String(rec.minutesSpent) : "";
    });
    $$("[data-progress-bullet]").forEach(function (el) {
      var ref = parseRef(el.getAttribute("data-progress-bullet")), rec = st.items[ref ? ref.key : ""];
      var item = ref ? findItem(ref.week, ref.id) : null;
      var show = rec && rec.status === "done" && typeof rec.minutesSpent === "number";
      el.hidden = !show;
      if (!show) { el.innerHTML = ""; el._sig = ""; return; }
      var est = typeof rec.estimateMinutes === "number" ? rec.estimateMinutes : item ? item.minutes : null;
      var sig = est + "|" + rec.minutesSpent;
      if (el._sig === sig) return;
      el._sig = sig;
      el.innerHTML = bulletHTML(est, rec.minutesSpent, item ? item.kind : "practice");
    });
    $$("[data-progress-outcome]").forEach(function (el) {
      var ref = parseRef(el.getAttribute("data-progress-outcome"));
      var rec = ref && st.outcomes && st.outcomes["w" + ref.week] ? st.outcomes["w" + ref.week][ref.id] : null;
      el.checked = !!(rec && rec.checked);
      if (!P || !P.setOutcome) el.disabled = true;
      var li = el.closest(".oc__item");
      if (li) li.classList.toggle("is-checked", el.checked);
    });
    $$("[data-progress-outcome-count]").forEach(function (el) {
      var c = outcomeCount(parseInt(el.getAttribute("data-progress-outcome-count"), 10), st);
      el.textContent = c.checked + " of " + c.total + " ticked";
    });
  }

  /* ---------- time-budget bar (3.2) ---------- */
  function segHTML(o, small) {
    var it2 = o.item;
    return '<span class="tb__seg k-' + it2.kind + (o.done ? " is-done" : "") + '" data-id="' + esc(it2.id) + '" style="--m:' +
      (it2.minutes || 1) + '" title="' + esc(it2.title + " · " + KINDS[it2.kind] + " · " + fmt(it2.minutes) + " min · " + (o.done ? "done" : "to do")) + '"></span>';
  }
  function budgetHTML(el, s) {
    var n = s.n, id = "tb-table-w" + n;
    var segs = s.items.filter(function (o) { return o.item.minutes !== null; });
    var kinds = {};
    segs.forEach(function (o) { kinds[o.item.kind] = (kinds[o.item.kind] || 0) + o.item.minutes; });
    var cal = calendar(), sess = sessionOf(n, cal);
    var note = el.getAttribute("data-note");
    var html = '<div class="tb">' +
      '<div class="tb__head"><div class="tb__headline">' +
      '<span class="stat"><span class="stat__value" data-tb-left></span><span class="stat__unit" data-tb-unit>min left</span></span>' +
      '<span class="tb__of" data-tb-of></span></div>' +
      (sess ? '<span class="tb__aside">Session <strong>' + whenHTML(sess, cal, false) + "</strong>" + sampleTag(cal) + "</span>" : "") +
      "</div>" +
      (segs.length ? '<figure class="tb__fig" role="img" data-tb-fig>' +
      '<div class="tb__bar">' + segs.map(function (o) { return segHTML(o); }).join("") + "</div>" +
      '<div class="tb__labels" aria-hidden="true">' + segs.map(function (o) {
        return '<span class="tb__label" style="--m:' + o.item.minutes + '">' + glyph(o.item.kind) + "<span>" + fmt(o.item.minutes) + "</span></span>";
      }).join("") + '</div><div class="tb__axis-title axis-title axis-title--x">Planned minutes</div></figure>' :
      '<p class="meta">Minutes for this week\'s items are not measured yet, so there is no time bar. The table lists every item.</p>');
    var opts = s.optional.filter(function (o) { return o.item.minutes !== null; });
    if (opts.length && s.planned) {
      var width = Math.min(100, s.optPlanned / s.planned * 100);
      html += '<div class="tb__optwrap"><span class="label">Optional, ' + fmt(s.optPlanned) + ' min' +
        (s.optional.length > opts.length ? ", plus " + (s.optional.length - opts.length) + " not measured" : "") + '</span></div>' +
        '<div class="tb__opt" aria-hidden="true" style="width:' + width.toFixed(2) + '%">' + opts.map(function (o) { return segHTML(o); }).join("") + "</div>";
    }
    html += '<div class="tb__key" role="group" aria-label="Key">' + KIND_ORDER.filter(function (k) { return kinds[k]; }).map(function (k) {
      return '<span class="tb__key-item k-' + k + '"><span class="kind__sw"></span>' + glyph(k) + KINDS[k] + ' <span class="num">' + fmt(kinds[k]) + " min</span></span>";
    }).join("") + '<span class="tb__key-item"><span class="cmap__key cmap__key--done" style="background:var(--text)"></span>Filled: done</span>' +
      '<span class="tb__key-item"><span class="cmap__key cmap__key--plan"></span>Outline: to do</span></div>';
    if (note) html += '<p class="meta tb__note">' + esc(note) + "</p>";
    html += '<button type="button" class="disclose" data-disclosure aria-expanded="false" aria-controls="' + id +
      '" data-label-open="Hide the table" data-label-closed="Show as table">Show as table</button>' +
      '<div class="table-scroll tb__table" id="' + id + '" tabindex="0" role="region" aria-label="Week ' + n + ' pre-work table" hidden><table class="data-table"><caption>Week ' + n + " pre-work, " + trackName(track) +
      ' track</caption><thead><tr><th scope="col">Item</th><th scope="col">Kind</th><th scope="col">Tier</th><th scope="col" class="r">Minutes</th><th scope="col">Status</th></tr></thead><tbody>' +
      s.items.concat(s.optional).map(function (o) {
        return '<tr><th scope="row">' + esc(o.item.title) + "</th><td>" + KINDS[o.item.kind] + "</td><td>" + (o.item.tier === "optional" ? "Optional" : "Core") +
          '</td><td class="r">' + (o.item.minutes === null ? "not measured" : fmt(o.item.minutes)) + '</td><td data-tb-status="' + esc(o.item.id) + '">' + (o.done ? "Done" : "To do") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
    return html;
  }
  function renderBudgets(st) {
    $$("[data-progress-budget]").forEach(function (el) {
      var n = parseInt(el.getAttribute("data-progress-budget"), 10), s = weekStats(n, track, st);
      var cal = calendar(), sig = track + "|" + s.items.concat(s.optional).map(function (o) { return o.item.id; }).join(",") +
        "|" + JSON.stringify([sessionOf(n, cal), cal && cal.timezone, cal && cal.sample]);
      if (el._sig !== sig) {
        var wasOpen = el._sig && $(".disclose", el) && $(".disclose", el).getAttribute("aria-expanded") === "true";
        el.innerHTML = budgetHTML(el, s);
        el._sig = sig;
        if (wasOpen) { var b = $(".disclose", el); b.setAttribute("aria-expanded", "true"); b.textContent = "Hide the table"; $("#" + b.getAttribute("aria-controls")).hidden = false; }
      }
      s.items.concat(s.optional).forEach(function (o) {
        $$('.tb__seg[data-id="' + o.item.id + '"]', el).forEach(function (seg) {
          seg.classList.toggle("is-done", o.done);
          seg.title = o.item.title + " · " + KINDS[o.item.kind] + " · " + fmt(o.item.minutes) + " min · " + (o.done ? "done" : "to do");
        });
        var cell = $('[data-tb-status="' + o.item.id + '"]', el);
        if (cell) cell.textContent = o.done ? "Done" : "To do";
      });
      var measured = s.planned !== null, fig = $("[data-tb-fig]", el);
      $("[data-tb-left]", el).textContent = measured ? fmt(s.left) : s.doneCount + " of " + s.total;
      $("[data-tb-unit]", el).textContent = measured ? "min left" : "items done";
      $("[data-tb-of]", el).textContent = measured ? fmt(s.done) + " of " + fmt(s.planned) + " min done · " + s.doneCount + " of " + s.total + " items" : "minutes not measured yet";
      if (fig) fig.setAttribute("aria-label", "Week " + n + ", " + trackName(track) + " track: " + fmt(s.left) + " of " + fmt(s.planned) +
        " minutes left, " + s.doneCount + " of " + s.total + " items done.");
      fitLabels(el);
    });
  }
  function fitLabels(ctx) {
    $$(".tb__label", ctx).forEach(function (lab) {
      lab.classList.remove("is-clipped");
      if (lab.scrollWidth > lab.clientWidth + 1) lab.classList.add("is-clipped");
    });
  }

  /* ---------- course map (3.1) ---------- */
  function mapView(w, st, cur) {
    var s = weekStats(w.n, track, st);
    var v = { w: w, s: s, current: cur === w.n, done: s.complete };
    var parts = ["Week " + w.n, w.title];
    if (s.range) parts.push("optional build of " + (s.range[0] / 60) + " to " + (s.range[1] / 60) + " hours");
    else if (s.planned === null) parts.push("pre-work minutes not measured yet" + (s.hasItems ? ", " + s.doneCount + " of " + s.total + " items done" : ""));
    else parts.push(fmt(s.planned) + " minutes planned" + (s.hasItems ? ", " + fmt(s.done) + " done" : ""));
    if (s.complete) parts.push("all core items done");
    if (w.deliverable) parts.push("deliverable");
    if (!w.href) parts.push("no page yet");
    if (v.current) parts.push("current week");
    v.sr = parts.join(", ");
    return v;
  }
  function mapTxtHTML(v) {
    var s = v.s, w = v.w, sub = "";
    var min = s.range ? fmt(s.range[0]) + " to " + fmt(s.range[1]) : s.planned === null ? "" : fmt(s.planned);
    if (s.complete) sub = glyph("check") + " all done";
    else if (s.hasItems && s.planned === null) sub = s.doneCount + " of " + s.total + " items";
    else if (s.hasItems) sub = fmt(s.done) + " done";
    else if (!w.href) sub = "no page yet";
    else if (w.optional) sub = "optional";
    return (min ? '<span class="cmap__min">' + min + "</span>" : "") +
      (sub ? '<span class="cmap__sub">' + sub + "</span>" : "") +
      (w.deliverable ? '<span class="cmap__deliv">' + glyph("diamond") + "Deliverable</span>" : "") +
      (v.current ? '<span class="cmap__here">You are here</span>' : "");
  }
  function mapRowStyle(v) {
    var s = v.s, p = s.planned !== null && !s.range ? s.planned / SCALE_MAX : 0;
    var st = "--p:" + p.toFixed(4) + ";--d:" + (s.done / SCALE_MAX).toFixed(4);
    if (s.range) st += ";--r0:" + (s.range[0] / SCALE_MAX).toFixed(4) + ";--r1:" + (s.range[1] / SCALE_MAX).toFixed(4);
    return st;
  }
  function mapTableRows(views) {
    return views.map(function (v) {
      var s = v.s;
      return '<tr><th scope="row">Week ' + v.w.n + "</th><td>" + esc(v.w.title) + '</td><td class="r">' +
        (s.range ? fmt(s.range[0]) + " to " + fmt(s.range[1]) : s.planned === null ? "not measured" : fmt(s.planned)) +
        '</td><td class="r">' + (s.hasItems ? fmt(s.done) : "") + "</td><td>" +
        (v.current ? "You are here" : s.complete ? "Done" : s.hasItems && s.done > 0 ? "Started" : "Not started") +
        "</td><td>" + (v.w.deliverable ? "Yes" : "") + "</td></tr>";
    }).join("");
  }
  function renderCourseMaps(st) {
    var cur = currentWeek(st);
    $$("[data-course-map]").forEach(function (el) {
      var views = WEEKS.map(function (w) { return mapView(w, st, cur); });
      if (el._track !== track) {
        el._track = track;
        el.innerHTML =
          '<figure class="cmap" aria-labelledby="cmap-title">' +
          '<div class="cmap__head"><p id="cmap-title" class="cmap__title">Pre-work by week, ' + trackName(track) + " track</p>" +
          '<div class="cmap__legend" aria-hidden="true"><span><i class="cmap__key cmap__key--done"></i>Done (filled as you tick items off)</span>' +
          '<span><i class="cmap__key cmap__key--plan"></i>Planned</span><span><i class="cmap__key cmap__key--range"></i>Range (Week 5: 6 to 8 h build)</span></div></div>' +
          '<div class="cmap__frame">' +
          '<div class="cmap__ytitle axis-title axis-title--y">Planned minutes of pre-work</div>' +
          '<div class="cmap__yaxis" aria-hidden="true">' + SCALE_TICKS.map(function (t) {
            return '<span style="bottom:' + (t / SCALE_MAX * 100) + '%">' + t + "</span>";
          }).join("") + "</div>" +
          '<div class="cmap__grid" aria-hidden="true">' + SCALE_TICKS.map(function (t) {
            return '<span class="' + (t === 0 ? "is-base" : "") + '" style="bottom:' + (t / SCALE_MAX * 100) + '%"></span>';
          }).join("") + "</div>" +
          '<div class="cmap__xaxis-wrap"><div class="cmap__xaxis" aria-hidden="true"><span style="left:0">0</span><span style="left:50%">240</span><span style="left:100%">480</span></div>' +
          '<div class="cmap__xaxis-title axis-title">Planned minutes of pre-work</div></div>' +
          '<ol class="cmap__weeks">' + views.map(function (v) {
            var w = v.w, s = v.s, tag = w.href ? "a" : "div";
            return '<li class="cmap__week' + (v.done ? " is-done" : "") + (v.current ? " is-current" : "") + (w.href ? "" : " is-nopage") +
              '" data-week="' + w.n + '" style="' + mapRowStyle(v) + '">' +
              "<" + tag + ' class="cmap__link"' + (w.href ? ' href="' + w.href + '"' : "") + ">" +
              '<span class="cmap__colwrap" aria-hidden="true">' +
              (s.range ? '<span class="cmap__range"></span>' : s.planned === null ? '<span class="cmap__nm">not measured</span>' :
                '<span class="cmap__col"></span><span class="cmap__fill"></span>') + "</span>" +
              '<span class="cmap__station" aria-hidden="true"></span>' +
              '<span class="cmap__wkcell" aria-hidden="true"><span class="cmap__wk">Week ' + w.n + "</span></span>" +
              '<span class="cmap__txt" aria-hidden="true" data-cmap-txt></span>' +
              '<span class="sr-only" data-cmap-sr></span>' +
              "</" + tag + "></li>";
          }).join("") + "</ol>" +
          '<div class="cmap__xtitle axis-title axis-title--x">Week</div></div>' +
          '<div class="cmap__foot">' +
          '<button type="button" class="disclose" data-disclosure aria-expanded="false" aria-controls="cmap-table" data-label-open="Hide the table" data-label-closed="Show as table">Show as table</button></div>' +
          '<div class="table-scroll" id="cmap-table" tabindex="0" role="region" aria-label="Pre-work by week table" hidden><table class="data-table"><caption>Pre-work by week, ' + trackName(track) + ' track, minutes</caption>' +
          '<thead><tr><th scope="col">Week</th><th scope="col">Title</th><th scope="col" class="r">Planned</th><th scope="col" class="r">Done</th><th scope="col">Status</th><th scope="col">Deliverable</th></tr></thead>' +
          "<tbody data-cmap-tbody></tbody></table></div></figure>";
      }
      views.forEach(function (v) {
        var li = $('.cmap__week[data-week="' + v.w.n + '"]', el);
        if (!li) return;
        li.setAttribute("style", mapRowStyle(v));
        li.classList.toggle("is-done", v.done);
        li.classList.toggle("is-current", v.current);
        $("[data-cmap-txt]", li).innerHTML = mapTxtHTML(v);
        $("[data-cmap-sr]", li).textContent = v.sr;
        var link = $("a.cmap__link", li);
        if (link) { if (v.current) link.setAttribute("aria-current", "step"); else link.removeAttribute("aria-current"); }
      });
      $("[data-cmap-tbody]", el).innerHTML = mapTableRows(views);
    });
  }
  function renderNextSession(st) {
    var c = calendar();
    $$("[data-next-session]").forEach(function (el) {
      var ns = nextSession();
      if (!c) {
        var pid = el.getAttribute("data-calendar-panel"), panel = pid && document.getElementById(pid);
        setHTML(el, '<p class="meta">No cohort calendar yet, so no session dates are shown.</p>' + (panel ?
          '<button type="button" class="disclose" data-disclosure aria-expanded="' + !panel.hidden + '" aria-controls="' + esc(pid) +
            '" data-label-open="Hide the calendar panel" data-label-closed="Add your cohort calendar">' + (panel.hidden ? "Add your cohort calendar" : "Hide the calendar panel") + "</button>" :
          '<a class="btn-text" href="progress.html#calendar-h">Add your cohort calendar</a>'));
        return;
      }
      if (!ns) {
        setHTML(el, '<p class="meta">All sessions in the ' + esc(c.cohort) + " calendar have passed.</p>");
        return;
      }
      var w = week(ns.week), s = weekStats(ns.week, track, st);
      var prep = s.range ? "a 6 to 8 h build" : s.planned === null ? "pre-work not measured yet" :
        fmt(s.planned) + " min" + (s.hasItems ? ", " + fmt(s.left) + " left" : "");
      setHTML(el, '<p class="next-card__date"><time datetime="' + ns.date + (ns.time ? "T" + ns.time : "") + '">' + longDate(ns.date) + "</time></p>" +
        (ns.time || ns.place ? '<p class="next-card__when">' + (ns.time ? esc(ns.time + (ns.timezone ? " " + ns.timezone : "")) : "") +
          (ns.time && ns.place ? " · " : "") + placeHTML(ns.place) + "</p>" : "") +
        '<p class="next-card__week">' + (w.href ? '<a href="' + w.href + '">' : "") + "Week " + w.n + ": " + esc(w.title) + (w.href ? "</a>" : "") + "</p>" +
        '<p class="meta">Prepare: ' + prep + (w.items.some(function (i) { return i.kind === "practice"; }) ? ", the pre-work activity included" : "") + ".</p>");
    });
    $$("[data-week-progress]").forEach(function (el) {
      var s = weekStats(parseInt(el.getAttribute("data-week-progress"), 10), track, st);
      el.hidden = !s.hasItems;
      el.textContent = !s.hasItems ? "" : s.complete ? "All core items done" :
        s.planned === null ? s.doneCount + " of " + s.total + " items done" : fmt(s.done) + " of " + fmt(s.planned) + " min done";
    });
  }

  /* ---------- self-check (3.4) ---------- */
  var quizzes = [];
  function latestAttempt(n) {
    var list = (snap().quizzes["w" + n]) || [];
    return list.length ? list[list.length - 1] : null;
  }
  function initQuiz(form) {
    var n = parseInt(form.getAttribute("data-quiz"), 10);
    var q = { week: n, form: form, cards: $$(".q[data-qid]", form), key: {}, attemptId: null, submitted: false, state: {} };
    q.cards.forEach(function (card) {
      var qid = card.getAttribute("data-qid"), a = card.getAttribute("data-answer");
      q.key[qid] = a === "short" ? "short" : parseInt(a, 10);
      q.state[qid] = { response: null, confidence: null, revealed: false, selfScore: null };
      injectControls(q, card, qid, a === "short");
    });
    var att = latestAttempt(n);
    if (att) {
      q.attemptId = att.attemptId;
      q.submitted = !!att.submittedAt;
      att.answers.forEach(function (x) {
        var s = q.state[x.qid];
        if (!s) return;
        if (x.response !== undefined && x.response !== null) s.response = x.response;
        if (typeof x.confidence === "number") s.confidence = x.confidence;
        if (x.revealedAt) s.revealed = true;
        if (typeof x.selfScore === "number") s.selfScore = x.selfScore;
      });
      syncControls(q);
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    form.addEventListener("change", function (e) { quizChange(q, e.target); });
    form.addEventListener("input", function (e) {
      if (e.target.tagName === "TEXTAREA") { var card = e.target.closest(".q"); q.state[card.getAttribute("data-qid")].response = e.target.value; renderCard(q, card); }
    });
    form.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("q__check")) reveal(q, b.closest(".q"));
      else if (b.hasAttribute("data-quiz-restart")) restart(q, b.getAttribute("data-quiz-restart") === "abandon");
    });
    quizzes.push(q);
    q.cards.forEach(function (card) { renderCard(q, card); });
  }
  function injectControls(q, card, qid, isShort) {
    var ctl = $("[data-quiz-controls]", card);
    if (!ctl) { ctl = document.createElement("div"); ctl.setAttribute("data-quiz-controls", ""); card.insertBefore(ctl, $(".q__answer", card)); }
    ctl.innerHTML = '<fieldset class="pills conf"><legend class="pills__legend">How sure are you?</legend><div class="pills__opts">' +
      CONF.map(function (c) {
        return '<input type="radio" name="' + qid + '-conf" id="' + qid + "-conf-" + c[0] + '" value="' + c[0] + '"><label for="' + qid + "-conf-" + c[0] + '">' + c[1] + "</label>";
      }).join("") + "</div></fieldset>" +
      '<div class="q__actions"><button type="button" class="btn btn--primary btn--small q__check" aria-describedby="' + qid + '-hint" disabled>Check answer</button>' +
      '<span class="meta q__hint" id="' + qid + '-hint"></span></div>';
    var panel = $(".q__answer", card);
    panel.setAttribute("tabindex", "-1");
    if (isShort) {
      panel.insertAdjacentHTML("beforeend", '<fieldset class="pills q__self"><legend class="pills__legend">How did your answer compare?</legend><div class="pills__opts">' +
        SELF.map(function (c) {
          return '<input type="radio" name="' + qid + '-self" id="' + qid + "-self-" + c[0] + '" value="' + c[0] + '"><label for="' + qid + "-self-" + c[0] + '">' + c[1] +
            ' <span class="pills__n">' + (c[0] / 2) + "</span></label>";
        }).join("") + "</div></fieldset>");
    }
    var src = $(".q__source a", card);
    panel.insertAdjacentHTML("beforeend", '<p class="q__flag" hidden>You were certain of this one. Read the source now: confident errors are the ones feedback fixes best. ' +
      (src ? '<a href="' + esc(src.getAttribute("href")) + '" target="_blank" rel="noopener noreferrer">Open the source<span class="sr-only"> (opens in a new tab)</span></a>' : "") + "</p>");
  }
  function syncControls(q) {
    q.cards.forEach(function (card) {
      var qid = card.getAttribute("data-qid"), s = q.state[qid];
      $$('input[name="' + qid + '"]', card).forEach(function (r) { r.checked = s.response !== null && parseInt(r.value, 10) === s.response; });
      var ta = $("textarea", card);
      if (ta) ta.value = typeof s.response === "string" ? s.response : "";
      $$('input[name="' + qid + '-conf"]', card).forEach(function (r) { r.checked = parseInt(r.value, 10) === s.confidence; });
      $$('input[name="' + qid + '-self"]', card).forEach(function (r) { r.checked = parseInt(r.value, 10) === s.selfScore; });
    });
  }
  function ensureAttempt(q) {
    if (!q.attemptId && P) { q.attemptId = P.startAttempt(q.week); q.submitted = false; }
    return q.attemptId;
  }
  function isShort(q, qid) { return q.key[qid] === "short"; }
  function graded(q, qid) {
    var s = q.state[qid];
    return s.revealed && (!isShort(q, qid) || s.selfScore !== null);
  }
  function value(q, qid) {
    var s = q.state[qid];
    if (!graded(q, qid)) return null;
    return isShort(q, qid) ? s.selfScore / 2 : s.response === q.key[qid] ? 1 : 0;
  }
  function quizChange(q, el) {
    if (!el || !el.name || !P) return;
    var card = el.closest(".q");
    if (!card) return;
    var qid = card.getAttribute("data-qid"), s = q.state[qid];
    if (q.submitted) return;
    if (el.name === qid && el.type === "radio") {
      if (s.revealed) return;
      s.response = parseInt(el.value, 10);
      ensureAttempt(q);
      P.answer(q.week, q.attemptId, { qid: qid, type: "mcq", response: s.response });
    } else if (el.tagName === "TEXTAREA") {
      if (s.revealed) return;
      s.response = el.value;
      if (el.value.trim()) { ensureAttempt(q); P.answer(q.week, q.attemptId, { qid: qid, type: "short", response: s.response }); }
    } else if (el.name === qid + "-conf") {
      if (s.revealed) return;
      s.confidence = parseInt(el.value, 10);
      ensureAttempt(q);
      P.answer(q.week, q.attemptId, { qid: qid, type: isShort(q, qid) ? "short" : "mcq", confidence: s.confidence });
    } else if (el.name === qid + "-self") {
      s.selfScore = parseInt(el.value, 10);
      P.answer(q.week, q.attemptId, { qid: qid, type: "short", selfScore: s.selfScore });
      announce("Question " + (q.cards.indexOf(card) + 1) + ": " + SELF.filter(function (x) { return x[0] === s.selfScore; })[0][1] + ", " + (s.selfScore / 2) + " of 1.");
      maybeSubmit(q);
    }
    renderCard(q, card);
    renderQuizScores();
  }
  function ready(q, qid) {
    var s = q.state[qid];
    var hasAnswer = isShort(q, qid) ? typeof s.response === "string" && s.response.trim() !== "" : typeof s.response === "number" && !isNaN(s.response);
    return { answer: hasAnswer, confidence: s.confidence !== null, ok: hasAnswer && s.confidence !== null };
  }
  function reveal(q, card) {
    if (!P) return;
    var qid = card.getAttribute("data-qid"), s = q.state[qid], r = ready(q, qid);
    if (!r.ok || s.revealed || q.submitted) return;
    ensureAttempt(q);
    P.answer(q.week, q.attemptId, { qid: qid, type: isShort(q, qid) ? "short" : "mcq", response: s.response, confidence: s.confidence, revealed: true });
    s.revealed = true;
    renderCard(q, card);
    var panel = $(".q__answer", card);
    panel.focus();
    var num = q.cards.indexOf(card) + 1;
    if (isShort(q, qid)) announce("Question " + num + ": answer shown. Compare it with yours, then score it.");
    else announce("Question " + num + ": " + (s.response === q.key[qid] ? "correct." : "not this one. The answer is " + LETTERS[q.key[qid]] + "."));
    maybeSubmit(q);
    renderQuizScores();
  }
  function maybeSubmit(q) {
    if (q.submitted || !q.attemptId) return;
    for (var i = 0; i < q.cards.length; i++) if (!graded(q, q.cards[i].getAttribute("data-qid"))) return;
    var a = P.submitAttempt(q.week, q.attemptId, q.key);
    q.submitted = true;
    q.cards.forEach(function (card) { renderCard(q, card); });
    var sc = attemptScore(a), sum = quizSummary(q.week);
    announce("Self-check saved: " + fmt(sc.value) + " of " + fmt(sc.max) + ". Your best is " + fmt(sum.best.value) + " of " + fmt(sum.best.max) + ".");
  }
  function restart(q, abandon) {
    q.attemptId = null;
    q.submitted = false;
    Object.keys(q.state).forEach(function (k) { q.state[k] = { response: null, confidence: null, revealed: false, selfScore: null }; });
    syncControls(q);
    q.cards.forEach(function (card) { renderCard(q, card); });
    renderQuizScores();
    var first = $("input, textarea", q.cards[0]);
    if (first) first.focus();
    announce(abandon ? "Answers cleared. Your next answer starts a new try." : "New try. Your earlier scores are kept.");
  }
  function renderCard(q, card) {
    var qid = card.getAttribute("data-qid"), s = q.state[qid], short = isShort(q, qid), r = ready(q, qid);
    var locked = s.revealed || q.submitted;
    card.classList.toggle("is-locked", locked);
    $$('input[name="' + qid + '"]', card).forEach(function (x) { x.disabled = locked; });
    var ta = $("textarea", card);
    if (ta) ta.readOnly = locked;
    $$('input[name="' + qid + '-conf"]', card).forEach(function (x) { x.disabled = locked; });
    $$('input[name="' + qid + '-self"]', card).forEach(function (x) { x.disabled = q.submitted; });
    var btn = $(".q__check", card), hint = $(".q__hint", card), actions = $(".q__actions", card);
    actions.hidden = s.revealed;
    btn.disabled = !r.ok || !P;
    hint.textContent = !P ? "Progress is unavailable, so answers cannot be checked." : r.ok ? "Your answer and confidence lock when you check." :
      !r.answer && !r.confidence ? (short ? "Write your answer, then say how sure you are." : "Pick an answer, then say how sure you are.") :
      !r.answer ? (short ? "Write your answer first." : "Pick an answer first.") : "Now say how sure you are.";
    var panel = $(".q__answer", card);
    panel.hidden = !s.revealed;
    var verdict = $("[data-verdict]", card) || $(".q__verdict", card);
    var flag = $(".q__flag", card);
    $$(".choice", card).forEach(function (c) {
      c.classList.remove("is-answer", "is-picked");
      $$(".choice__flag", c).forEach(function (f) { f.parentNode.removeChild(f); });
    });
    if (!s.revealed) { if (flag) flag.hidden = true; return; }
    if (!short) {
      var choices = $$(".choice", card), right = q.key[qid], ok = s.response === right;
      if (choices[right]) {
        choices[right].classList.add("is-answer");
        $("span", choices[right]).insertAdjacentHTML("beforeend", ' <span class="tag choice__flag">Answer</span>');
      }
      if (!ok && choices[s.response]) {
        choices[s.response].classList.add("is-picked");
        $("span", choices[s.response]).insertAdjacentHTML("beforeend", ' <span class="tag tag--draft choice__flag">Your pick</span>');
      }
      if (verdict) verdict.innerHTML = '<span class="verdict">' + glyph(ok ? "check" : "cross") + (ok ? "Correct" : "Not this one") + "</span> " +
        '<span class="verdict__sub">You picked ' + LETTERS[s.response] + "." + (ok ? "" : " The answer is " + LETTERS[right] + ".") + "</span>";
      if (flag) flag.hidden = !(!ok && s.confidence === 4);
    } else {
      var label = s.selfScore === null ? null : SELF.filter(function (x) { return x[0] === s.selfScore; })[0][1];
      if (verdict) verdict.innerHTML = label === null ? "Compare your answer with this one, then score it below." :
        '<span class="verdict">' + glyph(s.selfScore === 2 ? "check" : s.selfScore === 1 ? "half" : "cross") + label + '</span> <span class="verdict__sub">' +
        "counts as " + (s.selfScore / 2) + "</span>";
      if (flag) flag.hidden = !(s.selfScore === 0 && s.confidence === 4);
    }
  }
  function renderQuizScores() {
    var st = snap();
    quizzes.forEach(function (q) {
      var cells = q.cards.map(function (c) { return value(q, c.getAttribute("data-qid")); });
      var got = 0, checked = 0;
      cells.forEach(function (v) { if (v !== null) { got += v; checked++; } });
      var sum = quizSummary(q.week, st);
      var tryNo = sum.all.length + (q.attemptId ? 0 : 1);
      $$('[data-quiz-score="' + q.week + '"]').forEach(function (el) {
        el.innerHTML = '<div class="score"><span class="scorebar" role="img" aria-label="This try: ' + fmt(got) + " of " + cells.length + ", " + checked + " of " +
          cells.length + ' questions checked">' + scorebarHTML(cells, cells.length) + "</span>" +
          '<span class="score__text"><strong>' + fmt(got) + " of " + cells.length + "</strong>" +
          ' <span class="muted">· ' + checked + " of " + cells.length + " checked · try " + tryNo + "</span>" +
          (sum.best ? ' <span class="muted">· best</span> ' + fmt(sum.best.value) + " of " + fmt(sum.best.max) : "") + "</span></div>";
      });
      var restartBtn = $('[data-quiz-restart="abandon"]', q.form);
      if (restartBtn) restartBtn.hidden = q.submitted || !q.attemptId;
      $$('[data-quiz-end="' + q.week + '"]').forEach(function (el) {
        el.hidden = !q.submitted;
        if (!q.submitted || !sum.latest) return;
        var sc = attemptScore(sum.latest);
        el.innerHTML = '<p class="label label--ink">Your result, try ' + sum.all.length + "</p>" +
          '<div class="score"><span class="scorebar" role="img" aria-label="Latest try: ' + fmt(sc.value) + " of " + fmt(sc.max) + '">' +
          scorebarHTML(attemptCells(sum.latest), cells.length) + "</span>" +
          '<span class="score__text"><strong>Latest ' + fmt(sc.value) + " of " + fmt(sc.max) + '</strong> <span class="muted">· best</span> ' +
          fmt(sum.best.value) + " of " + fmt(sum.best.max) + ' <span class="muted">(try ' + sum.best.index + ")</span></span></div>" +
          scoreKey() +
          '<div class="btn-row"><button type="button" class="btn btn--primary btn--small" data-quiz-restart="new">Try again</button>' +
          '<a class="btn btn--small" href="progress.html">See my progress</a></div>' +
          '<p class="meta" style="margin-top:10px">Each try is kept. Your answers stay in this browser until you export them.</p>';
      });
    });
    $$("[data-quiz-summary]").forEach(function (el) {
      var n = parseInt(el.getAttribute("data-quiz-summary"), 10), sum = quizSummary(n, st), total = parseInt(el.getAttribute("data-questions") || "5", 10);
      if (!sum.latest) {
        el.innerHTML = '<div class="score"><span class="scorebar" role="img" aria-label="Not taken yet">' + scorebarHTML([], total) + "</span>" +
          '<span class="score__text"><span class="muted">Not taken yet. ' + total + " questions.</span></span></div>";
        return;
      }
      var sc = attemptScore(sum.latest);
      el.innerHTML = '<div class="score"><span class="scorebar" role="img" aria-label="Latest try: ' + fmt(sc.value) + " of " + fmt(sc.max) + '">' +
        scorebarHTML(attemptCells(sum.latest), total) + "</span>" +
        '<span class="score__text"><strong>Latest ' + fmt(sc.value) + " of " + fmt(sc.max) + '</strong> <span class="muted">· best</span> ' +
        fmt(sum.best.value) + " of " + fmt(sum.best.max) + ' <span class="muted">· ' + sum.submitted.length + (sum.submitted.length === 1 ? " try" : " tries") + "</span></span></div>" + scoreKey();
    });
  }
  function scoreKey() {
    return '<p class="score-card__key" aria-hidden="true"><span><i class="scorebar__cell is-full"></i>Right</span>' +
      '<span><i class="scorebar__cell is-half"></i>Half</span><span><i class="scorebar__cell is-zero"></i>Missed</span>' +
      '<span><i class="scorebar__cell"></i>Not checked</span></p>';
  }

  /* ---------- disclosures and gallery ---------- */
  function onClick(e) {
    var b = e.target.closest && e.target.closest("[data-disclosure]");
    if (!b) return;
    var panel = document.getElementById(b.getAttribute("aria-controls"));
    if (!panel) return;
    var open = b.getAttribute("aria-expanded") === "true";
    b.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
    var lab = b.getAttribute(open ? "data-label-closed" : "data-label-open");
    if (lab) b.textContent = lab;
  }

  /* ---------- cohort calendar ---------- */
  // The calendar lives in AgenticProgress (separate localStorage key). Without
  // one there are no session dates anywhere.
  function calendar() {
    var c = null;
    try { c = P && P.getCalendar ? P.getCalendar() : null; } catch (e) { c = null; }
    if (!c) return null;
    var by = {};
    c.sessions.forEach(function (s) { by[s.week] = s; });
    return { cohort: c.cohort, timezone: c.timezone || "", sessions: by, list: c.sessions, sample: false };
  }
  function sessionOf(n, c) { c = c || calendar(); return c && c.sessions[n] ? c.sessions[n] : null; }
  function shortDate(iso) {
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()].slice(0, 3) + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear();
  }
  function sampleTag(c) { return ""; }
  function timeText(s, c) { return s.time ? s.time + (c && c.timezone ? " " + c.timezone : "") : ""; }
  function placeHTML(place) {
    if (!place) return "";
    if (/^https?:\/\/\S+$/i.test(place)) return '<a href="' + esc(place) + '" target="_blank" rel="noopener noreferrer">' + esc(place) + '<span class="sr-only"> (opens in a new tab)</span></a>';
    return esc(place);
  }
  // "Thursday 15 October 2026 · 18:00 Europe/London · Room 1"
  function whenHTML(s, c, long) {
    var t = timeText(s, c);
    return '<time datetime="' + esc(s.date + (s.time ? "T" + s.time : "")) + '">' + (long ? longDate(s.date) : shortDate(s.date)) + "</time>" +
      (t ? " · " + esc(t) : "") + (long && s.place ? " · " + placeHTML(s.place) : "");
  }
  function setHTML(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }
  function renderSessions() {
    var c = calendar();
    $$("[data-session-fact]").forEach(function (el) {
      var s = sessionOf(parseInt(el.getAttribute("data-session-fact"), 10), c);
      el.hidden = !s;
      setHTML(el, s ? "<dt>" + esc(el.getAttribute("data-label") || "When") + "</dt><dd>" +
        whenHTML(s, c, el.getAttribute("data-format") !== "short") + sampleTag(c) + "</dd>" : "");
    });
    $$("[data-session-aside]").forEach(function (el) {
      var s = sessionOf(parseInt(el.getAttribute("data-session-aside"), 10), c);
      el.hidden = !s;
      setHTML(el, s ? esc(el.getAttribute("data-prefix") || "Session") + " <strong>" + whenHTML(s, c, false) + "</strong>" + sampleTag(c) : "");
    });
    $$("[data-calendar-tag]").forEach(function (el) { el.hidden = !(c && c.sample); });
  }
  function nextSession() {
    var c = calendar();
    if (!c) return null;
    var today = todayISO();
    for (var i = 0; i < WEEKS.length; i++) {
      var s = c.sessions[WEEKS[i].n];
      if (s && s.date >= today) return { week: WEEKS[i].n, date: s.date, time: s.time || "", place: s.place || "", timezone: c.timezone };
    }
    return null;
  }

  /* ---------- calendar import component: [data-calendar-drop] ---------- */
  var calSeq = 0;
  var CAL_MAX_BYTES = 200 * 1024;
  function calErrors(el, list) {
    var box = $("[data-cal-errors]", el);
    if (!box) return;
    box.innerHTML = list && list.length ? '<div class="msg msg--error"><p>The calendar was not loaded. ' + (list.length === 1 ? "One problem:" : list.length + " problems:") +
      "</p><ul>" + list.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul></div>" : "";
  }
  function calLoaded(el, c) {
    announce("Calendar loaded: " + c.cohort + ", " + c.list.length + (c.list.length === 1 ? " session." : " sessions."));
    var st = $("[data-cal-status]", el);
    if (st) st.focus();
  }
  function calLoadText(el, text) {
    var cs = el._cal, prev = cs.mode;
    if (!P || !P.setCalendar) { calErrors(el, ["Calendars cannot be loaded here because progress.js is missing."]); return false; }
    cs.mode = "auto"; cs.confirm = false;
    var res = P.setCalendar(text);
    if (!res.ok) {
      cs.mode = prev;
      calErrors(el, res.errors);
      announce("The calendar was not loaded. " + res.errors[0]);
      return false;
    }
    var c = calendar();
    if (c) calLoaded(el, c);
    return true;
  }
  function calLoadFile(el, file) {
    if (!file) return;
    if (!/\.json$/i.test(file.name || "") && !/json/i.test(file.type || "")) { calErrors(el, ["Choose a .json file. This one is called " + (file.name || "unnamed") + "."]); return; }
    if (file.size > CAL_MAX_BYTES) { calErrors(el, ["That file is larger than 200 KB, so it is not a calendar."]); return; }
    try {
      var r = new FileReader();
      r.onload = function () { calLoadText(el, String(r.result || "")); };
      r.onerror = function () { calErrors(el, ["The file could not be read."]); };
      r.readAsText(file);
    } catch (e) { calErrors(el, ["The file could not be read."]); }
  }
  function calFormHTML(el, uid, c) {
    return '<div class="cal__zone" data-cal-zone>' +
      '<p class="cal__zone-title">Drop your cohort\'s <code>calendar.json</code> here</p>' +
      '<p class="field-hint" id="' + uid + '-hint">Your course owner publishes one file per cohort. It is saved in this browser only and is never sent anywhere.</p>' +
      '<label class="field-label" for="' + uid + '-file">Choose file</label>' +
      '<input class="field" type="file" id="' + uid + '-file" data-cal-file accept=".json,application/json" aria-describedby="' + uid + '-hint"></div>' +
      '<button type="button" class="disclose" data-disclosure aria-expanded="false" aria-controls="' + uid + '-paste" data-label-open="Hide the paste box" data-label-closed="Paste calendar JSON">Paste calendar JSON</button>' +
      '<div class="cal__paste" id="' + uid + '-paste" hidden><label class="field-label" for="' + uid + '-text">Calendar JSON</label>' +
      '<textarea class="field" id="' + uid + '-text" rows="6" spellcheck="false" data-cal-text></textarea>' +
      '<div class="btn-row"><button type="button" class="btn btn--primary btn--small" data-cal-load>Load</button></div></div>' +
      '<div class="cal__errors" data-cal-errors role="alert"></div>' +
      (c ? '<div class="btn-row cal__cancel"><button type="button" class="btn btn--small" data-cal-cancel>Cancel</button></div>' : "");
  }
  function renderCalendar() {
    $$("[data-calendar-drop]").forEach(function (el) {
      var cs = el._cal || (el._cal = { mode: "auto", confirm: false, uid: "cal" + (++calSeq) });
      var c = calendar(), showForm = !c || cs.mode === "replace";
      var sig = JSON.stringify([c && [c.cohort, c.timezone, c.list], showForm, cs.confirm]);
      if (el._sig === sig) return;
      el._sig = sig;
      if (!el._bound) bindCalendar(el);
      var uid = cs.uid, html;
      if (c && !showForm) {
        html = '<div class="cal cal--loaded"><p class="cal__status" data-cal-status tabindex="-1">Calendar: <strong>' + esc(c.cohort) + "</strong> · " +
          c.list.length + (c.list.length === 1 ? " session" : " sessions") + (c.timezone ? " · " + esc(c.timezone) : "") + sampleTag(c) +
          ' <span class="cal__acts">· <button type="button" class="btn-text btn-text--ink" data-cal-replace>Replace</button> · <button type="button" class="btn-text btn-text--ink" data-cal-remove aria-expanded="' + cs.confirm + '">Remove</button></span></p>' +
          (cs.confirm ? '<div class="confirm" role="group" tabindex="-1" aria-labelledby="' + uid + '-cf" data-cal-confirm><p class="confirm__title" id="' + uid + '-cf">Remove this calendar?</p>' +
            "<p>Session dates and the next-session card disappear from the pages. Your progress is not affected.</p>" +
            '<div class="btn-row"><button type="button" class="btn btn--primary btn--small" data-cal-remove-yes>Remove it</button><button type="button" class="btn btn--small" data-cal-remove-no>Keep it</button></div></div>' : "") +
          "</div>";
      } else {
        html = '<div class="cal">' + calFormHTML(el, uid, c) + "</div>";
      }
      el.innerHTML = html;
      if (c && el.getAttribute("data-calendar-hide-when-loaded") !== null) el.hidden = true;
    });
  }
  function bindCalendar(el) {
    el._bound = true;
    function zone(e) { return e.target.closest ? e.target.closest("[data-cal-zone]") : null; }
    el.addEventListener("dragenter", function (e) { var z = zone(e); if (z) { e.preventDefault(); z.classList.add("is-over"); } });
    el.addEventListener("dragover", function (e) {
      var z = zone(e);
      if (!z) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      z.classList.add("is-over");
    });
    el.addEventListener("dragleave", function (e) {
      var z = zone(e);
      if (z && !(e.relatedTarget && z.contains(e.relatedTarget))) z.classList.remove("is-over");
    });
    el.addEventListener("drop", function (e) {
      var z = zone(e);
      if (!z) return;
      e.preventDefault();
      z.classList.remove("is-over");
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) calLoadFile(el, files[0]);
      else calErrors(el, ["Nothing was dropped. Drop a calendar.json file, or use Choose file."]);
    });
    el.addEventListener("change", function (e) {
      if (!e.target.matches || !e.target.matches("[data-cal-file]")) return;
      var f = e.target.files && e.target.files[0];
      calLoadFile(el, f);
      try { e.target.value = ""; } catch (err) { /* ignore */ }
    });
    el.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button") : null;
      if (!b || !el.contains(b)) return;
      var cs = el._cal;
      function redraw(sel) { renderCalendar(); var t = $(sel, el); if (t) t.focus(); }
      if (b.hasAttribute("data-cal-load")) {
        var ta = $("[data-cal-text]", el);
        if (!ta.value.trim()) { calErrors(el, ["Paste the calendar JSON first."]); ta.focus(); return; }
        calLoadText(el, ta.value);
      } else if (b.hasAttribute("data-cal-replace")) { cs.mode = "replace"; redraw("[data-cal-file]"); }
      else if (b.hasAttribute("data-cal-cancel")) { cs.mode = "auto"; redraw("[data-cal-replace]"); }
      else if (b.hasAttribute("data-cal-remove")) { cs.confirm = true; redraw("[data-cal-confirm]"); }
      else if (b.hasAttribute("data-cal-remove-no")) { cs.confirm = false; redraw("[data-cal-remove]"); }
      else if (b.hasAttribute("data-cal-remove-yes")) {
        cs.confirm = false; cs.mode = "auto";
        if (P && P.clearCalendar) P.clearCalendar();
        renderCalendar();
        announce("Calendar removed. Session dates are hidden.");
        var f = $("[data-cal-file]", el); if (f) f.focus();
      }
    });
  }

  /* ---------- stage log (Weeks 3 and 5) ---------- */
  // Form, entry list, bars and the per-change report, built on
  // AgenticProgress (logStage, updateStage, removeStage). Mounted from
  // [data-stage-log] and [data-stage-report]; also exposed as AgenticSite.stageLog.
  var SL = (function () {
    if (!P) return null;
    var S = { fmt: fmt, esc: esc };
    var CROSS = '<span class="glyph glyph--cross" aria-hidden="true"></span>';
    var STAGES = [["triage", "Triage"], ["spec", "Spec"], ["implement", "Implement"], ["review", "Review"], ["pr", "PR"], ["other", "Other"]];
    var CAUSES = [["", "Not set"], ["none", "None"], ["missing-context", "Missing context"], ["wrong-design", "Wrong design"], ["taste", "Taste"]];
    function nameOf(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i][1]; return k; }
    function stageIdx(k) { for (var i = 0; i < STAGES.length; i++) if (STAGES[i][0] === k) return i; return STAGES.length; }
    function norm(s) { return String(s || "").replace(/\s+/g, " ").trim().toLowerCase(); }
    function isNum(v) { return typeof v === "number" && isFinite(v); }
    function r2(n) { return String(Math.round(n * 100) / 100); }
    function usd(n) { return "$" + n.toFixed(2); }
    function tok(n) { return n >= 1000 ? r2(n / 1000).replace(/(\.\d)0$/, "$1") + "k" : String(n); }
    function mins(n) { return S.fmt(n) + " min"; }
    function entriesOf(week) {
      var s = P.get();
      return (s.stageLogs && Array.isArray(s.stageLogs["w" + week])) ? s.stageLogs["w" + week] : [];
    }
    function interventions(e) { var t = String(e.intervention || "").trim(); return t && !/^none\b/i.test(t) ? 1 : 0; }
    function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

    /* ---------- bars ---------- */
    function niceMax(max) {
      if (!(max > 0)) return 4;
      var base = Math.pow(10, Math.floor(Math.log(max) / Math.LN10)), ms = [1, 1.2, 1.6, 2, 2.4, 3.2, 4, 6, 8, 10];
      for (var i = 0; i < ms.length; i++) if (ms[i] * base >= max * 0.9999) return ms[i] * base;
      return 10 * base;
    }
    // spec: {title, sub, aria, unit ("min"|"$"), legend:[[barClass, label]], rows:[{label, series:[{v, cls}], val, flags:[html]}], total}
    function chart(spec) {
      var max = 0;
      spec.rows.forEach(function (r) { r.series.forEach(function (s) { if (isNum(s.v) && s.v > max) max = s.v; }); });
      var m = niceMax(max);
      var ticks = [0, 1, 2, 3, 4].map(function (i) {
        var t = m * i / 4, txt = spec.unit === "$" ? "$" + r2(t) : r2(t);
        return '<span style="left:' + (i * 25) + '%">' + txt + "</span>";
      }).join("");
      var h = '<figure class="stl" role="img" aria-label="' + esc(spec.aria) + '"><figcaption class="stl__title">' + esc(spec.title) + "</figcaption>";
      if (spec.sub) h += '<p class="stl__sub">' + esc(spec.sub) + "</p>";
      if (spec.legend) h += '<p class="stl__legend">' + spec.legend.map(function (l) { return '<span><i class="key-bar ' + l[0] + '"></i>' + esc(l[1]) + "</span>"; }).join("") + "</p>";
      h += '<div class="hbars"><div class="hbars__axis"><span></span><span class="hbars__ticks hbars__ticks--5" aria-hidden="true">' + ticks + "</span><span></span></div>";
      spec.rows.forEach(function (r) {
        h += '<div class="hbars__row"><span class="hbars__label">' + esc(r.label) + '</span><span class="hbars__plot stl__plot">' +
          r.series.map(function (s) {
            return isNum(s.v) ? '<span class="stl__bar ' + s.cls + '" style="--d:' + (s.v / m).toFixed(4) + '"></span>' : "";
          }).join("") + '</span><span class="hbars__val stl__val">' + r.val + (r.flags || []).map(function (f) { return '<span class="stl__flag">' + f + "</span>"; }).join("") + "</span></div>";
      });
      var axisTitle = spec.unit === "$" ? "Cost ($)" : "Human minutes";
      h += '<div class="hbars__axis hbars__axis--bottom"><span></span><span class="hbars__axis-title axis-title">' + esc(axisTitle) + "</span><span></span></div>";
      h += "</div>" + (spec.total ? '<p class="stl__total">' + spec.total + "</p>" : "") + "</figure>";
      return h;
    }
    function sorted(entries) {
      return entries.map(function (e, i) { return { e: e, i: i }; }).sort(function (a, b) {
        return stageIdx(a.e.stage) - stageIdx(b.e.stage) || a.i - b.i;
      }).map(function (x) { return x.e; });
    }
    // Two aligned small multiples in stage order: human minutes, then cost.
    function timeline(entries, label) {
      var list = sorted(entries), multi = false, seen = {};
      list.forEach(function (e) { seen[norm(e.change)] = 1; });
      multi = Object.keys(seen).length > 1;
      var tm = 0, tc = 0, tt = 0, ti = 0, anyT = false, anyC = false;
      var mrows = [], crows = [];
      list.forEach(function (e) {
        var n = interventions(e), where = multi && e.change ? esc(e.change) : "";
        if (isNum(e.humanMinutes)) tm += e.humanMinutes;
        if (isNum(e.costUsd)) { tc += e.costUsd; anyC = true; }
        if (isNum(e.tokens)) { tt += e.tokens; anyT = true; }
        ti += n;
        var tri = n ? '<span class="stl__tri" aria-hidden="true"></span>' + plural(n, "intervention", "interventions") : "no intervention";
        mrows.push({ label: nameOf(STAGES, e.stage), series: [{ v: e.humanMinutes, cls: "stl__bar--min" }],
          val: isNum(e.humanMinutes) ? "<strong>" + S.fmt(e.humanMinutes) + "</strong> min" : "not logged", flags: [tri].concat(e.failed === true ? [CROSS + "failed run"] : [], where ? [where] : []) });
        crows.push({ label: nameOf(STAGES, e.stage), series: [{ v: e.costUsd, cls: "stl__bar--cost" }],
          val: isNum(e.costUsd) ? "<strong>" + usd(e.costUsd) + "</strong>" : "not logged", flags: [isNum(e.tokens) ? tok(e.tokens) + " tokens" : "tokens not logged"].concat(where ? [where] : []) });
      });
      var ariaM = "Human minutes by stage, " + label + ": " + list.map(function (e) { return nameOf(STAGES, e.stage) + " " + (isNum(e.humanMinutes) ? S.fmt(e.humanMinutes) : "not logged"); }).join(", ") + "; " + S.fmt(tm) + " in all. The table gives every value.";
      var ariaC = "Cost by stage, " + label + ": " + list.map(function (e) { return nameOf(STAGES, e.stage) + " " + (isNum(e.costUsd) ? usd(e.costUsd) : "not logged"); }).join(", ") + (anyC ? "; " + usd(tc) + " in all." : ".");
      var total = "Total: " + S.fmt(tm) + " human minutes" + (anyT ? " · " + tok(tt) + " tokens" : "") + (anyC ? " · " + usd(tc) : "") + " · " + plural(ti, "intervention", "interventions");
      return chart({ title: "Human minutes by stage", sub: label, aria: ariaM, unit: "min", rows: mrows, total: total }) +
        chart({ title: "Cost by stage", sub: label, aria: ariaC, unit: "$", rows: crows });
    }

    /* ---------- log form and entry list ---------- */
    // cfg: {week, root, chartRoot, label, intro, onEntries}
    function mount(cfg) {
      var wk = cfg.week, root = cfg.root, uid = "slf" + wk;
      var editing = null, pending = null, lastSig = null, lastChange = "issue N";
      root.innerHTML =
        '<form class="slf" novalidate id="' + uid + '-form"><fieldset class="slf__set"><legend class="slf__legend" id="' + uid + '-legend">Log a stage</legend>' +
        '<p class="slf__intro">' + cfg.intro + "</p>" +
        '<div class="slf__grid">' +
        '<div class="slf__f"><label class="field-label" for="' + uid + '-change">Change</label><input class="field" type="text" id="' + uid + '-change" maxlength="80" autocomplete="off" aria-describedby="' + uid + '-change-h" value="issue N"><p class="field-hint" id="' + uid + '-change-h">Replace N with the issue number.</p></div>' +
        '<div class="slf__f"><label class="field-label" for="' + uid + '-stage">Stage</label><select class="field" id="' + uid + '-stage">' + STAGES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + "</option>"; }).join("") + "</select></div>" +
        '<div class="slf__f"><label class="field-label" for="' + uid + '-min">Human minutes</label><input class="field" type="number" min="0" step="any" inputmode="decimal" id="' + uid + '-min" aria-required="true"></div>' +
        '<div class="slf__f"><label class="field-label" for="' + uid + '-tok">Tokens</label><input class="field" type="number" min="0" step="1" inputmode="numeric" id="' + uid + '-tok" aria-describedby="' + uid + '-tok-h"><p class="field-hint" id="' + uid + '-tok-h">A count: 120000 for 120k.</p></div>' +
        '<div class="slf__f"><label class="field-label" for="' + uid + '-cost">Cost (USD)</label><input class="field" type="number" min="0" step="0.01" inputmode="decimal" id="' + uid + '-cost"></div>' +
        '<div class="slf__f"><label class="field-label" for="' + uid + '-cause">Cause of the intervention</label><select class="field" id="' + uid + '-cause">' + CAUSES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + "</option>"; }).join("") + "</select></div>" +
        '<div class="slf__f slf__f--wide"><label class="field-label" for="' + uid + '-ctx">Context given</label><input class="field" type="text" id="' + uid + '-ctx" maxlength="1000" autocomplete="off"></div>' +
        '<div class="slf__f slf__f--wide"><label class="field-label" for="' + uid + '-int">Intervention</label><input class="field" type="text" id="' + uid + '-int" maxlength="1000" autocomplete="off"></div>' +
        '<div class="slf__f slf__f--wide"><label class="field-label" for="' + uid + '-jdg">Judgement</label><input class="field" type="text" id="' + uid + '-jdg" maxlength="1000" autocomplete="off"></div>' +
        '<div class="slf__f slf__f--wide"><label class="check" for="' + uid + '-failed"><input type="checkbox" id="' + uid + '-failed">This run failed</label></div>' +
        "</div>" +
        '<div class="slf__actions"><button type="submit" class="btn btn--primary" id="' + uid + '-submit">Log this stage</button><button type="button" class="btn" id="' + uid + '-cancel" hidden>Cancel edit</button></div>' +
        '<p class="slf__msg" id="' + uid + '-msg" role="status"></p></fieldset></form>' +
        '<div class="slf" style="margin-top:16px"><h4 class="slf__lh" id="' + uid + '-lh" tabindex="-1">Your entries</h4><div id="' + uid + '-list"></div></div>';
      var f = {}; ["change", "stage", "min", "tok", "cost", "cause", "ctx", "int", "jdg", "failed", "submit", "cancel", "msg", "legend", "lh", "list", "form"].forEach(function (k) { f[k] = $("#" + uid + "-" + k, root); });
      f.change.addEventListener("focus", function () { if (f.change.value === "issue N") f.change.select(); });

      function say(t, err) { f.msg.textContent = t; f.msg.classList.toggle("is-error", !!err); }
      function invalid(el, on) { if (on) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
      function clearInvalid() { [f.change, f.min, f.tok, f.cost].forEach(function (el) { invalid(el, false); }); }
      function setMode(id) {
        editing = id;
        f.legend.textContent = id ? "Edit this stage" : "Log a stage";
        f.submit.textContent = id ? "Save changes" : "Log this stage";
        f.cancel.hidden = !id;
      }
      function resetFields(keep) {
        f.min.value = ""; f.tok.value = ""; f.cost.value = ""; f.ctx.value = ""; f.int.value = ""; f.jdg.value = ""; f.cause.value = ""; f.failed.checked = false;
        if (!keep) { f.change.value = lastChange; }
        clearInvalid();
      }
      function byId(id) { var l = entriesOf(wk); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
      function label(e) { return nameOf(STAGES, e.stage) + ", " + (e.change || "no change name"); }

      function listHTML(list) {
        if (!list.length) return '<p class="stl__empty">Nothing logged yet. Log the first stage above.</p>';
        return '<ol class="slf__list">' + list.map(function (e) {
          var facts = [isNum(e.humanMinutes) ? mins(e.humanMinutes) : "minutes not logged"];
          if (isNum(e.tokens) && e.tokens > 0) facts.push(tok(e.tokens) + " tokens");
          if (isNum(e.costUsd) && e.costUsd > 0) facts.push(usd(e.costUsd));
          if (e.cause) facts.push("cause: " + nameOf(CAUSES, e.cause).toLowerCase());
          if (e.failed === true) facts.push("failed run");
          var det = [["Context", e.contextGiven], ["Intervention", e.intervention], ["Judgement", e.judgement]].filter(function (d) { return d[1]; })
            .map(function (d) { return '<p class="slf__detail"><b>' + d[0] + "</b>" + esc(d[1]) + "</p>"; }).join("");
          var h = '<li class="slf__item' + (editing === e.id ? " is-editing" : "") + '" data-id="' + esc(e.id) + '"><div class="slf__main"><span class="slf__name">' +
            esc(nameOf(STAGES, e.stage)) + '</span> <span class="meta">' + esc(e.change) + '</span><div class="slf__facts">' + esc(facts.join(" · ")) + "</div>" + det + "</div>";
          h += '<div class="slf__acts"><button type="button" class="btn btn--small" data-act="edit">Edit<span class="sr-only"> ' + esc(label(e)) + '</span></button>' +
            '<button type="button" class="btn btn--small" data-act="remove">Remove<span class="sr-only"> ' + esc(label(e)) + "</span></button></div>";
          if (pending === e.id) {
            h += '<div class="confirm" role="group" tabindex="-1" aria-labelledby="' + uid + '-cf"><p class="confirm__title" id="' + uid + '-cf">Remove this entry?</p><p>' + esc(label(e)) +
              (isNum(e.humanMinutes) ? ", " + mins(e.humanMinutes) : "") + '. It leaves your progress record and the timeline. This cannot be undone.</p><div class="btn-row"><button type="button" class="btn btn--primary btn--small" data-act="remove-yes">Remove it</button><button type="button" class="btn btn--small" data-act="remove-no">Keep it</button></div></div>';
          }
          return h + "</li>";
        }).join("") + "</ol>";
      }
      function refresh(force) {
        var list = entriesOf(wk), sig = JSON.stringify(list);
        if (force || sig !== lastSig) {
          lastSig = sig;
          f.list.innerHTML = listHTML(list);
          f.lh.textContent = "Your entries (" + list.length + ")";
          if (cfg.chartRoot) cfg.chartRoot.innerHTML = list.length ? '<div class="stl-wrap">' + timeline(list, cfg.label) + "</div>" : '<p class="stl__empty">' + cfg.empty + "</p>";
          if (cfg.onEntries) cfg.onEntries(list);
        }
      }
      function nextStage(k) { var i = stageIdx(k); return STAGES[Math.min(i + 1, STAGES.length - 1)][0]; }

      f.form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        clearInvalid();
        var problems = [], first = null;
        function bad(el, msg) { invalid(el, true); problems.push(msg); if (!first) first = el; }
        var change = f.change.value.trim();
        if (!change || change === "issue N") bad(f.change, "Name the change, replacing N with the issue number.");
        var mv = f.min.value.trim(), m = Number(mv);
        if (mv === "" || !isFinite(m) || m < 0) bad(f.min, "Enter the human minutes, zero or more.");
        var tv = f.tok.value.trim(), cv = f.cost.value.trim();
        if (tv !== "" && !(isFinite(Number(tv)) && Number(tv) >= 0)) bad(f.tok, "Tokens must be zero or more.");
        if (cv !== "" && !(isFinite(Number(cv)) && Number(cv) >= 0)) bad(f.cost, "Cost must be zero or more.");
        if (problems.length) { say(problems.join(" "), true); first.focus(); return; }
        var entry = { change: change, stage: f.stage.value, humanMinutes: m, contextGiven: f.ctx.value, intervention: f.int.value, judgement: f.jdg.value, cause: f.cause.value || null,
          failed: f.failed.checked, tokens: tv === "" ? null : Number(tv), costUsd: cv === "" ? null : Number(cv) };
        lastChange = change;
        if (editing) {
          var id = editing;
          P.updateStage(wk, id, entry);
          setMode(null); resetFields(false); refresh(true);
          say("Saved changes to " + nameOf(STAGES, entry.stage) + ", " + change + ". Tokens or cost you left empty are now cleared.");
          var li = $('[data-id="' + id + '"] [data-act="edit"]', f.list); if (li) li.focus(); else f.stage.focus();
        } else {
          P.logStage(wk, entry);
          resetFields(true);
          f.stage.value = nextStage(entry.stage);
          say("Logged " + nameOf(STAGES, entry.stage) + " for " + change + ": " + mins(m) + ". The timeline is updated.");
          f.min.focus();
        }
      });
      f.cancel.addEventListener("click", function () {
        setMode(null); resetFields(false); say("Edit cancelled."); refresh(true); f.stage.focus();
      });
      f.list.addEventListener("click", function (ev) {
        var b = ev.target.closest && ev.target.closest("[data-act]");
        if (!b) return;
        var li = b.closest("[data-id]"), id = li && li.getAttribute("data-id"), act = b.getAttribute("data-act"), e = id && byId(id);
        if (act === "edit" && e) {
          pending = null; setMode(id);
          f.change.value = e.change; f.stage.value = e.stage; f.min.value = isNum(e.humanMinutes) ? e.humanMinutes : "";
          f.tok.value = isNum(e.tokens) ? e.tokens : ""; f.cost.value = isNum(e.costUsd) ? e.costUsd : "";
          f.ctx.value = e.contextGiven || ""; f.int.value = e.intervention || ""; f.jdg.value = e.judgement || ""; f.cause.value = e.cause || ""; f.failed.checked = e.failed === true;
          clearInvalid(); say("Editing " + label(e) + ". Change the fields, then save.");
          refresh(true);
          f.form.scrollIntoView({ block: "nearest" }); f.change.focus();
        } else if (act === "remove" && e) {
          pending = id; refresh(true);
          var c = $('[data-id="' + id + '"] .confirm', f.list); if (c) c.focus();
        } else if (act === "remove-no") {
          pending = null; refresh(true);
          var rb = $('[data-id="' + id + '"] [data-act="remove"]', f.list); if (rb) rb.focus();
        } else if (act === "remove-yes" && e) {
          var nm = label(e);
          pending = null;
          if (editing === id) { setMode(null); resetFields(false); }
          P.removeStage(wk, id); refresh(true);
          say("Removed " + nm + ".");
          f.lh.focus();
        }
      });
      resetFields(false);
      refresh(true);
      P.on("change", function () { refresh(false); });
      return { refresh: refresh };
    }
    /* ---------- per-change report (Week 5) ---------- */
    // rows: {label, notes:[html], fmin, bmin, fcost, bcost, failed}; failed is a count, or null when unknown
    function report(rows, what) {
      var legend = [["stl__bar--min", "Factory"], ["stl__bar--base", "Week 3 baseline"]];
      function mk(kind) {
        var mn = kind === "min";
        return chart({
          title: mn ? "Human minutes per change" : "Cost per change", sub: what, legend: legend, unit: mn ? "min" : "$",
          aria: (mn ? "Human minutes per change, factory against Week 3: " : "Cost per change, factory against Week 3: ") + rows.map(function (r) {
            var f = mn ? r.fmin : r.fcost, b = mn ? r.bmin : r.bcost, fm = function (x) { return mn ? mins(x) : usd(x); };
            return r.label + " " + (f === null ? "not logged" : fm(f)) + (b === null ? ", no baseline" : " against " + fm(b)) + (r.failed ? ", " + plural(r.failed, "failed run", "failed runs") : "");
          }).join("; ") + ". The table gives every value.",
          rows: rows.map(function (r) {
            var f = mn ? r.fmin : r.fcost, b = mn ? r.bmin : r.bcost;
            var u = function (x) { return mn ? "<strong>" + x + "</strong> min" : "<strong>" + usd(x) + "</strong>"; };
            var val = (f === null ? "not logged" : u(mn ? Math.round(f * 10) / 10 : f)) + " factory";
            if (b !== null) val += '<span class="stl__flag">' + (mn ? Math.round(b * 10) / 10 + " min" : usd(b)) + " Week 3</span>";
            var flags = [];
            if (b === null) flags.push("no baseline");
            if (r.failed === null) {} else flags.push(r.failed ? CROSS + plural(r.failed, "failed run", "failed runs") : "no failed runs");
            (r.notes || []).forEach(function (n) { flags.push(n); });
            return { label: r.label, series: [{ v: f, cls: "stl__bar--min" }].concat(b !== null ? [{ v: b, cls: "stl__bar--base" }] : []), val: val, flags: flags };
          })
        });
      }
      return mk("min") + mk("cost");
    }
    // Groups entries by change name: minutes, cost, entry count and failed runs.
    function groups(list) {
      var order = [], map = {};
      list.forEach(function (e) {
        var k = norm(e.change) || "(unnamed)";
        if (!map[k]) { map[k] = { name: e.change || "unnamed", min: null, cost: null, n: 0, failed: 0 }; order.push(k); }
        var g = map[k]; g.n++;
        if (e.failed === true) g.failed++;
        if (isNum(e.humanMinutes)) g.min = (g.min || 0) + e.humanMinutes;
        if (isNum(e.costUsd)) g.cost = (g.cost || 0) + e.costUsd;
      });
      return { order: order, map: map };
    }
    // el: [data-stage-report="5"] with data-baseline-week (default 3). Fills el from the learner's own logs.
    function renderReport(el) {
      var logWeek = parseInt(el.getAttribute("data-stage-report"), 10) || 5, baseWeek = parseInt(el.getAttribute("data-baseline-week"), 10) || 3;
      var f = entriesOf(logWeek), b3 = entriesOf(baseWeek), sig = JSON.stringify([f, b3]);
      if (sig === el._sig) return;
      el._sig = sig;
      if (!f.length) {
        el.innerHTML = '<div class="stl-wrap"><p class="stl__empty">Your report is empty. It fills as you log factory runs below. ' + (b3.length ? "Your Week " + baseWeek + " log is already here (" + plural(b3.length, "entry", "entries") + "), so a change you replay will be compared with it." : 'Log your Week ' + baseWeek + ' stages first, in <a href="week-' + baseWeek + '.html#slog-h">Your stage log</a> on the Week ' + baseWeek + ' page, then log the matching factory runs below.') + "</p></div>";
        return;
      }
      var gf = groups(f), gb = groups(b3);
      var rows = gf.order.map(function (k) {
        var g = gf.map[k], b = gb.map[k];
        return { label: g.name, notes: [plural(g.n, "stage", "stages") + " logged"], fmin: g.min, bmin: b ? b.min : null, fcost: g.cost, bcost: b ? b.cost : null, failed: g.failed };
      });
      el.innerHTML = '<div class="stl-wrap">' + report(rows, "from your logs; unlogged values are marked") + "</div>";
    }

    return { chart: chart, timeline: timeline, mount: mount, report: report, renderReport: renderReport, groups: groups, entriesOf: entriesOf, STAGES: STAGES, nameOf: nameOf, norm: norm, usd: usd, tok: tok, mins: mins, isNum: isNum, plural: plural, esc: esc };
  })();
  function mountStageLog(el) {
    if (!SL || el._mounted) return;
    el._mounted = true;
    var chartId = el.getAttribute("data-stage-chart");
    SL.mount({
      week: parseInt(el.getAttribute("data-stage-log"), 10), root: el, chartRoot: chartId ? document.getElementById(chartId) : null,
      label: el.getAttribute("data-stage-label") || "your log", intro: esc(el.getAttribute("data-stage-intro") || ""),
      empty: esc(el.getAttribute("data-stage-empty") || "Nothing logged yet.")
    });
  }

  /* ---------- render loop ---------- */
  var hooks = [];
  var started = false;
  function render() {
    if (!started) return;
    var st = snap();
    if (P) {
      renderItems(st);
      renderBudgets(st);
      renderQuizScores();
    }
    renderCourseMaps(st);
    renderSessions();
    renderNextSession(st);
    renderCalendar();
    $$("[data-stage-report]").forEach(function (el) { if (SL) SL.renderReport(el); });
    hooks.forEach(function (fn) { try { fn(st); } catch (err) { if (window.console) console.error(err); } });
  }
  function storageWarning() {
    if (storageOK || !P) return;
    var main = $("main");
    if (!main || $(".storage-warning", main)) return;
    var p = document.createElement("p");
    p.className = "msg msg--warn storage-warning";
    p.setAttribute("role", "status");
    p.textContent = "Progress cannot be saved in this browser. Export before you leave: My progress, Download JSON or Copy JSON.";
    main.insertBefore(p, main.firstChild);
  }
  function init() {
    live = document.createElement("div");
    live.className = "sr-only";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("data-site-live", "");
    document.body.appendChild(live);

    renderThemeSwitch();
    applyTheme(currentTheme, false);

    root.classList.toggle("track-codex", track === "codex");
    setRadios(track);
    if (P) {
      try { if (P.get().learner.track !== track) P.setTrack(track); } catch (e) { /* ignore */ }
    }
    adoptDomItems();
    registerAll();
    document.addEventListener("change", onChange);
    document.addEventListener("click", onClick);
    window.addEventListener("storage", function (e) {
      if (e.key === TRACK_KEY && validTrack(e.newValue) && e.newValue !== track) applyTrack(e.newValue, false);
      if (e.key === THEME_KEY && validTheme(e.newValue) && e.newValue !== currentTheme) applyTheme(e.newValue, false);
    });
    var t = null;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { fitLabels(document); }, 120);
    });
    started = true;
    $$("form[data-quiz]").forEach(initQuiz);
    $$("[data-stage-log]").forEach(mountStageLog);
    if (P) P.on("change", function () { render(); });
    storageWarning();
    render();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitLabels(document); });
  }

  window.AgenticSite = {
    weeks: WEEKS, week: week, calendar: calendar, session: function (n) { return sessionOf(n); }, stageLog: SL, kinds: KINDS, kindOrder: KIND_ORDER, conf: CONF,
    track: function () { return track; }, trackName: trackName,
    theme: function () { return currentTheme; }, setTheme: function (m) { applyTheme(m, true); },
    weekStats: weekStats, currentWeek: currentWeek, nextSession: nextSession,
    attemptScore: attemptScore, attemptCells: attemptCells, quizSummary: quizSummary, scorebarHTML: scorebarHTML,
    fmt: fmt, esc: esc, glyph: glyph, findItem: findItem, parseRef: parseRef,
    storageOK: storageOK, announce: announce,
    onRender: function (fn) { hooks.push(fn); if (started) { try { fn(snap()); } catch (e) { if (window.console) console.error(e); } } },
    render: render,
    setTrack: function (t) { t = validTrack(t); if (!t) return; try { window.localStorage.setItem(TRACK_KEY, t); } catch (e) { /* blocked */ } syncUrl(t); applyTrack(t, true); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
