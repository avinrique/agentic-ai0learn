import { ConceptStep } from '@/stores/conceptStore';

export const whatIsLLMSteps: ConceptStep[] = [
  // ===== ACT 1: THE HOOK (Steps 0-3) =====
  // Step 0: "The AI You Already Know"
  {
    explanation: 'You\'ve probably already used one of these — ChatGPT, Claude, Gemini. You type a question, and it streams back an answer. But what\'s actually happening behind the scenes?',
    animationTrigger: 'hook',
    subtitle: 'Let\'s start with something familiar.',
  },
  // Step 1: "Meet the Family"
  {
    explanation: 'There are actually many of these AI systems — made by different companies. ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Llama (Meta), Mistral, and Falcon. They\'re all different products, but they share a common foundation.',
    animationTrigger: 'family',
    subtitle: 'Different products, same underlying technology.',
  },
  // Step 2: "They're All LLMs"
  {
    explanation: 'They\'re all built on the same idea: a Large Language Model. "Large" = billions of parameters. "Language" = trained on text. "Model" = a mathematical system that makes predictions.',
    animationTrigger: 'allLLMs',
    subtitle: 'Three words that explain the technology behind all of them.',
  },
  // Step 3: "The Big Question"
  {
    explanation: 'So how does an LLM actually work? How does it take your question and produce an answer that sounds like a human wrote it? Let\'s find out, step by step.',
    animationTrigger: 'bigQuestion',
    subtitle: 'Let\'s look under the hood.',
  },

  // ===== ACT 2: THE INPUT (Steps 4-6) =====
  // Step 4: "It Starts With Your Words"
  {
    explanation: 'Everything starts with your prompt — the text you type in. The model\'s job is simple: predict what comes next. It doesn\'t "think" — it predicts.',
    animationTrigger: 'yourWords',
    subtitle: 'Every interaction starts with input text.',
  },
  // Step 5: "Breaking Words Into Pieces"
  {
    explanation: 'Before the model can process your text, it breaks it into "tokens" — small pieces of words. Each token gets a unique ID number. Some words are one token, others get split into parts.',
    animationTrigger: 'tokenize',
    subtitle: 'The model doesn\'t see words like you do — it sees token IDs.',
  },
  // Step 6: "Why Tokens Matter"
  {
    explanation: 'Tokens are the unit of everything — input length, output length, and cost. A short prompt uses fewer tokens (cheaper), a long one uses more (expensive). One token costs about $0.000003.',
    animationTrigger: 'tokensCost',
    subtitle: 'Tokens = the currency of LLMs.',
  },

  // ===== ACT 3: THE TRANSFORMATION (Steps 7-9) =====
  // Step 7: "Giving Words Meaning: Embeddings"
  {
    explanation: 'Each token gets converted into a list of numbers called an "embedding" — like GPS coordinates, but for meaning. Just as (40.7, -74.0) locates New York, [0.23, -0.87, ...] locates a word in "meaning space."',
    animationTrigger: 'embeddings',
    subtitle: 'Numbers can capture meaning — that\'s the breakthrough.',
  },
  // Step 8: "The Meaning Map"
  {
    explanation: 'In this meaning space, similar concepts cluster together. "King" and "queen" are close (both royalty). "Dog" and "cat" are close (both pets). "Banana" is far from all of them. The model uses these distances to understand relationships.',
    animationTrigger: 'meaningMap',
    subtitle: 'Words with similar meanings have similar numbers.',
  },
  // Step 9: "The Famous Word Math"
  {
    explanation: 'Here\'s the mind-blowing part: you can do math with word meanings. Take the vector for "King," subtract "Man," add "Woman" — and you get... "Queen." The model learned this from data alone, no one programmed it.',
    animationTrigger: 'wordMath',
    subtitle: 'King - Man + Woman = Queen. Math with meaning.',
  },

  // ===== ACT 4: THE ENGINE (Steps 10-14) =====
  // Step 10: "Paying Attention"
  {
    explanation: '"Attention" is the mechanism that lets each token look at every other token. When you say "The capital of France is ___", the model connects "capital" and "France" strongly. It\'s not reading left to right — it\'s connecting related pieces.',
    animationTrigger: 'attention',
    subtitle: 'Each token attends to every other token — context is everything.',
  },
  // Step 11: "The Neural Network"
  {
    explanation: 'The tokens (now enriched with context from attention) flow through a massive neural network — layers and layers of math. Modern LLMs have 96+ layers and billions of parameters. This is the "Large" in Large Language Model.',
    animationTrigger: 'neuralNet',
    subtitle: 'Billions of parameters, working together.',
  },
  // Step 12: "The Prediction"
  {
    explanation: 'After all that processing, the network outputs a score for every possible next token — over 100,000 words. "Paris" gets 92%, "Lyon" gets 3%, and so on. The model is guessing, but it\'s guessing really, really well.',
    animationTrigger: 'probabilities',
    subtitle: '"Paris" has 92% — but "Lyon" was also an option!',
  },
  // Step 13: "Temperature: The Creativity Dial"
  {
    explanation: 'Temperature controls how "creative" vs "deterministic" the output is. At temperature 0, it always picks the top word. At 0.7, it\'s balanced. At 1.5, it\'s wild and unpredictable. This is why the same prompt can give different answers.',
    animationTrigger: 'temperature',
    subtitle: 'THAT\'S what the temperature setting does!',
  },
  // Step 14: "One Token at a Time"
  {
    explanation: 'Here\'s the key insight: the model generates just ONE token at a time. It predicts "Paris", adds it to the input, then predicts the next token, and the next. That streaming effect you see in ChatGPT? That\'s tokens appearing one by one.',
    animationTrigger: 'autoregressive',
    subtitle: 'Autoregressive generation: predict → append → repeat.',
  },

  // ===== ACT 5: THE BACKSTORY (Steps 15-18) =====
  // Step 15: "Training: Reading the Internet"
  {
    explanation: 'Before it can predict anything, the model needs training. It reads trillions of tokens from books, websites, code, and conversations. During training, it adjusts billions of parameters to get better at predicting the next token.',
    animationTrigger: 'training',
    subtitle: 'Training = learning to predict, over and over, on massive data.',
  },
  // Step 16: "What Training Looks Like"
  {
    explanation: 'Training is just next-token prediction, repeated trillions of times. The model sees "The cat sat on the ___", predicts "mat." If wrong, it adjusts its parameters slightly. Over time, it learns grammar, facts, reasoning — all from prediction.',
    animationTrigger: 'trainingExamples',
    subtitle: 'Every fact it knows came from predicting the next word.',
  },
  // Step 17: "The Context Window"
  {
    explanation: 'The model can only process a fixed amount of text at once — its "context window." GPT-4 handles 128K tokens (~300 pages). Claude handles 200K tokens (~500 pages). Anything outside the window is invisible to the model.',
    animationTrigger: 'contextWindow',
    subtitle: 'The model can only "see" what fits in the window.',
  },
  // Step 18: "No Memory Between Conversations"
  {
    explanation: 'Important misconception: LLMs have NO memory between conversations. If you tell it your name in one chat, it won\'t remember in the next. Each conversation starts completely fresh. The "memory" is just re-sending previous messages.',
    animationTrigger: 'noMemory',
    subtitle: 'Every conversation starts from zero.',
  },

  // ===== ACT 6: THE AHA MOMENT (Steps 19-20) =====
  // Step 19: "The Full Pipeline"
  {
    explanation: 'Let\'s see the whole thing together: Your prompt → Tokenizer breaks it into tokens → Embeddings give them meaning → Attention connects context → Neural network processes → Probabilities come out → One token selected → Loop back for the next token.',
    animationTrigger: 'fullPipeline',
    subtitle: 'The complete journey from question to answer.',
  },
  // Step 20: "Just Autocomplete? Kind of."
  {
    explanation: 'It\'s basically autocomplete — but trained on 10,000x more data, with 1,000,000x more parameters, producing emergent abilities like reasoning, coding, and creative writing. Same principle, incomprehensibly different scale.',
    animationTrigger: 'analogy',
    subtitle: 'Same principle, vastly different scale.',
  },

  // ===== ACT 7: WRAP-UP (Steps 21-22) =====
  // Step 21: "What LLMs Can and Can't Do"
  {
    explanation: 'LLMs can write, reason, code, and understand context brilliantly. But they CAN\'T browse the internet live, remember past conversations, guarantee factual accuracy, or learn from your conversations. Knowing the limits is as important as knowing the capabilities.',
    animationTrigger: 'canAndCant',
    subtitle: 'Know the capabilities AND the limits.',
  },
  // Step 22: "Key Takeaways"
  {
    explanation: 'Five things to remember: (1) LLMs predict the next token, one at a time. (2) Tokens are the unit of input, output, and cost. (3) Embeddings capture meaning as numbers. (4) Attention connects context. (5) Temperature controls creativity. Now you know what powers ChatGPT, Claude, Gemini, and Llama!',
    animationTrigger: 'takeaways',
  },
];

export const contextMemorySteps: ConceptStep[] = [
  // ===== ACT 1: THE BRIDGE (Steps 0-2) =====
  // Step 0: "From Concept to Code"
  {
    explanation: 'When you chat with ChatGPT or Claude, it FEELS like it remembers your conversation. You say your name, and it uses it later. But how? Let\'s look behind the curtain.',
    animationTrigger: 'fromConceptToCode',
    subtitle: 'It feels like memory... but how does it actually work?',
  },
  // Step 1: "The Messages Array"
  {
    explanation: 'Behind every chat interface is a simple data structure: an array of messages. Each message has a role and content. That\'s it — that\'s the entire "memory" of the conversation.',
    animationTrigger: 'messagesArray',
    subtitle: 'The chat UI is just a pretty wrapper around an array.',
  },
  // Step 2: "Three Roles, Three Jobs"
  {
    explanation: 'Every message has one of three roles. System instructs the model how to behave. User provides the human\'s input. Assistant contains the model\'s responses. These three roles are all you need.',
    animationTrigger: 'threeRoles',
    subtitle: 'System instructs, User asks, Assistant answers.',
  },

  // ===== ACT 2: THE ILLUSION (Steps 3-6) =====
  // Step 3: "Your First API Call"
  {
    explanation: 'Your first API call is simple: send a messages array with a system prompt and a user question. The LLM processes it and returns a response. About 85 tokens total.',
    animationTrigger: 'firstCall',
    subtitle: 'Send messages, get response. Simple.',
  },
  // Step 4: "The Response Comes Back"
  {
    explanation: 'The response comes back and you append it to your array as a new assistant message. But here\'s the thing — the LLM itself remembers NOTHING. That red X means it\'s already forgotten everything.',
    animationTrigger: 'responseBack',
    subtitle: 'The LLM forgets immediately after responding.',
  },
  // Step 5: "The Second Call — The Trick"
  {
    explanation: 'When the user asks a follow-up, you must re-send the ENTIRE conversation — all previous messages plus the new one. The model has no memory, so YOU replay the whole history every single time.',
    animationTrigger: 'secondCall',
    subtitle: 'Notice the "RE-SENT" badges — everything gets sent again!',
  },
  // Step 6: "The Growing Cost"
  {
    explanation: 'Each API call sends more tokens than the last. Call 1: ~85 tokens. Call 5: ~1,200 tokens. Call 20: ~12,000 tokens. The cost grows with every turn of conversation because you\'re re-sending everything.',
    animationTrigger: 'growingCost',
    subtitle: 'More turns = more tokens = more cost. Every single time.',
  },

  // ===== ACT 3: THE LIMIT (Steps 7-9) =====
  // Step 7: "Hitting the Wall"
  {
    explanation: 'Every model has a maximum context window — the total tokens it can process at once. As your conversation grows, that window fills up. When it hits the limit, you can\'t send any more messages.',
    animationTrigger: 'hittingWall',
    subtitle: 'The context window is finite — and you WILL hit it.',
  },
  // Step 8: "Strategy 1: Drop Old Messages"
  {
    explanation: 'The simplest fix: drop the oldest messages (but keep the system prompt!). The model loses that context, but you free up space. It\'s a trade-off — simple but lossy.',
    animationTrigger: 'dropMessages',
    subtitle: 'Lose old context to make room for new. Simple but imperfect.',
  },
  // Step 9: "Strategy 2: Summarize"
  {
    explanation: 'A smarter approach: use the LLM itself to summarize old messages into a single compact message. You keep the key information while using far fewer tokens. Before: 2,400 tokens. After: 380 tokens.',
    animationTrigger: 'summarize',
    subtitle: 'Compress old context instead of losing it.',
  },

  // ===== ACT 4: THE SYSTEM PROMPT (Steps 10-13) =====
  // Step 10: "messages[0]: The System Prompt"
  {
    explanation: 'The system prompt is always messages[0] — the first element. It\'s read by the model before anything else, on every single call. It sets the stage for everything that follows.',
    animationTrigger: 'systemPromptZoom',
    subtitle: 'messages[0] — read first, every time.',
  },
  // Step 11: "What Goes in a System Prompt"
  {
    explanation: 'A great system prompt has four parts: Persona (who the model should be), Format (how to structure output), Rules (what to do and not do), and Context (background knowledge). Each part shapes the response.',
    animationTrigger: 'systemPromptAnatomy',
    subtitle: 'Four building blocks of an effective system prompt.',
  },
  // Step 12: "Same Question, Different Personality"
  {
    explanation: 'Watch the power of the system prompt: ask "Explain gravity" to three different personas — a physicist, a pirate, and a poet. Same model, same question, wildly different answers.',
    animationTrigger: 'sameQuestionDiffPersonality',
    subtitle: 'The system prompt is your most powerful lever.',
  },
  // Step 13: "System Prompt is Re-sent Every Call"
  {
    explanation: 'Remember: the system prompt is re-sent with every API call. If it\'s 2,000 tokens and your conversation has 20 turns, that\'s 40,000 tokens just for the system prompt. Keep it concise!',
    animationTrigger: 'systemPromptCost',
    subtitle: '2,000 tokens × 20 calls = 40,000 tokens. Keep it lean.',
  },

  // ===== ACT 5: SYNTHESIS (Step 14) =====
  // Step 14: "Key Takeaways"
  {
    explanation: 'Five things to remember: (1) The messages array IS the memory. (2) Every call re-sends everything. (3) Cost grows per turn. (4) Drop or summarize when full. (5) System prompt = messages[0]. Now you can build it yourself!',
    animationTrigger: 'takeaways',
  },
];

export const temperatureSteps: ConceptStep[] = [
  // Step 0: "What is Temperature?"
  {
    explanation: 'When an LLM predicts the next word, it doesn\'t just pick one — it calculates probabilities for EVERY possible word. Temperature is a number (0 to 2) that controls how the model chooses from these probabilities. It\'s the "creativity dial."',
    animationTrigger: 'whatIsTemp',
    subtitle: 'A single number that changes everything about the output.',
  },
  // Step 1: "The Probability Distribution"
  {
    explanation: 'For the prompt "The capital of France is ___", the model might give: Paris 92%, Lyon 3%, Marseille 2%, the 1.5%, known 1.5%. These probabilities are the raw material. Temperature decides HOW to pick from them.',
    animationTrigger: 'probDistribution',
    subtitle: 'The model always generates probabilities — temperature decides what to do with them.',
  },
  // Step 2: "Temperature = 0: The Robot"
  {
    explanation: 'At temperature 0, the model ALWAYS picks the highest-probability token. Ask it 100 times, get the same answer 100 times. Perfect for: code generation, math, factual Q&A — anywhere you need consistency.',
    animationTrigger: 'temp0',
    subtitle: 'Deterministic. Predictable. Boring — but reliable.',
  },
  // Step 3: "Temperature = 0.7: The Sweet Spot"
  {
    explanation: 'At temperature 0.7 (the default for most APIs), the model usually picks high-probability tokens but sometimes surprises you. It\'s creative enough to be interesting, predictable enough to be useful. This is what ChatGPT uses by default.',
    animationTrigger: 'temp07',
    subtitle: 'The Goldilocks zone — creative but controlled.',
  },
  // Step 4: "Temperature = 1.5: The Wild Card"
  {
    explanation: 'At temperature 1.5, low-probability tokens get a real chance. The model might say "Paris" — or it might go completely off-script. Great for brainstorming and creative writing, terrible for anything requiring accuracy.',
    animationTrigger: 'temp15',
    subtitle: 'Expect the unexpected. Sometimes brilliant, sometimes nonsense.',
  },
  // Step 5: "Side-by-Side: Same Prompt, Three Temperatures"
  {
    explanation: 'Watch the same prompt generate three completely different responses. Temperature 0 gives a textbook answer. Temperature 0.7 adds flair. Temperature 1.5 goes wild. Same model, same training, different creativity.',
    animationTrigger: 'sideBySide',
    subtitle: 'One prompt, three personalities — all from changing a single number.',
  },
  // Step 6: "When to Use Which"
  {
    explanation: 'Low temperature (0-0.3): code, math, data extraction, factual answers. Medium (0.5-0.8): general chat, summaries, explanations. High (1.0-1.5): creative writing, brainstorming, poetry, character dialogue. Match temperature to your task!',
    animationTrigger: 'whenToUse',
    subtitle: 'The right temperature depends on what you\'re building.',
  },
  // Step 7: "Key Takeaways"
  {
    explanation: 'Remember: (1) Temperature controls randomness in token selection. (2) 0 = deterministic, always the same. (3) 0.7 = balanced default. (4) 1.5 = creative chaos. (5) Match temperature to your use case — code wants low, stories want high.',
    animationTrigger: 'takeaways',
    subtitle: 'One number, massive impact on output quality.',
  },
];

export const hallucinationSteps: ConceptStep[] = [
  // Step 0: "What is Hallucination?"
  {
    explanation: 'Sometimes LLMs say things that sound completely confident and authoritative — but are totally wrong. This is called "hallucination." The model generates plausible-sounding text that has no basis in reality. It\'s one of the biggest risks of using AI.',
    animationTrigger: 'whatIsHallucination',
    subtitle: 'When AI lies with complete confidence.',
  },
  // Step 1: "Why Does It Happen?"
  {
    explanation: 'Remember: LLMs predict the NEXT token based on patterns. They don\'t "know" facts — they know what text LOOKS like. If a pattern suggests "The Eiffel Tower was built in 1892", it sounds right even though it\'s wrong (it was 1889). The model optimizes for plausibility, not truth.',
    animationTrigger: 'whyItHappens',
    subtitle: 'Pattern matching ≠ understanding. Plausible ≠ true.',
  },
  // Step 2: "Example: Confident but Wrong"
  {
    explanation: 'Ask an LLM "When was the Golden Gate Bridge completed?" and it might confidently say "1936" (correct: 1937). Or ask about a historical event and get the date off by a year. Small errors delivered with absolute confidence — that\'s what makes hallucination dangerous.',
    animationTrigger: 'confidentWrong',
    subtitle: 'Close enough to be believable. Wrong enough to cause problems.',
  },
  // Step 3: "Example: Fabricated Citations"
  {
    explanation: 'One of the most infamous forms: ask for academic sources and the LLM will invent paper titles, author names, and journal references that DON\'T EXIST. "Smith et al. (2019), Journal of AI Research" — sounds perfect, completely fabricated. Lawyers have been sanctioned for citing AI-generated fake cases.',
    animationTrigger: 'fakeCitations',
    subtitle: 'Perfect formatting. Zero truth. Real consequences.',
  },
  // Step 4: "Example: Plausible Nonsense"
  {
    explanation: 'Ask an LLM to explain a concept it wasn\'t trained on well, and it might generate an explanation that SOUNDS authoritative but is complete nonsense. It uses the right jargon, the right sentence structure, the right tone — but the content is invented. This is the hardest type to catch.',
    animationTrigger: 'plausibleNonsense',
    subtitle: 'It sounds like an expert. It\'s making things up.',
  },
  // Step 5: "The Confidence Problem"
  {
    explanation: 'Here\'s the core issue: LLMs sound EQUALLY confident whether they\'re right or wrong. There\'s no "I\'m guessing" tone. A correct fact and a hallucinated one look identical in the output. You can\'t tell from the text alone which is which.',
    animationTrigger: 'confidenceProblem',
    subtitle: 'No uncertainty signal. Right and wrong look the same.',
  },
  // Step 6: "How to Reduce Hallucination"
  {
    explanation: 'Five strategies: (1) Use RAG — ground answers in real documents. (2) Lower temperature — reduces randomness. (3) Add "If you don\'t know, say so" to your system prompt. (4) Ask for sources, then verify them. (5) Use the model for drafting, not as source of truth.',
    animationTrigger: 'howToReduce',
    subtitle: 'You can\'t eliminate it — but you can dramatically reduce it.',
  },
  // Step 7: "Key Takeaways"
  {
    explanation: 'Remember: (1) Hallucination = confident wrong answers. (2) It happens because LLMs predict patterns, not truth. (3) Fake citations are extremely common. (4) Right and wrong sound equally confident. (5) Always verify critical facts. Trust but verify!',
    animationTrigger: 'takeaways',
    subtitle: 'The most important lesson: never blindly trust AI output.',
  },
];

export const ragAndAgentsSteps: ConceptStep[] = [
  // ===== ACT 1: THE PROBLEM (Steps 0-2) =====
  // Step 0: "The Knowledge Cutoff"
  {
    explanation: 'LLMs are trained on data up to a specific date — the "training cutoff." Anything after that date is invisible to the model. Recent news, your company data, yesterday\'s reports — all unknown.',
    animationTrigger: 'knowledgeCutoff',
    subtitle: 'The model\'s knowledge is frozen in time.',
  },
  // Step 1: "The Private Data Problem"
  {
    explanation: 'Even within its training period, the LLM has never seen YOUR data. Ask about Q3 sales, internal docs, or private databases — it simply can\'t answer. It has generic knowledge but not YOUR knowledge.',
    animationTrigger: 'privateDataProblem',
    subtitle: 'Generic knowledge, but not YOUR knowledge.',
  },
  // Step 2: "Two Solutions"
  {
    explanation: 'Two powerful patterns solve these limitations. RAG (Retrieval-Augmented Generation) gives the LLM better INPUT by injecting relevant data. Agents give the LLM the ability to ACT by calling tools. First we\'ll learn RAG, then Agents.',
    animationTrigger: 'twoSolutions',
    subtitle: 'RAG = better input. Agents = ability to act.',
  },

  // ===== ACT 2: RAG (Steps 3-7) =====
  // Step 3: "The RAG Idea"
  {
    explanation: 'RAG stands for Retrieval-Augmented Generation. Three steps: Retrieve relevant documents, Augment the prompt with them, then Generate a response. It\'s that simple.',
    animationTrigger: 'ragIdea',
    subtitle: 'Retrieve → Augment → Generate. Three steps.',
  },
  // Step 4: "Step 1 — Retrieve"
  {
    explanation: 'When the user asks a question, you search your knowledge base — PDFs, CSVs, databases, markdown files — for documents relevant to the question. A magnifying glass scanning through your data.',
    animationTrigger: 'ragRetrieve',
    subtitle: 'Search your data for what\'s relevant to the question.',
  },
  // Step 5: "Step 2 — Augment"
  {
    explanation: 'Take those retrieved documents and inject them into the messages array — right alongside the system prompt and user question. Now the LLM has the context it needs, delivered as part of the conversation.',
    animationTrigger: 'ragAugment',
    subtitle: 'Inject retrieved docs into the messages array.',
  },
  // Step 6: "Step 3 — Generate"
  {
    explanation: 'The LLM reads the injected context and generates a grounded answer: "$4.2M, up 18% YoY." Each fact traces back to a source document. No hallucination — the answer is grounded in YOUR data.',
    animationTrigger: 'ragGenerate',
    subtitle: 'Grounded answers backed by real data.',
  },
  // Step 7: "RAG in One Picture"
  {
    explanation: 'The full RAG pipeline: Question → Search → Documents → Inject into Prompt → LLM → Grounded Answer. RAG doesn\'t change the model — it gives the model better input. That\'s the whole idea.',
    animationTrigger: 'ragPipeline',
    subtitle: 'RAG = better input. That\'s the whole idea.',
  },

  // ===== ACT 3: AGENTS (Steps 8-13) =====
  // Step 8: "Beyond Text In, Text Out"
  {
    explanation: 'LLMs know HOW to do many things — book flights, send emails, query databases. But they can\'t actually DO any of them. They\'re stuck producing text. Agents change that.',
    animationTrigger: 'beyondTextInTextOut',
    subtitle: 'Knowing HOW vs being able to DO.',
  },
  // Step 9: "The Tool Call"
  {
    explanation: 'Instead of text, the LLM outputs a structured tool call: { tool: "get_weather", args: { city: "Paris" } }. YOUR application executes it and sends the result back. The LLM decides, you execute.',
    animationTrigger: 'toolCall',
    subtitle: 'The LLM decides WHAT to do. Your code DOES it.',
  },
  // Step 10: "The Agent Loop"
  {
    explanation: 'Agents follow a simple loop: Think (what do I need?) → Decide (which tool?) → Execute (run the tool) → Observe (read the result). Repeat until done, then give the final answer.',
    animationTrigger: 'agentLoop',
    subtitle: 'Think → Decide → Execute → Observe → Repeat.',
  },
  // Step 11: "A Real Example"
  {
    explanation: 'Walk through a real example: User asks about Paris weather. LLM thinks "I need weather data." Makes a tool call: get_weather("Paris"). Gets back "22°C, rain." LLM thinks "I can answer now." Returns the final response.',
    animationTrigger: 'realExample',
    subtitle: 'Six steps from question to grounded answer.',
  },
  // Step 12: "Multi-Step Agents"
  {
    explanation: 'Agents get really powerful with multiple steps. "Plan a trip to Paris" → search flights → pick cheapest → search hotels → check calendar → book. The LLM makes decisions at every branch point.',
    animationTrigger: 'multiStepAgents',
    subtitle: 'Multiple tools, multiple steps, one goal.',
  },
  // Step 13: "What Tools Can Do"
  {
    explanation: 'Tools can do anything your code can do: search the web, execute code, read files, query databases, call APIs, send emails, do math. The LLM is the brain; tools are its hands.',
    animationTrigger: 'whatToolsCanDo',
    subtitle: 'LLM = the brain. Tools = the hands.',
  },

  // ===== ACT 4: THE BIG PICTURE (Steps 14-15) =====
  // Step 14: "RAG + Agents = Maximum Power"
  {
    explanation: 'Here\'s the magic: RAG can be a TOOL inside an agent. The agent decides when to retrieve context, what to search for, and how to use it — combining better input with ability to act.',
    animationTrigger: 'ragPlusAgents',
    subtitle: 'RAG as a tool inside the agent loop.',
  },
  // Step 15: "What You'll Build"
  {
    explanation: 'In this workshop, you\'ll build all of this hands-on. Part 1: API calls and prompt engineering. Part 2: Your first agent with tool calling. Part 3: Multi-tool agents with RAG. Let\'s go!',
    animationTrigger: 'whatYoullBuild',
    subtitle: 'From concepts to working code. Let\'s build!',
  },
];
