// Data files that course programs open (listed in a RunInfo's `extraFiles`).
// Key = path inside the course kit. If a run info lists a file that isn't here,
// building the kit fails with a clear error, so add the file's text here.

export const extraFiles: Record<string, string> = {
  // Opened by lookup() in part3/multi_tool.py and part3/study_buddy_pro.py
  // (same text as avinworkshop/part3/study_buddy_notes.txt).
  'part3/study_buddy_notes.txt': `LangChain is a framework for building applications with large language models.
RAG stands for Retrieval-Augmented Generation, a way to combine search and generation.
An LLM is a large language model trained to understand and generate text.
OpenAI Function Calling lets LLMs use external functions or APIs.
Simple interest is calculated as (Principal * Rate * Time) / 100.
Percentage represents a portion of a whole, calculated as (part / total) * 100.
`,
  // For the terminal assistant's "Show me what's in notes.txt" example.
  'part3/notes.txt': `Workshop notes:
- Agents use tools
- Always confirm risky commands
`,
};
