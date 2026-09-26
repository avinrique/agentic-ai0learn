import { ConceptStep } from '@/stores/conceptStore';

// ===== Lesson 19: Why a Team of Agents? =====
export const whyTeamsSteps: ConceptStep[] = [
  // Step 0
  {
    explanation: "What's new in Part 4: instead of one agent, a small team of agents. Look at the three things you'll learn, and meet the robots you'll see all through Part 4.",
    animationTrigger: 'intro',
    subtitle: 'Many agents, one job.',
  },
  // Step 1
  {
    explanation: 'The school newsletter needs an article about volcanoes. Solo Bot has to research it, write it, check the facts and make it fun, all by itself.',
    animationTrigger: 'hook',
    subtitle: 'Four jobs, one robot.',
  },
  // Step 2
  {
    explanation: "Watch Solo Bot's system prompt card grow. Every job adds more rules, and the card gets so long that Solo Bot gets tired just reading it.",
    animationTrigger: 'bigPrompt',
    subtitle: 'One prompt trying to do everything.',
  },
  // Step 3
  {
    explanation: 'Look at the article: a wrong fact slipped in (Everest is not a volcano!) and the style is messy. Too many rules to juggle, and nobody double-checked.',
    animationTrigger: 'mistakes',
    subtitle: 'Too much at once leads to mistakes.',
  },
  // Step 4
  {
    explanation: 'The fix is what your class does for a group project: split the job. One big job turns into three small ones, each with its own helper.',
    animationTrigger: 'split',
    subtitle: 'Split the job, like a group project.',
  },
  // Step 5
  {
    explanation: 'Meet Rita (finds facts), Wally (writes) and Cora (checks). Look at their cards: each one has a SHORT system prompt about one job only.',
    animationTrigger: 'meetTeam',
    subtitle: 'Each agent = one focused job.',
  },
  // Step 6
  {
    explanation: "Let's open Rita up. Inside there is no magic: the LLM, her own system prompt, her own search tool, and her own messages list.",
    animationTrigger: 'insideAgent',
    subtitle: 'Agent = LLM + its own prompt (+ tools) + its own messages.',
  },
  // Step 7
  {
    explanation: 'All three use the SAME brain (the same LLM). Only the instruction card changes, like one actor wearing three different costumes.',
    animationTrigger: 'sameBrain',
    subtitle: 'Same brain, different instruction card.',
  },
  // Step 8
  {
    explanation: "How do agents talk? They don't, by magic. Our Python code is the mail carrier: it takes Rita's notes (just text) and hands them to Wally as his task.",
    animationTrigger: 'mailCarrier',
    subtitle: 'Agents "talk" = our code passes text along.',
  },
  // Step 9
  {
    explanation: 'The relay race starts. Rita searches and writes short notes. Read her sticky note: five true facts about volcanoes.',
    animationTrigger: 'relayResearch',
    subtitle: 'Leg 1: Rita finds the facts.',
  },
  // Step 10
  {
    explanation: 'Our code carries the note to Wally. He turns it into a fun article, but look: he added a "fun fact" that is not in the notes.',
    animationTrigger: 'relayWrite',
    subtitle: 'Leg 2: Wally writes the draft.',
  },
  // Step 11
  {
    explanation: 'Cora compares the draft with Rita\'s notes. She catches it: "Everest is a volcano" is wrong! Her feedback note goes back to Wally.',
    animationTrigger: 'relayCheck',
    subtitle: 'Leg 3: Cora checks.',
  },
  // Step 12
  {
    explanation: 'Wally fixes the line and the article goes into the newsletter. Look at the counter: that took 4 LLM calls instead of 1.',
    animationTrigger: 'relayDone',
    subtitle: 'A better article, made by a team.',
  },
  // Step 13
  {
    explanation: 'Why teams help: each agent stays focused, you can fix one agent without touching the others, they check each other, and some can work at the same time.',
    animationTrigger: 'pros',
    subtitle: 'The good part.',
  },
  // Step 14
  {
    explanation: 'The honest part: more calls cost more money and take more time, and more parts can break. You would not hire five people to make a sandwich.',
    animationTrigger: 'cons',
    subtitle: 'Simple job? One agent is enough.',
  },
  // Step 15
  {
    explanation: 'Try it: pick a job, switch robots on or off, and press Run. Watch the relay, then read the scorecard: quality, API calls, time and a verdict.',
    animationTrigger: 'playground',
    subtitle: 'Does this job really need a team?',
  },
  // Step 16
  {
    explanation: 'What you learned: (1) One agent doing everything gets overloaded. (2) Each agent is just an LLM with its own short prompt. (3) Our code passes text between them.',
    animationTrigger: 'takeaways',
    subtitle: 'Use a team only when the job is big enough.',
  },
];

// ===== Lesson 20: Team Shapes: How Agents Work Together =====
export const teamShapesSteps: ConceptStep[] = [
  // Step 0
  {
    explanation: "What you'll learn: four ways to organise a team of agents. Each card shows a shape and the everyday thing it works like.",
    animationTrigger: 'intro',
    subtitle: 'New today: same robots, four ways to pass the notes.',
  },
  // Step 1
  {
    explanation: 'Shape 1, the assembly line: like a car factory or a relay race. Each robot does one job, then passes the work to the next one.',
    animationTrigger: 'lineIdea',
    subtitle: 'Always the same order.',
  },
  // Step 2
  {
    explanation: 'Task: make an octopus fact card. Rita goes first. Read her sticky note flying to Wally: it is just the text her LLM call returned.',
    animationTrigger: 'lineRun1',
    subtitle: 'Call 1: Rita finds the facts.',
  },
  // Step 3
  {
    explanation: 'Wally turns the facts into a card and passes it to Cora, who polishes it. Three calls, always in this order. Great when the steps never change.',
    animationTrigger: 'lineRun2',
    subtitle: 'Calls 2 and 3: write, then polish.',
  },
  // Step 4
  {
    explanation: "Shape 2, boss & helpers: like a head chef calling out orders. Max 👑 doesn't cook. He reads the request and decides which helpers to ask.",
    animationTrigger: 'bossIdea',
    subtitle: 'The boss plans; the helpers work.',
  },
  // Step 5
  {
    explanation: "Look at Max's reply on the right: tool calls, just like Part 2! But each 'tool' is another agent. He picks Milo for the cost and Wally for the invite.",
    animationTrigger: 'bossPlan',
    subtitle: 'The tools are other agents.',
  },
  // Step 6
  {
    explanation: "Our code runs each chosen helper and sends their answers back up to Max. Rita and Cora stay asleep: this request didn't need them.",
    animationTrigger: 'bossCollect',
    subtitle: 'Only the chosen helpers are called.',
  },
  // Step 7
  {
    explanation: 'Max writes one final reply from the answers. A different request would get different helpers. Use a boss when the steps change from request to request.',
    animationTrigger: 'bossFinal',
    subtitle: '1 plan + 2 helpers + 1 final = 4 calls.',
  },
  // Step 8
  {
    explanation: "Shape 3, the receptionist: like a hospital front desk. Rosa 🛎️ doesn't answer questions herself. She sends each one to exactly ONE specialist.",
    animationTrigger: 'routerIdea',
    subtitle: 'Pick one expert, then step aside.',
  },
  // Step 9
  {
    explanation: 'Rosa replies with one word, “math”, so our code sends the question to Milo. Only 2 calls: cheap and fast. See more examples on the right.',
    animationTrigger: 'routerRun',
    subtitle: 'One label, one expert, one answer.',
  },
  // Step 10
  {
    explanation: 'Shape 4, writer & critic: like a teacher marking homework. Wally writes, Cora marks it with a red pen, Wally fixes it. Round and round.',
    animationTrigger: 'criticIdea',
    subtitle: 'Write → review → fix → repeat.',
  },
  // Step 11
  {
    explanation: "Round 1: Wally's first dragon story is short and dull. Read Cora's red-pen note at the bottom: she says exactly what to fix.",
    animationTrigger: 'criticRound1',
    subtitle: 'A good critic gives clear, fixable notes.',
  },
  // Step 12
  {
    explanation: 'Round 2: Wally fixes it and Cora writes “APPROVED”. Our code spots that word and stops the loop. 4 calls in total.',
    animationTrigger: 'criticRound2',
    subtitle: 'The magic word ends the loop.',
  },
  // Step 13
  {
    explanation: 'What if Cora is never happy? Without a limit (left) the loop never ends and the bill keeps growing. So we stop after MAX_ROUNDS and keep the latest draft.',
    animationTrigger: 'criticLimit',
    subtitle: 'Always set a maximum number of rounds.',
  },
  // Step 14
  {
    explanation: 'All four shapes side by side. Read the “Use it when…” column: pick the shape that matches how your task behaves.',
    animationTrigger: 'compare',
    subtitle: 'Match the shape to the job.',
  },
  // Step 15
  {
    explanation: "Teams can share a whiteboard: a plain list our code keeps. Rita and Milo write to it, then Wally reads it all to make the plan. That's shared memory.",
    animationTrigger: 'whiteboard',
    subtitle: 'Shared memory = a list everyone reads.',
  },
  // Step 16
  {
    explanation: 'An honest warning: every extra agent means another call, more cost, more waiting, and one more place for a mistake. Watch a wrong fact travel down the line.',
    animationTrigger: 'warning',
    subtitle: 'More agents is not automatically better.',
  },
  // Step 17
  {
    explanation: 'Your turn: pick a request and a team shape, then watch the notes fly. Check the API-call counter and the verdict: does this shape fit this request?',
    animationTrigger: 'playground',
    subtitle: 'Try an assembly line on 15 × 12, then a receptionist.',
  },
  // Step 18
  {
    explanation: 'What you learned: (1) four shapes: assembly line, boss & helpers, receptionist, writer & critic. (2) Each agent is just an LLM call; our code passes notes. (3) Pick the simplest shape that fits.',
    animationTrigger: 'takeaways',
    subtitle: 'Simple shapes, clear jobs, few calls.',
  },
];
