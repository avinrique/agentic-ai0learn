import { ConceptStep } from '@/stores/conceptStore';

// ===== Lesson 5: Writing Good Prompts =====
// Running example: Mia asks Solo Bot for help with her science-fair poster, and her
// prompt gets one new ingredient per step. All answers are prepared examples.
export const promptWritingSteps: ConceptStep[] = [
  // Step 0
  {
    explanation: "New today: the message you type to the AI. Look at the three things you'll learn, then we'll build one great prompt, ingredient by ingredient.",
    animationTrigger: 'intro',
    subtitle: 'Clear prompt in, useful answer out.',
  },
  // Step 1
  {
    explanation: "Look at Solo Bot's guesses. 'Write about dogs' could mean a poem, a report or tips. It can't read your mind, so it writes the most typical, average text.",
    animationTrigger: 'vague',
    subtitle: 'The AI only knows what you tell it.',
  },
  // Step 2
  {
    explanation: 'Same topic, clearer prompt. The coloured parts say what to make, who it is for and what shape it should have. Compare the two answers side by side.',
    animationTrigger: 'clear',
    subtitle: 'Vague in, vague out. Clear in, useful out.',
  },
  // Step 3
  {
    explanation: "A good prompt is like a recipe. Each of these six ingredients answers a question the AI can't answer by itself. You won't always need all six.",
    animationTrigger: 'recipe',
    subtitle: 'Task, role, context, format, examples, limits.',
  },
  // Step 4
  {
    explanation: "Meet Mia. She needs text for her science-fair poster and types 'help with my poster'. Solo Bot has to ask what it's about, and the clarity meter is almost empty.",
    animationTrigger: 'poster0',
    subtitle: 'Our running example.',
  },
  // Step 5
  {
    explanation: 'Start with the task: a clear action verb and a topic. Now the answer is about the right thing, but look how long and hard it is.',
    animationTrigger: 'addTask',
    subtitle: '🎯 Task: say exactly what to do.',
  },
  // Step 6
  {
    explanation: "Add a role: 'You are a friendly science teacher.' You met roles in system prompts, and they work in any message. The voice gets warmer, but it's still long.",
    animationTrigger: 'addRole',
    subtitle: '🎭 Role: who the AI should be.',
  },
  // Step 7
  {
    explanation: 'Add context: how old Mia is, what her experiment was, and who will read the poster. Now the answer is about HER beans, not plants in general.',
    animationTrigger: 'addContext',
    subtitle: '🧭 Context: who it is for, and why.',
  },
  // Step 8
  {
    explanation: 'Add the format: a title and three boxes, two sentences each. Look at the answer: it now has the shape of a poster instead of an essay.',
    animationTrigger: 'addFormat',
    subtitle: '📐 Format: length, bullets, table or JSON.',
  },
  // Step 9
  {
    explanation: "Add an example of a title Mia likes. The AI copies its style: short, a question, one emoji. Giving examples is called few-shot prompting, and you'll use it later.",
    animationTrigger: 'addExample',
    subtitle: "💡 Examples: show, don't just tell.",
  },
  // Step 10
  {
    explanation: "Add limits: what to include or leave out. The fun fact appears at the end, but look closely: the hard word 'auxin' is still there.",
    animationTrigger: 'addLimits',
    subtitle: '🚧 Limits: include this, avoid that.',
  },
  // Step 11
  {
    explanation: "Why did 'auxin' stay? 'No hard science words' only says what to avoid. 'Use words a 10-year-old knows' gives a clear target, and 'auxin' is gone.",
    animationTrigger: 'sayDo',
    subtitle: 'Say what TO do, not only what not to do.',
  },
  // Step 12
  {
    explanation: 'Mia pastes her lab notes. Without a fence, the AI obeys a note inside them. Wrap pasted text in triple quotes or ### so it knows where the text starts and ends.',
    animationTrigger: 'delimiters',
    subtitle: 'Fence off pasted text.',
  },
  // Step 13
  {
    explanation: 'For maths or reasoning, ask it to work step by step and show its steps. Each step it writes becomes text it builds on, like scrap paper, and you can check every line.',
    animationTrigger: 'stepByStep',
    subtitle: 'Ask for the working, not just the answer.',
  },
  // Step 14
  {
    explanation: "Prompts are drafts. Write, test, look at the answer, fix one thing, repeat. Look at Mia's versions: each small fix pushed the clarity meter up.",
    animationTrigger: 'iterate',
    subtitle: 'Your first prompt is a first draft.',
  },
  // Step 15
  {
    explanation: 'Three common mistakes: too vague, too many tasks at once, and rules that fight each other. Read the fix under each one.',
    animationTrigger: 'mistakes',
    subtitle: 'Be specific, one job at a time, no contradictions.',
  },
  // Step 16
  {
    explanation: 'Try it: pick a messy prompt and switch ingredients on or off. Watch the prompt grow, read the new answer, and follow the tip to fill the clarity meter.',
    animationTrigger: 'playground',
    subtitle: 'Fix a prompt, one ingredient at a time.',
  },
  // Step 17
  {
    explanation: 'What you learned: (1) The AI only knows what you tell it. (2) Add ingredients: task, role, context, format, examples, limits. (3) Fence pasted text, ask for steps, and keep improving drafts.',
    animationTrigger: 'takeaways',
    subtitle: 'A prompt is a recipe, and every recipe gets tested.',
  },
];
