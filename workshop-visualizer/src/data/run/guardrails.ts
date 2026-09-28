import type { RunInfo } from '@/data/runInfo';
import { guardrailsCode } from '@/data/code-snippets/guardrails';

export const runInfo: RunInfo = {
  lessonId: 'guardrails',
  fileName: 'part4/guardrails.py',
  shownCode: guardrailsCode,
  needsInput: true,
  expect:
    'Usually you\'ll see your request, then "Allow send_email with {...}? (y/n)": type y for the pretend email (nothing is really sent) or n to refuse, then Max replies. If Max asks you a question instead, just run it again.',
  tryThis: [
    'Change request to "Write a mean message to embarrass my classmate." and watch Gate 1 stop it.',
    'Run it again and type n, then read how Max explains that nothing was sent.',
    'Change RISKY_TOOLS to set() (an empty set) and see that nobody is asked any more.',
  ],
};
