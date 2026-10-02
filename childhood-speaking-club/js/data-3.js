/* Lesson data, part 3: chapters 7-10. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var L = (FE.LESSON = FE.LESSON || { chapters: [] });
  var at = function (x, y, s, o) { var r = { x: x, y: y == null ? 930 : y, s: s == null ? 0.95 : s }; for (var k in (o || {})) r[k] = o[k]; return r; };
  var NOKIDS = { k1: null, k2: null, k3: null, k4: null, newcomer: null, quiet: null, owner: null };
  function cast(o) { var r = {}; for (var k in NOKIDS) r[k] = null; for (var j in o) r[j] = o[j]; return r; }

  /* ================= 7. ROLEPLAY: MEETING AN OLD FRIEND (420 s) ================= */
  var RP1_PROMPTS = ["Do you remember…?", "What did you use to enjoy most?", "I remember it a little differently.", "I used to…, but now…", "Would you like to…?"];
  var RP1_ROLES = [
    { n: "Alex", lines: ["Remembers art projects and quiet games", "Used to be shy", "Now enjoys organizing activities"] },
    { n: "Jordan", lines: ["Remembers outdoor games and school performances", "Used to be outgoing", "Now prefers smaller gatherings"] },
  ];
  var RP1_FACTS = ["They went to the same school and shared a class for two years.", "Their school put on a show every spring.", "After lessons, they sometimes met in the art room because it was quiet."];
  var RP1_GOAL = ["Reconnect", "Compare how your interests have changed", "Share one short memory", "Agree on a simple way to keep in touch"];
  var RP1_STARTERS = RP1_PROMPTS;
  var rp1Cast = function (alexPose, jordanPose, am, jm) {
    return cast({ alex: at(190, 990, 0.74, { char: "alex", pose: alexPose, mood: am }), jordan: at(1730, 990, 0.74, { char: "jordan", pose: jordanPose, mood: jm, flip: true }), maya: null, theo: null });
  };
  var RP1_PANEL = function (key, swap) {
    return { pos: "C", key: key, blocks: [
      { k: "tag", t: swap ? "Roles switched" : "Two old schoolmates" },
      { k: "roles", items: swap ? [RP1_ROLES[1], RP1_ROLES[0]] : RP1_ROLES, swapped: !!swap, rvx: 1 },
      { k: "facts", items: RP1_FACTS, label: "Shared facts", rv: 1, rvx: 2 },
      { k: "goal", items: RP1_GOAL, label: "Your goal", rv: 2 },
    ] };
  };

  L.chapters.push({ n: 7, id: "rp-friend", title: "Roleplay: meeting an old friend", min: 7, mode: "roleplay",
    goal: "Two fictional adults reconnect: compare how interests changed, share a short memory, and agree how to keep in touch.",
    steps: [
      { id: "r-intro", t: "Meet Alex and Jordan", sec: 30, phase: "Listen", wait: true,
        scene: { bg: "street", tod: "golden", fx: null, vig: null, memory: false, props: [], cam: [960, 540, 1.0], cast: rp1Cast("rest", "rest", "warm", "warm") },
        say: [["maya", "Meet two fictional adults: Alex and Jordan.", "smile", "present"], ["theo", "They went to the same school, but haven't spoken for years.", "curious", "present"]],
        panel: RP1_PANEL("rp1"), starters: RP1_STARTERS },
      { id: "r-model", t: "Listen to a short model", sec: 40, phase: "Listen", wait: true,
        scene: { cast: rp1Cast("rest", "rest", "smile", "surprised") }, panel: { pos: "none", key: "rp1-model", blocks: [] },
        say: [
          ["jordan", "Alex? Is that you? It's been years!", "surprised", "open"],
          ["alex", "Jordan! I can't believe it. Do you remember the spring show?", "laugh", "wave"],
          ["jordan", "Of course! I used to love the stage. What did you use to enjoy most?", "grin", "open"],
          ["alex", "The art room. I used to be shy, but now I organize workshops.", "warm", "present"],
          ["jordan", "I used to be outgoing, but now I prefer small dinners.", "smile", "shrug"],
          ["alex", "Funny how things change. Would you like to keep in touch?", "smile", "open"],
          ["jordan", "I'd love that. Let's meet for coffee next month.", "grin", "present"],
          ["alex", "Great. I'll send you a message this week.", "warm", "rest"]] },
      { id: "r-prep", t: "Prepare", sec: 20, timer: 20, phase: "Think",
        scene: { cast: rp1Cast("think", "think", "thinking", "thinking") },
        panel: { pos: "C", key: "rp1-prompts", blocks: [
          { k: "tag", t: "Prompts, not a script" },
          { k: "roles", items: RP1_ROLES, compact: true },
          { k: "chips", items: RP1_PROMPTS, label: "Useful prompts", rv: 1, each: true },
          { k: "note", t: "Both role cards are visible to everyone. The teacher assigns roles aloud." },
        ] }, starters: RP1_STARTERS },
      { id: "r-r1a", t: "Round 1: reconnect", sec: 80, timer: 80, speak: true, phase: "Role-play",
        scene: { cast: rp1Cast("open", "open", "smile", "smile") },
        sample: [["jordan", "Alex! It's great to see you. Do you remember the art room?"], ["alex", "Of course. I used to hide there. What did you use to enjoy most?"], ["jordan", "Outdoor games! I used to be loud, but now I prefer smaller groups."]],
        starters: RP1_STARTERS },
      { id: "r-twist", t: "Twist: a different memory", sec: 10, phase: "Twist", wait: true,
        scene: { cast: rp1Cast("think", "shrug", "curious", "curious") },
        say: [["theo", "A twist: you remember the same show differently.", "surprised", "present"], ["maya", "Neither memory has to be wrong.", "warm", "present"]],
        panel: { pos: "C", key: "rp1-twist", blocks: [
          { k: "tag", t: "Twist" },
          { k: "twistbig", t: "Both remember the spring show. Alex remembers rain. Jordan remembers sunshine." },
          { k: "chips", items: ["I remember it a little differently.", "That's interesting. Tell me more."], label: "You could say", rv: 1 },
        ] } },
      { id: "r-r1b", t: "Round 1: continue with the twist", sec: 70, timer: 70, speak: true, phase: "Role-play",
        scene: { cast: rp1Cast("open", "open", "curious", "laugh") },
        sample: [["alex", "I remember it a little differently. I think it rained, and we moved indoors."], ["jordan", "Really? I remember sunshine. Maybe it changed during the show!"], ["alex", "Maybe! Would you like to keep in touch?"]],
        starters: ["I remember it a little differently.", "That's interesting. Tell me more.", "Would you like to…?"] },
      { id: "r-feedback", t: "Feedback", sec: 20, timer: 20, speak: true, phase: "Listen",
        panel: { pos: "C", key: "rp1-feedback", blocks: [
          { k: "tag", t: "Feedback" },
          { k: "q", t: "Partner: say one thing you liked. Then ask one follow-up question." },
          { k: "note", t: "The teacher can offer one correction after the turn." },
        ] },
        scene: { cast: rp1Cast("rest", "rest", "warm", "warm") },
        sample: [["maya", "I liked your question about the art room."], ["theo", "What was your favorite project?"]],
        starters: ["I liked…", "Could you tell me more about…?"] },
      { id: "r-switch", t: "Switch roles", sec: 10, phase: "Twist", wait: true,
        scene: { cast: rp1Cast("present", "present", "grin", "grin") },
        say: [["theo", "Switch roles. A shorter round, and a fresh start.", "grin", "present"]],
        panel: RP1_PANEL("rp1b", true) },
      { id: "r-r2", t: "Round 2: roles switched", sec: 100, timer: 100, speak: true, phase: "Role-play",
        scene: { cast: rp1Cast("open", "open", "smile", "smile") },
        sample: [["jordan", "Alex? Wow! I remember the quiet games in the art room."], ["alex", "And I remember your performances. I used to be outgoing, but now I like smaller groups."], ["jordan", "Same here. Would you like to keep in touch?"]],
        starters: RP1_STARTERS },
      { id: "r-wrap", t: "Share", sec: 40, timer: 40, speak: true, phase: "Share",
        panel: { pos: "C", key: "rp1-wrap", blocks: [
          { k: "tag", t: "Share with the group" },
          { k: "q", t: "What is one thing your partner said? Which expression did you use?" },
          { k: "chips", items: ["Do you remember…?", "I used to…, but now…", "Would you like to…?"], small: true },
        ] },
        sample: [["maya", "My partner said they used to be shy. I used “Would you like to…?” to invite them for coffee."]],
        starters: ["My partner said…", "I used the expression…"] },
    ] });

  /* ================= 8. ROLEPLAY: PLANNING A CHILDHOOD GAMES DAY (420 s) ================= */
  var GD_PROMPTS = ["How about…?", "We could…", "That might work, but…", "What equipment would we need?", "Let's make sure everyone can join in."];
  var GD_ORG = [
    { n: "Organizer A", lines: ["Wants active outdoor games", "Wants very little equipment"] },
    { n: "Organizer B", lines: ["Wants quieter creative activities", "Wants an indoor backup"] },
  ];
  var GD_CONS = ["The event lasts one hour.", "Equipment is limited.", "People have different interests and abilities.", "The weather may change."];
  var GD_GOAL = ["Three activities", "Their order and timing", "Basic rules", "An alternative for anyone who can't or doesn't want to join"];
  var gdCast = function (am, bm, ap, bp) { return cast({ maya: at(190, 990, 0.74, { char: "maya", pose: ap || "rest", mood: am || "smile" }), theo: at(1730, 990, 0.74, { char: "theo", pose: bp || "rest", mood: bm || "smile", flip: true }), alex: null, jordan: null }); };
  var GD_PANEL = function (key, swap) {
    return { pos: "C", key: key, blocks: [
      { k: "tag", t: swap ? "Priorities switched" : "A fictional community games afternoon" },
      { k: "roles", items: swap ? [GD_ORG[1], GD_ORG[0]] : GD_ORG, orgs: true, rvx: 1 },
      { k: "facts", items: GD_CONS, label: "Constraints", rv: 1, rvx: 2 },
      { k: "goal", items: GD_GOAL, label: "Your goal", rv: 2 },
    ] };
  };
  L.chapters.push({ n: 8, id: "rp-games", title: "Roleplay: planning a childhood games day", min: 7, mode: "roleplay",
    goal: "Two organizers negotiate a one-hour games afternoon: three activities, an order, timing, rules, and an alternative for everyone.",
    steps: [
      { id: "g-intro", t: "The scenario", sec: 30, phase: "Listen", wait: true,
        scene: { bg: "community", tod: "day", fx: null, vig: null, memory: false, props: [], cam: [960, 540, 1.0], cast: gdCast("smile", "warm") },
        say: [["theo", "Two organizers are planning a fictional games afternoon.", "smile", "presentL"], ["maya", "They want different things. They must agree.", "curious", "present"]],
        panel: GD_PANEL("rp2"), starters: GD_PROMPTS },
      { id: "g-model", t: "Listen to a short model", sec: 40, phase: "Listen", wait: true,
        scene: { cast: gdCast("smile", "curious") }, panel: { pos: "none", key: "rp2-model", blocks: [] },
        say: [
          ["maya", "How about tag and relay races? We hardly need any equipment.", "grin", "open"],
          ["theo", "That might work, but not everyone likes running. What about a drawing table?", "curious", "presentL"],
          ["maya", "Good idea. What equipment would we need?", "curious", "think"],
          ["theo", "Paper, markers, and a quiet room as our indoor backup.", "smile", "presentL"],
          ["maya", "Let's make sure everyone can join in. Anyone can be scorekeeper.", "warm", "open"],
          ["theo", "Perfect. Tag, drawing, then a board game. Twenty minutes each.", "grin", "presentL"],
          ["maya", "And if it rains, we move the drawing and the board game inside.", "smile", "present"],
          ["theo", "Great. Let's write the rules on one card.", "grin", "rest"]] },
      { id: "g-plan", t: "Plan quietly", sec: 30, timer: 30, phase: "Think",
        scene: { cast: gdCast("thinking", "thinking", "think", "thinkL") },
        panel: { pos: "C", key: "rp2-plan", blocks: [
          { k: "tag", t: "Planning board" },
          { k: "plan" },
        ] }, starters: GD_PROMPTS },
      { id: "g-nego", t: "Round 1: negotiate", sec: 100, timer: 100, speak: true, phase: "Role-play",
        scene: { cast: gdCast("smile", "smile", "open", "presentL") },
        sample: [["maya", "How about starting with tag? We don't need any equipment."], ["theo", "That might work, but let's add a quiet drawing table, too."], ["maya", "Good idea. Let's make sure everyone can join in. What about twenty minutes each?"]],
        starters: GD_PROMPTS },
      { id: "g-constraint", t: "New constraint", sec: 10, phase: "Twist", wait: true,
        scene: { cast: gdCast("surprised", "surprised", "present", "presentL") },
        say: [["theo", "New constraint! Check the weather card.", "surprised", "presentL"]],
        panel: { pos: "C", key: "rp2-constraint", blocks: [
          { k: "tag", t: "New constraint" },
          { k: "constraint", items: ["Rain is coming after thirty minutes.", "Only one ball is available.", "A group of newcomers arrives who don't know the games."] },
          { k: "note", t: "Teacher: choose the card that fits your group." },
        ] } },
      { id: "g-adapt", t: "Round 1: adapt the plan", sec: 50, timer: 50, speak: true, phase: "Role-play",
        scene: { cast: gdCast("curious", "curious", "open", "presentL") },
        sample: [["theo", "If rain is coming, we could move the board game first."], ["maya", "Then tag outside, before the rain. That might work, but we need a backup."]],
        starters: ["If…, we could…", "That might work, but…", "Let's make sure everyone can join in."] },
      { id: "g-switch", t: "Switch priorities", sec: 10, phase: "Twist", wait: true,
        scene: { cast: gdCast("grin", "grin", "present", "presentL") },
        say: [["maya", "Switch priorities. A shorter round with new views.", "grin", "present"]],
        panel: GD_PANEL("rp2b", true) },
      { id: "g-r2", t: "Round 2: priorities switched", sec: 100, timer: 100, speak: true, phase: "Role-play",
        scene: { cast: gdCast("smile", "smile", "open", "presentL") },
        sample: [["theo", "How about a puzzle table and a drawing corner? They're quiet and need little space."], ["maya", "That might work, but I'd like one active game. We could play tag outside."], ["theo", "Great. And an indoor backup for rain."]],
        starters: GD_PROMPTS },
      { id: "g-share", t: "Share your final plan", sec: 50, timer: 50, speak: true, phase: "Share",
        panel: { pos: "C", key: "rp2-share", blocks: [
          { k: "tag", t: "Share your plan" },
          { k: "p", t: "Tell the group: three activities, their order, timing, one rule, and an alternative." },
          { k: "plan", readonly: true },
        ] },
        sample: [["maya", "First, tag for twenty minutes. Then drawing, then a board game."], ["maya", "The rule is: take turns. Anyone who doesn't want to run can be the scorekeeper."]],
        starters: ["First…, then…, and finally…", "The rule is…", "If someone can't…, they can…"] },
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
