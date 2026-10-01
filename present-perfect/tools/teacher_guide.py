#!/usr/bin/env python3
"""Writes docs/teacher_guide.md: minute-by-minute plan, what to ask the class at each activity, and answer keys.
Everything is derived from build/timeline.json + src/content/activities.json + src/script_core.json, so it always matches the video."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
tl = json.loads((ROOT / "build/timeline.json").read_text())
acts = {a["beat"]: a for a in json.loads((ROOT / "src/content/activities.json").read_text())}
B = {b["id"]: b for b in tl["beats"]}
LINE = {l["id"]: l for b in tl["beats"] for l in b["lines"]}
CORE = {b["id"]: b for b in json.loads((ROOT / "src/script_core.json").read_text())["beats"]}
mm = lambda t: f"{int(t // 60)}:{int(t % 60):02d}"
HOW = {
    "info": "Let the card build up. Ask: *Which one is new for you?*",
    "table": "Students repeat each row after the voice (a short silent beat is left for the choral answer).",
    "choral": "Choral repetition: listen first, then everyone repeats together. Ask a few students to repeat alone afterwards.",
    "say": "Whole-class drill: a prompt appears, the class answers out loud in the silent beat, then the answer is revealed.",
    "choose": "Quiz: the class thinks, answers in chat or by show of hands (or click an option on screen), then the answer and the reason are revealed.",
    "fix": "Error correction: the class spots the mistake and says the corrected sentence.",
    "sort": "Sorting game: the class says which bin the item belongs to (click a bin to show it), then the answer is revealed.",
    "pair": "Pair work (breakout rooms or turn-and-talk). A countdown ring runs; the roles swap at half time with a *Switch roles!* banner.",
    "timer": "Whole-class sharing: nominate volunteers during the countdown.",
    "skit": "Listening: the characters speak in speech bubbles. Ask *How many present perfect sentences can you hear?*",
}
def answer_key(a):
    t = a["type"]; out = []
    if t == "choose":
        for i, it in enumerate(a["items"], 1):
            full = (it.get("context", "") + " " + it.get("before", "") + " **" + it["options"][it["correct"]] + "** " + it.get("after", "")).strip() if not it.get("stem") else it["stem"] + " -> **" + it["options"][it["correct"]] + "**"
            out.append(f"{i}. {' '.join(full.split())}  — {it['why']}")
    elif t == "say":
        for i, it in enumerate(a["items"], 1): out.append(f"{i}. {it['prompt']}  ->  **{it['answer']}**")
    elif t == "fix":
        for i, it in enumerate(a["items"], 1): out.append(f"{i}. ~~{it['wrong']}~~  ->  **{it['right']}**  — {it['why']}")
    elif t == "sort":
        for i, it in enumerate(a["items"], 1): out.append(f"{i}. {it['text']}  ->  **{a['bins'][it['bin']]}**")
    elif t == "pair":
        out.append("Prompts: " + "; ".join(a["prompts"]) + f"  ({a['minutes']} min total, roles: {' / '.join(a['roles'])})")
    elif t == "timer": out.append(f"Model sentence: {a['prompt']}")
    elif t == "table":
        for r in a["rows"]: out.append("- " + (r.get("label", "") + " " if r.get("label") else "") + " | ".join(r["cells"]))
    return out

L = ["# Teacher guide — Present Perfect, whole-class lesson (about 60 minutes)", "",
     "Generated from the lesson data; times are positions in the video (m:ss). The class can always pause: **Space** pauses, **N / P** jump to the next / previous activity, **[ / ]** jump chapter.", "",
     "**Class pauses** (player setting): *At each activity* (default) stops the lesson at the start of each practice round so you can set it up; *At every question* stops before every single question; *Off* lets it run.", ""]
tot = {"pair": 0, "timer": 0}
chap = None
for b in tl["beats"]:
    if b["ch"] != chap:
        chap = b["ch"]; lab = next(c["label"] for c in tl["chapters"] if c["id"] == chap)
        L += ["", f"## {lab}  ·  starts {mm(b['t0'])}", ""]
    a = acts.get(b["id"])
    if a:
        dur = b["t1"] - b["t0"]; title = a.get("title") or ("Dialogue: " + " / ".join({"D": "Daniel", "M": "Maya", "S": "Sofia"}[c] for c in a["cast"]))
        L.append(f"### {mm(b['t0'])}  {title}  *({a['type']}, {mm(dur)})*")
        L.append(HOW[a["type"]])
        key = answer_key(a)
        if key: L += [""] + key
        L.append("")
        if a["type"] in tot: tot[a["type"]] += dur
    else:
        kind = 'Quick check' if b.get('check') else 'Explanation'; core = CORE.get(b["id"]); txt = " ".join(l.get("text", "") for l in b["lines"] if l["kind"] != "hold")
        L.append(f"- {mm(b['t0'])}  *{kind}* ({b['id']}): {txt[:230]}{'…' if len(txt) > 230 else ''}")
L += ["", "## Timing summary", "",
      f"Total {mm(tl['duration'])}. Pair work {mm(tot['pair'])}, class sharing {mm(tot['timer'])}. Everything else is explanation, whole-class drills and quizzes.", ""]
(ROOT / "docs").mkdir(exist_ok=True)
(ROOT / "docs/teacher_guide.md").write_text("\n".join(L))
print("docs/teacher_guide.md", len(L), "lines")
