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
