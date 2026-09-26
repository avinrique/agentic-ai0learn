import type { RunInfo } from '@/data/runInfo';
import { writerCriticCode } from '@/data/code-snippets/part4';

export const runInfo: RunInfo = {
  lessonId: 'writer-critic',
  fileName: 'part4/writer_critic.py',
  shownCode: writerCriticCode,
  expect:
    "Wally's first draft, then each round of Cora's tip and Wally's rewrite, until Cora says APPROVED or the 3 rounds run out. Every run is different!",
  tryThis: [
    "Change the task to a slogan for your school's sports day.",
    'Make Cora super strict ("Only approve slogans that rhyme perfectly") and count the rounds.',
    'Change range(1, 4) to range(1, 6) to allow up to 5 rounds.',
  ],
};
