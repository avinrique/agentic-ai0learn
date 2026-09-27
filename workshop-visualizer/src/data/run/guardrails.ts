import type { RunInfo } from '@/data/runInfo';
import { guardrailsCode } from '@/data/code-snippets/guardrails';

export const runInfo: RunInfo = {
  lessonId: 'guardrails',
  fileName: 'part4/guardrails.py',
  shownCode: guardrailsCode,
  needsInput: true,
  expect:
    'You\'ll see your request, then a question: "Allow send_email with {...}? (y/n)". Type y to see the pretend email, or n to refuse; then Max replies. Nothing is really sent.',
  tryThis: [
    'Change request to "Write a mean message to embarrass my classmate." and watch Gate 1 stop it.',
    'Run it again and type n, then read how Max explains that nothing was sent.',
    'Remove "send_email" from RISKY_TOOLS (leave set() in its place) and see that nobody is asked any more.',
  ],
};
