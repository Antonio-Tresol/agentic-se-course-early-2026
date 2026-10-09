/* ==========================================================================
   AgenticProgress: browser-side progress tracking for the Agentic SE course.
   Classic script (no modules): works from file:// and in a sandboxed iframe.
   Defines window.AgenticProgress. No dependencies, no network calls.

   STORAGE   localStorage key "agentic-se:v2:progress" (namespaced because
             antonio-tresol.github.io is shared with other repos). Every
             access is wrapped in try/catch; if storage throws, state lives
             in memory for the page's lifetime. Other tabs are followed via
             the "storage" event.
   PRIVACY   Nothing leaves the browser except what the learner downloads or
             copies and sends. The alias is optional and chosen by them.
   CALENDAR  A cohort calendar the learner loads is kept under a separate key,
             "agentic-se:v2:calendar", and is never part of an export. See
             notes/progress/calendar.schema.json.
   SCHEMA    schemaVersion 1. See notes/progress/progress.schema.json.
             "outcomes" and "stageLogs" are optional, additive fields, so the
             version did not change.

   API (all synchronous unless stated; "change" fires after every write)
     get()                       deep copy of the stored state
     summary()                   per-week completion, minutes, quiz best,
                                 estimate count (see summary below)
     registerWeek(week, items, outcomeIds)
                                 items: [{id, track?: "claude"|"codex"|"both",
                                 minutes?}] or plain id strings. outcomeIds
                                 (optional): ["o1", "o2"], the week's outcomes
                                 checklist. Neither is stored.
     setTrack(track)             "claude" | "codex"
     setAlias(alias)             optional free text; "" clears it
     markItem(week, id, {status, minutesSpent, estimateMinutes})
     startAttempt(week)          returns attemptId
     answer(week, attemptId, {qid, type, response, confidence, revealed,
                              selfScore})   merges by qid
     submitAttempt(week, attemptId, answerKey)  grades and scores. answerKey:
                                 {q2: 2, q3: 1, q1: "short"}: a number is the
                                 correct MCQ index; "short" (or {type:"short"})
                                 is a self-scored question. Returns the attempt.
     addEstimate(entry)          Week 0 benchmark; ignored once revealed
     revealEstimate(taskId)
     setOutcome(week, outcomeId, checked)   "I can do this" checkbox; stored
                                 even when unchecked so a merge can tell
                                 which side is newer. Returns the record.
     logStage(week, entry)       Week 3 / Week 5 stage log. entry: {change,
                                 stage, humanMinutes, tokens, costUsd,
                                 contextGiven, intervention, cause,
                                 judgement, failed}. failed (boolean) marks
                                 a failed run. Returns the new id.
     updateStage(week, id, patch)  returns the entry, or null if unknown.
                                 Fields missing from patch keep their value;
                                 null clears tokens, costUsd and humanMinutes.
     removeStage(week, id)       boolean. A removal does not survive a merge
                                 with a file that still holds the entry.
     setDeliverable(week, {url, note, rubricSelf})
     exportObject() / exportJSON()
     download()                  boolean; false when likely blocked
     copyToClipboard()           Promise<boolean>
     importJSON(text, {mode})    "merge" (default) | "replace"; {ok, errors}
     setCalendar(obj)            validates a cohort calendar, stores it and sets
                                 learner.cohort. Returns {ok, errors}; nothing
                                 is stored when errors is not empty.
     getCalendar()               deep copy of the stored calendar, or null
     clearCalendar()             removes it (learner.cohort stays)
     reset()
     on("change", fn)            returns an unsubscribe function
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "agentic-se:v2:progress";
  var CAL_KEY = "agentic-se:v2:calendar";
  var CAL_SCHEMA = "agentic-se-calendar";
  var VERSION = 1;
  var SCHEMA = "agentic-se-progress";
  var APP_VERSION = "mockup-2026-10";
  var EVENT_CAP = 500;
  var TRACKS = ["claude", "codex"];
  var STATUSES = ["todo", "done", "skipped"];
  var STAGES = ["triage", "spec", "implement", "review", "pr", "other"];
  var CAUSES = ["missing-context", "wrong-design", "taste", "none"];

  var memory = null;        // serialised state used when storage is unavailable
  var registry = {};        // week -> [{id, track, minutes}]
  var outcomeRegistry = {}; // week -> [outcomeId]
  var listeners = [];
  var state = load();
  var calMemory = null;     // serialised calendar used when storage is unavailable

  /* ---------- small helpers ---------- */
  function nowISO() { return new Date().toISOString(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function num(v) { v = Number(v); return isFinite(v) ? v : null; }
  function clamp(v, lo, hi) { v = num(v); return v === null ? null : Math.min(hi, Math.max(lo, v)); }
  function rid(prefix) {
    var s = "";
    try {
      var a = new Uint8Array(8);
      (window.crypto || window.msCrypto).getRandomValues(a);
      for (var i = 0; i < a.length; i++) s += ("0" + a[i].toString(16)).slice(-2);
    } catch (e) {
      s = Math.random().toString(16).slice(2, 10) + Date.now().toString(16);
    }
    return prefix + s;
  }
  function wk(week) { return "w" + parseInt(week, 10); }
  function itemKey(week, id) { return wk(week) + ":" + id; }

  /* ---------- state and storage ---------- */
  function blank() {
    return {
      schemaVersion: VERSION,
      learner: { id: rid("L-"), alias: "", cohort: "early-2026", track: "claude", createdAt: nowISO() },
      items: {}, quizzes: {}, estimates: [], deliverables: {}, events: [],
      outcomes: {}, stageLogs: {}, certificates: {}
    };
  }
  function normalise(s) {
    var b = blank();
    s = isObj(s) ? s : {};
    b.learner = Object.assign(b.learner, isObj(s.learner) ? s.learner : {});
    if (TRACKS.indexOf(b.learner.track) < 0) b.learner.track = "claude";
    if (typeof b.learner.alias !== "string") b.learner.alias = "";
    b.items = isObj(s.items) ? s.items : {};
    b.quizzes = isObj(s.quizzes) ? s.quizzes : {};
    b.estimates = Array.isArray(s.estimates) ? s.estimates : [];
    b.deliverables = isObj(s.deliverables) ? s.deliverables : {};
    b.outcomes = isObj(s.outcomes) ? s.outcomes : {};
    b.stageLogs = isObj(s.stageLogs) ? s.stageLogs : {};
    b.certificates = isObj(s.certificates) ? s.certificates : {};
    b.events = Array.isArray(s.events) ? s.events.slice(-EVENT_CAP) : [];
    return b;
  }
  function readRaw() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return memory; }
  }
  function load() {
    var raw = readRaw(), parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
    var s = normalise(parsed && parsed.schemaVersion === VERSION ? parsed : null);
    if (!raw) persist(s);
    return s;
  }
  function persist(s) {
    var text = JSON.stringify(s);
    memory = text;
    try { window.localStorage.setItem(KEY, text); } catch (e) { /* memory only */ }
  }
  function emit(kind) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i]({ type: "change", kind: kind || "local" }); } catch (e) { /* ignore */ }
    }
  }
  function log(type, ref) {
    state.events.push({ t: nowISO(), type: type, ref: ref || "" });
    if (state.events.length > EVENT_CAP) state.events = state.events.slice(-EVENT_CAP);
  }
  function commit(type, ref) {
    if (type) log(type, ref);
    persist(state);
    emit("local");
  }
  try {
    window.addEventListener("storage", function (e) {
      if (e.key !== null && e.key !== KEY && e.key !== CAL_KEY) return;
      if (e.key !== CAL_KEY) state = load();
      emit("remote");
    });
  } catch (e) { /* no window events */ }

  /* ---------- learner ---------- */
  function setTrack(track) {
    if (TRACKS.indexOf(track) < 0) return false;
    state.learner.track = track;
    commit("track", track);
    return true;
  }
  function setAlias(alias) {
    state.learner.alias = String(alias || "").trim().slice(0, 40);
    commit("alias", "");
  }

  /* ---------- items ---------- */
  function registerWeek(week, items, outcomeIds) {
    if (Array.isArray(outcomeIds)) outcomeRegistry[wk(week)] = outcomeIds.map(String);
    registry[wk(week)] = (items || []).map(function (it) {
      if (typeof it === "string") it = { id: it };
      return { id: it.id, track: it.track || "both", minutes: num(it.minutes) };
    });
  }
  function markItem(week, id, opts) {
    opts = opts || {};
    var key = itemKey(week, id);
    var prev = state.items[key] || {};
    var status = STATUSES.indexOf(opts.status) >= 0 ? opts.status : (prev.status || "done");
    var it = { status: status, track: state.learner.track };
    if (status === "done") it.doneAt = nowISO();
    var mins = opts.minutesSpent !== undefined ? num(opts.minutesSpent) : num(prev.minutesSpent);
    var est = opts.estimateMinutes !== undefined ? num(opts.estimateMinutes) : num(prev.estimateMinutes);
    if (mins !== null && mins >= 0) it.minutesSpent = mins;
    if (est !== null && est >= 0) it.estimateMinutes = est;
    state.items[key] = it;
    commit("item:" + status, key);
    return clone(it);
  }

  /* ---------- quizzes ---------- */
  function attemptsOf(week, create) {
    var k = wk(week);
    if (!state.quizzes[k] && create) state.quizzes[k] = [];
    return state.quizzes[k] || [];
  }
  function findAttempt(week, attemptId) {
    var list = attemptsOf(week);
    for (var i = 0; i < list.length; i++) if (list[i].attemptId === attemptId) return list[i];
    return null;
  }
  function startAttempt(week) {
    var a = { attemptId: rid("A-"), startedAt: nowISO(), submittedAt: null, answers: [],
              score: { auto: 0, autoMax: 0, self: 0, selfMax: 0 } };
    attemptsOf(week, true).push(a);
    commit("quiz:start", wk(week));
    return a.attemptId;
  }
  function answer(week, attemptId, ans) {
    var a = findAttempt(week, attemptId);
    if (!a || a.submittedAt || !ans || !ans.qid) return false;
    var cur = null;
    a.answers.forEach(function (x) { if (x.qid === ans.qid) cur = x; });
    if (!cur) { cur = { qid: ans.qid, type: ans.type === "short" ? "short" : "mcq" }; a.answers.push(cur); }
    if (ans.type) cur.type = ans.type === "short" ? "short" : "mcq";
    if (ans.response !== undefined) cur.response = ans.response;
    if (ans.confidence !== undefined) cur.confidence = clamp(ans.confidence, 1, 4);
    if (ans.selfScore !== undefined) cur.selfScore = clamp(ans.selfScore, 0, 2);
    if (ans.revealed && !cur.revealedAt) cur.revealedAt = nowISO();
    commit("quiz:answer", wk(week) + ":" + ans.qid);
    return true;
  }
  function submitAttempt(week, attemptId, key) {
    var a = findAttempt(week, attemptId);
    if (!a) return null;
    key = key || {};
    var sc = { auto: 0, autoMax: 0, self: 0, selfMax: 0 };
    Object.keys(key).forEach(function (qid) {
      var spec = key[qid], isShort = spec === "short" || (isObj(spec) && spec.type === "short");
      var ans = null;
      a.answers.forEach(function (x) { if (x.qid === qid) ans = x; });
      if (isShort) {
        sc.selfMax += 2;
        if (ans) { ans.type = "short"; sc.self += ans.selfScore || 0; }
      } else {
        sc.autoMax += 1;
        var right = isObj(spec) ? spec.correct : spec;
        if (ans) { ans.type = "mcq"; ans.correct = ans.response === right; if (ans.correct) sc.auto += 1; }
      }
    });
    a.score = sc;
    a.submittedAt = nowISO();
    commit("quiz:submit", wk(week));
    return clone(a);
  }

  /* ---------- estimates and deliverables ---------- */
  function addEstimate(e) {
    if (!e || !e.taskId) return false;
    var list = state.estimates, i;
    for (i = 0; i < list.length; i++) {
      if (list[i].taskId === e.taskId) {
        if (list[i].revealedAt) return false;       // locked once revealed
        list.splice(i, 1);
        break;
      }
    }
    list.push({
      taskId: e.taskId, estimateMinutes: num(e.estimateMinutes),
      complexity: clamp(e.complexity, 1, 5), specQuality: clamp(e.specQuality, 1, 5),
      reason: String(e.reason || "").slice(0, 2000), pairId: e.pairId || "",
      submittedAt: nowISO(), revealedAt: null
    });
    commit("estimate:add", e.taskId);
    return true;
  }
  function revealEstimate(taskId) {
    var hit = false;
    state.estimates.forEach(function (e) {
      if (e.taskId === taskId && !e.revealedAt) { e.revealedAt = nowISO(); hit = true; }
    });
    if (hit) commit("estimate:reveal", taskId);
    return hit;
  }
  function setDeliverable(week, d) {
    d = d || {};
    var rubric = {};
    if (isObj(d.rubricSelf)) Object.keys(d.rubricSelf).forEach(function (r) {
      if (d.rubricSelf[r] === "developing" || d.rubricSelf[r] === "secure") rubric[r] = d.rubricSelf[r];
    });
    state.deliverables[wk(week)] = {
      url: String(d.url || "").slice(0, 500), note: String(d.note || "").slice(0, 2000),
      submittedAt: nowISO(), rubricSelf: rubric
    };
    commit("deliverable", wk(week));
  }

  /* ---------- outcomes ---------- */
  function setOutcome(week, outcomeId, checked) {
    if (outcomeId === undefined || outcomeId === null || outcomeId === "") return null;
    var k = wk(week), id = String(outcomeId);
    if (!isObj(state.outcomes[k])) state.outcomes[k] = {};
    var rec = { checked: !!checked, at: nowISO() };
    state.outcomes[k][id] = rec;
    commit("outcome:" + (rec.checked ? "check" : "uncheck"), k + ":" + id);
    return clone(rec);
  }

  /* ---------- stage logs ---------- */
  function text(v, max) { return String(v === undefined || v === null ? "" : v).slice(0, max); }
  function nonNeg(v) { if (v === null || v === undefined || v === "") return null; v = num(v); return v !== null && v >= 0 ? v : null; }
  // Builds a clean entry from user input; fields missing from `p` fall back to `base`.
  function cleanStage(p, base) {
    base = base || {};
    function pick(k) { return p[k] !== undefined ? p[k] : base[k]; }
    var stage = pick("stage"), cause = pick("cause");
    return {
      id: base.id, change: text(pick("change"), 80),
      stage: STAGES.indexOf(stage) >= 0 ? stage : "other",
      humanMinutes: nonNeg(pick("humanMinutes")), tokens: nonNeg(pick("tokens")), costUsd: nonNeg(pick("costUsd")),
      contextGiven: text(pick("contextGiven"), 1000), intervention: text(pick("intervention"), 1000),
      cause: CAUSES.indexOf(cause) >= 0 ? cause : null,
      judgement: text(pick("judgement"), 1000), failed: pick("failed") === true, at: nowISO()
    };
  }
  function stagesOf(week, create) {
    var k = wk(week);
    if (!Array.isArray(state.stageLogs[k]) && create) state.stageLogs[k] = [];
    return state.stageLogs[k] || [];
  }
  function logStage(week, entry) {
    var e = cleanStage(isObj(entry) ? entry : {});
    e.id = rid("S-");
    stagesOf(week, true).push(e);
    commit("stage:add", wk(week) + ":" + e.id);
    return e.id;
  }
  function updateStage(week, id, patch) {
    var list = stagesOf(week);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i] = cleanStage(isObj(patch) ? patch : {}, list[i]);
        commit("stage:update", wk(week) + ":" + id);
        return clone(list[i]);
      }
    }
    return null;
  }
  function removeStage(week, id) {
    var list = stagesOf(week), n = list.length;
    state.stageLogs[wk(week)] = list.filter(function (e) { return e.id !== id; });
    if (state.stageLogs[wk(week)].length === n) return false;
    commit("stage:remove", wk(week) + ":" + id);
    return true;
  }

  /* ---------- cohort calendar ---------- */
  var ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
  function validDate(s) {
    var m = typeof s === "string" ? ISO_DATE.exec(s) : null;
    if (!m) return false;
    var y = +m[1], mo = +m[2], d = +m[3], dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  }
  // Returns a list of human-readable problems; empty when the calendar is valid.
  function validateCalendar(c) {
    var errs = [];
    if (!isObj(c)) return ["The calendar must be a JSON object."];
    if (c.schema !== CAL_SCHEMA) errs.push('This is not a cohort calendar (schema should be "' + CAL_SCHEMA + '").');
    if (c.schemaVersion !== 1) errs.push("Unsupported schemaVersion " + c.schemaVersion + "; this page reads version 1.");
    if (typeof c.cohort !== "string" || !c.cohort.trim()) errs.push("cohort must be a non-empty text, for example early-2026.");
    else if (c.cohort.length > 40) errs.push("cohort must be 40 characters or fewer.");
    if (c.timezone !== undefined && (typeof c.timezone !== "string" || !c.timezone.trim() || c.timezone.length > 60)) errs.push("timezone must be a short text such as Europe/London.");
    if (!Array.isArray(c.sessions)) errs.push("sessions must be a list.");
    else {
      var seen = {};
      if (!c.sessions.length) errs.push("sessions must hold at least one session.");
      c.sessions.forEach(function (s, i) {
        var n = i + 1, pre = "Session " + n + ": ";
        if (!isObj(s)) { errs.push(pre + "must be an object with week and date."); return; }
        if (typeof s.week !== "number" || s.week % 1 !== 0 || s.week < 0 || s.week > 5) errs.push(pre + "week must be a whole number from 0 to 5.");
        else if (seen[s.week]) errs.push(pre + "week " + s.week + " is listed twice.");
        else seen[s.week] = true;
        if (!validDate(s.date)) errs.push(pre + "date must look like 2026-10-15.");
        if (s.time !== undefined && !(typeof s.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s.time))) errs.push(pre + "time must look like 18:30.");
        if (s.place !== undefined && (typeof s.place !== "string" || s.place.length > 200)) errs.push(pre + "place must be text of 200 characters or fewer.");
      });
    }
    return errs;
  }
  function cleanCalendar(c) {
    var out = { schema: CAL_SCHEMA, schemaVersion: 1, cohort: c.cohort.trim() };
    if (c.timezone) out.timezone = c.timezone.trim();
    out.sessions = c.sessions.map(function (s) {
      var o = { week: s.week, date: s.date };
      if (s.time) o.time = s.time;
      if (s.place && s.place.trim()) o.place = s.place.trim();
      return o;
    }).sort(function (a, b) { return a.week - b.week; });
    return out;
  }
  function getCalendar() {
    var raw;
    try { raw = window.localStorage.getItem(CAL_KEY); } catch (e) { raw = calMemory; }
    if (!raw) return null;
    try {
      var c = JSON.parse(raw);
      return validateCalendar(c).length ? null : cleanCalendar(c);
    } catch (e) { return null; }
  }
  function setCalendar(obj) {
    if (typeof obj === "string") {
      try { obj = JSON.parse(obj); } catch (e) { return { ok: false, errors: ["The text is not valid JSON."] }; }
    }
    var errors = validateCalendar(obj);
    if (errors.length) return { ok: false, errors: errors.slice(0, 10) };
    var c = cleanCalendar(obj), text = JSON.stringify(c);
    calMemory = text;
    try { window.localStorage.setItem(CAL_KEY, text); } catch (e) { /* memory only */ }
    state.learner.cohort = c.cohort;
    log("calendar:set", c.cohort);
    persist(state);
    emit("local");
    return { ok: true, errors: [] };
  }
  function clearCalendar() {
    var had = getCalendar() !== null;
    calMemory = null;
    try { window.localStorage.removeItem(CAL_KEY); } catch (e) { /* memory only */ }
    if (had) { log("calendar:clear", ""); persist(state); }
    emit("local");
    return had;
  }

  /* ---------- certificates ---------- */
  function setCertificate(week, courseId, data) {
    if (!isObj(data)) return { ok: false, errors: ["Data must be an object."] };
    var errs = [];
    var course = String(data.course || "").trim();
    if (!course) errs.push("course must be a non-empty string.");
    var platform = String(data.platform || "").trim();
    if (!platform) errs.push("platform must be a non-empty string.");
    var url = data.url;
    if (url === undefined || url === null || url === "") {
      url = null;
    } else if (typeof url !== "string" || !/^https:\/\/.+/i.test(url.trim())) {
      errs.push("url must be an https URL or null.");
    } else {
      url = url.trim();
    }
    var image = data.image;
    if (image === undefined || image === null || image === "") {
      image = null;
    } else if (typeof image !== "string" || !/^data:image\/jpeg;base64,/i.test(image)) {
      errs.push("image must be a JPEG data URL or null.");
    }
    if (!url && !image) {
      errs.push("At least one of url or image must be present.");
    }
    var earnedOn = data.earnedOn;
    if (earnedOn === undefined || earnedOn === null || earnedOn === "") {
      earnedOn = null;
    } else if (!validDate(earnedOn)) {
      errs.push("earnedOn must be a valid date in YYYY-MM-DD format, or null.");
    }
    if (errs.length) return { ok: false, errors: errs };
    var key = itemKey(week, courseId);
    state.certificates = state.certificates || {};
    state.certificates[key] = {
      course: course,
      platform: platform,
      url: url,
      image: image,
      earnedOn: earnedOn,
      addedAt: nowISO()
    };
    commit("certificate:set", key);
    return { ok: true, errors: [] };
  }
  function removeCertificate(week, courseId) {
    var key = itemKey(week, courseId);
    if (!state.certificates || !state.certificates[key]) return false;
    delete state.certificates[key];
    commit("certificate:remove", key);
    return true;
  }
  function getCertificates() {
    return clone(state.certificates || {});
  }

  /* ---------- summary ---------- */
  // Returns {track, weeks: {w1: {done, total, completion, minutes, quizBest,
  // estimates, outcomesChecked, outcomesTotal}}, totals: {done, total,
  // minutes, estimates}}. total and completion are null for weeks that were
  // not registered; so is outcomesTotal unless registerWeek got outcomeIds.
  function summary() {
    var track = state.learner.track, weeks = {}, tot = { done: 0, total: 0, minutes: 0, estimates: state.estimates.length };
    function slot(w) {
      return weeks[w] || (weeks[w] = { done: 0, total: null, completion: null, minutes: 0, quizBest: null, estimates: 0,
                                outcomesChecked: 0, outcomesTotal: null });
    }
    Object.keys(registry).forEach(function (w) {
      var ids = registry[w].filter(function (it) { return it.track === "both" || it.track === track; });
      var s = slot(w);
      s.total = ids.length;
      ids.forEach(function (it) {
        var rec = state.items[w + ":" + it.id];
        if (rec && rec.status === "done") s.done++;
      });
      s.completion = s.total ? s.done / s.total : null;
    });
    Object.keys(state.items).forEach(function (k) {
      var rec = state.items[k], w = k.split(":")[0], s = slot(w);
      if (typeof rec.minutesSpent === "number") { s.minutes += rec.minutesSpent; tot.minutes += rec.minutesSpent; }
    });
    Object.keys(outcomeRegistry).forEach(function (w) { slot(w).outcomesTotal = outcomeRegistry[w].length; });
    Object.keys(state.outcomes).forEach(function (w) {
      var ids = outcomeRegistry[w];
      Object.keys(state.outcomes[w]).forEach(function (id) {
        if (ids && ids.indexOf(id) < 0) return;      // not on this page's checklist
        if (state.outcomes[w][id] && state.outcomes[w][id].checked) slot(w).outcomesChecked++;
      });
    });
    Object.keys(state.quizzes).forEach(function (w) {
      var best = null;
      state.quizzes[w].forEach(function (a) {
        if (!a.submittedAt) return;
        var f = a.score.autoMax ? a.score.auto / a.score.autoMax : 0;
        if (!best || f > best._f) best = { auto: a.score.auto, autoMax: a.score.autoMax, self: a.score.self, selfMax: a.score.selfMax, _f: f };
      });
      if (best) { delete best._f; slot(w).quizBest = best; }
    });
    Object.keys(weeks).forEach(function (w) { tot.done += weeks[w].done; tot.total += weeks[w].total || 0; });
    return { track: track, weeks: weeks, totals: tot };
  }

  /* ---------- export ---------- */
  function uaFamily() {
    var ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
    if (/Edg\//.test(ua)) return "edge";
    if (/Firefox\//.test(ua)) return "firefox";
    if (/Chrome\/|CriOS/.test(ua)) return "chrome";
    if (/Safari\//.test(ua)) return "safari";
    return "other";
  }
  function exportObject() {
    var out = { schema: SCHEMA, schemaVersion: VERSION, exportedAt: nowISO(), appVersion: APP_VERSION, userAgentFamily: uaFamily() };
    var s = clone(state);
    delete s.schemaVersion;
    return Object.assign(out, s);
  }
  function exportJSON() { return JSON.stringify(exportObject(), null, 2); }
  function fileName() {
    var who = (state.learner.alias || state.learner.id).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || state.learner.id;
    return "agentic-se-progress-" + who + "-" + nowISO().slice(0, 10) + ".json";
  }
  function download() {
    try {
      var inFrame = window.self !== window.top;
      if (inFrame && (window.origin === "null" || location.origin === "null")) return false; // sandboxed: UI should fall back
      if (typeof Blob === "undefined" || !window.URL || !URL.createObjectURL) return false;
      var url = URL.createObjectURL(new Blob([exportJSON()], { type: "application/json" }));
      var a = document.createElement("a");
      a.href = url; a.download = fileName(); a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      return true;
    } catch (e) { return false; }
  }
  function copyToClipboard() {
    try {
      return navigator.clipboard.writeText(exportJSON()).then(function () { return true; }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  /* ---------- import ---------- */
  function validate(d) {
    var errs = [];
    if (!isObj(d)) return ["The file is not a JSON object."];
    if (d.schema !== SCHEMA) errs.push('Not a course progress file (schema should be "' + SCHEMA + '").');
    if (d.schemaVersion !== VERSION) errs.push("Unsupported schemaVersion " + d.schemaVersion + "; this page reads version " + VERSION + ".");
    if (!isObj(d.learner) || typeof d.learner.id !== "string" || !d.learner.id) errs.push("Missing learner.id.");
    else if (TRACKS.indexOf(d.learner.track) < 0) errs.push('learner.track must be "claude" or "codex".');
    if (!isObj(d.items)) errs.push("items must be an object.");
    else Object.keys(d.items).forEach(function (k) {
      if (!/^w\d+:.+/.test(k)) errs.push("Bad item key: " + k);
      else if (!isObj(d.items[k]) || STATUSES.indexOf(d.items[k].status) < 0) errs.push("Bad status for item " + k);
    });
    if (!isObj(d.quizzes)) errs.push("quizzes must be an object.");
    else Object.keys(d.quizzes).forEach(function (k) {
      if (!Array.isArray(d.quizzes[k])) errs.push("quizzes." + k + " must be an array.");
      else d.quizzes[k].forEach(function (a) { if (!isObj(a) || !a.attemptId || !Array.isArray(a.answers)) errs.push("Bad attempt in " + k); });
    });
    if (!Array.isArray(d.estimates)) errs.push("estimates must be an array.");
    else d.estimates.forEach(function (e) { if (!isObj(e) || !e.taskId) errs.push("Estimate without taskId."); });
    if (!isObj(d.deliverables)) errs.push("deliverables must be an object.");
    if (d.outcomes !== undefined) {
      if (!isObj(d.outcomes)) errs.push("outcomes must be an object.");
      else Object.keys(d.outcomes).forEach(function (w) {
        if (!/^w\d+$/.test(w) || !isObj(d.outcomes[w])) errs.push("Bad outcomes entry: " + w);
        else Object.keys(d.outcomes[w]).forEach(function (o) {
          if (!isObj(d.outcomes[w][o]) || typeof d.outcomes[w][o].checked !== "boolean") errs.push("Bad outcome " + w + ":" + o);
        });
      });
    }
    if (d.stageLogs !== undefined) {
      if (!isObj(d.stageLogs)) errs.push("stageLogs must be an object.");
      else Object.keys(d.stageLogs).forEach(function (w) {
        if (!Array.isArray(d.stageLogs[w])) errs.push("stageLogs." + w + " must be an array.");
        else d.stageLogs[w].forEach(function (e) { if (!isObj(e) || !e.id) errs.push("Stage log entry without id in " + w); });
      });
    }
    if (d.certificates !== undefined) {
      if (!isObj(d.certificates)) errs.push("certificates must be an object.");
      else Object.keys(d.certificates).forEach(function (k) {
        if (!/^w\d+:.+/.test(k)) errs.push("Bad certificate key: " + k);
        else {
          var c = d.certificates[k];
          if (!isObj(c)) errs.push("Certificate entry must be an object: " + k);
          else {
            if (typeof c.course !== "string" || !c.course.trim()) errs.push("Missing course in certificate " + k);
            if (typeof c.platform !== "string" || !c.platform.trim()) errs.push("Missing platform in certificate " + k);
            if (c.url !== null && (typeof c.url !== "string" || !/^https:\/\/.+/i.test(c.url))) errs.push("Invalid URL in certificate " + k);
            if (c.image !== null && (typeof c.image !== "string" || !/^data:image\/jpeg;base64,/i.test(c.image))) errs.push("Invalid image in certificate " + k);
            if (!c.url && !c.image) errs.push("Certificate must have url or image: " + k);
            if (c.earnedOn !== null && !validDate(c.earnedOn)) errs.push("Invalid earnedOn in certificate " + k);
            if (typeof c.addedAt !== "string") errs.push("Missing addedAt in certificate " + k);
          }
        }
      });
    }
    if (d.events !== undefined && !Array.isArray(d.events)) errs.push("events must be an array.");
    return errs.slice(0, 10);
  }
  function later(a, b) { return String(a || "") >= String(b || ""); }
  function merge(cur, inc) {
    Object.keys(inc.items).forEach(function (k) {
      var a = cur.items[k], b = inc.items[k];
      if (!a || later(b.doneAt, a.doneAt) && (b.doneAt || !a.doneAt)) cur.items[k] = b;
    });
    Object.keys(inc.quizzes).forEach(function (w) {
      var have = {};
      cur.quizzes[w] = cur.quizzes[w] || [];
      cur.quizzes[w].forEach(function (a) { have[a.attemptId] = 1; });
      inc.quizzes[w].forEach(function (a) { if (!have[a.attemptId]) cur.quizzes[w].push(a); });
    });
    inc.estimates.forEach(function (e) {
      var i = cur.estimates.map(function (x) { return x.taskId; }).indexOf(e.taskId);
      if (i < 0) cur.estimates.push(e);
      else if (later(e.revealedAt || e.submittedAt, cur.estimates[i].revealedAt || cur.estimates[i].submittedAt)) cur.estimates[i] = e;
    });
    Object.keys(inc.deliverables).forEach(function (w) {
      var a = cur.deliverables[w], b = inc.deliverables[w];
      if (!a || later(b.submittedAt, a.submittedAt)) cur.deliverables[w] = b;
    });
    Object.keys(inc.outcomes).forEach(function (w) {
      cur.outcomes[w] = cur.outcomes[w] || {};
      Object.keys(inc.outcomes[w]).forEach(function (o) {
        var a = cur.outcomes[w][o], b = inc.outcomes[w][o];
        if (!a || later(b.at, a.at)) cur.outcomes[w][o] = b;
      });
    });
    Object.keys(inc.stageLogs).forEach(function (w) {
      var list = cur.stageLogs[w] = Array.isArray(cur.stageLogs[w]) ? cur.stageLogs[w] : [];
      inc.stageLogs[w].forEach(function (e) {
        var i = list.map(function (x) { return x.id; }).indexOf(e.id);
        if (i < 0) list.push(e);
        else if (later(e.at, list[i].at)) list[i] = e;
      });
      list.sort(function (x, y) { return String(x.at) < String(y.at) ? -1 : 1; });
    });
    if (inc.certificates && isObj(inc.certificates)) {
      cur.certificates = cur.certificates || {};
      Object.keys(inc.certificates).forEach(function (k) {
        var a = cur.certificates[k], b = inc.certificates[k];
        if (!a || later(b.addedAt, a.addedAt)) cur.certificates[k] = b;
      });
    }
    var seen = {};
    cur.events = cur.events.concat(inc.events || []).filter(function (e) {
      var k = e.t + "|" + e.type + "|" + e.ref;
      return seen[k] ? false : (seen[k] = true);
    }).sort(function (x, y) { return x.t < y.t ? -1 : 1; }).slice(-EVENT_CAP);
    if (!cur.learner.alias && inc.learner.alias) cur.learner.alias = inc.learner.alias;
  }
  function importJSON(text, opts) {
    var mode = opts && opts.mode === "replace" ? "replace" : "merge", d;
    try { d = JSON.parse(text); } catch (e) { return { ok: false, errors: ["The text is not valid JSON."] }; }
    var errors = validate(d);
    if (errors.length) return { ok: false, errors: errors };
    var inc = normalise(d);
    if (mode === "replace") state = inc;
    else merge(state, inc);
    commit("import:" + mode, d.learner.id);
    return { ok: true, errors: [] };
  }

  function reset() {
    state = blank();
    commit("reset", "");
  }
  function on(name, fn) {
    if (name !== "change" || typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
  }

  window.AgenticProgress = {
    get: function () { return clone(state); },
    summary: summary, registerWeek: registerWeek, setTrack: setTrack, setAlias: setAlias,
    markItem: markItem, startAttempt: startAttempt, answer: answer, submitAttempt: submitAttempt,
    addEstimate: addEstimate, revealEstimate: revealEstimate,
    setCalendar: setCalendar, getCalendar: getCalendar, clearCalendar: clearCalendar,
    setOutcome: setOutcome, logStage: logStage, updateStage: updateStage, removeStage: removeStage, setDeliverable: setDeliverable,
    setCertificate: setCertificate, removeCertificate: removeCertificate, getCertificates: getCertificates,
    exportObject: exportObject, exportJSON: exportJSON, download: download,
    copyToClipboard: copyToClipboard, importJSON: importJSON, reset: reset, on: on,
    KEY: KEY, CALENDAR_KEY: CAL_KEY, SCHEMA_VERSION: VERSION
  };
})();
