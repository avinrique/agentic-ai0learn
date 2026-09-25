import { TraceStep } from '@/stores/tracerStore';

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
