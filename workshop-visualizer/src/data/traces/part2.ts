import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';

// ---------------------------------------------------------------------------
// Helper: build a trace from short step definitions.
// Variables carry forward from step to step (a variable stays until it is
// reassigned). `isNew` / `isChanged` are computed automatically.
// ---------------------------------------------------------------------------
interface StepDef {
  line: number;
  set?: Record<string, string>;
  out?: string;
  anim?: string;
  say: string;
}

function buildTrace(defs: StepDef[]): TraceStep[] {
  const vars = new Map<string, string>();
  return defs.map((d) => {
    const fresh = new Set<string>();
    const changed = new Set<string>();
    for (const [name, value] of Object.entries(d.set ?? {})) {
      if (!vars.has(name)) fresh.add(name);
      else if (vars.get(name) !== value) changed.add(name);
      vars.set(name, value);
    }
    const variables: Variable[] = Array.from(vars, ([name, value]) => ({
      name,
      value,
      ...(fresh.has(name) ? { isNew: true } : {}),
      ...(changed.has(name) ? { isChanged: true } : {}),
    }));
    const step: TraceStep = { lineNumber: d.line, variables, output: d.out ?? '', explanation: d.say };
    if (d.anim) step.animationTrigger = d.anim;
    return step;
  });
}

// Animation triggers (read by AgentLoopPanel → AgentLoopDiagram's buildAgentModel).
// Phases: agentLoop-send* (request goes out), apiProcessing (AI reads the menu), agentLoop-decide
// (the reply arrives), agentLoop-check (the `if tool_calls` test), toolSelect-<name> (our code reads
// the slip), agentLoop-execute (the real function runs), agentLoop-return (role "tool" message),
// agentLoop-loopback (back to the top of while True), agentLoop-finalAnswer (the answer).
// Setup: import, defineTools[-name|-desc|-params], addSystemMsg, agentLoop-pack, agentLoop-enter.
// HOLD: our code is between stages; the panel keeps showing the previous phase.
// DONE: after the final answer; the answer stays on screen.
const HOLD = 'agentLoop-hold';
const DONE = 'agentLoop-finalDone';

// ===========================================================================
// Lesson 6: Simple Agent (calculator_agent.py) — one tool: add
// ===========================================================================
const SA_USER = (q: string) => `[{role:"user", content:"${q}"}]`;
const SA_WITH_ASST = (q: string, a: number, b: number) =>
  `[{role:"user", content:"${q}"}, {role:"assistant", tool_calls:[add(${a}, ${b})]}]`;
const SA_WITH_TOOL = (q: string, a: number, b: number, r: string) =>
  `[{role:"user", content:"${q}"}, {role:"assistant", tool_calls:[add(${a}, ${b})]}, {role:"tool", tool_call_id:"call_abc123", content:"${r}"}]`;
const SA_MESSAGE = (a: number, b: number) =>
  `{role:"assistant", content:None, tool_calls:[{id:"call_abc123", name:"add", arguments:'{"a": ${a}, "b": ${b}}'}]}`;
const SA_TOOL_CALL = (a: number, b: number) =>
  `{id:"call_abc123", function:{name:"add", arguments:'{"a": ${a}, "b": ${b}}'}}`;

export const simpleAgentTrace: TraceStep[] = buildTrace([
  {
    line: 1,
    say: 'In this lesson we build our first agent: a calculator. What is new since Part 1: the AI can ask OUR code to run a Python function for it.',
  },
  {
    line: 2,
    set: { json: 'module' },
    anim: 'import',
    say: 'We import json. Later the AI will send us the function inputs as JSON text, and json turns that text into a Python dictionary.',
  },
  {
    line: 4,
    set: { client: 'OpenAI()' },
    say: 'Line 3 imports OpenAI, and this line creates the client, exactly like in Part 1. The client is how we talk to the AI.',
  },
  {
    line: 7,
    set: { add: 'function add(a, b) → a + b' },
    anim: 'defineTools',
    say: 'This is our tool. A "tool" is just a normal Python function: add(a, b) returns a + b. Nothing special about it.',
  },
  {
    line: 13,
    set: { tools: '[{type:"function", function:{name:"add", description:..., parameters:...}}]' },
    anim: 'defineTools',
    say: 'Now the tools list. Think of it as a menu we hand to the AI: it lists what our code can do. The AI reads the menu, but it never runs the code.',
  },
  {
    line: 17,
    anim: 'defineTools-name',
    say: 'The "name" is "add". When the AI wants this tool, it sends back this exact name, so it should match our function name.',
  },
  {
    line: 18,
    anim: 'defineTools-desc',
    say: 'The "description" says what the tool does. The AI reads this sentence to decide WHEN to use the tool, so write it clearly.',
  },
  {
    line: 19,
    anim: 'defineTools-params',
    say: 'The "parameters" part lists the inputs: a and b, both numbers (lines 22–23). The AI must fill in these values when it asks for the tool.',
  },
  {
    line: 32,
    set: { messages: SA_USER('What is 45 + 13?') },
    say: 'The conversation starts. messages is the chat history we send to the AI. Right now it holds one user question: "What is 45 + 13?"',
  },
  {
    line: 33,
    out: 'User: What is 45 + 13?',
    say: 'We print the question so we can follow along in the console.',
  },
  {
    line: 36,
    out: '--- 1. Sending to AI (with tools)... ---',
    say: 'A label for the console. The next lines make the first call to the AI.',
  },
  {
    line: 40,
    anim: 'agentLoop-pack',
    say: 'This call looks like Part 1, with one new part: tools=tools. We send the menu along with the chat history.',
  },
  {
    line: 41,
    anim: 'agentLoop-pack',
    say: 'tool_choice="auto" means the AI chooses for itself: use a tool, or just answer with text. We do not force it.',
  },
  {
    line: 37,
    anim: 'agentLoop-send',
    say: 'Now the request goes out: the messages list plus the tools menu, together in one call.',
  },
  {
    line: 37,
    set: { response: 'ChatCompletion(...)' },
    anim: 'apiProcessing',
    say: 'The AI reads "What is 45 + 13?" and sees the add tool on the menu. It decides that add fits this question.',
  },
  {
    line: 44,
    set: { message: SA_MESSAGE(45, 13) },
    anim: 'agentLoop-decide',
    say: 'The reply is different this time. message.content is None: no text! Instead, message.tool_calls holds a request: "please run add with a=45, b=13". Look at the Variables panel.',
  },
  {
    line: 45,
    set: { messages: SA_WITH_ASST('What is 45 + 13?', 45, 13) },
    anim: HOLD,
    say: 'We add the AI\'s reply to the history. The next call must show that the AI asked for add, or the tool result will make no sense to it.',
  },
  {
    line: 48,
    anim: 'agentLoop-check',
    say: 'Did the AI ask for a tool? Yes, tool_calls is not empty, so we go inside the if. (If the AI had answered with text, the else part would print it.)',
  },
  {
    line: 49,
    out: '--- 2. AI decided to call: add ---',
    anim: 'toolSelect-add',
    say: 'We print the name of the tool the AI picked from our menu: add.',
  },
  {
    line: 51,
    set: { tool_call: SA_TOOL_CALL(45, 13) },
    anim: 'toolSelect-add',
    say: 'tool_calls is a list, so we take the first request. It has three parts: an id, a function name, and the arguments.',
  },
  {
    line: 52,
    set: { function_name: '"add"' },
    anim: 'toolSelect-add',
    say: 'We read the name: function_name = "add". This tells our code WHICH function to run.',
  },
  {
    line: 53,
    set: { arguments: "{'a': 45, 'b': 13}" },
    anim: 'toolSelect-add',
    say: 'The AI can only send text, so the arguments arrive as a string: \'{"a": 45, "b": 13}\'. json.loads turns that string into a real Python dict.',
  },
  {
    line: 55,
    set: { result: '58' },
    out: '[Debug: Running REAL Python code: add(a=45, b=13)]',
    anim: 'agentLoop-execute',
    say: 'Now OUR code runs the real add function with a=45 and b=13. The Debug line comes from the print inside add. result = 58.',
  },
  {
    line: 56,
    out: '--- 3. Ran function, result: 58 ---',
    anim: 'agentLoop-execute',
    say: 'We print the result. The AI does not know it yet, so next we send it back.',
  },
  {
    line: 60,
    anim: 'agentLoop-return',
    say: 'We add a new message to the history. Its role is "tool", which means: "this is a tool\'s answer", not the user and not the AI.',
  },
  {
    line: 61,
    anim: 'agentLoop-return',
    say: 'tool_call_id copies the id of the AI\'s request ("call_abc123"). The AI can ask for several tools at once, so the id says which request this answer belongs to.',
  },
  {
    line: 62,
    set: { messages: SA_WITH_TOOL('What is 45 + 13?', 45, 13, '58') },
    anim: 'agentLoop-return',
    say: 'The content is the result as text: "58". Now the history holds three messages: the question, the AI\'s request, and the tool\'s answer.',
  },
  {
    line: 65,
    out: '--- 4. Sending result back to AI... ---',
    anim: 'agentLoop-send2',
    say: 'Second call to the AI. We send the whole history again, now including the tool\'s answer.',
  },
  {
    line: 66,
    set: { final_response: 'ChatCompletion(...)' },
    anim: 'apiProcessing',
    say: 'This call passes only messages, no tools. The AI reads the result "58" and writes a normal answer for the user.',
  },
  {
    line: 71,
    set: { final_answer: '45 + 13 is 58.' },
    out: '--- 5. Final Answer from AI: ---',
    anim: 'agentLoop-finalAnswer',
    say: 'This time the reply is plain text, not a tool request. We print a header for the final answer.',
  },
  {
    line: 72,
    out: '45 + 13 is 58.',
    anim: DONE,
    say: 'We print the AI\'s answer: "45 + 13 is 58." The AI wrote the sentence, but the math was done by our Python code.',
  },
  {
    line: 72,
    anim: DONE,
    say: 'What you learned: (1) a tool is a normal function plus a menu entry; (2) the AI replies with a tool_call and our code runs it; (3) we send the result back with role "tool".',
  },
]);

const simpleAgent100Plus200Steps: TraceStep[] = buildTrace([
  {
    line: 1,
    say: 'Same calculator agent, new question: "What is 100 + 200?" Watch how the same code handles different numbers.',
  },
  {
    line: 4,
    set: { json: 'module', client: 'OpenAI()' },
    anim: 'import',
    say: 'Lines 2–4: import json and OpenAI, then create the client. Same as before.',
  },
  {
    line: 7,
    set: { add: 'function add(a, b) → a + b' },
    anim: 'defineTools',
    say: 'Our tool: a normal Python function that adds two numbers.',
  },
  {
    line: 13,
    set: { tools: '[{type:"function", function:{name:"add", description:..., parameters:...}}]' },
    anim: 'defineTools',
    say: 'The tools menu with one entry, add. The AI uses the description to decide when to use it.',
  },
  {
    line: 32,
    set: { messages: SA_USER('What is 100 + 200?') },
    say: 'The history starts with one user question. In this run it is "What is 100 + 200?" (the highlighted line shows the new question).',
  },
  {
    line: 33,
    out: 'User: What is 100 + 200?',
    say: 'We print the question.',
  },
  {
    line: 36,
    out: '--- 1. Sending to AI (with tools)... ---',
    say: 'A label for the first call.',
  },
  {
    line: 37,
    anim: 'agentLoop-send',
    say: 'First call: we send the history and the tools menu.',
  },
  {
    line: 37,
    set: { response: 'ChatCompletion(...)' },
    anim: 'apiProcessing',
    say: 'The AI reads "100 + 200" and decides the add tool fits.',
  },
  {
    line: 44,
    set: { message: SA_MESSAGE(100, 200) },
    anim: 'agentLoop-decide',
    say: 'Again no text. message.tool_calls asks us to run add with a=100, b=200.',
  },
  {
    line: 45,
    set: { messages: SA_WITH_ASST('What is 100 + 200?', 100, 200) },
    anim: HOLD,
    say: 'We save the AI\'s request in the history.',
  },
  {
    line: 49,
    out: '--- 2. AI decided to call: add ---',
    anim: 'toolSelect-add',
    say: 'tool_calls is not empty, so we are inside the if. We print the tool name: add.',
  },
  {
    line: 51,
    set: { tool_call: SA_TOOL_CALL(100, 200) },
    anim: 'toolSelect-add',
    say: 'We take the first (and only) request: its id, name and arguments.',
  },
  {
    line: 52,
    set: { function_name: '"add"' },
    anim: 'toolSelect-add',
    say: 'function_name = "add".',
  },
  {
    line: 53,
    set: { arguments: "{'a': 100, 'b': 200}" },
    anim: 'toolSelect-add',
    say: 'json.loads turns the text \'{"a": 100, "b": 200}\' into a Python dict.',
  },
  {
    line: 55,
    set: { result: '300' },
    out: '[Debug: Running REAL Python code: add(a=100, b=200)]',
    anim: 'agentLoop-execute',
    say: 'Our Python code runs add(100, 200). result = 300.',
  },
  {
    line: 56,
    out: '--- 3. Ran function, result: 300 ---',
    anim: 'agentLoop-execute',
    say: 'We print the result.',
  },
  {
    line: 61,
    anim: 'agentLoop-return',
    say: 'We build a role "tool" message. tool_call_id links this answer to the AI\'s request.',
  },
  {
    line: 62,
    set: { messages: SA_WITH_TOOL('What is 100 + 200?', 100, 200, '300') },
    anim: 'agentLoop-return',
    say: 'The content is "300". The history now has the question, the request and the answer.',
  },
  {
    line: 65,
    out: '--- 4. Sending result back to AI... ---',
    anim: 'agentLoop-send2',
    say: 'Second call: we send the whole history back.',
  },
  {
    line: 66,
    set: { final_response: 'ChatCompletion(...)' },
    anim: 'apiProcessing',
    say: 'No tools this time. The AI reads the result and writes an answer.',
  },
  {
    line: 71,
    set: { final_answer: '100 + 200 is 300.' },
    out: '--- 5. Final Answer from AI: ---',
    anim: 'agentLoop-finalAnswer',
    say: 'The reply is plain text. We print a header.',
  },
  {
    line: 72,
    out: '100 + 200 is 300.',
    anim: DONE,
    say: 'Done: same agent, different numbers. The AI chose the tool; our code did the math.',
  },
]);

const SA_FR_Q = "What's the capital of France?";
const SA_FR_A = 'The capital of France is Paris.';

const simpleAgentNoToolSteps: TraceStep[] = buildTrace([
  {
    line: 1,
    say: `Same calculator agent, but a question that has nothing to do with math: "${SA_FR_Q}" Will the AI still use the add tool?`,
  },
  {
    line: 4,
    set: { json: 'module', client: 'OpenAI()' },
    anim: 'import',
    say: 'Lines 2–4: import json and OpenAI, then create the client. Same as before.',
  },
  {
    line: 7,
    set: { add: 'function add(a, b) → a + b' },
    anim: 'defineTools',
    say: 'Our only tool is still add(a, b).',
  },
  {
    line: 13,
    set: { tools: '[{type:"function", function:{name:"add", description:..., parameters:...}}]' },
    anim: 'defineTools',
    say: 'The menu has one card: add, "Add two numbers together".',
  },
  {
    line: 32,
    set: { messages: SA_USER(SA_FR_Q) },
    say: `The history starts with the new question: "${SA_FR_Q}"`,
  },
  {
    line: 33,
    out: `User: ${SA_FR_Q}`,
    say: 'We print the question.',
  },
  {
    line: 36,
    out: '--- 1. Sending to AI (with tools)... ---',
    say: 'A label for the first call.',
  },
  {
    line: 41,
    anim: 'agentLoop-pack',
    say: 'tool_choice="auto" matters now: the AI is allowed to skip the tools and just answer.',
  },
  {
    line: 37,
    anim: 'agentLoop-send',
    say: 'We send the question and the menu, exactly as before.',
  },
  {
    line: 37,
    set: { response: 'ChatCompletion(...)' },
    anim: 'apiProcessing',
    say: 'The AI reads the menu. add adds numbers, which does not help with a geography question. It knows the answer itself.',
  },
  {
    line: 44,
    set: { message: `{role:"assistant", content:"${SA_FR_A}", tool_calls:None}` },
    anim: 'agentLoop-decide',
    say: 'This reply is normal text in message.content, and tool_calls is None. No order slip this time.',
  },
  {
    line: 45,
    set: { messages: `[{role:"user", content:"${SA_FR_Q}"}, {role:"assistant", content:"${SA_FR_A}"}]` },
    anim: HOLD,
    say: 'We still save the reply in the history.',
  },
  {
    line: 48,
    anim: 'agentLoop-check',
    say: 'Did the AI ask for a tool? No, tool_calls is None, so the if is False. Python skips lines 49–72 and jumps to else.',
  },
  {
    line: 74,
    out: '--- Final Answer from AI (no tool needed): ---',
    anim: 'agentLoop-finalAnswer',
    say: 'We are in the else part. It prints a header saying no tool was needed.',
  },
  {
    line: 75,
    out: SA_FR_A,
    anim: DONE,
    say: 'We print message.content. Only ONE call to the AI, and add never ran.',
  },
  {
    line: 75,
    anim: DONE,
    say: 'What you learned: tools are optional. The AI uses a tool only when it helps; otherwise it answers directly, and the else branch handles that.',
  },
]);

export const simpleAgentVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'What is 45 + 13?',
    inputValue: 'What is 45 + 13?',
    steps: simpleAgentTrace,
  },
  {
    id: 'variant2',
    label: 'What is 100 + 200?',
    inputValue: 'What is 100 + 200?',
    steps: simpleAgent100Plus200Steps,
  },
  {
    id: 'variant3',
    label: "What's the capital of France? (no tool)",
    inputValue: SA_FR_Q,
    steps: simpleAgentNoToolSteps,
  },
];

// ===========================================================================
// Lesson 7: Multi-Function Agent (math_tutor.py) — 4 tools + while True loop
// Both variants are built from one template, so their line numbers match.
// ===========================================================================
interface ToolStep {
  op: string;
  a: number;
  b: number;
  result: string; // what Python returns, as shown by print / str()
  id: string;
}

interface MathCase {
  question: string;
  first: ToolStep;
  second: ToolStep;
  whyFirst: string; // why the AI asks for the first operation first
  answer: string;
  resultNote?: string; // extra note for the first result (e.g. 20.0)
  questionNote?: string; // for variants: the code on screen still shows the default question
}

function buildMathTutorTrace(c: MathCase): TraceStep[] {
  const { question: q, first: s1, second: s2 } = c;
  const user = `{role:"user", content:"${q}"}`;
  const call = (s: ToolStep) => `${s.op}(${s.a}, ${s.b})`;
  const asst = (s: ToolStep) => `assistant→${call(s)}`;
  const tool = (s: ToolStep) => `tool:"${s.result}"`;
  const hist = (...rest: string[]) => `[system, ${[user, ...rest].join(', ')}]`;
  const toolCall = (s: ToolStep) =>
    `{id:"${s.id}", function:{name:"${s.op}", arguments:'{"a": ${s.a}, "b": ${s.b}}'}}`;
  const argsDict = (s: ToolStep) => `{'a': ${s.a}, 'b': ${s.b}}`;
  const toolMsg = (s: ToolStep) => `{role:"tool", tool_call_id:"${s.id}", content:"${s.result}"}`;

  return buildTrace([
    // ---------------- Setup ----------------
    {
      line: 1,
      say: 'This lesson builds a math tutor agent. What is new: four tools instead of one, and a loop, so the AI can use tools again and again until it is finished.',
    },
    {
      line: 4,
      set: { json: 'module', client: 'OpenAI()' },
      anim: 'import',
      say: 'Lines 2–4 are the same as last lesson: import json and OpenAI, then create the client.',
    },
    {
      line: 7,
      set: {
        add: 'function add(a, b) → a + b',
        subtract: 'function subtract(a, b) → a - b',
        multiply: 'function multiply(a, b) → a * b',
        divide: 'function divide(a, b) → a / b',
      },
      anim: 'defineTools',
      say: 'Lines 7–22 define four tools: add, subtract, multiply and divide. Each one is still just a normal Python function.',
    },
    {
      line: 25,
      set: { tools: '[add, subtract, multiply, divide]' },
      anim: 'defineTools',
      say: 'The tools menu now has four entries. The "..." is shortened here: each entry has a name, a description and parameters, like the add entry last lesson.',
    },
    {
      line: 33,
      set: { messages: hist() },
      anim: 'addSystemMsg',
      say: `The history starts with two messages: a system message (act as a math tutor, use tools) and the user's question, "${q}"${c.questionNote ? ' ' + c.questionNote : ''}`,
    },
    {
      line: 37,
      out: `User: ${q}`,
      say: 'messages[-1] is the last message in the list, the user\'s question. We print it.',
    },
    {
      line: 40,
      anim: 'agentLoop-enter',
      say: 'while True means "repeat forever", until a break inside stops it. This loop is the heart of the agent: ask the AI, run the tools it asks for, repeat.',
    },

    // ---------------- Loop turn 1 ----------------
    {
      line: 41,
      out: '--- 1. Sending to AI (with tools)... ---',
      anim: 'agentLoop-send',
      say: 'Loop turn 1. We print a label; the call to the AI comes next.',
    },
    {
      line: 42,
      set: { response: 'ChatCompletion (turn 1)' },
      anim: 'apiProcessing',
      say: 'We send the history and all four tools. The AI reads the question and picks which tool to use first.',
    },
    {
      line: 46,
      set: { message: `{role:"assistant", content:None, tool_calls:[${call(s1)}]}` },
      anim: 'agentLoop-decide',
      say: `The reply has no text. It has one tool request: ${call(s1)}. ${c.whyFirst}`,
    },
    {
      line: 47,
      set: { messages: hist(asst(s1)) },
      anim: HOLD,
      say: 'As in the last lesson, we save the AI\'s reply in the history, so it remembers what it asked for.',
    },
    {
      line: 49,
      anim: 'agentLoop-check',
      say: 'The exit check: are there no tool_calls? False, the AI asked for a tool. So we do NOT break. We skip this block and keep going.',
    },
    {
      line: 54,
      out: '--- 2. AI calls 1 function(s) ---',
      anim: HOLD,
      say: 'We print how many tool requests the AI sent. This time: 1.',
    },
    {
      line: 55,
      set: { tool_call: toolCall(s1) },
      anim: `toolSelect-${s1.op}`,
      say: 'The AI may ask for several tools at once, so we loop over every request with a for loop. Here there is just one.',
    },
    {
      line: 57,
      set: { function_name: `"${s1.op}"`, arguments: argsDict(s1) },
      anim: `toolSelect-${s1.op}`,
      say: `Line 56 reads the name, "${s1.op}". This line uses json.loads to turn the argument text into a dict: ${argsDict(s1)}.`,
    },
    {
      line: 58,
      set: { available_functions: '{"add": add, "subtract": subtract, "multiply": multiply, "divide": divide}' },
      anim: `toolSelect-${s1.op}`,
      say: 'With four tools, we need to find the right one. This dictionary maps each name (text) to its real Python function.',
    },
    {
      line: 60,
      set: { result: s1.result },
      out: `[Debug: ${s1.op}(a=${s1.a}, b=${s1.b})]`,
      anim: 'agentLoop-execute',
      say: `available_functions["${s1.op}"] gives us the ${s1.op} function. **arguments passes a=${s1.a} and b=${s1.b} into it. result = ${s1.result}.${c.resultNote ? ' ' + c.resultNote : ''}`,
    },
    {
      line: 61,
      out: `--- 3. ${s1.op}(${argsDict(s1)}) = ${s1.result} ---`,
      anim: 'agentLoop-execute',
      say: 'We print which function ran, its arguments, and its result.',
    },
    {
      line: 63,
      set: { messages: hist(asst(s1), tool(s1)) },
      anim: 'agentLoop-return',
      say: `We append a role "tool" message: ${toolMsg(s1)}. The matching tool_call_id tells the AI this is the answer to its ${s1.op} request.`,
    },
    {
      line: 40,
      anim: 'agentLoop-loopback',
      say: 'The for loop is done (only one request). We reach the end of the while block, so Python jumps back to the top: while True. Turn 2 begins.',
    },

    // ---------------- Loop turn 2 ----------------
    {
      line: 41,
      out: '--- 1. Sending to AI (with tools)... ---',
      anim: 'agentLoop-send2',
      say: `Loop turn 2. Same code as before, but the history is longer now: it contains the ${s1.op} result, ${s1.result}.`,
    },
    {
      line: 42,
      set: { response: 'ChatCompletion (turn 2)' },
      anim: 'apiProcessing',
      say: `The AI reads the whole history. It sees the first step is done, so it plans the next one: ${call(s2)}.`,
    },
    {
      line: 46,
      set: { message: `{role:"assistant", content:None, tool_calls:[${call(s2)}]}` },
      anim: 'agentLoop-decide',
      say: `Again no text, just a tool request: ${call(s2)}. Notice the AI used the result we sent back.`,
    },
    {
      line: 47,
      set: { messages: hist(asst(s1), tool(s1), asst(s2)) },
      anim: HOLD,
      say: 'We save this reply in the history too.',
    },
    {
      line: 49,
      anim: 'agentLoop-check',
      say: 'Exit check again: are there no tool_calls? False, there is one. So no break; the loop keeps going.',
    },
    {
      line: 54,
      out: '--- 2. AI calls 1 function(s) ---',
      anim: HOLD,
      say: 'Again, one tool request.',
    },
    {
      line: 57,
      set: { tool_call: toolCall(s2), function_name: `"${s2.op}"`, arguments: argsDict(s2) },
      anim: `toolSelect-${s2.op}`,
      say: `The for loop takes the new request. Now function_name is "${s2.op}" and arguments is ${argsDict(s2)}.`,
    },
    {
      line: 58,
      anim: `toolSelect-${s2.op}`,
      say: `The same dictionary finds the ${s2.op} function. Adding a new tool later only means adding one entry here, no long if/else chain.`,
    },
    {
      line: 60,
      set: { result: s2.result },
      out: `[Debug: ${s2.op}(a=${s2.a}, b=${s2.b})]`,
      anim: 'agentLoop-execute',
      say: `Our code runs ${call(s2)}. result = ${s2.result}.`,
    },
    {
      line: 61,
      out: `--- 3. ${s2.op}(${argsDict(s2)}) = ${s2.result} ---`,
      anim: 'agentLoop-execute',
      say: 'We print the second result.',
    },
    {
      line: 63,
      set: { messages: hist(asst(s1), tool(s1), asst(s2), tool(s2)) },
      anim: 'agentLoop-return',
      say: `The result "${s2.result}" goes into the history as a tool message, with the id of the ${s2.op} request (${s2.id}).`,
    },
    {
      line: 40,
      anim: 'agentLoop-loopback',
      say: 'End of the loop body again, so back to the top of while True. Turn 3 begins.',
    },

    // ---------------- Loop turn 3 ----------------
    {
      line: 41,
      out: '--- 1. Sending to AI (with tools)... ---',
      anim: 'agentLoop-send3',
      say: `Loop turn 3. The history now holds both results: ${s1.result} and ${s2.result}.`,
    },
    {
      line: 42,
      set: { response: 'ChatCompletion (turn 3)' },
      anim: 'apiProcessing',
      say: 'The AI sees all the math is done. This time it writes a text answer instead of asking for a tool.',
    },
    {
      line: 46,
      set: { message: `{role:"assistant", content:"${c.answer.split('.')[0]}...", tool_calls:None}` },
      anim: 'agentLoop-decide',
      say: 'The reply has text in message.content, and tool_calls is None (empty).',
    },
    {
      line: 47,
      set: { messages: hist(asst(s1), tool(s1), asst(s2), tool(s2), 'assistant:"text answer"') },
      anim: HOLD,
      say: 'We save the answer in the history, like every reply.',
    },
    {
      line: 49,
      anim: 'agentLoop-check',
      say: 'The exit check: are there no tool_calls? TRUE this time. So we go inside the if. This is how the loop knows the AI is finished.',
    },
    {
      line: 50,
      out: '--- Final Answer from AI: ---',
      anim: HOLD,
      say: 'We print a header for the final answer.',
    },
    {
      line: 51,
      set: { final_answer: c.answer },
      out: c.answer,
      anim: 'agentLoop-finalAnswer',
      say: 'We print message.content, the AI\'s answer. It explains the steps in plain English, like a tutor.',
    },
    {
      line: 52,
      anim: DONE,
      say: 'break stops the while True loop. Without it, the loop would never end. In total the AI was called 3 times: two tool turns and one answer turn.',
    },
    {
      line: 40,
      anim: DONE,
      say: 'What you learned: (1) while True keeps calling the AI; (2) each turn we run every tool it asks for and send the results back; (3) no tool_calls means done, so we break.',
    },
  ]);
}

export const multiFunctionTrace: TraceStep[] = buildMathTutorTrace({
  question: 'What is (50 * 2) - 15?',
  first: { op: 'multiply', a: 50, b: 2, result: '100', id: 'call_abc' },
  second: { op: 'subtract', a: 100, b: 15, result: '85', id: 'call_xyz' },
  whyFirst: 'Brackets come first, so it asks only for this step now.',
  answer: '(50 * 2) - 15 = 85. First, 50 times 2 is 100. Then 100 minus 15 is 85.',
});

const multiFunction100Div5Plus3Steps: TraceStep[] = buildMathTutorTrace({
  question: 'What is 100 / 5 + 3?',
  first: { op: 'divide', a: 100, b: 5, result: '20.0', id: 'call_abc' },
  second: { op: 'add', a: 20, b: 3, result: '23', id: 'call_xyz' },
  whyFirst: 'Division comes before addition, so it asks only for this step now.',
  resultNote: 'In Python, / always gives a decimal number, so it is 20.0.',
  answer: '100 / 5 + 3 = 23. First, 100 divided by 5 is 20. Then 20 plus 3 is 23.',
});

// ---------------------------------------------------------------------------
// Variant 3: two tool calls in ONE reply (the for loop runs twice)
// ---------------------------------------------------------------------------
const PAR_Q = 'What is 7 * 8 + 9 * 4?';
const PAR_ANSWER = '7 * 8 + 9 * 4 = 92. First, 7 times 8 is 56 and 9 times 4 is 36. Then 56 plus 36 is 92.';

function buildParallelTrace(): TraceStep[] {
  const user = `{role:"user", content:"${PAR_Q}"}`;
  const hist = (...rest: string[]) => `[system, ${[user, ...rest].join(', ')}]`;
  const A1 = 'assistant→multiply(7, 8)+multiply(9, 4)';
  const A2 = 'assistant→add(56, 36)';
  const tc = (id: string, op: string, a: number, b: number) =>
    `{id:"${id}", function:{name:"${op}", arguments:'{"a": ${a}, "b": ${b}}'}}`;

  return buildTrace([
    {
      line: 1,
      say: `Same math tutor, new question: "${PAR_Q}" Watch turn 1 closely: the AI asks for TWO tools in a single reply.`,
    },
    {
      line: 4,
      set: { json: 'module', client: 'OpenAI()' },
      anim: 'import',
      say: 'Lines 2–4: import json and OpenAI, then create the client.',
    },
    {
      line: 7,
      set: {
        add: 'function add(a, b) → a + b',
        subtract: 'function subtract(a, b) → a - b',
        multiply: 'function multiply(a, b) → a * b',
        divide: 'function divide(a, b) → a / b',
      },
      anim: 'defineTools',
      say: 'The same four tools: add, subtract, multiply and divide.',
    },
    {
      line: 25,
      set: { tools: '[add, subtract, multiply, divide]' },
      anim: 'defineTools',
      say: 'The menu with four cards.',
    },
    {
      line: 33,
      set: { messages: hist() },
      anim: 'addSystemMsg',
      say: `The history: the tutor system message and the question "${PAR_Q}"`,
    },
    {
      line: 37,
      out: `User: ${PAR_Q}`,
      say: 'We print the question.',
    },
    {
      line: 40,
      anim: 'agentLoop-enter',
      say: 'The agent loop starts: ask the AI, run the tools it asks for, repeat.',
    },
    {
      line: 41,
      out: '--- 1. Sending to AI (with tools)... ---',
      anim: 'agentLoop-send',
      say: 'Loop turn 1: we send the history and the four tools.',
    },
    {
      line: 42,
      set: { response: 'ChatCompletion (turn 1)' },
      anim: 'apiProcessing',
      say: '7 * 8 and 9 * 4 do not depend on each other, so the AI can ask for both at the same time.',
    },
    {
      line: 46,
      set: { message: '{role:"assistant", content:None, tool_calls:[multiply(7, 8), multiply(9, 4)]}' },
      anim: 'agentLoop-decide',
      say: 'One reply, TWO order slips: multiply(7, 8) and multiply(9, 4). Each has its own id: call_a and call_b.',
    },
    {
      line: 47,
      set: { messages: hist(A1) },
      anim: HOLD,
      say: 'We save the reply (with both requests) in the history.',
    },
    {
      line: 49,
      anim: 'agentLoop-check',
      say: 'Are there no tool_calls? False, there are two. So no break.',
    },
    {
      line: 54,
      out: '--- 2. AI calls 2 function(s) ---',
      anim: HOLD,
      say: 'len(message.tool_calls) is 2 this time. That is why the code uses a for loop.',
    },
    {
      line: 55,
      set: { tool_call: tc('call_a', 'multiply', 7, 8) },
      anim: 'toolSelect-multiply',
      say: 'The for loop takes the FIRST request, id call_a.',
    },
    {
      line: 57,
      set: { function_name: '"multiply"', arguments: "{'a': 7, 'b': 8}" },
      anim: 'toolSelect-multiply',
      say: 'Its name is "multiply" and json.loads gives the dict {\'a\': 7, \'b\': 8}.',
    },
    {
      line: 58,
      set: { available_functions: '{"add": add, "subtract": subtract, "multiply": multiply, "divide": divide}' },
      anim: 'toolSelect-multiply',
      say: 'The dictionary finds the real multiply function by its name.',
    },
    {
      line: 60,
      set: { result: '56' },
      out: '[Debug: multiply(a=7, b=8)]',
      anim: 'agentLoop-execute',
      say: 'Our code runs multiply(7, 8). result = 56.',
    },
    {
      line: 61,
      out: "--- 3. multiply({'a': 7, 'b': 8}) = 56 ---",
      anim: 'agentLoop-execute',
      say: 'We print the first result.',
    },
    {
      line: 63,
      set: { messages: hist(A1, 'tool:"56"') },
      anim: 'agentLoop-return',
      say: 'We append {role:"tool", tool_call_id:"call_a", content:"56"}. The id says: this answers request call_a.',
    },
    {
      line: 55,
      set: { tool_call: tc('call_b', 'multiply', 9, 4) },
      anim: 'toolSelect-multiply',
      say: 'The for loop is not done yet. It takes the SECOND request, id call_b.',
    },
    {
      line: 57,
      set: { arguments: "{'a': 9, 'b': 4}" },
      anim: 'toolSelect-multiply',
      say: 'Same function name, "multiply", but new arguments: {\'a\': 9, \'b\': 4}.',
    },
    {
      line: 60,
      set: { result: '36' },
      out: '[Debug: multiply(a=9, b=4)]',
      anim: 'agentLoop-execute',
      say: 'Our code runs multiply(9, 4). result = 36.',
    },
    {
      line: 61,
      out: "--- 3. multiply({'a': 9, 'b': 4}) = 36 ---",
      anim: 'agentLoop-execute',
      say: 'We print the second result.',
    },
    {
      line: 63,
      set: { messages: hist(A1, 'tool:"56"', 'tool:"36"') },
      anim: 'agentLoop-return',
      say: 'This tool message gets id call_b. Both answers look alike, so the ids are how the AI tells 56 and 36 apart.',
    },
    {
      line: 40,
      anim: 'agentLoop-loopback',
      say: 'Both requests are answered, so the for loop ends. Back to the top of while True: turn 2.',
    },
    {
      line: 41,
      out: '--- 1. Sending to AI (with tools)... ---',
      anim: 'agentLoop-send2',
      say: 'Loop turn 2. The history now holds both results.',
    },
    {
      line: 42,
      set: { response: 'ChatCompletion (turn 2)' },
      anim: 'apiProcessing',
      say: 'The AI reads 56 and 36 and plans the last step: add them.',
    },
    {
      line: 46,
      set: { message: '{role:"assistant", content:None, tool_calls:[add(56, 36)]}' },
      anim: 'agentLoop-decide',
      say: 'One request this time: add(56, 36).',
    },
    {
      line: 47,
      set: { messages: hist(A1, 'tool:"56"', 'tool:"36"', A2) },
      anim: HOLD,
      say: 'We save it in the history.',
    },
    {
      line: 49,
      anim: 'agentLoop-check',
      say: 'Exit check: there is a tool call, so no break.',
    },
    {
      line: 57,
      set: { tool_call: tc('call_c', 'add', 56, 36), function_name: '"add"', arguments: "{'a': 56, 'b': 36}" },
      anim: 'toolSelect-add',
      say: 'The for loop runs once: function_name is "add" and arguments is {\'a\': 56, \'b\': 36}.',
    },
    {
      line: 60,
      set: { result: '92' },
      out: '[Debug: add(a=56, b=36)]',
      anim: 'agentLoop-execute',
      say: 'Our code runs add(56, 36). result = 92.',
    },
    {
      line: 61,
      out: "--- 3. add({'a': 56, 'b': 36}) = 92 ---",
      anim: 'agentLoop-execute',
      say: 'We print the result.',
    },
    {
      line: 63,
      set: { messages: hist(A1, 'tool:"56"', 'tool:"36"', A2, 'tool:"92"') },
      anim: 'agentLoop-return',
      say: 'The result "92" goes back with id call_c.',
    },
    {
      line: 40,
      anim: 'agentLoop-loopback',
      say: 'Back to the top of while True: turn 3.',
    },
    {
      line: 41,
      out: '--- 1. Sending to AI (with tools)... ---',
      anim: 'agentLoop-send3',
      say: 'Loop turn 3: the history has all three results.',
    },
    {
      line: 42,
      set: { response: 'ChatCompletion (turn 3)' },
      anim: 'apiProcessing',
      say: 'All the math is done, so the AI writes a text answer.',
    },
    {
      line: 46,
      set: { message: '{role:"assistant", content:"7 * 8 + 9 * 4 = 92...", tool_calls:None}' },
      anim: 'agentLoop-decide',
      say: 'Text in message.content, and tool_calls is None.',
    },
    {
      line: 47,
      set: { messages: hist(A1, 'tool:"56"', 'tool:"36"', A2, 'tool:"92"', 'assistant:"text answer"') },
      anim: HOLD,
      say: 'We save the answer in the history.',
    },
    {
      line: 49,
      anim: 'agentLoop-check',
      say: 'Are there no tool_calls? TRUE this time, so we go inside the if.',
    },
    {
      line: 50,
      out: '--- Final Answer from AI: ---',
      anim: HOLD,
      say: 'We print a header for the final answer.',
    },
    {
      line: 51,
      set: { final_answer: PAR_ANSWER },
      out: PAR_ANSWER,
      anim: 'agentLoop-finalAnswer',
      say: 'We print the AI\'s explanation.',
    },
    {
      line: 52,
      anim: DONE,
      say: 'break ends the loop. 3 AI calls, but 3 tool runs: two of them came from a single reply.',
    },
    {
      line: 40,
      anim: DONE,
      say: 'What you learned: one reply can hold several tool_calls. The for loop runs each one, and every result carries its own tool_call_id.',
    },
  ]);
}

const multiFunctionParallelSteps: TraceStep[] = buildParallelTrace();

export const multiFunctionVariants: TraceVariant[] = [
  {
    id: 'default',
    label: '(50 * 2) - 15',
    inputValue: 'What is (50 * 2) - 15?',
    steps: multiFunctionTrace,
  },
  {
    id: 'variant2',
    label: '100 / 5 + 3',
    inputValue: 'What is 100 / 5 + 3?',
    steps: multiFunction100Div5Plus3Steps,
  },
  {
    id: 'variant3',
    label: '7 * 8 + 9 * 4 (2 tools at once)',
    inputValue: PAR_Q,
    steps: multiFunctionParallelSteps,
  },
];
