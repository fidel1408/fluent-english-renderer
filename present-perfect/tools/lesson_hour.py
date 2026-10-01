#!/usr/bin/env python3
"""
The one-hour Present Perfect class: 13 chapters, teaching + whole-class practice.
Run:  python tools/lesson_hour.py   -> src/script.json, build/activities.js, src/content/activities.json
Quiz design rules: every distractor is unambiguously wrong in the given context; present-perfect items use
ever/never/already/yet/just/for/since cues, simple-past items use clearly finished time words (yesterday, last X, ago, in 2019).
"""
from lessonlib import Lesson

L = Lesson()
S, SB, SP, SO, SA = "subj", "aux", "part", "time", None   # role shorthands
SUBJ, AUX, PART, TIME = "subj", "aux", "part", "time"

# =============================================================================== 1  WELCOME
L.chapter("welcome", "Welcome")
L.core("title")
L.info("agenda", "Today's class", [
    {"text": "Talk about experiences", "say": "First, you will talk about experiences."},
    {"text": "Say what has just happened", "say": "Second, you will say what has just happened."},
    {"text": "Say how long", "say": "Third, you will say how long something has continued."},
    {"text": "Ask and answer questions", "say": "Fourth, you will ask and answer questions."},
    {"text": "Choose the right tense", "say": "And fifth, you will choose between the present perfect and the simple past."},
], intro="In this class, we will learn the present perfect together. We will listen, repeat, practice in pairs, and play some quick games.",
   outro="Use the chat, raise your hand, or speak out loud. Mistakes are fine. They help us learn. Let's begin.")
L.skit("meet", "studio", ["S", "M", "D"], [
    ("M", "Hi, I'm Maya."), ("D", "Hi, I'm Daniel."), ("S", "And I'm Sofia. We will help you today."),
], intro="First, meet our three friends.", outro="They will show you the grammar in real situations.", layout="trio")
L.say("warmup", "Have you ever?", [
    {"who": "D", "prompt": "Have you ever eaten sushi?", "answer": "Yes, I have. I ate it in Tokyo.", "awho": "M", "hold": 5.0},
    {"who": "M", "prompt": "Have you ever lost your phone?", "answer": "No, I haven't. But I've lost my keys!", "awho": "D", "hold": 5.0},
    {"who": "D", "prompt": "Have you ever met a famous person?", "answer": "Yes, I have. I met a singer last year.", "awho": "M", "hold": 5.0},
], intro="Warm up. Daniel and Maya will ask a question. Answer in your head, or in the chat: yes, I have, or no, I haven't.", label="Your answer", cast=("D", "M"),
   outro="Great. Today you will learn how to talk about experiences like these.")

# =============================================================================== 2  PAST AND NOW
L.chapter("story", "Past and now")
L.core("story1", "contrast")
L.choose("q_story", "Listen and choose", [
    {"stem": "Which sentence names a finished time?", "options": ["I lost my keys yesterday.", "I've lost my keys."], "correct": 0,
     "why": "Yesterday is a finished time, so we use the simple past."},
    {"stem": "Which sentence focuses on the result now?", "options": ["I lost my keys yesterday.", "I've lost my keys."], "correct": 1,
     "why": "I've lost my keys connects the past to now. In this situation, the keys are missing now."},
], intro="Let's check. Listen to the question, think, and choose.", cast=("M", "D"))
L.choral("rep_story", "Repeat after me", [
    {"text": "I lost my keys yesterday.", "who": "M", "roles": [SUBJ, PART, None, None, TIME]},
    {"text": "I've lost my keys.", "who": "D", "roles": [SUBJ, PART, None, None]},
], intro="Now, repeat after me. First, the simple past. Then, the present perfect.", cast=("M", "D"))

# =============================================================================== 3  FORM
L.chapter("form", "Form")
L.core("form1", "form2", "form3", "chk1")
L.say("drill_hh", "Have or has?", [
    {"prompt": "I", "answer": "have"}, {"prompt": "you", "answer": "have"}, {"prompt": "he", "answer": "has"}, {"prompt": "she", "answer": "has"},
    {"prompt": "it", "answer": "has"}, {"prompt": "we", "answer": "have"}, {"prompt": "they", "answer": "have"}, {"prompt": "Maya", "answer": "has"},
    {"prompt": "my friends", "answer": "have"}, {"prompt": "my sister", "answer": "has"},
], intro="Quick drill. I will say a subject. You say have or has. Ready?", outro="Well done. He, she, and it use has. Everyone else uses have.", hold=2.3, cast=("S", "D"), label="Say it")
L.choral("rep_form", "Repeat after me", [
    {"text": "I have finished my homework.", "who": "S", "roles": [SUBJ, AUX, PART, None, None]},
    {"text": "You have worked hard.", "who": "D", "roles": [SUBJ, AUX, PART, None]},
    {"text": "He has eaten lunch.", "who": "D", "roles": [SUBJ, AUX, PART, None]},
    {"text": "She has seen that movie.", "who": "M", "roles": [SUBJ, AUX, PART, None, None]},
    {"text": "We have been to Mexico.", "who": "S", "roles": [SUBJ, AUX, PART, None, None]},
    {"text": "They have bought a new car.", "who": "M", "roles": [SUBJ, AUX, PART, None, None, None]},
], intro="Now, listen and repeat. Notice the three parts: subject, have or has, and the past participle.", cast=("S", "D"))
L.choose("q_form", "Choose the answer", [
    {"before": "My brother", "after": "visited Spain.", "options": ["have", "has", "does"], "correct": 1, "why": "My brother is he, so we use has.", "roles": [SUBJ, AUX, PART, None]},
    {"before": "Maya and Daniel", "after": "finished.", "options": ["have", "has", "does"], "correct": 0, "why": "Maya and Daniel is they, so we use have.", "roles": [SUBJ, SUBJ, SUBJ, PART]},
    {"before": "I've", "after": "that song before.", "options": ["heard", "hear", "hearing"], "correct": 0, "why": "After have, we need the past participle: heard."},
    {"before": "She has", "after": "her keys.", "options": ["lost", "lose", "losing"], "correct": 0, "why": "Has plus the past participle: lost."},
], intro="Four quick questions. Think first, then choose.", cast=("S", "D"))

# =============================================================================== 4  PARTICIPLES
L.chapter("participles", "Participles")
L.table("ed_sounds", "Regular verbs", ["sound", "examples"], [
    {"label": "/t/", "cells": ["worked", "watched", "helped", "cooked"], "say": "Sound t. Worked. Watched. Helped. Cooked.", "hold": 4.0},
    {"label": "/d/", "cells": ["played", "lived", "cleaned", "opened"], "say": "Sound d. Played. Lived. Cleaned. Opened.", "hold": 4.0},
    {"label": "/ɪd/", "cells": ["wanted", "needed", "visited", "decided"], "say": "Sound id. Wanted. Needed. Visited. Decided.", "hold": 4.0},
], intro="Regular verbs add e d. But we say e d in three different ways. Listen and repeat.",
   outro="After t or d, e d is an extra syllable. Everywhere else, it is just t or d.", emph=-1)
L.table("irr_en", "Irregular verbs: group one", ["base form", "simple past", "past participle"], [
    {"cells": ["eat", "ate", "eaten"], "say": "eat, ate, eaten."}, {"cells": ["see", "saw", "seen"], "say": "see, saw, seen."},
    {"cells": ["give", "gave", "given"], "say": "give, gave, given."}, {"cells": ["take", "took", "taken"], "say": "take, took, taken."},
    {"cells": ["write", "wrote", "written"], "say": "write, wrote, written."}, {"cells": ["break", "broke", "broken"], "say": "break, broke, broken."},
], intro="Now, irregular verbs. They do not add e d. Group one: many participles end in e n.", cast=("S", "D"))
L.say("say_en", "Say the participle", [
    {"prompt": "eat", "answer": "eaten"}, {"prompt": "see", "answer": "seen"}, {"prompt": "give", "answer": "given"},
    {"prompt": "take", "answer": "taken"}, {"prompt": "write", "answer": "written"}, {"prompt": "break", "answer": "broken"},
], intro="Your turn. I say the base verb. You say the past participle.", hold=2.6, cast=("S", "D"), label="Say it")
L.table("irr_common", "Irregular verbs: group two", ["base form", "simple past", "past participle"], [
    {"cells": ["go", "went", "gone"], "say": "go, went, gone."}, {"cells": ["do", "did", "done"], "say": "do, did, done."},
    {"cells": ["be", "was, were", "been"], "say": "be, was or were, been."}, {"cells": ["have", "had", "had"], "say": "have, had, had."},
    {"cells": ["make", "made", "made"], "say": "make, made, made."}, {"cells": ["say", "said", "said"], "say": "say, said, said."},
], intro="Group two: very common verbs. Learn these first.", cast=("M", "D"))
L.say("say_common", "Say the participle", [
    {"prompt": "go", "answer": "gone"}, {"prompt": "do", "answer": "done"}, {"prompt": "be", "answer": "been"},
    {"prompt": "have", "answer": "had"}, {"prompt": "make", "answer": "made"}, {"prompt": "say", "answer": "said"},
], hold=2.6, cast=("M", "D"), label="Say it")
L.table("irr_same", "Irregular verbs: group three", ["base form", "simple past", "past participle"], [
    {"cells": ["buy", "bought", "bought"], "say": "buy, bought, bought."}, {"cells": ["bring", "brought", "brought"], "say": "bring, brought, brought."},
    {"cells": ["find", "found", "found"], "say": "find, found, found."}, {"cells": ["lose", "lost", "lost"], "say": "lose, lost, lost."},
    {"cells": ["leave", "left", "left"], "say": "leave, left, left."}, {"cells": ["meet", "met", "met"], "say": "meet, met, met."},
], intro="Group three: the simple past and the past participle are the same.", cast=("S", "M"))
L.say("say_same", "Say the participle", [
    {"prompt": "buy", "answer": "bought"}, {"prompt": "bring", "answer": "brought"}, {"prompt": "find", "answer": "found"},
    {"prompt": "lose", "answer": "lost"}, {"prompt": "leave", "answer": "left"}, {"prompt": "meet", "answer": "met"},
], hold=2.6, cast=("S", "M"), label="Say it")
L.table("irr_nochange", "Irregular verbs: group four", ["base form", "simple past", "past participle"], [
    {"cells": ["put", "put", "put"], "say": "put, put, put."}, {"cells": ["cut", "cut", "cut"], "say": "cut, cut, cut."},
    {"cells": ["read", "{read|red}", "{read|red}"], "say": "read, red, red. The spelling is the same, but the sound changes.", "hold": 3.2},
    {"cells": ["run", "ran", "run"], "say": "run, ran, run."}, {"cells": ["come", "came", "come"], "say": "come, came, come."},
    {"cells": ["hit", "hit", "hit"], "say": "hit, hit, hit."},
], intro="Group four: some verbs do not change, or they change only a little.", cast=("D", "M"))
L.say("say_nochange", "Say the participle", [
    {"prompt": "put", "answer": "put"}, {"prompt": "cut", "answer": "cut"}, {"prompt": "read", "answer": "{read|red}", "say": "red"},
    {"prompt": "run", "answer": "run"}, {"prompt": "come", "answer": "come"}, {"prompt": "hit", "answer": "hit"},
], hold=2.6, cast=("D", "M"), label="Say it")
L.choose("q_part", "Choose the participle", [
    {"before": "She has", "after": "a letter.", "options": ["wrote", "written", "write"], "correct": 1, "why": "Written is the past participle of write."},
    {"before": "We've", "after": "to the park.", "options": ["went", "gone", "go"], "correct": 1, "why": "Gone is the past participle of go."},
    {"before": "He has", "after": "his homework.", "options": ["did", "done", "do"], "correct": 1, "why": "Done is the past participle of do."},
    {"before": "They've", "after": "a new house.", "options": ["bought", "buy", "buying"], "correct": 0, "why": "Bought is the past participle of buy."},
    {"before": "I've", "after": "Maria twice.", "options": ["met", "meet", "meeting"], "correct": 0, "why": "Met is the past participle of meet."},
    {"before": "Have you", "after": "that movie?", "options": ["saw", "seen", "see"], "correct": 1, "why": "Seen is the past participle of see."},
    {"before": "She has", "after": "the window.", "options": ["broke", "broken", "break"], "correct": 1, "why": "Broken is the past participle of break."},
    {"before": "I have", "after": "to Italy three times.", "options": ["been", "was", "be"], "correct": 0, "why": "Been is the past participle of be."},
], intro="Participle quiz. Eight questions. Think first, then choose.", hold=6.0, cast=("S", "D"))

# =============================================================================== 5  NEGATIVES AND QUESTIONS
L.chapter("negq", "Negatives and questions")
L.table("contractions", "Short forms", ["full form", "short form"], [
    {"cells": ["I have", "I've"], "say": "I have, I've."}, {"cells": ["you have", "you've"], "say": "you have, you've."},
    {"cells": ["we have", "we've"], "say": "we have, we've."}, {"cells": ["they have", "they've"], "say": "they have, they've."},
    {"cells": ["he has", "he's"], "say": "he has, he's."}, {"cells": ["she has", "she's"], "say": "she has, she's."},
    {"cells": ["it has", "it's"], "say": "it has, it's."},
], intro="In speech, we usually use short forms. Listen and repeat.", outro="Careful: apostrophe s can mean has or is. Check the next word.", hold=2.0, cast=("M", "S"), emph=1)
L.say("contract", "Say the short form", [
    {"prompt": "She has finished.", "answer": "She's finished."}, {"prompt": "I have eaten.", "answer": "I've eaten."},
    {"prompt": "They have arrived.", "answer": "They've arrived."}, {"prompt": "He has gone.", "answer": "He's gone."},
    {"prompt": "We have started.", "answer": "We've started."},
], intro="Now you say the short form.", hold=3.2, cast=("M", "S"), label="Say it")
L.core("neg", "quest")
L.say("make_neg", "Make it negative", [
    {"prompt": "I have finished.", "answer": "I haven't finished."}, {"prompt": "She has called.", "answer": "She hasn't called."},
    {"prompt": "They have arrived.", "answer": "They haven't arrived."}, {"prompt": "He has eaten.", "answer": "He hasn't eaten."},
    {"prompt": "We have seen it.", "answer": "We haven't seen it."},
], intro="Make these sentences negative. Use haven't or hasn't.", hold=3.4, cast=("D", "M"), label="Say it")
L.say("make_q", "Make a question", [
    {"prompt": "You have finished.", "answer": "Have you finished?"}, {"prompt": "She has called.", "answer": "Has she called?"},
    {"prompt": "They have arrived.", "answer": "Have they arrived?"}, {"prompt": "He has eaten.", "answer": "Has he eaten?"},
    {"prompt": "It has stopped.", "answer": "Has it stopped?"},
], intro="Now make questions. Put have or has first.", hold=3.4, cast=("S", "D"), label="Say it")
L.core("short")
L.say("short_ans", "Short answers", [
    {"prompt": "Have you eaten? Yes.", "answer": "Yes, I have."}, {"prompt": "Has she called? No.", "answer": "No, she hasn't."},
    {"prompt": "Have they arrived? Yes.", "answer": "Yes, they have."}, {"prompt": "Has he finished? No.", "answer": "No, he hasn't."},
    {"prompt": "Has it started? Yes.", "answer": "Yes, it has."},
], intro="Give the short answer. Yes or no, plus the subject, plus have or has.", hold=3.2, cast=("M", "D"), label="Say it")
L.core("wh")
L.choral("rep_wh", "Question words", [
    {"text": "What have you done?", "who": "M", "roles": ["wh", AUX, SUBJ, PART]},
    {"text": "Where have you been?", "who": "D", "roles": ["wh", AUX, SUBJ, PART]},
    {"text": "How long have you lived here?", "who": "S", "roles": ["wh", "wh", AUX, SUBJ, PART, None]},
    {"text": "Who have you called?", "who": "M", "roles": ["wh", AUX, SUBJ, PART]},
], intro="Listen and repeat. Question word, then have or has, then the subject.", cast=("M", "D"))
L.core("chk2")
L.choose("q_negq", "Choose the answer", [
    {"before": "She", "after": "finished yet.", "options": ["hasn't", "haven't", "doesn't"], "correct": 0, "why": "She is he, she, or it, so we use hasn't."},
    {"before": "", "after": "you ever visited Canada?", "options": ["Have", "Has", "Do"], "correct": 0, "why": "Have comes first, before the subject you."},
    {"context": "Has he finished?", "before": "Yes, he", "after": ".", "options": ["has", "does", "is"], "correct": 0, "why": "A short answer repeats has."},
    {"before": "How long", "after": "they lived here?", "options": ["have", "has", "did"], "correct": 0, "why": "They uses have, and lived is the past participle."},
], intro="Four more questions about negatives and questions.", cast=("S", "D"))
L.pair("pair_q", "Pair work", [
    "Have you eaten breakfast today?", "Have you finished your homework?", "Has your phone rung today?",
    "Have you studied English this week?", "Have you called a friend today?", "Have you seen a good movie lately?",
], 3.0, [
    "Pair work time. Work with a partner. Partner one asks the questions. Partner two answers with a short answer.",
    "Then I will say, switch roles, and you change. You have three minutes. Start now.",
], ["Time's up. Great job. Let's come back together."], roles=("Ask", "Answer"), cast=("M", "S"))

# =============================================================================== 6  EXPERIENCE
L.chapter("exp", "Experience")
L.core("exp1", "exp2")
L.info("exp_words", "Useful words", [
    {"text": "Have you ever visited Canada?", "say": "Ever means at any time in your life. We use it in questions.", "roles": [AUX, SUBJ, TIME, PART, None]},
    {"text": "I've never visited Canada.", "say": "Never means not at any time. We use it with a positive verb, not with not.", "roles": [SUBJ, TIME, PART, None]},
    {"text": "I've visited Canada twice.", "say": "We can also say once, twice, or three times.", "roles": [SUBJ, PART, None, TIME]},
    {"text": "I've been there before.", "say": "And before means, at some time in the past.", "roles": [SUBJ, PART, None, TIME]},
], intro="Four useful words for experience.", cast=("S", "D"))
L.choral("rep_exp", "Repeat after me", [
    {"text": "Have you ever visited Canada?", "who": "S", "roles": [AUX, SUBJ, TIME, PART, None]},
    {"text": "I've never visited Canada.", "who": "D", "roles": [SUBJ, TIME, PART, None]},
    {"text": "I've visited Canada twice.", "who": "S", "roles": [SUBJ, PART, None, TIME]},
    {"text": "I've been there before.", "who": "D", "roles": [SUBJ, PART, None, TIME]},
], cast=("S", "D"))
L.say("exp_drill", "Ask the question", [
    {"prompt": "eat sushi", "answer": "Have you ever eaten sushi?", "read": "Eat sushi."}, {"prompt": "see a whale", "answer": "Have you ever seen a whale?", "read": "See a whale."},
    {"prompt": "ride a horse", "answer": "Have you ever ridden a horse?", "read": "Ride a horse."}, {"prompt": "meet a famous person", "answer": "Have you ever met a famous person?", "read": "Meet a famous person."},
    {"prompt": "lose your phone", "answer": "Have you ever lost your phone?", "read": "Lose your phone."}, {"prompt": "break a bone", "answer": "Have you ever broken a bone?", "read": "Break a bone."},
], intro="Now you ask the question. I say an idea. You ask, have you ever, plus the past participle.", hold=3.6, cast=("S", "D"), label="Ask it")
L.choose("q_exp", "Choose the answer", [
    {"before": "", "after": "you ever eaten snails?", "options": ["Have", "Has", "Do"], "correct": 0, "why": "Have comes before you, and eaten is the past participle."},
    {"context": "She doesn't know the city.", "before": "Maya has", "after": "been to Paris.", "options": ["never", "ever", "yet"], "correct": 0, "why": "Never means not at any time."},
    {"context": "It was great both times.", "before": "I've visited London", "after": "", "options": ["twice", "ever", "never"], "correct": 0, "why": "Twice means two times."},
    {"before": "", "after": "she ever met a famous person?", "options": ["Has", "Have", "Is"], "correct": 0, "why": "She uses has."},
], intro="Experience quiz. Four questions.", cast=("S", "D"))
L.pair("pair_exp", "Pair work", [
    "visited another country", "met a famous person", "eaten something strange", "lost something important",
    "slept outside", "sung in public", "forgotten a friend's birthday", "ridden a horse",
], 4.0, [
    "Pair work. Ask your partner, have you ever, and one of these ideas. If the answer is yes, ask, when was that? The answer uses the simple past.",
    "Partner one asks first. After two minutes, I will say switch. You have four minutes.",
], ["Time's up. Well done."], roles=("Ask", "Answer"), cast=("M", "S"), stem="Have you ever ...?")
L.timer("share_exp", "Tell the class", "Ana has visited Brazil.", 60, [
    "Now, tell the class about your partner. Use has. For example: Ana has visited Brazil.",
    "Volunteers, please. Speak now, or write in the chat.",
], cast=("M", "D"))

# =============================================================================== 7  RESULT
L.chapter("result", "Result")
L.core("res1", "res2")
L.info("result_words", "Just, already, yet", [
    {"text": "I've just finished.", "say": "Just means a very short time ago.", "roles": [SUBJ, TIME, PART]},
    {"text": "She's already left.", "say": "Already means earlier than expected. It goes before the participle.", "roles": [SUBJ, TIME, PART]},
    {"text": "Have you eaten yet?", "say": "Yet goes at the end of questions.", "roles": [AUX, SUBJ, PART, TIME]},
    {"text": "He hasn't called yet.", "say": "And in negatives, yet means, until now.", "roles": [SUBJ, AUX, PART, TIME]},
], intro="Three small words for recent results: just, already, and yet.", cast=("M", "D"))
L.choral("rep_res", "Repeat after me", [
    {"text": "I've just arrived.", "who": "D", "roles": [SUBJ, TIME, PART]},
    {"text": "She's already left.", "who": "M", "roles": [SUBJ, TIME, PART]},
    {"text": "Have you eaten yet?", "who": "S", "roles": [AUX, SUBJ, PART, TIME]},
    {"text": "He hasn't called yet.", "who": "D", "roles": [SUBJ, AUX, PART, TIME]},
], cast=("M", "D"))
L.skit("skit_office", "office", ["M", "D"], [
    ("M", "Daniel, have you finished the report yet?"), ("D", "Not yet. I've just started the last page."),
    ("M", "Have you called the client?"), ("D", "Yes, I have. I've already called him twice."),
    ("M", "Great! Then you haven't forgotten anything."), ("D", "I hope not!"),
], intro="Listen to Maya and Daniel at the office. Listen for yet, just, and already.", outro="Yet is in the question. Just and already go before the participle.")
L.choose("q_res", "Choose the answer", [
    {"context": "I did it two minutes ago.", "before": "I've", "after": "finished.", "options": ["just", "yet", "ever"], "correct": 0, "why": "Just means a very short time ago."},
    {"before": "Have you finished the report", "after": "?", "options": ["yet", "ever", "never"], "correct": 0, "why": "Yet goes at the end of a question."},
    {"context": "Do you want some lunch?", "before": "No, thanks. I've", "after": "eaten.", "options": ["already", "yet", "ever"], "correct": 0, "why": "Already goes before the participle."},
    {"context": "We are still waiting.", "before": "He hasn't called", "after": "", "options": ["yet", "already", "just"], "correct": 0, "why": "In a negative sentence, yet goes at the end."},
    {"context": "You can't catch it.", "before": "The train has", "after": "left.", "options": ["just", "yet", "ever"], "correct": 0, "why": "Just means a very short time ago."},
], intro="Result quiz. Five questions.", cast=("S", "D"))
L.say("result_say", "What's the result?", [
    {"prompt": "Daniel can't open the door. Use: lose.", "answer": "He's lost his keys.", "read": "Daniel can't open the door. Use the verb lose."},
    {"prompt": "Maya's desk is clean. Use: finish.", "answer": "She's finished her work.", "read": "Maya's desk is clean. Use the verb finish."},
    {"prompt": "The plate is empty. Use: eat.", "answer": "He's eaten everything.", "read": "The plate is empty. Use the verb eat."},
    {"prompt": "The suitcase is at the door. Use: pack.", "answer": "She's packed her suitcase.", "read": "The suitcase is at the door. Use the verb pack."},
    {"prompt": "The cake is on the table. Use: bake.", "answer": "They've baked a cake.", "read": "The cake is on the table. Use the verb bake."},
], intro="Look at the situation. Say a sentence about the result. Use the present perfect.", hold=5.0, cast=("M", "S"), label="Say it")

# =============================================================================== 8  STILL TRUE
L.chapter("still", "Still true")
L.core("still1", "still2", "chk3")
L.sort("sort_fs", "For or since?", ["for", "since"], [
    {"text": "five years", "bin": 0}, {"text": "2019", "bin": 1}, {"text": "Monday", "bin": 1}, {"text": "three days", "bin": 0},
    {"text": "last year", "bin": 1}, {"text": "a long time", "bin": 0}, {"text": "I was a child", "bin": 1}, {"text": "ten minutes", "bin": 0},
    {"text": "yesterday", "bin": 1}, {"text": "two hours", "bin": 0},
], intro="Game time. For or since? I show a time expression. Is it a length of time, for, or a starting point, since?", cast=("D", "M"))
L.info("howlong", "How long?", [
    {"text": "How long have you lived here?", "say": "To ask about a period up to now, we say, how long have you.", "roles": ["wh", "wh", AUX, SUBJ, PART, None]},
    {"text": "I've lived here for three years.", "say": "Answer with for, and a length of time.", "roles": [SUBJ, PART, None, TIME, TIME, TIME]},
    {"text": "I've lived here since 2022.", "say": "Or answer with since, and a starting point.", "roles": [SUBJ, PART, None, TIME, TIME]},
], cast=("S", "D"))
L.choral("rep_still", "Repeat after me", [
    {"text": "How long have you lived here?", "who": "M", "roles": ["wh", "wh", AUX, SUBJ, PART, None]},
    {"text": "I've lived here for three years.", "who": "D", "roles": [SUBJ, PART, None, TIME, TIME, TIME]},
    {"text": "I've lived here since 2022.", "who": "S", "roles": [SUBJ, PART, None, TIME, TIME]},
], cast=("S", "D"))
L.say("for_since_say", "For or since?", [
    {"prompt": "How long have you lived here? Five years.", "answer": "I've lived here for five years.", "read": "How long have you lived here? Five years."},
    {"prompt": "How long have you studied English? Since January.", "answer": "I've studied English since January.", "read": "How long have you studied English? Since January."},
    {"prompt": "How long has she worked here? Two months.", "answer": "She has worked here for two months.", "read": "How long has she worked here? Two months."},
    {"prompt": "How long have they been married? Since 2021.", "answer": "They've been married since 2021.", "read": "How long have they been married? Since 2021."},
    {"prompt": "How long has he had that car? Ten years.", "answer": "He has had that car for ten years.", "read": "How long has he had that car? Ten years."},
], intro="Now you answer with a full sentence. Use for, or since.", hold=5.0, cast=("D", "M"), label="Answer it")
L.choose("q_still", "Choose the answer", [
    {"before": "She has worked here", "after": "six months.", "options": ["for", "since", "during"], "correct": 0, "why": "Six months is a length of time. Use for."},
    {"before": "We've known each other", "after": "we were students.", "options": ["since", "for", "from"], "correct": 0, "why": "We were students is a starting point. Use since."},
    {"before": "How long", "after": "you studied English?", "options": ["have", "do", "are"], "correct": 0, "why": "How long, have, you, and the past participle studied."},
], intro="Three quick questions.", cast=("S", "D"))
L.pair("pair_hl", "Pair work", [
    "lived in your home", "studied English", "known your best friend", "had your phone",
    "worked or studied in your place", "been in this class",
], 3.0, [
    "Pair work. Ask, how long have you, and one of these ideas. Answer with for, or since.",
    "Partner one asks first. When I say switch, change roles. You have three minutes.",
], ["Time's up. Great speaking."], roles=("Ask", "Answer"), cast=("M", "S"), stem="How long have you ...?")

# =============================================================================== 9  TIME PERIODS
L.chapter("period", "Time periods")
L.core("per1", "per2", "fin1", "chk4")
L.info("time_chart", "Time words", [
    {"text": "ever, never, already, yet, just", "say": "Words like ever, never, already, yet, and just usually go with the present perfect."},
    {"text": "for and since, with a situation that continues", "say": "So do for and since, when the situation continues now."},
    {"text": "yesterday, last week, in 2019, two days ago", "say": "But words for a finished time, like yesterday, last week, in twenty nineteen, or two days ago, go with the simple past."},
], intro="A quick map of time words.", outro="Today, this week, and this year can go either way. The speaker's view matters.", cast=("M", "D"))
L.skit("skit_travel", "travel", ["S", "D"], [
    ("S", "I've visited Canada three times."), ("D", "Really? When did you first go?"),
    ("S", "I went there in 2019, and I loved it."), ("D", "Have you been back since then?"), ("S", "Yes. We went again last summer."),
], intro="Listen to Sofia and Daniel. Notice how the tense changes.", outro="First, the present perfect, for an experience. Then, the simple past, for the finished times.")
L.choose("q_period", "Present perfect or simple past?", [
    {"before": "I", "after": "to Paris in 2019.", "options": ["went", "have been", "have gone"], "correct": 0, "why": "In twenty nineteen is a finished time. Use the simple past."},
    {"before": "She", "after": "here since 2021.", "options": ["has lived", "lived", "is living"], "correct": 0, "why": "Since twenty twenty-one: the situation continues, so use the present perfect."},
    {"before": "We", "after": "that movie last night.", "options": ["saw", "have seen", "are seeing"], "correct": 0, "why": "Last night is a finished time. Use the simple past."},
    {"before": "They", "after": "married two years ago.", "options": ["got", "have got", "have gotten"], "correct": 0, "why": "Two years ago is a finished time. Use the simple past."},
    {"context": "He still works here.", "before": "He", "after": "here for five years.", "options": ["has worked", "worked", "was working"], "correct": 0, "why": "He still works here, so we use the present perfect."},
    {"before": "When", "after": "you finish the report?", "options": ["did", "have", "has"], "correct": 0, "why": "With when, we ask about a finished time. Use did."},
], intro="Six questions. Look for the time words.", cast=("D", "M"))

# =============================================================================== 10  NOTES
L.chapter("notes", "Notes")
L.core("usn", "gone1", "gone2")
L.choose("q_gone", "Been or gone?", [
    {"context": "Where's Daniel? He'll be back soon.", "before": "He's", "after": "to the bank.", "options": ["gone", "been"], "correct": 0, "why": "Gone means he is away now."},
    {"context": "It's a beautiful city.", "before": "I've", "after": "to Rome twice.", "options": ["been", "gone"], "correct": 0, "why": "Been means a visit, and then I came back."},
    {"context": "Sofia isn't here.", "before": "She's", "after": "to London.", "options": ["gone", "been"], "correct": 0, "why": "Gone means she is there now, on her trip."},
], intro="Three quick questions about been and gone.", cast=("S", "D"))
L.core("cont")

# =============================================================================== 11  MIXED PRACTICE
L.chapter("mixed", "Mixed practice")
L.fix("fix1", "Find the mistake", [
    {"wrong": "I've seen her yesterday.", "right": "I saw her yesterday.", "strike": ["I've", "seen"], "mark": ["saw"], "why": "Yesterday is a finished time. Use the simple past."},
    {"wrong": "He have finished.", "right": "He has finished.", "strike": ["have"], "mark": ["has"], "why": "He needs has."},
    {"wrong": "I've lived here since five years.", "right": "I've lived here for five years.", "strike": ["since"], "mark": ["for"], "why": "Five years is a length of time. Use for."},
    {"wrong": "They haven't call yet.", "right": "They haven't called yet.", "strike": ["call"], "mark": ["called"], "why": "After haven't, use the past participle."},
    {"wrong": "Have you eat lunch?", "right": "Have you eaten lunch?", "strike": ["eat"], "mark": ["eaten"], "why": "Eaten is the past participle."},
    {"wrong": "She's visited Paris last year.", "right": "She visited Paris last year.", "strike": ["She's"], "mark": ["visited"], "why": "Last year is a finished time. Use the simple past."},
    {"wrong": "Did you ever been to Japan?", "right": "Have you ever been to Japan?", "strike": ["Did"], "mark": ["Have"], "why": "Use have, plus the past participle."},
], intro="Game time. I show a sentence with one mistake. Find it, and fix it.", cast=("M", "S"))
L.sort("sort_tense", "Which tense?", ["present perfect", "simple past"], [
    {"text": "I've just finished.", "bin": 0}, {"text": "We went there in 2019.", "bin": 1}, {"text": "She's never been to Asia.", "bin": 0}, {"text": "I finished at noon.", "bin": 1},
    {"text": "Have you eaten yet?", "bin": 0}, {"text": "Did you call him yesterday?", "bin": 1}, {"text": "He's lived here since 2020.", "bin": 0}, {"text": "They arrived two hours ago.", "bin": 1},
], intro="Another game. I say a sentence. Is it the present perfect, or the simple past?", hold=3.4, cast=("S", "M"))
L.choose("show", "Quiz show", [
    {"before": "We", "after": "in this city since 2020.", "options": ["have lived", "lived", "live"], "correct": 0, "why": "Since twenty twenty means the situation continues. Use the present perfect."},
    {"before": "", "after": "you ever been to London?", "options": ["Have", "Did", "Are"], "correct": 0, "why": "Have you ever been."},
    {"before": "Maya", "after": "the report yet.", "options": ["hasn't finished", "didn't finished", "haven't finished"], "correct": 0, "why": "Maya is she. Hasn't finished."},
    {"before": "I", "after": "breakfast at seven yesterday.", "options": ["had", "have had", "has had"], "correct": 0, "why": "Yesterday is a finished time. Use the simple past."},
    {"before": "She's", "after": "to Rome three times.", "options": ["been", "gone", "went"], "correct": 0, "why": "Been, for a visit."},
    {"before": "I haven't seen him", "after": "Monday.", "options": ["since", "for", "from"], "correct": 0, "why": "Monday is a starting point. Use since."},
    {"before": "We've", "after": "eaten. We're full.", "options": ["already", "yet", "ever"], "correct": 0, "why": "Already goes before the participle."},
    {"before": "How long", "after": "you known her?", "options": ["have", "did", "do"], "correct": 0, "why": "How long have you known her."},
    {"before": "I", "after": "him last week.", "options": ["saw", "have seen", "has seen"], "correct": 0, "why": "Last week is a finished time. Use the simple past."},
    {"before": "She has", "after": "in Canada for ten years.", "options": ["lived", "live", "living"], "correct": 0, "why": "Has plus the past participle."},
], intro="Quiz show! Ten questions. Think, answer in the chat, and see if you are right.", hold=7.0, cast=("D", "S"))

# =============================================================================== 12  SPEAKING
L.chapter("speaking", "Speaking")
L.skit("skit_final", "cafe", ["S", "M"], [
    ("S", "Maya! I haven't seen you for ages!"), ("M", "Sofia! Have you been away?"),
    ("S", "Yes, I have. I've just come back from Canada."), ("M", "Wow! Have you ever visited Canada before?"),
    ("S", "No, I've never been there. It was my first time."), ("M", "How long have you been back?"),
    ("S", "Since Monday. I've already unpacked, but I haven't called my family yet."),
], intro="Listen to Sofia and Maya. How many present perfect sentences can you hear?", outro="Did you hear ever, never, just, already, yet, for, and since? Our friends used them all.")
L.pair("pair_final", "Role play", [
    "Ask: Have you been away?", "Say what you've just done.", "Say what you've never done.",
    "Ask: How long have you ...?", "Say what you haven't done yet.",
], 4.0, [
    "Role play time. Imagine you meet a friend after a long time. Use these ideas, and speak naturally.",
    "You have four minutes. I will say switch in the middle. Start now.",
], ["Time's up. Wonderful. I heard great sentences."], roles=("Friend one", "Friend two"), cast=("M", "S"))
L.timer("share_final", "Tell the class", "I've just ... I've never ... I haven't ... yet.", 75, [
    "Now, a few volunteers. Tell the class one sentence about yourself with I've, and one sentence about your partner with has.",
], cast=("M", "D"))

# =============================================================================== 13  REVIEW
L.chapter("review", "Review")
L.core("sum")
L.choose("exit", "Exit ticket", [
    {"before": "I", "after": "never visited Canada.", "options": ["have", "has", "am"], "correct": 0, "why": "I have never visited. Experience."},
    {"context": "Here is the report.", "before": "I've", "after": "finished.", "options": ["just", "ever", "since"], "correct": 0, "why": "Just means a very short time ago. Recent result."},
    {"before": "She has lived here", "after": "2021.", "options": ["since", "for", "ago"], "correct": 0, "why": "Since gives the starting point. Still true."},
    {"before": "We", "after": "to the beach last Sunday.", "options": ["went", "have been", "have gone"], "correct": 0, "why": "Last Sunday is a finished time. Simple past."},
], intro="Last activity: your exit ticket. Four questions, one for each use. Check what you remember.", hold=7.0, cast=("S", "D"))
L.core("speak")

# closing production moment: give the class a real minute to say their three sentences
for b in L.beats:
    if b['id'] == 'speak':
        for l in b['lines']:
            if l['id'] == 'y2': l['hold'] = 40.0
L.write()
