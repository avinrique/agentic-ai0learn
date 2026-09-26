import { TraceStep, TraceVariant, Variable } from '@/stores/tracerStore';

// ---------------------------------------------------------------------------
// Small builder: each step lists only the variables it sets (or removes with
// null). The builder carries every other variable forward and marks isNew /
// isChanged automatically, so the Variables panel stays consistent.
// Animation triggers are explained at the top of part2.ts.
// ---------------------------------------------------------------------------
interface StepSpec {
  line: number;
  set?: Record<string, string | null>;
  out?: string;
  anim?: string;
  text: string;
}

function build(specs: StepSpec[]): TraceStep[] {
  const state = new Map<string, string>();
  return specs.map((s) => {
    const added = new Set<string>();
    const changed = new Set<string>();
    for (const [name, value] of Object.entries(s.set ?? {})) {
      if (value === null) {
        state.delete(name);
        continue;
      }
      if (!state.has(name)) added.add(name);
      else if (state.get(name) !== value) changed.add(name);
      state.set(name, value);
    }
    const variables: Variable[] = Array.from(state.entries()).map(([name, value]) => ({
      name,
      value,
      ...(added.has(name) ? { isNew: true } : changed.has(name) ? { isChanged: true } : {}),
    }));
    return {
      lineNumber: s.line,
      variables,
      output: s.out ?? '',
      ...(s.anim ? { animationTrigger: s.anim } : {}),
      explanation: s.text,
    };
  });
}

const HOLD = 'agentLoop-hold';

// ===========================================================================
// Lesson 8: Multi-Tool Agent (study_buddy.py) — add + lookup
// ===========================================================================
interface StudyBuddyCase {
  q: string;
  intro: string;
  tool: 'add' | 'lookup';
  call: string; // e.g. lookup(query="LangChain")
  args: string; // the args dict as shown in Variables
  argsNote: string;
  kindNote: string; // what kind of question this is
  why: string; // how the AI picks
  result: string; // Python value as shown in Variables (strings keep their quotes)
  notFound?: boolean; // step into lookup to show the "Sorry" path
  toolShort: string; // short form of the tool message for the messages list
  final: string; // final answer text (no quotes)
  finalNote: string;
  summary: string;
}

function buildStudyBuddy(c: StudyBuddyCase): TraceStep[] {
  const user = `{role:"user", content:"${c.q}"}`;
  const printed = c.result.startsWith('"') ? c.result.slice(1, -1) : c.result;
  const branch: StepSpec[] =
    c.tool === 'add'
      ? [
          {
            line: 56,
            anim: 'toolSelect-add',
            text: `Now our code runs the request. tool_name == "add" is True, so we take the first branch.`,
          },
          {
            line: 57,
            anim: 'agentLoop-execute',
            set: { result: c.result },
            text: `**args unpacks the dict, so add(**args) means ${c.call}. Real Python does the math: result = ${c.result}.`,
          },
        ]
      : [
          {
            line: 56,
            anim: 'toolSelect-lookup',
            text: `Now our code runs the request. Is tool_name "add"? No, so Python skips line 57.`,
          },
          {
            line: 58,
            anim: 'toolSelect-lookup',
            text: `elif tool_name == "lookup" is True, so we land here.`,
          },
          ...(c.notFound
            ? ([
                {
                  line: 59,
                  anim: 'agentLoop-execute',
                  text: `lookup(**args) means ${c.call}. Python jumps into the lookup function.`,
                },
                {
                  line: 12,
                  anim: 'agentLoop-execute',
                  text: `lookup reads the notes file and checks it line by line.`,
                },
                {
                  line: 13,
                  anim: 'agentLoop-execute',
                  text: `Does any line contain "${c.q.replace(/^What is |\?$/g, '').toLowerCase()}"? None of them do, so line 14 never runs.`,
                },
                {
                  line: 15,
                  anim: 'agentLoop-execute',
                  set: { result: c.result },
                  text: `The loop ends without a match, so lookup returns "Sorry, I don't know that." The tool still gives back text.`,
                },
              ] as StepSpec[])
            : ([
                {
                  line: 59,
                  anim: 'agentLoop-execute',
                  set: { result: c.result },
                  text: `**args unpacks the dict, so lookup(**args) means ${c.call}. It returns the matching line from the notes.`,
                },
              ] as StepSpec[])),
        ];

  return build([
    { line: 1, text: c.intro },
    {
      line: 3,
      anim: 'import',
      text: `Line 2 imports OpenAI to talk to the AI. This line imports json, which we need later to read the AI's tool arguments.`,
    },
    {
      line: 4,
      set: { client: 'OpenAI()' },
      text: `client is our connection to OpenAI. Every request to the AI goes through it.`,
    },
    {
      line: 7,
      anim: 'defineTools',
      set: { add: 'function(a, b)' },
      text: `Tool 1: add. A normal Python function that returns a + b. The AI can't run it; only our code can.`,
    },
    {
      line: 10,
      anim: 'defineTools',
      set: { lookup: 'function(query)' },
      text: `Tool 2: lookup. It takes one input called query: the word to search for, like "LangChain".`,
    },
    {
      line: 13,
      anim: 'defineTools',
      text: `lookup reads the notes file and checks each line: does it contain the query? Both sides are lowercased, so "langchain" still matches "LangChain".`,
    },
    {
      line: 15,
      anim: 'defineTools',
      text: `If no line matches, lookup returns "Sorry, I don't know that." So the tool always gives back some text.`,
    },
    {
      line: 18,
      anim: 'defineTools',
      set: { tools: '[add, lookup]' },
      text: `tools is the menu we show the AI, with one entry per function. The AI only sees this menu, never our Python code.`,
    },
    {
      line: 21,
      anim: 'defineTools-desc',
      text: `The add entry's description: "Add two numbers together." The AI reads this sentence to decide when add is useful.`,
    },
    {
      line: 28,
      anim: 'defineTools-desc',
      text: `The lookup description: "Search for a concept or term in the notes file." It is very different from add, so the AI can tell them apart.`,
    },
    {
      line: 30,
      anim: 'defineTools-params',
      text: `lookup needs one parameter: query, a string. If the AI picks lookup, it must fill in query itself.`,
    },
    {
      line: 35,
      anim: 'addSystemMsg',
      set: { system_prompt: '"You are StudyBuddy - a friendly AI assistant..."' },
      text: `The system prompt gives the AI its role: a friendly study helper.`,
    },
    {
      line: 37,
      text: `Lines 36–37 add simple rules: math question → calculator (add), concept question → lookup. Hints plus descriptions make the choice easy.`,
    },
    { line: 38, set: { user_query: `"${c.q}"` }, text: `The student's question: "${c.q}" ${c.kindNote}` },
    {
      line: 40,
      set: { messages: `[system, ${user}]` },
      text: `messages is the chat history we send: the system prompt first, then the user's question.`,
    },
    {
      line: 46,
      anim: 'agentLoop-send',
      text: `We send the messages AND the tools menu to the AI. Nothing runs on our side yet; the AI only reads.`,
    },
    { line: 47, anim: 'apiProcessing', text: c.why },
    {
      line: 49,
      anim: 'agentLoop-decide',
      set: { assistant_message: `<tool_calls=[${c.call}], content=None>` },
      text: `The AI replies with a tool request, not text: "please call ${c.call}". Its content is empty for now.`,
    },
    {
      line: 52,
      anim: `toolSelect-${c.tool}`,
      set: { tool_call: `<id="call_1", function=${c.tool}>` },
      text: `tool_calls is a list, because the AI may ask for several tools at once. [0] takes the first (and only) request.`,
    },
    {
      line: 53,
      anim: `toolSelect-${c.tool}`,
      set: { tool_name: `"${c.tool}"` },
      text: `tool_name is "${c.tool}". Look at the menu: the AI chose ${c.tool}, not ${c.tool === 'add' ? 'lookup' : 'add'}.`,
    },
    {
      line: 54,
      anim: `toolSelect-${c.tool}`,
      set: { args: c.args },
      text: `The arguments arrive as JSON text. json.loads turns them into a Python dict: ${c.args}. ${c.argsNote}`,
    },
    ...branch,
    {
      line: 62,
      anim: 'agentLoop-execute',
      out: `Tool result: ${printed}`,
      text: `We print the tool's result so we can see it in the console.`,
    },
    {
      line: 65,
      anim: HOLD,
      set: { messages: `[system, ${user}, assistant(tool_calls)]` },
      text: `We add the AI's tool request to the history. The AI must see its own request before it sees the answer.`,
    },
    {
      line: 66,
      anim: 'agentLoop-return',
      set: { messages: `[system, ${user}, assistant(tool_calls), ${c.toolShort}]` },
      text: `Then we add the result with role "tool". tool_call_id "call_1" links this answer to the exact request it answers.`,
    },
    {
      line: 72,
      anim: 'agentLoop-send2',
      text: `Second API call with the updated history. No tools this time: we only want a friendly written answer.`,
    },
    {
      line: 72,
      anim: 'apiProcessing',
      text: `The AI reads the tool result (${printed.length > 40 ? printed.slice(0, 40) + '…' : printed}) and writes a reply.`,
    },
    {
      line: 75,
      anim: 'agentLoop-finalAnswer',
      set: { response_final: '<ChatCompletion>', final_answer: `"${c.final}"` },
      text: `The AI replies with normal text. We take .content and store it in final_answer.`,
    },
    { line: 76, anim: 'agentLoop-final', out: `StudyBuddy: ${c.final}`, text: c.finalNote },
    { line: 76, anim: 'agentLoop-final', text: c.summary },
  ]);
}

export const multiToolTrace: TraceStep[] = buildStudyBuddy({
  q: 'What is LangChain?',
  intro: `We'll build StudyBuddy, an agent with two very different tools: add (math) and lookup (search notes). New vs. last lesson: the AI must pick the right KIND of tool.`,
  tool: 'lookup',
  call: 'lookup(query="LangChain")',
  args: '{"query": "LangChain"}',
  argsNote: 'The AI filled in query by itself.',
  kindNote: `It's a concept question, not a math question.`,
  why: `The AI compares the question with each description. "Add two numbers" doesn't fit. "Search for a concept" fits "What is LangChain?".`,
  result: '"LangChain is a framework for building applications with large language models."',
  toolShort: 'tool("LangChain is a framework...")',
  final: 'LangChain is a framework that helps you build apps powered by large language models. Keep going! 🚀',
  finalNote: `We print the answer. The AI turned the plain notes line into a friendly explanation.`,
  summary: `What you learned: 1) The AI picks a tool by reading the descriptions. 2) We run the chosen function ourselves. 3) A second call turns the result into an answer.`,
});

const multiToolMathSteps = buildStudyBuddy({
  q: 'What is 25 + 17?',
  intro: `Same StudyBuddy, but this time a math question: "What is 25 + 17?" Watch the AI pick the OTHER tool.`,
  tool: 'add',
  call: 'add(a=25, b=17)',
  args: '{"a": 25, "b": 17}',
  argsNote: 'The AI pulled both numbers out of the question.',
  kindNote: `It's a math question this time.`,
  why: `The AI compares the question with each description. "Add two numbers together" fits "25 + 17". "Search the notes" does not.`,
  result: '42',
  toolShort: 'tool("42")',
  final: '25 + 17 = 42. Nice work! 🧮',
  finalNote: `We print the answer. The number came from our Python add, not from the AI's guess.`,
  summary: `What you learned: the same code handles both kinds of questions. The descriptions steer the AI to add for math and lookup for concepts.`,
});

const multiToolNotFoundSteps = buildStudyBuddy({
  q: 'What is Kubernetes?',
  intro: `One more StudyBuddy run: "What is Kubernetes?" Our notes file has nothing about it. What happens when a tool can't find anything?`,
  tool: 'lookup',
  call: 'lookup(query="Kubernetes")',
  args: '{"query": "Kubernetes"}',
  argsNote: 'The AI filled in query by itself.',
  kindNote: `It's a concept question, so lookup should fit.`,
  why: `"What is Kubernetes?" is a concept question, so the lookup description fits. The AI does not know what is in our notes; it just asks.`,
  result: `"Sorry, I don't know that."`,
  notFound: true,
  toolShort: `tool("Sorry, I don't know that.")`,
  final: `Sorry, Kubernetes isn't in my study notes yet. Try asking me about LangChain! 📚`,
  finalNote: `We print the answer. The AI honestly says the notes don't cover it, instead of making something up.`,
  summary: `What you learned: a tool can "fail" politely by returning text. The AI reads that text and tells the user, so the agent stays honest.`,
});

export const multiToolVariants: TraceVariant[] = [
  { id: 'default', label: 'What is LangChain?', inputValue: 'What is LangChain?', steps: multiToolTrace },
  { id: 'math', label: 'What is 25 + 17? (math)', inputValue: 'What is 25 + 17?', steps: multiToolMathSteps },
  {
    id: 'notfound',
    label: 'What is Kubernetes? (not in notes)',
    inputValue: 'What is Kubernetes?',
    steps: multiToolNotFoundSteps,
  },
];

// ===========================================================================
// Lesson 9: Study Buddy Pro (study_buddy_pro.py) — 7 tools + a dispatch dict
// ===========================================================================
interface ProCase {
  q: string;
  intro: string;
  tool: string;
  call: string; // simple_interest(principal=1000, rate=5, time=2)
  args: string; // {"principal": 1000, ...}
  line12: string; // explanation for the simple_interest line
  hidden: string; // what the question contains
  why: string;
  argsNote: string;
  unpack: string; // explanation of **args
  result: string;
  runNote: string;
  toolShort: string;
  final: string;
}

function buildPro(c: ProCase): TraceStep[] {
  const user = `{role:"user", content:"${c.q}"}`;
  const printed = c.result.startsWith('"') ? c.result.slice(1, -1) : c.result;
  return build([
    { line: 1, text: c.intro },
    {
      line: 3,
      anim: 'import',
      text: `Same imports as before: OpenAI (line 2) to talk to the AI, and json to read its arguments.`,
    },
    { line: 4, set: { client: 'OpenAI()' }, text: `client is our connection to OpenAI, just like last lesson.` },
    {
      line: 7,
      anim: 'defineTools',
      set: {
        add: 'function(a, b)',
        subtract: 'function(a, b)',
        multiply: 'function(a, b)',
        divide: 'function(a, b)',
        percentage: 'function(part, total)',
      },
      text: `Lines 7–11 are five short math tools: add, subtract, multiply, divide and percentage. Each fits on one line.`,
    },
    { line: 12, anim: 'defineTools', set: { simple_interest: 'function(principal, rate, time)' }, text: c.line12 },
    {
      line: 13,
      anim: 'defineTools',
      set: { lookup: 'function(query)' },
      text: `lookup is the notes search from last lesson, unchanged. That makes 7 tools in total.`,
    },
    {
      line: 21,
      anim: 'defineTools',
      set: { tools: '[add, subtract, multiply, divide, percentage, simple_interest, lookup]' },
      text: `The menu now has 7 entries. {...} only hides the parameters to save space; the real file writes them out.`,
    },
    {
      line: 29,
      anim: 'defineTools-desc',
      text: `The simple_interest description even includes the formula. Clear descriptions help the AI choose correctly among many similar math tools.`,
    },
    {
      line: 31,
      anim: 'defineTools-params',
      text: `simple_interest needs three numbers: principal, rate and time. Every tool lists the inputs the AI must fill in.`,
    },
    {
      line: 39,
      anim: 'addSystemMsg',
      set: { system_prompt: '"You are StudyBuddy Pro - a smart and friendly AI tutor..."' },
      text: `The system prompt lists what the tutor can do and asks it to always choose the correct function.`,
    },
    { line: 43, set: { user_query: `"${c.q}"` }, text: c.hidden },
    {
      line: 45,
      set: { messages: `[system, ${user}]` },
      text: `messages holds the system prompt and the user's question, the same shape as before.`,
    },
    { line: 50, anim: 'agentLoop-send', text: `We send the messages and all 7 tool descriptions to the AI.` },
    { line: 51, anim: 'apiProcessing', text: c.why },
    {
      line: 53,
      anim: 'agentLoop-decide',
      set: { assistant_message: `<tool_calls=[${c.call}], content=None>` },
      text: `The AI replies with a tool request: call ${c.tool}. No text answer yet.`,
    },
    {
      line: 54,
      anim: `toolSelect-${c.tool}`,
      set: { tool_call: `<id="call_1", function=${c.tool}>` },
      text: `We take the first (and only) request from the tool_calls list.`,
    },
    {
      line: 55,
      anim: `toolSelect-${c.tool}`,
      set: { tool_name: `"${c.tool}"` },
      text: `tool_name is "${c.tool}". Out of 7 tools, the AI picked the right one.`,
    },
    { line: 56, anim: `toolSelect-${c.tool}`, set: { args: c.args }, text: c.argsNote },
    {
      line: 59,
      anim: `toolSelect-${c.tool}`,
      set: { available_functions: '{"add": add, "subtract": subtract, ... "lookup": lookup}' },
      text: `available_functions is a dictionary: names on the left, functions on the right. Think of a phone contact list: name → number.`,
    },
    {
      line: 60,
      anim: `toolSelect-${c.tool}`,
      text: `Look closely: "add" in quotes is just text. add without quotes is the real function. The dict links the text the AI sends to our code.`,
    },
    {
      line: 64,
      anim: `toolSelect-${c.tool}`,
      set: { function_to_call: c.tool },
      text: `available_functions["${c.tool}"] gives back the ${c.tool} function itself. One lookup replaces seven if/elif checks.`,
    },
    { line: 65, anim: 'agentLoop-execute', text: c.unpack },
    { line: 65, anim: 'agentLoop-execute', set: { result: c.result }, text: c.runNote },
    {
      line: 66,
      anim: 'agentLoop-execute',
      out: `Tool result: ${printed}`,
      text: `We print the result so we can check it.`,
    },
    {
      line: 69,
      anim: HOLD,
      set: { messages: `[system, ${user}, assistant(tool_calls)]` },
      text: `We add the AI's tool request to the history first.`,
    },
    {
      line: 70,
      anim: 'agentLoop-return',
      set: { messages: `[system, ${user}, assistant(tool_calls), ${c.toolShort}]` },
      text: `Then the result, with role "tool" and the matching tool_call_id "call_1". str(result) turns it into text, because message content must be text.`,
    },
    {
      line: 76,
      anim: 'agentLoop-send2',
      text: `Second API call: the AI now sees the question, its own request, and the result.`,
    },
    {
      line: 76,
      anim: 'apiProcessing',
      text: `No tools are sent this time. The AI turns the result into a friendly explanation.`,
    },
    {
      line: 79,
      anim: 'agentLoop-finalAnswer',
      set: { response_final: '<ChatCompletion>', final_answer: `"${c.final}"` },
      text: `The AI writes a friendly explanation using the real result. We store the text in final_answer.`,
    },
    { line: 80, anim: 'agentLoop-final', out: `StudyBuddy Pro: ${c.final}`, text: `We print the tutor's answer.` },
    {
      line: 80,
      anim: 'agentLoop-final',
      text: `What you learned: 1) Good descriptions let the AI pick from many tools. 2) A dict maps names to functions. 3) **args turns a dict into named inputs.`,
    },
  ]);
}

export const studyBuddyProTrace: TraceStep[] = buildPro({
  q: 'Find the simple interest on 1000 at 5% for 2 years',
  intro: `StudyBuddy Pro works like StudyBuddy, but with SEVEN tools. New: instead of a long if/elif chain, we pick the function from a dictionary (a lookup table).`,
  tool: 'simple_interest',
  call: 'simple_interest(principal=1000, rate=5, time=2)',
  args: '{"principal": 1000, "rate": 5, "time": 2}',
  line12: `simple_interest takes three inputs and returns (principal × rate × time) / 100. Our question will need this one.`,
  hidden: `The question hides three numbers: 1000 (principal), 5% (rate) and 2 years (time).`,
  why: `The AI scans the 7 descriptions. "Simple interest" matches one exactly. It also maps 1000 → principal, 5 → rate, 2 → time.`,
  argsNote: `json.loads turns the AI's argument text into a Python dict with three keys: principal, rate and time.`,
  unpack: `**args unpacks the dict: {"principal": 1000, "rate": 5, "time": 2} becomes principal=1000, rate=5, time=2.`,
  result: '100.0',
  runNote: `So this runs simple_interest(principal=1000, rate=5, time=2) = (1000 × 5 × 2) / 100 = 100.0. Real Python did the math, not the AI.`,
  toolShort: 'tool("100.0")',
  final: 'The simple interest is 100 💰. Formula: (1000 × 5 × 2) / 100 = 100. Great job practising! 🎉',
});

const proPercentageSteps = buildPro({
  q: 'What percent is 45 out of 60?',
  intro: `StudyBuddy Pro again, with a different kind of math: "What percent is 45 out of 60?" Which of the 7 tools fits?`,
  tool: 'percentage',
  call: 'percentage(part=45, total=60)',
  args: '{"part": 45, "total": 60}',
  line12: `simple_interest takes three inputs and returns (principal × rate × time) / 100. Not needed for this question.`,
  hidden: `The question hides two numbers: 45 (the part) and 60 (the total).`,
  why: `The AI scans the 7 descriptions. "Calculate percentage as (part/total)*100" fits. It maps 45 → part and 60 → total.`,
  argsNote: `json.loads turns the argument text into a dict with two keys: part and total.`,
  unpack: `**args unpacks the dict: {"part": 45, "total": 60} becomes part=45, total=60.`,
  result: '75.0',
  runNote: `So this runs percentage(part=45, total=60) = (45 / 60) × 100 = 75.0. Real Python did the math.`,
  toolShort: 'tool("75.0")',
  final: '45 out of 60 is 75% 📊. Formula: (45 / 60) × 100 = 75. Nice work! 🎯',
});

const proLookupSteps = buildPro({
  q: 'Explain what an AI agent is',
  intro: `This time StudyBuddy Pro gets a concept question: "Explain what an AI agent is". Six tools are math; will it find the right one?`,
  tool: 'lookup',
  call: 'lookup(query="agent")',
  args: '{"query": "agent"}',
  line12: `simple_interest takes three inputs and returns (principal × rate × time) / 100. Not needed for this question.`,
  hidden: `No numbers at all this time: it is a question about an idea.`,
  why: `The AI scans the 7 descriptions. Six are math. "Search for a concept or term in the notes file" fits. It picks the key word "agent" as the query.`,
  argsNote: `json.loads turns the argument text into a dict with one key: query = "agent".`,
  unpack: `**args unpacks the dict: {"query": "agent"} becomes query="agent".`,
  result: '"An agent is an AI that uses tools in a loop to reach a goal."',
  runNote: `So this runs lookup(query="agent"). It returns the notes line that mentions "agent". The same dict handles math and non-math tools.`,
  toolShort: 'tool("An agent is an AI that uses tools...")',
  final:
    'An AI agent is an AI that can use tools, like our calculator functions, in a loop until it reaches its goal. 🤖',
});

export const studyBuddyProVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'Simple interest on 1000 at 5% for 2 years',
    inputValue: 'Find the simple interest on 1000 at 5% for 2 years',
    steps: studyBuddyProTrace,
  },
  {
    id: 'percent',
    label: 'What percent is 45 out of 60?',
    inputValue: 'What percent is 45 out of 60?',
    steps: proPercentageSteps,
  },
  {
    id: 'lookup',
    label: 'Explain what an AI agent is',
    inputValue: 'Explain what an AI agent is',
    steps: proLookupSteps,
  },
];

// ===========================================================================
// Lesson 10: Terminal Assistant (terminal_assistant.py) — run / read / write
// ===========================================================================
interface TerminalCase {
  q: string;
  intro: string;
  tool: 'run_command' | 'read_file' | 'write_file';
  call: string; // run_command(command="ls")
  args: string; // {"command": "ls"}
  why: string;
  argsNote: string;
  inside: StepSpec[]; // the steps inside the tool function
  cleanup: Record<string, null>; // local variables to remove when the function returns
  result: string; // string value with literal \n
  resultNote: string;
  toolShort: string;
  answer: string;
}

function buildTerminal(c: TerminalCase): TraceStep[] {
  const user = `{role:"user", content:"${c.q}"}`;
  const answerShort = c.answer.length > 26 ? c.answer.slice(0, 26) + '...' : c.answer;
  return build([
    { line: 1, text: c.intro },
    {
      line: 3,
      anim: 'import',
      text: `subprocess is new. It is Python's built-in way to run terminal commands, as if you typed them yourself. (Line 5 creates the usual OpenAI client.)`,
    },
    {
      line: 8,
      anim: 'defineTools',
      set: { run_command: 'function(command)' },
      text: `Tool 1: run_command takes a command like "ls" and returns what the terminal prints.`,
    },
    {
      line: 16,
      anim: 'defineTools',
      set: { read_file: 'function(path)', write_file: 'function(path, content)' },
      text: `Tools 2 and 3: read_file returns a file's text, and write_file (line 20) saves text into a file.`,
    },
    {
      line: 26,
      anim: 'defineTools',
      set: { tools: '[run_command, read_file, write_file]' },
      text: `The menu lists these three tools. The descriptions tell the AI when each one is useful.`,
    },
    {
      line: 33,
      anim: 'defineTools',
      set: { available_functions: '{"run_command": run_command, "read_file": read_file, "write_file": write_file}' },
      text: `Same trick as Study Buddy Pro: a dictionary from each tool's name (text) to the real Python function.`,
    },
    {
      line: 41,
      anim: 'addSystemMsg',
      set: { system_prompt: '"You are a friendly terminal assistant..."' },
      text: `The system prompt (from line 39) describes the assistant. This line asks it to confirm before destructive commands like rm (delete). Helpful, but only a request.`,
    },
    {
      line: 42,
      set: { messages: '[system]' },
      text: `messages starts with only the system prompt. It grows with every question, tool result and answer; it is the assistant's memory.`,
    },
    {
      line: 45,
      anim: 'chatLoop',
      text: `The OUTER loop is the chat loop. It repeats: ask the user, answer, ask again, until the user types exit.`,
    },
    {
      line: 46,
      anim: 'chatLoop',
      set: { user_input: `"${c.q}"` },
      out: `You: ${c.q}`,
      text: `input() pauses and waits for you to type. The user types: "${c.q}"`,
    },
    {
      line: 47,
      anim: 'chatLoop',
      text: `Is it "exit"? strip() removes extra spaces and lower() ignores capitals. It isn't, so we keep going (the empty-input check on line 50 also passes).`,
    },
    { line: 52, set: { messages: `[system, ${user}]` }, text: `We add the user's question to messages.` },
    {
      line: 55,
      anim: 'agentLoop-enter',
      text: `The INNER loop is the agent loop. It keeps calling the AI until the AI answers with plain text instead of a tool request.`,
    },
    { line: 56, anim: 'agentLoop-send', text: `We send the whole history plus the tools menu to the AI.` },
    { line: 57, anim: 'apiProcessing', text: c.why },
    {
      line: 59,
      anim: 'agentLoop-decide',
      set: { message: `<content=None, tool_calls=[${c.call}]>` },
      text: `The reply is a tool request, not text: an order slip for ${c.tool}.`,
    },
    {
      line: 60,
      anim: HOLD,
      set: { messages: `[system, ${user}, assistant(tool_calls)]` },
      text: `We save the reply into messages right away, so the history stays complete.`,
    },
    {
      line: 62,
      anim: 'agentLoop-check',
      text: `Did the AI ask for tools? Yes, tool_calls has one request. So "not message.tool_calls" is False and we do NOT break yet.`,
    },
    {
      line: 66,
      anim: `toolSelect-${c.tool}`,
      set: { tool_call: `<id="call_1", function=${c.tool}>` },
      text: `The AI may ask for several tools in one reply, so we loop over message.tool_calls. This time there is just one.`,
    },
    {
      line: 67,
      anim: `toolSelect-${c.tool}`,
      set: { function_name: `"${c.tool}"` },
      text: `function_name is "${c.tool}".`,
    },
    { line: 68, anim: `toolSelect-${c.tool}`, set: { arguments: c.args }, text: c.argsNote },
    {
      line: 69,
      anim: `toolSelect-${c.tool}`,
      out: `  [Using tool: ${c.tool}]`,
      text: `We print which tool is being used, so the user can see what the assistant is doing.`,
    },
    {
      line: 71,
      anim: `toolSelect-${c.tool}`,
      set: { function_to_call: c.tool },
      text: `We look up "${c.tool}" in available_functions and get the real ${c.tool} function.`,
    },
    {
      line: 72,
      anim: 'agentLoop-execute',
      text: `function_to_call(**arguments) means ${c.call}. Python now jumps into the ${c.tool} function.`,
    },
    ...c.inside,
    {
      line: 72,
      anim: 'agentLoop-execute',
      set: { ...c.cleanup, result: c.result },
      text: c.resultNote,
    },
    {
      line: 74,
      anim: 'agentLoop-return',
      set: { messages: `[system, ${user}, assistant(tool_calls), ${c.toolShort}]` },
      text: `We append the result with role "tool" and tool_call_id "call_1", so the AI knows which request it answers.`,
    },
    {
      line: 56,
      anim: 'agentLoop-send2',
      text: `The for loop is done, so the inner while loops back. We call the AI again; now messages includes the tool result.`,
    },
    {
      line: 57,
      anim: 'apiProcessing',
      text: `The AI reads the result. It has what it needs, so this time it writes text instead of asking for a tool.`,
    },
    {
      line: 59,
      anim: 'agentLoop-decide',
      set: { message: `<content="${c.answer}", tool_calls=None>` },
      text: `This reply is plain text, and tool_calls is None.`,
    },
    {
      line: 60,
      anim: HOLD,
      set: { messages: `[system, ${user}, assistant(tool_calls), ${c.toolShort}, assistant("${answerShort}")]` },
      text: `We save the answer in messages too, so the assistant remembers it for the next question.`,
    },
    {
      line: 62,
      anim: 'agentLoop-check',
      text: `No tool_calls this time, so "not message.tool_calls" is True. We go inside the if.`,
    },
    {
      line: 63,
      anim: 'agentLoop-finalAnswer',
      set: { 'message.content': `"${c.answer}"` },
      out: `Assistant: ${c.answer}`,
      text: `We print the AI's answer.`,
    },
    {
      line: 64,
      anim: 'agentLoop-final',
      text: `break leaves the INNER agent loop only. The outer chat loop keeps running and asks for the next question.`,
    },
    {
      line: 46,
      anim: 'chatLoop',
      set: { user_input: '"exit"' },
      out: 'You: exit',
      text: `Back at the top of the chat loop, input() waits again. This time the user types exit.`,
    },
    {
      line: 48,
      anim: 'chatLoop',
      out: 'Goodbye!',
      text: `The exit check on line 47 is True, so we print Goodbye. The break on the next line leaves the OUTER loop and the program ends.`,
    },
    {
      line: 45,
      anim: 'chatLoop',
      text: `What you learned: 1) The chat loop asks questions; the agent loop runs tools until there's a text answer. 2) One reply can hold many tool calls. 3) Always confirm risky commands.`,
    },
  ]);
}

const LS_OUT = '"main.py\\nnotes.txt\\nREADME.md\\n"';

export const terminalAssistantTrace: TraceStep[] = buildTerminal({
  q: 'What files are in this folder?',
  intro: `Our last agent works on your real computer: it runs commands, reads files and writes files. New: a chat loop that keeps going, and an agent loop that can use tools many times.`,
  tool: 'run_command',
  call: 'run_command(command="ls")',
  args: '{"command": "ls"}',
  why: `The AI reads the question and the menu. Listing files is a terminal job, so it picks run_command and writes the command "ls".`,
  argsNote: `json.loads turns the arguments into a dict: {"command": "ls"}. The AI translated "what files" into the shell command ls.`,
  inside: [
    {
      line: 10,
      anim: 'agentLoop-execute',
      set: { command: '"ls"' },
      text: `Inside run_command, subprocess.run runs "ls" in a real shell. capture_output collects the printed text; timeout=30 stops it after 30 seconds.`,
    },
    {
      line: 10,
      anim: 'agentLoop-execute',
      text: `Safety note: shell=True runs ANY command the AI writes, even one that deletes files. In real apps, show the command and ask the user to confirm first.`,
    },
    {
      line: 11,
      anim: 'agentLoop-execute',
      set: { output: LS_OUT },
      text: `stdout is the normal output and stderr is any error text. We join them so the AI sees both.`,
    },
  ],
  cleanup: { command: null, output: null },
  result: LS_OUT,
  resultNote: `run_command returns the text, and we are back in the loop. result now holds the file list.`,
  toolShort: 'tool("main.py...")',
  answer: 'This folder has 3 files: main.py, notes.txt and README.md.',
});

const NOTES_TXT = '"Workshop notes:\\n- Agents use tools\\n- Always confirm risky commands\\n"';

const terminalReadSteps = buildTerminal({
  q: "Show me what's in notes.txt",
  intro: `Same terminal assistant, new request: "Show me what's in notes.txt". This time no shell command is needed. Watch which tool the AI picks.`,
  tool: 'read_file',
  call: 'read_file(path="notes.txt")',
  args: '{"path": "notes.txt"}',
  why: `The AI reads the menu. "Read the contents of a file at the given path" fits exactly, so it picks read_file with path "notes.txt".`,
  argsNote: `json.loads turns the arguments into a dict: {"path": "notes.txt"}.`,
  inside: [
    {
      line: 17,
      anim: 'agentLoop-execute',
      set: { path: '"notes.txt"' },
      text: `Inside read_file, open(path, "r") opens notes.txt for reading. "r" means read only: nothing can be changed.`,
    },
    {
      line: 18,
      anim: 'agentLoop-execute',
      text: `f.read() returns the whole file as one string. No shell is involved, so this tool is much safer than run_command.`,
    },
  ],
  cleanup: { path: null },
  result: NOTES_TXT,
  resultNote: `read_file returns the file's text, and we are back in the loop. result holds the three lines of notes.txt.`,
  toolShort: 'tool("Workshop notes:...")',
  answer: 'notes.txt has a title (Workshop notes) and two tips: agents use tools, and always confirm risky commands.',
});

const terminalWriteSteps = buildTerminal({
  q: 'Create hello.txt that says Hello, world!',
  intro: `Last example: "Create hello.txt that says Hello, world!" Now the assistant CHANGES something on your computer.`,
  tool: 'write_file',
  call: 'write_file(path="hello.txt", content="Hello, world!")',
  args: '{"path": "hello.txt", "content": "Hello, world!"}',
  why: `The AI reads the menu. "Write content to a file" fits. It fills in TWO arguments: the path and the text to write.`,
  argsNote: `json.loads gives a dict with two keys: path = "hello.txt" and content = "Hello, world!".`,
  inside: [
    {
      line: 21,
      anim: 'agentLoop-execute',
      set: { path: '"hello.txt"', content: '"Hello, world!"' },
      text: `Inside write_file, open(path, "w") opens hello.txt for writing. "w" creates the file, or EMPTIES it if it already exists.`,
    },
    {
      line: 22,
      anim: 'agentLoop-execute',
      text: `f.write(content) saves "Hello, world!" into the file. This really changes your disk.`,
    },
    {
      line: 23,
      anim: 'agentLoop-execute',
      text: `The function returns a short success message, so the AI knows it worked.`,
    },
  ],
  cleanup: { path: null, content: null },
  result: '"Successfully wrote to hello.txt"',
  resultNote: `We are back in the loop. result is "Successfully wrote to hello.txt".`,
  toolShort: 'tool("Successfully wrote to hello.txt")',
  answer: 'Done! I created hello.txt with the text: Hello, world!',
});

// The question comes from input(), so it is not in the code: inputValue never matches.
export const terminalAssistantVariants: TraceVariant[] = [
  {
    id: 'default',
    label: 'What files are in this folder?',
    inputValue: 'What files are in this folder?',
    steps: terminalAssistantTrace,
  },
  {
    id: 'read',
    label: "Show me what's in notes.txt",
    inputValue: "Show me what's in notes.txt",
    steps: terminalReadSteps,
  },
  {
    id: 'write',
    label: 'Create hello.txt that says Hello, world!',
    inputValue: 'Create hello.txt that says Hello, world!',
    steps: terminalWriteSteps,
  },
];
