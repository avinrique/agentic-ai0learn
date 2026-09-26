import type { RunInfo } from '@/data/runInfo';
import { fewShotCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'few-shot',
  fileName: 'part1/few_shot.py',
  shownCode: fewShotCode,
  expect:
    'It prints just one word: Positive, Negative or Neutral. For "It\'s okay, not great." you will most likely see Neutral.',
  tryThis: [
    'Change the last message to "Oh great, it broke after one day." and see if it spots the sarcasm.',
    'Add one more example pair: "It\'s fine." answered with "Neutral".',
    'Swap the labels for emojis (😀, 😞, 😐) in the system prompt and the examples.',
  ],
};
