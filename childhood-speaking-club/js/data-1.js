/* Lesson data, part 1: chapters 1-3.
 * Step fields:  id, t (label in the plan), sec (planned seconds), timer (speaking/thinking countdown, seconds),
 *               speak (true = student speaking time), phase, say [[who,text,mood,pose]…], scene, panel, starters, example, sample, auto.
 * For steps with a timer, sec = narration allowance + timer. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var L = (FE.LESSON = FE.LESSON || { chapters: [] });

  var NOCAST = { maya: null, theo: null, alex: null, jordan: null, k1: null, k2: null, k3: null, k4: null, newcomer: null, quiet: null, owner: null };
  var at = function (x, y, s, o) { var r = { x: x, y: y == null ? 930 : y, s: s == null ? 0.95 : s }; for (var k in (o || {})) r[k] = o[k]; return r; };

  /* ================= 1. ANIMATED OPENING (60 s) ================= */
  L.chapters.push({
    n: 1, id: "opening", title: "Animated opening", min: 1, mode: "story",
    goal: "Meet Maya and Theo, open the memory box, and meet the question for today.",
    steps: [
      { id: "o-title", t: "Welcome", sec: 6, auto: true, phase: "Listen",
        scene: { bg: "living", memory: true, tod: "dusk", cam: [960, 560, 1.0], fx: "title", region: [48, 690], cast: { maya: at(300, 880, 0.9, { char: "maya", pose: "wave", mood: "smile" }) } },
        say: [["maya", "Welcome to Speaking Club.", "smile", "wave"], ["maya", "I'm Maya.", "grin", "wave"]] },
      { id: "o-box", t: "The memory box", sec: 5, auto: true, phase: "Listen",
        scene: { fx: "box-open", cam: [960, 700, 1.25], cast: { maya: at(300, 880, 0.9, { pose: "present", mood: "curious" }) } },
        say: [["maya", "Let's open the memory box.", "curious", "present"]] },
      { id: "o-drawing", t: "Object: a drawing", sec: 8, auto: true, phase: "Listen",
        scene: { fx: "obj-drawing", flash: "drawing", cam: [960, 700, 1.25], cast: { maya: at(300, 880, 0.9, { pose: "hold", mood: "warm" }) } },
        say: [["maya", "A drawing. Maybe a rainy afternoon and a box of crayons.", "warm", "hold"]] },
      { id: "o-ball", t: "Object: a ball", sec: 8, auto: true, phase: "Listen",
        scene: { fx: "obj-ball", flash: "ball", cast: { maya: at(300, 880, 0.9, { pose: "lift", mood: "grin" }) } },
        say: [["maya", "A ball. Perhaps a quick game of tag at recess.", "grin", "lift"]] },
      { id: "o-note", t: "Object: a note", sec: 8, auto: true, phase: "Listen",
        scene: { fx: "obj-note", flash: "note", cast: { theo: at(1600, 880, 0.9, { char: "theo", pose: "hold", mood: "curious" }), maya: at(300, 880, 0.9, { pose: "rest", mood: "smile" }) } },
        say: [["theo", "A note. “Meet me at the park after school.”", "curious", "hold"]] },
      { id: "o-toy", t: "Object: a small toy", sec: 8, auto: true, phase: "Listen",
        scene: { fx: "obj-toy", flash: "toy", cast: { theo: at(1600, 880, 0.9, { pose: "present", mood: "grin" }), maya: at(300, 880, 0.9, { pose: "rest", mood: "laugh" }) } },
        say: [["maya", "A small toy. Maybe it had adventures across the rug.", "laugh", "rest"]] },
      { id: "o-comfort", t: "You choose what to share", sec: 9, auto: true, phase: "Listen",
        scene: { fx: "box-calm", flash: null, cam: [960, 600, 1.08], cast: { theo: at(1600, 880, 0.9, { pose: "open", mood: "warm" }), maya: at(300, 880, 0.9, { pose: "open", mood: "warm" }) } },
        say: [["theo", "Not every memory feels warm, and that's okay.", "warm", "open"],
              ["maya", "Today, you choose what to share. You can always pass.", "smile", "open"]] },
      { id: "o-question", t: "The big question", sec: 8, auto: true, phase: "Listen", silent: true,
        scene: { fx: "question", cam: [960, 540, 1.0], cast: { theo: at(1680, 880, 0.9, { pose: "think", mood: "curious" }), maya: at(240, 880, 0.9, { pose: "think", mood: "curious" }) } },
        say: [["maya", "So, what can an ordinary object remind us of?", "curious", "think"]] },
    ],
  });

  /* ================= 2. WARM-UP (240 s) ================= */
  var CYCLE = ["Think", "Answer", "Reason", "Listen", "Ask"];
  var WARM_PANEL = function (key, q, fic) {
    return { pos: "R", key: key, blocks: [
      { k: "tag", t: "Warm-up question" },
      { k: "q", t: q },
      { k: "cycle", items: CYCLE },
      { k: "follow", rv: 1, single: true, items: ["Who did you usually do that with?", "How often?", "What happened next?", "What made it memorable?"], label: "Follow-up question" },
    ] };
  };
  var WARM_START = ["I used to… with…", "One thing I remember is…", "I liked it because…", "These days, I…"];
  var WARM = [
    { q: "What games or activities did you enjoy when you were younger?", who: "maya",
      fic: "I used to play hide-and-seek on my street. We played until the streetlights came on.",
      ask: [["theo", "Who did you usually play with?"], ["maya", "Mostly the kids next door. Sometimes my cousin joined us."]] },
    { q: "What did you use to do after school or during your free time?", who: "theo",
      fic: "I used to ride my bike to the library. I loved the quiet and the comic books.",
      ask: [["maya", "How often did you go?"], ["theo", "Almost every Friday. It was my weekly adventure."]] },
    { q: "What is something you liked as a child but feel differently about now?", who: "maya",
      fic: "I loved spinning in circles on the playground. Now it makes me dizzy!",
      ask: [["theo", "What made it so much fun?"], ["maya", "The feeling of flying. I'd laugh until I fell over."]] },
    { q: "What do you think has changed most about childhood?", who: "theo",
      fic: "Many children have more screens now, but they still invent games. Some things stay the same.",
      ask: [["maya", "What do you mean by 'invent games'?"], ["theo", "Like rules for a game with just a ball and a wall."]] },
  ];

  var ch2 = { n: 2, id: "warmup", title: "Warm-up", min: 4, mode: "talk",
    goal: "Everyone speaks early: answer, add a reason, listen, ask one follow-up question.",
    steps: [
      { id: "w-intro", t: "The speaking cycle", sec: 24, phase: "Listen", wait: true,
        scene: { bg: "living", tod: "golden", memory: false, fx: null, cam: [1060, 540, 1.0], cast: { maya: at(300, 930, 0.95, { pose: "present", mood: "smile" }), theo: at(640, 930, 0.95, { pose: "rest", mood: "warm" }) } },
        say: [["theo", "Let's warm up with four questions.", "smile", "present"],
              ["maya", "Use the cycle: think, answer, give a reason, listen, and ask.", "warm", "present"],
              ["theo", "A fictional answer or a pass is always fine.", "grin", "rest"]],
        panel: { pos: "R", key: "w-intro", blocks: [
          { k: "h", t: "The speaking cycle" },
          { k: "cycle", items: CYCLE, all: true },
          { k: "p", t: "Pass is always okay. You can answer as a fictional character." , rv: 1 },
          { k: "p", t: "Corrections come after your turn, not during it.", rv: 2 },
        ] },
        starters: ["I used to… with…", "One thing I remember is…", "I liked it because…"] },
    ] };

  WARM.forEach(function (w, i) {
    var n = i + 1, key = "w-q" + n;
    var cast = function (extra) { return { maya: extra && extra.maya || {}, theo: extra && extra.theo || {} }; };
    ch2.steps.push({
      id: key + "-think", t: "Question " + n + ": think", sec: 15, timer: 10, phase: "Think",
      scene: { cast: { maya: { pose: "rest", mood: "curious" }, theo: { pose: "think", mood: "curious" } } },
      say: [[w.who === "maya" ? "maya" : "theo", w.q, "curious", "present"]],
      panel: WARM_PANEL(key, w.q, w.fic), starters: WARM_START, example: [w.who, w.fic, "Fictional answer"],
    });
    ch2.steps.push({
      id: key + "-answer", t: "Question " + n + ": answer", sec: 22, timer: 22, speak: true, phase: "Answer",
      scene: { cast: { maya: { pose: "rest", mood: "smile" }, theo: { pose: "rest", mood: "smile" } } },
      sample: [[w.who, w.fic]], starters: WARM_START, example: [w.who, w.fic, "Fictional answer"],
    });
    ch2.steps.push({
      id: key + "-ask", t: "Question " + n + ": follow-up", sec: 17, timer: 17, speak: true, phase: "Ask",
      scene: { cast: { maya: { pose: "open", mood: "curious" }, theo: { pose: "open", mood: "warm" } } },
      sample: w.ask, starters: ["Who did you usually do that with?", "How often?", "What happened next?", "What made it memorable?"],
    });
  });
  L.chapters.push(ch2);

  /* ================= 3. USEFUL VOCABULARY (420 s) ================= */
  var VOC = [
    { w: "childhood", ipaNote: "", def: "the period of someone's life when they are a child",
      ex: "Their *childhood* was very different from ours.", vig: "childhood",
      chk: { q: "Which sentence is about childhood?", a: "When I was seven, I learned to ride a bike.", b: "Last year, I started a new job.", ans: "a" },
      sp: "What is one thing people often connect with childhood?", starter: ["Many people think of…", "One thing could be…"] },
    { w: "imagination", def: "the ability to form ideas or pictures in your mind",
      ex: "We used our *imagination* to turn the yard into a spaceship.", vig: "imagination",
      chk: { q: "Who is using imagination?", a: "A child turns a cardboard box into a castle.", b: "A child copies a sentence from the board.", ans: "a" },
      sp: "When do you use your imagination now?", starter: ["I use my imagination when…", "Last week, I imagined…"] },
    { w: "independent", def: "able to do things or make some decisions without help",
      ex: "I became more *independent* when I learned to prepare a simple snack.", vig: "independent",
      chk: { q: "Which person is acting independently?", a: "Sam makes a sandwich without help.", b: "Sam waits for someone to make it.", ans: "a" },
      sp: "What can you do independently now that was difficult before?", starter: ["Now I can… by myself.", "I became independent when…"] },
    { w: "grow up", def: "develop from being a child into being an adult",
      ex: "She *grew up* in a small town.", vig: "growup",
      chk: { q: "Which question is natural?", a: "Where did you grow up?", b: "Where did you grew up?", ans: "a" },
      sp: "Where did you grow up? Or describe where a fictional character grew up.", starter: ["I grew up in…", "My character grew up near…"] },
    { w: "look back on", def: "think about something from the past",
      ex: "When he *looks back on* school, he remembers his art teacher.", vig: "lookback",
      chk: { q: "“She looks back on her school days.” Is she thinking about the past or the future?", a: "The past", b: "The future", ans: "a" },
      sp: "What do you look back on with a smile, or with interest?", starter: ["I look back on… with…", "When I look back on…, I remember…"] },
  ];
  var VOICE = { childhood: "theo", imagination: "maya", independent: "theo", "grow up": "maya", "look back on": "theo" };
  var EXPR_POSE = ["present", "hold", "present", "open", "think"];

  var ch3 = { n: 3, id: "vocab", title: "Useful vocabulary", min: 7, mode: "vocab",
    goal: "Five core words in short scenes, a toolbox for talking about the past, and optional word banks.",
    steps: [
      { id: "v-intro", t: "Five useful words", sec: 14, phase: "Listen", wait: true,
        scene: { bg: "journal", cam: [960, 540, 1.0], fx: null, vig: null, props: [], cast: NOCAST },
        say: [["theo", "Five useful words. Watch a short scene, then use each one.", "smile", "present"],
              ["maya", "Word banks are always one click away.", "warm", "present"]],
        panel: { pos: "C", key: "v-intro", blocks: [
          { k: "h", t: "Five core words" },
          { k: "chips", items: ["childhood", "imagination", "independent", "grow up", "look back on"], big: true },
          { k: "p", t: "Watch. Check. Speak.", rv: 1 },
        ] } },
    ] };

  VOC.forEach(function (v, i) {
    var n = i + 1, key = "v" + n, who = VOICE[v.w], other = who === "maya" ? "theo" : "maya";
    ch3.steps.push({
      id: key + "-meaning", t: "Word " + n + ": " + v.w, sec: 20, phase: "Listen", wait: true,
      scene: { bg: "journal", cast: NOCAST, vig: v.vig },
      say: [[other, v.w + ". It means: " + v.def + ".", "smile", "present"], [who, "For example: “" + v.ex.replace(/\*/g, "") + "”", "warm", EXPR_POSE[i]]],
      panel: { pos: "R", key: key, blocks: [
        { k: "word", t: v.w },
        { k: "p", t: "Meaning: " + v.def + ".", cls: "meaning", rvx: 1 },
        { k: "quote", t: "“" + v.ex + "”", listen: true, rvx: 1 },
        { k: "check", q: v.chk.q, a: v.chk.a, b: v.chk.b, ans: v.chk.ans, rv: 1, rvx: 3 },
        { k: "speakq", t: v.sp, rv: 3 },
      ] },
      starters: v.starter,
    });
    ch3.steps.push({
      id: key + "-check", t: "Word " + n + ": check", sec: 10, timer: 10, speak: true, phase: "Check",
      sample: [[who, v.chk.ans === "a" ? "I think the first one. " + v.chk.a : "I think the second one."]],
      reveal: 1, revealTo: 2,
    });
    ch3.steps.push({
      id: key + "-speak", t: "Word " + n + ": speak", sec: 30, timer: 30, speak: true, phase: "Speak",
      sample: [[VOICE[v.w], [
        "Many people think of games, school, and growing up.",
        "I use it when I plan a surprise or imagine a new route home.",
        "Now I can cook dinner by myself without a recipe.",
        "I grew up in a small town near a river.",
        "I look back on my first art class with a smile."][i]]],
      starters: v.starter, reveal: 3,
    });
  });

  ch3.steps.push(
    { id: "v-tool1", t: "Toolbox: past simple and used to", sec: 30, phase: "Listen", wait: true,
      scene: { bg: "journal", vig: null, cast: NOCAST },
      say: [["theo", "Use the past simple for one event.", "smile", "present"], ["maya", "Use used to for old routines and states.", "warm", "present"]],
      panel: { pos: "C", key: "v-tool", blocks: [
        { k: "h", t: "Talking about the past" },
        { k: "tool", rv: 1, rvx: 2, title: "Past simple: one event", ex: ["“One afternoon, we built a kite.”"] },
        { k: "tool", rv: 2, rvx: 3, title: "Used to + base verb: routines and states", ex: ["“I used to play outside.”", "“I used to be shy.”"] },
        { k: "tool", rv: 3, title: "Questions and negatives", ex: ["“Did you use to…?”", "“I didn't use to…”"] },
      ] },
      starters: ["One afternoon, we…", "I used to…", "I didn't use to…"] },
    { id: "v-tool2", t: "Toolbox: not the same", sec: 16, phase: "Listen", wait: true,
      say: [["maya", "Careful: used to, be used to, and get used to have different meanings.", "curious", "think"]],
      panel: { pos: "C", key: "v-tool2", blocks: [
        { k: "h", t: "Three different meanings", rvx: 4 },
        { k: "tool", rv: 1, rvx: 4, title: "Used to + base verb: a past routine or state", ex: ["“We used to walk to school.”"] },
        { k: "tool", rv: 2, rvx: 4, title: "Be used to + noun or -ing: familiar now", ex: ["“I'm used to waking up early.”"] },
        { k: "tool", rv: 3, rvx: 4, title: "Get used to: becoming familiar", ex: ["“I got used to the new school.”"] },
        { k: "h", t: "Extension: would", rv: 4 },
        { k: "tool", rv: 4, title: "Would: repeated past actions, once the past time is clear", ex: ["“During summer vacations, we would play cards after lunch.”"], note: "Not for states. Use “I used to be shy,” not “I would be shy.”" },
      ] } },
    { id: "v-tool3", t: "Toolbox: sequencing", sec: 10, phase: "Listen", wait: true,
      say: [["theo", "To tell a story: at first, then, after that, in the end.", "grin", "present"]],
      panel: { pos: "C", key: "v-tool3", blocks: [
        { k: "h", t: "Tell it in order" },
        { k: "seq", items: ["At first…", "Then…", "After that…", "In the end…"] },
      ] } },
    { id: "v-toolspeak", t: "Toolbox: say one sentence", sec: 30, timer: 30, speak: true, phase: "Speak",
      panel: { pos: "C", key: "v-toolspeak", blocks: [
        { k: "q", t: "Your turn: say one sentence with “used to,” or tell a tiny story in order." },
        { k: "seq", items: ["At first…", "Then…", "After that…", "In the end…"], small: true },
        { k: "note", t: "A fictional character is fine. Pass is fine." },
      ] },
      sample: [["maya", "At first, I used to be nervous on stage. Then I joined a drama club. In the end, I loved it."]],
      starters: ["I used to…, but now…", "At first, …", "In the end, …"] },
    { id: "v-bank", t: "Word banks: choose two", sec: 20, timer: 20, speak: true, phase: "Speak",
      panel: { pos: "C", key: "v-bank", blocks: [
        { k: "h", t: "Word banks" },
        { k: "bank" },
        { k: "note", t: "Choose two words you might use later. Say them in a sentence." },
      ] },
      say: [],
      sample: [["theo", "I might use playground and take turns. We took turns on the playground swings."]] }
  );
  L.chapters.push(ch3);
})(typeof window !== "undefined" ? window : globalThis);
