import type { RunInfo } from '@/data/runInfo';
import { jsonOutputCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'json-output',
  fileName: 'part1/json_output.py',
  shownCode: jsonOutputCode,
  expect:
    'You see JSON: 3 Python interview questions, each with a "question" and a "difficulty". The exact questions change every run.',
  tryThis: [
    "Ask for the ingredients of pancakes, with the keys 'item' and 'amount'.",
    "Ask for 3 big cities, with the keys 'city' and 'population'.",
    'Ask for 5 questions instead of 3.',
  ],
};
