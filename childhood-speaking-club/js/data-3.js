/* Lesson data, part 3: chapters 7-10. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var L = (FE.LESSON = FE.LESSON || { chapters: [] });
  var at = function (x, y, s, o) { var r = { x: x, y: y == null ? 930 : y, s: s == null ? 0.95 : s }; for (var k in (o || {})) r[k] = o[k]; return r; };
  var NOKIDS = { k1: null, k2: null, k3: null, k4: null, newcomer: null, quiet: null, owner: null };
  function cast(o) { var r = {}; for (var k in NOKIDS) r[k] = null; for (var j in o) r[j] = o[j]; return r; }

  /* ================= 7. GAME: MYSTERY OBJECT (420 s) ================= */
  var MQ = ["Was it…?", "Did you use to…?", "Could you…?", "Where did you keep it?", "What was it made of?"];
  var MCAM = [1300, 580, 1.0];
  var mCast = function (mm, tm, mp, tp) { return cast({ maya: at(560, 950, 0.84, { char: "maya", pose: mp || "rest", mood: mm || "smile" }), theo: at(1190, 950, 0.84, { char: "theo", pose: tp || "rest", mood: tm || "grin" }), alex: null, jordan: null }); };
  var MYSTERY_CLUES = ["It was small and made of metal.", "I used to ring it every day on my way to school.", "It made a bright sound.", "One day, it fell off, and I looked for it for an hour."];
  L.chapters.push({ n: 7, id: "mystery", title: "Game: mystery object", min: 7, mode: "game",
    goal: "Guess a hidden object from clues by asking questions, then hide your own object and let the group find it.",
    steps: [
      { id: "m-intro", t: "How the game works", sec: 20, phase: "Listen", wait: true,
        scene: { bg: "living", tod: "dusk", memory: true, fx: "mystery", vig: null, props: [], cam: MCAM, cast: mCast("grin", "curious", "present", "rest") },
        say: [["maya", "Time for a guessing game!", "grin", "present"], ["theo", "I hid one object in the memory box. Ask questions to find it.", "curious", "present"]],
        panel: { pos: "R", key: "m-play", blocks: [
          { k: "h", t: "Mystery object" },
          { k: "list", items: ["Listen to the clues.", "Ask questions. Yes or no.", "Guess the object!"], num: true, each: true, rv: 0 },
          { k: "chips", items: MQ, label: "Good questions", rv: 3, small: true },
        ] }, starters: MQ },
      { id: "m-clues", t: "Clues from the box", sec: 30, phase: "Listen", wait: true,
        scene: { fx: "mystery", cast: mCast("curious", "grin", "think", "present") },
        say: [["theo", "Clue one: it was small and made of metal.", "grin", "present"], ["maya", "Clue two: I used to ring it every day on my way to school.", "smile", "present"]],
        panel: { pos: "R", key: "m-clues", blocks: [
          { k: "tag", t: "Mystery object" },
          { k: "clues", items: MYSTERY_CLUES, answer: "a bicycle bell" },
        ] }, reveal: 2, starters: MQ },
      { id: "m-guess", t: "Ask questions and guess", sec: 25, timer: 25, speak: true, phase: "Ask", reveal: 4,
        scene: { cast: mCast("curious", "curious", "think", "think") },
        sample: [["maya", "Was it a toy?"], ["theo", "No, it wasn't. But it made a sound."], ["maya", "Was it a bicycle bell?"], ["theo", "Yes! Well done!"]],
        starters: MQ },
      { id: "m-reveal", t: "The reveal", sec: 10, phase: "Listen", wait: true,
        scene: { fx: "mystery-reveal", cast: mCast("laugh", "laugh", "cheer", "cheer") },
        say: [["maya", "It was a bicycle bell! Did you guess?", "laugh", "cheer"]], reveal: 5 },
      { id: "m-prep", t: "Choose your mystery object", sec: 30, timer: 30, phase: "Think",
        scene: { fx: "mystery", cast: mCast("thinking", "thinking", "think", "think") },
        panel: { pos: "R", key: "m-prep", blocks: [
          { k: "tag", t: "Your turn" },
          { k: "q", t: "Choose an ordinary object. Real or fictional. Think of three clues." },
          { k: "chips", items: ["It used to…", "I used it to…", "It was made of…", "One day, …"], label: "Clue starters", rv: 1, each: true },
          { k: "note", t: "Pass is fine. A fictional object is fine.", rv: 5 },
        ] }, reveal: 1, starters: ["It used to…", "I used it to…", "It was made of…", "One day, …"] },
      { id: "m-r1", t: "Round one: your clues", sec: 130, timer: 130, speak: true, phase: "Speak", reveal: 4,
        scene: { fx: "mystery", cast: mCast("smile", "curious", "open", "think") },
        sample: [["maya", "My mystery object used to be on my desk. It was long and yellow."], ["theo", "Was it a pencil?"], ["maya", "Yes! One day, I lost it for a week. Did you use to lose pencils?"], ["theo", "All the time!"]],
        starters: MQ },
      { id: "m-twist", t: "Bonus challenge", sec: 15, phase: "Twist", wait: true,
        scene: { fx: "mystery", cast: mCast("surprised", "surprised", "present", "presentL") },
        say: [["theo", "Bonus challenge!", "surprised", "presentL"], ["maya", "Use used to once, and add the words: one day.", "grin", "present"]],
        panel: { pos: "R", key: "m-r2", blocks: [
          { k: "tag", t: "Bonus challenge" },
          { k: "twistbig", t: "Use “used to” once. Add the words “one day.”" },
          { k: "chips", items: MQ, label: "Good questions", small: true },
        ] }, starters: MQ },
      { id: "m-r2", t: "Round two: new object, new speaker", sec: 130, timer: 130, speak: true, phase: "Speak",
        scene: { fx: "mystery", cast: mCast("smile", "grin", "open", "open") },
        sample: [["theo", "My object used to hang by my bed. It was blue. One day, it stopped working."], ["maya", "Could you read with it?"], ["theo", "Yes, I could. I used to read under the blanket."], ["maya", "Was it a flashlight?"], ["theo", "Right! You're good at this."]],
        starters: MQ },
      { id: "m-wrap", t: "Which question helped most?", sec: 30, timer: 30, speak: true, phase: "Share",
        scene: { fx: "mystery", cast: mCast("warm", "warm", "open", "open") },
        panel: { pos: "R", key: "m-wrap", blocks: [
          { k: "tag", t: "Wrap-up" },
          { k: "q", t: "Which clue or question helped most? Why?" },
          { k: "note", t: "Give a reason or an example." },
        ] },
        sample: [["maya", "The question about where I kept it helped most. It gave a picture in my mind."]],
        starters: ["The best question was…", "It helped because…", "One example would be…"] },
    ] });

  /* ================= 8. GAME: THE STORY SPINNER (420 s) ================= */
  L.storyDeck = {
    who: ["a curious neighbor", "a clever best friend", "a brave kid with a flashlight", "a talking toy robot", "a quiet kid with a big imagination", "a sleepy babysitter"],
    where: ["an old playground", "a rainy bus stop", "a tiny library", "a crowded school hallway", "a secret garden", "a summer campsite"],
    problem: ["the lights suddenly go out", "a mysterious note appears", "someone loses something important", "it starts to snow in the middle of summer", "a game has no rules", "a surprise visitor arrives"],
    ending: ["everyone learns something new", "a surprising friendship begins", "the problem becomes a funny memory", "a secret is shared", "someone makes a brave promise", "the whole group celebrates"],
  };
  L.storyLabels = ["Who", "Where", "Problem", "Ending"];
  var SEQ = ["At first…", "Then…", "After that…", "In the end…"];
  var sCast = function (am, bm, ap, bp) { return cast({ maya: at(300, 960, 0.86, { char: "maya", pose: ap || "rest", mood: am || "smile" }), theo: at(640, 960, 0.86, { char: "theo", pose: bp || "rest", mood: bm || "grin" }), alex: null, jordan: null }); };
  var SPANEL = { pos: "R", key: "story", blocks: [
    { k: "tag", t: "Our story" },
    { k: "story" },
    { k: "chips", items: SEQ, small: true },
  ] };
  L.chapters.push({ n: 8, id: "story", title: "Game: the story spinner", min: 7, mode: "game",
    goal: "Draw story cards and build one fictional story together, one sentence at a time, then retell it.",
    steps: [
      { id: "s-intro", t: "How the game works", sec: 30, phase: "Listen", wait: true,
        scene: { bg: "art", tod: "day", memory: false, fx: null, vig: null, props: [], cam: [1060, 540, 1.0], cast: sCast("grin", "curious", "present", "rest") },
        say: [["maya", "Let's invent one story together.", "grin", "present"], ["theo", "Draw cards: a hero, a place, a problem, and an ending.", "curious", "presentL"], ["maya", "Take turns. Add one sentence each.", "smile", "present"]],
        panel: { pos: "R", key: "s-how", blocks: [
          { k: "h", t: "The story spinner" },
          { k: "list", items: ["Draw a card.", "Add one sentence. Take turns.", "Retell the whole story."], num: true, each: true, rv: 0 },
          { k: "chips", items: SEQ, label: "Use these to tell it in order", rv: 3 },
        ] }, starters: SEQ },
      { id: "s-draw1", t: "Draw: hero and place", sec: 20, phase: "Listen", wait: true,
        scene: { cast: sCast("curious", "grin", "think", "present") },
        say: [["theo", "First, draw the hero and the place.", "grin", "present"]],
        panel: SPANEL, reveal: 0 },
      { id: "s-chain1", t: "Build the beginning", sec: 100, timer: 100, speak: true, phase: "Speak", reveal: 2,
        scene: { cast: sCast("smile", "smile", "open", "open") },
        sample: [["maya", "At first, a clever best friend sat alone at an old playground."], ["theo", "Then she noticed a small door under the slide."], ["maya", "After that, she called her friends to look."]],
        starters: SEQ },
      { id: "s-draw2", t: "Draw: the problem", sec: 20, phase: "Twist", wait: true,
        scene: { cast: sCast("surprised", "surprised", "present", "presentL") },
        say: [["maya", "Now, draw the problem!", "surprised", "present"]],
        reveal: 2 },
      { id: "s-chain2", t: "Add the problem", sec: 100, timer: 100, speak: true, phase: "Speak", reveal: 3,
        scene: { cast: sCast("curious", "curious", "think", "think") },
        sample: [["theo", "Suddenly, the lights went out."], ["maya", "Then everyone held hands and moved slowly."], ["theo", "After that, they heard a quiet knock behind the door."]],
        starters: SEQ },
      { id: "s-draw3", t: "Draw: the ending", sec: 20, phase: "Listen", wait: true,
        scene: { cast: sCast("grin", "grin", "present", "presentL") },
        say: [["theo", "Last card: how does it end?", "grin", "presentL"]],
        reveal: 3 },
      { id: "s-chain3", t: "Finish the story", sec: 80, timer: 80, speak: true, phase: "Speak", reveal: 4,
        scene: { cast: sCast("warm", "warm", "open", "open") },
        sample: [["maya", "At last, a tiny robot opened the door from the other side."], ["theo", "In the end, a surprising friendship began."]],
        starters: SEQ },
      { id: "s-retell", t: "Retell the whole story", sec: 50, timer: 50, speak: true, phase: "Share", reveal: 4,
        scene: { cast: sCast("laugh", "laugh", "open", "cheer") },
        sample: [["maya", "At first, a clever best friend sat alone at an old playground. Then she found a small door under the slide."], ["theo", "After that, the lights went out, but a tiny robot opened the door. In the end, a surprising friendship began."]],
        starters: SEQ },
    ] });

  /* ================= 9. GAME: WOULD YOU RATHER? (480 s) ================= */
  var WYR = [
    { a: "play your favorite childhood game again", b: "watch your favorite childhood show again", ia: "ball", ib: "tv",
      twist: "You can only enjoy it for one hour.", sampleC: ["maya", "I'd rather play the game again. I'd love to move and laugh with other people."], sampleA: [["theo", "What game would you play?"], ["maya", "Hide-and-seek. It's simple and exciting."]], sampleR: ["theo", "With one hour, I'd still pick the game, but I'd choose a shorter one."] },
    { a: "invent a new playground game", b: "design a new board game", ia: "slide", ib: "board",
      twist: "Children in another country will play it, and you can't use spoken instructions.", sampleC: ["theo", "I'd rather invent a playground game. Movement and a few simple rules."], sampleA: [["maya", "How would you explain it?"], ["theo", "By showing it once. Pictures help, too."]], sampleR: ["maya", "With no spoken instructions, I'd pick the board game. Pictures on the cards would explain it."] },
    { a: "revisit a childhood place as it was then", b: "see how it has changed today", ia: "house", ib: "city",
      twist: "You can look, but you can't touch or change anything.", sampleC: ["maya", "I'd rather see it as it was then. I'd like to remember the details."], sampleA: [["theo", "What would you look for first?"], ["maya", "The colors. I'd compare them with my memory."]], sampleR: ["theo", "If I can only look, I'd still choose the old place. Looking is enough."] },
    { a: "keep one meaningful childhood object", b: "preserve one childhood story in a book", ia: "box", ib: "book",
      twist: "Someone you've never met will find it.", sampleC: ["theo", "I'd rather preserve a story. A story can be shared more easily."], sampleA: [["maya", "Which story would you choose?"], ["theo", "A story about a long walk home."]], sampleR: ["maya", "If a stranger finds it, I'd choose the story. It speaks for itself."] },
  ];
  var ch9 = { n: 9, id: "wyr", title: "Game: would you rather?", min: 8, mode: "game",
    goal: "Four imaginative choices: choose, give a reason, hear a follow-up question, answer it, and reconsider after a twist.",
    steps: [
      { id: "y-intro", t: "How the game works", sec: 20, phase: "Listen", wait: true,
        scene: { bg: "art", tod: "day", fx: null, vig: null, memory: false, props: [], cam: [1060, 540, 1.0],
          cast: cast({ maya: at(300, 930, 0.95, { char: "maya", pose: "present", mood: "curious" }), theo: at(640, 930, 0.95, { char: "theo", pose: "rest", mood: "grin" }) }) },
        say: [["maya", "Would you rather read a book or watch a movie?", "curious", "present"], ["theo", "I'd rather watch a movie. There is no wrong answer.", "grin", "open"], ["maya", "Pass is always fine. A fictional choice is fine, too.", "warm", "open"]],
        panel: { pos: "R", key: "y-intro", blocks: [
          { k: "h", t: "Would you rather…?" },
          { k: "model", items: ["I'd rather + base verb", "I'd rather watch a movie."], rv: 1 },
          { k: "list", items: ["Choose", "Give a reason", "Listen to a question", "Answer it"], each: true, rv: 2, num: true },
          { k: "note", t: "Choices are preferences. They are not correct or incorrect." , rv: 6 },
        ] } },
      { id: "y-intro-speak", t: "Quick try", sec: 10, timer: 10, speak: true, phase: "Speak",
        panel: { pos: "R", key: "y-quick", blocks: [
          { k: "tag", t: "Quick try" },
          { k: "q", t: "Would you rather sing or draw?" },
        ] },
        sample: [["theo", "I'd rather draw. It feels quiet and calm."]], starters: ["I'd rather…", "I'd rather…, because…"] },
    ] };
  WYR.forEach(function (w, i) {
    var n = i + 1, key = "y" + n;
    var panel = { pos: "R", key: key, blocks: [
      { k: "tag", t: "Round " + ["one", "two", "three", "four"][i] + " of four" },
      { k: "wyr", a: w.a, b: w.b, ia: w.ia, ib: w.ib, id: key },
      { k: "twist", t: w.twist, rv: 1 },
      { k: "note", t: "Choose, give a reason, ask a follow-up question, then answer it.", rvx: 1 },
    ] };
    ch9.steps.push({ id: key + "-show", t: "Round " + n + ": the choice", sec: 8, phase: "Listen", wait: true,
      scene: { cast: { maya: { pose: "present", mood: "curious" }, theo: { pose: "presentL", mood: "curious" } } },
      say: [[i % 2 ? "theo" : "maya", "Would you rather " + w.a + " or " + w.b + "?", "curious", "present"]], panel: panel });
    ch9.steps.push({ id: key + "-think", t: "Round " + n + ": think", sec: 10, timer: 10, phase: "Think",
      scene: { cast: { maya: { pose: "think", mood: "thinking" }, theo: { pose: "think", mood: "thinking" } } },
      starters: ["I'd rather…", "I'd rather…, because…"] });
    ch9.steps.push({ id: key + "-choose", t: "Round " + n + ": choose and explain", sec: 30, timer: 30, speak: true, phase: "Choose",
      scene: { cast: { maya: { pose: "rest", mood: "smile" }, theo: { pose: "rest", mood: "smile" } } },
      sample: [w.sampleC], example: [w.sampleC[0], w.sampleC[1], "Fictional example"],
      starters: ["I'd rather…", "I'd rather…, because…", "For me, … feels more…"] });
    ch9.steps.push({ id: key + "-ask", t: "Round " + n + ": follow-up question", sec: 30, timer: 30, speak: true, phase: "Ask",
      scene: { cast: { maya: { pose: "open", mood: "curious" }, theo: { pose: "open", mood: "warm" } } },
      sample: w.sampleA, starters: ["Why did you choose…?", "What would you…?", "How would you…?"] });
    ch9.steps.push({ id: key + "-twist", t: "Round " + n + ": twist", sec: 12, phase: "Twist", wait: true, reveal: 1,
      scene: { cast: { maya: { pose: "present", mood: "surprised" }, theo: { pose: "presentL", mood: "surprised" } } },
      say: [["theo", "Twist: " + w.twist, "surprised", "presentL"]] });
    ch9.steps.push({ id: key + "-reconsider", t: "Round " + n + ": reconsider", sec: 10, timer: 10, speak: true, phase: "Reconsider",
      scene: { cast: { maya: { pose: "think", mood: "curious" }, theo: { pose: "rest", mood: "warm" } } },
      sample: [w.sampleR], starters: ["Now I'd rather…", "I'd still…, because…"] });
  });
  ch9.steps.push({ id: "y-wrap", t: "Make your own", sec: 50, timer: 50, speak: true, phase: "Speak",
    scene: { cast: { maya: { pose: "open", mood: "grin" }, theo: { pose: "open", mood: "laugh" } } },
    panel: { pos: "R", key: "y-wrap", blocks: [
      { k: "tag", t: "Your turn" },
      { k: "q", t: "Invent your own “Would you rather” about childhood. Ask the group." },
      { k: "note", t: "Everyone can answer: choice, reason, follow-up question." },
    ] },
    sample: [["maya", "Would you rather have a treehouse or a secret clubhouse?"], ["theo", "I'd rather have a treehouse, because I'd see the whole neighborhood."]],
    starters: ["Would you rather… or…?", "I'd rather…, because…"] });
  L.chapters.push(ch9);

  /* ================= 10. REFLECTION AND EXIT CHALLENGE (180 s) ================= */
  var EXPR = ["used to", "grow up", "look back on", "take turns", "get along", "join in", "make up a game", "keep in touch", "I see your point", "in the end"];
  L.EXPRESSIONS = EXPR;
  L.bank = [
    { n: "Memories and routines", w: ["childhood friend", "neighborhood", "playground", "recess", "school project", "chores", "bedtime"] },
    { n: "Games and activities", w: ["hide-and-seek", "tag", "board game", "puzzle", "drawing", "building blocks", "make-believe"] },
    { n: "Descriptions", w: ["curious", "shy", "outgoing", "playful", "adventurous", "strict", "fair", "patient"] },
    { n: "Useful expressions", w: ["get along", "take turns", "make up a game", "join in", "keep in touch"] },
  ];
  L.activities = ["tag", "hide-and-seek", "relay race", "board game", "puzzle", "drawing", "building blocks", "make-believe", "treasure hunt", "story circle"];
  var EXIT_PANEL = function (key) {
    return { pos: "C", key: key, blocks: [
      { k: "tag", t: "Exit challenge" },
      { k: "q", t: "Tell a thirty-second childhood story. Real or fictional." },
      { k: "checklist", items: ["One past routine or event", "Two useful expressions", "A clear ending", "Then ask a follow-up question"], rvx: 1 },
      { k: "versions", rv: 1 },
    ] };
  };
  L.chapters.push({ n: 10, id: "exit", title: "Reflection and exit challenge", min: 3, mode: "exit",
    goal: "A short spoken story with a follow-up question, a teacher-operated rubric, and a final reflection.",
    steps: [
      { id: "e-intro", t: "The exit challenge", sec: 20, phase: "Listen", wait: true,
        scene: { bg: "living", tod: "dusk", memory: true, fx: "box-calm", vig: null, props: [], cam: [960, 560, 1.0],
          cast: cast({ maya: at(190, 940, 0.74, { char: "maya", pose: "present", mood: "smile" }), theo: at(1730, 940, 0.74, { char: "theo", pose: "rest", mood: "warm" }) }) },
        say: [["maya", "Last task: a thirty-second story, real or fictional.", "smile", "present"], ["theo", "Use a routine or event, two expressions, and a clear ending. Then ask a question.", "grin", "present"]],
        panel: EXIT_PANEL("exit") , starters: ["At first…", "Then…", "In the end…", "Did you use to…?"] },
      { id: "e-prep", t: "Prepare", sec: 30, timer: 30, phase: "Think",
        scene: { cast: { maya: { pose: "think", mood: "thinking" }, theo: { pose: "think", mood: "thinking" } } }, reveal: 1,
        starters: ["At first…", "Then…", "After that…", "In the end…"] },
      { id: "e-turnA", t: "Speaker A: story and question", sec: 45, timer: 45, speak: true, phase: "Speak",
        scene: { cast: { maya: { pose: "rest", mood: "smile" }, theo: { pose: "rest", mood: "smile" } } },
        sample: [["maya", "When I look back on my summers, I remember the lake. At first, I used to be afraid to swim."], ["maya", "Then a neighbor taught me to float. In the end, I swam across the lake!"], ["theo", "How old were you when you swam across?"]],
        starters: ["When I look back on…, I remember…", "At first, I used to…", "In the end, …"] },
      { id: "e-turnB", t: "Speaker B: story and question", sec: 45, timer: 45, speak: true, phase: "Speak",
        scene: { cast: { maya: { pose: "rest", mood: "warm" }, theo: { pose: "open", mood: "grin" } } },
        sample: [["theo", "After school, I used to get along with the kids next door. We made up a game with a rope."], ["theo", "In the end, we took turns being the judge."], ["maya", "What were the rules?"]],
        starters: ["I used to…", "We took turns…", "In the end, …"] },
      { id: "e-rubric", t: "Teacher rubric (optional)", sec: 15, phase: "Feedback", wait: true,
        panel: { pos: "C", key: "e-rubric", blocks: [
          { k: "tag", t: "Teacher-operated rubric" },
          { k: "rubric" },
        ] } },
      { id: "e-reflect", t: "Reflect: one expression to reuse", sec: 20, timer: 20, speak: true, phase: "Reflect",
        panel: { pos: "C", key: "e-reflect", blocks: [
          { k: "tag", t: "Quick reflection" },
          { k: "q", t: "Which expression do you want to reuse?" },
          { k: "reflect", items: EXPR },
        ] },
        sample: [["theo", "I want to reuse “look back on.” It sounds natural when I talk about my past."]],
        starters: ["I want to reuse…", "I like it because…"] },
      { id: "e-close", t: "Keep speaking", sec: 5, auto: true, phase: "Listen", silent: true,
        scene: { fx: "closing", cast: { maya: { pose: "wave", mood: "laugh" }, theo: { pose: "wave", mood: "grin" } } },
        panel: null,
        say: [["maya", "Keep speaking. Keep growing.", "laugh", "wave"]] },
    ] });
})(typeof window !== "undefined" ? window : globalThis);
