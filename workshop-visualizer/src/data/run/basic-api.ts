import type { RunInfo } from '@/data/runInfo';
import { basicApiCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'basic-api',
  fileName: 'part1/basic_api.py',
  shownCode: basicApiCode,
  expect:
    'It prints "Sending a basic prompt to the AI...", waits a moment, then prints a funny 3-line poem about AI and pizza. Run it again and you get a brand-new poem!',
  tryThis: [
    'Change the prompt to ask for a poem about your favourite animal.',
    'Change it to ask for a 5-line poem, or a joke instead of a poem.',
    'Change the prompt to "Explain what an API is in one sentence."',
  ],
};
