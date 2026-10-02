/* Fluent English - Love Speaking Club
 * content.js : all lesson text. American English. Every string shown to learners is rendered through
 * the IPA word-unit renderer (see ipa.js). Narration lines (NAR) are the exact scripts recorded in /audio
 * and the exact scripts shown in "Teacher reads" mode.
 *
 * Markup in strings:  *word*  -> highlighted target word.   word~variant -> pronunciation variant key.
 */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------------------------------
   * 1. THE 60-MINUTE PLAN  (planned minutes / planned student-speaking minutes)
   * These are classroom targets, not measurements: the app never claims to measure real speaking time.
   * ---------------------------------------------------------------------------------------- */
  const PLAN = [
    { id: 'opening', title: 'Cinematic Opening', minutes: 1, speak: 0, pattern: 'Watch, then one big question',
      segs: [['Title and opening sequence', 1, 0]] },
    { id: 'warm', title: 'Choose Your Side', minutes: 5, speak: 4, pattern: 'Sides, markers, twist question',
      segs: [['Prompt 1 to 4: choose, explain, twist (1 min 15 s each)', 5, 4]] },
    { id: 'words', title: 'Words That Change the Conversation', minutes: 6, speak: 4, pattern: 'Mini-scene, meaning check, discussion',
      segs: [['Five target items: scene, meaning check, discussion (1 min 12 s each)', 6, 4]] },
    { id: 'mystery', title: 'The Missing Piece', minutes: 8, speak: 6, pattern: 'Evidence board with three reveals',
      segs: [['Set-up', 0.5, 0], ['Reveal 1: the message', 2, 1.5], ['Reveal 2: the deadline', 2, 1.5], ['Reveal 3: two memories', 2.5, 2], ['First and final interpretations', 1, 1]] },
    { id: 'debate', title: 'Defend It, Then Challenge It', minutes: 8, speak: 6, pattern: 'Opinion scale, three rounds',
      segs: [['Four statements: set-up, view and reason, other side, exception (2 min each)', 8, 6]] },
    { id: 'tokens', title: 'Build Your Relationship Priorities', minutes: 7, speak: 5, pattern: 'Token allocation and negotiation',
      segs: [['Set-up', 0.5, 0], ['Proposals and trade-offs', 1.5, 1.25], ['Negotiate a group decision', 1.5, 1.5], ['New circumstance', 0.5, 0], ['Redistribute and explain', 2, 1.5], ['Compare the two allocations', 1, 0.75]] },
    { id: 'cases', title: 'What Would Change Your Mind?', minutes: 8, speak: 6, pattern: 'Case file and evidence buttons',
      segs: [['Case 1', 2.75, 2], ['Case 2', 2.75, 2], ['Case 3', 2.5, 2]] },
    { id: 'rather', title: 'Would You Rather? With a Twist', minutes: 7, speak: 5, pattern: 'Two doors, follow-up, twist',
      segs: [['Four pairs: choice, reason, follow-up, response, twist (1 min 45 s each)', 7, 5]] },
    { id: 'case', title: 'Make Your Case', minutes: 7, speak: 5, pattern: 'Three-stage speaking challenge',
      segs: [['Set-up and card draw', 0.5, 0], ['Speaker rounds: claim, challenge, response', 6.5, 5]] },
    { id: 'final', title: 'Final Takeaway', minutes: 3, speak: 2, pattern: 'Complete a sentence, final response',
      segs: [['Sentence completion', 1, 0.75], ['Final response with two expressions and a question', 1.5, 1.25], ['Close', 0.5, 0]] }
  ];

  /* ------------------------------------------------------------------------------------------
   * 2. SHARED LANGUAGE SUPPORT
   * ---------------------------------------------------------------------------------------- */
  const STARTERS = {
    opinion: ['I think … because …', 'For me, … matters more because …', 'In my experience, …', 'One reason is that …'],
    debate: ['I see your point, but …', 'That depends on …', 'A possible exception is …', 'I would agree if …', 'One argument someone might make is …'],
    followup: ['Could you give an example?', 'What would that look like in real life?', 'What if …?', 'How is that different from …?'],
    reconsider: ['I have changed my mind because …', 'I still think …, but now I see …', 'That new detail matters because …'],
    conditional: ['If …, I would …', 'If it were …, I would …', 'I would change my answer if …'],
    negotiate: ['Could we compromise by …?', 'I am willing to … if …', 'What if we …?', 'What would you give up?']
  };

  const BANK = [
    { w: 'trust', pos: 'noun', def: 'believing that someone is honest and will do what they say' },
    { w: 'independence', pos: 'noun', def: 'the ability to make your own choices and have your own life' },
    { w: 'compromise', pos: 'noun', def: 'an agreement where each person gives up something' },
    { w: 'boundaries', pos: 'noun', def: 'limits that show what you are comfortable with' },
    { w: 'emotional support', pos: 'noun', def: 'comfort and encouragement when someone feels worried or sad' },
    { w: 'shared values', pos: 'noun', def: 'important beliefs that two people have in common' }
  ];

  const TARGETS = ['chemistry', 'commitment', 'affectionate', 'compatible', 'work things out'];

  /* ------------------------------------------------------------------------------------------
   * 3. CHAPTER 1 : OPENING
   * ---------------------------------------------------------------------------------------- */
  const OPENING = {
    title: 'Love', sub: 'Connection, Trust, and Relationships', club: 'Speaking Club',
    start: 'Start the show', replay: 'Watch again', cont: 'Begin the first choice',
    question: 'What makes a connection worth keeping?',
    hint: 'Sound starts after this click. You control every step.'
  };

  /* ------------------------------------------------------------------------------------------
   * 4. CHAPTER 2 : CHOOSE YOUR SIDE
   * ---------------------------------------------------------------------------------------- */
  const WARM = {
    intro: 'Choose a side. You can say it depends, if you tell us what it depends on. You can always pass.',
    privacy: 'Real opinions, fictional examples, or a pass are all welcome. Please do not share private details.',
    prompts: [
      { id: 'w1', a: 'Strong chemistry', b: 'Strong communication', q: 'Strong chemistry or strong communication?',
        twist: 'Would your answer change after five years?', twist2: 'Which one is easier to build later?',
        perspective: 'Ask someone from the other side for their strongest reason.',
        stretch: 'Stretch: describe a situation where your choice would be the weaker one.',
        demo: 'Sample answer (demo): I choose strong communication, because chemistry can change, but good communication helps people work things out.' },
      { id: 'w2', a: 'Similar interests', b: 'Different perspectives', q: 'Similar interests or different perspectives?',
        twist: 'Which would matter more during a disagreement?', twist2: 'Can two people have both? How?',
        perspective: 'Ask someone from the other side for their strongest reason.',
        stretch: 'Stretch: give an example where the opposite choice would be better.',
        demo: 'Sample answer (demo): It depends on the situation. Similar interests make weekends easy, but different perspectives help people grow.' },
      { id: 'w3', a: 'Big romantic gestures', b: 'Consistent small actions', q: 'Big romantic gestures or consistent small actions?',
        twist: 'Could someone show this in a way you would not immediately recognize?', twist2: 'Can a small action become a big gesture?',
        perspective: 'Ask someone from the other side for their strongest reason.',
        stretch: 'Stretch: explain how a person could show this without saying a word.',
        demo: 'Sample answer (demo): I choose small actions. Remembering what someone likes shows you are paying attention every day.' },
      { id: 'w4', a: 'More time together', b: 'More personal space', q: 'More time together or more personal space?',
        twist: 'Would your answer change if one person had a very stressful month at work?', twist2: 'How could two people know that they need different amounts?',
        perspective: 'Ask someone from the other side for their strongest reason.',
        stretch: 'Stretch: suggest a way two people could balance both.',
        demo: 'Sample answer (demo): I choose personal space, because independence keeps me happy, and then time together feels special.' }
    ],
    labels: { depends: 'It depends', pass: 'Pass', dependsHint: 'Name one condition: it depends on …', add: 'Add marker', remove: 'Remove marker',
      kept: 'Kept my side', changed: 'Changed my mind', twistBtn: 'Show the twist question', persp: 'Hear the other side',
      support: 'Sentence starters', stretchBtn: 'Stretch challenge', next: 'Next prompt' }
  };

  /* ------------------------------------------------------------------------------------------
   * 5. CHAPTER 3 : WORDS
   * ---------------------------------------------------------------------------------------- */
  const WORDS = {
    intro: 'Five useful words and phrases. Watch a short scene, check the meaning, then talk.',
    items: [
      { id: 'chemistry', w: 'chemistry', pos: 'noun',
        def: 'a feeling of attraction or connection between people',
        ex: 'From the first conversation, there was real *chemistry* between them.',
        note: 'Chemistry can appear in a romance or a friendship.',
        scene: 'chemistry',
        check: { q: 'Which situation shows chemistry?', opts: ['Two people talk for hours, and the conversation feels easy and exciting.', 'Two people argue about the same problem every day.', 'Two people have the same job and the same schedule.'], ok: 0,
          why: 'Chemistry is a feeling of connection. Sharing a job or a schedule is not the same thing.' },
        talk: 'Can chemistry change over time? What helps it last?', talk2: 'Where else do you notice chemistry, for example in a team or a friendship?',
        stretch: 'Stretch: explain the difference between chemistry and being compatible.',
        demo: 'Sample answer (demo): I think chemistry can change, but curiosity about each other helps it last.' },
      { id: 'commitment', w: 'commitment', pos: 'noun',
        def: 'willingness to invest effort and remain dedicated',
        ex: 'Even when it was hard, they showed *commitment* by staying and trying again.',
        note: 'Commitment is a choice that both people make. It never means accepting mistreatment.',
        scene: 'commitment',
        check: { q: 'Which situation shows commitment?', opts: ['Someone keeps a promise even when it is inconvenient.', 'Someone stays in a situation where they are treated badly, because they promised to.', 'Someone changes their plans every time they feel nervous.'], ok: 0,
          why: 'Commitment means effort and dedication that both people choose. It does not mean staying where you are mistreated.' },
        talk: 'What does commitment look like in small, everyday actions?', talk2: 'How can people show commitment to a friendship, a team, or a goal?',
        stretch: 'Stretch: explain where commitment ends and self-respect begins.',
        demo: 'Sample answer (demo): Commitment can be small, like arriving on time when you said you would.' },
      { id: 'affectionate', w: 'affectionate', pos: 'adjective',
        def: 'showing fondness or love',
        ex: 'They are very *affectionate* with each other.',
        note: 'People show affection in different ways: words, actions, time, or touch.',
        scene: 'affectionate',
        check: { q: 'Which person is being affectionate?', opts: ['She hugs her friend and says, I am so glad you are here.', 'He checks his phone while his partner is talking.', 'They compare how much money they earn.'], ok: 0,
          why: 'Affectionate behavior shows fondness. The other two examples show distance or comparison.' },
        talk: 'Do people show affection differently? What styles do you notice?', talk2: 'Could someone be affectionate without saying the words?',
        stretch: 'Stretch: describe a style of affection that someone might misunderstand.',
        demo: 'Sample answer (demo): Some people are affectionate with words, and others show it by helping.' },
      { id: 'compatible', w: 'compatible', pos: 'adjective',
        def: 'able to have a good relationship because important needs or ways of living work well together',
        ex: 'They are different, but they are *compatible*: they respect each other and want similar things.',
        note: 'Compatible does not mean the same. Different people can be compatible.',
        scene: 'compatible',
        check: { q: 'Which pair sounds most compatible?', opts: ['Different personalities, but they agree on how to treat each other and how to spend money.', 'Exactly the same hobbies, but completely different plans for their lives.', 'They never disagree, because one person always gives in.'], ok: 0,
          why: 'Compatibility is about important needs and ways of living. It does not require identical personalities.' },
        talk: 'Which differences matter very little, and which could matter a lot?', talk2: 'Can people become more compatible over time?',
        stretch: 'Stretch: name one difference that is a strength and one that could be a problem.',
        demo: 'Sample answer (demo): Different music taste matters little, but different ideas about honesty could matter a lot.' },
      { id: 'workout', w: 'work things out', pos: 'phrasal verb',
        def: 'resolve a problem or disagreement',
        ex: 'It took time, but they *worked things out*.',
        note: 'We say work things out, worked things out, and working things out.',
        scene: 'workout',
        check: { q: 'Which situation shows people working things out?', opts: ['Two friends disagree about a plan, listen to each other, and find a solution.', 'Two friends stop speaking so they can avoid the problem.', 'One friend always decides, and the other stays quiet.'], ok: 0,
          why: 'Working things out means solving the problem together. Avoiding it, or letting one person decide, does not solve it.' },
        talk: 'What helps two people work things out when emotions are high?', talk2: 'When is it healthy to take a break before talking?',
        stretch: 'Stretch: explain what is different between working things out and giving in.',
        demo: 'Sample answer (demo): Taking a short break first helps, then each person explains their side calmly.' }
    ],
    labels: { show: 'Play the scene', replay: 'Play it again', meaning: 'Show the meaning', check: 'Meaning check', talk: 'Talk about it', talk2: 'Another question', next: 'Next word',
      right: 'Good choice.', notYet: 'Not the best match.', answer: 'The best match', bank: 'Open the word bank' }
  };

  /* ------------------------------------------------------------------------------------------
   * 6. CHAPTER 4 : THE MISSING PIECE
   * ---------------------------------------------------------------------------------------- */
  const MYSTERY = {
    setup: { title: 'The Missing Piece', line: 'Alex and Maya planned an important evening. Friday, eight o’clock, a table for two.',
      note: 'You are observers. You are not Alex or Maya. Look at the evidence and decide what you think.' },
    reveals: [
      { id: 'r1', label: 'Reveal 1: the message', kind: 'message', from: 'Alex', time: '7:52',
        text: 'Can’t make it tonight. Sorry. Let’s talk later.',
        facts: ['Alex sent a short message.', 'Maya is at the table.', 'The message says Alex cannot come tonight.'] },
      { id: 'r2', label: 'Reveal 2: the deadline', kind: 'email', from: 'Alex’s manager', time: '5:47',
        subject: 'Deadline moved',
        text: 'The client moved the deadline to tomorrow morning, nine o’clock. We need the final report tonight.',
        facts: ['A work deadline changed unexpectedly.', 'The email arrived before the message to Maya.', 'We still do not know if Alex tried to call.'] },
      { id: 'r3', label: 'Reveal 3: two memories', kind: 'memory',
        chat: [['Maya', 'Friday at eight? I will book the table by the river.'], ['Alex', 'Sounds good, if work stays calm.']],
        maya: 'We made a plan. The table is booked.', alex: 'We made a plan, but it depends on work.',
        facts: ['They talked about the plan earlier in the week.', 'They understood the agreement in different ways.', 'Both understandings are reasonable.'] }
    ],
    prompts: ['What do we know?', 'What are we assuming?', 'What else would you want to know?', 'Has your interpretation changed?'],
    interp: ['Something unexpected happened.', 'There was a misunderstanding.', 'Alex is avoiding a conversation.', 'Alex does not value the plan.', 'We need more information.'],
    interpLabel: { first: 'First interpretation', final: 'Final interpretation', side: 'Side by side', set: 'Record it', custom: 'Teacher note (typed)', why: 'What changed your thinking?' },
    why: ['A new fact', 'Another speaker’s point', 'I noticed an assumption', 'My view stayed the same, for clear reasons'],
    assumeIdeas: ['Alex does not care.', 'Alex had no time to call.', 'Alex is being honest.', 'Maya should have checked in.'],
    wonderIdeas: ['Did Alex try to call?', 'Has this happened before?', 'What did they agree about changing plans?', 'Could the plan move to another night?'],
    reward: 'Changing your mind because of evidence is a strength. Keeping your view for clear reasons is a strength too.',
    stretch: 'Stretch: what two questions could Alex and Maya ask each other next time, so a plan is clear for both?',
    demo: ['Sample answer (demo): We know Alex cancelled. We are assuming he does not care, but we do not know that.', 'Sample answer (demo): Now I think something unexpected happened at work.', 'Sample answer (demo): I still think it is a misunderstanding, because they remembered the plan differently.']
  };

  /* ------------------------------------------------------------------------------------------
   * 7. CHAPTER 5 : DEFEND IT, THEN CHALLENGE IT
   * ---------------------------------------------------------------------------------------- */
  const DEBATE = {
    note: 'These are debatable opinions, not facts. You do not have to believe them. You can say, one argument someone might make is …',
    scale: ['Strongly disagree', 'Disagree', 'It depends', 'Agree', 'Strongly agree'],
    rounds: [
      { id: 'r1', title: 'Round one', ask: 'Give your view and one reason.' },
      { id: 'r2', title: 'Round two', ask: 'Name a reasonable argument on the other side.' },
      { id: 'r3', title: 'Round three', ask: 'Explain an exception or a condition that matters.' }
    ],
    items: [
      { id: 'd1', s: 'Love is not enough for a successful relationship.',
        pro: 'Trust, respect, and shared goals also matter.', con: 'Deep love can motivate people to solve problems.', exc: 'It may depend on what we mean by love.',
        demo: 'Sample answer (demo): I agree, because love needs trust and respect to last. But I would agree less if the couple shares the same goals.' },
      { id: 'd2', s: 'People should stay friends with their exes.',
        pro: 'A shared history can become a respectful friendship.', con: 'Staying in contact can make it hard to move on.', exc: 'It may depend on how the relationship ended and who feels comfortable.',
        demo: 'Sample answer (demo): It depends. If both people are comfortable and respectful, friendship can work.' },
      { id: 'd3', s: 'Long-distance relationships can work well.',
        pro: 'Clear communication and trust can keep people close.', con: 'Small daily moments are hard to share from far away.', exc: 'It may depend on how long the distance lasts and whether there is a plan.',
        demo: 'Sample answer (demo): I agree, if there is an end date and both people communicate honestly.' },
      { id: 'd4', s: 'It is better to be single than to stay in the wrong relationship.',
        pro: 'Time alone can be healthier than a relationship that hurts.', con: 'Some problems can be solved with honesty and effort.', exc: 'It may depend on whether the problems can change and whether anyone is being mistreated.',
        demo: 'Sample answer (demo): I agree if the relationship is unhealthy, but I would not give up on a small problem.' }
    ],
    labels: { sample: 'Sample ideas', sampleHide: 'Hide ideas', before: 'Before', after: 'After', add: 'Add', minus: 'Remove', dependsAsk: 'It depends on … (name one specific condition)',
      pro: 'An argument for', con: 'An argument against', exc: 'An exception', roundDone: 'Round complete', next: 'Next round', nextS: 'Next statement' }
  };

  /* ------------------------------------------------------------------------------------------
   * 8. CHAPTER 6 : PRIORITIES
   * ---------------------------------------------------------------------------------------- */
  const TOKENS = {
    intro: 'You have ten tokens. Share them among four qualities for a fictional couple.',
    disclaimer: 'The tokens express priorities in a discussion exercise. They do not measure anyone’s worth or the health of a real relationship.',
    qualities: [
      { id: 'trust', w: 'Trust', hint: 'honesty and reliability' },
      { id: 'humor', w: 'Humor', hint: 'laughing together' },
      { id: 'ambition', w: 'Ambition', hint: 'goals and growth' },
      { id: 'support', w: 'Emotional support', hint: 'comfort and encouragement' }
    ],
    steps: ['Propose', 'Decide', 'Change', 'Redistribute', 'Compare'],
    ask1: 'Explain one trade-off: which quality did you give up, to give more to another?',
    ask2: 'Negotiate one group decision. What can everyone agree on?',
    circ: 'New circumstance: for six months, the couple will live in different cities while one of them studies.',
    ask3: 'Would you redistribute your tokens? Which quality needs more, and which can have less?',
    ask4: 'Which quality gained the most? Which lost the most? Why?',
    ask5: 'Can you explain your final allocation without assuming everyone has the same priorities?',
    labels: { left: 'tokens left', plus: 'Add', minus: 'Take', proposal: 'Proposal', group: 'Group decision', lock: 'Lock it in', locked: 'First allocation saved', reveal: 'Reveal the new circumstance',
      first: 'First allocation', second: 'After the change', reset: 'Clear tokens', copy: 'Start from the first allocation', full: 'All ten tokens are placed.' },
    demo: 'Sample answer (demo): We gave Trust four tokens and Emotional support three. We gave Ambition fewer because we want the couple to stay close.'
  };

  /* ------------------------------------------------------------------------------------------
   * 9. CHAPTER 7 : WHAT WOULD CHANGE YOUR MIND?
   * ---------------------------------------------------------------------------------------- */
  const CASES = {
    intro: 'Three short cases. Choose a position, then name one piece of information that could change your answer.',
    evidenceNames: { duration: 'Duration', plans: 'Shared plans', practical: 'Practical constraints', prefs: 'Personal preferences' },
    questions: ['Which detail mattered most?', 'What would make your first choice unreasonable?', 'Can you explain your decision without assuming everyone has the same priorities?'],
    items: [
      { id: 'c1', title: 'An excellent job offer abroad', scene: 'travel',
        setup: 'A partner receives an excellent job offer in another country. What would you recommend?',
        positions: ['Take the job and move together.', 'Take the job and try long distance.', 'Turn the job down and stay.'],
        ev: { duration: 'The job lasts eighteen months, with a possible extension.', plans: 'Next year, they planned to buy an apartment in their city.', practical: 'The partner could work remotely, but a visa would take four months.', prefs: 'One has dreamed of working abroad for years. The other loves their city and family.' },
        demo: 'Sample answer (demo): At first I would choose long distance. If the job lasted only six months, I would choose it even more strongly.' },
      { id: 'c2', title: 'Strong chemistry, different plans', scene: 'park',
        setup: 'Two people share strong chemistry, but they want different things in the long term. What would you recommend?',
        positions: ['Keep dating and see how plans change.', 'Talk openly about plans now, then decide.', 'End it before it gets harder.'],
        ev: { duration: 'They have been together for four months.', plans: 'One wants to settle in this city. The other wants to travel for several years.', practical: 'One person’s apartment lease ends in six months.', prefs: 'Both say they are open to compromise, but neither has described what it would look like.' },
        demo: 'Sample answer (demo): I would talk openly now. If they had been together for only a month, I would wait a little longer.' },
      { id: 'c3', title: 'Two ways to stay in touch', scene: 'phones',
        setup: 'One person enjoys frequent messages. The other prefers fewer, longer conversations. What would you recommend?',
        positions: ['The first person should adapt.', 'The second person should adapt.', 'They should create a routine in the middle.'],
        ev: { duration: 'They have communicated like this for two years. It only recently became a problem.', plans: 'They plan to move in together next year.', practical: 'One works long shifts and cannot check a phone until the evening.', prefs: 'One feels cared for by small check-ins. The other feels closest during long talks.' },
        demo: 'Sample answer (demo): I would choose a routine in the middle. If one person worked long shifts, I would suggest one longer call every evening.' }
    ],
    grammar: 'If + past simple, would + verb. Use it for imagined situations: If the job were short, I would …',
    labels: { choose: 'Choose a position', evidence: 'Choose one detail that could change your answer', reconsider: 'Reconsider', kept: 'Kept my choice', changed: 'Changed my choice', questions: 'Questions', nextCase: 'Next case', stretch: 'Stretch: describe a detail that would make every choice reasonable.', fresh: 'New detail' }
  };

  /* ------------------------------------------------------------------------------------------
   * 10. CHAPTER 8 : WOULD YOU RATHER
   * ---------------------------------------------------------------------------------------- */
  const RATHER = {
    intro: 'Choose a door. Give a reason. Another speaker asks a follow-up. Then, an optional twist.',
    steps: ['Choose', 'Reason', 'Follow-up', 'Response', 'Twist'],
    items: [
      { id: 'v1', q: 'Would you rather have …', a: 'A surprise trip together', b: 'A heartfelt letter every month', hyp: false,
        twist: 'The surprise trip requires giving up another plan you were excited about. Does that change your answer?', twist2: 'The letters would come for a whole year. Does that change your answer?',
        follow: ['What would make it feel personal?', 'What would you miss with the other choice?'],
        demo: 'Sample answer (demo): I would choose the letter, because it shows that someone thought carefully about me.' },
      { id: 'v2', q: 'Would you rather have …', a: 'Many shared hobbies', b: 'Different hobbies with shared values', hyp: false,
        twist: 'Your partner’s favorite hobby takes up every Saturday. Does that change your answer?', twist2: 'You have three hobbies in common, but different values about money. Does that change your answer?',
        follow: ['What would you do together on a free weekend?', 'How would you handle a hobby you do not enjoy?'],
        demo: 'Sample answer (demo): I would choose different hobbies with shared values, because we could still talk about what matters.' },
      { id: 'v3', q: 'Would you rather have …', a: 'One elaborate celebration', b: 'Small thoughtful gestures throughout the year', hyp: false,
        twist: 'The celebration would use the savings for a goal you share. Does that change your answer?', twist2: 'The small gestures would stop during busy months. Does that change your answer?',
        follow: ['What is an example of a thoughtful gesture?', 'Could one big moment include the small ones?'],
        demo: 'Sample answer (demo): I would choose small gestures. They show care in ordinary weeks, not only on special days.' },
      { id: 'v4', q: 'Would you rather …', a: 'Know what your future partner will be like', b: 'Discover that gradually', hyp: true,
        twist: 'You may ask exactly one question about your future partner before you decide. What would you ask?', twist2: 'If you knew, would you still want the same experiences along the way?',
        follow: ['Would knowing change how you behave?', 'What would you lose by knowing?'],
        demo: 'Sample answer (demo): I would discover it gradually, because getting to know someone is part of the connection.' }
    ],
    labels: { hyp: 'An imaginative hypothetical', twistBtn: 'Show the twist', twistAlt: 'Another twist', follow: 'Follow-up ideas', stretch: 'Stretch: argue for the choice you did not make.',
      support: 'Because …', done: 'Round complete', next: 'Next pair', clear: 'Clear', pick: 'Chose this door' }
  };

  /* ------------------------------------------------------------------------------------------
   * 11. CHAPTER 9 : MAKE YOUR CASE
   * ---------------------------------------------------------------------------------------- */
  const CASE = {
    intro: 'Three stages. Claim it. Face a follow-up. Respond with a target expression.',
    stages: [
      { id: 's1', title: 'Stage one: your claim', ask: 'Choose one quality that matters in a relationship and explain it.', time: 'Thirty to forty-five seconds' },
      { id: 's2', title: 'Stage two: a follow-up', ask: 'Another speaker asks a genuine follow-up question, or offers a respectful challenge.', time: 'About thirty seconds' },
      { id: 's3', title: 'Stage three: your response', ask: 'Respond using one target expression. Then strengthen your position, or revise it.', time: 'About forty-five seconds' }
    ],
    qualities: [
      { id: 'honesty', w: 'Honesty', p: ['Why does honesty matter when something is difficult to say?', 'When can honesty be unkind, and how can it be kind?', 'How can you recognize honesty early in a relationship?'] },
      { id: 'humor', w: 'Humor', p: ['Why does laughing together matter?', 'When might humor be less helpful?', 'Can people with different humor still connect?'] },
      { id: 'reliability', w: 'Reliability', p: ['What does reliability look like in a small everyday moment?', 'How do you rebuild trust after a missed promise?', 'Is reliability more important than excitement?'] },
      { id: 'curiosity', w: 'Curiosity', p: ['Why is curiosity about another person important?', 'How can people stay curious after many years?', 'What questions show real curiosity?'] },
      { id: 'kindness', w: 'Kindness', p: ['Why is kindness more than being polite?', 'Can someone be too kind? What does that look like?', 'How can you see kindness in the way someone treats strangers?'] },
      { id: 'patience', w: 'Patience', p: ['Why does patience matter during a disagreement?', 'When is patience not the right answer?', 'How can you practice patience under stress?'] },
      { id: 'independence', w: 'Independence', p: ['Why does independence help a relationship?', 'How can partners support each other’s separate goals?', 'When could independence become distance?'] },
      { id: 'shared', w: 'Shared values', p: ['Which shared values matter most to you?', 'Can people with different values still build a good relationship?', 'How can you discover someone’s values?'] },
      { id: 'support', w: 'Emotional support', p: ['What does emotional support sound like?', 'How do people support each other differently?', 'How can you offer support without solving the problem for the other person?'] },
      { id: 'respect', w: 'Respect', p: ['What does respect look like during an argument?', 'How is respect connected to boundaries?', 'Can there be love without respect?'] }
    ],
    challenges: ['Give an example.', 'Explain an exception.', 'Compare two possibilities.', 'Build on someone else’s point.'],
    followups: ['Could you give an example?', 'When would that be less important?', 'How is that different from …?', 'What would you say to someone who disagrees?'],
    goals: ['Gave a reason', 'Handled a follow-up', 'Used a target expression'],
    strengthen: 'I will strengthen my position', revise: 'I will revise my position',
    ack: 'Speaking goal complete',
    labels: { draw: 'Draw a quality', nextSpeaker: 'Next speaker', speaker: 'Speaker', record: 'Participation record~n', export: 'Export a copy', exportJ: 'Export a data file', exportC: 'Export a spreadsheet file', clear: 'Clear records', timer: 'Start the speaking timer', stage: 'Next stage', prompt: 'Another prompt', challenge: 'Draw a challenge card', target: 'Target expression', pick: 'Pick', setN: 'Number of speakers',
      limits: 'Saved only in this browser on this computer. Use first names, numbers, or initials only.' },
    demo: 'Sample answer (demo): I would choose reliability. It matters because trust grows when people do what they say. A follow-up could be: when is reliability less important?'
  };

  /* ------------------------------------------------------------------------------------------
   * 12. CHAPTER 10 : FINAL TAKEAWAY
   * ---------------------------------------------------------------------------------------- */
  const FINAL = {
    intro: 'One last turn. Complete one sentence.',
    stems: ['One idea I reconsidered today was …', 'One question worth asking before making assumptions is …', 'One quality I would prioritize is … because …'],
    final: 'Now add a final response. Use two target expressions and ask one follow-up question.',
    checklist: ['Clear ideas', 'Interaction with others', 'Vocabulary from the lesson', 'Relevant language accuracy'],
    checkNote: 'Optional teacher checklist. It stays on this computer, and it is not shown to students unless you choose to share it.',
    close: 'Keep Speaking. Keep Growing.',
    labels: { used: 'Used', ask: 'Asked a follow-up', stems: 'Choose a sentence', checklist: 'Teacher checklist', closeBtn: 'Close the lesson', thanks: 'Thank you for speaking today.' },
    demo: 'Sample answer (demo): One idea I reconsidered today was that commitment can be small. If both people stay compatible and work things out, what else keeps a relationship strong?'
  };

  /* ------------------------------------------------------------------------------------------
   * 13. NARRATION SCRIPT  (who: nar | alex | maya | sam | nora)
   * Narration stays short and never plays during student discussion.
   * ---------------------------------------------------------------------------------------- */
  const NAR = {
    'ch1.q': { who: 'nar', text: 'What makes a connection worth keeping?' },

    'ch2.intro': { who: 'nar', text: 'Choose a side. You can say, it depends, if you tell us what it depends on. And you can always pass.' },
    'ch2.q1': { who: 'nar', text: 'Strong chemistry, or strong communication?' },
    'ch2.q2': { who: 'nar', text: 'Similar interests, or different perspectives?' },
    'ch2.q3': { who: 'nar', text: 'Big romantic gestures, or consistent small actions?' },
    'ch2.q4': { who: 'nar', text: 'More time together, or more personal space?' },
    'ch2.t1': { who: 'nar', text: 'Would your answer change after five years?' },
    'ch2.t2': { who: 'nar', text: 'Which would matter more during a disagreement?' },
    'ch2.t3': { who: 'nar', text: 'Could someone show this in a way you would not immediately recognize?' },
    'ch2.t4': { who: 'nar', text: 'Would your answer change if one person had a very stressful month at work?' },

    'ch3.intro': { who: 'nar', text: 'Five useful words and phrases. Watch a short scene, check the meaning, and then talk.' },
    'chem.1': { who: 'maya', text: 'Wait, you love that author too?' },
    'chem.2': { who: 'alex', text: 'I could talk about her books all night.' },
    'chem.n': { who: 'nar', text: 'From the first conversation, there was real chemistry between them.' },
    'comm.1': { who: 'alex', text: 'Honestly, we could stop here.' },
    'comm.2': { who: 'maya', text: 'We said we would finish it. One more try?' },
    'comm.n': { who: 'nar', text: 'Even when it was hard, they showed commitment by staying and trying again.' },
    'affe.1': { who: 'sam', text: 'You always notice when I am cold.' },
    'affe.2': { who: 'nora', text: 'Of course I do.' },
    'affe.n': { who: 'nar', text: 'They are very affectionate with each other.' },
    'comp.n': { who: 'nar', text: 'Alex wakes up at six. Maya is a night owl. But they are compatible, because they respect each other and want similar things.' },
    'work.1': { who: 'maya', text: 'I felt ignored last night.' },
    'work.2': { who: 'alex', text: 'I am sorry. I did not realize. Let us talk.' },
    'work.n': { who: 'nar', text: 'It took time, but they worked things out.' },

    'ch4.intro': { who: 'nar', text: 'Alex and Maya planned an important evening. Friday, eight o’clock, a table for two.' },
    'ch4.r1a': { who: 'nar', text: 'At seven fifty-two, Maya’s phone buzzes.' },
    'ch4.r1b': { who: 'alex', text: 'Can’t make it tonight. Sorry. Let’s talk later.' },
    'ch4.r2': { who: 'nar', text: 'Across the city, Alex is still at his desk. At five forty-seven, an email arrived: the client moved the deadline to tomorrow morning.' },
    'ch4.r3': { who: 'nar', text: 'Earlier that week, they had planned the evening by text. Each of them remembered the plan a little differently.' },

    'ch5.intro': { who: 'nar', text: 'Defend it, then challenge it. Remember: these are debatable opinions, not facts.' },
    'ch6.intro': { who: 'nar', text: 'Ten tokens. Four qualities. One group decision.' },
    'ch6.circ': { who: 'nar', text: 'New circumstance. For the next six months, the couple will live in different cities while one of them studies.' },
    'ch7.intro': { who: 'nar', text: 'Three short cases. Choose a position, then find the one detail that could change your mind.' },
    'ch8.intro': { who: 'nar', text: 'Would you rather? Choose a door, give a reason, and expect a twist.' },
    'ch8.hyp': { who: 'nar', text: 'This last one is an imaginative hypothetical.' },
    'ch9.intro': { who: 'nar', text: 'Make your case. Claim it, face a follow-up, and respond with a target expression.' },
    'ch10.intro': { who: 'nar', text: 'One last turn. Complete one sentence, then add a final response.' },
    'ch10.close': { who: 'nar', text: 'Keep speaking. Keep growing.' }
  };

  /* Character voices (see docs/VOICES.md). Kokoro-82M, Apache-2.0, run locally. */
  const VOICES = { nar: 'af_heart', maya: 'af_bella', alex: 'am_michael', sam: 'am_onyx', nora: 'af_nova' };

  /* Teacher-interface labels (rendered with IPA like everything else). */
  const UI = {
    names: { nar: 'Narrator', alex: 'Alex', maya: 'Maya', sam: 'Sam', nora: 'Nora' },
    bar: { back: 'Back', next: 'Next', play: 'Play', pause: 'Pause', replay: 'Replay', chapters: 'Chapters', timer: 'Timer', words: 'Words', starters: 'Starters', sound: 'Sound',
      mode: 'Mode', class: 'Class', demo: 'Demo', full: 'Full screen', exit: 'Exit full screen', hide: 'Hide controls', show: 'Show controls', plan: 'Plan', notes: 'Notes' },
    modeClass: 'Class Mode: every reveal waits for you.',
    modeDemo: 'Demo Mode: sample answers are clearly labeled.',
    voice: { voice: 'Recorded voice', teacher: 'Teacher reads', off: 'Narration off' },
    timer: { start: 'Start', pause: 'Pause', reset: 'Reset', add: 'Add fifteen seconds', sub: 'Take away fifteen seconds', done: 'Time is up. Nothing moves until you click.', use: 'Use suggested time', off: 'Hide timer' },
    sound: { volume: 'Volume', music: 'Music', musicVol: 'Music volume', reduced: 'Reduce motion', voiceMode: 'Narration' },
    drawer: { close: 'Close', vocab: 'Word bank', starters: 'Sentence starters', chapters: 'Chapters and plan', notes: 'Teacher notes' },
    honest: 'This app does not listen to students or judge pronunciation. The teacher operates it while students speak.',
    teacherNote: 'Teacher notes stay on this computer. Typed text is not transcribed.',
    totals: 'Planned time',
    speakTotals: 'Planned student speaking',
    minutes: 'minutes',
    demoNote: 'Demo sample',
    demoSpeed: 'Demo timer length',
    demoAuto: 'Autoplay the demo',
    reducedNote: 'Reduced motion is on.'
  };

  global.LC = { PLAN, STARTERS, BANK, TARGETS, OPENING, WARM, WORDS, MYSTERY, DEBATE, TOKENS, CASES, RATHER, CASE, FINAL, NAR, VOICES, UI };
})(window);
