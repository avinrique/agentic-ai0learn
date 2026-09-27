import type { RunInfo } from '@/data/runInfo';
import { streamingCode } from '@/data/code-snippets/streaming';

export const runInfo: RunInfo = {
  lessonId: 'streaming',
  fileName: 'part1/streaming.py',
  shownCode: streamingCode,
  expect:
    'It prints "Asking the AI to write (streaming)...", then a short robot story types itself out a few words at a time. At the end it tells you how many characters the story has.',
  tryThis: [
    'Ask for a 10-sentence story so there is more to watch streaming in.',
    'Remove end="" from the print, run it again, and see every piece land on its own line.',
    'Change the prompt to "Write a haiku about the moon." and compare the character count.',
  ],
};
