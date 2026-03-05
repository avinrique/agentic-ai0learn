import { TraceStep, TraceVariant } from '@/stores/tracerStore';

// challengeTrace lives in part1.ts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _challengeTraceRemoved: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: 'Challenge time! Let\'s combine system prompts, user prompts, and JSON output into one app.',
  },
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing openai and json — we need json to pretty-print the response later.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: 'Calling the Restaurant Recommender Bot (Bangalore)...',
    animationTrigger: 'createClient',
    explanation: 'Client created. Let\'s build the restaurant recommender!',
  },
  {
    lineNumber: 8,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'system_prompt', value: '"You are a helpful restaurant recommender..."', isNew: true },
    ],
    output: '',
    animationTrigger: 'addSystemMsg',
    explanation: 'System prompt sets the AI\'s role as a restaurant recommender that MUST reply in JSON format.',
  },
  {
    lineNumber: 11,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'system_prompt', value: '"You are a helpful restaurant recommender..."' },
      { name: 'user_prompt', value: '"Find 3 great South Indian restaurants in Bangalore..."', isNew: true },
    ],
    output: '',
    animationTrigger: 'addUserMsg',
    explanation: 'User prompt is specific: cuisine type (South Indian), location (Bangalore), and exact JSON structure we want.',
  },
  {
    lineNumber: 22,
    variables: [
      { name: 'system_prompt', value: '"You are a helpful restaurant recommender..."' },
      { name: 'user_prompt', value: '"Find 3 great South Indian restaurants..."' },
      { name: 'response_format', value: '{ "type": "json_object" }', isNew: true },
    ],
    output: '',
    animationTrigger: 'selectModel',
    explanation: 'response_format forces JSON output. Combined with the system prompt saying "reply in valid JSON", this makes the output reliable and parseable.',
  },
  {
    lineNumber: 17,
    variables: [
      { name: 'system_prompt', value: '"You are a helpful restaurant recommender..."' },
      { name: 'user_prompt', value: '"Find 3 great South Indian restaurants..."' },
      { name: 'response_format', value: '{ "type": "json_object" }' },
    ],
    output: '',
    animationTrigger: 'apiCall',
    explanation: 'Sending system prompt + user prompt with JSON format enforced to OpenAI.',
  },
  {
    lineNumber: 17,
    variables: [
      { name: 'system_prompt', value: '"You are a helpful restaurant recommender..."' },
      { name: 'response', value: '<ChatCompletion>', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiCallComplete',
    explanation: 'Response received as valid JSON — guaranteed by response_format!',
  },
  {
    lineNumber: 26,
    variables: [
      { name: 'response', value: '<ChatCompletion>' },
      { name: 'raw_json', value: '{"recommendations":[{"name":"MTR","reason":"Iconic..."},...]}', isNew: true },
    ],
    output: '--- AI\'s Raw JSON Response ---\n{"recommendations":[{"name":"MTR","reason":"Iconic South Indian restaurant since 1924"},{"name":"Vidyarthi Bhavan","reason":"Famous for crispy dosas since 1943"},{"name":"Nagarjuna","reason":"Known for spicy Andhra-style meals"}]}',
    explanation: 'The raw JSON string — valid but hard to read. Let\'s pretty-print it.',
  },
  {
    lineNumber: 31,
    variables: [
      { name: 'raw_json', value: '{"recommendations":[...]}' },
      { name: 'parsed_json', value: '{recommendations: [...3 items]}', isNew: true },
    ],
    output: '',
    animationTrigger: 'jsonParse',
    explanation: 'json.loads() parses the JSON string into a Python dictionary. Now we can access data programmatically!',
  },
  {
    lineNumber: 33,
    variables: [
      { name: 'parsed_json', value: '{recommendations: [...3 items]}' },
      { name: 'pretty_json', value: '(formatted with indent=2)', isNew: true },
    ],
    output: '--- AI\'s Pretty JSON Response ---\n{\n  "recommendations": [\n    {"name": "MTR", "reason": "Iconic South Indian restaurant since 1924"},\n    {"name": "Vidyarthi Bhavan", "reason": "Famous for crispy dosas since 1943"},\n    {"name": "Nagarjuna", "reason": "Known for spicy Andhra-style meals"}\n  ]\n}',
    animationTrigger: 'printOutput',
    explanation: 'json.dumps(parsed_json, indent=2) formats it nicely! We combined: system prompt (role) + user prompt (task) + response_format (JSON) + json pretty-printing.',
  },
];

// Export 2: simpleAgentTrace — Calculator agent with add tool (18 steps)
export const simpleAgentTrace: TraceStep[] = [
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'json, openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing json (to parse tool arguments) and OpenAI (for the API).',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'json, openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    explanation: 'Creating the OpenAI client.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b', isNew: true },
    ],
    output: '',
    explanation: 'We define a REAL Python function called add(). The AI doesn\'t run code — but OUR program can. This is the "tool" the AI will ask us to execute.',
  },
  {
    lineNumber: 10,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b' },
      { name: 'tools', value: '[{name:"add", desc:"Add two numbers", params:{a,b}}]', isNew: true },
    ],
    output: '',
    animationTrigger: 'defineTools',
    explanation: 'The tools list is a MENU for the AI. Each tool has: name, description (how AI knows WHEN to use it), and parameter schema (what inputs it needs). The AI reads this menu to decide which tool fits.',
  },
  {
    lineNumber: 25,
    variables: [
      { name: 'tools', value: '[{name:"add"}]' },
      { name: 'messages', value: '[{role:"user", content:"What is 45 + 13?"}]', isNew: true },
    ],
    output: 'User: What is 45 + 13?',
    explanation: 'The user asks a math question. We store it in the messages list.',
  },
  {
    lineNumber: 29,
    variables: [
      { name: 'tools', value: '[{name:"add"}]' },
      { name: 'messages', value: '[{role:"user", content:"What is 45 + 13?"}]' },
    ],
    output: '--- 1. Sending to AI (with tools)... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'First API call: we send the user message AND the tools menu. tool_choice="auto" lets the AI decide whether to use a tool or answer directly.',
  },
  {
    lineNumber: 29,
    variables: [
      { name: 'messages', value: '[{role:"user", content:"What is 45 + 13?"}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI reads: "What is 45 + 13?" and sees the add tool on the menu. It thinks: "I need to add 45 and 13. I have an add tool. I should use it!"',
  },
  {
    lineNumber: 35,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[add(45,13)]>', isNew: true },
      { name: 'message.content', value: 'null (no text!)', isNew: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'The AI did NOT return text! Instead, message.tool_calls contains a request: "Please call add(a=45, b=13)". The AI DECIDED what to call, but it can\'t run code itself.',
  },
  {
    lineNumber: 40,
    variables: [
      { name: 'message.tool_calls', value: '[{function: add, args: {a:45, b:13}}]' },
      { name: 'function_name', value: '"add"', isNew: true },
    ],
    output: '--- 2. AI decided to call a function: add ---',
    animationTrigger: 'toolSelect-add',
    explanation: 'We check message.tool_calls — the AI chose "add" from our menu! It correctly identified this as an addition problem.',
  },
  {
    lineNumber: 46,
    variables: [
      { name: 'function_name', value: '"add"' },
      { name: 'arguments', value: '{"a": 45, "b": 13}', isNew: true },
    ],
    output: '',
    explanation: 'The AI provided arguments as a JSON string. json.loads() parses it into a Python dict: {a: 45, b: 13}. The AI extracted these numbers from the question!',
  },
  {
    lineNumber: 48,
    variables: [
      { name: 'function_name', value: '"add"' },
      { name: 'arguments', value: '{"a": 45, "b": 13}' },
      { name: 'result', value: '58', isNew: true },
    ],
    output: '[Debug: Running REAL Python code: add(a=45, b=13)]',
    animationTrigger: 'agentLoop-execute',
    explanation: 'NOW our real Python code runs: add(45, 13) → 58. The AI DECIDED what to call, our code EXECUTED it. This is the agent pattern!',
  },
  {
    lineNumber: 49,
    variables: [
      { name: 'function_name', value: '"add"' },
      { name: 'result', value: '58' },
    ],
    output: '--- 3. Ran function, result: 58 ---',
    explanation: 'The function returned 58. Now we need to tell the AI the result.',
  },
  {
    lineNumber: 52,
    variables: [
      { name: 'result', value: '58' },
      { name: 'messages', value: '[user, assistant(tool_call), tool(result=58)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'We add the tool result to the messages with role="tool" and the tool_call_id. This tells the AI: "Here\'s the answer to the function you asked for."',
  },
  {
    lineNumber: 58,
    variables: [
      { name: 'result', value: '58' },
      { name: 'messages', value: '[user, assistant(tool_call), tool(result=58)]' },
    ],
    output: '--- 4. Sending result back to AI... ---',
    animationTrigger: 'agentLoop-send2',
    explanation: 'Second API call: the AI now has the original question AND the tool result (58). It can now formulate a final human-friendly answer.',
  },
  {
    lineNumber: 59,
    variables: [
      { name: 'messages', value: '[user, assistant(tool_call), tool(result=58)]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI sees: question was "45 + 13", tool returned 58. It will now write a natural language answer.',
  },
  {
    lineNumber: 65,
    variables: [
      { name: 'final_answer', value: '45 + 13 is 58.', isNew: true },
    ],
    output: '--- 5. Final Answer from AI: ---\n45 + 13 is 58.',
    animationTrigger: 'agentLoop-finalAnswer',
    explanation: 'Complete agent loop! User → AI (decides tool) → Code (runs tool) → AI (final answer) → User. The AI provided REASONING, your code provided the CAPABILITY.',
  },
];

// Export 3: simpleAgentVariants
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
    steps: [
      { lineNumber: 2, variables: [{ name: 'module', value: 'json, openai', isNew: true }], output: '', animationTrigger: 'import', explanation: 'Importing json and OpenAI.' },
      { lineNumber: 3, variables: [{ name: 'module', value: 'json, openai' }, { name: 'client', value: 'OpenAI()', isNew: true }], output: '', explanation: 'Creating OpenAI client.' },
      { lineNumber: 5, variables: [{ name: 'client', value: 'OpenAI()' }, { name: 'add', value: 'function(a, b) → a + b', isNew: true }], output: '', explanation: 'Defining the add function.' },
      { lineNumber: 10, variables: [{ name: 'add', value: 'function(a, b)' }, { name: 'tools', value: '[{name:"add"}]', isNew: true }], output: '', animationTrigger: 'defineTools', explanation: 'The tools menu — same as before.' },
      { lineNumber: 25, variables: [{ name: 'tools', value: '[{name:"add"}]' }, { name: 'messages', value: '[{role:"user", content:"What is 100 + 200?"}]', isNew: true }], output: 'User: What is 100 + 200?', explanation: 'Different question this time — bigger numbers!' },
      { lineNumber: 29, variables: [{ name: 'messages', value: '[{role:"user", content:"What is 100 + 200?"}]' }], output: '--- 1. Sending to AI (with tools)... ---', animationTrigger: 'agentLoop-send', explanation: 'Sending to AI with the tools menu.' },
      { lineNumber: 29, variables: [{ name: 'messages', value: '[...]' }], output: '', animationTrigger: 'apiProcessing', explanation: 'AI reads "100 + 200" and matches it to the add tool.' },
      { lineNumber: 35, variables: [{ name: 'message', value: '<tool_calls=[add(100,200)]>', isNew: true }], output: '', animationTrigger: 'agentLoop-decide', explanation: 'AI requests: add(a=100, b=200).' },
      { lineNumber: 40, variables: [{ name: 'function_name', value: '"add"', isNew: true }], output: '--- 2. AI decided to call: add ---', animationTrigger: 'toolSelect-add', explanation: 'Tool selected: add.' },
      { lineNumber: 46, variables: [{ name: 'function_name', value: '"add"' }, { name: 'arguments', value: '{"a": 100, "b": 200}', isNew: true }], output: '', explanation: 'Arguments parsed from JSON.' },
      { lineNumber: 48, variables: [{ name: 'arguments', value: '{"a": 100, "b": 200}' }, { name: 'result', value: '300', isNew: true }], output: '[Debug: Running REAL Python code: add(a=100, b=200)]', animationTrigger: 'agentLoop-execute', explanation: 'add(100, 200) = 300!' },
      { lineNumber: 49, variables: [{ name: 'result', value: '300' }], output: '--- 3. Ran function, result: 300 ---', explanation: 'Result: 300.' },
      { lineNumber: 52, variables: [{ name: 'result', value: '300' }, { name: 'messages', value: '[user, assistant, tool(300)]', isChanged: true }], output: '', animationTrigger: 'agentLoop-return', explanation: 'Sending result back.' },
      { lineNumber: 58, variables: [{ name: 'messages', value: '[user, assistant, tool(300)]' }], output: '--- 4. Sending result back to AI... ---', animationTrigger: 'agentLoop-send2', explanation: 'Second API call with result.' },
      { lineNumber: 59, variables: [], output: '', animationTrigger: 'apiProcessing', explanation: 'AI formulates final answer.' },
      { lineNumber: 65, variables: [{ name: 'final_answer', value: '100 + 200 is 300.', isNew: true }], output: '--- 5. Final Answer: ---\n100 + 200 is 300.', animationTrigger: 'agentLoop-finalAnswer', explanation: 'Done! Same agent loop, different numbers.' },
    ],
  },
];

// Export 4: multiFunctionTrace — (50 * 2) - 15 needs multiply then subtract (20 steps)
export const multiFunctionTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [{ name: 'module', value: 'json, openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing json and OpenAI. We will need json to parse the arguments the AI sends back for each tool call.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'json, openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client. This is the same first step as always.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b', isNew: true },
      { name: 'subtract', value: 'function(a, b) → a - b', isNew: true },
      { name: 'multiply', value: 'function(a, b) → a * b', isNew: true },
      { name: 'divide', value: 'function(a, b) → a / b', isNew: true },
    ],
    output: '',
    explanation: 'We define FOUR real Python functions: add, subtract, multiply, divide. These are the actual tools the AI can request. The more tools you define, the more capable your agent becomes.',
  },
  {
    lineNumber: 20,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b' },
      { name: 'subtract', value: 'function(a, b) → a - b' },
      { name: 'multiply', value: 'function(a, b) → a * b' },
      { name: 'divide', value: 'function(a, b) → a / b' },
      { name: 'tools', value: '[add, subtract, multiply, divide]', isNew: true },
    ],
    output: '',
    animationTrigger: 'defineTools',
    explanation: 'The tools menu now has FOUR options. The AI will read this menu and pick the right tool(s) for the job. For "(50 * 2) - 15", it will need multiply first, then subtract.',
  },
  {
    lineNumber: 40,
    variables: [
      { name: 'tools', value: '[add, subtract, multiply, divide]' },
      { name: 'messages', value: '[{role:"system", content:"You are a calculator..."}, {role:"user", content:"What is (50 * 2) - 15?"}]', isNew: true },
    ],
    output: 'User: What is (50 * 2) - 15?',
    animationTrigger: 'addSystemMsg',
    explanation: 'We set up a system prompt telling the AI it is a calculator agent, and add the user question. This multi-step expression requires two operations in sequence.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'tools', value: '[add, subtract, multiply, divide]' },
      { name: 'messages', value: '[system, {role:"user", content:"What is (50 * 2) - 15?"}]' },
    ],
    output: '--- Loop 1: Sending to AI (with tools)... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'LOOP ITERATION 1: First API call with the user question and four tools. The AI must figure out the order of operations: multiply first (50 * 2), then subtract 15.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'messages', value: '[system, {role:"user", content:"What is (50 * 2) - 15?"}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI analyzes "(50 * 2) - 15" and follows order of operations. It recognizes it must multiply 50 by 2 first before it can do the subtraction.',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[multiply(50,2)]>', isNew: true },
      { name: 'message.content', value: 'null', isNew: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'The AI chose multiply(a=50, b=2) as the first step! It did NOT choose subtract yet — it knows it needs the result of the multiplication before it can subtract.',
  },
  {
    lineNumber: 55,
    variables: [
      { name: 'message.tool_calls', value: '[{function: multiply, args: {a:50, b:2}}]' },
      { name: 'function_name', value: '"multiply"', isNew: true },
    ],
    output: '--- AI decided to call: multiply ---',
    animationTrigger: 'toolSelect-multiply',
    explanation: 'Tool selected: multiply. The AI correctly identified this as the first operation needed to solve "(50 * 2) - 15".',
  },
  {
    lineNumber: 58,
    variables: [
      { name: 'function_name', value: '"multiply"' },
      { name: 'arguments', value: '{"a": 50, "b": 2}', isNew: true },
    ],
    output: '',
    explanation: 'Parsing the arguments the AI provided: a=50, b=2. The AI extracted these exact values from the expression "(50 * 2) - 15".',
  },
  {
    lineNumber: 60,
    variables: [
      { name: 'function_name', value: '"multiply"' },
      { name: 'arguments', value: '{"a": 50, "b": 2}' },
      { name: 'result', value: '100', isNew: true },
    ],
    output: '[Debug: Running REAL Python code: multiply(a=50, b=2)]\n--- Ran function, result: 100 ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'multiply(50, 2) = 100. Our Python code runs the actual calculation. Now we must send this intermediate result back to the AI so it can complete the second step.',
  },
  {
    lineNumber: 63,
    variables: [
      { name: 'result', value: '100' },
      { name: 'messages', value: '[system, user, assistant(multiply), tool(result=100)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'We append the tool result (100) to messages. The conversation now shows: user asked → AI requested multiply → we ran it → result is 100. The AI will continue from here.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'result', value: '100' },
      { name: 'messages', value: '[system, user, assistant(multiply), tool(result=100)]' },
    ],
    output: '--- Loop 2: Sending to AI again... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'LOOP ITERATION 2: We loop back and call the AI again with the updated message history. The AI now knows multiply(50,2)=100. It still needs to subtract 15.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'messages', value: '[system, user, assistant(multiply), tool(result=100)]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI reviews the conversation: "User asked (50 * 2) - 15. I called multiply and got 100. Now I need subtract(100, 15) to finish."',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[subtract(100,15)]>', isChanged: true },
      { name: 'message.content', value: 'null', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'The AI now requests subtract(a=100, b=15). It used the result of the previous multiplication (100) as the first argument. Multi-step reasoning in action!',
  },
  {
    lineNumber: 55,
    variables: [
      { name: 'message.tool_calls', value: '[{function: subtract, args: {a:100, b:15}}]' },
      { name: 'function_name', value: '"subtract"', isChanged: true },
    ],
    output: '--- AI decided to call: subtract ---',
    animationTrigger: 'toolSelect-subtract',
    explanation: 'Tool selected: subtract. The AI is now on the second step of the calculation, using 100 (the result from multiply) minus 15.',
  },
  {
    lineNumber: 60,
    variables: [
      { name: 'function_name', value: '"subtract"' },
      { name: 'arguments', value: '{"a": 100, "b": 15}', isChanged: true },
      { name: 'result', value: '85', isChanged: true },
    ],
    output: '[Debug: Running REAL Python code: subtract(a=100, b=15)]\n--- Ran function, result: 85 ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'subtract(100, 15) = 85. The second real Python calculation executes. We now have the final numeric answer.',
  },
  {
    lineNumber: 63,
    variables: [
      { name: 'result', value: '85' },
      { name: 'messages', value: '[system, user, asst(multiply), tool(100), asst(subtract), tool(result=85)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'We append the subtract result (85) to messages. The conversation now has the full chain: multiply gave 100, subtract gave 85. Time for the AI to write its final answer.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'result', value: '85' },
      { name: 'messages', value: '[system, user, asst(multiply), tool(100), asst(subtract), tool(85)]' },
    ],
    output: '--- Loop 3: Sending to AI for final answer... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'LOOP ITERATION 3: Final API call. This time the AI has all the results it needs and will NOT request another tool — it will write the final answer.',
  },
  {
    lineNumber: 70,
    variables: [
      { name: 'final_answer', value: '"(50 * 2) - 15 = 85"', isNew: true },
    ],
    output: '--- Final Answer from AI: ---\n(50 * 2) - 15 = 85. First, 50 multiplied by 2 equals 100, and then subtracting 15 gives us 85.',
    animationTrigger: 'agentLoop-finalAnswer',
    explanation: 'Two-loop agent complete! The AI orchestrated multiply → subtract across two iterations. This is how real agents handle complex multi-step problems — one tool at a time.',
  },
];

// Export 5: multiFunctionVariants
const multiFunction100Div5Plus3Steps: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [{ name: 'module', value: 'json, openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing json and OpenAI for a new multi-step problem: 100 / 5 + 3.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'json, openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b', isNew: true },
      { name: 'subtract', value: 'function(a, b) → a - b', isNew: true },
      { name: 'multiply', value: 'function(a, b) → a * b', isNew: true },
      { name: 'divide', value: 'function(a, b) → a / b', isNew: true },
    ],
    output: '',
    explanation: 'Defining four calculator functions. This time divide and add will be used.',
  },
  {
    lineNumber: 20,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b' },
      { name: 'subtract', value: 'function(a, b) → a - b' },
      { name: 'multiply', value: 'function(a, b) → a * b' },
      { name: 'divide', value: 'function(a, b) → a / b' },
      { name: 'tools', value: '[add, subtract, multiply, divide]', isNew: true },
    ],
    output: '',
    animationTrigger: 'defineTools',
    explanation: 'Same four-tool menu. The AI will pick divide first, then add, for "100 / 5 + 3".',
  },
  {
    lineNumber: 40,
    variables: [
      { name: 'tools', value: '[add, subtract, multiply, divide]' },
      { name: 'messages', value: '[{role:"system", content:"You are a calculator..."}, {role:"user", content:"What is 100 / 5 + 3?"}]', isNew: true },
    ],
    output: 'User: What is 100 / 5 + 3?',
    animationTrigger: 'addSystemMsg',
    explanation: 'User asks "What is 100 / 5 + 3?". Division before addition — the AI must follow order of operations.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'tools', value: '[add, subtract, multiply, divide]' },
      { name: 'messages', value: '[system, {role:"user", content:"What is 100 / 5 + 3?"}]' },
    ],
    output: '--- Loop 1: Sending to AI (with tools)... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'LOOP ITERATION 1: First call. AI receives the question and the tools menu.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'messages', value: '[system, {role:"user", content:"What is 100 / 5 + 3?"}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI analyzes "100 / 5 + 3". Division has higher precedence, so it picks divide(100, 5) first.',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[divide(100,5)]>', isNew: true },
      { name: 'message.content', value: 'null', isNew: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'AI requests divide(a=100, b=5). It correctly starts with division before addition.',
  },
  {
    lineNumber: 55,
    variables: [
      { name: 'message.tool_calls', value: '[{function: divide, args: {a:100, b:5}}]' },
      { name: 'function_name', value: '"divide"', isNew: true },
    ],
    output: '--- AI decided to call: divide ---',
    animationTrigger: 'toolSelect-divide',
    explanation: 'Tool selected: divide. The correct first step for this expression.',
  },
  {
    lineNumber: 60,
    variables: [
      { name: 'function_name', value: '"divide"' },
      { name: 'arguments', value: '{"a": 100, "b": 5}', isNew: true },
      { name: 'result', value: '20', isNew: true },
    ],
    output: '[Debug: Running REAL Python code: divide(a=100, b=5)]\n--- Ran function, result: 20 ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'divide(100, 5) = 20. Our Python code executes the real division.',
  },
  {
    lineNumber: 63,
    variables: [
      { name: 'result', value: '20' },
      { name: 'messages', value: '[system, user, assistant(divide), tool(result=20)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'Tool result (20) appended to messages. The AI will see: divide(100,5)=20. Now it needs add(20, 3).',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'result', value: '20' },
      { name: 'messages', value: '[system, user, assistant(divide), tool(result=20)]' },
    ],
    output: '--- Loop 2: Sending to AI again... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'LOOP ITERATION 2: Second call with updated history. AI knows divide returned 20 and must now add 3.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'messages', value: '[system, user, assistant(divide), tool(result=20)]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'AI reviews: "divide gave 20. Now I need add(20, 3) to complete 100 / 5 + 3."',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[add(20,3)]>', isChanged: true },
      { name: 'message.content', value: 'null', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'AI requests add(a=20, b=3). It used the divide result (20) as the first argument.',
  },
  {
    lineNumber: 55,
    variables: [
      { name: 'message.tool_calls', value: '[{function: add, args: {a:20, b:3}}]' },
      { name: 'function_name', value: '"add"', isChanged: true },
    ],
    output: '--- AI decided to call: add ---',
    animationTrigger: 'toolSelect-add',
    explanation: 'Tool selected: add. Second and final operation for this expression.',
  },
  {
    lineNumber: 60,
    variables: [
      { name: 'function_name', value: '"add"' },
      { name: 'arguments', value: '{"a": 20, "b": 3}', isChanged: true },
      { name: 'result', value: '23', isChanged: true },
    ],
    output: '[Debug: Running REAL Python code: add(a=20, b=3)]\n--- Ran function, result: 23 ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'add(20, 3) = 23. Final numeric result computed.',
  },
  {
    lineNumber: 63,
    variables: [
      { name: 'result', value: '23' },
      { name: 'messages', value: '[system, user, asst(divide), tool(20), asst(add), tool(result=23)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'Appending the add result (23) to messages. Full calculation chain is recorded.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'result', value: '23' },
      { name: 'messages', value: '[system, user, asst(divide), tool(20), asst(add), tool(23)]' },
    ],
    output: '--- Loop 3: Sending to AI for final answer... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'LOOP ITERATION 3: Final call. No more tools needed — the AI will write a natural language answer.',
  },
  {
    lineNumber: 70,
    variables: [
      { name: 'final_answer', value: '"100 / 5 + 3 = 23"', isNew: true },
    ],
    output: '--- Final Answer from AI: ---\n100 / 5 + 3 = 23. Dividing 100 by 5 gives 20, then adding 3 results in 23.',
    animationTrigger: 'agentLoop-finalAnswer',
    explanation: 'Two-loop agent complete with divide then add! Same pattern, different operations. Any complex expression can be broken into steps.',
  },
];

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
];

// Export 6: multiToolTrace — Study buddy with "What is LangChain?" query (14 steps)
export const multiToolTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [{ name: 'module', value: 'json, openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing json and OpenAI for the study buddy agent. This agent can both calculate AND look up information.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'json, openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client. The study buddy will combine factual lookup with conversational responses.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b', isNew: true },
      { name: 'lookup', value: 'function(topic) → knowledge_base[topic]', isNew: true },
    ],
    output: '',
    explanation: 'Two tools defined: add (for math) and lookup (for definitions). The lookup function searches a knowledge base for AI/ML topics. Having multiple tools makes the agent versatile.',
  },
  {
    lineNumber: 18,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'add', value: 'function(a, b) → a + b' },
      { name: 'lookup', value: 'function(topic) → knowledge_base[topic]' },
      { name: 'tools', value: '[{name:"add"}, {name:"lookup", desc:"Look up AI/ML terms"}]', isNew: true },
    ],
    output: '',
    animationTrigger: 'defineTools',
    explanation: 'Tools menu has two entries. The AI will pick "lookup" for definition questions and "add" for math questions. The descriptions guide the AI\'s choice.',
  },
  {
    lineNumber: 30,
    variables: [
      { name: 'tools', value: '[add, lookup]' },
      { name: 'system_prompt', value: '"You are a helpful study buddy for AI/ML students..."', isNew: true },
      { name: 'messages', value: '[system, {role:"user", content:"What is LangChain?"}]', isNew: true },
    ],
    output: 'User: What is LangChain?',
    animationTrigger: 'addSystemMsg',
    explanation: 'System prompt establishes the study buddy persona. The user asks "What is LangChain?" — a definition question that should trigger the lookup tool.',
  },
  {
    lineNumber: 35,
    variables: [
      { name: 'tools', value: '[add, lookup]' },
      { name: 'messages', value: '[system, {role:"user", content:"What is LangChain?"}]' },
    ],
    output: '--- Sending to AI (with tools)... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'First API call: sending "What is LangChain?" along with the tools menu. The AI must choose: is this a math question (add) or a lookup question (lookup)?',
  },
  {
    lineNumber: 35,
    variables: [
      { name: 'messages', value: '[system, {role:"user", content:"What is LangChain?"}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI reads the question. "What is LangChain?" is asking for a definition. The lookup tool\'s description matches perfectly — it will choose lookup.',
  },
  {
    lineNumber: 40,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[lookup("LangChain")]>', isNew: true },
      { name: 'message.content', value: 'null', isNew: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'The AI chose lookup("LangChain")! It matched "What is LangChain?" to the lookup tool. The AI extracted "LangChain" as the search term automatically.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'message.tool_calls', value: '[{function: lookup, args: {topic:"LangChain"}}]' },
      { name: 'function_name', value: '"lookup"', isNew: true },
    ],
    output: '--- AI decided to call: lookup ---',
    animationTrigger: 'toolSelect-lookup',
    explanation: 'Tool selected: lookup. Among all available tools, the AI correctly identified this as an information retrieval task, not a math task.',
  },
  {
    lineNumber: 48,
    variables: [
      { name: 'function_name', value: '"lookup"' },
      { name: 'arguments', value: '{"topic": "LangChain"}', isNew: true },
    ],
    output: '',
    explanation: 'Arguments parsed: topic = "LangChain". The AI extracted the exact term to look up from the user\'s question.',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'function_name', value: '"lookup"' },
      { name: 'arguments', value: '{"topic": "LangChain"}' },
      { name: 'result', value: '"LangChain: A framework for building LLM-powered apps with chains and agents."', isNew: true },
    ],
    output: '[Debug: Running lookup("LangChain")]\n--- Ran function, result: LangChain: A framework for building LLM-powered apps with chains and agents. ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'Our Python lookup function found a definition in the knowledge base. Real data retrieved — not generated by the AI, but looked up from our actual database.',
  },
  {
    lineNumber: 54,
    variables: [
      { name: 'result', value: '"LangChain: A framework for building LLM-powered apps..."' },
      { name: 'messages', value: '[system, user, assistant(lookup), tool(result=definition)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'The lookup result is added to messages as a tool response. Now the AI has the factual definition and can craft a helpful, contextual answer for the student.',
  },
  {
    lineNumber: 58,
    variables: [
      { name: 'result', value: '"LangChain: A framework for building LLM-powered apps..."' },
      { name: 'messages', value: '[system, user, assistant(lookup), tool(result=definition)]' },
    ],
    output: '--- Sending result back to AI... ---',
    animationTrigger: 'agentLoop-send2',
    explanation: 'Second API call: AI receives the factual definition from our knowledge base. It will now write a student-friendly explanation using this grounded information.',
  },
  {
    lineNumber: 65,
    variables: [
      { name: 'final_answer', value: '"LangChain is a framework that helps developers build applications powered by large language models..."', isNew: true },
    ],
    output: '--- Final Answer from AI: ---\nLangChain is a framework that helps developers build applications powered by large language models (LLMs). It provides building blocks called "chains" that you can combine to create AI apps, and supports building agents that can use tools — much like what we\'re doing right now!',
    animationTrigger: 'agentLoop-finalAnswer',
    explanation: 'Study buddy agent complete! The AI used the lookup result to give a grounded, accurate answer enriched with its own explanation. Factual accuracy from our data + conversational quality from the AI.',
  },
];

// Export 7: studyBuddyProTrace — simple interest calculation (14 steps)
export const studyBuddyProTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [{ name: 'module', value: 'json, openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing json and OpenAI for the Study Buddy Pro — an agent that can handle finance formulas.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'json, openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client for our financial study assistant.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'lookup', value: 'function(topic) → knowledge_base[topic]', isNew: true },
      { name: 'simple_interest', value: 'function(principal, rate, time) → principal * rate * time / 100', isNew: true },
    ],
    output: '',
    explanation: 'Two tools: lookup (for definitions) and simple_interest (the formula SI = P*R*T/100). By encoding the formula as a tool, the agent always computes it correctly — no hallucination.',
  },
  {
    lineNumber: 20,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'lookup', value: 'function(topic) → knowledge_base[topic]' },
      { name: 'simple_interest', value: 'function(principal, rate, time) → P*R*T/100' },
      { name: 'tools', value: '[{name:"lookup"}, {name:"simple_interest", params:{principal,rate,time}}]', isNew: true },
    ],
    output: '',
    animationTrigger: 'defineTools',
    explanation: 'Tools menu with lookup and simple_interest. The AI will use simple_interest when it detects a finance calculation question with principal, rate, and time values.',
  },
  {
    lineNumber: 32,
    variables: [
      { name: 'tools', value: '[lookup, simple_interest]' },
      { name: 'system_prompt', value: '"You are a Study Buddy Pro that helps with finance and math..."', isNew: true },
      { name: 'messages', value: '[system, {role:"user", content:"Find the simple interest on 1000 at 5% for 2 years"}]', isNew: true },
    ],
    output: 'User: Find the simple interest on 1000 at 5% for 2 years',
    animationTrigger: 'addSystemMsg',
    explanation: 'User asks a classic finance problem: SI on principal=1000, rate=5%, time=2 years. The AI must extract these three values and call simple_interest.',
  },
  {
    lineNumber: 37,
    variables: [
      { name: 'tools', value: '[lookup, simple_interest]' },
      { name: 'messages', value: '[system, {role:"user", content:"Find the simple interest on 1000 at 5% for 2 years"}]' },
    ],
    output: '--- Sending to AI (with tools)... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'First API call: the AI receives the finance question and the two tools. It must identify this as a calculation task and pick simple_interest.',
  },
  {
    lineNumber: 37,
    variables: [
      { name: 'messages', value: '[system, {role:"user", content:"Find the simple interest on 1000 at 5% for 2 years"}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI processes the question. It sees numbers (1000, 5%, 2 years) and the phrase "simple interest". It matches this to the simple_interest tool immediately.',
  },
  {
    lineNumber: 42,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[simple_interest(1000, 5, 2)]>', isNew: true },
      { name: 'message.content', value: 'null', isNew: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'The AI chose simple_interest(principal=1000, rate=5, time=2)! It correctly extracted all three parameters from the natural language question. No math done yet.',
  },
  {
    lineNumber: 47,
    variables: [
      { name: 'message.tool_calls', value: '[{function: simple_interest, args: {principal:1000, rate:5, time:2}}]' },
      { name: 'function_name', value: '"simple_interest"', isNew: true },
    ],
    output: '--- AI decided to call: simple_interest ---',
    animationTrigger: 'toolSelect-simple_interest',
    explanation: 'Tool selected: simple_interest. The AI correctly identified this finance calculation and extracted all three required parameters from the user\'s text.',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'function_name', value: '"simple_interest"' },
      { name: 'arguments', value: '{"principal": 1000, "rate": 5, "time": 2}', isNew: true },
    ],
    output: '',
    explanation: 'Arguments parsed: principal=1000, rate=5, time=2. The AI extracted these values from "1000 at 5% for 2 years" — impressive natural language understanding.',
  },
  {
    lineNumber: 52,
    variables: [
      { name: 'function_name', value: '"simple_interest"' },
      { name: 'arguments', value: '{"principal": 1000, "rate": 5, "time": 2}' },
      { name: 'result', value: '100', isNew: true },
    ],
    output: '[Debug: Running REAL Python code: simple_interest(principal=1000, rate=5, time=2)]\n--- Ran function, result: 100 ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'Our Python function computes: 1000 * 5 * 2 / 100 = 100. Real calculation, guaranteed correct. The AI could not hallucinate this answer — it comes from actual code.',
  },
  {
    lineNumber: 55,
    variables: [
      { name: 'result', value: '100' },
      { name: 'messages', value: '[system, user, assistant(simple_interest), tool(result=100)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'Tool result (100) appended to conversation. The AI now has the confirmed calculation result and can explain the formula and answer to the student.',
  },
  {
    lineNumber: 60,
    variables: [
      { name: 'result', value: '100' },
      { name: 'messages', value: '[system, user, assistant(simple_interest), tool(result=100)]' },
    ],
    output: '--- Sending result back to AI... ---',
    animationTrigger: 'agentLoop-send2',
    explanation: 'Second API call: AI receives the verified SI result (100). It will now write an educational response explaining the formula and the answer.',
  },
  {
    lineNumber: 68,
    variables: [
      { name: 'final_answer', value: '"Simple Interest = ₹100"', isNew: true },
    ],
    output: '--- Final Answer from AI: ---\nThe simple interest on ₹1000 at 5% per annum for 2 years is ₹100.\n\nFormula: SI = (P × R × T) / 100 = (1000 × 5 × 2) / 100 = 100',
    animationTrigger: 'agentLoop-finalAnswer',
    explanation: 'Study Buddy Pro delivers: the correct answer (100) from real code, plus the formula explanation from the AI. Students get both the answer AND the understanding!',
  },
];

// Export 8: terminalAssistantTrace — "What files are in the current directory?" (14 steps)
export const terminalAssistantTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [{ name: 'module', value: 'json, openai, subprocess', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing json, OpenAI, and subprocess. The subprocess module lets our Python code actually run shell commands — this is what makes the terminal assistant powerful (and dangerous if misused).',
  },
  {
    lineNumber: 4,
    variables: [
      { name: 'module', value: 'json, openai, subprocess' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client. The terminal assistant will translate natural language into shell commands.',
  },
  {
    lineNumber: 6,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'run_command', value: 'function(command) → subprocess.run(command)', isNew: true },
      { name: 'read_file', value: 'function(path) → open(path).read()', isNew: true },
      { name: 'write_file', value: 'function(path, content) → open(path).write()', isNew: true },
    ],
    output: '',
    explanation: 'Three file system tools defined: run_command (execute any shell command), read_file (read file contents), write_file (create/edit files). These give the AI real control over the filesystem.',
  },
  {
    lineNumber: 22,
    variables: [
      { name: 'client', value: 'OpenAI()' },
      { name: 'run_command', value: 'function(command) → subprocess.run(command)' },
      { name: 'read_file', value: 'function(path) → open(path).read()' },
      { name: 'write_file', value: 'function(path, content) → open(path).write()' },
      { name: 'tools', value: '[run_command, read_file, write_file]', isNew: true },
    ],
    output: '',
    animationTrigger: 'defineTools',
    explanation: 'Three-tool menu. The AI will pick run_command for "list files", read_file for "show me what\'s in X", and write_file for "create a file". Natural language → right tool.',
  },
  {
    lineNumber: 35,
    variables: [
      { name: 'tools', value: '[run_command, read_file, write_file]' },
      { name: 'system_prompt', value: '"You are a helpful terminal assistant. Translate natural language into shell commands..."', isNew: true },
      { name: 'messages', value: '[system, {role:"user", content:"What files are in the current directory?"}]', isNew: true },
    ],
    output: 'User: What files are in the current directory?',
    animationTrigger: 'addSystemMsg',
    explanation: 'System prompt instructs the AI to act as a terminal assistant. The user asks in plain English — no need to know shell commands. The AI will translate this into "ls".',
  },
  {
    lineNumber: 40,
    variables: [
      { name: 'tools', value: '[run_command, read_file, write_file]' },
      { name: 'messages', value: '[system, {role:"user", content:"What files are in the current directory?"}]' },
    ],
    output: '--- Sending to AI (with tools)... ---',
    animationTrigger: 'agentLoop-send',
    explanation: 'First API call: the AI receives the natural language question and the three file system tools. It must decide which tool lists directory contents.',
  },
  {
    lineNumber: 40,
    variables: [
      { name: 'messages', value: '[system, {role:"user", content:"What files are in the current directory?"}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'The AI maps "What files are in the current directory?" to the shell command "ls". It picks run_command as the tool since listing files requires executing a command.',
  },
  {
    lineNumber: 45,
    variables: [
      { name: 'message', value: '<AssistantMessage: tool_calls=[run_command("ls")]>', isNew: true },
      { name: 'message.content', value: 'null', isNew: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-decide',
    explanation: 'The AI chose run_command with argument "ls"! It translated "What files are in the current directory?" into the exact Unix shell command. This is natural language to code translation.',
  },
  {
    lineNumber: 50,
    variables: [
      { name: 'message.tool_calls', value: '[{function: run_command, args: {command:"ls"}}]' },
      { name: 'function_name', value: '"run_command"', isNew: true },
    ],
    output: '--- AI decided to call: run_command ---',
    animationTrigger: 'toolSelect-run_command',
    explanation: 'Tool selected: run_command. The AI correctly matched the task (listing directory contents) to the tool that can execute shell commands.',
  },
  {
    lineNumber: 53,
    variables: [
      { name: 'function_name', value: '"run_command"' },
      { name: 'arguments', value: '{"command": "ls"}', isNew: true },
    ],
    output: '',
    explanation: 'Arguments parsed: command = "ls". The AI translated natural language into the correct Unix command. The function will now execute this using Python\'s subprocess module.',
  },
  {
    lineNumber: 55,
    variables: [
      { name: 'function_name', value: '"run_command"' },
      { name: 'arguments', value: '{"command": "ls"}' },
      { name: 'result', value: '"main.py\\nrequirements.txt\\nREADME.md\\ndata/\\noutputs/"', isNew: true },
    ],
    output: '[Debug: Running REAL shell command: ls]\n--- Command output: main.py requirements.txt README.md data/ outputs/ ---',
    animationTrigger: 'agentLoop-execute',
    explanation: 'subprocess.run("ls") actually ran on the real filesystem and returned the directory listing. This is REAL execution — the agent has genuine system access.',
  },
  {
    lineNumber: 58,
    variables: [
      { name: 'result', value: '"main.py\\nrequirements.txt\\nREADME.md\\ndata/\\noutputs/"' },
      { name: 'messages', value: '[system, user, assistant(run_command), tool(result=file_listing)]', isChanged: true },
    ],
    output: '',
    animationTrigger: 'agentLoop-return',
    explanation: 'The actual file listing is appended to messages. The AI will now interpret these results and present them in a human-friendly format with context.',
  },
  {
    lineNumber: 62,
    variables: [
      { name: 'result', value: '"main.py\\nrequirements.txt\\nREADME.md\\ndata/\\noutputs/"' },
      { name: 'messages', value: '[system, user, assistant(run_command), tool(result=file_listing)]' },
    ],
    output: '--- Sending result back to AI... ---',
    animationTrigger: 'agentLoop-send2',
    explanation: 'Second API call: the AI receives the real directory listing. It will now format and explain the results in plain English for the user.',
  },
  {
    lineNumber: 70,
    variables: [
      { name: 'final_answer', value: '"The directory contains 5 items..."', isNew: true },
    ],
    output: '--- Final Answer from AI: ---\nThe current directory contains 5 items:\n- main.py — your main Python script\n- requirements.txt — project dependencies\n- README.md — project documentation\n- data/ — a folder (likely contains input data)\n- outputs/ — a folder (likely contains results)\n\nWould you like me to read any of these files?',
    animationTrigger: 'agentLoop-finalAnswer',
    explanation: 'Terminal assistant complete! Plain English question → AI picks "ls" → real shell execution → AI explains results in plain English. No terminal knowledge required from the user.',
  },
];
