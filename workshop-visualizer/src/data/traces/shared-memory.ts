import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { sharedMemoryCode } from '@/data/code-snippets/shared-memory';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 32 – Code: A Shared Whiteboard (shared memory)
//
// The Teacher writes the event on a whiteboard (a plain Python list). Rita, Milo
// and Wally each read the WHOLE board, then add a labelled note of their own.
// Builder: each step names a unique piece of code (`at`) instead of a raw line
// number; variables carry forward automatically.
// The three variants change the event text in the code (inputValue = the event
// line), so every AI reply and all the maths change with it.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

const CODE_LINES = sharedMemoryCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`shared-memory: marker "${marker}" found on ${hits.length} lines`);
  return hits[0];
}

function buildTrace(defs: StepDef[]): TraceStep[] {
  let vars: Variable[] = [];
  return defs.map((d) => {
    vars = vars.map((v) => ({ name: v.name, value: v.value }));
    if (d.set) {
      for (const [name, value] of Object.entries(d.set)) {
        const i = vars.findIndex((v) => v.name === name);
        if (i < 0) vars.push({ name, value, isNew: true });
        else if (vars[i].value !== value) vars[i] = { name, value, isChanged: true };
      }
    }
    return {
      lineNumber: lineOf(d.at),
      variables: vars,
      output: d.out ?? '',
      explanation: d.exp,
      animationTrigger: d.trig,
    };
  });
}

/** Python-style string value for the Variables panel (the animation JSON.parses it back). */
const str = (s: string) => JSON.stringify(s);

// The job cards exactly as the code builds them (the two string pieces joined).
export const RITA_PROMPT = 'You are Rita, a researcher. Suggest 3 fun activities that suit the group. Keep it short.';
export const MILO_PROMPT =
  'You are Milo, a math whiz. Make a shopping plan that fits the budget. Show the cost per person. Keep it short.';
export const WALLY_PROMPT =
  'You are Wally, a writer. Write a short, fun invitation (2-3 sentences) using everything on the board.';

export type Author = 'Teacher' | 'Rita' | 'Milo' | 'Wally';

/** A phrase an agent used from an earlier note: `src` is in that note, `dst` (optional) is in the agent's reply. */
export interface Borrow {
  from: Author;
  src: string;
  dst?: string;
}

export interface SharedMemoryStory {
  event: string;
  /** The headcount as written in the event, e.g. "24 students" (highlighted as a key detail). */
  count: string;
  /** How the explanation names the group, e.g. "24 students" or "a team of 4". */
  countLabel: string;
  budget: string;
  ideas: string;
  shopping: string;
  invite: string;
  ritaUses: Borrow[];
  miloUses: Borrow[];
  wallyUses: Borrow[];
  ritaWhy: string;
  miloWhy: string;
  /** The "one wrong note spreads" example: a typo in the headcount. */
  wrong: { count: string; milo: string; wally: string };
}

/** The whiteboard as a list of labelled notes after the first `n` notes were added. */
export function boardNotes(s: SharedMemoryStory, n = 4): string[] {
  return [`Teacher: ${s.event}`, `Rita: ${s.ideas}`, `Milo: ${s.shopping}`, `Wally: ${s.invite}`].slice(0, n);
}

/** Rough token count used by the lesson (≈ 4 characters per token); always shown as "≈". */
export const roughTokens = (text: string) => Math.ceil(text.length / 4);

function checkStory(s: SharedMemoryStory) {
  const notes: Record<Author, string> = { Teacher: s.event, Rita: s.ideas, Milo: s.shopping, Wally: s.invite };
  const need = (text: string, phrase: string, what: string) => {
    if (!text.includes(phrase)) throw new Error(`shared-memory: "${phrase}" missing from ${what}`);
  };
  need(s.event, s.count, 'event');
  need(s.event, s.budget, 'event');
  const uses: [Author, Borrow[]][] = [['Rita', s.ritaUses], ['Milo', s.miloUses], ['Wally', s.wallyUses]];
  for (const [who, list] of uses) {
    for (const b of list) {
      need(notes[b.from], b.src, `${b.from}'s note`);
      if (b.dst) need(notes[who], b.dst, `${who}'s note`);
    }
  }
}

function sharedMemorySteps(s: SharedMemoryStory): TraceStep[] {
  checkStory(s);
  const notes = boardNotes(s);
  const list = (n: number) => JSON.stringify(notes.slice(0, n));

  return buildTrace([
    {
      at: '# part4/shared_memory.py',
      trig: 'intro',
      exp: "What's new: a shared whiteboard. Every agent reads ALL the notes written so far, then adds its own. Today Rita, Milo and Wally plan an event together.",
    },
    {
      at: '# A shared whiteboard: every agent reads ALL',
      trig: 'compare',
      exp: "Remember the assembly line? Each agent only saw the note just before it. With a whiteboard, everyone can read everything written so far. That's called shared memory.",
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup',
      set: { OpenAI: '<class OpenAI>', client: '<OpenAI client>' },
      exp: 'Same start as always: load the OpenAI library and create the client, our phone line to the AI.',
    },
    {
      at: 'def run_agent(system_prompt, task):',
      trig: 'helper',
      set: { run_agent: '<function run_agent>' },
      exp: 'The same run_agent helper as the last lessons: one API call with a job card (system prompt) and a task. All three agents are built from it.',
    },
    {
      at: 'whiteboard = []',
      trig: 'board',
      set: { whiteboard: '[]' },
      exp: "Here's the whiteboard: an empty Python list that our code keeps. No magic memory inside the AI. Agents only read and write it through our code.",
    },
    {
      at: 'whiteboard.append(',
      trig: 'add-def',
      set: { add_note: '<function add_note>' },
      exp: 'add_note sticks a new line on the board, starting with who wrote it. Good habit: with a name on every note, everyone knows where each idea came from.',
    },
    {
      at: '".join(whiteboard)',
      trig: 'read-def',
      set: { read_board: '<function read_board>' },
      exp: 'read_board glues all the notes into one text, one note per line. "Reading the board" just means putting this text into an agent\'s task.',
    },
    {
      at: 'event = "',
      trig: 'event',
      set: { event: str(s.event) },
      exp: `The event arrives, saved in event. Spot the two key details: ${s.countLabel} and a ${s.budget} budget. The agents will need both.`,
    },
    {
      at: 'add_note("Teacher", event)',
      trig: 'teacher-note',
      set: { whiteboard: list(1) },
      exp: 'add_note sticks the event on the board, labelled "Teacher". 1 note so far. The counter at the top shows roughly how many tokens the board holds.',
    },
    {
      at: 'rita_prompt = (',
      trig: 'rita-card',
      set: { rita_prompt: str(RITA_PROMPT) },
      exp: 'Rita\'s job card: suggest 3 fun activities that suit the group. "Keep it short" is a good habit: short notes keep the board easy to read.',
    },
    {
      at: 'ideas = run_agent(',
      trig: 'rita-read',
      exp: 'Rita steps up to the board. Her task is "Whiteboard:" plus read_board(), so she reads the 1 note so far. That\'s all "reading" is: the board text inside her task.',
    },
    {
      at: 'ideas = run_agent(',
      trig: 'rita-reply',
      set: { ideas: str(s.ideas) },
      exp: `Rita's reply is saved in ideas: ${s.ritaWhy}`,
    },
    {
      at: 'add_note("Rita", ideas)',
      trig: 'rita-note',
      set: { whiteboard: list(2) },
      exp: 'add_note sticks Rita\'s ideas on the board, labelled "Rita". 2 notes now. Anyone who reads the board from now on will see them.',
    },
    {
      at: 'milo_prompt = (',
      trig: 'milo-card',
      set: { milo_prompt: str(MILO_PROMPT) },
      exp: "Milo's job card: make a shopping plan that fits the budget and show the cost per person. He can't do that without the numbers...",
    },
    {
      at: 'shopping = run_agent(',
      trig: 'milo-read',
      exp: `Milo reads the board, and both notes glow. He finds ${s.countLabel} and ${s.budget} in the Teacher's note, and Rita's ideas are there too.`,
    },
    {
      at: 'shopping = run_agent(',
      trig: 'milo-reply',
      set: { shopping: str(s.shopping) },
      exp: s.miloWhy,
    },
    {
      at: 'add_note("Milo", shopping)',
      trig: 'milo-note',
      set: { whiteboard: list(3) },
      exp: "Milo's plan goes up on the board. 3 notes now, and the token counter keeps climbing.",
    },
    {
      at: 'wally_prompt = (',
      trig: 'wally-card',
      set: { wally_prompt: str(WALLY_PROMPT) },
      exp: "Wally's job card: write a short, fun invitation using everything on the board.",
    },
    {
      at: 'invite = run_agent(',
      trig: 'wally-read',
      exp: "Wally reads the WHOLE board: all 3 notes glow. In the assembly line he'd have seen only the note right before him.",
    },
    {
      at: 'invite = run_agent(',
      trig: 'wally-reply',
      set: { invite: str(s.invite) },
      exp: "Wally's invitation mixes it all. Coloured words show whose note each idea came from: the Teacher's event, Rita's activities and Milo's shopping list.",
    },
    {
      at: 'add_note("Wally", invite)',
      trig: 'wally-note',
      set: { whiteboard: list(4) },
      exp: "Wally adds his invitation too. The board now holds the team's whole plan: 4 labelled notes.",
    },
    {
      at: 'print(read_board())',
      trig: 'print',
      out: notes.join('\n'),
      exp: "Print the board: everyone's work in one place, and every line says who wrote it.",
    },
    {
      at: '".join(whiteboard)',
      trig: 'tokens',
      exp: 'The catch: read_board() returns the WHOLE board, so every call sends more tokens than the one before. Like Context & Memory: more text sent means more cost and waiting.',
    },
    {
      at: 'every agent can read and write here',
      trig: 'wrong-note',
      exp: `Second catch: everyone trusts the board. If one note had a typo, like "${s.wrong.count}", Milo and Wally would both build on it. Check important notes!`,
    },
    {
      at: 'print(read_board())',
      trig: 'recap',
      exp: 'What you learned: 1) a shared whiteboard is just a list every agent reads and writes; 2) later agents build on earlier notes; 3) it grows, and mistakes spread.',
    },
  ]);
}

const PARTY: SharedMemoryStory = {
  event: 'End-of-year class party for 24 students, budget $60',
  count: '24 students',
  countLabel: '24 students',
  budget: '$60',
  ideas: '1. Musical chairs 2. Class trivia quiz 3. Team relay race',
  shopping: '$60 ÷ 24 students = $2.50 each. 6 pizzas $42 + 24 juice boxes $12 + quiz prizes $6 = $60.',
  invite:
    "You're invited to our End-of-Year Class Party! 🎉 Play musical chairs, a trivia quiz and a team relay race, then enjoy pizza and juice. Quiz winners get a prize!",
  ritaUses: [{ from: 'Teacher', src: 'class party for 24 students' }],
  miloUses: [
    { from: 'Teacher', src: '24 students', dst: '24 students' },
    { from: 'Teacher', src: '$60', dst: '$60 ÷' },
    { from: 'Rita', src: 'trivia quiz', dst: 'quiz prizes' },
  ],
  wallyUses: [
    { from: 'Teacher', src: 'End-of-year class party', dst: 'End-of-Year Class Party' },
    { from: 'Rita', src: 'Musical chairs', dst: 'musical chairs' },
    { from: 'Rita', src: 'Class trivia quiz', dst: 'trivia quiz' },
    { from: 'Rita', src: 'Team relay race', dst: 'team relay race' },
    { from: 'Milo', src: '6 pizzas', dst: 'pizza' },
    { from: 'Milo', src: 'juice boxes', dst: 'juice' },
    { from: 'Milo', src: 'quiz prizes', dst: 'a prize' },
  ],
  ritaWhy: '3 activities that work for a whole class of 24, like a team relay race.',
  miloWhy:
    "Milo's maths: $60 ÷ 24 = $2.50 per student. He even saved $6 for quiz prizes, because he read Rita's trivia quiz idea!",
  wrong: { count: '240 students', milo: '$60 ÷ 240 = $0.25 each 😬', wally: 'Calling all 240 students!' },
};

const BOOK_CLUB: SharedMemoryStory = {
  event: 'Book club meeting for 8 friends, budget $20',
  count: '8 friends',
  countLabel: '8 friends',
  budget: '$20',
  ideas: "1. Guess-the-character charades 2. Favourite-quote swap 3. Vote on next month's book",
  shopping: '$20 ÷ 8 friends = $2.50 each. Cookies $8 + lemonade $5 + fruit $5 + quote cards $2 = $20.',
  invite:
    "Calling all 8 bookworms! 📚 Join our book club meeting for character charades, a quote swap and a vote on next month's book, with cookies and lemonade.",
  ritaUses: [{ from: 'Teacher', src: 'Book club meeting for 8 friends' }],
  miloUses: [
    { from: 'Teacher', src: '8 friends', dst: '8 friends' },
    { from: 'Teacher', src: '$20', dst: '$20 ÷' },
    { from: 'Rita', src: 'Favourite-quote swap', dst: 'quote cards' },
  ],
  wallyUses: [
    { from: 'Teacher', src: '8 friends', dst: '8 bookworms' },
    { from: 'Teacher', src: 'Book club meeting', dst: 'book club meeting' },
    { from: 'Rita', src: 'Guess-the-character charades', dst: 'character charades' },
    { from: 'Rita', src: 'Favourite-quote swap', dst: 'quote swap' },
    { from: 'Rita', src: "Vote on next month's book", dst: "vote on next month's book" },
    { from: 'Milo', src: 'Cookies', dst: 'cookies' },
    { from: 'Milo', src: 'lemonade', dst: 'lemonade' },
  ],
  ritaWhy: '3 activities that fit a cosy group of 8 book lovers.',
  miloWhy:
    "Milo's maths: $20 ÷ 8 = $2.50 per friend. He even saved $2 for quote cards, because he read Rita's quote-swap idea!",
  wrong: { count: '80 friends', milo: '$20 ÷ 80 = $0.25 each 😬', wally: 'Calling all 80 bookworms!' },
};

const SCIENCE_FAIR: SharedMemoryStory = {
  event: 'Science fair stand for a team of 4, budget $30',
  count: 'team of 4',
  countLabel: 'a team of 4',
  budget: '$30',
  ideas: '1. Live baking-soda volcano 2. Guess-the-result quiz for visitors 3. Hands-on slime table',
  shopping: '$30 ÷ 4 people = $7.50 each. Volcano supplies $8 + slime kit $10 + poster board $5 + quiz stickers $7 = $30.',
  invite:
    'Come visit our science fair stand! 🔬 Watch a real baking-soda volcano erupt, guess the result in our quiz and get your hands slimy. Stickers for every quiz player!',
  ritaUses: [{ from: 'Teacher', src: 'Science fair stand' }],
  miloUses: [
    { from: 'Teacher', src: 'team of 4', dst: '4 people' },
    { from: 'Teacher', src: '$30', dst: '$30 ÷' },
    { from: 'Rita', src: 'volcano', dst: 'Volcano supplies' },
    { from: 'Rita', src: 'slime table', dst: 'slime kit' },
    { from: 'Rita', src: 'quiz for visitors', dst: 'quiz stickers' },
  ],
  wallyUses: [
    { from: 'Teacher', src: 'Science fair stand', dst: 'science fair stand' },
    { from: 'Rita', src: 'Live baking-soda volcano', dst: 'baking-soda volcano' },
    { from: 'Rita', src: 'Guess-the-result quiz', dst: 'guess the result in our quiz' },
    { from: 'Rita', src: 'Hands-on slime table', dst: 'hands slimy' },
    { from: 'Milo', src: 'quiz stickers', dst: 'Stickers' },
  ],
  ritaWhy: '3 hands-on activities to pull visitors over to the stand.',
  miloWhy:
    "Milo's maths: $30 ÷ 4 = $7.50 per person. He budgeted volcano supplies and a slime kit, because he read Rita's ideas!",
  wrong: { count: 'team of 40', milo: '$30 ÷ 40 = $0.75 each 😬', wally: 'All 40 of us will be at the stand!' },
};

/** Stories by variant id, so the animation can look up highlights and the "what if" example. */
export const sharedMemoryStories: Record<string, SharedMemoryStory> = {
  default: PARTY,
  variant2: BOOK_CLUB,
  variant3: SCIENCE_FAIR,
};

export const sharedMemoryTrace = sharedMemorySteps(PARTY);

// The event line changes in the code, so inputValue is the exact event text.
export const sharedMemoryVariants: TraceVariant[] = [
  { id: 'default', label: 'class party', inputValue: PARTY.event, steps: sharedMemoryTrace },
  { id: 'variant2', label: 'book club', inputValue: BOOK_CLUB.event, steps: sharedMemorySteps(BOOK_CLUB) },
  { id: 'variant3', label: 'science fair', inputValue: SCIENCE_FAIR.event, steps: sharedMemorySteps(SCIENCE_FAIR) },
];
