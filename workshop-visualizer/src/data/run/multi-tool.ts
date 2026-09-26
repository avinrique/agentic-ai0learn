import type { RunInfo } from '@/data/runInfo';
import { multiToolCode } from '@/data/code-snippets';

export const runInfo: RunInfo = {
  lessonId: 'multi-tool',
  fileName: 'part3/multi_tool.py',
  shownCode: multiToolCode,
  extraFiles: ['part3/study_buddy_notes.txt'],
  expect:
    'First "Tool result:" with the line it found in study_buddy_notes.txt, then StudyBuddy\'s friendly answer about LangChain.',
  tryThis: [
    'Change the question to "What is 25 + 17?" and watch it pick the add tool instead.',
    'Add your own fact as a new line in study_buddy_notes.txt, then ask about it.',
    'Ask about something that is not in the notes, like "What is Kubernetes?".',
  ],
};
