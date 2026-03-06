import { TraceStep, TraceVariant } from '@/stores/tracerStore';

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 1 – basicApiTrace (13 steps)
// ─────────────────────────────────────────────────────────────────────────────
export const basicApiTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: 'This is just a comment. Python ignores lines starting with #.',
  },
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: "Importing the OpenAI class from the openai package — the official Python SDK for talking to OpenAI's API.",
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: "Creates an OpenAI client. It automatically reads your OPENAI_API_KEY from environment variables — that's your secret key that authenticates you with OpenAI.",
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
    ],
    output: 'Sending a basic prompt to the AI...',
    explanation: 'A simple print statement so we can see the program is running.',
  },
  {
    lineNumber: 8,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"', isNew: true },
    ],
    output: '',
    animationTrigger: 'selectModel',
    explanation: 'We choose "gpt-4o-mini" — OpenAI\'s fast, cheap model. Other options: "gpt-4o" (smarter, slower) or "gpt-4-turbo". The model parameter tells OpenAI WHICH AI brain to use.',
  },
  {
    lineNumber: 10,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"' },
      { name: 'messages', value: '[{role: "user", content: "Write a funny..."}]', isNew: true },
    ],
    output: '',
    animationTrigger: 'buildMessages',
    explanation: 'The messages parameter is a LIST of message objects. Each has a "role" (who said it) and "content" (what they said). Here we send one user message — our prompt.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"' },
      { name: 'messages', value: '[{role: "user", content: "Write a funny..."}]' },
    ],
    output: '',
    animationTrigger: 'apiCall',
    explanation: 'Python sends an HTTPS POST request to https://api.openai.com/v1/chat/completions with your API key in the header. The request body contains the model name and messages array as JSON.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"' },
      { name: 'messages', value: '[{role: "user", content: "Write a funny..."}]' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: "The request is at OpenAI's servers. gpt-4o-mini reads your messages, generates a response token by token, then sends back a JSON response.",
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"' },
      { name: 'messages', value: '[{role: "user", content: "Write a funny..."}]' },
      { name: 'response', value: '<ChatCompletion object>', isNew: true },
      { name: 'tokens_used', value: '~50 tokens', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiCallComplete',
    explanation: 'The API responded! The response object contains choices (possible responses), usage info (tokens used), and metadata.',
  },
  {
    lineNumber: 14,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"' },
      { name: 'response', value: '<ChatCompletion object>' },
    ],
    output: "\nAI's Response:",
    explanation: 'Printing a header before the actual AI response.',
  },
  {
    lineNumber: 15,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'model', value: '"gpt-4o-mini"' },
      { name: 'response', value: '<ChatCompletion object>' },
      {
        name: 'content',
        value:
          "Oh AI, you slice through data with ease,\nLike mozzarella on a pizza breeze,\nBut you'll never taste the cheesy goodness, please!",
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'extractContent',
    explanation: 'response.choices[0] gets the first choice. .message gets the message object. .content extracts the text string — the AI\'s actual reply!',
  },
  {
    lineNumber: 15,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'content',
        value:
          "Oh AI, you slice through data with ease,\nLike mozzarella on a pizza breeze,\nBut you'll never taste the cheesy goodness, please!",
      },
    ],
    output:
      "Oh AI, you slice through data with ease,\nLike mozzarella on a pizza breeze,\nBut you'll never taste the cheesy goodness, please!",
    animationTrigger: 'printOutput',
    explanation: 'The poem is printed! The entire round trip (your code → OpenAI → response) took about 1-2 seconds.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 2 – systemPromptsTrace (13 steps)
// ─────────────────────────────────────────────────────────────────────────────
export const systemPromptsTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: "Comment line — let's learn about system prompts!",
  },
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing the OpenAI library, same as before.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the client — same pattern as Lesson 1.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()' },
    ],
    output: "Using a system prompt to set the AI's role...",
    explanation: 'Status print.',
  },
  {
    lineNumber: 10,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()' },
      {
        name: 'messages_display',
        value: '[{"role":"system","content":"You are a friendly Python tutor."}]',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'addSystemMsg',
    explanation: 'NEW CONCEPT: The "system" role! This special message sets the AI\'s personality and rules for the ENTIRE conversation. The AI follows these instructions but won\'t show them to the user.',
  },
  {
    lineNumber: 11,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a friendly Python tutor."},{"role":"user","content":"Explain what a list comprehension is with an example."}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'addUserMsg',
    explanation: 'The "user" role is YOU — the human asking a question. The AI sees BOTH the system prompt AND this user message, so it answers AS a Python tutor.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a friendly Python tutor."},{"role":"user","content":"Explain what a list comprehension is with an example."}]',
      },
    ],
    output: '',
    animationTrigger: 'apiCall',
    explanation: 'Sending 2 messages to OpenAI: the system prompt sets the role, the user message asks the question.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a friendly Python tutor."},{"role":"user","content":"Explain what a list comprehension is with an example."}]',
      },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'gpt-4o-mini reads the system prompt first, then the user question. Because we said "friendly Python tutor", it will explain things simply with examples.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI()' },
      { name: 'response', value: '<ChatCompletion>', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiCallComplete',
    explanation: 'Response received! Because of the system prompt, the answer is educational, friendly, and includes a code example.',
  },
  {
    lineNumber: 15,
    variables: [
      { name: 'response', value: '<ChatCompletion>' },
    ],
    output: "\nPython Tutor's Response:",
    explanation: 'Printing a header.',
  },
  {
    lineNumber: 16,
    variables: [
      { name: 'response', value: '<ChatCompletion>' },
      {
        name: 'content',
        value:
          'A list comprehension is a concise way to create lists!\n\nExample: squares = [x**2 for x in range(10)]\nThis creates [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'extractContent',
    explanation: 'Same extraction: response.choices[0].message.content. The system prompt shaped HOW the AI answered.',
  },
  {
    lineNumber: 16,
    variables: [
      {
        name: 'content',
        value:
          'A list comprehension is a concise way to create lists!\n\nExample: squares = [x**2 for x in range(10)]\nThis creates [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]',
      },
    ],
    output:
      'A list comprehension is a concise way to create lists!\n\nExample: squares = [x**2 for x in range(10)]\nThis creates [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]',
    animationTrigger: 'printOutput',
    explanation: "Notice: friendly tone, code example, simple explanation — exactly what a Python tutor would do! That's the power of system prompts.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 3 – conversationLoopTrace (16 steps)
// ─────────────────────────────────────────────────────────────────────────────
export const conversationLoopTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: "Comment line — we're building a multi-turn chatbot that remembers context.",
  },
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing the OpenAI library — same as before.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[{"role":"system","content":"You are a helpful assistant."}]',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'initMessages',
    explanation: 'KEY LINE: We create a messages list with just the system prompt. This list will GROW as the conversation continues — it IS the memory.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[{"role":"system","content":"You are a helpful assistant."}]',
      },
    ],
    output: 'Chat started! Type \'quit\' to exit.\n',
    explanation: 'Status print to the user.',
  },
  {
    lineNumber: 9,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[{"role":"system","content":"You are a helpful assistant."}]',
      },
    ],
    output: '',
    animationTrigger: 'loopStart',
    explanation: 'The while True loop starts. This is the CONVERSATION LOOP — it runs forever until the user types "quit".',
  },
  {
    lineNumber: 10,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[{"role":"system","content":"You are a helpful assistant."}]',
      },
      { name: 'user_input', value: '"What is Python?"', isNew: true },
    ],
    output: '',
    animationTrigger: 'userInput1',
    explanation: 'input() pauses and waits for the user to type. They type "What is Python?" and press Enter.',
  },
  {
    lineNumber: 14,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'user_input', value: '"What is Python?"' },
      {
        name: 'messages',
        value: '[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"What is Python?"}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'appendUser1',
    explanation: 'We APPEND the user message to our messages list. The list now has 2 items: system prompt + this user message.',
  },
  {
    lineNumber: 16,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[{"role":"system",...},{"role":"user","content":"What is Python?"}]',
      },
    ],
    output: '',
    animationTrigger: 'apiCall1',
    explanation: 'API call #1: We send the ENTIRE messages list (2 messages) to OpenAI. The model sees the system prompt and the user question.',
  },
  {
    lineNumber: 16,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[{"role":"system",...},{"role":"user","content":"What is Python?"}]',
      },
      { name: 'response', value: '<ChatCompletion>', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiResponse1',
    explanation: 'Response received! The model generated an answer about Python.',
  },
  {
    lineNumber: 21,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'assistant_msg', value: '"Python is a high-level programming language..."', isNew: true },
      {
        name: 'messages',
        value: '[{"role":"system",...},{"role":"user","content":"What is Python?"},{"role":"assistant","content":"Python is a high-level programming language..."}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'appendAssistant1',
    explanation: 'We extract the response AND APPEND IT to messages. Now the list has 3 items. This is the KEY trick — we save the AI\'s response so it can "remember" it next turn.',
  },
  {
    lineNumber: 23,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'assistant_msg', value: '"Python is a high-level programming language..."' },
      {
        name: 'messages',
        value: '[sys, user1, asst1] — 3 messages, ~127 tokens',
      },
    ],
    output: 'AI: Python is a high-level programming language...\n',
    animationTrigger: 'printResponse1',
    explanation: 'Print the response. Turn 1 complete! Now the loop goes back to the top.',
  },
  {
    lineNumber: 10,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'user_input', value: '"How is it different from Java?"', isChanged: true },
      {
        name: 'messages',
        value: '[sys, user1, asst1] — 3 messages',
      },
    ],
    output: '',
    animationTrigger: 'userInput2',
    explanation: 'Turn 2: The user types "How is it different from Java?" — notice they don\'t mention Python. Will the AI know what they mean?',
  },
  {
    lineNumber: 14,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'user_input', value: '"How is it different from Java?"' },
      {
        name: 'messages',
        value: '[sys, user1, asst1, {"role":"user","content":"How is it different from Java?"}] — 4 messages',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'appendUser2',
    explanation: 'Append user message #2. The messages list now has 4 items. When we send this, the model sees the ENTIRE conversation history.',
  },
  {
    lineNumber: 16,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages',
        value: '[sys, user1, asst1, user2] — 4 messages, ~384 tokens',
      },
      { name: 'tokens_used', value: '~384 (growing!)', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiCall2',
    explanation: 'API call #2: We send ALL 4 messages. The model sees the prior Q&A about Python, so it understands "it" means Python and "different from Java" is a comparison request.',
  },
  {
    lineNumber: 21,
    variables: [
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'assistant_msg', value: '"Python uses dynamic typing while Java uses static typing..."', isChanged: true },
      {
        name: 'messages',
        value: '[sys, user1, asst1, user2, asst2] — 5 messages, ~500 tokens',
        isChanged: true,
      },
    ],
    output: 'AI: Python uses dynamic typing while Java uses static typing...\n',
    animationTrigger: 'appendAssistant2',
    explanation: 'It worked! The AI compared Python to Java because it SAW the entire conversation. We append this response too — the list keeps growing. This is how "memory" works: replay everything, every time.',
  },
];

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
    steps: conversationLoopTrace.map((step) => {
      // Override only the turn-2 steps to show a context break
      if (step.animationTrigger === 'userInput2') {
        return {
          ...step,
          variables: step.variables.map(v =>
            v.name === 'user_input' ? { ...v, value: '"Tell me about dogs"', isChanged: true } : v
          ),
          explanation: 'Turn 2: The user types "Tell me about dogs" — a topic change! The AI still has the Python history in context.',
        };
      }
      if (step.animationTrigger === 'appendUser2') {
        return {
          ...step,
          variables: step.variables.map(v =>
            v.name === 'messages'
              ? { ...v, value: '[sys, user1, asst1, {"role":"user","content":"Tell me about dogs"}] — 4 messages', isChanged: true }
              : v
          ),
          explanation: 'Append "Tell me about dogs". The messages list now has 4 items including the full Python conversation.',
        };
      }
      if (step.animationTrigger === 'apiCall2') {
        return {
          ...step,
          explanation: 'API call #2: All 4 messages sent. The AI sees the Python discussion AND the new topic request. It has full context to handle the topic switch.',
        };
      }
      if (step.animationTrigger === 'appendAssistant2') {
        return {
          ...step,
          variables: step.variables.map(v => {
            if (v.name === 'assistant_msg') return { ...v, value: '"Dogs are wonderful companions known for their loyalty..."', isChanged: true };
            if (v.name === 'messages') return { ...v, value: '[sys, user1, asst1, user2, asst2] — 5 messages, ~500 tokens', isChanged: true };
            return v;
          }),
          output: 'AI: Dogs are wonderful companions known for their loyalty...\n',
          explanation: 'The AI answers about dogs — it handled the topic switch while still having the Python context in memory. The messages array grows regardless of topic!',
        };
      }
      return step;
    }),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 4 – jsonOutputTrace (14 steps)
// ─────────────────────────────────────────────────────────────────────────────
export const jsonOutputTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: "Comment line — we're learning how to get structured JSON output from the AI.",
  },
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing the OpenAI library as usual.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client — reads your API key from the environment.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
    ],
    output: 'Requesting structured JSON output...',
    explanation: 'Status print so we know the script is running.',
  },
  {
    lineNumber: 7,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'system_prompt',
        value: '"You are a helpful assistant that only responds in valid JSON."',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'addSystemMsg',
    explanation: 'KEY TRICK: We tell the AI in the system prompt that it MUST respond in valid JSON. This primes the model before we even use response_format.',
  },
  {
    lineNumber: 9,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'system_prompt',
        value: '"You are a helpful assistant that only responds in valid JSON."',
      },
      {
        name: 'user_prompt',
        value: '"Give me 3 Python interview questions with difficulty levels and topics as JSON."',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'addUserMsg',
    explanation: 'The user prompt asks for data in a structured way. Mentioning JSON in the prompt reinforces the JSON-only instruction from the system prompt.',
  },
  {
    lineNumber: 17,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'system_prompt',
        value: '"You are a helpful assistant that only responds in valid JSON."',
      },
      {
        name: 'user_prompt',
        value: '"Give me 3 Python interview questions with difficulty levels and topics as JSON."',
      },
      { name: 'response_format', value: '{"type": "json_object"}', isNew: true },
    ],
    output: '',
    animationTrigger: 'buildMessages',
    explanation: 'IMPORTANT: response_format={"type":"json_object"} activates OpenAI\'s JSON mode. This GUARANTEES the model returns valid, parseable JSON — no extra text, no markdown fences, just pure JSON.',
  },
  {
    lineNumber: 13,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response_format', value: '{"type": "json_object"}' },
    ],
    output: '',
    animationTrigger: 'apiCall',
    explanation: 'Sending the request to OpenAI with JSON mode enabled. The API enforces valid JSON on its end before returning the response.',
  },
  {
    lineNumber: 13,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response_format', value: '{"type": "json_object"}' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: "gpt-4o-mini generates its response constrained to valid JSON. OpenAI's servers validate the JSON before sending it back — you're guaranteed a parseable response.",
  },
  {
    lineNumber: 13,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response_format', value: '{"type": "json_object"}' },
      { name: 'response', value: '<ChatCompletion object>', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiCallComplete',
    explanation: 'Response received! Because JSON mode was on, the content is guaranteed to be a valid JSON string.',
  },
  {
    lineNumber: 21,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response', value: '<ChatCompletion object>' },
      {
        name: 'raw_json',
        value:
          '{"questions":[{"id":1,"question":"What is a list comprehension?","difficulty":"easy","topic":"syntax"},{"id":2,"question":"Explain the GIL.","difficulty":"hard","topic":"concurrency"},{"id":3,"question":"What are decorators?","difficulty":"medium","topic":"functions"}]}',
        isNew: true,
      },
    ],
    output:
      'Raw JSON string:\n{"questions":[{"id":1,"question":"What is a list comprehension?","difficulty":"easy","topic":"syntax"},{"id":2,"question":"Explain the GIL.","difficulty":"hard","topic":"concurrency"},{"id":3,"question":"What are decorators?","difficulty":"medium","topic":"functions"}]}',
    animationTrigger: 'extractContent',
    explanation: 'We extract the content string — it looks like raw JSON text right now. Next we parse it into a real Python dictionary with json.loads().',
  },
  {
    lineNumber: 24,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'raw_json',
        value:
          '{"questions":[{"id":1,"question":"What is a list comprehension?","difficulty":"easy","topic":"syntax"},{"id":2,"question":"Explain the GIL.","difficulty":"hard","topic":"concurrency"},{"id":3,"question":"What are decorators?","difficulty":"medium","topic":"functions"}]}',
      },
      {
        name: 'parsed',
        value: "{'questions': [{'id': 1, 'question': 'What is a list comprehension?', ...}]}",
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'jsonParse',
    explanation: 'json.loads() converts the JSON string into a real Python dict. Now we can access parsed["questions"][0]["difficulty"] like any Python object — no string manipulation needed!',
  },
  {
    lineNumber: 26,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'parsed',
        value: "{'questions': [{'id': 1, 'question': 'What is a list comprehension?', ...}]}",
      },
    ],
    output:
      'Parsed and pretty-printed:\n{\n  "questions": [\n    {\n      "id": 1,\n      "question": "What is a list comprehension?",\n      "difficulty": "easy",\n      "topic": "syntax"\n    },\n    {\n      "id": 2,\n      "question": "Explain the GIL.",\n      "difficulty": "hard",\n      "topic": "concurrency"\n    },\n    {\n      "id": 3,\n      "question": "What are decorators?",\n      "difficulty": "medium",\n      "topic": "functions"\n    }\n  ]\n}',
    animationTrigger: 'printOutput',
    explanation: 'json.dumps(parsed, indent=2) re-serialises the Python dict as a nicely indented JSON string. The AI returned structured data we can work with programmatically!',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 4 – fewShotTrace (16 steps)
// ─────────────────────────────────────────────────────────────────────────────
export const fewShotTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: "Comment line — we're learning few-shot prompting, where we teach the AI by example.",
  },
  {
    lineNumber: 2,
    variables: [{ name: 'module', value: 'openai', isNew: true }],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing the OpenAI library.',
  },
  {
    lineNumber: 3,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client.',
  },
  {
    lineNumber: 5,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
    ],
    output: 'Teaching the AI to classify sentiment with examples...',
    explanation: 'Status print — we are about to build a multi-message few-shot prompt.',
  },
  {
    lineNumber: 9,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."}]',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'addSystemMsg',
    explanation: 'The system message defines the task: classify sentiment. It constrains the output to exactly three words. This is the "rulebook" for our classifier.',
  },
  {
    lineNumber: 12,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'addExample1User',
    explanation: 'FEW-SHOT: Instead of just asking a question, we first SHOW the AI examples. This user message is Example 1 — a clearly positive sentence.',
  },
  {
    lineNumber: 13,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'addExample1Asst',
    explanation: 'We provide the CORRECT answer as an "assistant" message. The AI learns: when a user says something like "I love this", the answer is "Positive".',
  },
  {
    lineNumber: 16,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"},{"role":"user","content":"This is terrible, I want a refund."}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'addExample2User',
    explanation: 'Example 2 user message — a clearly negative sentence. By showing multiple examples we establish a reliable pattern.',
  },
  {
    lineNumber: 17,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"},{"role":"user","content":"This is terrible, I want a refund."},{"role":"assistant","content":"Negative"}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'addExample2Asst',
    explanation: 'The correct label "Negative" is provided as the assistant reply. The AI now has two labelled examples to infer the classification pattern from.',
  },
  {
    lineNumber: 20,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"},{"role":"user","content":"This is terrible, I want a refund."},{"role":"assistant","content":"Negative"}]',
      },
    ],
    output: '',
    animationTrigger: 'buildFewShot',
    explanation: '5 messages so far — system + 2 example pairs. The AI sees a PATTERN: user text → assistant classification. This is "few-shot learning" — teaching by example!',
  },
  {
    lineNumber: 22,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"},{"role":"user","content":"This is terrible, I want a refund."},{"role":"assistant","content":"Negative"},{"role":"user","content":"It\'s okay, not great but not bad either."}]',
        isChanged: true,
      },
    ],
    output: '',
    animationTrigger: 'addRealQuestion',
    explanation: 'NOW the real question is added as the final user message. The AI will use the pattern from the two examples to predict the label for this ambiguous sentence.',
  },
  {
    lineNumber: 25,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"},{"role":"user","content":"This is terrible, I want a refund."},{"role":"assistant","content":"Negative"},{"role":"user","content":"It\'s okay, not great but not bad either."}]',
      },
    ],
    output: '',
    animationTrigger: 'apiCall',
    explanation: 'Sending all 6 messages to OpenAI. The model sees the complete conversation history — examples plus the new question.',
  },
  {
    lineNumber: 25,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'messages_display',
        value:
          '[{"role":"system","content":"You are a sentiment classifier. Respond with only: Positive, Negative, or Neutral."},{"role":"user","content":"I love this product!"},{"role":"assistant","content":"Positive"},{"role":"user","content":"This is terrible, I want a refund."},{"role":"assistant","content":"Negative"},{"role":"user","content":"It\'s okay, not great but not bad either."}]',
      },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: 'gpt-4o-mini analyses the examples, recognises the pattern, and applies it to the new sentence. "It\'s okay, not great but not bad either" is ambiguous — the examples guide the answer.',
  },
  {
    lineNumber: 25,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response', value: '<ChatCompletion object>', isNew: true },
      { name: 'prediction', value: '"Neutral"', isNew: true },
    ],
    output: '',
    animationTrigger: 'showPrediction',
    explanation: 'The model predicted "Neutral" — correct! It generalised from just 2 examples. Few-shot prompting is powerful for classification tasks where labelled data in the prompt guides the model.',
  },
  {
    lineNumber: 28,
    variables: [
      { name: 'module', value: 'openai' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'prediction', value: '"Neutral"' },
    ],
    output: "\nSentiment for \"It's okay, not great but not bad either.\": Neutral",
    animationTrigger: 'printOutput',
    explanation: 'The classification is printed. We taught the AI a task with just 2 examples in the prompt — no fine-tuning, no training data files, just a clever message structure.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson 4 Challenge – challengeTrace (12 steps)
// ─────────────────────────────────────────────────────────────────────────────
export const challengeTrace: TraceStep[] = [
  {
    lineNumber: 1,
    variables: [],
    output: '',
    explanation: "Challenge time! We'll combine system prompts, few-shot examples, and JSON output into a restaurant recommender.",
  },
  {
    lineNumber: 2,
    variables: [
      { name: 'module_openai', value: 'openai', isNew: true },
      { name: 'module_json', value: 'json', isNew: true },
    ],
    output: '',
    animationTrigger: 'import',
    explanation: 'Importing both openai (to call the API) and json (to parse the structured response).',
  },
  {
    lineNumber: 4,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)', isNew: true },
    ],
    output: '',
    animationTrigger: 'createClient',
    explanation: 'Creating the OpenAI client.',
  },
  {
    lineNumber: 6,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'system_prompt',
        value:
          '"You are a restaurant recommendation expert. Always respond with a valid JSON object containing a list of restaurants."',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'addSystemMsg',
    explanation: 'The system prompt defines the expert persona AND explicitly states that responses must be JSON. Mentioning JSON in both the system prompt and response_format gives the most reliable results.',
  },
  {
    lineNumber: 10,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'system_prompt',
        value:
          '"You are a restaurant recommendation expert. Always respond with a valid JSON object containing a list of restaurants."',
      },
      {
        name: 'user_prompt',
        value:
          '"Recommend 3 restaurants in Bangalore for a team dinner. Include name, cuisine, price_range, and a one-line description."',
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'addUserMsg',
    explanation: 'The user prompt specifies city (Bangalore), context (team dinner), count (3), and the exact JSON fields wanted. Clear, structured prompts produce structured, usable outputs.',
  },
  {
    lineNumber: 14,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      {
        name: 'user_prompt',
        value:
          '"Recommend 3 restaurants in Bangalore for a team dinner. Include name, cuisine, price_range, and a one-line description."',
      },
      { name: 'response_format', value: '{"type": "json_object"}', isNew: true },
    ],
    output: '',
    animationTrigger: 'buildMessages',
    explanation: 'response_format="json_object" locks the output to valid JSON. Combined with the system prompt, this double-enforces structured output — the safest approach for production apps.',
  },
  {
    lineNumber: 18,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response_format', value: '{"type": "json_object"}' },
    ],
    output: 'Fetching restaurant recommendations...',
    animationTrigger: 'apiCall',
    explanation: 'The request is dispatched — system prompt, user prompt, and JSON mode all bundled into one API call.',
  },
  {
    lineNumber: 18,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response_format', value: '{"type": "json_object"}' },
    ],
    output: '',
    animationTrigger: 'apiProcessing',
    explanation: "OpenAI's servers generate the restaurant list constrained to valid JSON. The model uses its training knowledge of Bangalore restaurants to populate the fields.",
  },
  {
    lineNumber: 18,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'client', value: 'OpenAI(api_key=sk-...)' },
      { name: 'response', value: '<ChatCompletion object>', isNew: true },
    ],
    output: '',
    animationTrigger: 'apiCallComplete',
    explanation: 'Response received! The content will be a valid JSON string — guaranteed by JSON mode.',
  },
  {
    lineNumber: 22,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      { name: 'response', value: '<ChatCompletion object>' },
      {
        name: 'raw_json',
        value:
          '{"restaurants":[{"name":"Toit Brewpub","cuisine":"Continental / Craft Beer","price_range":"₹₹₹","description":"Lively multi-level brewpub perfect for large teams with its own craft beers."},{"name":"Fatty Bao","cuisine":"Pan-Asian","price_range":"₹₹₹","description":"Modern Asian comfort food with bold flavours in a buzzy atmosphere."},{"name":"The Permit Room","cuisine":"South Indian","price_range":"₹₹","description":"Kerala-inspired cocktails and hearty South Indian bites in a hip, relaxed setting."}]}',
        isNew: true,
      },
    ],
    output:
      'Raw JSON:\n{"restaurants":[{"name":"Toit Brewpub","cuisine":"Continental / Craft Beer","price_range":"₹₹₹","description":"Lively multi-level brewpub perfect for large teams with its own craft beers."},{"name":"Fatty Bao","cuisine":"Pan-Asian","price_range":"₹₹₹","description":"Modern Asian comfort food with bold flavours in a buzzy atmosphere."},{"name":"The Permit Room","cuisine":"South Indian","price_range":"₹₹","description":"Kerala-inspired cocktails and hearty South Indian bites in a hip, relaxed setting."}]}',
    animationTrigger: 'extractContent',
    explanation: 'Raw JSON extracted from the response. Readable but dense — next we parse and pretty-print it.',
  },
  {
    lineNumber: 25,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      {
        name: 'raw_json',
        value:
          '{"restaurants":[{"name":"Toit Brewpub",...},{"name":"Fatty Bao",...},{"name":"The Permit Room",...}]}',
      },
      {
        name: 'parsed',
        value: "{'restaurants': [{'name': 'Toit Brewpub', ...}, {'name': 'Fatty Bao', ...}, {'name': 'The Permit Room', ...}]}",
        isNew: true,
      },
    ],
    output: '',
    animationTrigger: 'jsonParse',
    explanation: 'json.loads() converts the raw string into a Python dict. Now we can iterate over parsed["restaurants"] or access individual fields like parsed["restaurants"][0]["name"].',
  },
  {
    lineNumber: 27,
    variables: [
      { name: 'module_openai', value: 'openai' },
      { name: 'module_json', value: 'json' },
      {
        name: 'parsed',
        value: "{'restaurants': [{'name': 'Toit Brewpub', ...}, {'name': 'Fatty Bao', ...}, {'name': 'The Permit Room', ...}]}",
      },
    ],
    output:
      'Restaurant Recommendations for Bangalore:\n{\n  "restaurants": [\n    {\n      "name": "Toit Brewpub",\n      "cuisine": "Continental / Craft Beer",\n      "price_range": "₹₹₹",\n      "description": "Lively multi-level brewpub perfect for large teams with its own craft beers."\n    },\n    {\n      "name": "Fatty Bao",\n      "cuisine": "Pan-Asian",\n      "price_range": "₹₹₹",\n      "description": "Modern Asian comfort food with bold flavours in a buzzy atmosphere."\n    },\n    {\n      "name": "The Permit Room",\n      "cuisine": "South Indian",\n      "price_range": "₹₹",\n      "description": "Kerala-inspired cocktails and hearty South Indian bites in a hip, relaxed setting."\n    }\n  ]\n}',
    animationTrigger: 'printOutput',
    explanation: 'json.dumps(parsed, indent=2) pretty-prints the data. Challenge complete — you combined system prompts + JSON mode + structured output into a real-world recommender!',
  },
];
