import { ConceptStep } from '@/stores/conceptStore';

export const whatIsLLMSteps: ConceptStep[] = [
  // ===== ACT 1: THE HOOK (Steps 0-3) =====
  // Step 0: "The AI You Already Know"
  {
    explanation: 'You\'ve probably already used one of these — ChatGPT, Claude, Gemini. You type a question, and it streams back an answer. But what\'s actually happening behind the scenes?',
    animationTrigger: 'hook',
    subtitle: 'Let\'s start with something familiar.',
  },
  // Step 1: "Meet the Family" — REDESIGNED
  {
    explanation: 'Ask one question, get six different answers. Each AI model has its own personality and style — but they all share the same underlying technology.',
    animationTrigger: 'family',
    subtitle: 'One question, six different AIs.',
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

  // ===== ACT 4: THE ENGINE (Steps 10-14) — REORDERED =====
  // Step 10: "Paying Attention" — IMPROVED
  {
    explanation: '"Attention" is the mechanism that lets each token look at every other token. Consider "The bank by the river" vs "The bank approved the loan" — the word "bank" means something completely different depending on context. Attention resolves this ambiguity.',
    animationTrigger: 'attention',
    subtitle: 'Same word, different meaning — attention figures it out.',
  },
  // Step 11: "The Neural Network" — IMPROVED
  {
    explanation: 'The tokens flow through a massive neural network — 96+ layers deep. Early layers learn grammar and syntax. Middle layers understand meaning and context. Deep layers handle reasoning and logic. Your brain: ~100 trillion synapses. GPT-4: ~1.8 trillion parameters.',
    animationTrigger: 'neuralNet',
    subtitle: 'Each layer understands something deeper.',
  },
  // Step 12: "The Prediction"
  {
    explanation: 'After all that processing, the network outputs a score for every possible next token — over 100,000 words. "Paris" gets 92%, "Lyon" gets 3%, and so on. The model is guessing, but it\'s guessing really, really well.',
    animationTrigger: 'probabilities',
    subtitle: '"Paris" has 92% — but "Lyon" was also an option!',
  },
  // Step 13: "One Token at a Time" — MOVED UP from 14
  {
    explanation: 'Here\'s the key insight: the model generates just ONE token at a time. It predicts "Paris", adds it to the input, then predicts the next token, and the next. That streaming effect you see in ChatGPT? That\'s tokens appearing one by one.',
    animationTrigger: 'autoregressive',
    subtitle: 'Autoregressive generation: predict → append → repeat.',
  },
  // Step 14: "Temperature: The Creativity Dial" — MOVED DOWN from 13
  {
    explanation: 'Temperature controls how "creative" vs "deterministic" the output is. At temperature 0, it always picks the top word. At 0.7, it\'s balanced. At 1.5, it\'s wild and unpredictable. This is why the same prompt can give different answers.',
    animationTrigger: 'temperature',
    subtitle: 'THAT\'S what the temperature setting does!',
  },

  // ===== ACT 5: THE BACKSTORY (Steps 15-18) =====
  // Step 15: "Training: Reading the Internet" — IMPROVED
  {
    explanation: 'Before it can predict anything, the model needs training. It reads trillions of tokens from books, websites, code, and conversations. If you read 1 book per day, it would take 41,000 YEARS to read GPT-4\'s training data. Training cost: ~$100M and 25,000 GPUs running for months.',
    animationTrigger: 'training',
    subtitle: '41,000 years of reading, compressed into months of GPU time.',
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
  // Step 20: "Just Autocomplete? Kind of." — IMPROVED
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
  // Step 2: "The Math: Softmax Scaling" — NEW
  {
    explanation: 'Here\'s how temperature actually works: the model outputs raw scores (logits), then divides each by the temperature value, then applies softmax to get probabilities. T=0.1 makes the winner 99.99%. T=2.0 flattens everything to near-uniform. It\'s just division!',
    animationTrigger: 'softmax',
    subtitle: 'logits / temperature → softmax → probabilities. Simple math, huge impact.',
  },
  // Step 3: "Temperature = 0: The Robot"
  {
    explanation: 'At temperature 0, the model ALWAYS picks the highest-probability token. Ask it 100 times, get the same answer 100 times. Perfect for: code generation, math, factual Q&A — anywhere you need consistency.',
    animationTrigger: 'temp0',
    subtitle: 'Deterministic. Predictable. Boring — but reliable.',
  },
  // Step 4: "Temperature = 0.7: The Sweet Spot"
  {
    explanation: 'At temperature 0.7 (the default for most APIs), the model usually picks high-probability tokens but sometimes surprises you. It\'s creative enough to be interesting, predictable enough to be useful. This is what ChatGPT uses by default.',
    animationTrigger: 'temp07',
    subtitle: 'The Goldilocks zone — creative but controlled.',
  },
  // Step 5: "Temperature = 1.5: The Wild Card"
  {
    explanation: 'At temperature 1.5, low-probability tokens get a real chance. The model might say "Paris" — or it might go completely off-script. Great for brainstorming and creative writing, terrible for anything requiring accuracy.',
    animationTrigger: 'temp15',
    subtitle: 'Expect the unexpected. Sometimes brilliant, sometimes nonsense.',
  },
  // Step 6: "Side-by-Side: Same Prompt, Three Temperatures"
  {
    explanation: 'Watch the same prompt generate three completely different responses. Temperature 0 gives a textbook answer. Temperature 0.7 adds flair. Temperature 1.5 goes wild. Same model, same training, different creativity.',
    animationTrigger: 'sideBySide',
    subtitle: 'One prompt, three personalities — all from changing a single number.',
  },
  // Step 7: "Top-P Sampling" — NEW
  {
    explanation: 'Top-P (nucleus sampling) is an alternative to temperature. Instead of flattening the distribution, it cuts off low-probability tokens entirely. top_p=0.9 means "only consider tokens whose cumulative probability reaches 90%." Everything below the line is eliminated.',
    animationTrigger: 'topP',
    subtitle: 'Temperature reshapes probabilities. Top-P cuts off the tail.',
  },
  // Step 8: "Temperature ≠ Quality" — NEW
  {
    explanation: 'Low temp + bad prompt = confidently wrong. High temp + good prompt = creative and useful. The insight: prompt quality matters MORE than temperature. A well-crafted prompt at T=0.7 beats a vague prompt at any temperature.',
    animationTrigger: 'tempNotQuality',
    subtitle: 'The prompt matters more than the temperature setting.',
  },
  // Step 9: "Guess the Temperature" — NEW
  {
    explanation: 'Can you tell which response was generated at T=0, T=0.7, and T=1.5? Same prompt: "Write a haiku about coding." The mechanical one is T=0, the balanced one is T=0.7, and the wild one is T=1.5.',
    animationTrigger: 'guessTemp',
    subtitle: 'Test your intuition — which temperature produced which?',
  },
  // Step 10: "API Differences" — NEW
  {
    explanation: 'Different APIs use different temperature scales. OpenAI: 0-2 (default 1.0). Anthropic: 0-1 (default 1.0). Google Gemini: 0-1. Same concept, different ranges — always check the docs for the API you\'re using.',
    animationTrigger: 'apiDifferences',
    subtitle: 'Same concept, different scales. Always check docs.',
  },
  // Step 11: "When to Use Which"
  {
    explanation: 'Low temperature (0-0.3): code, math, data extraction, factual answers. Medium (0.5-0.8): general chat, summaries, explanations. High (1.0-1.5): creative writing, brainstorming, poetry, character dialogue. Match temperature to your task!',
    animationTrigger: 'whenToUse',
    subtitle: 'The right temperature depends on what you\'re building.',
  },
  // Step 12: "Key Takeaways"
  {
    explanation: 'Remember: (1) Temperature controls randomness in token selection via softmax scaling. (2) 0 = deterministic, always the same. (3) 0.7 = balanced default. (4) Top-P is an alternative that cuts off the tail. (5) Prompt quality matters more than temperature. Match temperature to your use case!',
    animationTrigger: 'takeaways',
    subtitle: 'One number, massive impact on output quality.',
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
  // Step 6: "The Growing Cost" — IMPROVED
  {
    explanation: 'Each API call sends more tokens than the last. Call 1: ~85 tokens. Call 5: ~1,200 tokens. Call 20: ~12,000 tokens. Real-world impact: a 20-message GPT-4 chat costs ~$0.36. A customer support bot handling 1,000 chats/day = $360/day = $10,800/month.',
    animationTrigger: 'growingCost',
    subtitle: 'More turns = more tokens = more cost. $10,800/month for a busy bot.',
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
  // Step 9: "Strategy 2: Summarize + Key Takeaways" — MERGED
  {
    explanation: 'A smarter approach: use the LLM itself to summarize old messages into a single compact message. Before: 2,400 tokens. After: 380 tokens. Key takeaways: (1) The messages array IS the memory. (2) Every call re-sends everything. (3) Cost grows per turn. (4) Drop or summarize when full. Now you can build it yourself!',
    animationTrigger: 'summarize',
    subtitle: 'Compress old context instead of losing it.',
  },
];

export const systemPromptSteps: ConceptStep[] = [
  // Step 0: "messages[0]: The System Prompt" — FROM CONTEXT
  {
    explanation: 'The system prompt is always messages[0] — the first element. It\'s read by the model before anything else, on every single call. It sets the stage for everything that follows.',
    animationTrigger: 'systemPromptZoom',
    subtitle: 'messages[0] — read first, every time.',
  },
  // Step 1: "Anatomy of a System Prompt" — IMPROVED
  {
    explanation: 'A great system prompt has labeled parts: PERSONA ("You are a senior Python developer"), FORMAT ("Always respond with code first, then explanation"), RULES ("Never use deprecated syntax"), SAFETY ("If unsure, say so"). Each line shapes the response differently.',
    animationTrigger: 'systemPromptAnatomy',
    subtitle: 'Persona / Format / Rules / Safety — four building blocks.',
  },
  // Step 2: "Same Question, Different Personality" — FROM CONTEXT
  {
    explanation: 'Watch the power of the system prompt: ask "Explain gravity" to three different personas — a physicist, a pirate, and a poet. Same model, same question, wildly different answers.',
    animationTrigger: 'sameQuestionDiffPersonality',
    subtitle: 'The system prompt is your most powerful lever.',
  },
  // Step 3: "Real-World System Prompts" — NEW
  {
    explanation: 'Real examples: (1) Customer service: "You handle refund requests. Be empathetic. Never promise what you can\'t deliver." (2) Code reviewer: "Review code for bugs, security issues. Use severity labels." (3) Creative writer: "Write in the style of Hemingway. Short sentences. No adjectives."',
    animationTrigger: 'realWorldExamples',
    subtitle: 'Three real system prompts from production apps.',
  },
  // Step 4: "What NOT to Put in System Prompts" — NEW
  {
    explanation: 'Common mistakes: (1) API keys or secrets — they\'re in the prompt, not secure. (2) Entire manuals — wastes tokens. (3) Contradicting instructions — "be concise" + "explain thoroughly." (4) Flattery — "You are the best AI ever" doesn\'t help performance.',
    animationTrigger: 'whatNotToDo',
    subtitle: 'Four mistakes that waste tokens or break behavior.',
  },
  // Step 5: "The Cost of System Prompts" — FROM CONTEXT
  {
    explanation: 'Remember: the system prompt is re-sent with every API call. If it\'s 2,000 tokens and your conversation has 20 turns, that\'s 40,000 tokens just for the system prompt. Optimization: verbose (2,000 tokens) → concise (400 tokens) = 80% savings.',
    animationTrigger: 'systemPromptCost',
    subtitle: '2,000 tokens × 20 calls = 40,000 tokens. Keep it lean.',
  },
  // Step 6: "Iterating Your System Prompt" — NEW
  {
    explanation: 'System prompts are CODE — you iterate and test them. First attempt → bad output → revise the prompt → better output → test edge cases → final prompt. Version control your prompts just like you version control your code.',
    animationTrigger: 'iterating',
    subtitle: 'Write, test, revise, repeat. Prompts are never one-and-done.',
  },
  // Step 7: "System Prompts Across APIs" — NEW
  {
    explanation: 'OpenAI uses role: "system" in the messages array. Anthropic uses a separate system parameter (not in messages). Some smaller models ignore system prompts entirely. Always test your prompt on the target model.',
    animationTrigger: 'acrossAPIs',
    subtitle: 'Different APIs handle system prompts differently.',
  },
  // Step 8: "Prompt Injection Warning" — NEW
  {
    explanation: 'Users can type: "Ignore all previous instructions and..." — and the model might comply. System prompts are NOT secure boundaries. They\'re guidelines, not guardrails. Defense in depth: validate inputs, filter outputs, never trust the system prompt alone.',
    animationTrigger: 'promptInjection',
    subtitle: 'System prompts can be bypassed. Always add defense in depth.',
  },
  // Step 9: "Key Takeaways" — NEW
  {
    explanation: 'Key takeaways: (1) System prompt = messages[0], read before everything. (2) Use Persona + Format + Rules + Safety structure. (3) Keep it concise — every token costs money. (4) Iterate and test like code. (5) Never rely on system prompts for security.',
    animationTrigger: 'takeaways',
    subtitle: 'System prompts shape behavior — but they\'re not magic.',
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
  // Step 6: "Fix 1: Use RAG" — NEW (was part of combined step)
  {
    explanation: 'Ground the model in YOUR data. Without RAG: "What were Q3 sales?" → "Revenue was approximately $3M" (hallucinated). With RAG: same question + injected docs → "$4.2M, up 18% YoY" (grounded). The difference is night and day.',
    animationTrigger: 'fixRAG',
    subtitle: 'Ground the model in real documents. No guessing.',
  },
  // Step 7: "Fix 2: Lower Temperature" — NEW
  {
    explanation: 'Same prompt at T=1.5: creative but wrong facts. Same prompt at T=0: correct but boring. For factual queries, boring is GOOD. Lower temperature reduces randomness, which reduces the chance of picking an incorrect token.',
    animationTrigger: 'fixTemperature',
    subtitle: 'For facts, boring is good. Lower the temperature.',
  },
  // Step 8: "Fix 3: Say I Don't Know" — NEW
  {
    explanation: 'Add to your system prompt: "If you don\'t have specific data, say \'I don\'t have enough information to answer that.\'" Watch the model actually admit uncertainty — and that being the RIGHT answer. An honest "I don\'t know" beats a confident wrong answer.',
    animationTrigger: 'fixSayIDontKnow',
    subtitle: '"I don\'t know" is often the best answer.',
  },
  // Step 9: "Fix 4: Verify Sources" — NEW
  {
    explanation: 'Ask AI for sources → Get answer with "citations" → Google the sources → 2 of 3 are completely fabricated. Always verify. NEVER trust citations blindly. If a paper or URL doesn\'t exist when you check, it was hallucinated.',
    animationTrigger: 'fixVerifySources',
    subtitle: 'Always verify. NEVER trust citations blindly.',
  },
  // Step 10: "Fix 5: Draft, Not Truth" — NEW
  {
    explanation: 'Use AI FOR: brainstorming, first drafts, code scaffolding, summaries, learning new topics. DON\'T USE AI FOR: legal advice, medical diagnosis, financial decisions, citing specific facts without verification. The key distinction: AI as assistant, not oracle.',
    animationTrigger: 'fixDraftNotTruth',
    subtitle: 'AI is a drafting tool, not a source of truth.',
  },
  // Step 11: "When Hallucination is OK" — NEW
  {
    explanation: 'Creative writing? Hallucination IS the feature. Brainstorming? You WANT unexpected ideas. World-building for games? The wilder the better. The key: know when accuracy matters and when creativity matters. Context determines whether hallucination is a bug or a feature.',
    animationTrigger: 'whenOK',
    subtitle: 'Sometimes "making things up" is exactly what you want.',
  },
  // Step 12: "Key Takeaways"
  {
    explanation: 'Remember: (1) Hallucination = confident wrong answers. (2) It happens because LLMs predict patterns, not truth. (3) Five fixes: RAG, lower temp, "say I don\'t know", verify sources, treat as draft. (4) Know when accuracy matters vs when creativity matters. Trust but verify!',
    animationTrigger: 'takeaways',
    subtitle: 'The most important lesson: never blindly trust AI output.',
  },
];

export const ragSteps: ConceptStep[] = [
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
  // Step 2: "The RAG Idea"
  {
    explanation: 'RAG stands for Retrieval-Augmented Generation. Three steps: Retrieve relevant documents, Augment the prompt with them, then Generate a response. It\'s that simple.',
    animationTrigger: 'ragIdea',
    subtitle: 'Retrieve → Augment → Generate. Three steps.',
  },
  // Step 3: "Step 1: Retrieve — Search Your Docs"
  {
    explanation: 'When the user asks a question, you search your knowledge base — PDFs, CSVs, databases, markdown files — for documents relevant to the question. A magnifying glass scanning through your data.',
    animationTrigger: 'ragRetrieve',
    subtitle: 'Search your data for what\'s relevant to the question.',
  },
  // Step 4: "How Retrieval Works: Chunking" — NEW
  {
    explanation: 'You can\'t feed a 100-page document into the context window. So you split it into overlapping chunks of ~500 tokens each. Like cutting a book into index cards. Each chunk is small enough to inject into a prompt.',
    animationTrigger: 'chunking',
    subtitle: 'Split documents into bite-sized pieces.',
  },
  // Step 5: "How Retrieval Works: Vector Search" — NEW
  {
    explanation: 'Your question "What were Q3 sales?" gets embedded into a vector. Your document chunks are also embedded. You find the nearest neighbors in vector space — the chunks most semantically similar to the question. Same embedding concept from Lesson 1, applied to search.',
    animationTrigger: 'vectorSearch',
    subtitle: 'Same embeddings from Lesson 1, now used for search.',
  },
  // Step 6: "Step 2: Augment — Before/After"
  {
    explanation: 'Take those retrieved documents and inject them into the messages array — right alongside the system prompt and user question. Before: just the question. After: question + relevant context. The LLM now has the data it needs.',
    animationTrigger: 'ragAugment',
    subtitle: 'Inject retrieved docs into the messages array.',
  },
  // Step 7: "The Token Budget Problem" — NEW
  {
    explanation: 'Context window is 8K tokens. System prompt: 500. Your question: 100. That leaves 7,400 for documents + response. Inject too much context → no room for the answer. You must budget your tokens carefully.',
    animationTrigger: 'tokenBudget',
    subtitle: 'Context window is finite — budget your tokens.',
  },
  // Step 8: "Step 3: Generate — Grounded Response"
  {
    explanation: 'The LLM reads the injected context and generates a grounded answer: "$4.2M, up 18% YoY." Each fact traces back to a source document. No hallucination — the answer is grounded in YOUR data.',
    animationTrigger: 'ragGenerate',
    subtitle: 'Grounded answers backed by real data.',
  },
  // Step 9: "RAG vs No RAG" — NEW
  {
    explanation: 'Same question answered with and without RAG. Without: "Revenue was approximately $3M" (hallucinated, wrong). With: "$4.2M, up 18% YoY" (grounded, correct). RAG doesn\'t make the model smarter — it gives it better input.',
    animationTrigger: 'ragVsNoRag',
    subtitle: 'Better input → better output. That\'s the whole idea.',
  },
  // Step 10: "The Full RAG Pipeline"
  {
    explanation: 'The full RAG pipeline: Question → Search → Documents → Inject into Prompt → LLM → Grounded Answer. RAG doesn\'t change the model — it gives the model better input. That\'s the whole idea.',
    animationTrigger: 'ragPipeline',
    subtitle: 'RAG = better input. That\'s the whole idea.',
  },
  // Step 11: "When RAG Isn't Enough" — NEW
  {
    explanation: 'RAG answers questions about documents. But what if you need to BOOK a flight, SEND an email, RUN code? You need something more. You need the LLM to take ACTION in the real world. You need... Agents.',
    animationTrigger: 'ragNotEnough',
    subtitle: 'Reading documents is great. But sometimes you need to DO things.',
  },
  // Step 12: "Key Takeaways"
  {
    explanation: 'Key takeaways: (1) RAG = Retrieve + Augment + Generate. (2) Split documents into chunks, search with vectors. (3) Inject relevant chunks into the messages array. (4) Budget your tokens carefully. (5) RAG grounds the model in YOUR data, reducing hallucination.',
    animationTrigger: 'takeaways',
    subtitle: 'RAG: give the model the right context, get grounded answers.',
  },
];

export const agentsSteps: ConceptStep[] = [
  // Step 0: "Beyond Text In, Text Out"
  {
    explanation: 'LLMs know HOW to do many things — book flights, send emails, query databases. But they can\'t actually DO any of them. They\'re stuck producing text. Agents change that.',
    animationTrigger: 'beyondTextInTextOut',
    subtitle: 'Knowing HOW vs being able to DO.',
  },
  // Step 1: "What is an Agent?" — NEW
  {
    explanation: 'An agent = LLM + Tools + A Loop. The LLM THINKS about what to do next. Your code ACTS by running the chosen tool. The result goes back to the LLM. Repeat until done. Three simple components working together.',
    animationTrigger: 'whatIsAgent',
    subtitle: 'LLM thinks. Your code acts. Loop until done.',
  },
  // Step 2: "The Tool Call"
  {
    explanation: 'Instead of text, the LLM outputs a structured tool call: { tool: "get_weather", args: { city: "Paris" } }. YOUR application executes it and sends the result back. The LLM decides, you execute.',
    animationTrigger: 'toolCall',
    subtitle: 'The LLM decides WHAT to do. Your code DOES it.',
  },
  // Step 3: "The Agent Loop"
  {
    explanation: 'Agents follow a simple loop: Think (what do I need?) → Decide (which tool?) → Execute (run the tool) → Observe (read the result). Repeat until done, then give the final answer.',
    animationTrigger: 'agentLoop',
    subtitle: 'Think → Decide → Execute → Observe → Repeat.',
  },
  // Step 4: "Real Example: Weather"
  {
    explanation: 'Walk through a real example: User asks about Paris weather. LLM thinks "I need weather data." Makes a tool call: get_weather("Paris"). Gets back "22°C, rain." LLM thinks "I can answer now." Returns the final response.',
    animationTrigger: 'realExample',
    subtitle: 'Six steps from question to grounded answer.',
  },
  // Step 5: "Real Example: Multi-Step"
  {
    explanation: 'Agents get really powerful with multiple steps. "Plan a trip to Paris" → search flights → pick cheapest → search hotels → check calendar → book. The LLM makes decisions at every branch point.',
    animationTrigger: 'multiStepAgents',
    subtitle: 'Multiple tools, multiple steps, one goal.',
  },
  // Step 6: "What Tools Can Do" — IMPROVED
  {
    explanation: 'Tools can do anything your code can do. Search: "Googled \'flights to Paris March\'". Code execution: "Ran python analyze.py". Database: "SELECT revenue FROM sales WHERE quarter=\'Q3\'". Email: "Sent confirmation to user@email.com". The LLM is the brain; tools are its hands.',
    animationTrigger: 'whatToolsCanDo',
    subtitle: 'LLM = the brain. Tools = the hands.',
  },
  // Step 7: "Tool Design" — NEW
  {
    explanation: 'Good tool name: get_weather. Bad: do_stuff. Good description: "Get current weather for a city." The LLM reads your tool descriptions to decide WHEN to use each tool. Clear names and descriptions = better tool selection.',
    animationTrigger: 'toolDesign',
    subtitle: 'The LLM reads your descriptions to choose tools. Be clear.',
  },
  // Step 8: "Error Handling" — NEW
  {
    explanation: 'What if the tool fails? Network timeout, file not found, API rate limit. Your agent needs to handle errors gracefully. The tool returns an error message → the LLM reads it → decides to retry, try a different approach, or ask the user for help.',
    animationTrigger: 'errorHandling',
    subtitle: 'Tools fail. Good agents recover gracefully.',
  },
  // Step 9: "When Agents Are Overkill" — NEW
  {
    explanation: 'Not everything needs an agent. Simple summary? → direct API call. Translate text? → direct API call. Need real-time data or multi-step actions? → agent. Think of it as: if one API call gets the answer, skip the agent overhead.',
    animationTrigger: 'whenOverkill',
    subtitle: 'If one API call works, don\'t build an agent.',
  },
  // Step 10: "RAG as a Tool"
  {
    explanation: 'Here\'s the magic: RAG can be a TOOL inside an agent. The agent decides when to retrieve context, what to search for, and how to use it — combining better input with ability to act.',
    animationTrigger: 'ragPlusAgents',
    subtitle: 'RAG as a tool inside the agent loop.',
  },
  // Step 11: "What You'll Build"
  {
    explanation: 'In this workshop, you\'ll build all of this hands-on. Part 1: API calls and prompt engineering. Part 2: Your first agent with tool calling. Part 3: Multi-tool agents with RAG. Let\'s go!',
    animationTrigger: 'whatYoullBuild',
    subtitle: 'From concepts to working code. Let\'s build!',
  },
  // Step 12: "Key Takeaways"
  {
    explanation: 'Key takeaways: (1) Agent = LLM + Tools + Loop. (2) LLM thinks, your code acts. (3) Design tools with clear names and descriptions. (4) Handle errors gracefully. (5) Don\'t use agents when a simple API call works. (6) RAG can be a tool inside an agent.',
    animationTrigger: 'takeaways',
    subtitle: 'Agents turn LLMs from talkers into doers.',
  },
];
