import { ConceptStep } from '@/stores/conceptStore';

export const whatIsLLMSteps: ConceptStep[] = [
  // ===== ACT 1: THE HOOK (Steps 0-3) =====
  // Step 0: "The AI You Already Know"
  {
    explanation: "You've probably used ChatGPT, Claude, or Gemini: you type a question and an answer appears. In this lesson we'll open the box and see what happens in between.",
    animationTrigger: 'hook',
    subtitle: 'Start with something you already know.',
  },
  // Step 1: "Meet the Family"
  {
    explanation: 'Ask six different AI chatbots the same question and you get six different answers. Each has its own style, but underneath they all work the same way.',
    animationTrigger: 'family',
    subtitle: 'Different names, same basic idea.',
  },
  // Step 2: "They're All LLMs"
  {
    explanation: "All of them are Large Language Models (LLMs). Read the name word by word: it's huge (Large), it learned from text (Language), and it makes predictions (Model).",
    animationTrigger: 'allLLMs',
    subtitle: 'LLM = a huge program that learned from text.',
  },
  // Step 3: "The Big Question"
  {
    explanation: 'So how does an LLM turn your question into an answer that sounds human? We will follow your words through the machine, one step at a time.',
    animationTrigger: 'bigQuestion',
    subtitle: "Let's look under the hood.",
  },

  // ===== ACT 2: THE INPUT (Steps 4-6) =====
  // Step 4: "It Starts With Your Words"
  {
    explanation: "Everything starts with your prompt, the text you type. The model has one job: guess what text should come next, like your phone's autocomplete.",
    animationTrigger: 'yourWords',
    subtitle: 'Your text goes in; the model guesses what comes next.',
  },
  // Step 5: "Breaking Words Into Pieces"
  {
    explanation: 'First, your text is cut into small pieces called tokens, like snapping a LEGO model into bricks. Each brick gets an ID number, because the model works with numbers, not letters.',
    animationTrigger: 'tokenize',
    subtitle: 'Text is split into tokens, and each token becomes a number.',
  },
  // Step 6: "Why Tokens Matter"
  {
    explanation: 'Tokens are how everything is measured: how much you send, how much comes back, and what you pay. You pay per token, so longer prompts cost more.',
    animationTrigger: 'tokensCost',
    subtitle: 'More tokens = more cost.',
  },

  // ===== ACT 3: THE TRANSFORMATION (Steps 7-9) =====
  // Step 7: "Giving Words Meaning: Embeddings"
  {
    explanation: 'Each token is turned into a list of numbers called an embedding. Think of it as GPS coordinates for meaning: it tells the model where the word "lives" in a map of ideas.',
    animationTrigger: 'embeddings',
    subtitle: 'An embedding is a word’s address on a map of meaning.',
  },
  // Step 8: "The Meaning Map"
  {
    explanation: 'On this map, words with similar meanings sit close together: "king" near "queen", "dog" near "cat". "Banana" sits far away from all of them.',
    animationTrigger: 'meaningMap',
    subtitle: 'Similar meanings sit close together.',
  },
  // Step 9: "The Famous Word Math"
  {
    explanation: 'Because meanings are numbers, you can do math with them. "King" minus "man" plus "woman" lands near "queen". Nobody programmed this; it was learned from lots of text.',
    animationTrigger: 'wordMath',
    subtitle: 'King − Man + Woman ≈ Queen.',
  },

  // ===== ACT 4: THE ENGINE (Steps 10-14) =====
  // Step 10: "Paying Attention"
  {
    explanation: '"Bank" means something different in "the river bank" and "the bank approved my loan". Attention lets each word look at the words around it to work out which meaning fits.',
    animationTrigger: 'attention',
    subtitle: 'Attention = reading the whole sentence for context.',
  },
  // Step 11: "The Neural Network"
  {
    explanation: 'Next, the numbers pass through many layers of a neural network, like a factory line. Each layer picks up something deeper, from grammar to meaning to reasoning.',
    animationTrigger: 'neuralNet',
    subtitle: 'Many layers, each understanding a bit more.',
  },
  // Step 12: "The Prediction"
  {
    explanation: 'At the end, the model gives every possible next token a score. For "The capital of France is", "Paris" gets a very high chance and "Lyon" a small one.',
    animationTrigger: 'probabilities',
    subtitle: 'The output is a list of chances for the next word.',
  },
  // Step 13: "One Token at a Time"
  {
    explanation: 'The model writes only ONE token at a time. It picks a token, adds it to the text, and repeats. That is why chatbot answers appear word by word.',
    animationTrigger: 'autoregressive',
    subtitle: 'Predict one token, add it, repeat.',
  },
  // Step 14: "Temperature: The Creativity Dial"
  {
    explanation: 'Temperature decides how the next token is picked. Low means "always take the top choice"; high means "sometimes take a less likely one". That is why the same question can get different answers.',
    animationTrigger: 'temperature',
    subtitle: 'Temperature = how adventurous the word choice is.',
  },

  // ===== ACT 5: THE BACKSTORY (Steps 15-18) =====
  // Step 15: "Training: Reading the Internet"
  {
    explanation: 'Before it can predict anything, the model is trained by reading a huge amount of text: books, websites, and code. It would take a person thousands of lifetimes to read it all.',
    animationTrigger: 'training',
    subtitle: 'Training = reading more text than any person ever could.',
  },
  // Step 16: "What Training Looks Like"
  {
    explanation: 'Training is a guessing game: "The cat sat on the ___". If the guess is wrong, the model adjusts itself a tiny bit. Repeat this trillions of times and it learns language and facts.',
    animationTrigger: 'trainingExamples',
    subtitle: 'It learned everything by guessing the next word.',
  },
  // Step 17: "The Context Window"
  {
    explanation: 'The model can only read a limited amount of text at once, called the context window. Think of a desk that fits only so many pages: anything that falls off, the model cannot see.',
    animationTrigger: 'contextWindow',
    subtitle: 'The model only sees what fits on the desk.',
  },
  // Step 18: "No Memory Between Conversations"
  {
    explanation: 'The model itself remembers nothing between calls. Each request starts fresh. When a chatbot seems to remember, the app is quietly re-sending the earlier messages.',
    animationTrigger: 'noMemory',
    subtitle: 'The model starts from zero every time.',
  },

  // ===== ACT 6: THE AHA MOMENT (Steps 19-20) =====
  // Step 19: "The Full Pipeline"
  {
    explanation: 'Here is the whole journey in one picture: text becomes tokens, tokens get meaning, attention adds context, layers process it, and one next token comes out. Then it loops.',
    animationTrigger: 'fullPipeline',
    subtitle: 'The complete trip from question to answer.',
  },
  // Step 20: "Just Autocomplete? Kind of."
  {
    explanation: "An LLM is a bit like your phone's autocomplete, but trained on vastly more text and far bigger. At that size, new skills like coding and reasoning appear.",
    animationTrigger: 'analogy',
    subtitle: 'Autocomplete, at a giant scale.',
  },

  // ===== ACT 7: WRAP-UP (Steps 21-22) =====
  // Step 21: "What LLMs Can and Can't Do"
  {
    explanation: "On their own, LLMs are great at writing, explaining, and coding. But they can't look things up live, don't remember past chats, and can be wrong. Knowing the limits matters.",
    animationTrigger: 'canAndCant',
    subtitle: 'Know what it can do, and what it cannot.',
  },
  // Step 22: "Try it: Tokenizer + Next Word"
  {
    explanation: 'Type anything and watch it split into tokens. Then click an example and keep clicking bars to build a sentence one token at a time.',
    animationTrigger: 'playground',
    subtitle: 'Text → tokens → chances for the next token → pick one → repeat.',
  },
  // Step 23: "Try it: The Meaning Map"
  {
    explanation: 'Click words on the map to see their closest neighbours. Then switch to "Word math" and pick an equation to watch the arrows move.',
    animationTrigger: 'playground2',
    subtitle: 'Similar meanings sit close; the same direction means the same kind of change.',
  },
  // Step 24: "Key Takeaways"
  {
    explanation: 'What you learned: (1) An LLM predicts the next token, one at a time. (2) Text becomes tokens, then numbers that carry meaning. (3) Temperature controls how adventurous each pick is.',
    animationTrigger: 'takeaways',
    subtitle: 'An LLM is a next-word predictor at huge scale.',
  },
];

export const temperatureSteps: ConceptStep[] = [
  // Step 0: "What is Temperature?"
  {
    explanation: 'For every next word, the model has a list of options with chances. Temperature is a setting that decides how boldly it picks from that list, like how adventurous a chef is.',
    animationTrigger: 'whatIsTemp',
    subtitle: 'Temperature = the creativity dial.',
  },
  // Step 1: "The Probability Distribution"
  {
    explanation: 'For "The capital of France is ___", the model might give "Paris" a very high chance and a few other words tiny chances. Temperature decides how to pick from these.',
    animationTrigger: 'probDistribution',
    subtitle: 'The model always makes a list of chances first.',
  },
  // Step 2: "The Math: Softmax Scaling"
  {
    explanation: 'Under the hood, the model divides its raw scores by the temperature before turning them into chances. A low temperature makes the top word win big; a high one evens things out.',
    animationTrigger: 'softmax',
    subtitle: 'Low temperature sharpens the choice; high temperature flattens it.',
  },
  // Step 3: "Temperature = 0: The Robot"
  {
    explanation: 'At temperature 0, the model picks the most likely word every time, so answers are (almost) the same on each run. Use it for code, math, and facts.',
    animationTrigger: 'temp0',
    subtitle: 'Temperature 0 = predictable and consistent.',
  },
  // Step 4: "Temperature = 0.7: The Sweet Spot"
  {
    explanation: 'Around 0.7, the model usually picks likely words but sometimes surprises you. Many apps choose a value like this for everyday chat: creative, but still sensible.',
    animationTrigger: 'temp07',
    subtitle: 'A middle setting: creative but controlled.',
  },
  // Step 5: "Temperature = 1.5: The Wild Card"
  {
    explanation: 'At 1.5, unlikely words get a real chance, so the text can wander off. Good for brainstorming; bad when you need correct answers.',
    animationTrigger: 'temp15',
    subtitle: 'High temperature = surprising, sometimes nonsense.',
  },
  // Step 6: "Side-by-Side"
  {
    explanation: 'Here is the same prompt at three temperatures. The model and the question are identical; only one number changed, and the answers feel completely different.',
    animationTrigger: 'sideBySide',
    subtitle: 'One prompt, three personalities.',
  },
  // Step 7: "Top-P Sampling"
  {
    explanation: 'Top-P is another dial. Instead of reshaping the chances, it keeps only the most likely words and throws the rest away, like a shortlist.',
    animationTrigger: 'topP',
    subtitle: 'Top-P = only pick from a shortlist of likely words.',
  },
  // Step 8: "Temperature ≠ Quality"
  {
    explanation: 'Temperature cannot fix a bad prompt. A vague prompt at temperature 0 is still confidently vague. A clear prompt matters more than the dial.',
    animationTrigger: 'tempNotQuality',
    subtitle: 'A good prompt matters more than temperature.',
  },
  // Step 9: "Guess the Temperature"
  {
    explanation: 'Try it: three haikus about coding, from the same prompt. Can you tell which came from temperature 0, 0.7, and 1.5? Hint: the plainest one is 0.',
    animationTrigger: 'guessTemp',
    subtitle: 'Which temperature wrote which?',
  },
  // Step 10: "API Differences"
  {
    explanation: "Each provider uses its own scale. OpenAI's goes from 0 to 2 and Anthropic's from 0 to 1; both default to 1.0. Always check the docs for the API you use.",
    animationTrigger: 'apiDifferences',
    subtitle: 'Same idea, different scales. Check the docs.',
  },
  // Step 11: "When to Use Which"
  {
    explanation: 'Match the dial to the job: low for code and facts, medium for chat and summaries, high for stories and brainstorming.',
    animationTrigger: 'whenToUse',
    subtitle: 'Pick the temperature that fits your task.',
  },
  // Step 12: "Try it yourself" playground
  {
    explanation: 'Your turn: pick a prompt, drag the temperature and top-p sliders, and watch the chances reshape. Then press "Sample 10 times" and compare T = 0 with T = 1.5.',
    animationTrigger: 'playground',
    subtitle: 'Low temperature repeats itself; high temperature explores.',
  },
  // Step 13: "Key Takeaways"
  {
    explanation: 'What you learned: (1) Temperature controls how boldly the next word is picked. (2) Low = consistent, high = creative. (3) A clear prompt matters more than the setting.',
    animationTrigger: 'takeaways',
    subtitle: 'One number, a big change in output.',
  },
];

export const contextMemorySteps: ConceptStep[] = [
  // ===== ACT 1: THE BRIDGE (Steps 0-2) =====
  // Step 0: "From Concept to Code"
  {
    explanation: 'When you chat with an AI, it feels like it remembers you: tell it your name and it uses it later. In this lesson we will see how that really works.',
    animationTrigger: 'fromConceptToCode',
    subtitle: 'It feels like memory. How does it work?',
  },
  // Step 1: "The Messages Array"
  {
    explanation: 'Behind every chat is a simple list of messages, like the chat history on your screen. This list is the only "memory" the conversation has.',
    animationTrigger: 'messagesArray',
    subtitle: 'The conversation is just a list of messages.',
  },
  // Step 2: "Three Roles, Three Jobs"
  {
    explanation: 'Each message is labeled with who said it. "system" gives the model its instructions, "user" is the person, and "assistant" is the model’s reply.',
    animationTrigger: 'threeRoles',
    subtitle: 'System instructs, user asks, assistant answers.',
  },

  // ===== ACT 2: THE ILLUSION (Steps 3-6) =====
  // Step 3: "Your First API Call"
  {
    explanation: 'Your first API call sends a short list: a system message and one user question. The model reads it and sends back an answer.',
    animationTrigger: 'firstCall',
    subtitle: 'Send the list, get a reply.',
  },
  // Step 4: "The Response Comes Back"
  {
    explanation: 'You add the reply to your list as an assistant message. But the model itself has already forgotten everything; only your list remembers.',
    animationTrigger: 'responseBack',
    subtitle: 'The model forgets right after it answers.',
  },
  // Step 5: "The Second Call — The Trick"
  {
    explanation: 'For a follow-up question, you send the WHOLE list again: every old message plus the new one. That replay is the whole trick behind chat memory.',
    animationTrigger: 'secondCall',
    subtitle: 'Every call re-sends the full history.',
  },
  // Step 6: "The Growing Cost"
  {
    explanation: 'Because the whole history is re-sent, each call is bigger than the last. You pay per token, so long chats get more expensive with every turn.',
    animationTrigger: 'growingCost',
    subtitle: 'Longer chat = more tokens = more cost.',
  },

  // ===== ACT 3: THE LIMIT (Steps 7-9) =====
  // Step 7: "Hitting the Wall"
  {
    explanation: 'The context window is like a desk that fits only so many pages. As the chat grows, the desk fills up, and eventually nothing more fits.',
    animationTrigger: 'hittingWall',
    subtitle: 'The context window has a limit.',
  },
  // Step 8: "Strategy 1: Drop Old Messages"
  {
    explanation: 'The simplest fix: remove the oldest messages, but keep the system message. You make room, but the model loses what was in those old messages.',
    animationTrigger: 'dropMessages',
    subtitle: 'Drop old messages to make room.',
  },
  // Step 9: "Strategy 2: Summarize + Key Takeaways"
  {
    explanation: 'A smarter fix: ask the model to summarize old messages into one short note, like condensing notes before an exam. Recap: the list is the memory, and you manage its size.',
    animationTrigger: 'summarize',
    subtitle: 'Shrink old messages into a summary.',
  },
];

export const systemPromptSteps: ConceptStep[] = [
  // Step 0: "messages[0]: The System Prompt"
  {
    explanation: 'The system prompt is the first message in the list, messages[0]. The model reads it first on every call, like a job briefing before the work starts.',
    animationTrigger: 'systemPromptZoom',
    subtitle: 'The system prompt is read first, every time.',
  },
  // Step 1: "Anatomy of a System Prompt"
  {
    explanation: 'A good system prompt has clear parts: who the model is (persona), how to answer (format), what to avoid (rules), and what to do when unsure (safety).',
    animationTrigger: 'systemPromptAnatomy',
    subtitle: 'Persona, format, rules, safety.',
  },
  // Step 2: "Same Question, Different Personality"
  {
    explanation: 'Ask "Explain gravity" with three different system prompts: a physicist, a pirate, and a poet. Same model, same question, very different answers.',
    animationTrigger: 'sameQuestionDiffPersonality',
    subtitle: 'Change the system prompt, change the answer.',
  },
  // Step 3: "Real-World System Prompts"
  {
    explanation: 'Real apps use system prompts to give the model a specific job, such as handling refunds, reviewing code, or writing in a set style.',
    animationTrigger: 'realWorldExamples',
    subtitle: 'Each app gives the model its own job description.',
  },
  // Step 4: "What NOT to Put in System Prompts"
  {
    explanation: 'Avoid common mistakes: secrets like API keys, whole manuals, instructions that contradict each other, and empty flattery. They waste tokens or confuse the model.',
    animationTrigger: 'whatNotToDo',
    subtitle: 'Keep secrets and clutter out.',
  },
  // Step 5: "The Cost of System Prompts"
  {
    explanation: 'The system prompt is re-sent on every call, so you pay for it again each time. A shorter system prompt saves tokens on every single message.',
    animationTrigger: 'systemPromptCost',
    subtitle: 'You pay for the system prompt on every call.',
  },
  // Step 6: "Iterating Your System Prompt"
  {
    explanation: 'Treat a system prompt like code: write it, test it, see what goes wrong, and fix it. Your first version is rarely your best.',
    animationTrigger: 'iterating',
    subtitle: 'Write, test, revise, repeat.',
  },
  // Step 7: "System Prompts Across APIs"
  {
    explanation: 'OpenAI puts the system prompt inside the messages list with role "system". Anthropic takes it as a separate "system" setting. Check how your API does it.',
    animationTrigger: 'acrossAPIs',
    subtitle: 'Different APIs, different places for the system prompt.',
  },
  // Step 8: "Prompt Injection Warning"
  {
    explanation: 'A user can type "Ignore all previous instructions", and the model might obey. A system prompt is a guideline, not a lock, so add your own checks in code.',
    animationTrigger: 'promptInjection',
    subtitle: 'System prompts can be bypassed.',
  },
  // Step 9: "Try it yourself" playground
  {
    explanation: 'Build your own system prompt: click persona, format, rule and safety blocks, then pick a question and watch the reply change. Try the "Ignore previous instructions" chip with and without the Safety block.',
    animationTrigger: 'playground',
    subtitle: 'Each block of the system prompt changes the reply.',
  },
  // Step 10: "Key Takeaways"
  {
    explanation: 'What you learned: (1) The system prompt is the first message and sets the rules. (2) Keep it short and clear, and test it. (3) Never rely on it for security.',
    animationTrigger: 'takeaways',
    subtitle: "System prompts shape behavior, but they aren't locks.",
  },
];

export const hallucinationSteps: ConceptStep[] = [
  // Step 0: "What is Hallucination?"
  {
    explanation: 'Sometimes an LLM says something that sounds confident but is simply wrong. This is called a hallucination: made-up information that looks real.',
    animationTrigger: 'whatIsHallucination',
    subtitle: 'Confident, but wrong.',
  },
  // Step 1: "Why Does It Happen?"
  {
    explanation: "The model predicts text that SOUNDS right, not text that it checked. Like a student bluffing on an exam, it writes what fits the pattern even when it doesn't know.",
    animationTrigger: 'whyItHappens',
    subtitle: 'Sounding right is not the same as being right.',
  },
  // Step 2: "Example: Confident but Wrong"
  {
    explanation: 'Ask when the Golden Gate Bridge was finished and a model might say 1936. The real answer is 1937. Small, confident mistakes like this are easy to miss.',
    animationTrigger: 'confidentWrong',
    subtitle: 'Close enough to believe, wrong enough to matter.',
  },
  // Step 3: "Example: Fabricated Citations"
  {
    explanation: 'Ask for sources and a model may invent papers, authors, or court cases that do not exist. Lawyers have been punished for citing fake cases from AI.',
    animationTrigger: 'fakeCitations',
    subtitle: 'Perfect-looking sources that do not exist.',
  },
  // Step 4: "Example: Plausible Nonsense"
  {
    explanation: 'On topics it knows poorly, a model can produce an explanation with all the right jargon and tone, but the content is invented. This kind is the hardest to catch.',
    animationTrigger: 'plausibleNonsense',
    subtitle: 'Sounds like an expert, but it is made up.',
  },
  // Step 5: "The Confidence Problem"
  {
    explanation: 'The model sounds equally sure when it is right and when it is wrong. You cannot tell from the text alone which parts are true.',
    animationTrigger: 'confidenceProblem',
    subtitle: 'Right and wrong answers look the same.',
  },
  // Step 6: "Fix 1: Use RAG"
  {
    explanation: 'Fix 1: give the model the real documents along with the question (this is called RAG). Like an open-book exam, it can copy facts instead of guessing.',
    animationTrigger: 'fixRAG',
    subtitle: 'Give it the facts so it does not guess.',
  },
  // Step 7: "Fix 2: Lower Temperature"
  {
    explanation: 'Fix 2: lower the temperature for factual questions. The model then sticks to its most likely answer, which reduces random wrong picks. It does not make the model know more.',
    animationTrigger: 'fixTemperature',
    subtitle: 'For facts, boring is good.',
  },
  // Step 8: "Fix 3: Say I Don't Know"
  {
    explanation: 'Fix 3: tell the model in the system prompt that "I don\'t know" is allowed. An honest "I don\'t know" is better than a confident wrong answer.',
    animationTrigger: 'fixSayIDontKnow',
    subtitle: '"I don\'t know" can be the best answer.',
  },
  // Step 9: "Fix 4: Verify Sources"
  {
    explanation: 'Fix 4: check every source the AI gives you. If you cannot find the paper or link yourself, treat it as made up.',
    animationTrigger: 'fixVerifySources',
    subtitle: 'Always check the sources yourself.',
  },
  // Step 10: "Fix 5: Draft, Not Truth"
  {
    explanation: 'Fix 5: use AI for drafts, ideas, and learning, not as the final word on legal, medical, or money decisions. Treat it as a helpful assistant, not an oracle.',
    animationTrigger: 'fixDraftNotTruth',
    subtitle: 'AI gives you a draft, not the truth.',
  },
  // Step 11: "When Hallucination is OK"
  {
    explanation: 'For stories, games, or brainstorming, making things up is exactly what you want. The question is always: does accuracy matter here?',
    animationTrigger: 'whenOK',
    subtitle: 'Sometimes making things up is the goal.',
  },
  // Step 12: "Try it yourself": Real or Made-up quiz
  {
    explanation: 'Quiz time: for each AI statement, click Real or Made up, then read why. Some fakes look exactly like real facts or sources.',
    animationTrigger: 'playground',
    subtitle: 'You cannot tell a hallucination by how it sounds.',
  },
  // Step 13: "Try it yourself": grounding on/off
  {
    explanation: 'Pick a question and flip Grounding on and off. With grounding, the model is given a source to quote. Without it, it guesses.',
    animationTrigger: 'playground2',
    subtitle: 'Give the model a source and it can quote instead of guess.',
  },
  // Step 14: "Key Takeaways"
  {
    explanation: 'What you learned: (1) LLMs can be confidently wrong because they predict likely text. (2) Give them real data and allow "I don\'t know". (3) Always verify important facts.',
    animationTrigger: 'takeaways',
    subtitle: 'Never blindly trust AI output.',
  },
];

export const ragSteps: ConceptStep[] = [
  // Step 0: "The Knowledge Cutoff"
  {
    explanation: 'A model only knows what was in its training data, which stops at a certain date. Anything newer, like yesterday’s news, it has never seen.',
    animationTrigger: 'knowledgeCutoff',
    subtitle: "The model's knowledge is frozen in time.",
  },
  // Step 1: "The Private Data Problem"
  {
    explanation: 'The model has also never seen YOUR private data, like company sales numbers or internal documents. It knows the world in general, not your business.',
    animationTrigger: 'privateDataProblem',
    subtitle: 'It knows general things, not your things.',
  },
  // Step 2: "The RAG Idea"
  {
    explanation: 'RAG (Retrieval-Augmented Generation) fixes this in three steps: find the right documents, add them to the prompt, then let the model answer. Think of it as an open-book exam.',
    animationTrigger: 'ragIdea',
    subtitle: 'Find → Add → Answer.',
  },
  // Step 3: "Step 1: Retrieve — Search Your Docs"
  {
    explanation: 'Step 1, Retrieve: when a question comes in, search your own files for the parts that are related to it.',
    animationTrigger: 'ragRetrieve',
    subtitle: 'Search your data for what matters to the question.',
  },
  // Step 4: "How Retrieval Works: Chunking"
  {
    explanation: 'A whole book will not fit in the context window, so you cut documents into small chunks, like index cards. Each card is small enough to hand to the model.',
    animationTrigger: 'chunking',
    subtitle: 'Cut documents into bite-sized pieces.',
  },
  // Step 5: "How Retrieval Works: Vector Search"
  {
    explanation: 'The question and every chunk are turned into embeddings, those "meaning coordinates" from Lesson 1. The chunks closest in meaning to the question are the ones you pick.',
    animationTrigger: 'vectorSearch',
    subtitle: 'Find chunks with the closest meaning.',
  },
  // Step 6: "Step 2: Augment — Before/After"
  {
    explanation: 'Step 2, Augment: paste the chosen chunks into the messages, next to the question. Now the model has the facts right in front of it.',
    animationTrigger: 'ragAugment',
    subtitle: 'Add the found text to the prompt.',
  },
  // Step 7: "The Token Budget Problem"
  {
    explanation: 'The desk is still limited. The system prompt, question, documents, and answer all share the same context window, so add only the most useful chunks.',
    animationTrigger: 'tokenBudget',
    subtitle: 'Everything must fit in the window. Budget it.',
  },
  // Step 8: "Step 3: Generate — Grounded Response"
  {
    explanation: 'Step 3, Generate: the model answers using the documents you gave it. Its facts now come from your data, so it has much less reason to guess.',
    animationTrigger: 'ragGenerate',
    subtitle: 'Answers based on real documents.',
  },
  // Step 9: "RAG vs No RAG"
  {
    explanation: 'Compare the same question with and without RAG. Without it, the model guesses; with it, the model quotes your data. RAG does not make the model smarter; it gives it better input.',
    animationTrigger: 'ragVsNoRag',
    subtitle: 'Better input → better output.',
  },
  // Step 10: "The Full RAG Pipeline"
  {
    explanation: 'The full pipeline: question → search → matching documents → added to the prompt → model → grounded answer. The model itself never changes; only its input does.',
    animationTrigger: 'ragPipeline',
    subtitle: 'RAG = better input, same model.',
  },
  // Step 11: "When RAG Isn't Enough"
  {
    explanation: 'RAG helps a model answer questions. But what if you want it to DO something, like send an email or run code? For that you need agents, the next lesson.',
    animationTrigger: 'ragNotEnough',
    subtitle: 'Reading is not doing.',
  },
  // Step 12: "Try It Yourself"
  {
    explanation: 'Try it: pick a question (or type your own) and watch the handbook chunks get scored and ranked. Move the top-k slider to choose how many chunks go into the prompt, then compare the answers with and without RAG.',
    animationTrigger: 'playground',
    subtitle: 'Find the right chunks, and the model can answer from your data.',
  },
  // Step 13: "Key Takeaways"
  {
    explanation: 'What you learned: (1) RAG = find documents, add them to the prompt, then answer. (2) Documents are chunked and searched by meaning. (3) It reduces guessing by giving the model real data.',
    animationTrigger: 'takeaways',
    subtitle: 'Give the model the right pages, get grounded answers.',
  },
];

export const agentsSteps: ConceptStep[] = [
  // Step 0: "Beyond Text In, Text Out"
  {
    explanation: 'An LLM can explain how to book a flight or send an email, but on its own it can only produce text. Agents let it actually do things.',
    animationTrigger: 'beyondTextInTextOut',
    subtitle: 'Knowing how vs. actually doing.',
  },
  // Step 1: "What is an Agent?"
  {
    explanation: 'An agent is an LLM plus tools plus a loop. The LLM decides what to do, your code does it, and the result goes back to the LLM until the job is finished.',
    animationTrigger: 'whatIsAgent',
    subtitle: 'LLM thinks, your code acts, repeat.',
  },
  // Step 2: "The Tool Call"
  {
    explanation: 'Instead of a normal answer, the LLM can reply with a tool call, like an order slip: "run get_weather for Paris". Your code runs it and sends back the result.',
    animationTrigger: 'toolCall',
    subtitle: 'The LLM asks; your code runs the tool.',
  },
  // Step 3: "The Agent Loop"
  {
    explanation: 'The agent repeats a simple loop: think about what is needed, pick a tool, run it, read the result. When it has enough, it gives the final answer.',
    animationTrigger: 'agentLoop',
    subtitle: 'Think → pick → run → read → repeat.',
  },
  // Step 4: "Real Example: Weather"
  {
    explanation: 'Example: the user asks about the weather in Paris. The LLM asks for get_weather("Paris"), your code returns "22°C, sunny", and the LLM writes the answer from that.',
    animationTrigger: 'realExample',
    subtitle: 'From question to tool to answer.',
  },
  // Step 5: "Real Example: Multi-Step"
  {
    explanation: 'Bigger jobs need several tools in a row. For "plan a trip to Paris", the agent searches flights, then hotels, then checks the calendar, deciding each next step.',
    animationTrigger: 'multiStepAgents',
    subtitle: 'Many tools, many steps, one goal.',
  },
  // Step 6: "What Tools Can Do"
  {
    explanation: 'A tool can be anything your code can do: search the web, run a script, query a database, send an email. The LLM is the brain; tools are its hands.',
    animationTrigger: 'whatToolsCanDo',
    subtitle: 'LLM = brain. Tools = hands.',
  },
  // Step 7: "Tool Design"
  {
    explanation: 'The LLM chooses tools by reading their names and descriptions, like a menu. "get_weather: current weather for a city" is clear; "do_stuff" is not.',
    animationTrigger: 'toolDesign',
    subtitle: 'Clear tool names and descriptions help the LLM choose.',
  },
  // Step 8: "Error Handling"
  {
    explanation: 'Tools can fail, for example when the network is down. If your code sends the error message back, the LLM can retry, try another way, or ask the user.',
    animationTrigger: 'errorHandling',
    subtitle: 'Tools fail. Good agents recover.',
  },
  // Step 9: "When Agents Are Overkill"
  {
    explanation: 'Not every task needs an agent. If one normal API call can do it, like summarizing or translating, skip the agent.',
    animationTrigger: 'whenOverkill',
    subtitle: "If one call works, don't build an agent.",
  },
  // Step 10: "RAG as a Tool"
  {
    explanation: 'RAG can become one of the agent’s tools. The agent then decides by itself when to look something up in your documents.',
    animationTrigger: 'ragPlusAgents',
    subtitle: 'Document search as a tool the agent can use.',
  },
  // Step 11: "What You'll Build"
  {
    explanation: 'In this workshop you will build these step by step: first simple agents with a few tools, then agents that search documents and work with real files.',
    animationTrigger: 'whatYoullBuild',
    subtitle: "From ideas to working code. Let's build!",
  },
  // Step 12: "Try It Yourself"
  {
    explanation: 'Try it: pick a task and watch the agent think, choose a tool, run it and read the result, turn by turn. Turn on "Tool fails" to see how it recovers.',
    animationTrigger: 'playground',
    subtitle: 'Some tasks need several tools, some need none.',
  },
  // Step 13: "Key Takeaways"
  {
    explanation: 'What you learned: (1) Agent = LLM + tools + a loop. (2) The LLM decides; your code does the work. (3) Use an agent only when one API call is not enough.',
    animationTrigger: 'takeaways',
    subtitle: 'Agents turn LLMs from talkers into doers.',
  },
];
