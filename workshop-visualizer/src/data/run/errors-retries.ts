import type { RunInfo } from '@/data/runInfo';
import { errorsRetriesCode } from '@/data/code-snippets/errors-retries';

export const runInfo: RunInfo = {
  lessonId: 'errors-retries',
  fileName: 'part1/errors_retries.py',
  shownCode: errorsRetriesCode,
  expect:
    'Usually the first try works and you just see a penguin fact. If something goes wrong, you see short, calm notes (and waits) and then a friendly message, never a red traceback.',
  tryThis: [
    'Copy your real key somewhere safe, put a wrong one in .env, run it and read the friendly message. Then put the real key back.',
    'Turn off your Wi-Fi and run it: watch it wait 1s, then 2s, then give up politely.',
    'With Wi-Fi still off, change tries=3 to tries=5 and see the waits keep doubling: 1s, 2s, 4s, 8s.',
  ],
};
