// Per-lesson recap lines ("Last time" / "Today") and a 3-question check-in quiz.
// Keys match the lesson ids in ./lessons.ts.

export interface QuizQuestion {
  q: string; // the question, <= 20 words, plain words
  options: string[]; // 3 or 4 short options (<= 12 words each)
  answer: number; // index of the correct option
  why: string; // 1-2 friendly sentences shown after answering (<= 35 words)
}

export interface LessonGuide {
  lastTime?: string; // recap of the PREVIOUS lesson ("Last time: " is added by the UI)
  today: string; // what THIS lesson adds ("Today: " is added by the UI)
  quiz: QuizQuestion[]; // exactly 3 questions
}

export const lessonGuides: Record<string, LessonGuide> = {
  // ===== PART 0: Foundations =====
  'what-is-llm': {
    today: 'We open the box and see how an AI writes its answers, one small token at a time.',
    quiz: [
      {
        q: "What is an LLM's one main job?",
        options: [
          'Search the internet for the answer',
          'Guess what text should come next',
          'Copy replies from a big list of saved answers',
          'Feel emotions like a person does',
        ],
        answer: 1,
        why: "An LLM is like your phone's autocomplete, only far bigger: it keeps guessing the next token. Everything else it does grows out of that one job.",
      },
      {
        q: 'Why is your text cut into tokens, each with an ID number?',
        options: [
          'To make your text look shorter on screen',
          'To hide your words from other people',
          'Because the model works with numbers, not letters',
        ],
        answer: 2,
        why: 'Like snapping a LEGO model into bricks, text is split into tokens and each gets a number. The model can only do math on numbers.',
      },
      {
        q: 'Why do chatbot answers often appear word by word?',
        options: [
          'The model makes one token at a time, then repeats',
          'A person is typing the answer live',
          'The internet connection is slow',
        ],
        answer: 0,
        why: 'The model picks one token, adds it to the text, and goes again. That loop is why you watch the answer grow piece by piece.',
      },
    ],
  },

  temperature: {
    lastTime: 'An LLM writes by guessing the next token, one at a time, from a list of chances.',
    today: 'One dial, temperature, decides how boldly the AI picks words: steady robot or wild poet.',
    quiz: [
      {
        q: 'You want the same correct answer every time for a math question. Which temperature fits best?',
        options: ['0', '0.7', '1.5'],
        answer: 0,
        why: 'At temperature 0 the model picks the most likely word every time, so answers stay (almost) the same. Perfect for code, math and facts.',
      },
      {
        q: 'What happens at a high temperature like 1.5?',
        options: [
          'The model becomes smarter and knows more facts',
          'Unlikely words get a real chance, so the text can wander',
          'The model answers much faster',
          'The answer is always shorter',
        ],
        answer: 1,
        why: 'A high temperature evens out the chances, so surprising words get picked. Great for brainstorming, risky when you need correct answers.',
      },
      {
        q: 'Your prompt is vague and the answers are poor. Will setting temperature to 0 fix it?',
        options: [
          'Yes, temperature 0 fixes any prompt',
          'Yes, but only on OpenAI',
          'No, it will just be confidently vague. Write a clearer prompt.',
        ],
        answer: 2,
        why: 'Temperature only changes how the next word is picked. A clear prompt matters more than the dial.',
      },
    ],
  },

  'context-memory': {
    lastTime: 'Temperature decides how boldly the AI picks each next word: low is steady, high is creative.',
    today: 'The AI forgets everything between calls, so we see how apps fake memory with a messages list.',
    quiz: [
      {
        q: 'Why do we re-send the whole messages list every turn?',
        options: [
          'The API loses messages unless you send them twice',
          'The model remembers nothing, so the list is its only memory',
          'It makes the answer arrive faster',
        ],
        answer: 1,
        why: 'Each call starts fresh. Sending every old message plus the new one is the whole trick behind chat memory.',
      },
      {
        q: 'In the messages list, what does the role "assistant" mean?',
        options: [
          'The instructions that set the rules',
          'The person typing the questions',
          "The model's own earlier reply",
          'A helper program that checks spelling',
        ],
        answer: 2,
        why: '"system" gives instructions, "user" is the person, and "assistant" is the model\'s reply. You add each reply to the list yourself.',
      },
      {
        q: 'A chat grows too big for the context window. What is a smart fix?',
        options: [
          'Delete the system message first',
          'Send only the newest question from now on',
          'Raise the temperature so it fits',
          'Summarize old messages into one short note',
        ],
        answer: 3,
        why: 'A summary keeps the important bits while freeing up space on the "desk". Dropping the oldest messages also works, but always keep the system message.',
      },
    ],
  },

  'system-prompts': {
    lastTime: 'The model forgets everything, so we re-send the whole messages list on every turn.',
    today: 'The system prompt, messages[0], is the job briefing that shapes how the AI talks and behaves.',
    quiz: [
      {
        q: "Where does the system prompt go in OpenAI's messages list?",
        options: [
          'First, as messages[0] with role "system"',
          "Last, after the user's question",
          'In a separate file the model downloads',
          "Anywhere, because order doesn't matter",
        ],
        answer: 0,
        why: 'OpenAI puts it first, with role "system". The model reads it first on every call, like a job briefing before work starts.',
      },
      {
        q: 'Why is a shorter system prompt usually better?',
        options: [
          'Long system prompts are not allowed',
          'It is re-sent every call, so you pay each time',
          'Short prompts make the AI more creative',
        ],
        answer: 1,
        why: 'The system prompt travels with every single message. Keeping it short and clear saves tokens every time.',
      },
      {
        q: 'A user types "Ignore all previous instructions." What is true?',
        options: [
          "The system prompt is a lock, so it's totally safe",
          'The API automatically blocks that sentence',
          'The model might obey, so add your own checks in code',
        ],
        answer: 2,
        why: 'A system prompt is a guideline, not a lock. Never rely on it alone for security.',
      },
    ],
  },

  hallucination: {
    lastTime: 'A good prompt gives the AI a role, a clear task, context, a format and examples.',
    today: 'Sometimes AI sounds sure but is wrong. We learn why, and five ways to fight it.',
    quiz: [
      {
        q: 'Why does an LLM sometimes make things up?',
        options: [
          'It predicts text that sounds right, not text it checked',
          'It is trying to trick you on purpose',
          'Its internet connection failed',
          'Someone typed wrong facts into it',
        ],
        answer: 0,
        why: 'Like a student bluffing on an exam, the model writes what fits the pattern even when it does not know. And it sounds just as sure either way.',
      },
      {
        q: 'An AI gives you a paper title and author as its source. What should you do?',
        options: [
          'Trust it, because AI never invents sources',
          "Check it yourself; if you can't find it, it's made up",
          'Ask again at a higher temperature',
        ],
        answer: 1,
        why: 'Models can invent papers, authors and even court cases. If you cannot find the source yourself, treat it as made up.',
      },
      {
        q: 'Which fix gives the model real facts to copy, like an open-book exam?',
        options: [
          'Raising the temperature',
          'Asking it to sound more confident',
          'Asking for longer answers',
          'RAG: giving it the real documents with the question',
        ],
        answer: 3,
        why: 'With RAG the documents sit right in the prompt, so the model can copy facts instead of guessing. Lower temperature helps a little, but it adds no knowledge.',
      },
    ],
  },

  rag: {
    lastTime: 'AI can be confidently wrong, and giving it real documents is one strong way to fight it.',
    today: 'RAG lets the AI answer from YOUR documents: find them, add them to the prompt, then answer.',
    quiz: [
      {
        q: "What are RAG's three steps, in order?",
        options: ['Train, test, deploy', 'Generate, check, retry', 'Retrieve, augment, generate'],
        answer: 2,
        why: 'Retrieve finds the related chunks, Augment pastes them into the prompt, and Generate lets the model answer using them. An open-book exam!',
      },
      {
        q: 'How does RAG choose which document chunks to add?',
        options: [
          'It picks chunks at random',
          'It picks the chunks closest in meaning to the question',
          'It always adds the whole handbook',
          'It picks the newest chunks',
        ],
        answer: 1,
        why: 'The question and chunks become embeddings, those "meaning coordinates". The closest chunks win, and only the most useful ones fit on the desk.',
      },
      {
        q: 'Does RAG change the model itself?',
        options: [
          'No, only its input changes: better facts go in',
          'Yes, it retrains the model on your files',
          'Yes, it makes the model remember forever',
        ],
        answer: 0,
        why: 'RAG does not make the model smarter. It gives it better input, so it has much less reason to guess.',
      },
    ],
  },

  agents: {
    lastTime: 'RAG finds the right documents and adds them to the prompt so the AI can answer.',
    today: 'Agents let the AI DO things: it picks tools, our code runs them, and it loops.',
    quiz: [
      {
        q: 'What is an agent made of?',
        options: [
          'Just a bigger LLM',
          'An LLM plus tools plus a loop',
          'A robot with metal arms',
          'An LLM with a very high temperature',
        ],
        answer: 1,
        why: 'The LLM decides what to do, your code does it, and the result goes back to the LLM. The loop repeats until the job is finished.',
      },
      {
        q: 'The AI asks for get_weather("Paris"). Who actually runs that function?',
        options: [
          'The LLM, inside its own brain',
          'The user, by typing it in a terminal',
          'Your code, which then sends the result back',
        ],
        answer: 2,
        why: 'The LLM only writes an order slip. Your code runs get_weather, gets "22°C, sunny", and sends it back so the LLM can write the answer.',
      },
      {
        q: 'You just need to translate one paragraph. Do you need an agent?',
        options: [
          'No, one normal API call is enough',
          'Yes, every task needs an agent',
          'Yes, translating always needs tools',
        ],
        answer: 0,
        why: 'Agents are for jobs that need tools and several steps. If one API call can do it, like summarizing or translating, skip the agent.',
      },
    ],
  },

  // ===== PART 1: API Basics =====
  'basic-api': {
    lastTime: 'We installed Python, made an API key, hid it safely in .env, and checked our setup.',
    today: 'We write real Python: send one question to OpenAI and print the answer it sends back.',
    quiz: [
      {
        q: 'What does the line client = OpenAI() give us?',
        options: [
          'The AI model itself, running on your laptop',
          'A phone line to OpenAI for sending requests',
          'The answer to our question',
        ],
        answer: 1,
        why: 'The client is our connection to OpenAI. Every request goes through it, and it quietly reads your secret key from OPENAI_API_KEY.',
      },
      {
        q: 'Where is the reply text inside response?',
        options: [
          'response.text',
          'response.messages[0]',
          'response.answer',
          'response.choices[0].message.content',
        ],
        answer: 3,
        why: 'response is an object with extra details inside. choices[0] means "the first answer", and .message.content is its text.',
      },
      {
        q: 'Where should your OpenAI secret key live?',
        options: [
          'In an environment variable called OPENAI_API_KEY',
          'Pasted right into the code',
          'Inside the messages list',
        ],
        answer: 0,
        why: 'OpenAI() reads the key from the environment for you. Never paste it into your code, where others could see it.',
      },
    ],
  },

  'system-prompts-tracer': {
    lastTime: 'We read response.usage to count tokens and worked out what one API call really costs.',
    today: 'We add one "system" message that tells the AI who to be before it answers.',
    quiz: [
      {
        q: 'What does the message with role "system" do in this program?',
        options: [
          'It shows a greeting to the user',
          'It tells the AI who to be and how to behave',
          'It picks which model answers',
          'It prints the answer',
        ],
        answer: 1,
        why: 'Think of it as a director\'s instruction card. "You are a friendly Python tutor." sets the AI\'s role before it reads the question.',
      },
      {
        q: 'Why does the system message come before the user message?',
        options: [
          'Python needs lists in alphabetical order',
          'Otherwise the user message gets deleted',
          'So the AI reads the rules before the question',
        ],
        answer: 2,
        why: 'Order matters: system first, then user. The AI reads its instructions first, then answers the question with them in mind.',
      },
      {
        q: "Does the user see the system prompt's text in the chat?",
        options: [
          'No, but the AI still follows it',
          'Yes, it is always printed first',
          'Only if the user asks for it',
        ],
        answer: 0,
        why: 'The system message is behind the scenes. The user never sees it, but it shapes every answer the AI gives.',
      },
    ],
  },

  'conversation-loop': {
    lastTime: 'A "system" message placed first tells the AI who to be before it reads the question.',
    today: 'We build a chatbot you can talk to again and again, keeping its memory in a list.',
    quiz: [
      {
        q: 'What does messages.append({"role": "assistant", "content": assistant_msg}) do?',
        options: [
          "Prints the AI's answer on screen",
          "Saves the AI's answer in the history for the next turn",
          "Stores the answer in OpenAI's memory",
          'Deletes the oldest message',
        ],
        answer: 1,
        why: 'The AI forgets everything between calls. Adding its answer to our list means the next call carries it along, so the AI "remembers".',
      },
      {
        q: 'Why do we pass messages=messages, the WHOLE list, on every turn?',
        options: [
          'The model remembers nothing, so the list IS the memory',
          'The API needs at least 5 messages',
          'It makes each reply cheaper',
        ],
        answer: 0,
        why: 'Only our list remembers the chat. Sending all of it lets the AI see what was said before.',
      },
      {
        q: 'On turn 10, compared with turn 1, each request is…',
        options: [
          'Exactly the same size',
          'Smaller, because old messages are skipped',
          'Bigger, so a bit slower and more expensive',
        ],
        answer: 2,
        why: 'The list grows every turn. More tokens means each request takes a little longer and costs a little more.',
      },
    ],
  },

  'json-output': {
    lastTime: 'A while True loop and a growing messages list let our chatbot remember the conversation.',
    today: 'We ask the AI for data in JSON, a neat format that programs can read easily.',
    quiz: [
      {
        q: 'What does response_format={"type": "json_object"} do?',
        options: [
          'Turns the reply into a Python dictionary',
          'Picks a special JSON-only model',
          'Turns on JSON mode, so the reply must be valid JSON',
          'Makes the reply shorter',
        ],
        answer: 2,
        why: 'It switches on JSON mode. Without it the AI may chat around the data; with it, the reply has to be valid JSON.',
      },
      {
        q: 'Why do we also name the keys, like "question" and "difficulty", in the prompt?',
        options: [
          'Because JSON mode deletes unnamed keys',
          'The prompt says WHAT data we want; JSON mode keeps it valid',
          'Python needs the key names to print',
        ],
        answer: 1,
        why: 'They work as a team. The prompt describes the data and its keys, and JSON mode makes sure the format is valid.',
      },
      {
        q: 'After this program runs, what is response.choices[0].message.content?',
        options: [
          'Still just text (a string) until json.loads() reads it',
          'A Python dictionary, ready to use',
          'A list of Python objects',
        ],
        answer: 0,
        why: 'It looks like JSON, but it is only characters so far. json.loads() turns it into a dictionary, as the challenge lesson shows.',
      },
    ],
  },

  'few-shot': {
    lastTime: 'JSON mode (response_format) makes the AI reply in valid JSON that programs can read.',
    today: 'We teach the AI a brand new task just by showing it a few examples first.',
    quiz: [
      {
        q: 'In this code, who wrote the assistant message "Positive"?',
        options: [
          'The AI, on an earlier call',
          'We did, to show the AI what we want',
          'OpenAI adds it automatically',
        ],
        answer: 1,
        why: 'We write the example replies ourselves. The AI sees them as an earlier conversation and copies the pattern.',
      },
      {
        q: 'How many messages are in the list when we call the API?',
        options: ['2', '4', '6', '3'],
        answer: 2,
        why: '1 system message, 2 example pairs (that is 4 messages), and 1 real question: 6 in total.',
      },
      {
        q: 'Why does the AI answer "It\'s okay, not great." with just one word?',
        options: [
          'It copies the one-word pattern from the examples',
          'gpt-4o-mini can only reply with one word',
          'Our code cuts the reply down to one word',
        ],
        answer: 0,
        why: 'The system message allows only three labels, and the examples show one-word answers. The AI copies that style and replies "Neutral".',
      },
    ],
  },

  challenge: {
    lastTime: 'try/except catches API errors, and we retry with longer and longer waits instead of crashing.',
    today: 'We combine all of Part 1 to build a restaurant recommender that replies in JSON.',
    quiz: [
      {
        q: 'What does parsed_json = json.loads(raw_json) do?',
        options: [
          'Sends the JSON back to OpenAI',
          'Turns the JSON text into a Python dictionary',
          'Adds neat line breaks and indents',
          'Checks that the restaurants are real',
        ],
        answer: 1,
        why: 'raw_json is just a string. json.loads() reads it into a dictionary, so parsed_json["recommendations"] gives you the list of restaurants.',
      },
      {
        q: 'What is json.dumps(parsed_json, indent=2) for?',
        options: [
          'Turning the dictionary back into neat, readable text',
          'Sending the data back to the AI',
          'Saving the data to a file on disk',
        ],
        answer: 0,
        why: 'The raw reply is squeezed onto one long line. json.dumps with indent=2 adds line breaks and 2-space indents, so people can read it easily.',
      },
      {
        q: 'Why is json.loads placed inside try: … except?',
        options: [
          'To make the code run faster',
          'To call the API a second time',
          'So bad JSON prints a message instead of crashing',
        ],
        answer: 2,
        why: 'If the text is not valid JSON, Python jumps to the except block and prints "AI did not return valid JSON." instead of crashing.',
      },
    ],
  },

  // ===== PART 2: Agents =====
  'simple-agent': {
    lastTime: 'We combined a system prompt, a clear user prompt and JSON mode into a restaurant recommender.',
    today: 'Our first agent: the AI can ask OUR code to run a Python function called add.',
    quiz: [
      {
        q: 'When the AI wants to use add, what does it send back?',
        options: [
          'The answer 58 as normal text',
          'A tool_calls request with the name and arguments, but no text',
          'Python code for us to copy and paste',
          'Nothing, because it runs add itself',
        ],
        answer: 1,
        why: 'message.content is None. Instead, message.tool_calls holds an order slip: "please run add with a=45, b=13".',
      },
      {
        q: 'Who actually runs the add(a, b) Python function?',
        options: ["The AI, on OpenAI's servers", 'The user, by hand', 'Our own Python code'],
        answer: 2,
        why: 'The AI only reads the tools menu and asks. Our code runs the real function, gets 58, and sends the result back.',
      },
      {
        q: 'Why does the role "tool" message include tool_call_id?',
        options: [
          'It links the answer to the exact request it answers',
          "It stores the user's ID number",
          'It is the password for the API',
        ],
        answer: 0,
        why: 'The AI can ask for several tools at once. tool_call_id copies the id of its request, so it knows which request this answer belongs to.',
      },
    ],
  },

  'multi-function': {
    lastTime: 'The AI asked for add with tool_calls, our code ran it, and we sent back a "tool" message.',
    today: 'Four tools and a while True loop let the AI use tools again and again until done.',
    quiz: [
      {
        q: 'How does the agent loop know the AI is finished?',
        options: [
          'After exactly 3 turns',
          'The reply has no tool_calls, so we break',
          'When the result equals 0',
          'When the user types quit',
        ],
        answer: 1,
        why: 'No tool_calls means the AI wrote a text answer. "if not message.tool_calls" is then True, and break stops the while True loop.',
      },
      {
        q: 'For "What is (50 * 2) - 15?", which tools does the AI ask for, in order?',
        options: ['subtract, then multiply', 'add, then divide', 'multiply, then subtract'],
        answer: 2,
        why: 'Brackets come first, so it asks for multiply(50, 2) = 100. Then, seeing that result in the history, it asks for subtract(100, 15) = 85.',
      },
      {
        q: 'What does available_functions[function_name](**arguments) do?',
        options: [
          "Finds the real function by name and runs it with the inputs",
          'Asks the AI to run the function for us',
          'Adds a new tool to the menu',
        ],
        answer: 0,
        why: 'The dictionary turns a name like "multiply" into the real function, and **arguments passes in a and b. No long if/else chain needed.',
      },
    ],
  },

  // ===== PART 3: Advanced Agents =====
  'multi-tool': {
    lastTime: 'A while True loop kept calling the AI and running tools until no tool_calls came back.',
    today: 'StudyBuddy gets two very different tools, add and lookup, and must pick the right kind.',
    quiz: [
      {
        q: 'A student asks "What is LangChain?" Which tool does the AI pick?',
        options: ['add', 'lookup', 'Neither, it just guesses'],
        answer: 1,
        why: 'It is a concept question. lookup\'s description says "Search for a concept or term in the notes file", and the system prompt gives the same hint.',
      },
      {
        q: 'How does the AI decide between add and lookup?',
        options: [
          'It reads our Python code',
          'It picks one at random',
          'It reads each tool description and the system prompt hints',
        ],
        answer: 2,
        why: 'The AI only sees the tools menu, never our code. Clear descriptions plus system prompt hints make the choice easy.',
      },
      {
        q: "What happens if lookup can't find the word in the notes file?",
        options: [
          'It returns "Sorry, I don\'t know that." for the AI to share',
          'The whole program crashes',
          'The AI makes up an answer from the notes',
        ],
        answer: 0,
        why: 'A tool can "fail" politely by returning text. The AI reads that text and passes it on, so the agent stays honest.',
      },
    ],
  },

  'study-buddy-pro': {
    lastTime: 'StudyBuddy read the tool descriptions to choose add for math and lookup for concepts.',
    today: 'Seven tools! We pick the right function from a dictionary instead of a long if/elif chain.',
    quiz: [
      {
        q: 'What is available_functions in this code?',
        options: [
          'A list of answers the AI gave',
          'A dictionary from tool names (text) to real Python functions',
          'The menu we send to the AI',
        ],
        answer: 1,
        why: 'Like a phone contact list: name → function. "add" in quotes is the text the AI sends; add without quotes is our real function.',
      },
      {
        q: 'args is {"principal": 1000, "rate": 5, "time": 2}. What does function_to_call(**args) mean here?',
        options: [
          'Send args to the AI to calculate',
          'Print args to the screen',
          'simple_interest(principal=1000, rate=5, time=2)',
        ],
        answer: 2,
        why: '**args unpacks the dictionary into named inputs. Then real Python does the math: (1000 × 5 × 2) / 100 = 100.',
      },
      {
        q: 'With seven similar math tools, what helps the AI choose the right one?',
        options: [
          'Clear descriptions, like one that includes the formula',
          'Short tool names like t1 and t2',
          'A higher temperature',
        ],
        answer: 0,
        why: 'The AI chooses by reading descriptions. simple_interest even lists its formula, so it is easy to tell apart from percentage or multiply.',
      },
    ],
  },

  'terminal-assistant': {
    lastTime: 'We turned documents into embeddings and answered from the closest ones, not exact matching words.',
    today: 'An assistant that runs real commands and reads and writes files, with two loops working together.',
    quiz: [
      {
        q: 'This program has two while True loops. What does the INNER one do?',
        options: [
          'Asks the user for the next question',
          'Keeps calling the AI and running tools until it replies with text',
          'Waits 30 seconds between commands',
        ],
        answer: 1,
        why: 'The outer loop is the chat loop. The inner agent loop runs tools until the AI gives plain text, then break returns to the chat.',
      },
      {
        q: 'Why is run_command with shell=True risky?',
        options: [
          'It runs ANY command the AI writes, even ones that delete files',
          'It only works on Windows',
          'It makes the AI forget the chat',
        ],
        answer: 0,
        why: 'subprocess really runs the command on your computer. In real apps, show the command and ask the user to confirm first.',
      },
      {
        q: 'The system prompt says to confirm before using rm. Is that a guarantee?',
        options: [
          'Yes, the AI can never break that rule',
          'Yes, Python blocks rm automatically',
          "No, it's only a request, so real apps also check in code",
        ],
        answer: 2,
        why: 'A system prompt is helpful, but it is a guideline, not a lock. Real safety comes from checks in your own code.',
      },
    ],
  },

  // ===== PART 4: Multi-Agent Teams =====
  'why-teams': {
    lastTime: 'We wrote test cases, ran our agent on each one, and got a score we can trust.',
    today: 'One agent doing everything gets overwhelmed, so we split the job among a team of specialists.',
    quiz: [
      {
        q: "Why did Solo Bot's volcano article end up with a wrong fact?",
        options: [
          'Its computer was too slow',
          'Too many jobs and rules to juggle, and nobody double-checked',
          'Volcanoes are too hard for any AI',
        ],
        answer: 1,
        why: "Solo Bot's system prompt card grew huge with every job. With so much to juggle and no one checking, \"Everest is a volcano\" slipped in.",
      },
      {
        q: 'Rita, Wally and Cora are different agents. What actually makes them different?',
        options: [
          'Each one uses a totally different AI model',
          'They live on different computers',
          'Each has its own short system prompt for one job',
        ],
        answer: 2,
        why: 'All three use the same LLM. Only the instruction card changes, like one actor wearing three different costumes.',
      },
      {
        q: "How do Rita's notes get to Wally?",
        options: [
          'Our Python code carries her text to him as his task',
          'They chat with each other directly',
          'Wally reads Rita\'s memory',
        ],
        answer: 0,
        why: "Agents don't talk by magic. Our code is the mail carrier: it takes Rita's notes (just text) and hands them to Wally.",
      },
    ],
  },

  'team-shapes': {
    lastTime: 'A team of focused agents, each with a short prompt, beats one overloaded agent.',
    today: 'Four team shapes: assembly line, boss & helpers, receptionist, writer & critic. Pick the right one.',
    quiz: [
      {
        q: 'The steps never change: find facts, write, then polish. Which shape fits best?',
        options: ['Boss & helpers', 'Assembly line', 'Receptionist', 'Writer & critic'],
        answer: 1,
        why: 'Like a relay race, each robot does one job and passes the work on, always in the same order. Great when the steps never change.',
      },
      {
        q: 'What does Rosa the receptionist do with each question?',
        options: [
          'Sends it to exactly ONE specialist',
          'Answers it all by herself',
          'Asks every helper at the same time',
        ],
        answer: 0,
        why: 'Like a hospital front desk, Rosa replies with one word, like "math", and our code sends the question to that one specialist. Only 2 calls: cheap and fast.',
      },
      {
        q: 'Why does the writer & critic loop stop after MAX_ROUNDS?',
        options: [
          'The critic gets sleepy',
          "It's a rule of the OpenAI API",
          'If the critic is never happy, the loop and bill never end',
        ],
        answer: 2,
        why: 'Without a limit, a picky critic could keep the loop going forever. So we stop after MAX_ROUNDS and keep the latest draft.',
      },
    ],
  },

  'assembly-line': {
    lastTime: 'Teams come in four shapes; pick the simplest one that fits how your task behaves.',
    today: 'We code our first team: Rita finds facts, then our code hands them to Wally.',
    quiz: [
      {
        q: 'What is run_agent(system_prompt, task) really?',
        options: [
          'A special multi-agent library',
          'One normal API call with its own job card and task',
          'A tool that the AI calls',
        ],
        answer: 1,
        why: 'Inside is the very same API call from Part 1. Only the system message (the job card) changes, turning the same AI into a different agent.',
      },
      {
        q: 'In article = run_agent(writer_prompt, f"Facts:\\n{facts}"), what is Wally\'s task?',
        options: [
          "Rita's facts, handed to Wally as his task",
          "Wally's own job card",
          'A question for Rita to answer',
        ],
        answer: 0,
        why: 'facts holds Rita\'s reply. The f-string puts it after "Facts:", so her answer becomes Wally\'s task. That is the handoff!',
      },
      {
        q: 'Do Rita and Wally ever talk to each other directly?',
        options: [
          'Yes, through a shared chat room',
          'Yes, Wally calls Rita as a tool',
          "No, our code carries Rita's text to Wally",
        ],
        answer: 2,
        why: "One agent's answer becomes the next one's task, and our code carries the note between their desks.",
      },
    ],
  },

  'writer-critic': {
    lastTime: "In an assembly line, one agent's answer becomes the next agent's task, carried by our code.",
    today: 'Wally writes, Cora reviews, and they loop until APPROVED, with a safety fuse so it ends.',
    quiz: [
      {
        q: 'What makes the loop stop early?',
        options: [
          'Wally says he is finished',
          'Cora replies exactly "APPROVED", so break runs',
          'The slogan gets longer than 2 lines',
        ],
        answer: 1,
        why: 'Cora\'s job card says to reply exactly "APPROVED" when the draft is great. Our code checks feedback.strip() == "APPROVED" and breaks out of the loop.',
      },
      {
        q: 'Why does the writer & critic loop have a max of 3 rounds?',
        options: [
          "A safety fuse, so they can't argue forever and cost too much",
          'OpenAI only allows 3 calls per program',
          'Slogans must always have 3 lines',
        ],
        answer: 0,
        why: 'If Cora is never happy, the loop could run forever and every round costs API calls. After 3 rounds we stop and keep the latest draft.',
      },
      {
        q: 'Which values does round_number take in for round_number in range(1, 4)?',
        options: ['1, 2, 3 and 4', '0, 1, 2 and 3', '1, 2 and 3'],
        answer: 2,
        why: 'range stops just before the second number, so round_number is 1, 2, then 3. After that the fuse is burnt out.',
      },
    ],
  },

  'boss-agent': {
    lastTime: 'Wally and Cora looped until APPROVED, and a max-rounds fuse made sure it always ended.',
    today: 'Max the boss uses tool calls, but each "tool" is a whole helper agent.',
    quiz: [
      {
        q: 'In this code, what is the tool ask_researcher really?',
        options: [
          'A simple math function',
          'A whole agent: Rita, making her own LLM call',
          'A web search engine',
        ],
        answer: 1,
        why: "ask_researcher just calls run_agent with Rita's job card. So it is an LLM call inside a tool call!",
      },
      {
        q: 'How does our code know that Max is finished?',
        options: [
          'Rita replies APPROVED',
          'After exactly two helpers have answered',
          "Max's reply has no tool_calls (no order slips)",
        ],
        answer: 2,
        why: 'It is the same agent loop as before. No order slips means Max wrote his final answer, so we print it and break.',
      },
      {
        q: 'What does result = helpers[name](**args) do?',
        options: [
          "Finds the helper by name and runs it with Max's question",
          'Makes Max do the work himself',
          'Adds a new helper to the menu',
        ],
        answer: 0,
        why: 'helpers is a phone book: tool name → real Python function. It rings the right helper, whose answer goes back to Max as a "tool" message.',
      },
    ],
  },
};
