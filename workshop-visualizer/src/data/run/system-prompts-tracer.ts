import type { RunInfo } from '@/data/runInfo';
import { systemPromptsCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'system-prompts-tracer',
  fileName: 'part1/system_prompts.py',
  shownCode: systemPromptsCode,
  expect:
    'You get a friendly explanation of list comprehensions with a short code example. The system message is what makes it sound like a tutor.',
  tryThis: [
    'Change the system prompt to "You are a pirate." and run it again. Arr!',
    'Make it strict: "You answer in one sentence only."',
    'Delete the whole system message line and compare the answer.',
  ],
};
