import type { RunInfo } from '@/data/runInfo';
import { challengeCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'challenge',
  fileName: 'part1/challenge.py',
  shownCode: challengeCode,
  expect:
    'First the raw JSON, then the same data printed neatly: 3 South Indian restaurants in Bangalore, each with a reason. Check them before you go, because AI can make things up!',
  tryThis: [
    'Change the food and the city, for example cafes in Mumbai or street food in Delhi.',
    'Change the prompt to ask for 5 recommendations instead of 3.',
    'Add a third key, "price", to each item.',
  ],
};
