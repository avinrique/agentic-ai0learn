import type { RunInfo } from '@/data/runInfo';
import { jsonOutputCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'json-output',
  fileName: 'part1/json_output.py',
  shownCode: jsonOutputCode,
  expect:
    'You see JSON: 3 Python interview questions, each with a "question" and a "difficulty". The exact questions change every run.',
  tryThis: [
    "Change user_prompt to ask for the ingredients of pancakes, with the keys 'item' and 'amount'.",
    "Change user_prompt to ask for 3 big cities, with the keys 'city' and 'population'.",
    'Change the 3 in user_prompt to 5 to get 5 questions.',
  ],
};
