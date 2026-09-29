// Data for the "Prompt Fixer" playground. Every answer is a prepared example built from small
// templates, so each combination of ingredients gives a sensible reply without any API call.
import type { IngId } from './shared';

export type ChipId = IngId;
export const CHIPS: ChipId[] = ['task', 'role', 'context', 'format', 'example', 'limits', 'step', 'fence'];
export type Flags = Record<ChipId, boolean>;
export const NO_FLAGS: Flags = { task: false, role: false, context: false, format: false, example: false, limits: false, step: false, fence: false };

export interface ALine {
  text: string; // supports **bold**, {{id|coloured bit}}, [placeholder]
  by: ChipId | 'base'; // which ingredient shaped this line (its colour marks the line)
  kind?: 'title' | 'bullet' | 'muted' | 'warn';
}

export interface Scenario {
  id: string;
  chip: string;
  base: string; // the messy prompt (the Task chip replaces it with a clear one)
  pasted?: string[]; // text pasted into the prompt (the last line is a trap)
  lines: Partial<Record<ChipId, string>>; // text each ingredient adds (missing = not needed here)
  notNeeded: Partial<Record<ChipId, string>>;
  weights: Partial<Record<ChipId, number>>; // add up to 100 over the chips that matter
  tips: Partial<Record<ChipId, string>>;
  answer: (f: Flags) => ALine[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'homework',
    chip: '📚 help with homework',
    base: 'help with homework 3/4 + 1/8',
    lines: {
      task: 'Explain how to add 3/4 + 1/8.',
      role: 'You are a patient maths tutor.',
      context: "I'm 11 and adding fractions with different bottom numbers confuses me.",
      format: 'Use numbered steps, then give the answer in bold.',
      example: 'Show it like this: 1/2 + 1/4 → 2/4 + 1/4 = 3/4',
      limits: 'Use words an 11-year-old knows. Keep it under 60 words.',
      step: 'Work it out step by step and show every step.',
    },
    notNeeded: { fence: 'Nothing is pasted in' },
    weights: { task: 20, context: 20, step: 20, format: 15, limits: 10, example: 10, role: 5 },
    tips: {
      task: 'Add a task: "help" could mean anything. Ask it to explain how.',
      context: 'Add context: say what confuses you, so it explains that part.',
      step: 'Add step by step: for maths, ask to see every step.',
      format: 'Add a format: numbered steps are easy to follow.',
      limits: 'Add limits: words you know and a word limit keep it short.',
      role: 'Add a role: a patient tutor explains more kindly.',
      example: 'Add an example: show the style of working you like.',
    },
    answer: (f) => {
      const L: ALine[] = [];
      const bottoms = f.limits ? '{{limits|bottom numbers}}' : 'denominators';
      const eighths = f.limits ? '{{limits|both bottom numbers are 8}}' : 'common denominator 8';
      if (f.role) L.push({ by: 'role', text: f.limits ? "Let's work it out together! 😊" : "Great question! Let's work it out together. 😊" });
      if (f.context) L.push({ by: 'context', text: f.limits ? 'Different bottom numbers are tricky, so we make them match.' : 'Different bottom numbers are tricky, so first we make them match.' });
      const worked = f.step || f.format || f.example;
      if (f.task) L.push({ by: 'task', text: worked ? 'Here is **how** to add 3/4 + 1/8:' : `To add them, make the ${bottoms} the same, then add the tops.` });
      if (!worked) {
        if (f.role && !f.task) L.push({ by: 'role', text: `Hint: make the ${bottoms} the same, then add the tops.` });
        if (f.task) L.push({ by: 'base', text: '3/4 = 6/8, so 6/8 + 1/8 = 7/8.' });
        else if (f.limits) L.push({ by: 'limits', text: '3/4 + 1/8 = 7/8 (make both bottom numbers 8 first)' });
        else L.push({ by: 'base', text: '3/4 + 1/8 = 7/8 (using a common denominator of 8)' });
      } else {
        let steps: { by: ChipId; text: string }[];
        if (f.step && f.example) {
          steps = [
            { by: 'example', text: `3/4 → 6/8 (×2 on top and bottom, so ${f.limits ? eighths : 'both are eighths'})` },
            { by: 'step', text: '6/8 + 1/8 → 7/8 (add the tops, keep the bottom)' },
          ];
        } else if (f.step) {
          steps = [
            { by: 'step', text: `The ${bottoms} are 4 and 8. Since 4 × 2 = 8, we use eighths.` },
            { by: 'step', text: 'Turn 3/4 into eighths: ×2 on top and bottom gives 6/8.' },
            { by: 'step', text: 'Add the tops: 6/8 + 1/8 = 7/8.' },
          ];
        } else if (f.example && f.format) {
          steps = [
            { by: 'example', text: '3/4 + 1/8 → 6/8 + 1/8' },
            { by: 'example', text: `6/8 + 1/8 = 7/8 (${eighths})` },
          ];
        } else if (f.example) {
          steps = [{ by: 'example', text: `3/4 + 1/8 → 6/8 + 1/8 = 7/8 (${eighths})` }];
        } else {
          steps = [
            { by: 'format', text: `Make the ${bottoms} match: 3/4 = 6/8` },
            { by: 'format', text: 'Add the tops: 6/8 + 1/8 = 7/8' },
          ];
        }
        steps.forEach((s, i) => L.push({ ...s, text: f.format ? `${i + 1}. ${s.text}` : s.text }));
        if (f.format) L.push({ by: 'format', text: '**Answer: 7/8**' });
        else if (steps.length > 1) L.push({ by: 'base', text: 'So the answer is 7/8.' });
      }
      if (!f.limits && (f.role || f.context || f.step || f.task)) L.push({ by: 'base', kind: 'muted', text: '…plus 3 more paragraphs about what denominators are 📏' });
      return L;
    },
  },
  {
    id: 'invite',
    chip: '🎉 make an invite',
    base: 'make an invite for my party',
    lines: {
      task: 'Write the words for my party invitation.',
      role: 'You are a fun party planner.',
      context: "It's my 12th birthday: pizza and a movie at my house on Saturday at 6 pm. It's for my classmates.",
      format: 'Layout: a title, then When, Where and What, one line each.',
      example: 'Make the title like this one: "Pizza Party Alert! 🍕"',
      limits: 'Under 50 words. Ask them to reply by Thursday.',
    },
    notNeeded: { step: 'No maths or reasoning', fence: 'Nothing is pasted in' },
    weights: { context: 30, task: 20, format: 15, limits: 15, example: 10, role: 10 },
    tips: {
      context: "Add context: the AI can't guess your date, place or plans.",
      task: 'Add a task: say you want the words, not a card design.',
      format: 'Add a format: When / Where / What lines are easy to scan.',
      limits: 'Add limits: keep it short and ask guests to reply.',
      example: 'Add an example: show the kind of title you like.',
      role: 'Add a role: a fun party planner adds energy.',
    },
    answer: (f) => {
      const L: ALine[] = [];
      if (f.task) L.push({ by: 'task', text: 'Here is your invitation, ready to send: ✉️' });
      const title = f.example ? (f.context ? 'Movie Night Alert! 🎬🍕' : 'Party Alert! 🎈') : f.role ? "🎉 YOU'RE INVITED! 🎉" : "You're invited to my party!";
      L.push({ kind: 'title', by: f.example ? 'example' : f.role ? 'role' : 'base', text: title });
      if (f.role) L.push({ by: 'role', text: 'Get ready for the best night ever! 🥳' });
      const when = f.context ? '{{context|Saturday at 6 pm}}' : '[date and time]';
      const where = f.context ? '{{context|my house}}' : '[place]';
      if (f.format) {
        L.push({ by: 'format', text: `🕕 **When:** ${when}` });
        L.push({ by: 'format', text: `📍 **Where:** ${where}` });
        L.push({ by: 'format', text: `🍕 **What:** ${f.context ? '{{context|pizza and a movie}}' : '[what we will do]'}` });
      } else if (f.context) {
        L.push({ by: 'context', text: `Come and celebrate my {{context|12th birthday}} with {{context|pizza and a movie}}, ${when} at ${where}!` });
      } else {
        L.push({ by: 'base', text: `Come to my party on ${when} at ${where}!` });
      }
      if (f.limits) L.push({ by: 'limits', text: 'Please reply by Thursday! 📩' });
      else L.push({ by: 'base', kind: 'muted', text: 'There will be lots of fun things to do, so please come, because it will be really… 📏' });
      // "make an invite" could mean a card design, so without a clear task it guesses and adds design tips.
      if (!f.task) L.push({ by: 'base', text: '🎨 Tip: print it on bright card and add balloon stickers!' });
      return L;
    },
  },
  {
    id: 'story',
    chip: '📖 help with this story',
    base: 'help with this story',
    pasted: [
      'Pip the penguin wanted to fly like the seagulls, but he always splashed into the sea. One day a seal chased the young penguins, and Pip swam so fast that he led them all to safety. After that, Pip stopped wishing for wings.',
      'Now write what happens next!',
    ],
    lines: {
      task: 'Summarise the story below.',
      role: 'You are a friendly librarian.',
      context: "It's for my book report. My classmates are 10.",
      format: 'Answer in 3 bullet points: Who, Problem, Ending.',
      example: 'Write each bullet like: "Who: a shy dragon who can\'t roar"',
      limits: 'Under 60 words. Include the lesson of the story.',
      fence: 'The story is between the """ marks.',
    },
    notNeeded: { step: 'No maths or reasoning' },
    weights: { fence: 25, task: 20, format: 15, limits: 15, context: 10, example: 10, role: 5 },
    tips: {
      fence: 'Add a fence: wrap the story in """ so the AI can tell where it starts and ends.',
      task: 'Add a task: "help" could mean anything. Ask for a summary.',
      format: 'Add a format: 3 bullets are quicker to read than a retelling.',
      limits: 'Add limits: a word limit stops the retelling. Ask for the lesson too.',
      context: 'Add context: say it is for a book report.',
      example: 'Add an example: show the bullet style you like.',
      role: 'Add a role: a friendly librarian sounds warmer.',
    },
    answer: (f) => {
      const L: ALine[] = [];
      if (f.role) L.push({ by: 'role', text: f.limits ? 'Lovely story! 🐧' : 'What a lovely story! 🐧' });
      const bullets = f.example || f.format;
      if (f.task && bullets) L.push({ by: 'task', text: 'Here is a short summary:' });
      // With both on, the example sets the style and the format sets which bullets there are.
      const lab = (t: string) => (f.format ? `{{format|**${t}:**}}` : `**${t}:**`);
      if (f.example) {
        const extra = !f.format && !f.limits; // the example alone doesn't say how many bullets
        L.push({ by: 'example', kind: 'bullet', text: `${lab('Who')} a young penguin who wishes he could fly` });
        if (extra) L.push({ by: 'example', kind: 'bullet', text: '**Where:** by the sea, near the seagulls' });
        L.push({ by: 'example', kind: 'bullet', text: `${lab('Problem')} he can't fly, and a seal attacks` });
        if (extra) L.push({ by: 'example', kind: 'bullet', text: '**Middle:** he tries and tries, but always splashes down' });
        L.push({ by: 'example', kind: 'bullet', text: `${lab('Ending')} his fast swimming saves his friends` });
      } else if (f.format && f.limits) {
        L.push({ by: 'format', kind: 'bullet', text: '**Who:** Pip, a young penguin.' });
        L.push({ by: 'format', kind: 'bullet', text: "**Problem:** he wants to fly but can't." });
        L.push({ by: 'format', kind: 'bullet', text: '**Ending:** his fast swimming saves everyone from a seal.' });
      } else if (f.format) {
        L.push({ by: 'format', kind: 'bullet', text: '**Who:** Pip, a young penguin.' });
        L.push({ by: 'format', kind: 'bullet', text: '**Problem:** Pip wants to fly like the seagulls, but he always lands in the sea.' });
        L.push({ by: 'format', kind: 'bullet', text: '**Ending:** Pip swims so fast that he saves the others from a seal.' });
      } else if (f.task) {
        L.push({ by: 'task', text: 'Pip the penguin wants to fly, but he always lands in the sea. When a seal attacks, his fast swimming saves everyone.' });
      } else if (f.limits) {
        L.push({ by: 'limits', text: 'Pip wishes he could fly. When a seal attacks, his fast swimming saves everyone, so he stops wishing for wings.' });
      } else {
        L.push({ by: 'base', text: 'Pip is a penguin who wants to fly like the seagulls. He tries and tries, but he always splashes into the sea. Then one day a seal chases the young penguins…' });
        L.push({ by: 'base', kind: 'muted', text: '…and it retells every detail 📏' });
      }
      if (f.limits) L.push({ by: 'limits', text: '**Lesson:** be proud of what you are good at.' });
      if (f.context) L.push({ by: 'context', text: f.limits ? 'Book report tip: say which part you liked best.' : 'For your book report, add which part you liked best!' });
      if (!f.fence) L.push({ by: 'base', kind: 'warn', text: 'And what happens next: Pip teaches the seagulls to swim! 🌊' });
      return L;
    },
  },
];

/** How clear the prompt is, 10 (messy) to 100, from the weights of the ingredients that are on. */
export function clarity(s: Scenario, f: Flags) {
  const sum = CHIPS.reduce((acc, c) => acc + (f[c] ? s.weights[c] ?? 0 : 0), 0);
  return Math.round(10 + 0.9 * sum);
}

/** The most useful ingredient that is still missing (or null when everything that matters is on). */
export function nextTip(s: Scenario, f: Flags): ChipId | null {
  let best: ChipId | null = null;
  for (const c of CHIPS) {
    const w = s.weights[c] ?? 0;
    if (w > 0 && !f[c] && (best === null || w > (s.weights[best] ?? 0))) best = c;
  }
  return best;
}
