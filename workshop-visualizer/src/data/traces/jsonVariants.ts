import { TraceStep, TraceVariant } from '@/stores/tracerStore';
import { buildSteps } from './basicApiVariants';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 4 – JSON Output. One builder for every example, so line numbers never
// drift. The user prompt text is the variant's inputValue (it appears in the code).
// ─────────────────────────────────────────────────────────────────────────────
const JSON_SYSTEM = 'You are a helpful assistant that only responds in valid JSON.';

interface JsonExample {
  prompt: string;
  reply: object;
  userExp: string;
  keysExp: string;
  thinkExp: string;
  printExp: string;
}

function jsonOutputSteps(ex: JsonExample): TraceStep[] {
  const raw = JSON.stringify(ex.reply);
  return buildSteps([
    {
      line: 1,
      trig: 'intro',
      exp: "What we'll build: ask the AI for data in JSON, a format programs can read easily. New: the response_format setting.",
    },
    {
      line: 1,
      trig: 'jsonIntro',
      exp: 'What is JSON? Text made of keys and values, like {"difficulty": "easy"}. It looks a lot like a Python dictionary.',
    },
    {
      line: 2,
      set: { OpenAI: '<class OpenAI>' },
      trig: 'import',
      exp: 'Same as before: load the OpenAI library.',
    },
    {
      line: 3,
      set: { client: 'OpenAI(api_key=sk-...)' },
      trig: 'createClient',
      exp: 'Same as before: create the client, our phone line to OpenAI.',
    },
    {
      line: 5,
      out: 'Asking the AI for structured JSON output...',
      trig: 'printStart',
      exp: 'A print so we can see the program running. Check the Output panel.',
    },
    {
      line: 7,
      set: { system_prompt: `"${JSON_SYSTEM}"` },
      trig: 'addSystemMsg',
      exp: 'We save the system prompt in a variable. It tells the AI to answer only in valid JSON.',
    },
    {
      line: 9,
      set: { user_prompt: `"${ex.prompt}"` },
      trig: 'addUserMsg',
      exp: ex.userExp,
    },
    {
      line: 9,
      trig: 'highlightKeys',
      exp: ex.keysExp,
    },
    {
      line: 11,
      trig: 'startRequest',
      exp: 'The API call starts here, the same way as before.',
    },
    {
      line: 12,
      set: { model: '"gpt-4o-mini"' },
      trig: 'selectModel',
      exp: 'The same fast, cheap model: gpt-4o-mini.',
    },
    {
      line: 14,
      trig: 'packSystem',
      exp: 'The system message. Its content is the variable system_prompt instead of text typed in place. It works exactly the same.',
    },
    {
      line: 15,
      trig: 'packUser',
      exp: 'The user message, using the variable user_prompt.',
    },
    {
      line: 17,
      set: { response_format: '{"type": "json_object"}' },
      trig: 'buildMessages',
      exp: 'NEW: response_format={"type": "json_object"} turns on JSON mode. Compare the two boxes: without it the AI may chat; with it the reply must be valid JSON.',
    },
    {
      line: 17,
      trig: 'whyBoth',
      exp: 'Why use both the prompt and JSON mode? The prompt says WHAT data we want (the keys). JSON mode makes sure the format is valid.',
    },
    {
      line: 11,
      trig: 'apiCall',
      exp: 'The request goes to OpenAI with both messages and JSON mode switched on.',
    },
    {
      line: 11,
      trig: 'apiProcessing',
      exp: ex.thinkExp,
    },
    {
      line: 11,
      set: { response: '<ChatCompletion object>' },
      trig: 'apiCallComplete',
      exp: 'The answer arrives and is saved in response.',
    },
    {
      line: 20,
      out: "\nAI's JSON Response:",
      trig: 'printHeading',
      exp: 'This print writes a heading, with an empty line before it.',
    },
    {
      line: 21,
      set: { raw_json: raw },
      out: raw,
      trig: 'extractContent',
      exp: ex.printExp,
    },
    {
      line: 21,
      trig: 'isString',
      exp: 'Careful: this is still just text (a string). To use it as a Python dictionary we need json.loads(). The challenge lesson does exactly that.',
    },
    {
      line: 21,
      trig: 'summary',
      exp: 'What you learned: 1) JSON is data made of keys and values. 2) Name the keys you want in the prompt. 3) response_format turns on JSON mode for valid JSON.',
    },
  ]);
}

const Q_PROMPT =
  "Give me 3 Python interview questions in JSON format. Use the keys: 'question' and 'difficulty'.";
const Q_REPLY = {
  questions: [
    { question: 'What is a list comprehension?', difficulty: 'easy' },
    { question: 'What are decorators?', difficulty: 'medium' },
    { question: 'Explain the GIL.', difficulty: 'hard' },
  ],
};

const R_PROMPT = "List the ingredients for pancakes in JSON format. Use the keys: 'item' and 'amount'.";
const R_REPLY = {
  ingredients: [
    { item: 'flour', amount: '1 cup' },
    { item: 'milk', amount: '1 cup' },
    { item: 'egg', amount: '1' },
    { item: 'sugar', amount: '2 tbsp' },
    { item: 'baking powder', amount: '2 tsp' },
  ],
};

const C_PROMPT =
  "Give me 3 of the world's biggest cities in JSON format. Use the keys: 'city', 'country' and 'population'.";
const C_REPLY = {
  cities: [
    { city: 'Tokyo', country: 'Japan', population: 37115000 },
    { city: 'Delhi', country: 'India', population: 33807000 },
    { city: 'Shanghai', country: 'China', population: 29868000 },
  ],
};

export const jsonOutputTrace: TraceStep[] = jsonOutputSteps({
  prompt: Q_PROMPT,
  reply: Q_REPLY,
  userExp: 'The user prompt is saved in a variable too. It asks for 3 Python interview questions.',
  keysExp:
    "It also names the keys we want: 'question' and 'difficulty'. Naming the keys tells the AI the exact shape of the data.",
  thinkExp:
    'The model writes its answer one piece at a time, and JSON mode keeps it valid JSON: no chatty sentences around it.',
  printExp:
    'We print the reply text. You can see JSON: curly braces, keys, and values. The AI also wrapped the list in a key it chose: "questions".',
});

export const jsonOutputVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'Python interview questions',
    inputValue: Q_PROMPT,
    steps: jsonOutputTrace,
  },
  {
    id: 'recipe',
    label: 'Pancake ingredients',
    inputValue: R_PROMPT,
    steps: jsonOutputSteps({
      prompt: R_PROMPT,
      reply: R_REPLY,
      userExp: 'The user prompt is saved in a variable too. This time it asks for the ingredients of pancakes.',
      keysExp:
        "It names the keys we want: 'item' and 'amount'. Every ingredient will come back with exactly these two keys.",
      thinkExp:
        'The model lists the ingredients as JSON. We did not say how many, so the AI decides (here: 5).',
      printExp:
        'We print the reply text. Each ingredient is a small {"item": ..., "amount": ...} object inside a list the AI called "ingredients".',
    }),
  },
  {
    id: 'cities',
    label: '3 big cities with population',
    inputValue: C_PROMPT,
    steps: jsonOutputSteps({
      prompt: C_PROMPT,
      reply: C_REPLY,
      userExp: 'The user prompt is saved in a variable too. It asks for 3 of the biggest cities in the world.',
      keysExp:
        "This time we name THREE keys: 'city', 'country' and 'population'. You can ask for as many keys as you need.",
      thinkExp:
        'The model writes the cities as JSON. Population is a number, so JSON writes it without quotes.',
      printExp:
        'We print the reply text. Look at population: 37115000 has no quotes, because it is a number, not text. (The numbers are rough estimates.)',
    }),
  },
];
