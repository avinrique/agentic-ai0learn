import { TraceStep, Variable } from '@/stores/tracerStore';

// ---------------------------------------------------------------------------
// Small builder: each step lists only the variables it sets (or removes with
// null). The builder carries every other variable forward and marks isNew /
// isChanged automatically, so the Variables panel stays consistent.
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

// ===========================================================================
// Lesson 8: multiToolTrace — StudyBuddy, "What is LangChain?"
// ===========================================================================
const LC_LINE = 'LangChain is a framework for building applications with large language models.';
const MT_USER = '{role:"user", content:"What is LangChain?"}';
const MT_FINAL = '"LangChain is a framework that helps you build apps powered by large language models. Keep going! 🚀"';

export const multiToolTrace: TraceStep[] = build([
  {
    line: 1,
    text: `We'll build StudyBuddy, an agent with two very different tools: add (math) and lookup (search notes). New vs. last lesson: the AI must pick the right KIND of tool.`,
  },
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
    anim: 'defineTools',
    text: `The add entry's description: "Add two numbers together." The AI reads this sentence to decide when add is useful.`,
  },
  {
    line: 28,
    anim: 'defineTools',
    text: `The lookup description: "Search for a concept or term in the notes file." It is very different from add, so the AI can tell them apart.`,
  },
  {
    line: 30,
    anim: 'defineTools',
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
  {
    line: 38,
    set: { user_query: '"What is LangChain?"' },
    text: `The student's question: "What is LangChain?" It's a concept question, not a math question.`,
  },
  {
    line: 40,
    set: { messages: `[system, ${MT_USER}]` },
    text: `messages is the chat history we send: the system prompt first, then the user's question.`,
  },
  {
    line: 46,
    anim: 'agentLoop-send',
    text: `We send the messages AND the tools menu to the AI. Nothing runs on our side yet; the AI only reads.`,
  },
  {
    line: 47,
    anim: 'apiProcessing',
    text: `The AI compares the question with each description. "Add two numbers" doesn't fit. "Search for a concept" fits "What is LangChain?".`,
  },
  {
    line: 49,
    anim: 'agentLoop-decide',
    set: { assistant_message: '<tool_calls=[lookup(query="LangChain")], content=None>' },
    text: `The AI replies with a tool request, not text: "please call lookup with query = LangChain". Its content is empty for now.`,
  },
  {
    line: 52,
    anim: 'toolSelect-lookup',
    set: { tool_call: '<id="call_1", function=lookup>' },
    text: `tool_calls is a list, because the AI may ask for several tools at once. [0] takes the first (and only) request.`,
  },
  {
    line: 53,
    anim: 'toolSelect-lookup',
    set: { tool_name: '"lookup"' },
    text: `tool_name is "lookup". Look at the tools panel: the AI chose lookup, not add.`,
  },
  {
    line: 54,
    anim: 'toolSelect-lookup',
    set: { args: '{"query": "LangChain"}' },
    text: `The arguments arrive as JSON text. json.loads turns them into a Python dict: {"query": "LangChain"}.`,
  },
  {
    line: 58,
    anim: 'toolSelect-lookup',
    text: `Now our code runs the request. tool_name is not "add", so Python skips the first branch. tool_name == "lookup" is True, so we land here.`,
  },
  {
    line: 59,
    anim: 'agentLoop-execute',
    set: { result: `"${LC_LINE}"` },
    text: `**args unpacks the dict, so lookup(**args) means lookup(query="LangChain"). It returns the matching line from the notes.`,
  },
  {
    line: 62,
    anim: 'agentLoop-execute',
    out: `Tool result: ${LC_LINE}`,
    text: `We print the tool's result so we can see it in the console.`,
  },
  {
    line: 65,
    anim: 'agentLoop-execute',
    set: { messages: `[system, ${MT_USER}, assistant(tool_calls)]` },
    text: `We add the AI's tool request to the history. The AI must see its own request before it sees the answer.`,
  },
  {
    line: 66,
    anim: 'agentLoop-return',
    set: { messages: `[system, ${MT_USER}, assistant(tool_calls), tool("LangChain is a framework...")]` },
    text: `Then we add the result with role "tool". tool_call_id links this answer to the exact request it answers.`,
  },
  {
    line: 72,
    anim: 'agentLoop-send2',
    text: `Second API call with the updated history. No tools this time: we only want a friendly written answer.`,
  },
  {
    line: 75,
    anim: 'agentLoop-finalAnswer',
    set: { response_final: '<ChatCompletion>', final_answer: MT_FINAL },
    text: `The AI replies with normal text. We take .content and store it in final_answer.`,
  },
  {
    line: 76,
    anim: 'agentLoop-final',
    out: `StudyBuddy: ${MT_FINAL.slice(1, -1)}`,
    text: `We print the answer. The AI turned the plain notes line into a friendly explanation.`,
  },
  {
    line: 76,
    anim: 'agentLoop-final',
    text: `What you learned: 1) The AI picks a tool by reading the descriptions. 2) We run the chosen function ourselves. 3) A second call turns the result into an answer.`,
  },
]);

// ===========================================================================
// Lesson 9: studyBuddyProTrace — 7 tools, simple interest question
// ===========================================================================
const SI_USER = '{role:"user", content:"Find the simple interest on 1000 at 5% for 2 years"}';
const SI_FINAL = '"The simple interest is 100 💰. Formula: (1000 × 5 × 2) / 100 = 100. Great job practising! 🎉"';

export const studyBuddyProTrace: TraceStep[] = build([
  {
    line: 1,
    text: `StudyBuddy Pro works like StudyBuddy, but with SEVEN tools. New: instead of a long if/elif chain, we pick the function from a dictionary (a lookup table).`,
  },
  {
    line: 3,
    anim: 'import',
    text: `Same imports as before: OpenAI (line 2) to talk to the AI, and json to read its arguments.`,
  },
  {
    line: 4,
    set: { client: 'OpenAI()' },
    text: `client is our connection to OpenAI, just like last lesson.`,
  },
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
  {
    line: 12,
    anim: 'defineTools',
    set: { simple_interest: 'function(principal, rate, time)' },
    text: `simple_interest takes three inputs and returns (principal × rate × time) / 100. Our question will need this one.`,
  },
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
    anim: 'defineTools',
    text: `The simple_interest description even includes the formula. Clear descriptions help the AI choose correctly among many similar math tools.`,
  },
  {
    line: 31,
    anim: 'defineTools',
    text: `It needs three numbers: principal, rate and time. All three are required, so the AI must find each one in the question.`,
  },
  {
    line: 39,
    anim: 'addSystemMsg',
    set: { system_prompt: '"You are StudyBuddy Pro - a smart and friendly AI tutor..."' },
    text: `The system prompt lists what the tutor can do and asks it to always choose the correct function.`,
  },
  {
    line: 43,
    set: { user_query: '"Find the simple interest on 1000 at 5% for 2 years"' },
    text: `The question hides three numbers: 1000 (principal), 5% (rate) and 2 years (time).`,
  },
  {
    line: 45,
    set: { messages: `[system, ${SI_USER}]` },
    text: `messages holds the system prompt and the user's question, the same shape as before.`,
  },
  {
    line: 50,
    anim: 'agentLoop-send',
    text: `We send the messages and all 7 tool descriptions to the AI.`,
  },
  {
    line: 51,
    anim: 'apiProcessing',
    text: `The AI scans the 7 descriptions. "Simple interest" matches one exactly. It also maps 1000 → principal, 5 → rate, 2 → time.`,
  },
  {
    line: 53,
    anim: 'agentLoop-decide',
    set: { assistant_message: '<tool_calls=[simple_interest(principal=1000, rate=5, time=2)], content=None>' },
    text: `The AI replies with a tool request: call simple_interest with those three numbers. No text answer yet.`,
  },
  {
    line: 54,
    anim: 'toolSelect-simple_interest',
    set: { tool_call: '<id="call_1", function=simple_interest>' },
    text: `We take the first (and only) request from the tool_calls list.`,
  },
  {
    line: 55,
    anim: 'toolSelect-simple_interest',
    set: { tool_name: '"simple_interest"' },
    text: `tool_name is "simple_interest". Out of 7 tools, the AI picked the right one.`,
  },
  {
    line: 56,
    anim: 'toolSelect-simple_interest',
    set: { args: '{"principal": 1000, "rate": 5, "time": 2}' },
    text: `json.loads turns the AI's argument text into a Python dict with three keys: principal, rate and time.`,
  },
  {
    line: 59,
    anim: 'toolSelect-simple_interest',
    set: { available_functions: '{"add": add, "subtract": subtract, ... "lookup": lookup}' },
    text: `available_functions is a dictionary: names on the left, functions on the right. Think of a phone contact list: name → number.`,
  },
  {
    line: 60,
    anim: 'toolSelect-simple_interest',
    text: `Look closely: "add" in quotes is just text. add without quotes is the real function. The dict links the text the AI sends to our code.`,
  },
  {
    line: 64,
    anim: 'toolSelect-simple_interest',
    set: { function_to_call: 'simple_interest' },
    text: `available_functions["simple_interest"] gives back the simple_interest function itself. One lookup replaces seven if/elif checks.`,
  },
  {
    line: 65,
    anim: 'agentLoop-execute',
    text: `**args unpacks the dict: {"principal": 1000, "rate": 5, "time": 2} becomes principal=1000, rate=5, time=2.`,
  },
  {
    line: 65,
    anim: 'agentLoop-execute',
    set: { result: '100.0' },
    text: `So this runs simple_interest(principal=1000, rate=5, time=2) = (1000 × 5 × 2) / 100 = 100.0. Real Python did the math, not the AI.`,
  },
  {
    line: 66,
    anim: 'agentLoop-execute',
    out: 'Tool result: 100.0',
    text: `We print the result so we can check it: 100.0.`,
  },
  {
    line: 69,
    anim: 'agentLoop-execute',
    set: { messages: `[system, ${SI_USER}, assistant(tool_calls)]` },
    text: `We add the AI's tool request to the history first.`,
  },
  {
    line: 70,
    anim: 'agentLoop-return',
    set: { messages: `[system, ${SI_USER}, assistant(tool_calls), tool("100.0")]` },
    text: `Then the result, with role "tool" and the matching tool_call_id. str(result) turns 100.0 into text, because message content must be text.`,
  },
  {
    line: 76,
    anim: 'agentLoop-send2',
    text: `Second API call: the AI now sees the question, its own request, and the result 100.0.`,
  },
  {
    line: 79,
    anim: 'agentLoop-finalAnswer',
    set: { response_final: '<ChatCompletion>', final_answer: SI_FINAL },
    text: `The AI writes a friendly explanation using the real result. We store the text in final_answer.`,
  },
  {
    line: 80,
    anim: 'agentLoop-final',
    out: `StudyBuddy Pro: ${SI_FINAL.slice(1, -1)}`,
    text: `We print the tutor's answer.`,
  },
  {
    line: 80,
    anim: 'agentLoop-final',
    text: `What you learned: 1) Good descriptions let the AI pick from many tools. 2) A dict maps names to functions. 3) **args turns a dict into named inputs.`,
  },
]);

// ===========================================================================
// Lesson 10: terminalAssistantTrace — "What files are in this folder?" → ls
// ===========================================================================
const TA_Q = 'What files are in this folder?';
const TA_USER = `{role:"user", content:"${TA_Q}"}`;
const LS_OUT = '"main.py\\nnotes.txt\\nREADME.md\\n"';
const TA_ANSWER = 'This folder has 3 files: main.py, notes.txt and README.md.';

export const terminalAssistantTrace: TraceStep[] = build([
  {
    line: 1,
    text: `Our last agent works on your real computer: it runs commands, reads files and writes files. New: a chat loop that keeps going, and an agent loop that can use tools many times.`,
  },
  {
    line: 3,
    anim: 'import',
    text: `subprocess is new. It is Python's built-in way to run terminal commands, as if you typed them yourself. (Line 5 creates the usual OpenAI client.)`,
  },
  {
    line: 8,
    anim: 'defineTools',
    set: { run_command: 'function(command)' },
    text: `Tool 1: run_command takes a command like "ls" and returns what the terminal prints. We'll look inside when it actually runs.`,
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
    text: `The OUTER loop is the chat loop. It repeats: ask the user, answer, ask again, until the user types exit.`,
  },
  {
    line: 46,
    set: { user_input: `"${TA_Q}"` },
    out: `You: ${TA_Q}`,
    text: `input() pauses and waits for you to type. The user types: "What files are in this folder?"`,
  },
  {
    line: 47,
    text: `Is it "exit"? strip() removes extra spaces and lower() ignores capitals. It isn't, so we keep going (the empty-input check on line 50 also passes).`,
  },
  {
    line: 52,
    set: { messages: `[system, ${TA_USER}]` },
    text: `We add the user's question to messages.`,
  },
  {
    line: 55,
    text: `The INNER loop is the agent loop. It keeps calling the AI until the AI answers with plain text instead of a tool request.`,
  },
  {
    line: 56,
    anim: 'agentLoop-send',
    text: `We send the whole history plus the tools menu to the AI.`,
  },
  {
    line: 57,
    anim: 'apiProcessing',
    text: `The AI reads the question and the menu. Listing files is a terminal job, so it picks run_command and writes the command "ls".`,
  },
  {
    line: 59,
    anim: 'agentLoop-decide',
    set: { message: '<content=None, tool_calls=[run_command(command="ls")]>' },
    text: `The reply is a tool request, not text. Line 60 saves it into messages right away so the history stays complete.`,
  },
  {
    line: 62,
    anim: 'toolSelect-run_command',
    set: { messages: `[system, ${TA_USER}, assistant(tool_calls)]` },
    text: `Did the AI ask for tools? Yes, tool_calls has one request. So "not message.tool_calls" is False and we do NOT break yet.`,
  },
  {
    line: 66,
    anim: 'toolSelect-run_command',
    set: { tool_call: '<id="call_1", function=run_command>' },
    text: `The AI may ask for several tools in one reply, so we loop over message.tool_calls. This time there is just one.`,
  },
  {
    line: 67,
    anim: 'toolSelect-run_command',
    set: { function_name: '"run_command"' },
    text: `function_name is "run_command": the AI chose the terminal tool.`,
  },
  {
    line: 68,
    anim: 'toolSelect-run_command',
    set: { arguments: '{"command": "ls"}' },
    text: `json.loads turns the arguments into a dict: {"command": "ls"}. The AI translated "what files" into the shell command ls.`,
  },
  {
    line: 69,
    anim: 'toolSelect-run_command',
    out: '  [Using tool: run_command]',
    text: `We print which tool is being used, so the user can see what the assistant is doing.`,
  },
  {
    line: 71,
    anim: 'toolSelect-run_command',
    set: { function_to_call: 'run_command' },
    text: `We look up "run_command" in available_functions and get the real run_command function.`,
  },
  {
    line: 72,
    anim: 'agentLoop-execute',
    text: `function_to_call(**arguments) means run_command(command="ls"). Python now jumps into the run_command function.`,
  },
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
  {
    line: 72,
    anim: 'agentLoop-execute',
    set: { command: null, output: null, result: LS_OUT },
    text: `run_command returns the text, and we are back in the loop. result now holds the file list.`,
  },
  {
    line: 74,
    anim: 'agentLoop-return',
    set: { messages: `[system, ${TA_USER}, assistant(tool_calls), tool("main.py...")]` },
    text: `We append the result with role "tool" and the tool_call_id, so the AI knows which request it answers.`,
  },
  {
    line: 56,
    anim: 'agentLoop-send2',
    text: `The for loop is done, so the inner while loops back. We call the AI again; now messages includes the ls output.`,
  },
  {
    line: 63,
    anim: 'agentLoop-finalAnswer',
    set: {
      message: `<content="${TA_ANSWER}", tool_calls=None>`,
      'message.content': `"${TA_ANSWER}"`,
      messages: `[system, ${TA_USER}, assistant(tool_calls), tool("main.py..."), assistant("This folder has 3 files...")]`,
    },
    out: `Assistant: ${TA_ANSWER}`,
    text: `This reply is plain text with no tool_calls, so the if on line 62 is True. We print the AI's answer.`,
  },
  {
    line: 64,
    anim: 'agentLoop-final',
    text: `break leaves the INNER agent loop only. The outer chat loop keeps running and asks for the next question.`,
  },
  {
    line: 46,
    set: { user_input: '"exit"' },
    out: 'You: exit',
    text: `Back at the top of the chat loop, input() waits again. This time the user types exit.`,
  },
  {
    line: 48,
    out: 'Goodbye!',
    text: `The exit check on line 47 is True, so we print Goodbye. The break on the next line leaves the OUTER loop and the program ends.`,
  },
  {
    line: 45,
    text: `What you learned: 1) The chat loop asks questions; the agent loop runs tools until there's a text answer. 2) One reply can hold many tool calls. 3) Always confirm risky commands.`,
  },
]);
