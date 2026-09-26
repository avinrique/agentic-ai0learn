import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';

// ─────────────────────────────────────────────────────────────────────────────
// Shared step builder for the Basic API and JSON Output lessons.
// Each step lists only the variables it sets; they carry forward automatically
// and isNew / isChanged are computed for us.
// ─────────────────────────────────────────────────────────────────────────────
export interface StepDef {
  line: number;
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig?: string;
}

export function buildSteps(defs: StepDef[]): TraceStep[] {
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
    const step: TraceStep = {
      lineNumber: d.line,
      variables: vars,
      output: d.out ?? '',
      explanation: d.exp,
    };
    if (d.trig) step.animationTrigger = d.trig;
    return step;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 1 – Basic API Call. One builder, so line numbers never drift between
// examples. The prompt text is the variant's inputValue (it appears in the code).
// ─────────────────────────────────────────────────────────────────────────────
interface BasicExample {
  prompt: string;
  reply: string;
  contentExp: string;
  thinkExp: string;
  printExp: string;
}

function basicApiSteps(ex: BasicExample): TraceStep[] {
  const messages = `[{"role": "user", "content": ${JSON.stringify(ex.prompt)}}]`;
  return buildSteps([
    {
      line: 1,
      trig: 'intro',
      exp: "What we'll build: a tiny program that sends one question to an AI and prints its answer. This is your first API call, so every line is new.",
    },
    {
      line: 1,
      trig: 'intro',
      exp: 'Line 1 is a comment. Python skips any line that starts with #. It is only a note for humans (here, the file name).',
    },
    {
      line: 2,
      set: { OpenAI: '<class OpenAI>' },
      trig: 'import',
      exp: 'This line loads the OpenAI library. A library is ready-made code someone else wrote, so we do not have to write the internet part ourselves.',
    },
    {
      line: 3,
      set: { client: 'OpenAI(api_key=sk-...)' },
      trig: 'createClient',
      exp: 'We create a client and store it in the variable client. Think of the client as a phone line to OpenAI.',
    },
    {
      line: 3,
      trig: 'apiKey',
      exp: 'Where is the password? OpenAI() quietly reads your secret key from an environment variable called OPENAI_API_KEY. Never paste that key into your code.',
    },
    {
      line: 5,
      out: 'Sending a basic prompt to the AI...',
      trig: 'printStart',
      exp: 'This print shows a message so we know the program has started. Look at the terminal.',
    },
    {
      line: 7,
      trig: 'startRequest',
      exp: 'client.chat.completions.create( starts a request to the AI. The indented lines below are the details we pack into it.',
    },
    {
      line: 8,
      set: { model: '"gpt-4o-mini"' },
      trig: 'selectModel',
      exp: 'model= picks which AI answers. "gpt-4o-mini" is a small, fast and cheap model, which is perfect for learning.',
    },
    {
      line: 9,
      trig: 'buildMessages',
      exp: 'messages= is a list of messages: the chat we send to the AI. Here the list holds just one message.',
    },
    {
      line: 10,
      set: { messages },
      trig: 'msgRole',
      exp: 'Each message is a dictionary with two keys. "role" says who is talking. "user" means you, the person asking.',
    },
    {
      line: 10,
      trig: 'msgContent',
      exp: ex.contentExp,
    },
    {
      line: 7,
      trig: 'apiCall',
      exp: "Now the request travels over the internet to OpenAI's servers. Our program waits on this line until an answer comes back.",
    },
    {
      line: 7,
      trig: 'apiProcessing',
      exp: ex.thinkExp,
    },
    {
      line: 7,
      set: { response: '<ChatCompletion object>' },
      trig: 'apiCallComplete',
      exp: 'The answer arrives and is saved in the variable response. It is an object with extra details inside, not just plain text.',
    },
    {
      line: 14,
      out: "\nAI's Response:",
      trig: 'printHeading',
      exp: 'This print writes a heading. The \\n at the start adds an empty line before it.',
    },
    {
      line: 15,
      set: { content: ex.reply },
      trig: 'extractContent',
      exp: 'response.choices[0].message.content digs into the response to get just the text. choices[0] means "the first answer".',
    },
    {
      line: 15,
      out: ex.reply,
      trig: 'printOutput',
      exp: ex.printExp,
    },
    {
      line: 15,
      trig: 'summary',
      exp: 'What you learned: 1) the client talks to OpenAI. 2) messages is a list of {role, content}. 3) The reply text is in response.choices[0].message.content.',
    },
  ]);
}

const POEM_PROMPT = 'Write a funny 3-line poem about AI and pizza.';
const POEM =
  "Oh AI, you slice through data with ease,\nLike mozzarella on a pizza breeze,\nBut you'll never taste the cheesy goodness, please!";

const EXPLAIN_PROMPT = 'Explain what an API is in one sentence.';
const EXPLAIN =
  'An API is a menu of requests one program can make to another, like a waiter who takes your order to the kitchen and brings back your food.';

const TRANSLATE_PROMPT = "Translate 'Good morning, how are you?' into Spanish.";
const TRANSLATE = 'Buenos días, ¿cómo estás?';

export const basicApiTrace: TraceStep[] = basicApiSteps({
  prompt: POEM_PROMPT,
  reply: POEM,
  contentExp: '"content" is the actual text of the message. Here it asks for a funny 3-line poem about AI and pizza.',
  thinkExp: "On OpenAI's side, the model reads our message and writes a reply, a few words (tokens) at a time.",
  printExp: 'print shows the poem in the terminal. That is one full round trip: your code, to OpenAI, and back.',
});

export const basicApiVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'Funny poem about AI and pizza',
    inputValue: POEM_PROMPT,
    steps: basicApiTrace,
  },
  {
    id: 'explain',
    label: 'Explain an API in one sentence',
    inputValue: EXPLAIN_PROMPT,
    steps: basicApiSteps({
      prompt: EXPLAIN_PROMPT,
      reply: EXPLAIN,
      contentExp: '"content" is the actual text of the message. This time we ask for a one-sentence explanation of what an API is.',
      thinkExp: 'The model writes one sentence, a few words (tokens) at a time. "In one sentence" in our prompt keeps the answer short.',
      printExp: 'print shows the explanation in the terminal. Same code as the poem: only the content text changed, and so did the answer.',
    }),
  },
  {
    id: 'translate',
    label: 'Translate into Spanish',
    inputValue: TRANSLATE_PROMPT,
    steps: basicApiSteps({
      prompt: TRANSLATE_PROMPT,
      reply: TRANSLATE,
      contentExp: '"content" is the actual text of the message. Here it asks the AI to translate a greeting into Spanish.',
      thinkExp: 'The model writes the Spanish sentence. It is very short, so it only needs a handful of tokens.',
      printExp: 'print shows the Spanish sentence in the terminal. One API call can do many jobs: poems, explanations, translations.',
    }),
  },
];
