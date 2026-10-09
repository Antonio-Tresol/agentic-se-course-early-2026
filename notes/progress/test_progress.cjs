/* Tests for ../../site/progress.js in a minimal DOM shim.
   Run:  node test_progress.cjs            (tests)
         node test_progress.cjs --samples  (also rewrites sample/*.json, synthetic data) */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), assert = require("assert");
const SRC = fs.readFileSync(path.join(__dirname, "../../site/progress.js"), "utf8");

/* ---- shim ---- */
let clock = Date.parse("2026-10-01T09:00:00Z");
function load(opts) {
  opts = opts || {};
  const store = opts.store || new Map();
  const listeners = {}, clicks = [];
  const win = {
    localStorage: opts.brokenStorage ? { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } }
      : { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    addEventListener: (n, f) => { (listeners[n] = listeners[n] || []).push(f); },
    crypto: globalThis.crypto, URL: { createObjectURL: () => "blob:x", revokeObjectURL() {} },
    Blob: function () {}, setTimeout: () => 0,
  };
  win.self = win; win.top = opts.framed ? {} : win; win.origin = opts.framed ? "null" : "http://localhost";
  win.document = { createElement: () => ({ click() { clicks.push(this.download); }, style: {} }),
                   body: { appendChild() {}, removeChild() {} } };
  win.navigator = { userAgent: "Mozilla/5.0 Chrome/120 Safari/537.36", clipboard: { writeText: () => opts.clipboardFails ? Promise.reject(new Error("no")) : Promise.resolve() } };
  win.location = { origin: win.origin };
  const FakeDate = class extends Date { constructor(...a) { super(...(a.length ? a : [clock])); } static now() { return clock; } };
  const ctx = vm.createContext(Object.assign(win, { window: win, Date: FakeDate, JSON, Promise, Uint8Array, setTimeout: win.setTimeout,
    Math, Object, Array, String, Number, isFinite, parseInt, Error, RegExp }));
  vm.runInContext(SRC, ctx);
  return { P: win.AgenticProgress, store, listeners, clicks, win };
}
const tick = (min) => { clock += (min || 1) * 60000; };

/* ---- tests ---- */
let passed = 0;
const eq = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b)); // cross-realm safe
function test(name, fn) { fn(); passed++; console.log("ok   " + name); }
const KEY = "agentic-se:v2:progress";

test("fresh state, namespaced key, random id", () => {
  const { P, store } = load();
  const s = P.get();
  assert.strictEqual(s.schemaVersion, 1);
  assert.match(s.learner.id, /^L-[0-9a-f]{16}$/);
  assert.strictEqual(s.learner.cohort, "early-2026");
  assert.strictEqual(s.learner.alias, "");
  assert.ok(store.has(KEY));
});

test("marking items and summary against registered totals", () => {
  const { P } = load();
  P.registerWeek(1, [{ id: "pw-1" }, { id: "pw-2", track: "claude" }, { id: "pw-3", track: "codex" }, "pw-4"]);
  P.markItem(1, "pw-1", { status: "done", minutesSpent: 25, estimateMinutes: 20 });
  tick(); P.markItem(1, "pw-2", { status: "done", minutesSpent: 40 });
  P.markItem(1, "pw-4", { status: "skipped" });
  let s = P.summary();
  assert.strictEqual(s.weeks.w1.total, 3);           // claude: pw-1, pw-2, pw-4
  assert.strictEqual(s.weeks.w1.done, 2);
  assert.strictEqual(s.weeks.w1.minutes, 65);
  P.setTrack("codex");
  s = P.summary();
  assert.strictEqual(s.weeks.w1.total, 3);           // codex: pw-1, pw-3, pw-4
  assert.strictEqual(s.weeks.w1.done, 1);
  assert.strictEqual(P.get().items["w1:pw-1"].estimateMinutes, 20);
  assert.strictEqual(P.setTrack("gemini"), false);
});

test("quiz attempt: MCQ auto-grading, self-scores, best score", () => {
  const { P } = load();
  const id = P.startAttempt(1);
  P.answer(1, id, { qid: "q2", type: "mcq", response: 2, confidence: 4, revealed: true });
  P.answer(1, id, { qid: "q3", type: "mcq", response: 0, confidence: 3, revealed: true });
  P.answer(1, id, { qid: "q1", type: "short", response: "text", confidence: 2, revealed: true });
  P.answer(1, id, { qid: "q1", selfScore: 1 });
  const res = P.submitAttempt(1, id, { q1: "short", q2: 2, q3: 1, q5: 1 });
  eq(res.score, { auto: 1, autoMax: 3, self: 1, selfMax: 2 });
  assert.strictEqual(res.answers.find(a => a.qid === "q2").correct, true);
  assert.strictEqual(res.answers.find(a => a.qid === "q3").correct, false);
  assert.ok(res.submittedAt && res.answers[0].revealedAt);
  assert.strictEqual(P.answer(1, id, { qid: "q2", response: 1 }), false, "locked after submit");
  const id2 = P.startAttempt(1);
  P.answer(1, id2, { qid: "q2", type: "mcq", response: 2 });
  P.answer(1, id2, { qid: "q3", type: "mcq", response: 1 });
  P.submitAttempt(1, id2, { q2: 2, q3: 1 });
  P.registerWeek(1, ["a"]);
  eq(P.summary().weeks.w1.quizBest, { auto: 2, autoMax: 2, self: 0, selfMax: 0 });
  assert.strictEqual(P.get().quizzes.w1.length, 2);
});

test("estimates: add, replace, reveal, lock", () => {
  const { P } = load();
  assert.ok(P.addEstimate({ taskId: "t1", estimateMinutes: 90, complexity: 9, specQuality: 3, reason: "r", pairId: "p1" }));
  assert.strictEqual(P.get().estimates[0].complexity, 5, "clamped");
  assert.ok(P.addEstimate({ taskId: "t1", estimateMinutes: 60, complexity: 3, specQuality: 3 }));
  assert.strictEqual(P.get().estimates.length, 1);
  assert.ok(P.revealEstimate("t1"));
  assert.strictEqual(P.addEstimate({ taskId: "t1", estimateMinutes: 10 }), false);
  assert.strictEqual(P.summary().totals.estimates, 1);
});

test("export shape, privacy, filename and download", () => {
  const { P, clicks } = load();
  P.setAlias("  Sam  ");
  P.setDeliverable(2, { url: "https://example.org/r", note: "n", rubricSelf: { r1: "secure", r2: "bogus" } });
  const o = P.exportObject();
  assert.strictEqual(o.schema, "agentic-se-progress");
  assert.strictEqual(o.appVersion, "mockup-2026-10");
  assert.strictEqual(o.userAgentFamily, "chrome");
  eq(o.deliverables.w2.rubricSelf, { r1: "secure" });
  assert.ok(!/Mozilla|navigator/.test(P.exportJSON()));
  assert.ok(P.download());
  assert.strictEqual(clicks[0], "agentic-se-progress-Sam-2026-10-01.json");
});

test("download returns false in a sandboxed iframe; clipboard rejection gives false", async () => {
  assert.strictEqual(load({ framed: true }).P.download(), false);
});
test("clipboard promise", () => {
  load({ clipboardFails: true }).P.copyToClipboard().then(v => assert.strictEqual(v, false));
  load().P.copyToClipboard().then(v => assert.strictEqual(v, true));
});

test("import: merge keeps id, takes union, latest doneAt wins", () => {
  const a = load(), b = load();
  a.P.markItem(1, "x", { status: "done", minutesSpent: 10 });
  tick(10);
  b.P.markItem(1, "x", { status: "done", minutesSpent: 99 });   // later
  b.P.markItem(1, "y", { status: "done" });
  const idB = b.P.startAttempt(1); b.P.submitAttempt(1, idB, {});
  b.P.addEstimate({ taskId: "t9", estimateMinutes: 5 });
  const idA = a.P.get().learner.id;
  const r = a.P.importJSON(b.P.exportJSON(), { mode: "merge" });
  eq(r, { ok: true, errors: [] });
  const s = a.P.get();
  assert.strictEqual(s.learner.id, idA);
  assert.strictEqual(s.items["w1:x"].minutesSpent, 99);
  assert.ok(s.items["w1:y"]);
  assert.strictEqual(s.quizzes.w1.length, 1);
  assert.strictEqual(s.estimates.length, 1);
  a.P.importJSON(b.P.exportJSON(), { mode: "merge" });             // idempotent
  assert.strictEqual(a.P.get().quizzes.w1.length, 1);
  assert.strictEqual(a.P.get().estimates.length, 1);
});

test("import: replace adopts the file's learner", () => {
  const a = load(), b = load();
  b.P.setTrack("codex"); b.P.markItem(2, "z", { status: "done" });
  a.P.markItem(1, "only-a", { status: "done" });
  assert.ok(a.P.importJSON(b.P.exportJSON(), { mode: "replace" }).ok);
  const s = a.P.get();
  assert.strictEqual(s.learner.id, b.P.get().learner.id);
  assert.strictEqual(s.learner.track, "codex");
  assert.ok(!s.items["w1:only-a"] && s.items["w2:z"]);
});

test("import: rejects bad version, wrong schema, bad JSON; state untouched", () => {
  const { P } = load();
  P.markItem(1, "k", { status: "done" });
  const good = P.exportObject();
  let r = P.importJSON(JSON.stringify(Object.assign({}, good, { schemaVersion: 2 })));
  assert.strictEqual(r.ok, false); assert.match(r.errors[0], /schemaVersion 2/);
  r = P.importJSON(JSON.stringify(Object.assign({}, good, { schema: "other" })));
  assert.strictEqual(r.ok, false);
  r = P.importJSON("{nope");
  assert.strictEqual(r.ok, false);
  r = P.importJSON(JSON.stringify(Object.assign({}, good, { items: { bad: { status: "done" } } })));
  assert.strictEqual(r.ok, false);
  assert.ok(P.get().items["w1:k"]);
});

test("storage failure falls back to memory; cross-tab event reloads and emits", () => {
  const broken = load({ brokenStorage: true });
  broken.P.markItem(1, "m", { status: "done" });
  assert.ok(broken.P.get().items["w1:m"]);
  const { P, store, listeners } = load();
  let n = 0; const off = P.on("change", () => n++);
  const other = JSON.parse(store.get(KEY)); other.items["w3:remote"] = { status: "done" };
  store.set(KEY, JSON.stringify(other));
  listeners.storage.forEach(f => f({ key: KEY }));
  assert.ok(P.get().items["w3:remote"]); assert.strictEqual(n, 1);
  off(); P.markItem(1, "q", {}); assert.strictEqual(n, 1);
});

test("events capped at 500; reset clears", () => {
  const { P } = load();
  for (let i = 0; i < 520; i++) P.markItem(1, "e" + (i % 5), { status: "done" });
  assert.strictEqual(P.get().events.length, 500);
  const oldId = P.get().learner.id;
  P.reset();
  assert.strictEqual(Object.keys(P.get().items).length, 0);
  assert.notStrictEqual(P.get().learner.id, oldId);
});

test("outcomes: set, uncheck, summary counts against registered ids", () => {
  const { P } = load();
  P.registerWeek(1, ["a"], ["o1", "o2", "o3"]);
  let s = P.summary().weeks.w1;
  assert.strictEqual(s.outcomesChecked, 0); assert.strictEqual(s.outcomesTotal, 3);
  const rec = P.setOutcome(1, "o1", true);
  assert.strictEqual(rec.checked, true); assert.match(rec.at, /^2026-/);
  P.setOutcome(1, "o2", true); tick(); P.setOutcome(1, "o2", false);
  P.setOutcome(1, "stale", true);                       // not on the page's checklist
  s = P.summary().weeks.w1;
  assert.strictEqual(s.outcomesChecked, 1);
  assert.strictEqual(P.get().outcomes.w1.o2.checked, false, "unchecked kept as false");
  assert.strictEqual(P.get().events.slice(-1)[0].type, "outcome:check");
  P.registerWeek(2, ["b"]);                             // no outcome ids given
  assert.strictEqual(P.summary().weeks.w2.outcomesTotal, null);
  P.registerWeek(1, ["a", "b"]);                        // re-registering items keeps outcome ids
  assert.strictEqual(P.summary().weeks.w1.outcomesTotal, 3);
  assert.strictEqual(P.setOutcome(1, "", true), null);
});

test("stage logs: log, sanitise, update, remove", () => {
  const { P } = load();
  const id = P.logStage(3, { change: "issue 4", stage: "triage", humanMinutes: 4, tokens: 12000, costUsd: 0.31,
    contextGiven: "issue text", intervention: "", cause: "none", judgement: "picked the smaller scope" });
  assert.match(id, /^S-[0-9a-f]{16}$/);
  const e = P.get().stageLogs.w3[0];
  assert.strictEqual(e.id, id); assert.strictEqual(e.stage, "triage"); assert.strictEqual(e.humanMinutes, 4);
  assert.ok(e.at);
  const bad = P.logStage(3, { change: "issue 4", stage: "deploy", humanMinutes: -5, tokens: "abc", cause: "laziness" });
  const b = P.get().stageLogs.w3[1];
  assert.strictEqual(b.id, bad); assert.strictEqual(b.stage, "other"); assert.strictEqual(b.humanMinutes, null);
  assert.strictEqual(b.tokens, null); assert.strictEqual(b.cause, null);
  tick();
  const u = P.updateStage(3, id, { humanMinutes: 6, cause: "missing-context", id: "hijack" });
  assert.strictEqual(u.humanMinutes, 6); assert.strictEqual(u.id, id); assert.strictEqual(u.tokens, 12000, "unpatched fields kept");
  assert.strictEqual(u.cause, "missing-context"); assert.ok(u.at > e.at);
  assert.strictEqual(P.updateStage(3, "S-nope", {}), null);
  assert.strictEqual(P.removeStage(3, bad), true);
  assert.strictEqual(P.removeStage(3, bad), false);
  assert.strictEqual(P.get().stageLogs.w3.length, 1);
});

test("export carries outcomes and stageLogs; old files without them still import", () => {
  const { P } = load();
  P.setOutcome(3, "o1", true); P.logStage(5, { change: "issue 2", stage: "pr", humanMinutes: 3 });
  const o = P.exportObject();
  assert.strictEqual(o.schemaVersion, 1);
  assert.strictEqual(o.outcomes.w3.o1.checked, true); assert.strictEqual(o.stageLogs.w5.length, 1);
  const legacy = Object.assign({}, o); delete legacy.outcomes; delete legacy.stageLogs;
  const t = load();
  assert.ok(t.P.importJSON(JSON.stringify(legacy), { mode: "replace" }).ok);
  eq(t.P.get().outcomes, {}); eq(t.P.get().stageLogs, {});
  const bad = Object.assign({}, o, { stageLogs: { w3: [{ stage: "spec" }] } });
  assert.strictEqual(t.P.importJSON(JSON.stringify(bad)).ok, false);
  assert.strictEqual(t.P.importJSON(JSON.stringify(Object.assign({}, o, { outcomes: [] }))).ok, false);
});

test("import: merge outcomes and stage logs by key and id, latest at wins", () => {
  const a = load(), b = load();
  a.P.setOutcome(1, "o1", true);                       // older
  const shared = a.P.logStage(3, { change: "issue 4", stage: "spec", humanMinutes: 10 });
  a.P.logStage(3, { change: "issue 4", stage: "review", humanMinutes: 7 });
  b.P.importJSON(a.P.exportJSON(), { mode: "replace" });  // b starts as a copy of a
  tick(10);
  b.P.setOutcome(1, "o1", false);                       // newer, unticked
  b.P.setOutcome(1, "o2", true);
  b.P.updateStage(3, shared, { humanMinutes: 25 });     // newer edit
  b.P.logStage(3, { change: "issue 5", stage: "implement", tokens: 900 });
  tick(10);
  a.P.setOutcome(1, "o3", true);                        // only in a
  const keepA = a.P.get().stageLogs.w3.find(e => e.stage === "review");
  eq(a.P.importJSON(b.P.exportJSON(), { mode: "merge" }), { ok: true, errors: [] });
  const s = a.P.get();
  assert.strictEqual(s.outcomes.w1.o1.checked, false, "later at wins");
  assert.strictEqual(s.outcomes.w1.o2.checked, true); assert.strictEqual(s.outcomes.w1.o3.checked, true);
  assert.strictEqual(s.stageLogs.w3.length, 3);
  assert.strictEqual(s.stageLogs.w3.find(e => e.id === shared).humanMinutes, 25);
  eq(s.stageLogs.w3.find(e => e.id === keepA.id), keepA);
  // an older incoming copy must not overwrite a newer local one
  const old = JSON.parse(a.P.exportJSON()); old.stageLogs.w3.find(e => e.id === shared).humanMinutes = 1;
  old.stageLogs.w3.find(e => e.id === shared).at = "2020-01-01T00:00:00.000Z";
  old.outcomes.w1.o1 = { checked: true, at: "2020-01-01T00:00:00.000Z" };
  a.P.importJSON(JSON.stringify(old), { mode: "merge" });
  assert.strictEqual(a.P.get().stageLogs.w3.find(e => e.id === shared).humanMinutes, 25);
  assert.strictEqual(a.P.get().outcomes.w1.o1.checked, false);
  a.P.importJSON(b.P.exportJSON(), { mode: "merge" });  // idempotent
  assert.strictEqual(a.P.get().stageLogs.w3.length, 3);
});


/* ---- synthetic samples ---- */
/* ---- cohort calendar and stage-log additions ---- */
const CAL_KEY = "agentic-se:v2:calendar";
const goodCal = () => ({ schema: "agentic-se-calendar", schemaVersion: 1, cohort: "test-cohort", timezone: "Europe/London",
  sessions: [{ week: 3, date: "2026-10-15", time: "18:00", place: "Room 1" }, { week: 1, date: "2026-10-01" }] });

test("calendar: set, get, sorted and cleaned, cohort propagates, event fires", () => {
  const { P, store } = load();
  assert.strictEqual(P.getCalendar(), null);
  let n = 0; P.on("change", () => { n++; });
  const res = P.setCalendar(Object.assign(goodCal(), { extra: "ignored" }));
  assert.strictEqual(res.ok, true); eq(res.errors, []);
  assert.strictEqual(n, 1);
  const c = P.getCalendar();
  assert.strictEqual(c.cohort, "test-cohort"); assert.strictEqual(c.sessions[0].week, 1);
  assert.strictEqual(c.sessions[1].time, "18:00"); assert.strictEqual(c.extra, undefined);
  assert.ok(store.has(CAL_KEY));
  assert.strictEqual(P.get().learner.cohort, "test-cohort");
  const text = JSON.stringify({ ...goodCal(), cohort: "from-text" });
  assert.strictEqual(P.setCalendar(text).ok, true);                      // JSON text is accepted too
  assert.strictEqual(P.getCalendar().cohort, "from-text");
});

test("calendar: the export names the cohort but does not carry the calendar", () => {
  const { P, store } = load();
  P.setCalendar(goodCal());
  const o = P.exportObject();
  assert.strictEqual(o.learner.cohort, "test-cohort");
  assert.strictEqual(o.calendar, undefined);
  assert.ok(!P.exportJSON().includes("Room 1"));
  assert.ok(!store.get(KEY).includes("Room 1"));                         // not in the progress record either
  const t = load({ store });                                             // survives a reload from storage
  assert.strictEqual(t.P.getCalendar().sessions.length, 2);
});

test("calendar: clearCalendar removes it and emits change; the progress record is untouched", () => {
  const { P, store } = load();
  P.markItem(1, "pw-1", { status: "done" });
  P.setCalendar(goodCal());
  let n = 0; P.on("change", () => { n++; });
  assert.strictEqual(P.clearCalendar(), true);
  assert.strictEqual(n, 1); assert.strictEqual(P.getCalendar(), null); assert.ok(!store.has(CAL_KEY));
  assert.strictEqual(P.clearCalendar(), false);
  assert.strictEqual(P.get().items["w1:pw-1"].status, "done");
});

test("calendar: validation errors are readable and nothing is stored", () => {
  const { P, store } = load();
  const bad = (mut) => { const c = goodCal(); mut(c); const r = P.setCalendar(c); assert.strictEqual(r.ok, false); return r.errors.join(" | "); };
  assert.match(bad(c => { c.sessions[0].date = "15/10/2026"; }), /Session 1: date must look like 2026-10-15\./);
  assert.match(bad(c => { c.sessions[1].date = "2026-02-30"; }), /Session 2: date must look like/);
  assert.match(bad(c => { c.sessions[0].week = 6; }), /Session 1: week must be a whole number from 0 to 5/);
  assert.match(bad(c => { c.sessions[0].week = 1.5; }), /Session 1: week must be a whole number/);
  assert.match(bad(c => { c.sessions[0].week = "3"; }), /Session 1: week must be a whole number/);
  assert.match(bad(c => { c.sessions[1].week = 3; }), /Session 2: week 3 is listed twice/);
  assert.match(bad(c => { c.sessions[0].time = "6pm"; }), /Session 1: time must look like 18:30/);
  assert.match(bad(c => { c.cohort = "  "; }), /cohort must be a non-empty text/);
  assert.match(bad(c => { c.schema = "other"; }), /not a cohort calendar/);
  assert.match(bad(c => { c.schemaVersion = 2; }), /Unsupported schemaVersion 2/);
  assert.match(bad(c => { c.sessions = {}; }), /sessions must be a list/);
  assert.match(bad(c => { c.sessions = []; }), /at least one session/);
  assert.match(bad(c => { c.timezone = 5; }), /timezone must be/);
  eq(P.setCalendar("{not json").errors, ["The text is not valid JSON."]);
  eq(P.setCalendar(null).errors, ["The calendar must be a JSON object."]);
  assert.strictEqual(P.getCalendar(), null); assert.ok(!store.has(CAL_KEY));
  assert.strictEqual(P.get().learner.cohort, "early-2026");
  const ok = goodCal(); ok.sessions[0].time = "00:00"; delete ok.timezone;   // optional fields may be absent
  assert.strictEqual(P.setCalendar(ok).ok, true);
});

test("calendar: a corrupt stored value reads as no calendar; broken storage keeps it in memory", () => {
  const store = new Map([[CAL_KEY, "{oops"]]);
  assert.strictEqual(load({ store }).P.getCalendar(), null);
  store.set(CAL_KEY, JSON.stringify({ schema: "agentic-se-calendar", schemaVersion: 1, cohort: "x", sessions: [{ week: 9, date: "2026-10-01" }] }));
  assert.strictEqual(load({ store }).P.getCalendar(), null);
  const { P } = load({ brokenStorage: true });
  assert.strictEqual(P.setCalendar(goodCal()).ok, true);
  assert.strictEqual(P.getCalendar().cohort, "test-cohort");
  assert.strictEqual(P.clearCalendar(), true); assert.strictEqual(P.getCalendar(), null);
});

test("stage logs: null clears tokens and cost, missing fields are kept, null stays null", () => {
  const { P } = load();
  const id = P.logStage(3, { change: "issue 4", stage: "spec", humanMinutes: 9, tokens: 5000, costUsd: 0.5 });
  const kept = P.updateStage(3, id, { humanMinutes: 10 });
  assert.strictEqual(kept.tokens, 5000); assert.strictEqual(kept.costUsd, 0.5);
  const cleared = P.updateStage(3, id, { tokens: null, costUsd: null });
  assert.strictEqual(cleared.tokens, null); assert.strictEqual(cleared.costUsd, null); assert.strictEqual(cleared.humanMinutes, 10);
  assert.strictEqual(P.get().stageLogs.w3[0].tokens, null);
  const again = P.updateStage(3, id, { humanMinutes: 11 });              // a null value is not turned into 0
  assert.strictEqual(again.tokens, null); assert.strictEqual(again.costUsd, null);
  assert.strictEqual(P.updateStage(3, id, { humanMinutes: null }).humanMinutes, null);
});

test("stage logs: failed flag defaults to false, updates both ways, only true counts", () => {
  const { P } = load();
  const a = P.logStage(5, { change: "issue 4", stage: "other", humanMinutes: 3, costUsd: 1.2, failed: true });
  const b = P.logStage(5, { change: "issue 4", stage: "other", humanMinutes: 4 });
  const c = P.logStage(5, { change: "issue 4", stage: "other", humanMinutes: 4, failed: "yes" });
  const list = P.get().stageLogs.w5;
  assert.strictEqual(list[0].failed, true); assert.strictEqual(list[1].failed, false); assert.strictEqual(list[2].failed, false);
  assert.strictEqual(P.updateStage(5, a, { humanMinutes: 5 }).failed, true);   // kept when not in the patch
  assert.strictEqual(P.updateStage(5, a, { failed: false }).failed, false);
  assert.strictEqual(P.updateStage(5, b, { failed: true }).failed, true);
  const t = load(); assert.strictEqual(t.P.importJSON(P.exportJSON(), { mode: "replace" }).ok, true);
  assert.strictEqual(t.P.get().stageLogs.w5[1].failed, true);               // survives export and import
  const legacy = JSON.parse(P.exportJSON()); delete legacy.stageLogs.w5[0].failed;
  assert.strictEqual(load().P.importJSON(JSON.stringify(legacy)).ok, true);  // entries without the field stay valid
});

test("certificates: validation, set, remove, get", () => {
  const { P } = load();
  // Invalid calls
  assert.strictEqual(P.setCertificate(1, "c1", {}).ok, false);
  assert.strictEqual(P.setCertificate(1, "c1", { course: "C1", platform: "P1" }).ok, false, "needs url or image");
  assert.strictEqual(P.setCertificate(1, "c1", { course: "C1", platform: "P1", url: "http://insecure.com" }).ok, false, "needs https");
  assert.strictEqual(P.setCertificate(1, "c1", { course: "C1", platform: "P1", url: "https://example.com", earnedOn: "not-a-date" }).ok, false, "bad date");
  assert.strictEqual(P.setCertificate(1, "c1", { course: "C1", platform: "P1", image: "data:image/png;base64,abc" }).ok, false, "needs jpeg");

  // Valid calls
  const ok1 = P.setCertificate(1, "c1", { course: "Course 101", platform: "Platform A", url: "https://example.com/badge/1" });
  assert.strictEqual(ok1.ok, true);
  const certs = P.getCertificates();
  assert.ok(certs["w1:c1"]);
  assert.strictEqual(certs["w1:c1"].course, "Course 101");
  assert.strictEqual(certs["w1:c1"].platform, "Platform A");
  assert.strictEqual(certs["w1:c1"].url, "https://example.com/badge/1");
  assert.strictEqual(certs["w1:c1"].image, null);

  // Set with image and earnedOn
  const dummyJpg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  const ok2 = P.setCertificate(2, "c2", { course: "Course 202", platform: "Platform B", image: dummyJpg, earnedOn: "2026-10-05" });
  assert.strictEqual(ok2.ok, true);
  assert.strictEqual(P.getCertificates()["w2:c2"].earnedOn, "2026-10-05");

  // Removal
  assert.strictEqual(P.removeCertificate(1, "c1"), true);
  assert.strictEqual(P.getCertificates()["w1:c1"], undefined);
  assert.strictEqual(P.removeCertificate(1, "c1"), false);
});

test("certificates: export and merge (later addedAt wins)", () => {
  const { P: P1 } = load();
  const { P: P2 } = load();
  tick(10);
  P1.setCertificate(1, "c1", { course: "Course 1", platform: "P", url: "https://example.com/1" });
  tick(10);
  P2.setCertificate(1, "c1", { course: "Course 1 Updated", platform: "P", url: "https://example.com/updated" });
  P2.setCertificate(2, "c2", { course: "Course 2", platform: "P", url: "https://example.com/2" });

  const exp2 = P2.exportJSON();
  const res = P1.importJSON(exp2, { mode: "merge" });
  assert.strictEqual(res.ok, true);
  const certs = P1.getCertificates();
  assert.strictEqual(certs["w1:c1"].url, "https://example.com/updated");
  assert.ok(certs["w2:c2"]);
});

console.log("\n" + passed + " tests passed");

if (process.argv.includes("--samples")) {
  let seed = 42; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const W1 = [["pw-1", 20], ["pw-2", 35, "claude"], ["pw-3", 35, "codex"], ["pw-4", 25], ["pw-5", 30], ["pw-6", 15]];
  const W3 = [["pw-1", 40], ["pw-2", 30], ["pw-3", 45, "claude"], ["pw-4", 45, "codex"], ["act", 60]];
  const KEYS = { q1: "short", q2: 2, q3: 1, q4: "short", q5: 1 };
  const TASKS = { "bm-01": 45, "bm-02": 120, "bm-03": 240, "bm-04": 30 };
  const profiles = [["claude", 1.0, 3], ["claude", 0.6, 2], ["codex", 1.0, 3], ["codex", 0.4, 1], ["codex", 0.8, 2]];
  // Outcomes and stage logs use their own generator so the older sample data is unchanged.
  let seed2 = 7; const rnd2 = () => (seed2 = (seed2 * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const STAGE_LIST = ["triage", "spec", "implement", "review", "pr"];
  const CAUSE_LIST = ["missing-context", "wrong-design", "taste"];
  const BASE_MIN = { triage: 5, spec: 14, implement: 10, review: 11, pr: 5 };
  function addOptional(P, i, track) {
    if (i === 1 || i === 3) return;                    // two samples predate the optional fields
    P.registerWeek(1, W1.map(x => ({ id: x[0], track: x[2] })), ["o1", "o2", "o3", "o4"]);
    for (let k = 1; k <= 4; k++) if (rnd2() < 0.75) { tick(5); P.setOutcome(1, "o" + k, true); }
    if (rnd2() < 0.4) { tick(5); P.setOutcome(1, "o4", false); }
    if (i === 4) return;                               // no Week 3 stage log
    for (let k = 1; k <= 3; k++) if (rnd2() < 0.7) { tick(5); P.setOutcome(3, "o" + k, true); }
    ["issue 4", "issue 7"].slice(0, i === 0 ? 2 : 1).forEach(change => {
      STAGE_LIST.forEach(stage => {
        tick(8);
        const hit = rnd2() < 0.5, cause = hit ? CAUSE_LIST[Math.floor(rnd2() * 3)] : "none";
        P.logStage(3, { change, stage, humanMinutes: Math.round(BASE_MIN[stage] * (0.6 + rnd2() * 1.2)),
          tokens: Math.round(8000 + rnd2() * 90000), costUsd: Math.round((0.1 + rnd2() * 0.9) * 100) / 100,
          contextGiven: "synthetic context", intervention: hit ? "synthetic correction" : "", cause,
          judgement: hit ? "synthetic judgement" : "", failed: change === "issue 7" && stage === "implement" });
      });
    });
    if (i === 0) ["issue 4", "issue 9", "issue 12"].forEach(change => {   // Week 5 per-change report
      tick(20);
      P.logStage(5, { change, stage: "other", humanMinutes: Math.round(4 + rnd2() * 20), tokens: Math.round(40000 + rnd2() * 300000),
        costUsd: Math.round((0.4 + rnd2() * 3) * 100) / 100, contextGiven: "synthetic", intervention: "", cause: "none", judgement: "synthetic", failed: change === "issue 9" });
    });
  }
  const dir = path.join(__dirname, "sample");
  fs.mkdirSync(dir, { recursive: true });
  profiles.forEach(([track, pace, weeks], i) => {
    clock = Date.parse("2026-09-14T08:00:00Z") + i * 3600000;
    const { P } = load(); const n = i + 1;
    P.setTrack(track); P.setAlias("SYNTHETIC-" + String(n).padStart(2, "0"));
    P.registerWeek(1, W1.map(x => ({ id: x[0], minutes: x[1], track: x[2] })));
    P.registerWeek(3, W3.map(x => ({ id: x[0], minutes: x[1], track: x[2] })));
    if (i !== 3) Object.keys(TASKS).slice(0, i === 1 ? 2 : 4).forEach(t => {
      tick(3);
      P.addEstimate({ taskId: t, estimateMinutes: Math.round(TASKS[t] * Math.exp((rnd() - 0.35) * 1.4)), complexity: 1 + Math.floor(rnd() * 5), specQuality: 1 + Math.floor(rnd() * 5), reason: "synthetic", pairId: "pair-" + t });
      P.revealEstimate(t);
    });
    [[1, W1], [3, W3]].slice(0, weeks > 2 ? 2 : 1).forEach(([w, list]) => {
      list.filter(x => !x[2] || x[2] === track).forEach(x => {
        if (rnd() > pace) return;
        tick(30 + rnd() * 600);
        P.markItem(w, x[0], { status: "done", minutesSpent: Math.round(x[1] * (0.6 + rnd() * 1.3)), estimateMinutes: x[1] });
      });
    });
    for (let a = 0; a < (i === 3 ? 1 : 2); a++) {
      tick(60); const id = P.startAttempt(1);
      Object.keys(KEYS).forEach(q => {
        tick(1); const mcq = typeof KEYS[q] === "number";
        const right = rnd() < (0.45 + 0.2 * a + 0.1 * pace);
        const conf = Math.min(4, Math.max(1, Math.round((right ? 3 : 2) + (rnd() - 0.5) * 2)));
        P.answer(1, id, { qid: q, type: mcq ? "mcq" : "short", response: mcq ? (right ? KEYS[q] : (KEYS[q] + 1) % 4) : "synthetic answer", confidence: conf, revealed: true });
        if (!mcq) P.answer(1, id, { qid: q, selfScore: right ? 2 : (rnd() < 0.5 ? 1 : 0) });
      });
      P.submitAttempt(1, id, KEYS);
    }
    if (weeks > 2) P.setDeliverable(3, { url: "https://example.invalid/synthetic", note: "synthetic", rubricSelf: { r1: "secure", r2: rnd() < 0.5 ? "secure" : "developing" } });
    if (i === 0 || i === 2) {
      tick(5);
      P.setCertificate(1, track === "claude" ? "claude-code-101" : "codex-get-started", {
        course: track === "claude" ? "Claude Code 101" : "Get Started with Codex",
        platform: track === "claude" ? "Claude Academy" : "OpenAI Academy",
        url: "https://credentials.example.org/badge/" + n,
        earnedOn: "2026-09-18"
      });
      tick(5);
      P.setCertificate(1, track === "claude" ? "claude-code-in-action" : "codex-extend", {
        course: track === "claude" ? "Claude Code in Action" : "Extend Codex Workflows",
        platform: track === "claude" ? "Claude Academy" : "OpenAI Academy",
        image: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        earnedOn: "2026-09-22"
      });
    }
    addOptional(P, i, track);
    tick(10);
    const o = P.exportObject();
    o.learner.id = "L-synthetic-" + String(n).padStart(2, "0");
    o.appVersion = "mockup-2026-10-SYNTHETIC";
    if (i === 1 || i === 3) { delete o.outcomes; delete o.stageLogs; delete o.certificates; }   // older-style exports, to test the optional fields
    fs.writeFileSync(path.join(dir, "synthetic-" + String(n).padStart(2, "0") + ".json"), JSON.stringify(o, null, 2) + "\n");
  });
  console.log("wrote 5 synthetic samples to " + dir);
}
