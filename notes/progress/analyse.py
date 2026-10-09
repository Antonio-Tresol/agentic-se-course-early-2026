#!/usr/bin/env python3
"""Analyse course progress files exported by the Agentic SE course site.

Usage:
    python3 analyse.py path/to/folder_or_files... --out results/
    python3 analyse.py sample/ --out results/ --truth ../mockups/data/benchmarks.json

Standard library only. Aliases are never printed or written unless
--show-aliases is passed.
"""
import argparse
import csv
import json
import math
import re
import statistics as st
import sys
from collections import defaultdict
from pathlib import Path

SCHEMA = "agentic-se-progress"
VERSION = 1
REQUIRED = ["schema", "schemaVersion", "exportedAt", "learner", "items", "quizzes", "estimates", "deliverables"]


def warn(msg):
    print("warning: " + msg, file=sys.stderr)


def find_files(paths):
    out = []
    for p in paths:
        p = Path(p)
        if p.is_dir():
            out.extend(sorted(p.rglob("*.json")))
        elif p.is_file():
            out.append(p)
        else:
            warn("%s does not exist" % p)
    return out


def check(d):
    """Return an error string, or None if the file has the essentials."""
    if not isinstance(d, dict):
        return "not a JSON object"
    missing = [k for k in REQUIRED if k not in d]
    if missing:
        return "missing keys: " + ", ".join(missing)
    if d["schema"] != SCHEMA:
        return "schema is %r, expected %r" % (d["schema"], SCHEMA)
    if d["schemaVersion"] != VERSION:
        return "schemaVersion %r not supported (this script reads %d)" % (d["schemaVersion"], VERSION)
    ln = d["learner"]
    if not isinstance(ln, dict) or not ln.get("id") or ln.get("track") not in ("claude", "codex"):
        return "learner needs id and track claude|codex"
    if not isinstance(d["items"], dict) or not isinstance(d["quizzes"], dict) \
            or not isinstance(d["estimates"], list) or not isinstance(d["deliverables"], dict):
        return "items, quizzes, estimates or deliverables have the wrong type"
    return None


def load_learners(paths):
    best = {}
    for f in find_files(paths):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError) as e:
            warn("skipping %s: %s" % (f, e))
            continue
        err = check(d)
        if err:
            warn("skipping %s: %s" % (f, err))
            continue
        lid = d["learner"]["id"]
        if lid in best:
            warn("duplicate learner %s in %s; keeping the latest exportedAt" % (lid, f))
        if lid not in best or str(d["exportedAt"]) > str(best[lid]["exportedAt"]):
            best[lid] = d
    return list(best.values())


# ---------- helpers ----------
def med(xs):
    return st.median(xs) if xs else ""


def mean(xs):
    return st.mean(xs) if xs else ""


def iqr(xs):
    if len(xs) < 2:
        return ""
    q = st.quantiles(xs, n=4, method="inclusive")
    return q[2] - q[0]


def r(x, nd=3):
    return round(x, nd) if isinstance(x, (int, float)) else x


def week_of(key):
    m = re.match(r"^w(\d+)", key)
    return int(m.group(1)) if m else 0


def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)


def submitted(attempts):
    return [a for a in attempts if isinstance(a, dict) and a.get("submittedAt")]


def best_attempt(attempts):
    best, bf = None, -1
    for a in submitted(attempts):
        s = a.get("score") or {}
        f = s.get("auto", 0) / s["autoMax"] if s.get("autoMax") else 0
        if f > bf:
            best, bf = s, f
    return best


# ---------- tables ----------
def learners_table(ls, totals, show_alias):
    weeks = sorted({week_of(k) for d in ls for k in d["items"]} |
                   {week_of(k) for d in ls for k in d["quizzes"]})
    header = ["learner_id"] + (["alias"] if show_alias else []) + ["track", "cohort", "exported_at"]
    for w in weeks:
        header.append("done_w%d" % w)
        if totals:
            header.append("completion_w%d" % w)
    header += ["items_done", "total_minutes"]
    header += ["quiz_best_w%d" % w for w in weeks]
    header += ["quiz_self_best_w%d" % w for w in weeks]
    header += ["estimates", "deliverables"]
    rows = []
    for d in sorted(ls, key=lambda x: x["learner"]["id"]):
        ln = d["learner"]
        row = [ln["id"]] + ([ln.get("alias", "")] if show_alias else []) + \
              [ln["track"], ln.get("cohort", ""), d["exportedAt"]]
        done_by_week = defaultdict(int)
        minutes = 0.0
        for k, it in d["items"].items():
            if it.get("status") == "done":
                done_by_week[week_of(k)] += 1
            if isinstance(it.get("minutesSpent"), (int, float)):
                minutes += it["minutesSpent"]
        for w in weeks:
            row.append(done_by_week[w])
            if totals:
                t = (totals.get("w%d" % w) or {}).get(ln["track"])
                row.append(r(done_by_week[w] / t) if t else "")
        row += [sum(done_by_week.values()), r(minutes, 1)]
        bests = {w: best_attempt(d["quizzes"].get("w%d" % w, [])) for w in weeks}
        row += [r(b["auto"] / b["autoMax"]) if b and b.get("autoMax") else "" for b in bests.values()]
        row += [r(b["self"] / b["selfMax"]) if b and b.get("selfMax") else "" for b in bests.values()]
        row += [len(d["estimates"]), len(d["deliverables"])]
        rows.append(row)
    return header, rows


def items_table(ls):
    n_track = defaultdict(int)
    for d in ls:
        n_track[d["learner"]["track"]] += 1
    per = defaultdict(lambda: {"done": 0, "marked": 0, "mins": [], "est": []})
    for d in ls:
        tr = d["learner"]["track"]
        for k, it in d["items"].items():
            e = per[(k, it.get("track", tr))]
            e["marked"] += 1
            if it.get("status") == "done":
                e["done"] += 1
            if isinstance(it.get("minutesSpent"), (int, float)):
                e["mins"].append(it["minutesSpent"])
            if isinstance(it.get("estimateMinutes"), (int, float)):
                e["est"].append(it["estimateMinutes"])
    header = ["item", "track", "learners_on_track", "marked", "done", "completion_rate", "n_minutes",
              "median_minutes", "mean_minutes", "page_estimate", "median_ratio", "mean_ratio"]
    rows = []
    for (k, tr), e in sorted(per.items(), key=lambda x: (week_of(x[0][0]), x[0])):
        est = med(e["est"])
        n = n_track[tr]
        m_med, m_mean = med(e["mins"]), mean(e["mins"])
        rows.append([k, tr, n, e["marked"], e["done"], r(e["done"] / n) if n else "", len(e["mins"]),
                     r(m_med, 1), r(m_mean, 1), est,
                     r(m_med / est) if est and m_med != "" else "",
                     r(m_mean / est) if est and m_mean != "" else ""])
    return header, rows


def questions_table(ls):
    per = defaultdict(lambda: {"type": "", "n": 0, "learners": set(), "right": 0, "graded": 0,
                               "self": [], "conf": [], "conf_ok": [], "conf_bad": []})
    for d in ls:
        for w, attempts in d["quizzes"].items():
            for a in submitted(attempts):
                for ans in a.get("answers", []):
                    e = per[(w, ans.get("qid"))]
                    e["type"] = ans.get("type", e["type"])
                    e["n"] += 1
                    e["learners"].add(d["learner"]["id"])
                    c = ans.get("confidence")
                    if isinstance(c, (int, float)):
                        e["conf"].append(c)
                    if ans.get("type") == "mcq" and isinstance(ans.get("correct"), bool):
                        e["graded"] += 1
                        e["right"] += ans["correct"]
                        if isinstance(c, (int, float)):
                            (e["conf_ok"] if ans["correct"] else e["conf_bad"]).append(c)
                    if ans.get("type") == "short" and isinstance(ans.get("selfScore"), (int, float)):
                        e["self"].append(ans["selfScore"])
    header = ["week", "qid", "type", "attempts", "learners", "proportion_correct", "mean_self_score_0_2",
              "mean_confidence", "mean_conf_correct", "mean_conf_wrong", "calibration_gap"]
    rows = []
    for (w, q), e in sorted(per.items(), key=lambda x: (week_of(x[0][0]), str(x[0][1]))):
        ok, bad = mean(e["conf_ok"]), mean(e["conf_bad"])
        gap = ok - bad if ok != "" and bad != "" else ""
        rows.append([w, q, e["type"], e["n"], len(e["learners"]),
                     r(e["right"] / e["graded"]) if e["graded"] else "",
                     r(mean(e["self"])), r(mean(e["conf"])), r(ok), r(bad), r(gap)])
    return header, rows


def bucket_midpoint(b, mids):
    if b in mids:
        return float(mids[b])
    s = str(b).strip().replace("–", "-").replace("min", "").strip()
    m = re.match(r"^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$", s)
    if m:
        return (float(m.group(1)) + float(m.group(2))) / 2
    m = re.match(r"^[<≤]=?\s*(\d+(?:\.\d+)?)$", s)
    if m:
        return float(m.group(1)) / 2
    m = re.match(r"^(\d+(?:\.\d+)?)\s*\+$|^[>≥]=?\s*(\d+(?:\.\d+)?)$", s)
    if m:
        return float(m.group(1) or m.group(2)) * 1.5
    return None


def load_truth(path, field, bucket_field, mids):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        warn("ground truth not used (%s)" % e)
        return {}
    if isinstance(data, dict):
        tasks = data.get("tasks", data)
        if isinstance(tasks, dict):
            tasks = [dict(v, id=v.get("id", k)) for k, v in tasks.items() if isinstance(v, dict)]
    else:
        tasks = data
    out = {}
    num = lambda x: isinstance(x, (int, float)) and not isinstance(x, bool)
    for t in tasks if isinstance(tasks, list) else []:
        tid = t.get("taskId", t.get("id")) if isinstance(t, dict) else None
        if not tid:
            continue
        # benchmarks.json keeps human time under groundTruth: a point estimate
        # (Terminal-Bench) or an annotator bucket with low and high bounds
        # (SWE-bench Verified), for which we take the midpoint.
        g = t["groundTruth"] if isinstance(t.get("groundTruth"), dict) else {}
        v = t.get(field, g.get(field))
        if not num(v):
            v = g.get("humanMinutesPoint")
        if not num(v):
            lo, hi = g.get("humanMinutesLow"), g.get("humanMinutesHigh")
            if num(lo) and num(hi) and hi > 0:
                v = (lo + hi) / 2
        if not num(v) and bucket_field in t:
            v = bucket_midpoint(t[bucket_field], mids)
        if num(v) and v > 0:
            out[tid] = float(v)
    if not out:
        warn("ground truth file has no usable '%s' or '%s' values" % (field, bucket_field))
    return out


def is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


def load_agent_truth(path):
    """Published agent pass counts per task, {task_id: (pass_count, attempts)}, read from the
    benchmark data: tasks[].taskId (or id) with groundTruth.agentPassCount and agentAttempts,
    as in benchmarks.json. Tasks without whole-number counts (SWE-Bench Pro) are left out."""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    tasks = data.get("tasks", []) if isinstance(data, dict) else data
    if isinstance(tasks, dict):
        tasks = [dict(v, id=v.get("id", k)) for k, v in tasks.items() if isinstance(v, dict)]
    out = {}
    for t in tasks if isinstance(tasks, list) else []:
        if not isinstance(t, dict):
            continue
        tid = t.get("taskId", t.get("id"))
        g = t["groundTruth"] if isinstance(t.get("groundTruth"), dict) else t
        n, of = g.get("agentPassCount"), g.get("agentAttempts")
        if tid and is_int(n) and is_int(of) and of > 0 and 0 <= n <= of:
            out[tid] = (n, of)
    return out


def estimates_table(ls, truth, agent_truth=None):
    """Per task. The agent columns come from the optional agentPassPredicted and agentAttempts
    fields; files without them contribute nothing there. agent_pass_count and published_pass_rate
    need --truth."""
    agent_truth = agent_truth or {}
    per = defaultdict(lambda: {"est": [], "cx": [], "sq": [], "att": [], "pred": []})
    for d in ls:
        for e in d["estimates"]:
            t = per[e.get("taskId")]
            if isinstance(e.get("estimateMinutes"), (int, float)) and e["estimateMinutes"] > 0:
                t["est"].append(e["estimateMinutes"])
            if isinstance(e.get("complexity"), (int, float)):
                t["cx"].append(e["complexity"])
            if isinstance(e.get("specQuality"), (int, float)):
                t["sq"].append(e["specQuality"])
            att, pred = e.get("agentAttempts"), e.get("agentPassPredicted")
            if is_int(att) and att > 0:
                t["att"].append(att)
                if is_int(pred) and 0 <= pred <= att:
                    t["pred"].append((pred, att))
    header = ["task_id", "n", "median_estimate", "iqr", "median_complexity", "median_spec_quality"]
    if truth:
        header += ["truth_minutes", "log10_median_over_truth", "median_log10_ratio"]
    header += ["n_agent_predictions", "agent_attempts", "median_agent_pass_predicted", "median_predicted_pass_rate",
               "agent_pass_count", "published_pass_rate"]
    rows = []
    for tid, e in sorted(per.items(), key=lambda x: str(x[0])):
        row = [tid, len(e["est"]), med(e["est"]), r(iqr(e["est"]), 1), med(e["cx"]), med(e["sq"])]
        if truth:
            tr = truth.get(tid)
            if tr and e["est"]:
                row += [tr, r(math.log10(med(e["est"]) / tr)), r(med([math.log10(x / tr) for x in e["est"]]))]
            else:
                row += [tr or "", "", ""]
        pub = agent_truth.get(tid)
        attempts = pub[1] if pub else (max(set(e["att"]), key=e["att"].count) if e["att"] else "")
        row += [len(e["pred"]), attempts, med([p for p, _ in e["pred"]]), r(med([p / a for p, a in e["pred"]])),
                pub[0] if pub else "", r(pub[0] / pub[1]) if pub else ""]
        rows.append(row)
    return header, rows


STAGE_ORDER = ["triage", "spec", "implement", "review", "pr", "other"]
CAUSES = ["missing-context", "wrong-design", "taste", "none"]


def stages_table(ls):
    """Per week and stage: n, human minutes (median, mean), median tokens and cost, counts per cause and of failed runs.
    stageLogs is optional; files without it contribute nothing."""
    per = defaultdict(lambda: {"n": 0, "learners": set(), "min": [], "tok": [], "cost": [], "cause": defaultdict(int), "failed": 0})
    for d in ls:
        logs = d.get("stageLogs")
        if not isinstance(logs, dict):
            continue
        for w, entries in logs.items():
            if not isinstance(entries, list):
                continue
            for e in entries:
                if not isinstance(e, dict):
                    continue
                stage = e.get("stage") if e.get("stage") in STAGE_ORDER else "other"
                t = per[(week_of(w), stage)]
                t["n"] += 1
                t["learners"].add(d["learner"]["id"])
                for key, field in (("min", "humanMinutes"), ("tok", "tokens"), ("cost", "costUsd")):
                    if isinstance(e.get(field), (int, float)) and not isinstance(e.get(field), bool):
                        t[key].append(e[field])
                t["cause"][e.get("cause") if e.get("cause") in CAUSES else "unclassified"] += 1
                if e.get("failed") is True:
                    t["failed"] += 1
    header = ["week", "stage", "n", "learners", "median_human_minutes", "mean_human_minutes",
              "median_tokens", "median_cost_usd"] + ["n_cause_" + c.replace("-", "_") for c in CAUSES] + ["n_cause_unclassified", "n_failed"]
    rows = []
    for (w, stage), t in sorted(per.items(), key=lambda x: (x[0][0], STAGE_ORDER.index(x[0][1]))):
        rows.append(["w%d" % w, stage, t["n"], len(t["learners"]), r(med(t["min"]), 1), r(mean(t["min"]), 1),
                     r(med(t["tok"]), 0), r(med(t["cost"]), 3)] + [t["cause"][c] for c in CAUSES] + [t["cause"]["unclassified"], t["failed"]])
    return header, rows


def outcomes_table(ls):
    """Per week and outcome: proportion of learners who ticked it. The denominator is the learners whose
    file holds any outcome record for that week, i.e. those who used that week's checklist."""
    seen = defaultdict(set)
    ticked = defaultdict(set)
    for d in ls:
        oc = d.get("outcomes")
        if not isinstance(oc, dict):
            continue
        for w, outs in oc.items():
            if not isinstance(outs, dict):
                continue
            seen[week_of(w)].add(d["learner"]["id"])
            for o, rec in outs.items():
                ticked[(week_of(w), o)]  # make sure the outcome appears even if never ticked
                if isinstance(rec, dict) and rec.get("checked") is True:
                    ticked[(week_of(w), o)].add(d["learner"]["id"])
    header = ["week", "outcome", "learners_with_checklist", "n_checked", "proportion_checked"]
    rows = []
    for (w, o), who in sorted(ticked.items(), key=lambda x: (x[0][0], str(x[0][1]))):
        n = len(seen[w])
        rows.append(["w%d" % w, o, n, len(who), r(len(who) / n) if n else ""])
    return header, rows


def certificates_table(ls):
    """Per learner and course: has_url, has_image, earnedOn."""
    header = ["learner_id", "course_key", "course", "platform", "has_url", "has_image", "earnedOn"]
    rows = []
    for d in sorted(ls, key=lambda x: x["learner"]["id"]):
        lid = d["learner"]["id"]
        certs = d.get("certificates")
        if not isinstance(certs, dict):
            continue
        for ck in sorted(certs.keys()):
            c = certs[ck]
            if not isinstance(c, dict):
                continue
            rows.append([
                lid,
                ck,
                c.get("course", ""),
                c.get("platform", ""),
                bool(c.get("url")),
                bool(c.get("image")),
                c.get("earnedOn") or ""
            ])
    return header, rows


# ---------- summary ----------
def agent_line(er, ex):
    """One summary line on the agent predictions in the estimates table."""
    pr = [x for x in er if x[ex["n_agent_predictions"]]]
    if not pr:
        return "No agent predictions recorded."
    n = sum(x[ex["n_agent_predictions"]] for x in pr)
    pub = [x for x in pr if x[ex["published_pass_rate"]] != ""]
    if not pub:
        return ("Agent predictions: %d on %d tasks; pass --truth with the benchmark data (tasks[].groundTruth.agentPassCount) "
                "to compare them with the published pass counts." % (n, len(pr)))
    gaps = [x[ex["median_predicted_pass_rate"]] - x[ex["published_pass_rate"]] for x in pub]
    return ("Agent predictions: %d on %d tasks. On the %d with published pass counts, the median predicted pass rate minus "
            "the published rate is %s (median over tasks; above 0 means learners expected more runs to pass)." % (
                n, len(pr), len(pub), r(st.median(gaps), 2)))


def summary_md(ls, items, questions, estimates, has_truth, stages=None, outcomes=None, certificates=None):
    n = len(ls)
    by_track = defaultdict(int)
    for d in ls:
        by_track[d["learner"]["track"]] += 1
    lines = ["# Course progress analysis", "",
             "Learners (de-duplicated): %d (%s)." % (n, ", ".join("%s %d" % kv for kv in sorted(by_track.items())) or "none"), ""]
    ih, ir = items
    ix = {h: i for i, h in enumerate(ih)}
    rated = [x for x in ir if x[ix["median_ratio"]] != ""]
    lines += ["## Time budgets", ""]
    if rated:
        rated.sort(key=lambda x: -x[ix["median_ratio"]])
        lines.append("Median minutes spent divided by the page estimate. Above 1 means the budget is too low.")
        lines.append("")
        lines.append("| Item | Track | n | Median min | Estimate | Ratio |")
        lines.append("|---|---|---|---|---|---|")
        for x in rated[:5] + ([] if len(rated) <= 10 else [["..."] * len(ih)]) + (rated[-3:] if len(rated) > 5 else []):
            lines.append("| %s | %s | %s | %s | %s | %s |" % (x[0], x[1], x[ix["n_minutes"]] if x[0] != "..." else "", x[ix["median_minutes"]], x[ix["page_estimate"]], x[ix["median_ratio"]]))
        allr = [x[ix["median_ratio"]] for x in rated]
        lines += ["", "Median of item ratios: %s over %d items." % (r(st.median(allr), 2), len(allr))]
    else:
        lines.append("No items have both minutes spent and a page estimate.")
    qh, qr = questions
    qx = {h: i for i, h in enumerate(qh)}
    lines += ["", "## Questions", ""]
    graded = [x for x in qr if x[qx["proportion_correct"]] != ""]
    if graded:
        graded.sort(key=lambda x: x[qx["proportion_correct"]])
        lines.append("Hardest multiple-choice questions (proportion correct):")
        lines.append("")
        for x in graded[:3]:
            lines.append("- %s %s: %s correct over %d attempts" % (x[0], x[1], x[qx["proportion_correct"]], x[qx["attempts"]]))
        gaps = [x[qx["calibration_gap"]] for x in graded if x[qx["calibration_gap"]] != ""]
        if gaps:
            lines += ["", "Mean calibration gap (confidence when right minus when wrong): %s. Near zero means confidence does not track accuracy." % r(st.mean(gaps), 2)]
    else:
        lines.append("No graded multiple-choice answers.")
    shorts = [x[qx["mean_self_score_0_2"]] for x in qr if x[qx["mean_self_score_0_2"]] != ""]
    if shorts:
        lines += ["", "Mean short-answer self-score: %s out of 2." % r(st.mean(shorts), 2)]
    eh, er = estimates
    ex = {h: i for i, h in enumerate(eh)}
    lines += ["", "## Estimates", ""]
    if er:
        lines.append("%d tasks estimated; %d estimates in total." % (len(er), sum(x[ex["n"]] for x in er)))
        if has_truth and "log10_median_over_truth" in ex:
            lg = [x[ex["log10_median_over_truth"]] for x in er if x[ex["log10_median_over_truth"]] != ""]
            if lg:
                lines.append("Across %d tasks with ground truth, the median log10 ratio of estimate to truth is %s (%sx)." % (len(lg), r(st.median(lg), 2), r(10 ** st.median(lg), 2)))
            else:
                lines.append("None of the estimated tasks has a human-time ground truth in the supplied file.")
        else:
            lines.append("No ground truth supplied; pass --truth to compute estimate error.")
        lines.append(agent_line(er, ex))
    else:
        lines.append("No estimates recorded.")
    if stages is not None:
        sh, sr = stages
        sx = {h: i for i, h in enumerate(sh)}
        lines += ["", "## Stage logs", ""]
        if sr:
            by_week = defaultdict(list)
            for x in sr:
                by_week[x[0]].append(x)
            for w, xs in by_week.items():
                tot = sum(x[sx["n"]] for x in xs)
                lines.append("Week %s: %d entries across %d stage types. Median human minutes per stage: %s." % (
                    w[1:], tot, len(xs), ", ".join("%s %s" % (x[1], x[sx["median_human_minutes"]]) for x in xs)))
            causes = {c: sum(x[sx["n_cause_" + c.replace("-", "_")]] for x in sr) for c in CAUSES}
            lines += ["", "Intervention causes across all entries: " + ", ".join("%s %d" % kv for kv in causes.items()) +
                      ", unclassified %d." % sum(x[sx["n_cause_unclassified"]] for x in sr)]
            nf = sum(x[sx["n_failed"]] for x in sr)
            nall = sum(x[sx["n"]] for x in sr)
            if nf:
                lines += ["", "Failed runs: %d of %d entries (%s%%), by stage: %s." % (
                    nf, nall, r(100.0 * nf / nall, 1), ", ".join("w%s %s %d" % (x[0][1:], x[1], x[sx["n_failed"]]) for x in sr if x[sx["n_failed"]]))]
            else:
                lines += ["", "Failed runs: none flagged."]
        else:
            lines.append("No stage logs recorded.")
    if outcomes is not None:
        oh, orr = outcomes
        ox = {h: i for i, h in enumerate(oh)}
        lines += ["", "## Outcomes", ""]
        if orr:
            props = [x for x in orr if x[ox["proportion_checked"]] != ""]
            by_week = defaultdict(list)
            for x in props:
                by_week[x[0]].append(x[ox["proportion_checked"]])
            for w, ps in by_week.items():
                lines.append("Week %s: mean proportion of outcomes ticked %s over %d outcomes (%d learners used the checklist)." % (
                    w[1:], r(st.mean(ps), 2), len(ps), next(x[ox["learners_with_checklist"]] for x in props if x[0] == w)))
            low = sorted(props, key=lambda x: x[ox["proportion_checked"]])[:3]
            lines += ["", "Least-ticked outcomes: " + ", ".join("%s %s (%s)" % (x[0], x[1], x[ox["proportion_checked"]]) for x in low) + "."]
        else:
            lines.append("No outcomes recorded.")
    if certificates is not None:
        ch, cr = certificates
        lines += ["", "## Certificates", ""]
        if cr:
            unique_learners = len({x[0] for x in cr})
            lines.append("%d certificates recorded across %d learners." % (len(cr), unique_learners))
        else:
            lines.append("No certificates recorded.")
    lines += ["", "Aliases are omitted from this report.", ""]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="+", help="folders or .json files")
    ap.add_argument("--out", default="results", help="output folder (default: results)")
    ap.add_argument("--show-aliases", action="store_true", help="include aliases in learners.csv")
    ap.add_argument("--truth", help="benchmarks.json: human minutes per task from tasks[].groundTruth (humanMinutesPoint, "
                                    "or the midpoint of humanMinutesLow and humanMinutesHigh), and the published agent pass "
                                    "counts from agentPassCount and agentAttempts")
    ap.add_argument("--truth-field", default="truthMinutes", help="numeric ground-truth field (default truthMinutes)")
    ap.add_argument("--bucket-field", default="bucket", help="bucket field used if the numeric field is absent")
    ap.add_argument("--bucket-midpoints", help='JSON map of bucket label to minutes, e.g. \'{"S": 30}\'')
    ap.add_argument("--totals", help='optional JSON {"w1": {"claude": 9, "codex": 9}} giving item totals, to add completion_wN')
    a = ap.parse_args()

    ls = load_learners(a.paths)
    if not ls:
        print("No valid progress files found.", file=sys.stderr)
        return 1
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    totals = None
    if a.totals:
        try:
            totals = json.loads(Path(a.totals).read_text(encoding="utf-8"))
        except (OSError, ValueError) as e:
            warn("totals not used (%s)" % e)
    truth = {}
    if a.truth:
        mids = json.loads(a.bucket_midpoints) if a.bucket_midpoints else {}
        if Path(a.truth).exists():
            truth = load_truth(a.truth, a.truth_field, a.bucket_field, mids)
        else:
            warn("ground truth file %s not found; continuing without it" % a.truth)

    lt = learners_table(ls, totals, a.show_aliases)
    it = items_table(ls)
    qt = questions_table(ls)
    agent_truth = load_agent_truth(a.truth) if a.truth and Path(a.truth).exists() else {}
    et = estimates_table(ls, truth, agent_truth)
    st_t = stages_table(ls)
    ot = outcomes_table(ls)
    ct = certificates_table(ls)
    for name, (h, rows) in (("learners", lt), ("items", it), ("questions", qt), ("estimates", et),
                            ("stages", st_t), ("outcomes", ot), ("certificates", ct)):
        write_csv(out / (name + ".csv"), h, rows)
    (out / "summary.md").write_text(summary_md(ls, it, qt, et, bool(truth), st_t, ot, ct), encoding="utf-8")
    print("Read %d learners; wrote learners.csv, items.csv, questions.csv, estimates.csv, stages.csv, outcomes.csv, certificates.csv, summary.md to %s" % (len(ls), out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
