"""
Builders that expand compact activity definitions into (a) script beats with timed lines, and (b) the activity
data the animation reads (window.ACTIVITIES).  The 5-minute core lesson (src/script_core.json) is reused as-is.
Every spoken line gets a stable id; hold lines are class thinking/repeating/pair-work time.
"""
import copy, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORE = {b["id"]: b for b in json.loads((ROOT / "src/script_core.json").read_text())["beats"]}
CORE_META = json.loads((ROOT / "src/script_core.json").read_text())

ORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]
YEARS = {"2019": "twenty nineteen", "2021": "twenty twenty-one", "2022": "twenty twenty-two", "2020": "twenty twenty"}
CONTR = {"I've": "ˈaɪv", "you've": "jˈuv", "You've": "jˈuv", "we've": "wˈiv", "We've": "wˈiv", "they've": "ðˈeɪv", "They've": "ðˈeɪv"}


def spoken(text):
    """TTS-friendly version of on-screen text."""
    s = text
    for k, v in YEARS.items(): s = s.replace(k, v)
    for k, v in CONTR.items(): s = re.sub(r"(?<![\w\[])" + re.escape(k) + r"(?![\w\]])", f"[{k}](/{v}/)", s)
    return s


class Lesson:
    def __init__(self):
        self.beats, self.acts, self.chapters, self.cur = [], [], [], None
        self._n = 0

    # ------------------------------------------------------------ structure
    def chapter(self, cid, label):
        self.chapters.append({"id": cid, "label": label}); self.cur = cid

    def core(self, *ids):
        for i in ids:
            b = copy.deepcopy(CORE[i]); b["ch"] = self.cur; self.beats.append(b)

    def _beat(self, bid, lines, **kw):
        b = {"id": bid, "ch": self.cur, "lines": lines}; b.update(kw); self.beats.append(b); return b

    def _line(self, lid, who, text, kind="say", **kw):
        d = {"id": lid, "who": who, "text": text, "kind": kind}
        sp = spoken(text)
        if sp != text and "say" not in kw: d["say"] = sp
        d.update(kw)
        if kind == "say": d.pop("kind")
        return d

    @staticmethod
    def _hold(lid, secs): return {"id": lid, "kind": "hold", "hold": round(secs, 2)}

    def _act(self, **kw): self.acts.append(kw); return kw

    def _cast(self, lines, default):
        seen = []
        for l in lines:
            w = l.get("who")
            if w and w != "N" and w not in seen: seen.append(w)
        for d in default:
            if len(seen) >= 2: break
            if d not in seen: seen.append(d)
        return seen[:3]

    # ------------------------------------------------------------ narration-only beat
    def say_beat(self, bid, lines):
        """plain narration (no activity UI); lines = [(who,text), ...]"""
        self._beat(bid, [self._line(f"{bid}_{i}", w, t) for i, (w, t) in enumerate(lines)])

    # ------------------------------------------------------------ info card: rows revealed as narrated
    def info(self, aid, title, rows, intro=None, outro=None, cast=("M", "D"), scene="studio"):
        lines, rr = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, r in enumerate(rows):
            lid = None
            if r.get("say"):
                lid = f"{aid}_r{i}"; lines.append(self._line(lid, "N", r["say"], "say"))
            rr.append({"text": r["text"], "roles": r.get("roles"), "tag": r.get("tag"), "line": lid, "size": r.get("size")})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="info", beat=aid, ch=self.cur, title=title, rows=rr, cast=self._cast(lines, cast), scene=scene)

    # ------------------------------------------------------------ table (rows are spoken then the class repeats)
    def table(self, aid, title, cols, rows, intro=None, outro=None, hold=2.4, repeat=True, cast=("S", "D"), emph=-1):
        lines, rr = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, r in enumerate(rows):
            lid = f"{aid}_r{i}"
            lines.append(self._line(lid, "N", r["say"], "ex", speed=0.85))
            hid = None
            if repeat:
                hid = f"{aid}_h{i}"; lines.append(self._hold(hid, r.get("hold", hold)))
            rr.append({"label": r.get("label"), "cells": r["cells"], "line": lid, "hold": hid})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="table", beat=aid, ch=self.cur, title=title, cols=cols, rows=rr, cast=self._cast(lines, cast), emph=emph)

    # ------------------------------------------------------------ choral repetition of model sentences
    def choral(self, aid, title, sentences, intro="Repeat after me.", outro=None, cast=("M", "D"), gap=1.4):
        lines, items = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, s in enumerate(sentences):
            who = s.get("who", "N")
            lines.append(self._line(f"{aid}_m{i}", who, s["text"], "ex", nocap=True, speed=s.get("speed", 0.88)))
            hid = f"{aid}_h{i}"; lines.append(self._hold(hid, s.get("hold", 2.6 + 0.35 * len(s["text"].split()) + gap)))
            items.append({"text": s["text"], "roles": s.get("roles"), "who": who, "m": f"{aid}_m{i}", "h": hid})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="choral", beat=aid, ch=self.cur, title=title, items=items, cast=self._cast(lines, cast))

    # ------------------------------------------------------------ say-it drill: prompt -> class answers -> reveal
    def say(self, aid, title, items, intro=None, outro=None, hold=2.6, cast=("S", "D"), label="Say it"):
        lines, its = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, it in enumerate(items):
            who = it.get("who", "N")
            q, h, a = f"{aid}_{i}q", f"{aid}_{i}h", f"{aid}_{i}a"
            lines.append(self._line(q, who, it.get("read", it["prompt"]), nocap=True, gap=0.12))
            lines.append(self._hold(h, it.get("hold", hold)))
            lines.append(self._line(a, it.get("awho", "N"), it.get("say", it["answer"]), "ex", nocap=True, lead=0.05, gap=0.6, speed=0.9))
            its.append({"prompt": it["prompt"], "answer": it["answer"], "q": q, "h": h, "a": a, "hint": it.get("hint")})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="say", beat=aid, ch=self.cur, title=title, items=its, cast=self._cast(lines, cast), label=label)

    # ------------------------------------------------------------ multiple choice (clickable)
    def choose(self, aid, title, items, intro=None, outro=None, hold=5.0, cast=("S", "D")):
        lines, its = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, it in enumerate(items):
            q, h, a = f"{aid}_{i}q", f"{aid}_{i}h", f"{aid}_{i}a"
            opts = it["options"]; n = len(opts)
            if it.get("stem"):
                qtext = f"{it['stem']} " + " ".join(f"{ORD[k+1].capitalize()}: {o}." for k, o in enumerate(opts))
            else:
                ctx = (it["context"] + " ") if it.get("context") else ""
                bef = it.get("before", "").strip(); aft = it.get("after", "").strip()
                qtext = f"{ctx}Number {ORD[i+1]}. " + (bef + ", " if bef else "") + "blank" + (", " + aft if aft else ".") + " " + ", ".join(opts[:-1]) + ", or " + opts[-1] + "?"
                qtext = qtext.replace(" ,", ",")
            ans = it["options"][it["correct"]]
            atext = f"{ans[0].upper()}{ans[1:]}. {it['why']}"
            lines.append(self._line(q, "N", qtext, nocap=True, gap=0.15))
            lines.append(self._hold(h, it.get("hold", hold)))
            lines.append(self._line(a, "N", atext, nocap=True, lead=0.05, gap=0.7))
            its.append({k: v for k, v in it.items() if k in ("before", "after", "options", "correct", "why", "context", "stem", "full", "roles")} | {"q": q, "h": h, "a": a})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="choose", beat=aid, ch=self.cur, title=title, items=its, cast=self._cast(lines, cast))

    # ------------------------------------------------------------ find the mistake
    def fix(self, aid, title, items, intro=None, outro=None, hold=5.5, cast=("M", "S")):
        lines, its = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, it in enumerate(items):
            q, h, a = f"{aid}_{i}q", f"{aid}_{i}h", f"{aid}_{i}a"
            lines.append(self._line(q, "N", "Find the mistake. " + it["wrong"], nocap=True, gap=0.15))
            lines.append(self._hold(h, hold))
            lines.append(self._line(a, "N", f"{it['right']} {it['why']}", nocap=True, lead=0.05, gap=0.7))
            its.append({"wrong": it["wrong"], "right": it["right"], "strike": it.get("strike", []), "mark": it.get("mark", []), "why": it["why"], "q": q, "h": h, "a": a})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="fix", beat=aid, ch=self.cur, title=title, items=its, cast=self._cast(lines, cast))

    # ------------------------------------------------------------ sort into two bins (clickable)
    def sort(self, aid, title, bins, items, intro=None, outro=None, hold=2.8, cast=("D", "M")):
        lines, its = [], []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, it in enumerate(items):
            q, h, a = f"{aid}_{i}q", f"{aid}_{i}h", f"{aid}_{i}a"
            lines.append(self._line(q, "N", it["text"], nocap=True, gap=0.1))
            lines.append(self._hold(h, hold))
            lines.append(self._line(a, "N", bins[it["bin"]].capitalize() + ".", "ex", nocap=True, lead=0.05, gap=0.5, speed=0.9))
            its.append({"text": it["text"], "bin": it["bin"], "q": q, "h": h, "a": a})
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="sort", beat=aid, ch=self.cur, title=title, bins=bins, items=its, cast=self._cast(lines, cast))

    # ------------------------------------------------------------ timed pair work (ring + prompts, role swap at half time)
    def pair(self, aid, title, prompts, minutes, intro, outro, swap="Switch roles!", roles=("Ask", "Answer"), cast=("M", "S"), scene="studio", stem=None):
        lines = [self._line(f"{aid}_i{i}", "N", t) for i, t in enumerate(intro)]
        half = minutes * 30
        lines += [self._hold(f"{aid}_h1", half), self._line(f"{aid}_sw", "N", swap, "ex", nocap=True, gap=0.3), self._hold(f"{aid}_h2", half)]
        lines += [self._line(f"{aid}_o{i}", "N", t) for i, t in enumerate(outro)]
        self._beat(aid, lines)
        self._act(id=aid, type="pair", beat=aid, ch=self.cur, title=title, prompts=prompts, h1=f"{aid}_h1", sw=f"{aid}_sw", h2=f"{aid}_h2", roles=list(roles), cast=list(cast), scene=scene, minutes=minutes, stem=stem)

    # ------------------------------------------------------------ single timed task (e.g. class sharing)
    def timer(self, aid, title, prompt, secs, intro, outro=None, cast=("M", "D")):
        lines = [self._line(f"{aid}_i{i}", "N", t) for i, t in enumerate(intro)]
        lines.append(self._hold(f"{aid}_h", secs))
        if outro: lines += [self._line(f"{aid}_o{i}", "N", t) for i, t in enumerate(outro)]
        self._beat(aid, lines)
        self._act(id=aid, type="timer", beat=aid, ch=self.cur, title=title, prompt=prompt, h=f"{aid}_h", cast=list(cast))

    # ------------------------------------------------------------ character skit (bubbles + narrator framing)
    def skit(self, aid, scene, cast, lines_, intro=None, outro=None, layout="duo"):
        lines = []
        if intro: lines.append(self._line(f"{aid}_i", "N", intro))
        for i, (who, t) in enumerate(lines_): lines.append(self._line(f"{aid}_s{i}", who, t, "dlg", nocap=True))
        if outro: lines.append(self._line(f"{aid}_o", "N", outro))
        self._beat(aid, lines)
        self._act(id=aid, type="skit", beat=aid, ch=self.cur, scene=scene, cast=list(cast), layout=layout)

    # ------------------------------------------------------------ output
    def write(self):
        voices = CORE_META["voices"]
        script = {"title": CORE_META["title"], "voices": voices, "elevenlabs": CORE_META.get("elevenlabs"), "chapters": self.chapters, "beats": self.beats}
        (ROOT / "src/script.json").write_text(json.dumps(script, indent=1, ensure_ascii=False))
        (ROOT / "build").mkdir(exist_ok=True)
        (ROOT / "build/activities.js").write_text("window.ACTIVITIES=" + json.dumps(self.acts, ensure_ascii=False, separators=(",", ":")) + ";")
        (ROOT / "src/content/activities.json").write_text(json.dumps(self.acts, indent=1, ensure_ascii=False))
        n_lines = sum(len(b["lines"]) for b in self.beats)
        words = sum(len(re.findall(r"[A-Za-z']+", l.get("text", ""))) for b in self.beats for l in b["lines"] if l.get("kind") not in ("hold", "thought"))
        print(f"{len(self.beats)} beats, {len(self.acts)} activities, {n_lines} lines, {words} spoken words, {len(self.chapters)} chapters")
