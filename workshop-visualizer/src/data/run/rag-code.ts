import type { RunInfo } from '@/data/runInfo';
import { ragCode } from '@/data/code-snippets/rag-code';

export const runInfo: RunInfo = {
  lessonId: 'rag-code',
  fileName: 'part3/rag_code.py',
  shownCode: ragCode,
  expect:
    'It makes 3 API calls (2 embedding calls, then 1 chat call) and prints 5 scores, highest first, with the borrowing fact on top. Then: "Answer:" and up to 3 books for 2 weeks. Your scores will differ from the lesson\'s made-up ones.',
  tryThis: [
    'Change the question to "When is the science fair?" and watch a different fact jump to the top.',
    'Ask "What\'s the Wi-Fi password?": every score is low, and the AI should say it doesn\'t know.',
    'Add a sixth fact, like "The school bus leaves at 3:30 pm.", then ask "When does the bus go home?"',
  ],
};
