import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { ragCode } from '@/data/code-snippets/rag-code';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 23 – Code: RAG with Embeddings (part3/rag_code.py)
//
// All three variants run the SAME program with a different question, so the
// question is the variant's inputValue (the code panel swaps it in). Scores,
// map positions and embedding numbers are ILLUSTRATIVE (made up, but they rank
// sensibly). The animation reads RAG_DOCS / RAG_STORIES from this file.
// ─────────────────────────────────────────────────────────────────────────────

export interface RagDoc {
  key: string;
  icon: string;
  short: string; // 1–2 word label for chips, bars and the map
  text: string; // exactly as written in the code
  nums: [number, number, number]; // first 3 numbers of its (illustrative) embedding
  pos: [number, number]; // spot on the (illustrative) 2D meaning map, 0..1
}

// Same order as the `documents` list in the code.
export const RAG_DOCS: RagDoc[] = [
  { key: 'library', icon: '📚', short: 'Library hours', text: 'The library is open from 8 am to 4 pm on weekdays.', nums: [0.012, -0.034, 0.051], pos: [0.36, 0.2] },
  { key: 'borrow', icon: '📖', short: 'Borrowing', text: 'Students can borrow up to 3 books for 2 weeks.', nums: [0.027, -0.041, 0.018], pos: [0.2, 0.55] },
  { key: 'fair', icon: '🔬', short: 'Science fair', text: 'The science fair is on 14 March in the school gym.', nums: [-0.019, 0.044, 0.006], pos: [0.8, 0.22] },
  { key: 'lunch', icon: '🍽️', short: 'Lunch times', text: 'Lunch is from 12:00 to 12:45 in the cafeteria.', nums: [0.033, 0.008, -0.025], pos: [0.74, 0.8] },
  { key: 'lost', icon: '🧤', short: 'Lost & found', text: 'Lost-and-found items are kept at the front office.', nums: [-0.007, -0.022, 0.039], pos: [0.34, 0.85] },
];

/** The keyword-search example from the second step (Study Buddy's exact-word lookup). */
export const TAKE_OUT_QUESTION = 'How many books can I take out?';
export const TAKE_OUT_NUMS: [number, number, number] = [0.026, -0.04, 0.02];

export interface RagStory {
  id: string;
  question: string;
  qNums: [number, number, number]; // first 3 numbers of the question's embedding
  pin: [number, number]; // where the question lands on the meaning map
  scores: number[]; // similarity per document, in document order (illustrative)
  answer: string;
  found: boolean; // is the answer in the top-2 context?
  mapNote: string;
  scoreNote: string;
  topNote: string;
  answerNote: string;
}

export const RAG_STORIES: RagStory[] = [
  {
    id: 'default',
    question: 'How many books can I borrow?',
    qNums: [0.025, -0.039, 0.021],
    pin: [0.08, 0.36],
    scores: [0.42, 0.71, 0.1, 0.12, 0.24],
    answer: 'You can borrow up to 3 books, for 2 weeks.',
    found: true,
    mapNote:
      'Picture each embedding as a spot on a meaning map. The question lands right next to the Borrowing card; lunch and the science fair are far away.',
    scoreNote:
      'similarity() scores the question against each document. Closer in meaning means a higher score. Borrowing wins with 0.71 (illustrative numbers).',
    topNote: 'ranked[:2] means "the first two". We keep the top 2 documents, and the Retrieve step is done.',
    answerNote:
      'The answer comes straight from the handbook: up to 3 books, for 2 weeks. No guessing, because the fact was in the context.',
  },
  {
    id: 'variant2',
    question: 'When is the science fair?',
    qNums: [-0.017, 0.046, 0.009],
    pin: [0.7, 0.07],
    scores: [0.23, 0.09, 0.78, 0.19, 0.12],
    answer: 'The science fair is on 14 March, in the school gym.',
    found: true,
    mapNote:
      'Picture each embedding as a spot on a meaning map. The question lands right next to the Science fair card; the others are far away.',
    scoreNote:
      'similarity() scores the question against each document. Closer in meaning means a higher score. Science fair wins with 0.78 (illustrative numbers).',
    topNote: 'ranked[:2] means "the first two". We keep the top 2 documents, and the Retrieve step is done.',
    answerNote: 'The answer comes straight from the handbook: 14 March, in the school gym. The model read it in the context.',
  },
  {
    id: 'variant3',
    question: "What's the Wi-Fi password?",
    qNums: [0.052, 0.013, -0.047],
    pin: [0.54, 0.54],
    scores: [0.16, 0.09, 0.11, 0.17, 0.15],
    answer: "I don't know. The context doesn't mention a Wi-Fi password.",
    found: false,
    mapNote:
      'Picture each embedding as a spot on a meaning map. This question lands far from every card: nothing in the handbook is about Wi-Fi.',
    scoreNote:
      'similarity() scores the question against each document. Every score is low: even the best, Lunch times, is only 0.17 (illustrative numbers).',
    topNote: 'We keep the top 2 anyway: Lunch times and Library hours. The code always takes 2, even when both scores are low.',
    answerNote:
      "No document mentions Wi-Fi, so the AI says it doesn't know instead of inventing a password. That's the system prompt's rule at work.",
  },
];

export function storyFor(question: string | undefined): RagStory {
  return RAG_STORIES.find((s) => s.question === question) ?? RAG_STORIES[0];
}

/** Document indexes, best score first (what sorted(..., reverse=True) gives). */
export function rankedIdx(story: RagStory): number[] {
  return story.scores.map((_, i) => i).sort((a, b) => story.scores[b] - story.scores[a]);
}

/** A number as Python prints round(x, 2): 0.10 -> 0.1 */
export const py2 = (x: number) => String(Number(x.toFixed(2)));

/** The first 3 numbers of an embedding, as a short strip. */
export const numStrip = (n: number[]) => `[${n.map((x) => x.toFixed(3)).join(', ')}, …]`;

// ─── Trace builder (steps name a unique piece of code instead of a line number) ───
interface StepDef {
  at: string; // a substring that appears on exactly one line of the code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

const CODE_LINES = ragCode.split('\n');

function lineOf(marker: string): number {
  const hits = CODE_LINES.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
  if (hits.length !== 1) throw new Error(`rag-code: marker "${marker}" found on ${hits.length} lines`);
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
const short = (s: string) => s.split(' ').slice(0, 4).join(' ') + '…';

const SYSTEM_PROMPT = "Answer using ONLY the context.\nIf the answer isn't there, say you don't know.";

function ragSteps(s: RagStory): TraceStep[] {
  const order = rankedIdx(s);
  const top = order.slice(0, 2).map((i) => RAG_DOCS[i]);
  const context = top.map((d) => d.text).join('\n');
  const userMessage = `Context:\n${context}\n\nQuestion: ${s.question}`;
  const printed = order.map((i) => `${py2(s.scores[i])} ${RAG_DOCS[i].text}`).join('\n');

  const defs: StepDef[] = [
    {
      at: '# part3/rag_code.py',
      trig: 'intro',
      exp: 'Today we build RAG in real code: find the handbook facts that match a question by meaning, add them to the prompt, then let the AI answer.',
    },
    {
      at: '# part3/rag_code.py',
      trig: 'keyword',
      exp: `Why not search for words? Study Buddy's lookup matched exact words only. Ask "${TAKE_OUT_QUESTION}", search for "take out", and nothing matches: the handbook says "borrow".`,
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup',
      set: { OpenAI: '<class OpenAI>', client: '<OpenAI client>' },
      exp: 'Same start as always: import OpenAI and create the client, our phone line to OpenAI.',
    },
    {
      at: 'documents = [',
      trig: 'docs',
      set: { documents: `[${RAG_DOCS.map((d) => str(short(d.text))).join(', ')}]` },
      exp: "Our private documents: 5 made-up facts from a school handbook. The AI has never seen them, so on its own it can't answer questions about them.",
    },
    {
      at: 'def embed(texts):',
      trig: 'def-embed',
      set: { embed: '<function embed>' },
      exp: "embed() will send texts to OpenAI's embedding model, text-embedding-3-small. This model doesn't chat. It only turns text into numbers.",
    },
    {
      at: 'return [item.embedding',
      trig: 'one-embedding',
      exp: 'Each text comes back as its embedding: a list of 1,536 numbers. Think of it as GPS coordinates for meaning, like in Lesson 1.',
    },
    {
      at: 'return [item.embedding',
      trig: 'similar-nums',
      exp: 'The key trick: similar meanings get similar numbers. "take out books" and "borrow books" get close numbers, even with different words. Lunch gets very different ones.',
    },
    {
      at: 'def similarity(a, b):',
      trig: 'def-sim',
      set: { similarity: '<function similarity>' },
      exp: 'similarity() compares two embeddings. Picture each one as an arrow: pointing the same way scores 1, and the further apart they point, the lower the score.',
    },
    {
      at: 'dot = sum(',
      trig: 'sim-dot',
      exp: "Here's the math on tiny 3-number lists. zip pairs up matching numbers; we multiply each pair and add them up. That's the dot product: 8.",
    },
    {
      at: 'return dot /',
      trig: 'sim-len',
      exp: "Then divide by both arrows' lengths so only the direction counts: 8 ÷ (3 × 3) = 0.89, very alike. Real embeddings do this with 1,536 numbers.",
    },
    {
      at: 'doc_vectors = embed(documents)',
      trig: 'embed-docs',
      set: { doc_vectors: `[${numStrip(RAG_DOCS[0].nums)}, … 5 lists of 1,536 numbers]` },
      exp: 'Now embed() runs: all 5 documents go in ONE embedding call (API call 1 of 3). We do this once and keep the numbers in doc_vectors.',
    },
    {
      at: 'question = "',
      trig: 'question',
      set: { question: str(s.question) },
      exp: `A student asks: "${s.question}" Right now it's just text.`,
    },
    {
      at: 'question_vector = embed(',
      trig: 'embed-q',
      set: { question_vector: `[${s.qNums.map((x) => x.toFixed(3)).join(', ')}, … 1,536 numbers]` },
      exp: 'Embed the question the same way (API call 2 of 3). embed() takes a list, so we wrap the question in [ ] and take item [0] back out.',
    },
    {
      at: 'scores = [',
      trig: 'map',
      exp: s.mapNote,
    },
    {
      at: 'scores = [',
      trig: 'scores',
      set: { scores: `[${s.scores.map((x) => x.toFixed(2)).join(', ')}]  (illustrative)` },
      exp: s.scoreNote,
    },
    {
      at: 'ranked = sorted(',
      trig: 'rank',
      set: {
        ranked: `[${order
          .slice(0, 2)
          .map((i) => `(${s.scores[i].toFixed(2)}, ${str(short(RAG_DOCS[i].text))})`)
          .join(', ')}, … 5 pairs]`,
      },
      exp: 'zip pairs each score with its document. sorted(..., reverse=True) puts the highest score first, so the best match is on top.',
    },
    {
      at: 'print(round(score, 2), doc)',
      trig: 'print',
      out: printed,
      exp: 'The loop prints every score, rounded to 2 decimals, next to its document. Look at the output panel.',
    },
    {
      at: 'top_docs = [',
      trig: 'top2',
      set: { top_docs: `[${top.map((d) => str(d.text)).join(', ')}]` },
      exp: s.topNote,
    },
    {
      at: 'context = "',
      trig: 'context',
      set: { context: str(context) },
      exp: 'Glue the 2 documents into one piece of text, one per line ("\\n" means new line). This is the context.',
    },
    {
      at: 'system_prompt = """',
      trig: 'rule',
      set: { system_prompt: str(SYSTEM_PROMPT) },
      exp: "The rule for the AI: answer ONLY from the context, and say you don't know if the answer isn't there. This stops it from guessing.",
    },
    {
      at: 'user_message = f"',
      trig: 'augment',
      set: { user_message: str(userMessage) },
      exp: 'Augment: the top 2 documents slide into the message, right above the question. Now the facts sit in front of the AI, like an open-book exam.',
    },
    {
      at: 'messages = [{"role"',
      trig: 'messages',
      set: { messages: '[{"role": "system", …}, {"role": "user", …}]' },
      exp: 'Pack both into the usual messages list: the rule is the system message, and context plus question is the user message.',
    },
    {
      at: 'response = client.chat.completions.create(',
      trig: 'generate',
      set: { response: '<ChatCompletion>' },
      exp: 'Generate: send the messages to gpt-4o-mini (API call 3 of 3). It reads the context, then writes its answer.',
    },
    {
      at: 'print("Answer:"',
      trig: 'answer',
      out: `Answer: ${s.answer}`,
      exp: s.answerNote,
    },
    {
      at: 'print("Answer:"',
      trig: 'recap',
      exp: 'What you learned: 1) embeddings turn text into numbers, and similar meanings get similar numbers; 2) similarity ranks the documents and we keep the top 2; 3) the prompt says: answer only from the context.',
    },
  ];

  return buildTrace(defs);
}

export const ragCodeTrace = ragSteps(RAG_STORIES[0]);

// The question is the only thing that changes, and it appears once in the code,
// so each variant's inputValue is its question (the code panel shows it).
export const ragCodeVariants: TraceVariant[] = RAG_STORIES.map((s, i) => ({
  id: s.id,
  label: s.question,
  inputValue: s.question,
  steps: i === 0 ? ragCodeTrace : ragSteps(s),
}));
