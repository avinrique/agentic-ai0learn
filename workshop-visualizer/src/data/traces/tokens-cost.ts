import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';
import { tokensCostCode } from '@/data/code-snippets/tokens-cost';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 12 – Code: Tokens & Cost
//
// Same program for every variant; only the question (and so the answer and the
// token counts) changes. The question literal is each variant's inputValue, so
// the code panel shows the active question. The pasted-paragraph variant spans
// several lines, so each variant's steps are built against its own shown code.
//
// Token counts are real o200k_base counts (tiktoken). prompt_tokens = estimate
// + 7: the chat format adds 3 tokens per message + 1 for the role "user" + 3 to
// start the reply. Answers are realistic examples, counted the same way.
// ─────────────────────────────────────────────────────────────────────────────

interface StepDef {
  at: string; // a substring that appears on exactly one line of the shown code
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig: string;
}

function makeLineOf(code: string) {
  const lines = code.split('\n');
  return (marker: string): number => {
    const hits = lines.map((l, i) => (l.includes(marker) ? i + 1 : 0)).filter(Boolean);
    if (hits.length !== 1) throw new Error(`tokens-cost: marker "${marker}" found on ${hits.length} lines`);
    return hits[0];
  };
}

function buildTrace(code: string, defs: StepDef[]): TraceStep[] {
  const lineOf = makeLineOf(code);
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

/** Python-style string value for the Variables panel. */
const str = (s: string) => JSON.stringify(s);

// ── Money maths (exact) ─────────────────────────────────────────────────────
/** Example prices in US cents per 1M tokens (gpt-4o-mini: $0.15 in, $0.60 out). */
export const PRICE_CENTS = { input: 15, output: 60 };
/** tokens ÷ 1,000,000 × price, as an exact number of 1/100,000,000ths of a dollar. */
const units = (tokens: number, cents: number) => tokens * cents;
/** Exact dollars as a plain decimal string, e.g. 2730 → "0.0000273". */
export function dollars(u: number): string {
  const s = String(u).padStart(9, '0');
  const whole = s.slice(0, -8);
  const frac = s.slice(-8).replace(/0+$/, '');
  return frac ? `${Number(whole)}.${frac}` : String(Number(whole));
}

export interface TokensCostScene {
  question: string;
  answer: string;
  /** The first token bricks of the question (all of them when it is short). */
  pieces: string[];
  ids: number[];
  estimate: number;
  prompt: number;
  completion: number;
  inUnits: number;
  outUnits: number;
  /** What the program prints (checked against a local run with a fake client). */
  printedCost: string;
  printed1000: string;
  /** Rounded cost of 1,000,000 such calls, for the explanation and the stack. */
  million: string;
  /** Illustrative input tokens for turns 1–4 of a chat that keeps re-sending history. */
  turns: number[];
}

interface Story extends Omit<TokensCostScene, 'inUnits' | 'outUnits' | 'turns'> {
  id: string;
  label: string;
  literal: string; // how the question looks in the code (the variant's inputValue)
  notes: {
    question: string;
    writing: string;
    answer: string;
    outCost: string;
    costPrint: string;
    tips: string;
  };
}

const FOLLOW_UP = 18; // an illustrative follow-up question, with its message wrapper

function scene(s: Story): TokensCostScene {
  const turns = [0, 1, 2, 3].map((k) => s.prompt + k * (s.completion + FOLLOW_UP));
  return {
    question: s.question,
    answer: s.answer,
    pieces: s.pieces,
    ids: s.ids,
    estimate: s.estimate,
    prompt: s.prompt,
    completion: s.completion,
    inUnits: units(s.prompt, PRICE_CENTS.input),
    outUnits: units(s.completion, PRICE_CENTS.output),
    printedCost: s.printedCost,
    printed1000: s.printed1000,
    million: s.million,
    turns,
  };
}

const DEFAULT_LITERAL = '"Explain what a black hole is in 2 sentences."';

function tokensCostSteps(s: Story): TraceStep[] {
  const sc = scene(s);
  const total = s.prompt + s.completion;
  const inCost = dollars(sc.inUnits);
  const outCost = dollars(sc.outUnits);
  const allCost = dollars(sc.inUnits + sc.outUnits);
  const inPct = Math.round((sc.inUnits / (sc.inUnits + sc.outUnits)) * 100);
  const code = tokensCostCode.split(DEFAULT_LITERAL).join(s.literal);

  const defs: StepDef[] = [
    {
      at: '# part1/tokens_cost.py',
      trig: 'intro',
      exp: "What's new: every API call is measured in tokens, and tokens cost money. Today we count the tokens in one call and work out exactly what it cost.",
    },
    {
      at: 'import tiktoken',
      trig: 'setup-tiktoken',
      set: { tiktoken: '<module tiktoken>' },
      exp: "tiktoken is OpenAI's token counter. It cuts text into tokens right on your computer, for free, without calling the API. It came in the toolbox we filled in Setup.",
    },
    {
      at: 'client = OpenAI()',
      trig: 'setup-client',
      set: { OpenAI: '<class OpenAI>', client: '<OpenAI client>' },
      exp: 'Same start as Basic API Call: load the OpenAI library and create the client, our phone line to the AI.',
    },
    {
      at: 'question = ',
      trig: 'question',
      set: { question: str(s.question) },
      exp: s.notes.question,
    },
    {
      at: 'enc = tiktoken.get_encoding("o200k_base")',
      trig: 'encoder',
      set: { enc: "<Encoding 'o200k_base'>" },
      exp: 'Load the tokenizer called o200k_base: the brick-cutting rules the gpt-4o models use. Other models may cut text differently, so their counts can differ.',
    },
    {
      at: 'estimate = len(enc.encode(question))',
      trig: 'bricks',
      set: { estimate: String(s.estimate) },
      exp: `enc.encode cuts the question into token bricks, each with an ID number, like the LEGO bricks in lesson 1. len() counts them: ${s.estimate} tokens.`,
    },
    {
      at: 'print(f"Estimated input tokens:',
      trig: 'estimate',
      out: `Estimated input tokens: ${s.estimate}`,
      exp: "Print the count. It's only an estimate: we counted before sending, and the API adds a few tokens of its own. We'll soon see how many.",
    },
    {
      at: 'response = client.chat.completions.create(',
      trig: 'send',
      exp: 'Send it. The API runs a token meter with two lanes, like a shop till: IN counts what we send, OUT counts what the AI writes back.',
    },
    {
      at: 'response = client.chat.completions.create(',
      trig: 'writing',
      set: { response: '<ChatCompletion>' },
      exp: s.notes.writing,
    },
    {
      at: 'print("Answer:"',
      trig: 'answer',
      out: `Answer: ${s.answer}`,
      exp: s.notes.answer,
    },
    {
      at: 'usage = response.usage',
      trig: 'receipt',
      set: {
        usage: `CompletionUsage(prompt_tokens=${s.prompt}, completion_tokens=${s.completion}, total_tokens=${total})`,
      },
      exp: 'Every response comes with a receipt: response.usage. It holds the EXACT token counts the API used, and those are what you pay for.',
    },
    {
      at: 'print("Input tokens (prompt):"',
      trig: 'receipt-in',
      out: `Input tokens (prompt): ${s.prompt}`,
      exp: `prompt_tokens = ${s.prompt}: the input. tiktoken counted ${s.estimate}; the API added ${s.prompt - s.estimate} more for the "envelope" around our message (its role label and markers).`,
    },
    {
      at: 'print("Output tokens (completion):"',
      trig: 'receipt-out',
      out: `Output tokens (completion): ${s.completion}`,
      exp: `completion_tokens = ${s.completion}: the output, every token the AI wrote. Only the API can tell you this one: nobody knows an answer's length before it's written.`,
    },
    {
      at: 'print("Total tokens:"',
      trig: 'receipt-total',
      out: `Total tokens: ${total}`,
      exp: `total_tokens is simply both added together: ${s.prompt} + ${s.completion} = ${total} tokens for this call.`,
    },
    {
      at: 'INPUT_PRICE_PER_MILLION = 0.15',
      trig: 'price-in',
      set: { INPUT_PRICE_PER_MILLION: '0.15' },
      exp: 'Prices are per 1 million tokens. Our example price for gpt-4o-mini input is $0.15 per million. Prices change, so always check the pricing page.',
    },
    {
      at: 'OUTPUT_PRICE_PER_MILLION = 0.60',
      trig: 'price-out',
      set: { OUTPUT_PRICE_PER_MILLION: '0.6' },
      exp: 'Output costs 4× more: $0.60 per million. The model reads your whole input in one go, but writes its answer one token at a time, which is more work.',
    },
    {
      at: 'input_cost = ',
      trig: 'cost-in',
      set: { input_cost: inCost },
      exp: `The cost formula: tokens ÷ 1,000,000 × price. Input: ${s.prompt} ÷ 1,000,000 × $0.15 = $${inCost}. (1_000_000 is 1000000 with easy-to-read underscores.)`,
    },
    {
      at: 'output_cost = ',
      trig: 'cost-out',
      set: { output_cost: outCost },
      exp: `Same formula for output: ${s.completion} ÷ 1,000,000 × $0.60 = $${outCost}. ${s.notes.outCost}`,
    },
    {
      at: 'cost = input_cost + output_cost',
      trig: 'cost-total',
      set: { cost: allCost },
      exp: `Add the two lanes: $${inCost} + $${outCost} = $${allCost}. The bar shows the split: ${inPct}% input, ${100 - inPct}% output.`,
    },
    {
      at: 'print(f"This call cost:',
      trig: 'cost-print',
      out: `This call cost: $${s.printedCost}`,
      exp: s.notes.costPrint,
    },
    {
      at: 'print(f"1,000 calls like this:',
      trig: 'stack',
      out: `1,000 calls like this: $${s.printed1000}`,
      exp: `But apps make lots of calls. 1,000 calls like this cost $${s.printed1000}, and a million would cost about $${s.million}. Tiny costs add up!`,
    },
    {
      at: 'print(f"1,000 calls like this:',
      trig: 'history',
      exp: 'Chats add up even faster. Remember Context & Memory? Every turn re-sends the whole history, so the input grows each turn, and you pay for all of it again.',
    },
    {
      at: 'print(f"1,000 calls like this:',
      trig: 'tips',
      exp: s.notes.tips,
    },
    {
      at: 'print(f"1,000 calls like this:',
      trig: 'recap',
      exp: 'What you learned: 1) the API measures text in tokens, input and output; 2) tiktoken estimates before sending, response.usage gives exact counts; 3) cost = tokens ÷ 1M × price, and it adds up.',
    },
  ];

  return buildTrace(code, defs);
}

// ── The three questions ─────────────────────────────────────────────────────

const BLACK_HOLE: Story = {
  id: 'default',
  label: 'Black hole in 2 sentences',
  literal: DEFAULT_LITERAL,
  question: 'Explain what a black hole is in 2 sentences.',
  answer:
    'A black hole is a place in space where gravity pulls so hard that nothing, not even light, can escape. It forms when a very massive star runs out of fuel and collapses in on itself.',
  pieces: ['Explain', ' what', ' a', ' black', ' hole', ' is', ' in', ' ', '2', ' sentences', '.'],
  ids: [176289, 1412, 261, 5960, 22985, 382, 306, 220, 17, 40536, 13],
  estimate: 11,
  prompt: 18,
  completion: 41,
  printedCost: '0.000027',
  printed1000: '0.03',
  million: '27',
  notes: {
    question: "Here's the question we'll send. Before sending it, let's count how many tokens it is.",
    writing: 'The AI writes its answer one token at a time (remember lesson 1?). Each new token clicks the OUT counter up by one.',
    answer: "Print the answer: two sentences, just as we asked. Now let's find out exactly how many tokens this trip used.",
    outCost: 'More tokens AND a higher price, so output is most of this bill.',
    costPrint: ':.6f prints 6 decimal places: $0.000027. That is less than a hundredth of one cent. Tiny!',
    tips: 'Three ways to spend less: shorter prompts, ask for shorter answers (our "in 2 sentences" already does!), and pick a cheaper model when it\'s good enough.',
  },
};

const DRAGON_STORY = [
  'High in the Misty Mountains lived a young dragon named Ember. Unlike the other dragons, who guarded piles of gold, Ember collected something stranger: lost sounds. She kept the echo of a waterfall in a glass jar, the giggle of a child in a seashell, and the first chirp of a baby bird inside a hollow acorn.',
  'One winter, a strange silence fell over the valley below. The river stopped singing, the wind forgot how to whistle, and the village bells hung quiet. Without sound, the shepherds could not call their sheep, and the children could not hear their bedtime songs.',
  'Ember watched from her cave and felt her heart sink. She knew her collection could help, but giving it away meant losing the treasures she loved most. For three days she paced back and forth, her tail sweeping snow from the ledge.',
  'On the fourth morning, a little girl named Rosa climbed all the way up the mountain. Her cheeks were red and her boots were soaked, but she did not turn back. She looked Ember in the eye and whispered, "Please. We miss the music."',
  "Ember took a deep breath, which for a dragon is quite a lot of air. Then she flew down to the valley with her jars, shells and acorns. One by one, she opened them. The waterfall's echo splashed into the river, and it began to sing again. The giggle floated into the schoolyard. The chirp woke the birds in every tree.",
  "The valley burst back into sound, louder and happier than ever. Ember's cave was empty now, but she did not mind. Every evening, the villagers climbed the mountain to sing for her, and Ember learned that shared sounds were the best treasure of all.",
].join('\n\n');

const DRAGON: Story = {
  id: 'variant2',
  label: '300-word dragon story',
  literal: '"Write a 300-word story about a dragon."',
  question: 'Write a 300-word story about a dragon.',
  answer: DRAGON_STORY,
  pieces: ['Write', ' a', ' ', '300', '-word', ' story', ' about', ' a', ' dragon', '.'],
  ids: [10930, 261, 220, 4095, 80202, 4869, 1078, 261, 45342, 13],
  estimate: 10,
  prompt: 17,
  completion: 354,
  printedCost: '0.000215',
  printed1000: '0.21',
  million: '215',
  notes: {
    question: 'Our question: a 300-word story. A short question that asks for a LONG answer. Watch what that does to the bill.',
    writing: 'The AI writes its story one token at a time (remember lesson 1?). Each new token clicks the OUT counter up. A 300-word story means hundreds of clicks!',
    answer: 'Print the story: about 290 words (the AI gets close to 300, not exact). Every word of it was output tokens.',
    outCost: 'That long story is almost the whole bill: 99% of it!',
    costPrint: ':.6f prints 6 decimal places: $0.000215. About 8× the black-hole question, and almost all of it is the long answer.',
    tips: 'Three ways to spend less: shorter prompts, shorter answers (a 100-word story would cost about a third), and a cheaper model when it\'s good enough.',
  },
};

const OCTOPUS_PARAGRAPH = [
  'Summarise this in one sentence:',
  '',
  'Octopuses are some of the cleverest animals in the ocean. They have',
  'eight flexible arms, and each arm is lined with hundreds of suckers',
  "that can taste and feel whatever they touch. Most of an octopus's",
  'nerve cells are in its arms rather than its head, so each arm can',
  'explore on its own while the brain plans the next move. Octopuses can',
  'change the colour and texture of their skin in a fraction of a second,',
  'which lets them hide against rocks, coral or sand. When a predator gets',
  'too close, many species squirt a cloud of dark ink and jet away.',
  'Scientists have watched octopuses open jars, escape from tanks and',
  'carry coconut shells to use as portable shelters. Some even learn to',
  'recognise individual aquarium keepers and treat them differently.',
  'Despite all this intelligence, most octopuses live only one or two',
  'years. They have three hearts and blue blood, which carries oxygen',
  'well in cold water. And because they have no bones, an octopus can',
  'squeeze through any gap bigger than its beak, the only hard part of',
  'its body.',
].join('\n');

const SUMMARY: Story = {
  id: 'variant3',
  label: 'Summarise a long paragraph',
  literal: `"""${OCTOPUS_PARAGRAPH}"""`,
  question: OCTOPUS_PARAGRAPH,
  answer:
    'Octopuses are clever, shape-shifting ocean animals with thinking arms, three hearts and blue blood that can hide, escape and even use tools, yet most live only a year or two.',
  pieces: [
    'Summ', 'ar', 'ise', ' this', ' in', ' one', ' sentence', ':\n\n', 'Oct', 'op', 'uses', ' are',
    ' some', ' of', ' the', ' clever', 'est', ' animals', ' in', ' the', ' ocean', '.', ' They', ' have',
  ],
  ids: [
    64614, 277, 1096, 495, 306, 1001, 21872, 1402, 18764, 467, 5977, 553,
    1236, 328, 290, 42218, 376, 15022, 306, 290, 25472, 13, 3164, 679,
  ],
  estimate: 243,
  prompt: 250,
  completion: 39,
  printedCost: '0.000061',
  printed1000: '0.06',
  million: '61',
  notes: {
    question: 'Now the question is a pasted paragraph of about 180 words, plus "Summarise this in one sentence." A LONG question that asks for a SHORT answer.',
    writing: 'The AI writes its one-sentence summary one token at a time. Each new token clicks the OUT counter up. This time the IN lane is the big one.',
    answer: 'Print the summary: one sentence, just as we asked. A long question, a short answer.',
    outCost: 'Output is pricier per token, but our long input still costs more this time.',
    costPrint: ':.6f prints 6 decimal places: $0.000061. Still less than a hundredth of a cent, even with a whole paragraph.',
    tips: 'Three ways to spend less: shorter prompts (paste only the part you need), shorter answers, and a cheaper model when it\'s good enough.',
  },
};

const STORIES = [BLACK_HOLE, DRAGON, SUMMARY];

/** Per-variant data the animation needs (token bricks, counts, money), keyed by variant id. */
export const tokensCostScenes: Record<string, TokensCostScene> = Object.fromEntries(
  STORIES.map((s) => [s.id, scene(s)]),
);

export const tokensCostTrace = tokensCostSteps(BLACK_HOLE);

export const tokensCostVariants: TraceVariant[] = STORIES.map((s) => ({
  id: s.id,
  label: s.label,
  inputValue: s.literal,
  steps: s.id === 'default' ? tokensCostTrace : tokensCostSteps(s),
}));
