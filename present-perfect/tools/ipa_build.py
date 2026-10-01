#!/usr/bin/env python3
"""
Build the IPA dictionary used under every on-screen word.

IMPORTANT — verification status: oxfordlearnersdictionaries.com is blocked from the build environment,
so NOTHING here is verified against Oxford Learner's Dictionaries (US).  Transcriptions are
  (a) converted from CMUdict (American English) into Oxford-US-style symbols, or
  (b) hand-written overrides (MANUAL below) for function words, contractions, names and numbers.
build/ipa_report.md lists every word with its source so a human can check the list against OLD US.

Symbol conventions (follow the Fluent English renderer sample data in README.md):
  i, u without length marks;  ɑː ɔː ɜːr with length marks;  oʊ eɪ aɪ aʊ ɔɪ;  ɡ = U+0261;  stress ˈ ˌ before the syllable onset.
Usage: python tools/ipa_build.py build/words.json   ->  build/ipa.js, build/ipa_report.md
"""
import json, re, sys
from pathlib import Path
import cmudict

ROOT = Path(__file__).resolve().parents[1]
CMU = cmudict.dict()

VOW = {"AA": "ɑː", "AE": "æ", "AO": "ɔː", "AW": "aʊ", "AY": "aɪ", "EH": "e", "EY": "eɪ", "IH": "ɪ", "IY": "i", "OW": "oʊ", "OY": "ɔɪ", "UH": "ʊ", "UW": "u"}
CON = {"B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f", "G": "ɡ", "HH": "h", "JH": "dʒ", "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ", "P": "p", "R": "r", "S": "s", "SH": "ʃ", "T": "t", "TH": "θ", "V": "v", "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ"}
ON2 = {("P", "L"), ("P", "R"), ("B", "L"), ("B", "R"), ("T", "R"), ("D", "R"), ("K", "L"), ("K", "R"), ("G", "L"), ("G", "R"), ("F", "L"), ("F", "R"), ("TH", "R"),
       ("SH", "R"), ("S", "P"), ("S", "T"), ("S", "K"), ("S", "M"), ("S", "N"), ("S", "L"), ("S", "W"), ("S", "F"), ("T", "W"), ("D", "W"), ("K", "W"), ("G", "W"), ("TH", "W"), ("HH", "Y"), ("K", "Y"), ("P", "Y"), ("B", "Y"), ("F", "Y"), ("M", "Y"), ("N", "Y"), ("T", "Y"), ("D", "Y"), ("S", "Y"), ("V", "Y"), ("L", "Y")}
ON3 = {("S", "P", "R"), ("S", "P", "L"), ("S", "T", "R"), ("S", "K", "R"), ("S", "K", "W"), ("S", "K", "L")}


def is_v(p): return p[:-1] in VOW or p[:2] == "ER" or p == "ER" or (p[:2] == "AH")


def convert(phones):
    nuclei = [i for i, p in enumerate(phones) if re.match(r"[A-Z]+[012]$", p)]
    if not nuclei:
        return "".join(CON.get(p, "") for p in phones)
    # split consonant clusters between nuclei by maximal legal onset
    syll = []  # each: dict(on=[], nuc=phone, cod=[])
    for k, ni in enumerate(nuclei):
        syll.append({"on": [], "nuc": phones[ni], "cod": []})
    lead = phones[: nuclei[0]]
    syll[0]["on"] = lead
    for k in range(len(nuclei) - 1):
        cl = phones[nuclei[k] + 1: nuclei[k + 1]]
        cut = 0
        for n in (3, 2, 1):
            if len(cl) >= n:
                suf = tuple(cl[-n:])
                if n == 3 and suf in ON3 or n == 2 and suf in ON2 or n == 1 and suf[0] != "NG":
                    cut = len(cl) - n; break
        else:
            cut = len(cl)
        syll[k]["cod"] = cl[:cut]; syll[k + 1]["on"] = cl[cut:]
    syll[-1]["cod"] = phones[nuclei[-1] + 1:]
    mono = len(syll) == 1
    out = []
    for s in syll:
        base, st = s["nuc"][:-1], s["nuc"][-1]
        if base == "AH": v = "ə" if st == "0" else "ʌ"
        elif base == "ER": v = "ər" if st == "0" else "ɜːr"
        else: v = VOW[base]
        mark = "" if mono else ("ˈ" if st == "1" else "ˌ" if st == "2" else "")
        out.append(mark + "".join(CON[p] for p in s["on"]) + v + "".join(CON[p] for p in s["cod"]))
    return "".join(out)


# hand-written overrides (Oxford-US-style).  Everything here is a candidate for human checking.
MANUAL = {
    "a": "ə", "the": "ðə", "to": "tu", "of": "əv", "and": "ænd", "or": "ɔːr", "in": "ɪn", "at": "æt", "is": "ɪz", "are": "ɑːr", "am": "æm",
    "i": "aɪ", "you": "ju", "he": "hi", "she": "ʃi", "it": "ɪt", "we": "wi", "they": "ðeɪ", "her": "hɜːr", "his": "hɪz", "my": "maɪ", "your": "jɔːr",
    "have": "hæv", "has": "hæz", "had": "hæd", "do": "du", "does": "dʌz", "did": "dɪd", "not": "nɑːt", "was": "wʌz", "were": "wɜːr", "been": "bɪn", "be": "bi",
    "for": "fɔːr", "since": "sɪns", "yet": "jet", "just": "dʒʌst", "so": "soʊ", "far": "fɑːr", "can": "kæn", "will": "wɪl", "this": "ðɪs", "that": "ðæt", "than": "ðæn",
    "i've": "aɪv", "you've": "juv", "we've": "wiv", "they've": "ðeɪv", "she's": "ʃiz", "he's": "hiz", "it's": "ɪts", "i'm": "aɪm", "you're": "jʊr", "that's": "ðæts", "let's": "lets",
    "haven't": "ˈhævnt", "hasn't": "ˈhæznt", "don't": "doʊnt", "doesn't": "ˈdʌznt", "didn't": "ˈdɪdnt", "isn't": "ˈɪznt", "where's": "werz", "what's": "wʌts",
    "eaten": "ˈitn", "gone": "ɡɔːn", "done": "dʌn", "seen": "sin", "ate": "eɪt", "saw": "sɔː", "went": "went",
    "present": "ˈpreznt", "perfect": "ˈpɜːrfɪkt", "participle": "ˈpɑːrtɪsɪpl", "apostrophe": "əˈpɑːstrəfi", "paris": "ˈpærɪs", "london": "ˈlʌndən",
    "canada": "ˈkænədə", "sofia": "soʊˈfiə", "maya": "ˈmaɪə", "daniel": "ˈdænjəl", "fluent": "ˈfluənt", "english": "ˈɪŋɡlɪʃ",
    "oh": "oʊ", "no": "noʊ", "yes": "jes", "know": "noʊ", "known": "noʊn", "lived": "lɪvd", "live": "lɪv", "here": "hɪr", "there": "ðer", "where": "wer", "what": "wʌt", "how": "haʊ", "long": "lɔːŋ",
    "1": "wʌn", "2": "tu", "3": "θri", "4": "fɔːr", "2019": "ˈtwenti naɪnˈtin", "2021": "ˈtwenti ˈtwenti wʌn", "2022": "ˈtwenti ˈtwenti tu",
    "yesterday": "ˈjestərdeɪ", "today": "təˈdeɪ", "already": "ɔːlˈredi", "visited": "ˈvɪzɪtɪd", "report": "rɪˈpɔːrt", "meetings": "ˈmitɪŋz", "meeting": "ˈmitɪŋ",
    "years": "jɪrz", "year": "jɪr", "two": "tu", "five": "faɪv", "week": "wik", "summer": "ˈsʌmər", "last": "læst", "next": "nekst", "lesson": "ˈlesn", "grammar": "ˈɡræmər",
}
HIGH_RISK = set("a the to of and or in at is are am i you he she it we they her his my your have has had do does did not was were been be for since yet just so far".split()) | \
    {"haven't", "hasn't", "don't", "doesn't", "didn't", "isn't", "eaten", "gone", "present", "perfect", "participle", "apostrophe", "canada", "sofia", "maya", "daniel", "2019", "2021", "2022", "already", "visited", "london", "paris"}


def lookup(word):
    w = word.lower().replace("’", "'")
    if w in MANUAL: return MANUAL[w], "manual"
    if w in CMU:
        return convert(CMU[w][0]), "cmudict"
    # possessive/contraction fallback:  xxx's -> xxx + z/s
    m = re.match(r"^(.+)'(s|ve|ll|d|re)$", w)
    if m and m.group(1) in CMU:
        base = convert(CMU[m.group(1)][0]); suf = {"s": "z", "ve": "v", "ll": "l", "d": "d", "re": "ər"}[m.group(2)]
        return base + suf, "derived"
    return None, "MISSING"


def main():
    words = sorted(set(json.loads(Path(sys.argv[1]).read_text())))
    out, rows, missing = {}, [], []
    for w in words:
        ipa, src = lookup(w)
        if ipa is None: missing.append(w); continue
        out[w] = ipa; rows.append((w, ipa, src))
    (ROOT / "build" / "ipa.js").write_text("window.IPA_DICT=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";")
    lines = ["# IPA verification report", "",
             "**Status: UNVERIFIED.** `oxfordlearnersdictionaries.com/us` could not be reached from the build environment (network policy 403),",
             "so no entry below has been checked against Oxford Learner's Dictionaries (US). Sources: `cmudict` = converted from CMUdict;",
             "`manual` = hand-written override; `derived` = contraction/possessive built from a base word.",
             "Symbol conventions follow the sample data in the repository README (i/u without length marks). No Fluent English sound chart was supplied.", "",
             f"{len(rows)} words. High-risk items (function words, contractions, names, numbers, reduced vowels) are marked **!**.", "",
             "| word | IPA | source | check |", "|---|---|---|---|"]
    for w, ipa, src in rows:
        flag = "**!**" if (w in HIGH_RISK or src != "cmudict") else ""
        lines.append(f"| {w} | /{ipa}/ | {src} | {flag} |")
    if missing: lines += ["", "## MISSING (no transcription available)", ""] + [f"- {m}" for m in missing]
    (ROOT / "build" / "ipa_report.md").write_text("\n".join(lines) + "\n")
    print(f"{len(rows)} words written; missing: {missing}")


if __name__ == "__main__":
    main()
