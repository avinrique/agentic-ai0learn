// Data for the "Prompt Fixer" playground. Every answer is a prepared example built from small
// templates, so each combination of ingredients gives a sensible reply without any API call.
import type { IngId } from './shared';

export type ChipId = Exclude<IngId, 'task'>;
export const CHIPS: ChipId[] = ['role', 'context', 'format', 'example', 'limits', 'step', 'fence'];
export type Flags = Record<ChipId, boolean>;
export const NO_FLAGS: Flags = { role: false, context: false, format: false, example: false, limits: false, step: false, fence: false };

export interface ALine {
  text: string; // supports **bold**, {{id|coloured bit}}, [placeholder]
  by: ChipId | 'base'; // which ingredient shaped this line (its colour marks the line)
  kind?: 'title' | 'bullet' | 'muted' | 'warn';
}

export interface Scenario {
  id: string;
  chip: string;
  base: string; // the messy prompt
  fenceNote?: string; // added to the base line when the fence is on
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
      role: 'You are a patient maths tutor.',
      context: "I'm 11 and adding fractions with different bottom numbers confuses me.",
      format: 'Use numbered steps, then give the answer in bold.',
      example: 'Show it like this: 1/2 + 1/4 → 2/4 + 1/4 = 3/4',
      limits: 'Use simple words. Keep it under 60 words.',
      step: 'Work it out step by step and show every step.',
    },
    notNeeded: { fence: 'Nothing is pasted in' },
    weights: { context: 25, step: 25, format: 15, limits: 15, role: 10, example: 10 },
    tips: {
      context: 'Add context: say what confuses you, so it explains that part.',
      step: 'Add step by step: for maths, ask to see every step.',
      format: 'Add a format: numbered steps are easy to follow.',
      limits: 'Add limits: simple words and a word limit keep it short.',
      role: 'Add a role: a patient tutor explains more kindly.',
      example: 'Add an example: show the style of working you like.',
    },
    answer: (f) => {
      const L: ALine[] = [];
      const bottoms = f.limits ? 'bottom numbers' : 'denominators';
      const eighths = f.limits ? 'both bottom numbers are 8' : 'common denominator 8';
      if (f.role) L.push({ by: 'role', text: "Great question! Let's work it out together. 😊" });
      if (f.context) L.push({ by: 'context', text: `Different ${bottoms} are tricky, so first we make them match.` });
      const worked = f.step || f.format || f.example;
      if (!worked) {
        if (f.role) L.push({ by: 'role', text: `Hint: make the ${bottoms} the same, then add the tops.` });
        if (f.limits) L.push({ by: 'limits', text: '3/4 + 1/8 = 7/8 (make both bottom numbers 8 first)' });
        else L.push({ by: 'base', text: '3/4 + 1/8 = 7/8 (using a common denominator of 8)' });
      } else {
        let steps: { by: ChipId; text: string }[];
        if (f.step && f.example) {
          steps = [
            { by: 'example', text: '3/4 → 6/8 (×2 on top and bottom, so both are eighths)' },
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
      if (!f.limits && (f.role || f.context || f.step)) L.push({ by: 'base', kind: 'muted', text: '…plus 3 more paragraphs about what denominators are 📏' });
      return L;
    },
  },
  {
    id: 'invite',
    chip: '🎉 make an invite',
    base: 'make an invite for my party',
    lines: {
      role: 'You are a fun party planner.',
      context: "It's my 12th birthday: pizza and a movie at my house on Saturday at 6 pm. It's for my classmates.",
      format: 'Layout: a title, then When, Where and What, one line each.',
      example: 'Make the title like this one: "Pizza Party Alert! 🍕"',
      limits: 'Under 50 words. Ask them to reply by Thursday.',
    },
    notNeeded: { step: 'No maths or reasoning', fence: 'Nothing is pasted in' },
    weights: { context: 35, format: 20, limits: 20, example: 15, role: 10 },
    tips: {
      context: "Add context: the AI can't guess your date, place or plans.",
      format: 'Add a format: When / Where / What lines are easy to scan.',
      limits: 'Add limits: keep it short and ask guests to reply.',
      example: 'Add an example: show the kind of title you like.',
      role: 'Add a role: a fun party planner adds energy.',
    },
    answer: (f) => {
      const L: ALine[] = [];
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
      return L;
    },
  },
  {
    id: 'story',
    chip: '📖 summarise this story',
    base: 'summarise this story',
    fenceNote: ' (it is between the """ marks)',
    pasted: [
      'Pip the penguin wanted to fly like the seagulls. Every day he ran down the icy hill, flapped hard and splashed into the sea. One day a seal chased the young penguins, and Pip swam so fast that he led them all to safety. After that, Pip stopped wishing for wings.',
      'Now write what happens next!',
    ],
    lines: {
      role: 'You are a friendly librarian.',
      context: "It's for my book report. My class is 10 years old.",
      format: 'Answer in 3 bullet points: Who, Problem, Ending.',
      example: 'Write each bullet like: "Who: a shy dragon who can\'t breathe fire"',
      limits: 'Under 50 words. Include the lesson of the story.',
      fence: '"""',
    },
    notNeeded: { step: 'No maths or reasoning' },
    weights: { fence: 25, format: 20, limits: 20, context: 15, example: 10, role: 10 },
    tips: {
      fence: 'Add a fence: wrap the story in """ so the AI knows where it starts and ends.',
      format: 'Add a format: 3 bullets are quicker to read than a retelling.',
      limits: 'Add limits: a word limit stops the retelling. Ask for the lesson too.',
      context: 'Add context: say it is for a book report.',
      example: 'Add an example: show the bullet style you like.',
      role: 'Add a role: a friendly librarian sounds warmer.',
    },
    answer: (f) => {
      const L: ALine[] = [];
      if (f.role) L.push({ by: 'role', text: 'What a lovely story! 🐧 Here is my summary:' });
      if (f.example) {
        L.push({ by: 'example', kind: 'bullet', text: '**Who:** a young penguin who wishes he could fly' });
        if (!f.format) L.push({ by: 'example', kind: 'bullet', text: '**Where:** an icy hill by the sea' });
        L.push({ by: 'example', kind: 'bullet', text: "**Problem:** he can't fly, and a seal attacks" });
        if (!f.format) L.push({ by: 'example', kind: 'bullet', text: '**Middle:** he keeps splashing into the sea' });
        L.push({ by: 'example', kind: 'bullet', text: '**Ending:** his fast swimming saves his friends' });
      } else if (f.format) {
        L.push({ by: 'format', kind: 'bullet', text: '**Who:** Pip, a young penguin.' });
        L.push({ by: 'format', kind: 'bullet', text: '**Problem:** Pip wants to fly like the seagulls, but he always lands in the sea.' });
        L.push({ by: 'format', kind: 'bullet', text: '**Ending:** Pip swims so fast that he saves the others from a seal.' });
      } else if (f.limits) {
        L.push({ by: 'limits', text: 'Pip the penguin wishes he could fly. When a seal attacks, his fast swimming saves everyone, so he stops wishing for wings.' });
      } else {
        L.push({ by: 'base', text: 'Pip is a penguin who wants to fly like the seagulls. Every day he runs down an icy hill, flaps his wings and splashes into the sea. Then one day a seal chases the young penguins…' });
        L.push({ by: 'base', kind: 'muted', text: '…and it retells every detail 📏' });
      }
      if (f.limits) L.push({ by: 'limits', text: '**Lesson:** be proud of what you are good at.' });
      if (f.context) L.push({ by: 'context', text: 'For your book report, you could add which part you liked best!' });
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
