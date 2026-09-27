import type { RunInfo } from '@/data/runInfo';
import { studyBuddyProCode } from '@/data/code-snippets';
import { AB, fillIn, toolEntry } from '@/data/runnable';

// The lesson writes "parameters": {...} to keep the list short. In Python that is a set,
// which the API can't read, so the download gets the full parameter lists.
const shortTool = (name: string, description: string) =>
  `    {"type": "function", "function": {"name": "${name}", "description": "${description}", "parameters": {...}}},`;

export const runInfo: RunInfo = {
  lessonId: 'study-buddy-pro',
  fileName: 'part3/study_buddy_pro.py',
  shownCode: studyBuddyProCode,
  runnableCode: fillIn(studyBuddyProCode, [
    ['# --- Tool descriptions for the LLM ({...} = parameters shortened) ---', '# --- Tool descriptions for the LLM ---'],
    [shortTool('add', 'Add two numbers.'), toolEntry('add', 'Add two numbers.', AB)],
    [shortTool('subtract', 'Subtract b from a.'), toolEntry('subtract', 'Subtract b from a.', AB)],
    [shortTool('multiply', 'Multiply two numbers.'), toolEntry('multiply', 'Multiply two numbers.', AB)],
    [shortTool('divide', 'Divide a by b.'), toolEntry('divide', 'Divide a by b.', AB)],
    [
      shortTool('percentage', 'Calculate percentage as (part/total)*100.'),
      toolEntry('percentage', 'Calculate percentage as (part/total)*100.', [
        ['part', 'number'],
        ['total', 'number'],
      ]),
    ],
    [
      shortTool('lookup', 'Search for a concept or term in the notes file.'),
      toolEntry('lookup', 'Search for a concept or term in the notes file.', [['query', 'string']]),
    ],
  ]),
  extraFiles: ['part3/study_buddy_notes.txt'],
  expect:
    '"Tool result: 100.0" (the simple_interest tool did the maths), then StudyBuddy Pro explains the answer.',
  tryThis: [
    'Change user_query to "What percent is 45 out of 60?" to use the percentage tool.',
    'Change user_query to "What is RAG?" to use the lookup tool.',
    'Stretch: add an 8th tool, power(a, b), to the functions, the tools list and available_functions.',
  ],
};
