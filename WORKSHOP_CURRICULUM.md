# Workshop Visualizer — Curriculum & Teaching Guide

Live site: https://workshop-visualizer-mu.vercel.app · Source: `workshop-visualizer/` · Test plan: `BEGINNER_TEST_PLAN.md`

## The story arc: from zero to teams of AI agents

The course takes someone who has **never touched an LLM API** (explained so a ~12-year-old can follow) to **building teams of
agents with guardrails**:

```
"What even IS this thing?" → "How do I talk to it well?" → "Let me set up and call it myself"
→ "Let me make it reliable" → "Let me give it tools" → "Let me build a team" → "Let me keep it safe"
```

Every lesson has: step-by-step explanations (one idea per step), an animation, a **journey strip** on step 1 ("Last time… / Today…"),
and a **🧠 Quick check** quiz (3 questions) on the last step. Concept lessons end with a **"Try it yourself"** playground.
Code lessons show the Python program line by line (highlighted line, Output and Variables tabs), have 2–3 **"Try different
inputs"** examples, and a **💻 Run it yourself** box with the exact program to download and run.

## The 33 lessons

### Part 0 — Foundations (concept lessons, no code)
| # | Lesson | What it teaches |
|---|---|---|
| 1 | What is an LLM? | Tokens, embeddings, attention, next-token prediction, training, context window |
| 2 | Temperature & Creativity | Probabilities, temperature and top-p (live sliders playground) |
| 3 | Context & Memory | The messages list is the memory; re-sending; growing cost; drop vs summarise |
| 4 | System Prompts | messages[0], persona/format/rules/safety, prompt injection |
| 5 | Writing Good Prompts | Role, task, context, format, examples, limits, delimiters, step by step, iterate |
| 6 | Hallucination | Why it happens, fake citations, 5 ways to fight it (Real-or-Made-up quiz) |
| 7 | RAG | Retrieve → augment → generate (mini search engine playground) |
| 8 | Agents & Tools | Tool calls and the agent loop (agent-run simulator) |

### Part 1 — API Basics (code lessons)
| # | Lesson | Program in the kit |
|---|---|---|
| 9 | Get Set Up: Run AI Code on Your Computer (concept) | Python, venv, API key, .env, cost, `check_setup.py` |
| 10 | Basic API Call | `part1/basic_api.py` |
| 11 | Streaming: The Typing Effect | `part1/streaming.py` |
| 12 | Tokens & Cost in Code | `part1/tokens_cost.py` |
| 13 | System Prompts & Role Playing | `part1/system_prompts.py` |
| 14 | Conversation Loop | `part1/conversation_loop.py` |
| 15 | JSON Output | `part1/json_output.py` |
| 16 | Few-Shot Learning | `part1/few_shot.py` |
| 17 | When Things Go Wrong: Errors & Retries | `part1/errors_retries.py` |
| 18 | Challenge: Restaurant Recommender | `part1/challenge.py` |

### Part 2 — Agents
| # | Lesson | Program |
|---|---|---|
| 19 | Simple Agent: Calculator | `part2/simple_agent.py` |
| 20 | Multi-Function Agent: Math Tutor | `part2/multi_function.py` |

### Part 3 — Advanced Agents
| # | Lesson | Program |
|---|---|---|
| 21 | Multi-Tool Agent: Study Buddy | `part3/multi_tool.py` |
| 22 | Study Buddy Pro | `part3/study_buddy_pro.py` |
| 23 | Code: RAG with Embeddings | `part3/rag_code.py` |
| 24 | Terminal Assistant | `part3/terminal_assistant.py` |
| 25 | Testing Your Agent | `part3/testing_agents.py` |

### Part 4 — Multi-Agent Teams (cast: Rita 🔍, Wally ✍️, Cora 🧐, Max 👑, Milo 🧮, Rosa 🛎️)
| # | Lesson | Program |
|---|---|---|
| 26 | Why a Team of Agents? (concept) | — |
| 27 | Team Shapes: How Agents Work Together (concept) | — |
| 28 | Code: Assembly Line (Researcher → Writer) | `part4/assembly_line.py` |
| 29 | Code: Writer & Critic Loop | `part4/writer_critic.py` |
| 30 | Code: The Boss Agent | `part4/boss_agent.py` |
| 31 | Code: Agents in Parallel | `part4/parallel_agents.py` |
| 32 | Code: A Shared Whiteboard | `part4/shared_memory.py` |
| 33 | Code: Guardrails & Human Approval | `part4/guardrails.py` |

## The course code kit
Download: `/code/ai-course-code.zip` (folder `ai-course/`). It is generated from the lessons themselves (`src/data/runRegistry.ts`,
`src/lib/courseKit.ts`), so the file a student downloads is the program they watched. Contents: `README.md`, `requirements.txt`
(openai, python-dotenv, tiktoken), `.env.example`, `.gitignore`, `run.py` (loads `.env`, runs a lesson file from its folder),
`check_setup.py` (checks the setup, asks before one tiny test call), and one program per code lesson. Run any lesson with
`python run.py partN/<file>.py`.

## Where to add things
- Lesson list and order: `src/data/lessons.ts` · quizzes + journey lines: `src/data/lessonGuides.ts` and `src/data/guides/<id>.ts`
- Concept steps: `src/data/concept-steps/` · code: `src/data/code-snippets/` · traces + variants: `src/data/traces/`
- Run-it info: `src/data/run/<id>.ts` (registered in `src/data/runRegistry.ts`)
- Animations: `src/components/animations/` (shared robot characters in `characters/AgentBot.tsx`)

## Ideas not built yet
- A "short path" (8–10 key steps per lesson) for time-boxed workshops; the full course is ~600 steps.
- Speaker notes / presenter mode, reset-progress button, printable one-page cheat sheet per part.
- Phone/tablet layout (desktop-first today).
- A closing "What real apps use today" lesson (OpenAI Responses API, Agents SDK).
- Evaluation with an AI judge; RAG with a real vector database.
