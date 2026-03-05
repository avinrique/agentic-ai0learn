# Workshop Visualizer — Curriculum & Teaching Guide

## The Story Arc: From Zero to Building AI Agents

This workshop takes someone who has **never touched an LLM API** and walks them through to **building autonomous agents that run terminal commands**. The journey follows a clear narrative arc:

```
"What even IS this thing?" → "How does it work inside?" → "Let me call it myself"
→ "Let me make it smart" → "Let me give it tools" → "Let me set it free"
```

---

## Current Curriculum (15 Lessons)

### Part 0: Foundations — "What's happening behind the curtain?" (5 concept lessons)

These are **visual, animated concept lessons** with no code. They build the mental model a student needs before writing a single line. Each lesson has step-by-step animations with explanations.

| # | Lesson | Steps | What It Teaches | Status |
|---|--------|-------|-----------------|--------|
| 1 | **What is an LLM?** | 22 | Token prediction, embeddings, attention, neural nets, training, context window | Done — most thorough lesson |
| 2 | **Context & Memory** | 15 | Messages array, 3 roles, API call mechanics, re-sending, growing cost, system prompt anatomy | Done |
| 3 | **Temperature & Creativity** | 8 | Probability distributions, temp=0/0.7/1.5, side-by-side comparison, use cases | Done (NEW) |
| 4 | **Hallucination** | 8 | What/why hallucination, fake citations, plausible nonsense, confidence problem, reduction strategies | Done (NEW) |
| 5 | **RAG & Agents** | 16 | Knowledge cutoff, RAG pipeline (retrieve/augment/generate), tool calls, agent loop, multi-step agents | Done |

**Teaching flow:** Lesson 1 gives the "how does it work" foundation. Lesson 2 shows "how do I interact with it programmatically." Lessons 3-4 cover critical gotchas (temperature tuning, not trusting output blindly). Lesson 5 previews the advanced patterns they'll build.

---

### Part 1: API Basics — "Let me call it myself" (5 tracer lessons)

These are **code tracer lessons** with Python code on the right, step-by-step execution, variable inspector, and console output. Students see code execute line by line.

| # | Lesson | What It Teaches | Status |
|---|--------|-----------------|--------|
| 6 | **Basic API Call** | First `openai.chat.completions.create()`, messages array, reading the response | Done |
| 7 | **System Prompts & Role Playing** | `system` role, personality control, how system prompt shapes output | Done |
| 8 | **JSON Output** | `response_format={"type": "json_object"}`, parsing structured output | Done |
| 9 | **Few-Shot Learning** | Teaching by example, providing input/output pairs in messages | Done |
| 10 | **Challenge: Restaurant Recommender** | Combine all Part 1 skills into one project | Done |

**Teaching flow:** Each lesson builds directly on the previous. You can't do system prompts without understanding the basic API call. You can't do structured output without understanding the message format.

---

### Part 2: Agents — "Let me give it tools" (2 tracer lessons)

| # | Lesson | What It Teaches | Status |
|---|--------|-----------------|--------|
| 11 | **Simple Agent: Calculator** | First tool definition, `tool_choice`, parsing tool calls, executing, returning results | Done |
| 12 | **Multi-Function Agent: Math Tutor** | Multiple tools, the agent loop (think → decide → execute → observe → repeat) | Done |

---

### Part 3: Advanced Agents — "Let me set it free" (3 tracer lessons)

| # | Lesson | What It Teaches | Status |
|---|--------|-----------------|--------|
| 13 | **Multi-Tool Agent: Study Buddy** | Calculator + knowledge lookup, choosing between tools | Done |
| 14 | **Study Buddy Pro** | 7 tools including percentage and simple interest, complex multi-step reasoning | Done |
| 15 | **Terminal Assistant** | Fully autonomous agent: runs commands, reads/writes files, shell execution | Done |

---

## Alignment Analysis: Does the Teaching Flow Make Sense?

### What's STRONG

1. **Part 0 → Part 1 bridge is excellent.** The concept lessons perfectly set up the code lessons. By the time students see `messages = [{"role": "system", ...}]` in code, they've already seen the messages array animated 50+ times.

2. **Progressive complexity works.** Each lesson truly builds on the last. Basic API → System Prompts → JSON → Few-Shot → Challenge → Simple Agent → Multi-Agent → Terminal. No jumps.

3. **Visual-first approach.** Starting with animations before code removes the "I don't know what this code is doing" barrier. Students arrive at code with a mental model already in place.

4. **Temperature & Hallucination fill critical gaps.** Before these were added, students would learn HOW to call the API without understanding WHY outputs vary or when to NOT trust them. Now they know.

### What's WEAK / MISSING

#### Gap 1: No "Prompt Engineering" Dedicated Lesson
**Problem:** Students learn system prompts and few-shot, but there's no dedicated visual lesson on **prompt engineering patterns** — chain-of-thought, step-by-step reasoning, role prompting, delimiter usage, output formatting tricks.
**Where it should go:** Part 0, between Hallucination and RAG & Agents (Lesson 5).
**Priority:** HIGH — this is the most practical skill for day-to-day LLM usage.

#### Gap 2: No "Streaming" Lesson
**Problem:** Every real-world app streams responses. The typing effect students see in ChatGPT is streaming. Currently no lesson covers `stream=True`, reading chunks, or displaying partial responses.
**Where it should go:** Part 1, after Basic API Call (Lesson 7).
**Priority:** MEDIUM — important for real apps but not blocking for understanding.

#### Gap 3: No "Conversation Loop" Lesson
**Problem:** Part 1 lessons show single API calls. There's no lesson showing a **multi-turn conversation loop** — the actual pattern from Context & Memory (Lesson 2) implemented in code: send messages → get response → append → send again.
**Where it should go:** Part 1, after System Prompts (Lesson 8).
**Priority:** HIGH — bridges the gap between "I can make one call" and "I can build a chatbot."

#### Gap 4: No "Error Handling & Rate Limits" Lesson
**Problem:** Real API usage hits rate limits, timeouts, and 4xx/5xx errors. Students have zero exposure to handling these gracefully.
**Where it should go:** Part 1 or early Part 2.
**Priority:** MEDIUM — important for production but not for learning concepts.

#### Gap 5: No "Cost & Token Counting" Practical Lesson
**Problem:** Lesson 2 shows cost conceptually (growing bar chart) and the LLM lesson explains tokens, but there's no code lesson showing `response.usage.total_tokens` and calculating actual cost.
**Where it should go:** Part 1, after Basic API Call.
**Priority:** LOW — nice to have, not blocking.

#### Gap 6: Part 2 → Part 3 Jump is Subtle
**Problem:** Part 2 has 2 lessons, Part 3 has 3. The difference between "Agents" and "Advanced Agents" isn't that clear. Study Buddy (Part 3) isn't dramatically more complex than Math Tutor (Part 2).
**Suggestion:** Either merge into one part or make Part 3 distinctly harder (add RAG as a tool, add multi-agent systems, add memory/state).

#### Gap 7: No "Embeddings & Vector Search" Practical Lesson
**Problem:** RAG is taught conceptually in Part 0, but there's no code lesson implementing the embedding + vector search + retrieval pipeline.
**Where it should go:** Part 3, as the capstone before Terminal Assistant.
**Priority:** MEDIUM-HIGH — RAG is one of the most in-demand patterns.

#### Gap 8: No "Evaluation & Testing" Lesson
**Problem:** Students build agents but never learn to evaluate if they're working correctly — assertion testing, golden datasets, automated evaluation.
**Where it should go:** End of Part 3 or as a new Part 4.
**Priority:** LOW for a workshop, HIGH for production use.

---

## Recommended New Teaching Order

If all gaps were filled, the ideal curriculum would be:

```
PART 0: Foundations (Visual Concepts)
  1. What is an LLM?          ← existing
  2. Context & Memory          ← existing
  3. Temperature & Creativity  ← existing (NEW)
  4. Hallucination             ← existing (NEW)
  5. Prompt Engineering        ← TO BUILD (patterns, chain-of-thought, delimiters)
  6. RAG & Agents              ← existing

PART 1: API Basics (Code Tracers)
  7.  Basic API Call            ← existing
  8.  Streaming Responses       ← TO BUILD
  9.  System Prompts            ← existing
  10. Conversation Loop         ← TO BUILD (multi-turn chatbot)
  11. JSON Output               ← existing
  12. Few-Shot Learning         ← existing
  13. Challenge: Restaurant     ← existing

PART 2: Tool Use & Agents (Code Tracers)
  14. Simple Agent: Calculator  ← existing
  15. Multi-Function Agent      ← existing
  16. Multi-Tool Agent          ← existing (moved from Part 3)

PART 3: Advanced Patterns (Code Tracers)
  17. Study Buddy Pro           ← existing
  18. RAG Implementation        ← TO BUILD (embeddings + vector search + retrieval)
  19. Terminal Assistant         ← existing
  20. Evaluation & Testing      ← TO BUILD (optional capstone)
```

---

## Features & UX

### Currently Available
- Step-by-step animated concept lessons (Part 0)
- Line-by-line code tracer with variable inspector (Part 1-3)
- Auto-play with configurable speed
- Collapsible sidebar navigation
- Resizable panels
- **Fullscreen mode** (press `F` or click button) — hides sidebar, compacts header, maximizes animation space
- Color-coded lesson numbering (1-15)
- Home page with part overview cards

### Would Be Nice to Have
- **Keyboard shortcuts** — Left/Right arrow for prev/next step, Space for play/pause
- **Progress persistence** — Remember which step the user was on (localStorage)
- **Dark/light theme toggle** — Currently dark-only
- **Mobile responsive** — Currently desktop-only layout
- **Export/share** — Generate a link to a specific step for classroom sharing
- **Speaker notes** — Hidden notes for the teacher/presenter (different from student explanations)
- **Quiz/checkpoint** — At the end of each Part, a quick check to verify understanding

---

## Summary

The workshop is **well-structured and coherent**. The biggest teaching gaps are:

1. **Prompt Engineering** (high priority) — the most practical daily skill
2. **Conversation Loop** (high priority) — bridges single-call to multi-turn
3. **RAG Implementation** (medium-high) — most in-demand production pattern
4. **Streaming** (medium) — every real app uses this

The visual-first approach (Part 0 concepts → Part 1+ code) is the strongest pedagogical decision. Students arrive at code already understanding what's happening. The new Temperature and Hallucination lessons fill critical trust/tuning gaps that were previously missing.

The fullscreen mode makes the animations suitable for classroom projection — the teacher can press `F` and the entire screen becomes the teaching canvas.
