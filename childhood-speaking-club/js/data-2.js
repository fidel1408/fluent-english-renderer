/* Lesson data, part 2: chapters 4-6. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var L = (FE.LESSON = FE.LESSON || { chapters: [] });
  var at = function (x, y, s, o) { var r = { x: x, y: y == null ? 930 : y, s: s == null ? 0.95 : s }; for (var k in (o || {})) r[k] = o[k]; return r; };
  var kid = function (n, x, y, s, o) { var r = at(x, y, s == null ? 0.66 : s, o); r.kid = n; return r; };
  var RED = { top: "#F26B5B" }, BLUE = { top: "#3C78C9" };

  var DQ = ["What would you do?", "What would you say?", "Who might be affected?", "Is there another solution?"];

  /* ================= 4. CHILDHOOD DILEMMAS (480 s) ================= */
  var ch4 = { n: 4, id: "dilemmas", title: "Childhood dilemmas", min: 8, mode: "talk",
    goal: "Three fictional situations with competing needs: decide, explain, hear a new detail, and revise.",
    steps: [
      { id: "d-intro", t: "Three fictional situations", sec: 12, phase: "Listen", wait: true,
        scene: { bg: "schoolyard", tod: "day", memory: false, fx: null, vig: null, cam: [960, 540, 1.0], props: [],
          cast: { maya: at(300, 960, 0.85, { char: "maya", pose: "present", mood: "smile" }), theo: at(620, 960, 0.85, { char: "theo", pose: "rest", mood: "warm" }), newcomer: null } },
        say: [["theo", "Three short situations, all fictional.", "smile", "present"], ["maya", "There is more than one good answer. Give a reason.", "warm", "present"]],
        panel: { pos: "R", key: "d-intro", blocks: [
          { k: "h", t: "Four helpful questions" },
          { k: "list", items: DQ, num: true, each: true, rv: 0 },
        ] } },
      { id: "d-intro-speak", t: "Quick start: what makes a game fair?", sec: 18, timer: 18, speak: true, phase: "Speak",
        panel: { pos: "R", key: "d-quick", blocks: [
          { k: "tag", t: "Quick start" },
          { k: "q", t: "What makes a game feel fair? Say one idea." },
          { k: "note", t: "A fictional or general example is fine." },
        ] },
        sample: [["theo", "A game feels fair when everyone knows the rules and gets a turn."]],
        starters: ["A game is fair when…", "It isn't fair if…"] },
    ] };

  var DIL = [
    { id: "A", bg: "schoolyard", tod: "day", title: "A. The full teams", s: "Situation A",
      cam: [1000, 560, 1.0], camP: [1560, 560, 1.0],
      cast: {
        k1: kid(0, 900, 900, 0.7, { pose: "kidrun", mood: "grin", extra: RED }), k2: kid(1, 1040, 880, 0.7, { pose: "open", mood: "laugh", extra: RED }),
        k3: kid(2, 1180, 900, 0.7, { pose: "kidrun", mood: "grin", extra: BLUE }), k4: kid(3, 1320, 880, 0.7, { pose: "cheer", mood: "grin", extra: BLUE }),
        newcomer: kid(4, 770, 910, 0.7, { pose: "rest", mood: "shy" }),
      },
      props: [{ id: "ball", x: 1110, y: 700, s: 1, cls: "bob" }, { id: "backpack", x: 700, y: 960, s: 0.9 }],
      setup: [["maya", "At recess, two teams are playing a ball game.", "smile", "present"], ["theo", "A new child walks over with a backpack.", "curious", "rest"],
              ["maya", "The players say, “Sorry, our teams are full.”", "worried", "shrug"], ["theo", "Nobody wants to stop the exciting game.", "worried", "think"]],
      q: "A new child wants to join. The teams are full.",
      focus: "How could they include the newcomer without stopping the game completely?",
      opts: [
        ["Make the teams uneven for one round.", "The game keeps going and the newcomer plays, but one team may feel the numbers are unfair."],
        ["Start a second small game nearby.", "More children can play, but the first game may lose some players."],
        ["Give the newcomer a role: scorekeeper or referee.", "The newcomer is part of the game, but may still want to play."],
        ["Say, “You can join the next round.”", "The game doesn't stop, but the newcomer may have to wait."],
      ],
      twist: "The newcomer just moved here and doesn't know the rules.",
      twistSay: [["theo", "One more detail: the newcomer just moved here.", "curious", "present"], ["maya", "They don't know the rules yet.", "worried", "shrug"]],
      twistCast: { newcomer: { mood: "worried", pose: "shrug" }, k1: { mood: "curious" }, k3: { mood: "curious" } },
      sampleDiscuss: [["maya", "I'd say, “Join us this round. We'll even out the teams.” That includes them without stopping the game."], ["theo", "Another idea: add a third team. Then nobody waits."]],
      sampleRevise: [["maya", "If they don't know the rules, I'd explain the game in one minute, then invite them in."]],
      sampleShare: [["theo", "My final answer: make space, explain simply, and keep playing."]],
    },
    { id: "B", bg: "art", tod: "day", title: "B. The borrowed model", s: "Situation B",
      cam: [1000, 560, 1.0], camP: [1560, 560, 1.0],
      cast: {
        k1: kid(5, 860, 910, 0.7, { pose: "hips", mood: "worried" }), k2: kid(2, 1180, 910, 0.7, { pose: "open", mood: "worried" }),
        owner: null,
      },
      props: [{ id: "bridge", x: 1020, y: 930, s: 1 }, { id: "piece", x: 1100, y: 975, s: 1 }],
      setup: [["maya", "Two friends borrowed a model bridge for a school project.", "smile", "present"], ["theo", "While carrying it, they dropped it. A small piece broke.", "worried", "shrug"],
              ["maya", "One friend whispers, “Let's hide it.”", "worried", "think"], ["theo", "The other says, “We should explain.”", "curious", "present"]],
      q: "Two friends damaged something they borrowed.",
      focus: "One wants to hide it. The other wants to explain. What should they say and do?",
      opts: [
        ["Hide the damage and return it quickly.", "The problem may stay hidden for a while, but the owner might notice later and trust could be affected."],
        ["Tell the owner and say sorry.", "The owner may be upset at first, but they will know what happened."],
        ["Try to repair it first, then explain.", "It could help, or the repair might not work. The owner still needs to know."],
        ["Ask a trusted adult for advice first.", "They get another view, but it takes more time."],
      ],
      twist: "The owner asks, “Is everything okay with the bridge?” before the friends have decided.",
      twistSay: [["theo", "One more detail: the owner arrives.", "surprised", "present"], ["maya", "They ask, “Is everything okay with the bridge?”", "curious", "present"]],
      twistCast: { owner: kid(1, 1430, 910, 0.7, { pose: "rest", mood: "curious" }), k1: { mood: "surprised" }, k2: { mood: "surprised" } },
      sampleDiscuss: [["maya", "I'd say, “I'm sorry. It broke when we dropped it. We'd like to fix it.” That's honest."], ["theo", "Yes, but I'd tell them first, then offer to repair it together."]],
      sampleRevise: [["theo", "With the owner right there, I'd answer honestly now. Waiting makes it harder."]],
      sampleShare: [["maya", "My final answer: say what happened, apologize, and offer to help repair it."]],
    },
    { id: "C", bg: "community", tod: "day", title: "C. The class event", s: "Situation C",
      cam: [1000, 560, 1.0], camP: [1560, 560, 1.0],
      cast: {
        k1: kid(0, 700, 920, 0.7, { pose: "cheer", mood: "grin", extra: RED }), k2: kid(3, 850, 910, 0.7, { pose: "hips", mood: "grin", extra: RED }),
        k3: kid(2, 1060, 910, 0.7, { pose: "write", mood: "smile", extra: BLUE }), k4: kid(4, 1200, 910, 0.7, { pose: "open", mood: "curious", extra: BLUE }),
        quiet: kid(5, 1380, 930, 0.7, { pose: "rest", mood: "sad" }),
      },
      props: [{ id: "cones", x: 780, y: 960, s: 1 }, { id: "paperstack", x: 1130, y: 905, s: 1 }],
      setup: [["maya", "A group has limited time to prepare a school event.", "smile", "present"], ["theo", "Some want a sports activity.", "grin", "pointL"],
              ["maya", "Others want an art activity.", "smile", "point"], ["theo", "And one person feels ignored.", "worried", "think"]],
      q: "A group must plan an event in limited time.",
      focus: "Some want sports, others want art, and one person feels ignored. How could they decide fairly?",
      opts: [
        ["Vote, and the majority decides.", "It is quick, but the person who feels ignored may still feel left out."],
        ["Combine both: an art-and-sports relay.", "It might please both groups, but it could be harder to organize."],
        ["Ask the quiet person for an idea first.", "That person feels heard, but the group may need more time to agree."],
        ["Divide the time: half sports, half art.", "Both groups get something, but each activity is shorter."],
      ],
      twist: "Now there are only thirty minutes left, and only one table.",
      twistSay: [["theo", "One more detail: only thirty minutes are left.", "surprised", "present"], ["maya", "And there is only one table.", "worried", "shrug"]],
      twistCast: { quiet: { mood: "curious", pose: "open" }, k1: { mood: "worried" }, k3: { mood: "worried" } },
      sampleDiscuss: [["maya", "I'd ask everyone for one idea, starting with the quiet person. Then we choose together."], ["theo", "I'd suggest a relay that mixes art and sports, so both groups can enjoy it."]],
      sampleRevise: [["theo", "With thirty minutes, I'd pick one simple activity and give everyone a role."]],
      sampleShare: [["maya", "My final answer: hear every idea, then choose a simple plan that includes everyone."]],
    },
  ];

  DIL.forEach(function (d, i) {
    var key = "d" + d.id;
    var guides = { maya: at(300, 960, 0.85, { char: "maya", pose: "present", mood: "smile" }), theo: at(620, 960, 0.85, { char: "theo", pose: "rest", mood: "warm" }) };
    var scene0 = { bg: d.bg, tod: d.tod, fx: null, vig: null, memory: false, cam: d.cam, props: d.props, cast: {} };
    for (var g in guides) scene0.cast[g] = guides[g];
    for (var c in d.cast) scene0.cast[c] = d.cast[c];
    if (!d.cast.owner) scene0.cast.owner = null;
    if (!d.cast.newcomer) scene0.cast.newcomer = null;
    ch4.steps.push({ id: key + "-setup", t: d.s + ": the scene", sec: 25, auto: true, phase: "Listen", scene: scene0, say: d.setup, panel: null });

    var optsBlock = { k: "opts", items: d.opts.map(function (o) { return { t: o[0], res: o[1] }; }), each: true, rv: 1, letters: true, grid: true };
    var panel = { pos: "R", key: key, blocks: [
      { k: "tag", t: d.s },
      { k: "q", t: d.q, rvx: 1 },
      { k: "p", t: d.focus, cls: "focus", rvx: 1 },
      { k: "p", t: d.q, cls: "focus", rv: 1 },
      optsBlock,
      { k: "follow", items: DQ.slice(1), rv: 5, single: true, until: 8 },
      { k: "twist", t: d.twist, rv: 8 },
    ] };
    ch4.steps.push({ id: key + "-think", t: d.s + ": think", sec: 10, timer: 10, phase: "Think",
      scene: { cam: d.camP, cast: { maya: { x: -200 }, theo: { x: -100 } } }, panel: panel,
      starters: ["I would…", "I would say, “…”", "That could help because…"] });
    ch4.steps.push({ id: key + "-discuss", t: d.s + ": discuss", sec: 55, timer: 55, speak: true, phase: "Discuss",
      sample: d.sampleDiscuss, starters: ["I would…", "I would say, “…”", "That could help because…", "A risk might be…"],
      example: ["maya", d.sampleDiscuss[0][1], "Fictional example"] });
    ch4.steps.push({ id: key + "-twist", t: d.s + ": one more detail", sec: 15, phase: "Twist", wait: true, reveal: 8,
      scene: { cast: d.twistCast }, say: d.twistSay });
    ch4.steps.push({ id: key + "-revise", t: d.s + ": revise", sec: 30, timer: 30, speak: true, phase: "Revise",
      sample: d.sampleRevise, starters: ["Now I would…", "Because of that detail, I'd change…", "I'd still…, but…"] });
    ch4.steps.push({ id: key + "-share", t: d.s + ": share", sec: 15, timer: 15, speak: true, phase: "Share",
      sample: d.sampleShare, starters: ["My final answer is…", "Another solution could be…"] });
  });
  L.chapters.push(ch4);

  /* ================= 5. AGREE OR DISAGREE? (480 s) ================= */
  var SCALE = ["Strongly agree", "Partly agree", "It depends", "Partly disagree", "Strongly disagree"];
  L.SCALE = SCALE;
  var CLAIMS = [
    { t: "Children need more free play than organized activities.", icon: "swing", sample: ["maya", "I partly agree. Free play builds creativity. But a good class can also teach teamwork."] },
    { t: "Having chores helps children become more independent.", icon: "broom", sample: ["theo", "It depends. Small tasks can build confidence, but too many chores may be stressful."] },
    { t: "Childhood friendships can be just as important as friendships made later.", icon: "friends", sample: ["maya", "I partly agree. One example would be a friend who knew you in difficult times."] },
    { t: "Technology gives children more opportunities to be creative.", icon: "tablet", sample: ["theo", "In some situations, yes. A child can make music or a short film. But paper and tape are creative too."] },
  ];
  var ch5 = { n: 5, id: "agree", title: "Agree or disagree?", min: 8, mode: "talk",
    goal: "Four discussion claims. Choose a place on the scale and support it with a reason, an example, or an exception.",
    steps: [
      { id: "a-intro", t: "Claims, not facts", sec: 14, phase: "Listen", wait: true,
        scene: { bg: "street", tod: "golden", fx: null, vig: null, memory: false, props: [], cam: [1060, 540, 1.0],
          cast: { maya: at(300, 960, 0.9, { char: "maya", pose: "present", mood: "smile" }), theo: at(640, 960, 0.9, { char: "theo", pose: "rest", mood: "warm" }), k1: null, k2: null, k3: null, k4: null, newcomer: null, quiet: null, owner: null } },
        say: [["maya", "Four claims. They are opinions, not facts.", "smile", "present"], ["theo", "Choose a place on the scale, then explain.", "warm", "present"]],
        panel: { pos: "R", key: "a-intro", blocks: [
          { k: "h", t: "The opinion scale" },
          { k: "scale-demo", items: SCALE },
          { k: "p", t: "Always give a reason, an example, or an exception.", rv: 1 },
        ] } },
      { id: "a-intro-speak", t: "Quick try", sec: 11, timer: 11, speak: true, phase: "Speak",
        panel: { pos: "R", key: "a-quick", blocks: [
          { k: "tag", t: "Quick try" },
          { k: "q", t: "“Weekends are better with a plan.” Where are you on the scale?" },
          { k: "scale-demo", items: SCALE },
        ] },
        sample: [["theo", "It depends. A plan helps me relax, but sometimes I want a free day."]] },
    ] };

  CLAIMS.forEach(function (c, i) {
    var n = i + 1, key = "a" + n;
    var panel = { pos: "R", key: key, blocks: [
      { k: "tag", t: "Claim " + (["one", "two", "three", "four"][i]) + " of four" },
      { k: "claim", t: c.t, icon: c.icon },
      { k: "scale", id: key, items: SCALE, rv: 1, rvx: 5 },
      { k: "chips", items: ["a reason", "an example", "an exception"], small: true, label: "Support your place with", rv: 2, rvx: 5 },
      { k: "follow", items: ["What would that depend on?", "Could the opposite also be true?", "How might age or circumstances change your answer?"], rv: 5, single: true, label: "Follow-up question" },
    ] };
    ch5.steps.push({ id: key + "-show", t: "Claim " + n + ": read", sec: 10, phase: "Listen", wait: true,
      scene: { cast: { maya: { pose: "present", mood: "curious" }, theo: { pose: "rest", mood: "warm" } } },
      say: [[i % 2 ? "maya" : "theo", c.t, "curious", "present"]], panel: panel });
    ch5.steps.push({ id: key + "-choose", t: "Claim " + n + ": choose", sec: 15, timer: 15, phase: "Choose", reveal: 1,
      scene: { cast: { maya: { pose: "think", mood: "thinking" }, theo: { pose: "think", mood: "thinking" } } },
      starters: ["I strongly agree because…", "I partly agree, but…", "It depends on…"] });
    ch5.steps.push({ id: key + "-explain", t: "Claim " + n + ": explain", sec: 45, timer: 45, speak: true, phase: "Explain", reveal: 2,
      scene: { cast: { maya: { pose: "rest", mood: "smile" }, theo: { pose: "open", mood: "warm" } } },
      sample: [c.sample], example: [c.sample[0], c.sample[1], "Fictional example"],
      starters: ["I see your point, but…", "In some situations…", "One example would be…", "For me, it depends on…"] });
    ch5.steps.push({ id: key + "-challenge", t: "Claim " + n + ": challenge", sec: 25, timer: 25, speak: true, phase: "Ask", reveal: 5,
      scene: { cast: { maya: { pose: "open", mood: "curious" }, theo: { pose: "think", mood: "curious" } } },
      sample: [["maya", "How might age or circumstances change your answer?"], ["theo", "For younger children, I'd say the answer changes. Older children can manage more."]],
      starters: ["What would that depend on?", "Could the opposite also be true?", "How might age or circumstances change your answer?"] });
    ch5.steps.push({ id: key + "-respond", t: "Claim " + n + ": respond", sec: 10, timer: 10, speak: true, phase: "Respond", reveal: 5,
      scene: { cast: { maya: { pose: "rest", mood: "grin" }, theo: { pose: "rest", mood: "smile" } } },
      sample: [["theo", "I see your point, but I think the context matters."]],
      starters: ["I see your point, but…", "In some situations…", "One example would be…"] });
  });

  ch5.steps.push({ id: "a-wrap", t: "Which claim made you think?", sec: 35, timer: 35, speak: true, phase: "Speak",
    scene: { cast: { maya: { pose: "open", mood: "warm" }, theo: { pose: "open", mood: "grin" } } },
    panel: { pos: "R", key: "a-wrap", blocks: [
      { k: "tag", t: "Wrap-up" },
      { k: "q", t: "Which claim made you think the most? Why?" },
      { k: "note", t: "Use a reason, an example, or an exception." },
    ] },
    sample: [["maya", "The second claim made me think. In some situations, chores help, but too many can be stressful."]],
    starters: ["The claim that made me think was…", "One example would be…", "In some situations…"] });
  L.chapters.push(ch5);

  /* ================= 6. COMPARE AND DECIDE (420 s) ================= */
  var Q4 = [
    { id: "creativity", w: "Creativity", d: "making or imagining new things" },
    { id: "friendship", w: "Friendship", d: "caring, fun relationships with others" },
    { id: "independence", w: "Independence", d: "doing things without always needing help" },
    { id: "cooperation", w: "Cooperation", d: "working well together" },
  ];
  var CS = ["I would prioritize…", "This matters because…", "Compared with…", "Could we compromise by…?"];
  L.QUALITIES = Q4;
  L.chapters.push({ n: 6, id: "compare", title: "Compare and decide", min: 7, mode: "talk",
    goal: "A negotiation task: rank four qualities for a fictional childhood activity program and agree on the top two.",
    steps: [
      { id: "c-intro", t: "A fictional program", sec: 14, phase: "Listen", wait: true,
        scene: { bg: "community", tod: "day", fx: null, vig: null, memory: false, props: [], cam: [960, 540, 1.0],
          cast: { maya: at(190, 1000, 0.62, { char: "maya", pose: "present", mood: "smile" }), theo: at(1730, 1000, 0.62, { char: "theo", pose: "presentL", mood: "warm", flip: true }), k1: null, k2: null, k3: null, k4: null, newcomer: null, quiet: null, owner: null } },
        say: [["maya", "You're planning a fictional childhood activity program.", "smile", "present"], ["theo", "All four qualities matter. This is a negotiation, not a judgment.", "warm", "presentL"]],
        panel: { pos: "C", key: "c-intro", blocks: [
          { k: "h", t: "Four valuable qualities" },
          { k: "qual", items: Q4, rv: 0, each: true },
        ] } },
      { id: "c-intro-speak", t: "Quick start", sec: 16, timer: 16, speak: true, phase: "Speak",
        panel: { pos: "C", key: "c-quick", blocks: [
          { k: "tag", t: "Quick start" },
          { k: "q", t: "Pick one quality. Why could it matter in a childhood program?" },
          { k: "qual", items: Q4, compact: true },
        ] },
        sample: [["theo", "I'd pick cooperation. Children learn that a good idea is stronger when people build it together."]],
        starters: ["This matters because…", "I would prioritize… because…"] },
      { id: "c-think", t: "Think: your own order", sec: 30, timer: 30, phase: "Think",
        panel: { pos: "C", key: "c-rank", blocks: [
          { k: "tag", t: "Rank the four qualities" },
          { k: "rank", items: Q4 },
          { k: "note", t: "Drag a card, or use the Move buttons. First place = highest priority." },
        ] }, starters: CS },
      { id: "c-explain", t: "Explain your ranking", sec: 90, timer: 90, speak: true, phase: "Explain",
        sample: [["maya", "I would prioritize friendship. This matters because children join in when they feel welcome."], ["theo", "I would put independence first. This matters because children learn to try things on their own."]],
        starters: CS, example: ["maya", "I would prioritize friendship first. This matters because children join in when they feel welcome.", "Fictional example"] },
      { id: "c-respond", t: "Respond to another view", sec: 60, timer: 60, speak: true, phase: "Respond",
        sample: [["theo", "I see your point about friendship, but I'd put independence higher. Could we compromise by choosing both?"]],
        starters: ["I see your point, but…", "Compared with…, I think…", "Could we compromise by…?"] },
      { id: "c-agree", t: "Agree on the top two", sec: 90, timer: 90, speak: true, phase: "Agree",
        sample: [["maya", "Could we compromise by choosing friendship and cooperation?"], ["theo", "That works. Friendship and cooperation are our top two."]],
        starters: ["Could we compromise by…?", "Our top two are…", "We chose them because…"] },
      { id: "c-twist", t: "A new situation", sec: 20, phase: "Twist", wait: true,
        scene: { cast: { maya: { pose: "present", mood: "curious" }, theo: { pose: "presentL", mood: "surprised" } } },
        say: [["theo", "New situation: the group has mixed interests and only thirty minutes.", "surprised", "presentL"], ["maya", "Should your priorities, or your planned activities, change?", "curious", "present"]],
        panel: { pos: "C", key: "c-rank", blocks: [
          { k: "tag", t: "Rank the four qualities" },
          { k: "rank", items: Q4 },
          { k: "twist", t: "Mixed interests. Only thirty minutes." },
        ] } },
      { id: "c-twist-discuss", t: "Discuss: do the priorities change?", sec: 70, timer: 70, speak: true, phase: "Discuss",
        sample: [["maya", "With thirty minutes, I'd keep cooperation. Could we compromise by making two short stations?"]],
        starters: ["With less time, I would…", "This matters because…", "Could we compromise by…?"] },
      { id: "c-wrap", t: "Final top two and one compromise", sec: 30, timer: 30, speak: true, phase: "Share",
        sample: [["theo", "Our top two stay the same, and our compromise is two short stations."]],
        starters: ["Our final top two are…", "Our compromise is…"] },
    ] });
})(typeof window !== "undefined" ? window : globalThis);
