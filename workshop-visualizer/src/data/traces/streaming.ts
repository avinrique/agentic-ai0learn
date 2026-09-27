import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { streamingCode } from '@/data/code-snippets/streaming';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 11 – Streaming: The Typing Effect.
//
// All three variants run the same program; only the prompt (inputValue, an exact
// substring of the code) and the streamed pieces change. Steps name a unique
// piece of code (`at`) instead of a raw line number, and variables carry forward.
// The first two loop rounds are walked slowly, then the rest is fast-forwarded.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

const CODE_LINES = streamingCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`streaming: marker "${marker}" found on ${hits.length} lines`);
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
/** The Variables-panel value of the n-th chunk (the animation reads the number back). */
export const chunkLabel = (n: number) => `<ChatCompletionChunk #${n}>`;

export const STATUS_LINE = 'Asking the AI to write (streaming)...';
export const doneLine = (chars: number) => `\n\nDone! The answer has ${chars} characters.`;

const L = {
  file: '# part1/streaming.py',
  imp: 'from openai import OpenAI',
  client: 'client = OpenAI()',
  status: 'print("Asking',
  create: 'stream = client.chat.completions.create(',
  streamTrue: 'stream=True,',
  init: 'full_story = ""',
  forLine: 'for chunk in stream:',
  piece: 'piece = chunk.choices[0].delta.content',
  check: 'if piece:',
  print: 'print(piece, end="", flush=True)',
  add: 'full_story += piece',
  done: 'print(f"\\n\\nDone!',
};

export interface StreamExample {
  /** The user message (also the variant's inputValue: it appears in the code). */
  prompt: string;
  /** Short description for the explanation bar. */
  ask: string;
  /** The text pieces in the order the chunks bring them (a token or a few characters each). */
  pieces: string[];
}

// Realistic-looking chunk sequences: real streams send roughly one token per chunk.
const ROBOT: StreamExample = {
  prompt: 'Tell a 3-sentence story about a robot who learns to paint.',
  ask: 'a 3-sentence story about a robot who learns to paint',
  pieces: [
    'Pixel', ' was', ' a', ' cleaning', ' robot', ' who', ' swept', ' an', ' art', ' museum', ' every', ' night', '.',
    ' It', ' began', ' copying', ' the', ' paintings', ' with', ' a', ' dusty', ' old', ' brush', ',', ' and', ' night',
    ' after', ' night', ' its', ' wob', 'bly', ' lines', ' grew', ' smoother', '.', ' One', ' morning', ' the', ' guards',
    ' found', ' a', ' bright', ' sunset', ' on', ' an', ' easel', ',', ' and', ' they', ' hung', ' Pixel', "'s", ' first',
    ' painting', ' by', ' the', ' front', ' door', '.',
  ],
};

const HAIKU: StreamExample = {
  prompt: 'Write a haiku about the moon.',
  ask: 'a haiku about the moon',
  pieces: [
    'Silver', ' lantern', ' glows', ',\n', 'guiding', ' lost', ' waves', ' back', ' to', ' shore', ',\n', 'night', "'s",
    ' calm', ',', ' watch', 'ful', ' eye', '.',
  ],
};

const TIPS: StreamExample = {
  prompt: 'Give 3 tips for staying focused while studying.',
  ask: '3 tips for staying focused while studying',
  pieces: [
    'Here', ' are', ' 3', ' tips', ':\n\n', '1', '.', ' Put', ' your', ' phone', ' in', ' another', ' room', '.\n', '2', '.',
    ' Study', ' for', ' 25', ' minutes', ',', ' then', ' take', ' a', ' 5', '-minute', ' break', '.\n', '3', '.', ' Write',
    ' one', ' clear', ' goal', ' before', ' you', ' start', '.',
  ],
};

/** Keyed by variant id, so the animation can show the pieces flowing down the pipe. */
export const STREAM_EXAMPLES: Record<string, StreamExample> = {
  default: ROBOT,
  haiku: HAIKU,
  tips: TIPS,
};

function streamingSteps(ex: StreamExample): TraceStep[] {
  const [p1, p2] = ex.pieces;
  const full = ex.pieces.join('');
  const n = ex.pieces.length;
  const spaceNote = p2.startsWith(' ')
    ? `Its piece is "${p2}", with a space in front: spaces travel inside the pieces.`
    : `Its piece is "${p2}".`;

  return buildTrace([
    {
      at: L.file,
      trig: 'intro',
      exp: "What's new: stream=True. Instead of waiting for the whole answer, we'll watch it type itself out piece by piece, just like ChatGPT.",
    },
    {
      at: L.imp,
      trig: 'import',
      set: { OpenAI: '<class OpenAI>' },
      exp: 'Same start as last lesson: load the OpenAI library.',
    },
    {
      at: L.client,
      trig: 'client',
      set: { client: '<OpenAI client>' },
      exp: 'Create the client, our phone line to OpenAI. It reads your secret key from OPENAI_API_KEY.',
    },
    {
      at: L.status,
      trig: 'status',
      out: STATUS_LINE,
      exp: 'A status line, so we know the program has started. Look at the terminal.',
    },
    {
      at: L.create,
      trig: 'request',
      exp: `Same create() call as last lesson: a model, plus a messages list asking for ${ex.ask}.`,
    },
    {
      at: L.streamTrue,
      trig: 'stream-true',
      exp: "One new setting: stream=True. It tells OpenAI: don't wait until the answer is finished, send it in small pieces while the AI writes it.",
    },
    {
      at: L.streamTrue,
      trig: 'compare',
      exp: 'Watch the timers. Without streaming, you stare at a blank screen until everything is done. With streaming, you start reading almost at once. That is why chat apps stream.',
    },
    {
      at: L.create,
      trig: 'sent',
      set: { stream: '<Stream object>' },
      exp: "The request flies to OpenAI and create() comes back almost at once. stream isn't the answer yet: it's an open pipe the pieces will flow through.",
    },
    {
      at: L.init,
      trig: 'init',
      set: { full_story: str('') },
      exp: "full_story starts as an empty string, like an empty jar. We'll drop every piece into it to rebuild the whole answer.",
    },
    {
      at: L.forLine,
      trig: 'chunk1',
      set: { chunk: chunkLabel(1) },
      exp: 'for chunk in stream: waits for the next chunk. The AI writes one token at a time (remember Lesson 1), and each one is sent to us right away.',
    },
    {
      at: L.piece,
      trig: 'piece1',
      set: { piece: str(p1) },
      exp: `A chunk looks like last lesson's response, but with delta ("the new bit") instead of message. delta.content holds the new text: "${p1}".`,
    },
    {
      at: L.check,
      trig: 'check1',
      exp: `if piece: checks that the piece has some text. "${p1}" does, so we go inside.`,
    },
    {
      at: L.print,
      trig: 'print1',
      exp: `print shows "${p1}" in the terminal. flush=True means "show it right now", so it doesn't sit waiting for more text first.`,
    },
    {
      at: L.add,
      trig: 'add1',
      set: { full_story: str(p1) },
      exp: `full_story += piece glues the piece onto the end of full_story. Now full_story is "${p1}".`,
    },
    {
      at: L.piece,
      trig: 'piece2',
      set: { chunk: chunkLabel(2), piece: str(p2) },
      exp: `Back to the top of the loop: chunk 2 arrives. ${spaceNote}`,
    },
    {
      at: L.print,
      trig: 'print2',
      exp: `"${p2.trim()}" lands right beside "${p1}" on the same line. That's end="": print adds no new line after each piece.`,
    },
    {
      at: L.add,
      trig: 'add2',
      set: { full_story: str(p1 + p2) },
      exp: `full_story is now "${p1 + p2}". Piece by piece, it rebuilds the whole answer.`,
    },
    {
      at: L.forLine,
      trig: 'fast',
      set: { chunk: chunkLabel(n), piece: str(ex.pieces[n - 1]), full_story: str(full) },
      out: full,
      exp: `The loop repeats for every chunk (${n} with text in this answer). Watch them flow down the pipe, type out, and fill up full_story.`,
    },
    {
      at: L.check,
      trig: 'last',
      set: { chunk: chunkLabel(n + 1), piece: 'None' },
      exp: 'The last chunk has no text: content is None, meaning "finished". if piece: is False, so we skip it. Without the check, full_story += None would crash.',
    },
    {
      at: L.done,
      trig: 'done',
      out: doneLine(full.length),
      exp: `The stream is used up, so the loop ends. len(full_story) counts the characters we collected: ${full.length}.`,
    },
    {
      at: L.done,
      trig: 'recap',
      exp: "What you learned: 1) stream=True sends the answer in small chunks as it's written. 2) Each chunk's new text is chunk.choices[0].delta.content (it may be None). 3) print(piece, end=\"\", flush=True) types it out.",
    },
  ]);
}

export const streamingTrace = streamingSteps(ROBOT);

export const streamingVariants: TraceVariant[] = [
  { id: 'default', label: 'Robot painter story', inputValue: ROBOT.prompt, steps: streamingTrace },
  { id: 'haiku', label: 'Haiku about the moon', inputValue: HAIKU.prompt, steps: streamingSteps(HAIKU) },
  { id: 'tips', label: '3 study focus tips', inputValue: TIPS.prompt, steps: streamingSteps(TIPS) },
];
