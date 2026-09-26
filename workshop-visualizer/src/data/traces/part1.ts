import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';

// ─────────────────────────────────────────────────────────────────────────────
// Builder: each step only lists the variables it sets. Variables carry forward
// to later steps automatically, and isNew / isChanged are computed for us.
// ─────────────────────────────────────────────────────────────────────────────
interface StepDef {
  line: number;
  exp: string;
  set?: Record<string, string>;
  out?: string;
  trig?: string;
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
// Lesson 1 – basicApiTrace
// ─────────────────────────────────────────────────────────────────────────────
export { basicApiTrace } from './basicApiVariants';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 2 – systemPromptsTrace (+ variants in systemPromptVariants.ts)
// Every variant asks the SAME question; only the system prompt changes.
// ─────────────────────────────────────────────────────────────────────────────
export const SP_QUESTION = 'Explain what a list comprehension is with an example.';
export const SP_DEFAULT_SYSTEM = 'You are a friendly Python tutor.';
const TUTOR_REPLY =
  'A list comprehension is a short way to build a list!\n\nExample: squares = [x**2 for x in range(10)]\nThis creates [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]';

export interface SystemPromptParams {
  system: string; // the system prompt text (the string the code panel swaps)
  reply: string; // what the AI answers in this role
  roleExp: string; // 2nd step on the system line
  thinkExp: string; // while the model is working
  headingExp: string; // the fixed print heading
  printedExp: string; // the reply is printed
  compareExp: string; // compare with no system prompt
}

export function systemPromptsSteps(p: SystemPromptParams): TraceStep[] {
  const sys = { role: 'system', content: p.system };
  const user = { role: 'user', content: SP_QUESTION };
  return buildTrace([
    {
      line: 1,
      exp: "What we'll build: the same program as Lesson 1, plus ONE new message. That message gives the AI a role to play before it answers.",
    },
    {
      line: 2,
      set: { OpenAI: '<class OpenAI>' },
      trig: 'import',
      exp: 'Same as Lesson 1: load the OpenAI library.',
    },
    {
      line: 3,
      set: { client: 'OpenAI(api_key=sk-...)' },
      trig: 'createClient',
      exp: 'Same as Lesson 1: create the client, our phone line to OpenAI.',
    },
    {
      line: 5,
      out: "Using a system prompt to set the AI's role...",
      trig: 'createClient',
      exp: 'A print so we can see the program running. Check the Output panel.',
    },
    {
      line: 7,
      trig: 'createClient',
      exp: 'The API call starts here, exactly like in Lesson 1.',
    },
    {
      line: 8,
      set: { model: '"gpt-4o-mini"' },
      trig: 'createClient',
      exp: 'The same fast, cheap model as before: gpt-4o-mini.',
    },
    {
      line: 9,
      trig: 'createClient',
      exp: 'The messages list. This time it will hold TWO messages instead of one. See the two empty slots.',
    },
    {
      line: 10,
      set: { messages_display: JSON.stringify([sys]) },
      trig: 'addSystemMsg',
      exp: 'NEW: a message with the role "system". Think of it as a director\'s instruction card: it tells the AI who to be and how to behave.',
    },
    {
      line: 10,
      trig: 'addSystemMsg',
      exp: p.roleExp,
    },
    {
      line: 11,
      set: { messages_display: JSON.stringify([sys, user]) },
      trig: 'addUserMsg',
      exp: 'The "user" message is the question, just like in Lesson 1. It asks what a list comprehension is.',
    },
    {
      line: 11,
      trig: 'buildMessages',
      exp: 'Order matters: the system message comes first, then the user message. The AI reads the rules before it reads the question.',
    },
    {
      line: 7,
      trig: 'apiCall',
      exp: 'The request goes to OpenAI with both messages inside.',
    },
    {
      line: 7,
      trig: 'apiProcessing',
      exp: p.thinkExp,
    },
    {
      line: 7,
      set: { response: '<ChatCompletion object>' },
      trig: 'apiCallComplete',
      exp: 'The answer arrives and is saved in response.',
    },
    {
      line: 15,
      out: "\nPython Tutor's Response:",
      trig: 'apiCallComplete',
      exp: p.headingExp,
    },
    {
      line: 16,
      set: { content: p.reply },
      trig: 'extractContent',
      exp: 'Same as Lesson 1: response.choices[0].message.content gets the reply text out of the response.',
    },
    {
      line: 16,
      out: p.reply,
      trig: 'printOutput',
      exp: p.printedExp,
    },
    {
      line: 16,
      trig: 'compare',
      exp: p.compareExp,
    },
    {
      line: 16,
      trig: 'compare',
      exp: 'What you learned: 1) a "system" message sets the AI\'s role and rules. 2) It goes first in the list. 3) The user never sees it, but the AI follows it.',
    },
  ]);
}

export const systemPromptsTrace: TraceStep[] = systemPromptsSteps({
  system: SP_DEFAULT_SYSTEM,
  reply: TUTOR_REPLY,
  roleExp:
    'Here the instruction is "You are a friendly Python tutor." The AI puts on its tutor costume. The user never sees this card, but the AI follows it for the whole chat.',
  thinkExp:
    'The model reads the system message first, so it answers in the style of a friendly tutor: simple words and an example.',
  headingExp: 'This print writes a heading, with an empty line before it.',
  printedExp:
    'The answer is printed. Notice the friendly tone and the small code example. That is the tutor role at work.',
  compareExp:
    'Compare the two answers in the panel: same question, with and without the system message. One extra message changed the style of the whole answer.',
});

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 3 – conversationLoopTrace (+ variants)
// The `messages` variable is valid JSON so ConversationLoopAnim can draw it.
// ─────────────────────────────────────────────────────────────────────────────
const SYS_HELPER = { role: 'system', content: 'You are a helpful assistant.' };
const Q1_DEFAULT = 'What is Python?';
const A1_DEFAULT = 'Python is a high-level programming language...';

interface Turn2 {
  /** Turn-1 question/answer (defaults to the Python example). */
  q1?: string;
  a1?: string;
  /** Optional explanation for the turn-1 input step. */
  ask1Exp?: string;
  question: string;
  answer: string;
  askExp: string;
  sendExp: string;
  resultExp: string;
}

function conversationLoopSteps(t: Turn2): TraceStep[] {
  const Q1 = t.q1 ?? Q1_DEFAULT;
  const A1 = t.a1 ?? A1_DEFAULT;
  const m1 = [SYS_HELPER];
  const m2 = [...m1, { role: 'user', content: Q1 }];
  const m3 = [...m2, { role: 'assistant', content: A1 }];
  const m4 = [...m3, { role: 'user', content: t.question }];
  const m5 = [...m4, { role: 'assistant', content: t.answer }];
  const j = (m: object[]) => JSON.stringify(m);

  return buildTrace([
    {
      line: 1,
      exp: "What we'll build: a chatbot you can talk to again and again. New idea: the AI remembers nothing by itself, so WE keep the chat history in a list.",
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
      set: { messages: j(m1) },
      trig: 'initMessages',
      exp: "We create the messages list with one system message. This list is the chat history: our program's memory.",
    },
    {
      line: 7,
      out: "Chat started! Type 'quit' to exit.\n",
      trig: 'initMessages',
      exp: 'A print tells the user how to stop the chat. Look at the Output panel.',
    },
    {
      line: 9,
      trig: 'loopStart',
      exp: 'while True: repeats the indented lines below forever. One trip through the loop is one turn of the chat.',
    },
    {
      line: 10,
      set: { user_input: `"${Q1}"` },
      out: `You: ${Q1}`,
      trig: 'userInput1',
      exp: t.ask1Exp ?? `input() pauses and waits for the user to type. Here they type "${Q1}" and press Enter.`,
    },
    {
      line: 11,
      trig: 'userInput1',
      exp: 'This if checks whether the user typed "quit". .lower() makes the text lowercase, so "QUIT" works too.',
    },
    {
      line: 12,
      trig: 'userInput1',
      exp: 'break would leave the loop and end the chat. The user did not type quit, so this line is skipped.',
    },
    {
      line: 14,
      set: { messages: j(m2) },
      trig: 'appendUser1',
      exp: "append() adds the user's message to the end of the list. The list now has 2 messages: system + user.",
    },
    {
      line: 16,
      trig: 'apiCall1',
      exp: 'We call the API, the same way as in earlier lessons.',
    },
    {
      line: 18,
      trig: 'apiCall1',
      exp: 'Look at messages=messages: we send the WHOLE list, not just the newest question.',
    },
    {
      line: 16,
      set: { response: '<ChatCompletion object>' },
      trig: 'apiResponse1',
      exp: 'The reply comes back and is saved in response.',
    },
    {
      line: 21,
      set: { assistant_msg: `"${A1}"` },
      trig: 'apiResponse1',
      exp: 'We take the reply text out of the response and save it in assistant_msg.',
    },
    {
      line: 22,
      set: { messages: j(m3) },
      trig: 'appendAssistant1',
      exp: "KEY LINE: we also append the AI's answer to the list, with the role \"assistant\". The list now has 3 messages.",
    },
    {
      line: 22,
      trig: 'appendAssistant1',
      exp: 'Why save the answer? The AI forgets everything between calls. Next turn, this list is how it "remembers" what was said.',
    },
    {
      line: 23,
      out: `AI: ${A1}\n`,
      trig: 'printResponse1',
      exp: 'We print the answer. Turn 1 is done, and the loop jumps back to the top.',
    },
    {
      line: 10,
      set: { user_input: `"${t.question}"` },
      out: `You: ${t.question}`,
      trig: 'userInput2',
      exp: t.askExp,
    },
    {
      line: 14,
      set: { messages: j(m4) },
      trig: 'appendUser2',
      exp: 'The same append line runs again. The new question joins the list, which now has 4 messages.',
    },
    {
      line: 18,
      trig: 'apiCall2',
      exp: t.sendExp,
    },
    {
      line: 18,
      trig: 'apiCall2',
      exp: 'Notice the list grows every turn. A longer list means more tokens (pieces of text), so each request gets a little slower and costs a little more.',
    },
    {
      line: 22,
      set: { response: '<ChatCompletion object>', assistant_msg: `"${t.answer}"`, messages: j(m5) },
      trig: 'appendAssistant2',
      exp: 'The new answer is appended too. The list now has 5 messages, and it keeps growing each turn.',
    },
    {
      line: 23,
      out: `AI: ${t.answer}\n`,
      trig: 'appendAssistant2',
      exp: t.resultExp,
    },
    {
      line: 23,
      trig: 'appendAssistant2',
      exp: 'What you learned: 1) while True makes a chat loop. 2) We append both user and AI messages to one list. 3) We send the whole list every time. That list IS the memory.',
    },
  ]);
}

export const conversationLoopTrace: TraceStep[] = conversationLoopSteps({
  question: 'How is it different from Java?',
  answer: 'Python uses dynamic typing while Java uses static typing...',
  askExp:
    'Turn 2: the user types "How is it different from Java?". Notice the word Python is not in this question. What does "it" mean?',
  sendExp:
    'Again we send the whole list, all 4 messages. The AI can read the first question, so it knows "it" means Python.',
  resultExp:
    'The AI compared Python with Java. It understood "it" only because it saw the full history we sent.',
});

// Conversation Loop Variants
export const conversationLoopVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'How is it different from Java?',
    inputValue: 'How is it different from Java?',
    steps: conversationLoopTrace,
  },
  {
    id: 'context-break',
    label: 'Tell me about dogs',
    inputValue: 'Tell me about dogs',
    steps: conversationLoopSteps({
      question: 'Tell me about dogs',
      answer: 'Dogs are loyal, friendly animals that have lived with people for thousands of years...',
      askExp:
        'Turn 2: the user types "Tell me about dogs". This is a brand-new topic, not connected to Python.',
      sendExp:
        'We still send the whole list, all 4 messages. The Python chat is still inside, even though the new question is about dogs.',
      resultExp:
        'The AI simply answers about dogs. The old Python messages stay in the list, but they do not get in the way of a new topic.',
    }),
  },
  {
    id: 'whats-my-name',
    label: "Hi, I'm Priya → What's my name?",
    inputValue: "What's my name?",
    steps: conversationLoopSteps({
      q1: "Hi, I'm Priya!",
      a1: 'Nice to meet you, Priya! How can I help you today?',
      ask1Exp:
        'input() pauses and waits for the user to type. Here they introduce themselves: "Hi, I\'m Priya!"',
      question: "What's my name?",
      answer: 'Your name is Priya! You told me in your first message.',
      askExp:
        'Turn 2: the user asks "What\'s my name?". The AI forgot everything after the last call, so the only place the name still lives is our messages list.',
      sendExp:
        'We send all 4 messages again. Message [1] still says "Hi, I\'m Priya!", so the AI can read the name from it.',
      resultExp:
        'The AI answered "Priya". It did not remember; it read the name from the history we re-sent. Without the list, it could not know.',
    }),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 4 – jsonOutputTrace
// ─────────────────────────────────────────────────────────────────────────────
export { jsonOutputTrace } from './jsonVariants';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 5 – fewShotTrace (+ variants in fewShotVariants.ts)
// The task and examples stay the same; each variant changes the real question.
// ─────────────────────────────────────────────────────────────────────────────
const FS_SYS = {
  role: 'system',
  content: "You are a sentiment classifier. Respond with only 'Positive', 'Negative', or 'Neutral'.",
};
const FS_1U = { role: 'user', content: 'I love this product!' };
const FS_1A = { role: 'assistant', content: 'Positive' };
const FS_2U = { role: 'user', content: 'This is terrible.' };
const FS_2A = { role: 'assistant', content: 'Negative' };
export const FS_DEFAULT_QUESTION = "It's okay, not great.";
const fs = (...m: object[]) => JSON.stringify(m);

export interface FewShotParams {
  question: string; // the real question (the string the code panel swaps)
  label: string; // the AI's one-word answer
  realExp: string; // the real question is added
  thinkExp: string; // while the model is working
  replyExp: string; // the label arrives
  compareExp: string; // zero-shot vs few-shot
}

export function fewShotSteps(p: FewShotParams): TraceStep[] {
  const q = { role: 'user', content: p.question };
  return buildTrace([
    {
      line: 1,
      exp: "What we'll build: a sentiment classifier that labels text as Positive, Negative or Neutral. New idea: teach the AI by showing it examples first.",
    },
    {
      line: 2,
      set: { OpenAI: '<class OpenAI>' },
      exp: 'Same as before: load the OpenAI library.',
    },
    {
      line: 3,
      set: { client: 'OpenAI(api_key=sk-...)' },
      exp: 'Same as before: create the client, our phone line to OpenAI.',
    },
    {
      line: 5,
      out: 'Teaching the AI a new task (sentiment analysis) with examples...',
      exp: 'A print so we can see the program running. "Sentiment" means the feeling in a sentence: happy, unhappy, or in between.',
    },
    {
      line: 7,
      exp: 'This time we build the messages list BEFORE the API call and save it in a variable. It will hold a small, made-up conversation.',
    },
    {
      line: 8,
      set: { messages: fs(FS_SYS) },
      trig: 'addSystemMsg',
      exp: 'The system message sets the job: classify sentiment. It allows only three answers: Positive, Negative or Neutral.',
    },
    {
      line: 10,
      trig: 'addSystemMsg',
      exp: '# Example 1 is a comment. It is only a label for us; Python ignores it.',
    },
    {
      line: 11,
      set: { messages: fs(FS_SYS, FS_1U) },
      trig: 'addExample1User',
      exp: 'Example 1 starts with a user message: "I love this product!" This is a sample input.',
    },
    {
      line: 12,
      set: { messages: fs(FS_SYS, FS_1U, FS_1A) },
      trig: 'addExample1Asst',
      exp: 'Next comes an assistant message with the right answer: "Positive". We write the AI\'s reply ourselves, to show it what we want.',
    },
    {
      line: 15,
      set: { messages: fs(FS_SYS, FS_1U, FS_1A, FS_2U) },
      trig: 'addExample2User',
      exp: 'Example 2 has the same shape. The user text is "This is terrible."',
    },
    {
      line: 16,
      set: { messages: fs(FS_SYS, FS_1U, FS_1A, FS_2U, FS_2A) },
      trig: 'addExample2Asst',
      exp: 'And its correct answer: "Negative".',
    },
    {
      line: 16,
      trig: 'buildFewShot',
      exp: 'With two examples, the pattern is clear: a sentence goes in, a one-word label comes out. Look at the highlighted pattern in the panel.',
    },
    {
      line: 18,
      trig: 'buildFewShot',
      exp: 'This comment marks where the examples end and the real question begins.',
    },
    {
      line: 19,
      set: { messages: fs(FS_SYS, FS_1U, FS_1A, FS_2U, FS_2A, q) },
      trig: 'addRealQuestion',
      exp: p.realExp,
    },
    {
      line: 20,
      trig: 'addRealQuestion',
      exp: 'The list is closed. It holds 6 messages: 1 system message, 2 example pairs, and 1 real question.',
    },
    {
      line: 22,
      trig: 'addRealQuestion',
      exp: 'Now the API call, the same as always.',
    },
    {
      line: 24,
      trig: 'apiCall',
      exp: 'messages=messages sends the whole list, examples included. The AI sees them as an earlier conversation.',
    },
    {
      line: 22,
      trig: 'apiProcessing',
      exp: p.thinkExp,
    },
    {
      line: 22,
      set: { response: '<ChatCompletion object>' },
      trig: 'showPrediction',
      exp: p.replyExp,
    },
    {
      line: 27,
      out: `\nAI's classification for '${p.question}':`,
      trig: 'showPrediction',
      exp: 'This print writes a heading. The f before the quotes makes it an f-string, a string that can hold values.',
    },
    {
      line: 28,
      out: p.label,
      trig: 'showPrediction',
      exp: `We print the reply text. The Output panel shows just "${p.label}".`,
    },
    {
      line: 28,
      trig: 'compare',
      exp: p.compareExp,
    },
    {
      line: 28,
      trig: 'compare',
      exp: 'What you learned: 1) you can teach a task with example user/assistant pairs. 2) This is called few-shot prompting. 3) The AI copies the pattern, including the answer style.',
    },
  ]);
}

export const fewShotTrace: TraceStep[] = fewShotSteps({
  question: FS_DEFAULT_QUESTION,
  label: 'Neutral',
  realExp:
    'The last user message is the text we really want labelled: "It\'s okay, not great." This time there is no answer after it.',
  thinkExp:
    'The model spots the pattern in the examples and continues it: it writes one label for the new sentence.',
  replyExp:
    'The reply arrives: "Neutral". The model copied the style of our examples: one word, no extra text.',
  compareExp:
    'Compare in the panel: with no examples (zero-shot) the AI may add extra words. With examples (few-shot) it copies the exact one-word format.',
});

// ─────────────────────────────────────────────────────────────────────────────
// Part 1 Challenge – challengeTrace
// ─────────────────────────────────────────────────────────────────────────────
export const CH_SYSTEM =
  'You are a helpful restaurant recommender. You will be given a cuisine and location, and must reply in valid JSON format.';

export interface Restaurant {
  name: string;
  reason: string;
}

export interface ChallengeConfig {
  /** City name, e.g. "Bangalore". Appears in the print and in the prompt. */
  city: string;
  /** What to find, e.g. "South Indian restaurants". */
  what: string;
  recs: Restaurant[];
  /** Explanation for the "model is working" step. */
  thinkExp?: string;
}

export const challengeUserPrompt = (c: ChallengeConfig) =>
  `Find 3 great ${c.what} in ${c.city}, India.\nThe JSON output should be a list called "recommendations".\nEach item in the list should be an object with two keys: "name" and "reason".`;

export const CHALLENGE_DEFAULT: ChallengeConfig = {
  city: 'Bangalore',
  what: 'South Indian restaurants',
  recs: [
    { name: 'Mavalli Tiffin Rooms (MTR)', reason: 'A Bangalore classic, famous for rava idli and masala dosa.' },
    { name: 'Vidyarthi Bhavan', reason: 'Loved for its crispy, butter-rich dosas since 1943.' },
    { name: 'Central Tiffin Room (CTR)', reason: 'Known for its soft, buttery benne masala dosa.' },
  ],
};

export function challengeSteps(c: ChallengeConfig): TraceStep[] {
  const CH_USER = challengeUserPrompt(c);
  const CH_REC = c.recs;
  const CH_RAW = JSON.stringify({ recommendations: CH_REC });
  const CH_PRETTY = JSON.stringify({ recommendations: CH_REC }, null, 2);
  const CH_MSG_SYS = { role: 'system', content: CH_SYSTEM };
  const CH_MSG_USER = { role: 'user', content: CH_USER };

  return buildTrace([
    {
      line: 1,
      exp: `Challenge: a restaurant recommender for ${c.city}. It combines Part 1 skills: a system prompt, a clear user prompt, and JSON mode.`,
    },
    {
      line: 2,
      set: { OpenAI: '<class OpenAI>' },
      trig: 'import',
      exp: 'Same as before: load the OpenAI library.',
    },
    {
      line: 3,
      set: { json: '<module json>' },
      trig: 'import',
      exp: "NEW: we also import json, Python's built-in tool for reading and writing JSON text.",
    },
    {
      line: 5,
      set: { client: 'OpenAI(api_key=sk-...)' },
      trig: 'createClient',
      exp: 'Same as before: create the client, our phone line to OpenAI.',
    },
    {
      line: 7,
      out: `Calling the Restaurant Recommender Bot (${c.city})...`,
      exp: 'A print so we can see the program running. Check the Output panel.',
    },
    {
      line: 9,
      set: { system_prompt: `"${CH_SYSTEM}"`, messages_display: JSON.stringify([CH_MSG_SYS]) },
      trig: 'addSystemMsg',
      exp: 'The system prompt gives the AI its role: a helpful restaurant recommender.',
    },
    {
      line: 9,
      trig: 'addSystemMsg',
      exp: 'It also sets a format rule: the reply must be valid JSON.',
    },
    {
      line: 11,
      set: {
        user_prompt: `"""${CH_USER}"""`,
        messages_display: JSON.stringify([CH_MSG_SYS, CH_MSG_USER]),
      },
      trig: 'addUserMsg',
      exp: 'The user prompt uses triple quotes """. They let one string cover several lines.',
    },
    {
      line: 12,
      trig: 'addUserMsg',
      exp: `First, the task: find 3 ${c.what} in ${c.city}. Clear and specific.`,
    },
    {
      line: 13,
      trig: 'addUserMsg',
      exp: 'Next, we name the list: "recommendations". Now we know which key to look for in the reply.',
    },
    {
      line: 14,
      trig: 'addUserMsg',
      exp: 'Each item gets two keys: "name" and "reason". We have described the exact shape of the data we want back.',
    },
    {
      line: 17,
      set: { model: '"gpt-4o-mini"' },
      trig: 'addUserMsg',
      exp: 'The API call starts here, the same pattern as the earlier lessons, with the same gpt-4o-mini model.',
    },
    {
      line: 19,
      trig: 'addUserMsg',
      exp: 'messages holds two messages: system_prompt first, then user_prompt. Look at the message panel.',
    },
    {
      line: 23,
      set: { response_format: '{"type": "json_object"}' },
      trig: 'buildMessages',
      exp: 'JSON mode is on, like in the JSON lesson. The prompt says what data we want; JSON mode makes sure the reply is valid JSON.',
    },
    {
      line: 17,
      trig: 'apiCall',
      exp: 'The request goes to OpenAI: both messages plus JSON mode.',
    },
    {
      line: 17,
      trig: 'apiProcessing',
      exp: c.thinkExp ?? 'The model picks 3 places and writes them in the JSON shape we asked for.',
    },
    {
      line: 17,
      set: { response: '<ChatCompletion object>' },
      trig: 'apiCallComplete',
      exp: 'The answer arrives and is saved in response.',
    },
    {
      line: 26,
      out: "\n--- AI's Raw JSON Response ---",
      trig: 'apiCallComplete',
      exp: 'A heading for the raw (unformatted) reply.',
    },
    {
      line: 27,
      set: { raw_json: CH_RAW },
      trig: 'extractContent',
      exp: 'We save the reply text in raw_json. It is a string: just characters, not yet a Python dictionary.',
    },
    {
      line: 28,
      out: CH_RAW,
      trig: 'extractContent',
      exp: 'Printing it shows everything squeezed onto one long line. A computer can read it, but it is hard for people.',
    },
    {
      line: 30,
      out: "\n--- AI's 'Pretty' JSON Response ---",
      trig: 'extractContent',
      exp: 'A second heading, for the nicely formatted version.',
    },
    {
      line: 31,
      trig: 'jsonParse',
      exp: 'try: means "attempt this". If something inside fails, Python jumps to the except block below instead of crashing.',
    },
    {
      line: 32,
      set: { parsed_json: `{'recommendations': [{'name': '${CH_REC[0].name}', ...}, ...]}` },
      trig: 'jsonParse',
      exp: 'json.loads() turns the JSON string into a Python dictionary. Now parsed_json["recommendations"] gives us the list of restaurants.',
    },
    {
      line: 33,
      set: { pretty_json: CH_PRETTY },
      trig: 'jsonParse',
      exp: 'json.dumps(..., indent=2) turns the dictionary back into text, this time with line breaks and 2-space indents.',
    },
    {
      line: 34,
      out: CH_PRETTY,
      trig: 'printOutput',
      exp: 'Printing pretty_json shows one key per line. Much easier to read! The except block is skipped because the JSON was valid.',
    },
    {
      line: 34,
      trig: 'printOutput',
      exp: 'What you learned: 1) combine a system prompt, a clear user prompt, and JSON mode. 2) json.loads() turns JSON text into a dictionary. 3) json.dumps(indent=2) makes it readable.',
    },
  ]);
}

export const challengeTrace: TraceStep[] = challengeSteps(CHALLENGE_DEFAULT);
