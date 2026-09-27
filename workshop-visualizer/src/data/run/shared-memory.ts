import type { RunInfo } from '@/data/runInfo';
import { sharedMemoryCode } from '@/data/code-snippets/shared-memory';

export const runInfo: RunInfo = {
  lessonId: 'shared-memory',
  fileName: 'part4/shared_memory.py',
  shownCode: sharedMemoryCode,
  expect:
    "The finished whiteboard: 4 labelled lines from the Teacher, Rita, Milo and Wally. Milo's plan uses the Teacher's numbers and Wally's invitation mixes in everyone's ideas; the wording changes every run.",
  tryThis: [
    'Change event to your own plan, like "Birthday picnic for 10 friends, budget $40".',
    'Add print(len(read_board()), "characters") before each run_agent call to watch the board grow.',
    'Add a fourth agent, Cora the critic, who reads the whole board and adds one tip with add_note.',
  ],
};
